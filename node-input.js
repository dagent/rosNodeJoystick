#! /usr/local/bin/node

var http = require('http');
var fs = require('fs');
var util = require('util');
var optimist = require('optimist');  // npm installed module for option parsing
var ws = require("websocket");       // npm installed module for WebSockets

var meterObj = {
    "left": 7331,
    "right": 7332
}

// Defaults
serverPortNum = 8081;
tcpPortNum = 7331;
diagLoggingLevel = 1;

// Handle Arguments
var argv = optimist
    .usage('\nUsage: $0 [--port=#] [--loglevel=#] [--tcpport=%]\n\n' +
            '\tDefaults: loglevel=' + diagLoggingLevel +
            ' port=' + serverPortNum +
            ' tcpport=' + tcpPortNum)
    .argv;
var intRegex = /^\d+$/;
if ( intRegex.test(argv.port) ) {
    console.error("Option port set")
    serverPortNum = argv.port;
}
if ( intRegex.test(argv.tcpport) ) {
    console.error("Option tcpport set")
    tcpPortNum = argv.tcpport;
    meterObj.left =  tcpPortNum;
    meterObj.right =  tcpPortNum + 1;
}
if ( intRegex.test(argv.loglevel) ) {
    diagLogginLevel = argv.loglevel;
}
if (argv.help) {
    optimist.showHelp();
    process.exit();
}

// ====== HTTP Server creation
var server = http.createServer();
server.addListener('request', OnRequest);
server.addListener('connection', OnConnection);
server.addListener('close', OnClose);
server.listen(serverPortNum);
Logger_Diag(1, "Server started on port " + serverPortNum);

// ====== Websocket Server creation

var WebSocketServer = ws.server;
wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

var serverWSres = {} ;
wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      Logger_Diag(1, (new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    var connection = request.accept('meter-protocol', request.origin);
    var reqSocket = connection.socket.remoteAddress + ':' + connection.socket.remotePort ;

    Logger_Diag(1,'Websocket connection accepted from ' + reqSocket);

    serverWSres[reqSocket] = connection;

    connection.on('message', function(message) {
        var msgObj = JSON.parse(message.utf8Data);
        for ( aKey in msgObj ) {
            Logger_Diag(1, aKey + " -> " + msgObj[aKey]);
        }
        if (message.type === 'utf8') {
            Logger_Diag(2,'Received Message: ' + message.utf8Data);
            connection.sendUTF(message.utf8Data);
        }
        else if (message.type === 'binary') {
            Logger_Diag(2,'Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function(reasonCode, description) {
        delete serverWSres[reqSocket];
        Logger_Diag(1,'Websocket peer ' + reqSocket + ' disconnected.');
    });
});


// ====== TCP Server creation
var net = require('net');
var tcpServer = net.createServer();
tcpServer.on('connection',function(socket){
    var localAddress = socket.address();
    var reqSocket = socket.remoteAddress + ':' + socket.remotePort ;
    socket.write('hello there\r\n');
    Logger_Diag(1, "Incoming connection on port " + localAddress["port"]);
    // Text only for this connection
	socket.setEncoding('utf8');
    socket.on('data', function(data){
        Logger_Diag(3, 'received on :' + tcpPortNum + " " + data);
        //for ( key in serverHTTPres ) {
                //serverHTTPres[key].write('data: ' + data + '\n\n');
        //};
        for ( key in serverWSres ) {
                serverWSres[key].sendUTF(data);
        };
    });
    socket.on('close', function() {
        Logger_Diag(1, "Deleted connection on port " + localAddress["port"] +
            " from " + reqSocket);
    });

});
for ( aMeter in meterObj ) {
    tcpServer.listen(meterObj[aMeter]);
    Logger_Diag(1, "TCP server started on port " + meterObj[aMeter] + 
        " for meter " + aMeter );
}



//Logger_Diag(3, util.inspect(server.listeners('request')));
//Logger_Diag(3, util.inspect(server.listeners('connection')));
//Logger_Diag(3, util.inspect(server.listeners('close')));

//=============================== OnRequest
var serverHTTPres = {};
function OnRequest (req, res) {
	var conn = req.connection;
    var fileExt = "";
    var reqSocket = conn.remoteAddress + ':' + conn.remotePort ;

	Logger_Diag(1, 'req.url: ' + req.url);
	Logger_Diag(2, '\nRequest Rcvd ' + Date());
	Logger_Diag(3, 'HEADERS: ' + JSON.stringify(req.headers));
	Logger_Diag(3, 'FROM: ' + reqSocket );

    req.addListener('close', function() {
        Logger_Diag(1, 'Request connection closed from '
            + reqSocket );
        delete serverHTTPres[reqSocket];
        });
       
	if (req.url.indexOf('/events') === 0) {
        serverHTTPres[reqSocket] = res;

		res.writeHead(200, {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive',
			'Access-Control-Allow-Origin': '*'
		});

		res.write(':\n');

	} else {
        // Redirect default URL
		if (req.url === '/') {
			req.url = '/index.html';
		}

        // Return appropriate mime-type
        var fileName = require('url').parse(req.url).pathname;
        console.error("Filename " + fileName + " requested.");

        var mimeType = FileNameToMimeType(fileName);
		Logger_Diag(2, "Mime type: " +  strMimeType);
        //Check that file exists and output
        fs.stat(__dirname + fileName , function(err, stats) {
            // If not, send 404
            if (err) {
                console.error("Sending 404.");
                res.writeHead(404, {'Content-Type': 'text/html'});
                res.write('<html>File not found</html>\n');
            // If it does, send the file
            } else {
                console.error("Sending file " + __dirname + req.url );
                res.writeHead(200, {'Content-Type': mimeType });
                res.write(fs.readFileSync(__dirname + req.url));
            }
            res.end();
            console.error("Connection closed.");
        })
	}
}
//=============================== OnConnection
function OnConnection(socket){
	Logger_Diag(1, "A client connected to the HTTP server from "
        + socket.remoteAddress +":" + socket.remotePort);
}
//=============================== OnClose
function OnClose (){
	Logger_Diag(1, "The client closed the connection");
}

//=============================== FileNameToMimeType
function FileNameToMimeType(strFileName) {
	var fileExtRE = /^.*\.(html|js|svg|css|xml)$/;
	var fileExt = fileExtRE.exec(strFileName);
	if (fileExt) {
		fileExt = fileExt[1];
	} else {
		fileExt = "";
	}

	Logger_Diag(2, "File extension: " + fileExt);

	switch( fileExt ) {
		 case 'css':
			strMimeType = 'text/css';
			break;
		case 'xml':
			strMimeType = 'text/xml';
			break;
	   case 'html':
			strMimeType = 'text/html';
			break;
		case 'js':
			strMimeType = 'text/javascript';
			break;
		case 'svg':
			strMimeType = 'image/svg+xml';
			break;
		default:
			strMimeType = 'text/plain';
	}
}
//=============================== Logger_Diag
// Logger will become a class with method Diag()
// At least this will be easy to search and replace
function Logger_Diag (argDiagLevel, strMsg){
	// A high diagLoggingLevel means more info will be included in diagnostics
	if (argDiagLevel <= diagLoggingLevel){
		console.error(strMsg);
	}
}

