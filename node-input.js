var http = require('http');
var fs = require('fs');
var util = require('util');

serverPortNum = 8081;
diagLoggingLevel = 1;

var server = http.createServer();
server.addListener('request', OnRequest);
server.addListener('connection', OnConnection);
server.addListener('close', OnClose);
server.listen(serverPortNum);
Logger_Diag(1, "Server started on port " + serverPortNum);

//Logger_Diag(3, util.inspect(server.listeners('request')));
//Logger_Diag(3, util.inspect(server.listeners('connection')));
//Logger_Diag(3, util.inspect(server.listeners('close')));

//=============================== OnRequest
function OnRequest (req, res) {
	var conn = req.connection;
    var fileExt = "";

	Logger_Diag(1, 'req.url: ' + req.url);
	Logger_Diag(2, '\nRequest Rcvd ' + Date());
	Logger_Diag(3, 'HEADERS: ' + JSON.stringify(req.headers));
	Logger_Diag(3, 'FROM: ' + conn.remoteAddress + ':' + conn.remotePort );

    req.addListener('close', function() {
        Logger_Diag(1, 'Request connection closed from '
            + conn.remoteAddress + ':' + conn.remotePort );
        });
       
	if (req.url.indexOf('/events') === 0) {
		res.writeHead(200, {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive',
			'Access-Control-Allow-Origin': '*'
		});

		res.write(':\n');
		process.stdin.resume();
		process.stdin.setEncoding('utf8');
		process.stdin.on('data', function (chunk) {
			res.write('data: ' + chunk + '\n\n');
		});
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
	Logger_Diag(1, "A client connected from " + socket.remoteAddress +":" + socket.remotePort);
}
//=============================== OnClose
function OnClose (){
	Logger_Diag(1, "The client closed the connection");
}

//=============================== FileNameToMimeType
function FileNameToMimeType(strFileName) {
	var fileExtRE = /^.*\.(html|js|svg|css|xml)$/;
	var fileExt = fileExtRE.exec(strFileName);
	//console.error("file extension length: " + fileExt.length);
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

