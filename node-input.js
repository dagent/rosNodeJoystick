#! /usr/local/bin/node

var http = require('http');
var fs = require('fs');
var util = require('util');
var optimist = require('optimist');  // npm installed module for option parsing
var ws = require("websocket");       // npm installed module for WebSockets

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
    meterObj.setPort("left", tcpPortNum);
    meterObj.setPort("right", tcpPortNum + 1);
}
if ( intRegex.test(argv.loglevel) ) {
    diagLoggingLevel = argv.loglevel;
    console.error("loglevel set to " + argv.loglevel);
}
if (argv.help) {
    optimist.showHelp();
    process.exit();
}

// ====== HTTP Server creation
var server = http.createServer();
server.on('request', OnRequest);
server.on('connection', OnConnection);
server.on('close', OnClose);
server.listen(serverPortNum);
server.on('listening', function() {
    Logger_Diag(1, "HTTP Server started on port " + serverPortNum);
});

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

    request.on('requestAccepted', function(connection) {
        var reqSocket = connection.socket.remoteAddress + ':' + connection.socket.remotePort ;
        Logger_Diag(1,"Websocket " + reqSocket +" accepted");
    });

    request.on('error', function(e) {
        Logger_Diag(1, "Websocket error: " + e.message);
    });

    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      Logger_Diag(1, (new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    var connection = request.accept(null, request.origin);
    var reqSocket = connection.socket.remoteAddress + ':' + connection.socket.remotePort ;
    Logger_Diag(1,'Websocket attempted from ' + reqSocket);

    serverWSres[reqSocket] = {
        "connection" : connection,
        "meterName"      : ""
    };
    
    connection.on('error', function(e) {
        var reqSocket = connection.socket.remoteAddress + ':' + connection.socket.remotePort ;
        Logger_Diag(2, "Websocket error " + e.message );
    });

    connection.on('message', function(message) {
        Logger_Diag(1,"Websocket incoming message received");
        var msgObj = JSON.parse(message.utf8Data);
        for ( aKey in msgObj ) {
            Logger_Diag(1,aKey + " -> " + msgObj[aKey]);
        }
        switch(msgObj["meter"]) {
            case "left":
                serverWSres[reqSocket]["meterName"] = "left";
                Logger_Diag(1,"Websocket added meter left");
                break;
            case "right":
                serverWSres[reqSocket]["meterName"] = "right";
                Logger_Diag(1,"Websocket added meter right");
                break;
            default:
                Logger_Diag(1,"No meter name added!");
        }

        //if (message.type === 'utf8') {
            //Logger_Diag(2,'Received Message: ' + message.utf8Data);
            //connection.sendUTF(message.utf8Data);
        //}
        //else if (message.type === 'binary') {
            //Logger_Diag(2,'Received Binary Message of ' + message.binaryData.length + ' bytes');
            //connection.sendBytes(message.binaryData);
        //}
    });
    connection.on('close', function(reasonCode, description) {
        delete serverWSres[reqSocket];
        Logger_Diag(1,'Websocket peer ' + reqSocket + ' disconnected.');
    });
});


// ====== TCP Server creation

var net = require('net');

var tcpOnConnection = function(socket, myMeter){

    var localAddress = socket.address();
    var localPort = localAddress["port"];
    
    var reqSocket = socket.remoteAddress + ':' + socket.remotePort ;
    var myMeterName = myMeter.name;

    socket.write('hello there ' + reqSocket + ' ; you are connected to meter ' +
                    myMeterName + '!\r\n');

    Logger_Diag(1, "tcpServer incoming connection on port " + localPort +
                                                " for meter " + myMeterName);

    // Text only for this connection
	socket.setEncoding('utf8');
    socket.on('data', function(data){
        Logger_Diag(4, 'tcpServer received on :' + localPort + " " + data);
        for ( key in serverHTTPres ) {
                serverHTTPres[key].write('data: ' + data + '\n\n');
        };
        for ( key in serverWSres ) {
                Logger_Diag(3,"tcpServer: meter name " + serverWSres[key]["meterName"]);
                if (serverWSres[key]["meterName"] === myMeterName) {
                    var outMsg = { "meter": myMeterName, "height": data};
                    serverWSres[key]["connection"].sendUTF(JSON.stringify(outMsg));
                    Logger_Diag(3,"Sent data "+ JSON.stringify(outMsg) + " to meter " + myMeterName);
                }
        };
    });
    socket.on('close', function() {
        Logger_Diag(1, "tcpServer connection on port " + localAddress["port"] +
            " from " + reqSocket + " closed.");
    });
};

var meterObj = require('./node-meter.js')["meters"];
for ( aMeter in meterObj.meters ) {

    var startTCP = function(arrMeter) {

        var myMeter = arrMeter;
        var meterName = myMeter.name;
        var meterPort = myMeter.port;

        myMeter.tcpServer = net.createServer();

        myMeter.tcpServer.on('connection', function(socket) {
            tcpOnConnection(socket, myMeter);
        });

        myMeter.tcpServer.on('error', function(e){
            Logger_Diag(1,"tcpServer port " + meterPort + " error: " + e.text);
        });

        myMeter.tcpServer.on('listening', function(){
            Logger_Diag(1, "TCP server started on port " + meterPort + 
                    " for meter " + meterName );
        });
        myMeter.tcpServer.listen(meterPort);

    }(meterObj.meters[aMeter]);
}

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
        Logger_Diag(1, 'HTTP server request connection closed from '
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
        Logger_Diag(2, "Filename " + fileName + " requested.");

        var mimeType = FileNameToMimeType(fileName);
		Logger_Diag(2, "Mime type: " +  strMimeType);
        //Check that file exists and output
        fs.stat(__dirname + fileName , function(err, stats) {
            // If not, send 404
            if (err) {
                Logger_Diag(2,"Sending 404.");
                res.writeHead(404, {'Content-Type': 'text/html'});
                res.write('<html>File not found</html>\n');
            // If it does, send the file
            } else {
                Logger_Diag(2,"Sending file " + __dirname + req.url );
                res.writeHead(200, {'Content-Type': mimeType });
                res.write(fs.readFileSync(__dirname + req.url));
            }
            res.end();
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
	Logger_Diag(1, "The client closed the HTTP connection");
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

	Logger_Diag(3, "File extension: " + fileExt);

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

