
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

var scaleJoystickXY = [1,1];
function wsJoystickSendXY(x, y) {
    //debug("got " + x + " " + y);
    if ( wsJoystickOn ) {
        x = scaleJoystickXY[0] * x;
        y = scaleJoystickXY[1] * y;
        messageJoystick.joystick = [x, y];
        wsJoystick.send(JSON.stringify(messageJoystick));
    }
}


