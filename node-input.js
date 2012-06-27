var http = require('http');
var fs = require('fs');

http.createServer(function (req, res) {
	var t = null;
	var conn = req.connection;
	console.log('\nRequest Rcvd ' + Date());
	console.log('HEADERS: ' + JSON.stringify(req.headers));
	console.log('FROM: ' + conn.remoteAddress + ':' + conn.remotePort );
	console.log('req.url: ' + req.url);

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
		if (req.url === '/') {
			req.url = '/index.html';
		}
		if (req.url === '/index.html' || req.url === '/NodeEventHandlers.js') {
			res.writeHead(200, {'Content-Type': req.url === '/index.html' ? 'text/html' : 'text/javascript'});
			res.write(fs.readFileSync(__dirname + req.url));
		}
		res.end();
	}
}).listen(8081); //! port :8081

console.log("Server started on port 8081");