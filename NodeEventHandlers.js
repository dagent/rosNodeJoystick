var es = {};

function createES(aMeter) {
    var myMeter = aMeter,

        url = 'ws://localhost:8081',

        outMessage = {
            "meter": myMeter
        },

        inMessage = {};

    debug("Sending request for meter " + myMeter);

    es[myMeter] = new WebSocket(url, "echo-protocol");

	es[myMeter].addEventListener('open', function (event) {
        // Horrible hack for left meter
        if (myMeter === "left" ) {
            var div = document.getElementById("error");
            div.innerHTML = 'opened ' + es[myMeter].url +
                ' <button onclick="destroyES(\'left\')">Close</button>';
        }
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
                mask.height.baseVal.value = inMessage.height;
                tvalue.textContent = inMessage.height;
                break;
            case "right":
                var blah = document.getElementById("svg-container");
                var svgObj = gApp.svg.GetSVGObject("TheOtherLightBar");
                svgObj.setValue(inMessage.height);
                break;
        }
	}, false);

	es[myMeter].addEventListener('error', function (event) {
		var div = document.getElementById("error");
		div.innerHTML = 'closed by server <button onclick="createES(\'left\')">Attempt Reconnect</button>';
	}, false);
}

function destroyES(aMeter) {
	es[aMeter].close();
    delete es[aMeter];
	var div = document.getElementById("error");
	div.innerHTML = "closed <button onclick='createES(\"left\")'>Connect</button>";
	mask.height.baseVal.value = 280;
	tvalue.textContent = 280;
}

/* Randomize the maskHeight from 0-280 */
function changeHeight() {
    rand = Math.floor((Math.random()*280)+1);
	mask.height.baseVal.value = rand;
	tvalue.textContent = rand;
}

function startIt()  {
 interv = setInterval("changeHeight()",500);
}

function stopIt() {
    clearInterval(interv);
	mask.height.baseVal.value = 280;
	tvalue.textContent = 280;
}
