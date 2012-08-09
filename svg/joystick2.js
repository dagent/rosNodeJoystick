
// Support functions for joystick2.svg
//  * Author: David A. Gent
//  * v1.0 complete 8 August 2012


// svgDoc can be used in internal javascript functions
var svgns = "http://www.w3.org/2000/svg";
var svgDoc;
var interactive_element;
var textXY;
var offset; 
var stickElement;
var interactive = false;
var mouse_x, mouse_y;
var updateTimer;

function startup(evt){
    svgDoc=evt.target.ownerDocument;
    // Use below to export an svg function to an outside
    // (webpage/html) name where it can be called
    //parent.outsideCaller = oFunction;
    //parent.svgMeters.updatefunc.push(updateMeter);
    textXY = svgDoc.getElementById("textXY");
    textXY.textContent = "WHY!!!!";
    interactive_element = svgDoc.getElementById("Background1");
    offset = getCenterOffset(interactive_element);
    stickElement = svgDoc.getElementById("Stick1");
}

// This function can be seen from html
//function oFunction() {}

//This function could call an outside function and pass foo
// function callOutside(foo) {top.outsideFunction(foo) }
function parentXY(x,y) {top.wsJoystickSendXY(x,y)}

function setMouseXY(evt) {
    mouse_x =  (evt.clientX - offset.x) * offset.scale;
    mouse_y =  (evt.clientY - offset.y) * offset.scale;
}

// Callback function to move stick from mouse event
function moveStick(evt) {
    if ( !interactive ) {return}
    setMouseXY(evt);
    updateAll();
}

function toggleInteractive(evt) {
    interactive=(interactive)?false:true;
    if ( ! interactive ) {
        clearInterval(updateTimer);
        mouse_x = 0.0;
        mouse_y = 0.0;
        updateAll();
    } else {
        moveStick(evt);
        updateTimer = setInterval(function(){updateAll()},1000);
    }
}

function updateAll() {
    stickElement.setAttributeNS(null, 'cx', ''+mouse_x);
    stickElement.setAttributeNS(null, 'cy', ''+mouse_y);
    textXY.textContent = "X: " + mouse_x + " Y: " + mouse_y ;
    parentXY(mouse_x, mouse_y);
}



