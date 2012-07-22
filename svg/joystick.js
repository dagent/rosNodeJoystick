//  Behaviour Code for SVG joystick
var x0,y0;          // base position
var x,y;            // dynamic position
var dX, dY;         // displacement vector
var velx=0;
var vely=0;         // velocity
var mass=1;       // mass
var k =2;           // spring constant
var damp=0.1;       // damping
var s;              // bounding box dimension (hard wall constraint)
var grabX,grabY ;   // initial grab mousedown coords

var frameInterval=20;   // animation framerate period
var isLooping=false;
var isGripped=false;
var handle;    // the SVG element

//============================================ init()
function init(evt){  // constructor
	var svgns = "http://www.w3.org/2000/svg";
	SVGDocument = evt.target.ownerDocument;
	handle = SVGDocument.getElementById('handle');
	// set dimensions
	x=parseFloat(handle.getAttribute('cx'));   
	y=parseFloat(handle.getAttribute('cy'));
	s = 200;
	y0 = y;
	x0 = x;
}
//============================================ loop()
// animation loop
/*
function loop(){      
	if (!isLooping){
		return;
	}
	// iterate the equation of motion
	vely = damp * (vely - k* (y-y0)/mass);  y+= vely;
	velx = damp * (velx - k* (x-x0)/mass);  x+= velx;
	updateCanvas();
	// when released handle's kinetic energy has dissipated, stop animating
	if (velx*velx+vely*vely<1e-2) isLooping=false;
	setTimeout("loop()", frameInterval);
}
 */	
//============================================ updateCanvas()
// update handle's drawing position with current x,y
function updateCanvas(){ 
	handle.setAttributeNS(null, 'cx', ''+x);
	handle.setAttributeNS(null, 'cy', ''+y);
}
//============================================ grip()
// joystick gripped
function grip(evt){   
	isGripped=true;
	isLooping=false;
	grabX=evt.clientX;
	grabY=evt.clientY;
}
//============================================ drag()
// joystick dragged
function drag(evt){    
	if (!isGripped) return;
	dX=(evt.clientX-grabX);
	dY=(evt.clientY-grabY);

	// observe bounding box constraint
	x=Math.min(Math.max(x0+dX,x0-s),x0+s);
	y=Math.min(Math.max(y0+dY,y0-s),y0+s);

	updateCanvas();
};
//============================================  released()
// joystick released
function released(){
	 isGripped=false;
	 isLooping=true;
	 dX=0; dY=0;
	 x = x0;
	 y = y0;
	 //XXX loop();
};
