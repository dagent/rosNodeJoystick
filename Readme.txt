
This is all about getting real-time data displayed on a web-page.  We deeply
learn the joys of SVG, Javascript, node.js, Websockets, json.

*****   Installation requirements:

node.js (http://nodejs.org/)

node modules (installed via npm):
    * optimist (https://github.com/substack/node-optimist)
    * websocket (https://github.com/Worlize/WebSocket-Node)
After installing node, should be able to install the modules by
    npm -g install optimist websocket

HTML5 client which can do websocket and SVG.  See compatibility stuff at
http://caniuse.com/ -- Firefox v14 used for much of this development.

*****   Files etc

node-input.js -- a node.js script which provides
    * Basic web server (default port 8081)
    * Websocket server for live meters (via above webserver)
    * TCP socket ingestor (port 7331 "left" & 7332 "right" )

    - The Websocket esentially forwards data from the TCP sockets.  This is
      handled when the client initiates the connection and requests (via json)
      a data type (meter left or right), followed by the websocket streaming
      (via json) data from the corresponding TCP socket.

node-meter.js -- "meter" object for node.js

index.html -- Webpage for display and control.  Uses several subdirs:
    * css/
    * jsext/ for javascript
    * svg/ for meters, dials, control strips

util/ -- some scripts for testing, launching, data feeds

    - To put in audio level from a pulse audio source:
        ./pa | ./vu -n 100 | nc localhost 7331

    - To do a random number at 100ms:
        ./rand 100 .1 | nc localhost 7332


