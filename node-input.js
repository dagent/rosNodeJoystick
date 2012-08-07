#! /usr/local/bin/node

/* Node.js implementation to input data on 2 listening tcp ports and output to 2 websockets.  Websockets coexist
 * with the HTTP server.  Multiple tcp sockets supported.  The websockets listen for a data message from the
 * client before serving the appropriate data from a tcp port.
 */

var http = require('http');
var fs = require('fs');
var util = require('util');
var optimist = require('optimist');  // npm installed module for option parsing
var ws = require("websocket");       // npm installed module for WebSockets
var meterObj = require('./node-meter.js')["meters"];

// Defaults
var httpServerPortNum = 8081;
var tcpPortNum = 7331; // Starting port for listeners
var diagLoggingLevel = 1;

// Handle Arguments
var argv = optimist
    .usage('\nUsage: $0 [--port=#] [--loglevel=#] [--tcpport=%]\n\n' +
            '\tDefaults: loglevel=' + diagLoggingLevel +
            ' port=' + httpServerPortNum +
            ' tcpport=' + tcpPortNum)
    .argv;
var intRegex = /^\d+$/;
if ( intRegex.test(argv.port) ) {
    console.error("Option port set")
    httpServerPortNum = argv.port;
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
var httpServer = http.createServer();
httpServer.on('request', OnRequest);
httpServer.on('connection', OnConnection);
httpServer.on('close', OnClose);
httpServer.listen(httpServerPortNum);
httpServer.on('listening', function() {
    Logger_Diag(1, "HTTP Server started on port " + httpServerPortNum);
});
// === HTTP Server listening functions at the end

// ====== Websocket Server creation
var WebSocketServer = ws.server;
wsServer = new WebSocketServer({
    httpServer: httpServer,
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
wsServer.on('request', function(request) {
    WsServerOnRequest(request); 
});
// === Websocket listening functions at the end

// ====== TCP Server creation

var net = require('net');

// Startup the TCP servers based on the meter object
for ( aMeter in meterObj.meter ) {

    var startTCP = function(arrMeter) {

        var myMeter = arrMeter;
        var meterName = myMeter.name;
        var meterPort = myMeter.portIn;

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

    }(meterObj.meter[aMeter]);
}

// ===== ROS turtlesim external command piping

var spawn = require('child_process').spawn;
var procPath = './ros/turtle_stdin.py';
// Some code here modified (heavily) from
// https://github.com/Marak/say.js/blob/master/lib/say.js
function spawnChild (path, args) { 
    function myLog (where, text) {
        Logger_Diag(1,"Spawned child " + path + 
            " says: " + text + " on " + where );
    }
    var childD = spawn(path, args);
    childD.addListener('exit', function (code, signal) {
        if(code == null || signal != null) {
            myLog("Exit status", 'couldnt talk, had an error ' +
                '[code: '+ code + '] ' + '[signal: ' + signal + ']');
        }
    })
    if (childD.pid){
        Logger_Diag(1,"Launched " + path + " with PID " + childD.pid );
    }
    childD.stdin.setEncoding('ascii');
    childD.stderr.setEncoding('ascii');
    childD.stdout.on('data', function(data){
        myLog('stdout', data);
    })
    childD.stderr.on('data', function(data){
        myLog('stderr', data);
    })
    return childD;
}
var driveTurtle = spawnChild(procPath, "");


// ===== HTTP functions
//=============================== OnRequest
var serverHTTPres = {};
function OnRequest (req, res) {
	var conn = req.connection;
    var fileExt = "";
    var socketStr = conn.remoteAddress + ':' + conn.remotePort ;

	Logger_Diag(2, 'req.url: ' + req.url);
	Logger_Diag(2, '\nRequest Rcvd ' + Date());
	Logger_Diag(3, 'HEADERS: ' + JSON.stringify(req.headers));
	Logger_Diag(3, 'FROM: ' + socketStr );

    req.addListener('close', function() {
        Logger_Diag(1, 'HTTP server request connection closed from '
            + socketStr );
        delete serverHTTPres[socketStr];
        });
       
	if (req.url.indexOf('/events') === 0) {
        serverHTTPres[socketStr] = res;

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

//================ WsServerOnRequest 
var WsServerOnRequest = function(request) {

    // The meterObj.meter[] hash for what this request instance will connect to.  See the message listener.
    var myMeter = "" ;

    request.on('requestAccepted', function(connection) {
        var socketStr = connection.socket.remoteAddress + ':' + connection.socket.remotePort ;
        Logger_Diag(1,"Websocket " + socketStr +" accepted");
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

    try {
        var connection = request.accept(null, request.origin);
    } catch(e) {
        Logger_Diag(1, "Websocket request not accepted");
    }
    var socketStr = connection.socket.remoteAddress + ':' + connection.socket.remotePort ;
    Logger_Diag(2,'Websocket attempted from ' + socketStr);

    connection.on('error', function(e) {
        Logger_Diag(2, "Websocket error " + e.message );
    });

    // Don't actually do anything until we get a valid message from the client, then we add this socket to the
    // meter object or handoff to a joystick

    connection.on('message', function(message) {
        Logger_Diag(3,"Websocket incoming message received");
        // We are expecting { "meter" : name } or {joystick: }
        try { 
            var msgObj = JSON.parse(message.utf8Data);
        } catch(e) {
            Logger_Diag(1, "Error Parsing JSON; closing connection");
            connection.close;
        }
        for ( aKey in msgObj ) {
            Logger_Diag(3,aKey + " -> " + msgObj[aKey]);
        }
        // Deal with a joystick
        if (msgObj["joystick"]){
            Logger_Diag(3, "Got a joystick message");
            handleJoystick(msgObj["joystick"]);
           return; 
        }
        if ( msgObj["meter"] === undefined ) {
            Logger_Diag(1, "Unknown message type -- closing connection");
            connection.close;
            return;
        }
        // Set myMeter by the name the client sent us
        try {
            myMeter = meterObj.getMeter(msgObj["meter"]);
        } catch(e) {
            Logger_Diag(1, "Error matching meter name; closing connection");
            connection.close;
        }

        // Add this connection to myMeter output sockets
        myMeter.output[socketStr] = connection;
        connection.on('close', function(reasonCode, description) {
            delete myMeter.output[socketStr];
            Logger_Diag(1,'Websocket peer ' + socketStr + ' disconnected.');
        });
    });

};

var handleJoystick = function(arrayXY){
    if ( driveTurtle.stdin.writable ) {
        // expecting arrayXY [x,y]
        try{
            driveTurtle.stdin.write(arrayXY[0] + " " + arrayXY[1] + "\n");
        }
        catch(err){
            Logger_Diag(3,'handleJoystick: driveTurtle array write error');
        }
    } else {
        Logger_Diag(3,'handleJoystick: driveTurtle not writable');
    }
}

// ================== tcpOnConnection
var tcpOnConnection = function(socket, myMeter){

    var localAddress = socket.address();
    var localPort = localAddress["port"];
    
    var socketStr = socket.remoteAddress + ':' + socket.remotePort ;
    var myMeterName = myMeter.name;

	socket.setEncoding('utf8');
    socket.write('hello there ' + socketStr + ' ; you are connected to meter ' +
                    myMeterName + '!\r\n');

    Logger_Diag(1, "tcpServer incoming connection on port " + localPort +
                                                " for meter " + myMeterName);
    myMeter.input[socketStr] = socket;

    socket.on('data', function(data){
        Logger_Diag(4, 'tcpServer received on :' + localPort + " " + data);
        var outMsg = { "meter": myMeterName, "height": data};
        var outMsgJSON = JSON.stringify(outMsg);

        // Loop through available outputs and spit out data from this socket instance.  This seems to be the
        // only real way to do this.

        // this is for the http:/events EventServer
        for ( key in serverHTTPres ) {
                serverHTTPres[key].write('data: ' + data + '\n\n');
        };
        //this is for the Websockets
        for ( socketKey in myMeter.output  ) {
                myMeter.output[socketKey].sendUTF(outMsgJSON);
                Logger_Diag(3,"Sent data "+ outMsgJSON + " to meter " + myMeterName);
        };
    });

    socket.on('close', function() {
        Logger_Diag(1, "tcpServer connection on port " + localAddress["port"] +
            " from " + socketStr + " closed.");
            delete myMeter.input[socketStr];
    });
};
