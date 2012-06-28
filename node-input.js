var http = require('http');
var fs = require('fs');

http.createServer(function (req, res) {
	var conn = req.connection;
    var fileExt = "";

	console.error('\nRequest Rcvd ' + Date());
	console.error('HEADERS: ' + JSON.stringify(req.headers));
	console.error('FROM: ' + conn.remoteAddress + ':' + conn.remotePort );
	console.error('req.url: ' + req.url);

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
        var mimeType = function (fstring) {
            var fileExtRE = /^.*\.(html|js|svg).*$/;
            var fileExt = fileExtRE.exec(fileName); 
            //console.error("file extension length: " + fileExt.length);
            if (fileExt) {
                fileExt = fileExt[1];
            } else {
                fileExt = "";
            }
            console.error("File extension: " + fileExt);
            switch( fileExt ) {
                case 'html':
                    console.error("Mime type: text/html");
                    return 'text/html';
                    break;
                case 'js':
                    console.error("Mime type: text/javascript");
                    return 'text/javascript';
                    break;
                case 'svg':
                    console.error("Mime type: image/svg+xml");
                    return 'image/svg+xml';
                    break;
                default:
                    console.error("Mime type: text/plain");
                    return 'text/plain';
            }
        }(fileName);

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
}).listen(8081); //! port :8081

console.error("Server started on port 8081");
