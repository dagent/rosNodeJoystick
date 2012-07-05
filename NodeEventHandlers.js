var es;

function createES() {
	es = new EventSource('events');

	es.addEventListener('open', function (event) {
		var div = document.getElementById("error");
		div.innerHTML = 'opened ' + es.url +
            ' <button onclick="destroyES()">Close</button>';
	}, false);

	es.addEventListener('message', function (event) {
	    mask.height.baseVal.value = event.data;
		tvalue.textContent = event.data;
		var blah = document.getElementById("svg-container");
		var svgObj = gApp.svg.GetSVGObject("TheOtherLightBar");
		svgObj.setValue(event.data);
	}, false);

	es.addEventListener('error', function (event) {
		var div = document.getElementById("error");
		div.innerHTML = 'closed by server <button onclick="createES()">Attempt Reconnect</button>';
	}, false);
}

function destroyES() {
	es.close();
	var div = document.getElementById("error");
	div.innerHTML = 'closed <button onclick="createES()">Connect</button>';
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
