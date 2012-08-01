// Modified from
// https://svn.apache.org/repos/asf/commons/sandbox/gsoc/2010/scxml-js/trunk/src/javascript/scxml/cgf/util/svg.js

function getBoundingBoxInArbitrarySpace(element,mat){
    var svgRoot = element.ownerSVGElement;
    var bbox = element.getBBox();

    var cPt1 =  svgRoot.createSVGPoint();
    cPt1.x = bbox.x;
    cPt1.y = bbox.y;
    cPt1 = cPt1.matrixTransform(mat);

    // repeat for other corner points and the new bbox is
    // simply the minX/minY  to maxX/maxY of the four points.
    var cPt2 = svgRoot.createSVGPoint();
    cPt2.x = bbox.x + bbox.width;
    cPt2.y = bbox.y;
    cPt2 = cPt2.matrixTransform(mat);

    var cPt3 = svgRoot.createSVGPoint();
    cPt3.x = bbox.x;
    cPt3.y = bbox.y + bbox.height;
    cPt3 = cPt3.matrixTransform(mat);

    var cPt4 = svgRoot.createSVGPoint();
    cPt4.x = bbox.x + bbox.width;
    cPt4.y = bbox.y + bbox.height;
    cPt4 = cPt4.matrixTransform(mat);

    var points = [cPt1,cPt2,cPt3,cPt4]

    //find minX,minY,maxX,maxY
    var minX=Number.MAX_VALUE;
    var minY=Number.MAX_VALUE;
    var maxX=0
    var maxY=0
    for(i=0;i<points.length;i++)
    {
        if (points[i].x < minX)
        {
            minX = points[i].x
        }
        if (points[i].y < minY)
        {
            minY = points[i].y
        }
        if (points[i].x > maxX)
        {
            maxX = points[i].x
        }
        if (points[i].y > maxY)
        {
            maxY = points[i].y
        }
    }

    //instantiate new object that is like an SVGRect
    var newBBox = {"x":minX,"y":minY,"width":maxX-minX,"height":maxY-minY}
    return newBBox; 
}   

function getBBoxInScreenSpace(element){
    return getBoundingBoxInArbitrarySpace(element,element.getScreenCTM());
}


// This function takes an object and returns {offsetX:,offsetY:,scale:},
// a *subtractive* offset to get an elements bbox center to use for
// mouse events, and a multiplicative scale factor for the objects
// non-scaled resolution.
function getCenterOffset(O) {
    var Box = getBBoxInScreenSpace(O);
    var offsetX = parseInt(Box.x + (Box.width / 2));
    var offsetY = parseInt(Box.y + (Box.height / 2));
    var scale = O.getScreenCTM().a;
    return {"x": offsetX, "y": offsetY, "scale": 1/scale};
}


