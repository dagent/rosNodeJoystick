var isGripped=false
var grabY   // mousedown coordinate
var monitor // text reading 0-100
var y       // the slider's dynamic coordinate
var T_PI=2*Math.PI;

//============================================ init()
function init(evt){
	 var svgns = "http://www.w3.org/2000/svg";
	 SVGDocument = evt.target.ownerDocument;
	   
	 monitor= SVGDocument.getElementById('monitor');
	 handle=SVGDocument.getElementById('handle');

	// set dimensions according to the sliderFrame node below
	 var sliderFrame= SVGDocument.getElementById('sliderFrame')

	//  y0 is the center of the slider, s is the range about the center
	 s=0.5*parseFloat(sliderFrame.getAttribute('height'));
	 y0=parseFloat(sliderFrame.getAttribute('y'))+s-0.5 * parseFloat(handle.getAttribute('height'));
	 y=y0

	 handle.setAttribute("y",y0);
}
//============================================ grip()
function grip(evt) {  
	isGripped=true;
	grabY=evt.clientY-y;
}
//============================================ drag()
function drag(evt){
	if (!isGripped) return;
	Y=(evt.clientY);

	// observe bounding box constraint
	y=Math.min(Math.max(Y-grabY,y0-s),y0+s);       
	handle.setAttribute("y",y);
	monitor.textContent=Math.round(50*(1-(y-y0)/s));
}
//============================================ released()
function released(){
	isGripped=false;
}

