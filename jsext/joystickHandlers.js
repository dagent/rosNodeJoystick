
/* Function/variables to create a WebSocket for the joystick to pass
 * values to Node.js
 * Author: David A. Gent
 * v1.0 complete 8 August 2012
 */

debug("in joystickHandlers");
var wsJoystick;
var wsJoystickOn = false;

var messageJoystick = {
        "joystick": [0,0],
    };

function createWSjoystick() {

    var url = 'ws://' + document.location.host ;

    debug("Sending request for joystick to " + url);

    wsJoystick = new WebSocket(url, "echo-protocol");

	wsJoystick.addEventListener('open', function (event) {
        outMsg = JSON.stringify(messageJoystick);
        wsJoystick.send(outMsg);
        debug("JSON string sending: " + outMsg);
        wsJoystickOn = true;
	}, false);

	wsJoystick.addEventListener('error', function (event) {
		debug('Websocket closed by server');
        wsJoystickOn = false;
        }, false);
}

function destroyWSjoystick() {
	wsJoystick.close();
    delete wsJoystick;
}

var scaleJoystickXY = [-0.01,-0.01];
function wsJoystickSendXY(angular, linear) {
    //debug("got " + x + " " + y);
    if ( wsJoystickOn ) {
        linear = scaleJoystickXY[1] * linear;
        angular = scaleJoystickXY[0] * angular;
        messageJoystick.joystick = [linear, angular];
        wsJoystick.send(JSON.stringify(messageJoystick));
    }
    try{
        updateMetersVal(linear, "left");
        updateMetersVal(angular, "right");
    }
    catch(err) {
    }
}

function resetTurtle() {
    var resetMsg = {"reset" : "turtlesim"};
    wsJoystick.send(JSON.stringify(resetMsg));
    info("Sent resetMsg: " + resetMsg);
}

