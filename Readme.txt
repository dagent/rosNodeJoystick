
This project is aimed at getting real-time controls and data display in a
web-browser.  It contains some advanced use examples of SVG, JavaScript,
Node.js, Websockets, json, ROS, and Python.

*****   Installation requirements:

node.js (http://nodejs.org/)

node modules (installed via npm):
    * optimist (https://github.com/substack/node-optimist)
    * websocket (https://github.com/Worlize/WebSocket-Node)
After installing node, should be able to install the modules by
    npm -g install optimist websocket

HTML5 client which can do websocket and SVG.  See compatibility stuff at
http://caniuse.com/ -- Firefox v14 used for much of this development.

ROS (http://www.ros.org/wiki/) -- and being able to run the turtlesim:
    rosrun turtlesim turtlesim_node

*****   Files etc

node-input.js -- a node.js script which provides
    * Basic web server (default port 8081)
    * Websocket server for live meters (via above webserver)
    * TCP socket ingestor (port 7331 "left" & 7332 "right" )

    - The Websocket esentially forwards data from the TCP sockets.  This is
      handled when the client initiates the connection and requests (via json)
      a data type (meter left or right), followed by the websocket streaming
      (via json) data from the corresponding TCP socket.  It also collects 
      control input from the client and routes to a ROS publisher.

    * jsnode/ contains sub service modules

index.html -- Webpage for display and control.  Uses several subdirs:
    * css/
    * jsext/ for javascript
    * svg/ for meters, dials, control strips
    * does not need ROS

joystick.html -- drive the ROS turtlesim!

ros/ -- contains scripts called by node-input.js to control the ROS turtle

util/ -- some scripts for testing, launching, data feeds

    - To put in audio level from a pulse audio source:
        ./pa | ./vu -n 100 | nc localhost 7331

    - To do a random number at 100ms:
        ./rand 100 .1 | nc localhost 7332


----------------
Author: David A. Gent  (davidgent@notsourgent.com)
Date: 8 August 2012

