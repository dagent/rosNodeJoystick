
Pretty pictures at http://dagent.github.com/rosNodeJoystick/

This project is aimed at getting real-time controls and data display in a
web-browser.  It contains some advanced use examples of SVG, JavaScript,
Node.js, WebSockets, and ROS, with some Python, and Bash thrown in.

*****   Installation requirements:

Node.js (http://nodejs.org/)

Node.js modules (installed via npm):
    * optimist (https://github.com/substack/node-optimist)
    * websocket (https://github.com/Worlize/WebSocket-Node)
After installing node, one should be able to install the above modules by
    npm install optimist websocket

An HTML5 client which can do websocket and SVG.  See compatibility stuff at
http://caniuse.com/ -- Firefox v14 used for much of this development.

ROS (http://www.ros.org/wiki/) -- and being able to run the turtlesim:
    roscore
    rosrun turtlesim turtlesim_node

*****   Execution (default)

1) Launch ros_core and turtle_sim 
2) Launch RunNode.js
3) Point web-vrowser to http://127.0.0.1:8081/joystick.html

*****   Files etc

RunNode.js -- a Node.js script which provides
    * Basic web server (default port 8081)
    * WebSocket server for live meters (via above web-server)
    * TCP socket ingestor (port 7331 "left" & 7332 "right" )

    - The Websocket esentially forwards data from the TCP sockets to the
      meters.  This is handled when the client initiates the connection and
      requests (via json) a data type (meter: left or right), followed by the
      websocket streaming (via json) data from the corresponding TCP socket.
      It also collects control input from the client and routes to a ROS
      publisher.

    * jsnode/ contains sub service modules

index.html -- Webpage for display and control of meters.  Uses several subdirs:
    * css/
    * jsext/ for javascript
    * svg/ for meters, dials, control strips
    * does not need ROS

joystick.html -- drive the ROS turtlesim!

ros/ -- Contains scripts to control the ROS turtle.  These are called
        as a child process by RunNode.js which streams Velocity messages 
        via stdin.

util/ -- Some scripts for testing, launching, data feeds

    - To put in audio level to a meter from a pulse audio source:
        ./pa | ./vu -n 100 | nc localhost 7331

    - To do a random number at 100ms to a meter:
        ./rand 100 .1 | nc localhost 7332

*****   Contribs

fvlogger, for JS debugging/logging, from
    http://www.alistapart.com/articles/jslogging/

SVG -- learned and adapted code from:
    http://srufaculty.sru.edu/david.dailey/svg/

*****   To Do for joystick.html!

- Subscribe to Pose topic and display with meters.

- Make the joystick keyboard interactive with cursor keys.

- You can launch multiple controls over mutiple web pages -- this is good, but
  controls should update each other, even if that means a controller fight!
  Node.js may need some serious authorization logic.

- Launch additional turtles.  Would require logic for individual web page per
  turtle or a selection mechanism.

----------------
Author: David A. Gent  (davidgent@notsourgent.com)
Date: 10 August 2012

