var es;

function createES() {
	es = new EventSource('events');

	es.addEventListener('open', function (event) {
		var div = document.getElementById("error");
		div.innerHTML = 'opened ' + es.url +
            ' <button onclick="destroyES()">Close</button>';
	}, false);

	es.addEventListener('message', function (event) {
		document.getElementById("mask").height.baseVal.value = event.data;
		document.getElementById("tvalue").textContent = event.data;
	}, false);

	es.addEventListener('error', function (event) {
		var div = document.getElementById("error");
		div.innerHTML = 'closed by server <button onclick="createES()">Attempt Reconnect</button> Err message: ' + error.msg;
        console.log("Duh2!!");
	}, false);
}

function destroyES() {
	es.close();
    console.log("Duh!");
	var div = document.getElementById("error");
	div.innerHTML = 'closed <button onclick="createES()">Connect</button>';
	document.getElementById("mask").height.baseVal.value = 280;
	document.getElementById("tvalue").textContent = 280;
}

/* Randomize the maskHeight from 0-280 */
function changeHeight() {
    rand = Math.floor((Math.random()*280)+1);
    document.getElementById("mask").height.baseVal.value = rand;
    document.getElementById("tvalue").textContent = rand;
}

function startIt()  {
interv = setInterval("changeHeight()",500);
}

function stopIt() {
    clearInterval(interv);
    document.getElementById("mask").height.baseVal.value = 280;
    document.getElementById("tvalue").textContent = 280;
}
