var es;

function createES(aMeter) {
	//es = new EventSource('events');
    url = "ws://localhost:8081";
    
    var outMessage = {
        "meter": aMeter
    };
    var inMessage = {};

    error("Sending request for meter " + aMeter);

    es = new WebSocket(url, "meter-protocol");

	es.addEventListener('open', function (event) {
		var div = document.getElementById("error");
		div.innerHTML = 'opened ' + es.url +
            ' <button onclick="destroyES()">Close</button>';
        es.send(JSON.stringify(outMessage));
	}, false);

	es.addEventListener('message', function (event) {
        inMessage = JSON.parse(event.data);
        if ( isNaN(inMessage.height) ) {
            return;
        }
        switch(inMessage.meter) {
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

	es.addEventListener('error', function (event) {
		var div = document.getElementById("error");
		div.innerHTML = 'closed by server <button onclick="createES()">Attempt Reconnect</button>';
	}, false);
}

function destroyES() {
	es.close();
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
