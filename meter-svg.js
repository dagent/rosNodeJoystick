// Scripts to handle meter.svg and easily expose the SVG DOM

// Shamelessly cribbed then generalized from
// http://srufaculty.sru.edu/david.dailey/svg/intro/PartF_C.html

var mask;
var tvalue;

function svgElement(embedId, elemId){
    var S=document.getElementById(embedId);
    var SD=S.getSVGDocument();
    var eSD = SD.getElementById(elemId);
    return eSD;
}


