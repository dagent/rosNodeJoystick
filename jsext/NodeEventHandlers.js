
debug("in NodeEventHandlers");
var es = {};
var divESstate = {};

function createES(aMeter) {
    var myMeter = aMeter;

    var url = 'ws://' + document.location.host ;

    var outMessage = {
            "meter": myMeter
        },

        inMessage = {};

    debug("Sending request for meter " + myMeter + " at " + url);

    es[myMeter] = new WebSocket(url, "echo-protocol");


	es[myMeter].addEventListener('open', function (event) {
		divESstate[myMeter].innerHTML = 'Websocket open' ;
        var outMsg = JSON.stringify(outMessage);
        es[myMeter].send(outMsg);
        debug("JSON string sending: " + outMsg);
	}, false);

	es[myMeter].addEventListener('message', function (event) {
        inMessage = JSON.parse(event.data);
        if ( isNaN(inMessage.height) ) {
            return;
        }
        switch (inMessage.meter) {
            case "left":
                updateMetersVal(inMessage.height, "left");
                break;
            case "right":
                updateMetersVal(inMessage.height, "right");
                break;
        }
	}, false);

	es[myMeter].addEventListener('error', function (event) {
		divESstate[myMeter].innerHTML = 'Websocket closed by server' ;


        }, false);
}

function destroyES(aMeter) {
	es[aMeter].close();
    delete es[aMeter];
	divESstate[aMeter].innerHTML = "closed <button onclick='createES(\"" + aMeter + "\")>Connect</button>";
    updateMetersVal(280) 
}

/* Randomize the maskHeight from 0-280 */
function changeHeight() {
    rand = Math.floor((Math.random()*280)+1);
    updateMetersVal(rand) 
}

var interv;
function startIt()  {
 interv = setInterval("changeHeight()",500);
}

function stopIt() {
    clearInterval(interv);
    updateMetersVal(controlValue) 
}

