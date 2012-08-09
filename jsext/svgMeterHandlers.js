/* Functions/variables to handle dynamically loading meters.svg, and
 * calls to control.svg
 * Author: David A. Gent
 * v1.0 complete 8 August 2012
 */
    

//var meterURL = "meter.svg"
//var controlURL = "control.svg"

var svgMeters = {
    "numMeters" : 0,
    // "meter" has objects {divId : { svgDoc, index, type } } , where index
    // hopefully points to the updatefunc array index.
    "meter" : {},
    // each meter.svg registers it's internal updateMeter function here
    // -- this happens when it loads and the SVG is looking for a
    // predefined variable/method
    "updatefunc" : [],
};
var controlValue = 280; // Initial, gets updated

// Dynamically loads an SVG into the "svgGroup" div
function loadSVG(divId, url, onload) {
    var svgDiv = document.getElementById("svgGroup");
    var D = document.createElement("DIV");
    D.setAttribute("id", divId);
    D.setAttribute("style", "float: left; height: 350px;");

    var E = document.createElement("EMBED");
    var embId = divId + "embed";
    E.setAttribute("src", url);
    E.setAttribute("id", embId);
    E.setAttribute("onload", onload);

    svgDiv.appendChild(D);
    D.appendChild(E);
}

// Associate the containing div id with the SVG document
function registerSVG(divId) {
    if ( ! svgMeters.meter[divId] ) {
        svgMeters.meter[divId] = {};
    }
    var embed = document.getElementById(divId + "embed");
    var svgDoc = embed.getSVGDocument();
    svgMeters.meter[divId]["svgDoc"] = svgDoc;
}

// control.svg calls this with its clicked value, then we update the meters;
function receiveControlVal(newMeterVal) {
    updateMetersVal(newMeterVal);
    controlValue = newMeterVal;
}
// Updates all meters with a new value (depending on possible type)
function updateMetersVal(val,type) {
    if (type) {
        for (divId in svgMeters.meter) {
            var meter = svgMeters.meter[divId];
            if (meter.type == type ) {
                svgMeters.updatefunc[meter.index](val);
            }
        }
    } else {
        for ( i in svgMeters.updatefunc ) {
            svgMeters.updatefunc[i](val);
        }
    }
}

// Add a new meter with a distinct div id, register it's svgDoc, and update it's values to the most recent
// control value.
function addMeter(type) {
    var divId = "meter" + svgMeters.numMeters;
    svgMeters.meter[divId] = {"index" : svgMeters.numMeters};
    svgMeters.numMeters += 1;
    var register = svgMeters.meter[divId];
    loadSVG(divId, meterURL, "registerSVG('" + divId + "'); receiveControlVal(controlValue); " );
    if ( type ){
        svgMeters.meter[divId]["type"] =  type;
        var div = document.getElementById(divId);
        var p = document.createElement("P");
        p.innerHTML = "Type = " + type;
        p.setAttribute("style", "font-size:12px; font-style: italic;");
        div.appendChild(p) ;
    }
}
