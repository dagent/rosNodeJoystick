function CNodeClientApp() {
	// this.prox = new CServerProxy();	
	// this.lobj = new CListObject;
	// this.cont = new CController();
	// this.vman = new CViewManager();
	this.svg = new CSVGFactory();
	
	this.init = function (){
		// var transInit;

		// this.strUserName = this.prox.getUserName();
		// this.strUserHome = this.prox.getUserHome(this.strUserName);
		this.svg.init();
		// this.strUserHome = '/';
		// this.lobj.init();
		// this.cont.init();
		// this.vman.init();
		// transInit = new CListTransaction({
				// strTransType: "read",
				// strTargetPath: "/",
			// });

		// this.cont.doRecord_Read(transInit);
	}


	////////////////////////////////////////////////////////////////
	//====================== Test functions ========================
	////////////////////////////////////////////////////////////////
	// this.clkBut1 = function (e){
		// var evt;
		// var eltClicked;		
		// evt = e || window.event;
		// eltClicked = evt.target || e.srcElement;
	// }
	// this.clkBut2 = function (e){
		// var str = "heres the break<br/>hows that?";
		// var exc;

		// $("test-itemstr").textContent = "listapp::clkBut2()";

		// $("test-itemstr").highlight({
			// duration: 10,
			// startcolor: "#FFFF99",
			// afterFinish: function(){
				// $("test-itemstr").remove();
 			// }
		// }); 

		// try { 
			// throw new Error("blah");
		// } catch(exc){
			// lapp.errorAlert("Err:", exc);
		// }
	// }

	////////////////////////////////////////////////////////////////
	//====================== Utilities =============================
	////////////////////////////////////////////////////////////////

	//================= bestowPublisher() ==============
	// Makes an object an event publisher, ie, an object that
	// has events that other objects can request to observe. 
	// PARMS:
	//	  that : an object to make into an event publisher
	// 			Two methods will be grafted onto 'that' object:
	//				observe() Called by other objects to register interest
	//					in observing events of the publisher
	//				fire() Called by the publisher object to notify/call
	//					the registered observers when an event occurs 
	this.bestowPublisher = function (that) {
		var registry = {};
		
		//============================================
		// Register an event. Make a handler record. Put it
		// in a handler array, making one if it doesn't yet
		// exist for this type.
		that.observe = function (type, method, parameters) {
			var handler = {
				method: method,
				parameters: parameters
			};
			if (registry.hasOwnProperty(type)) {
				registry[type].push(handler);
			} else {
				registry[type] = [handler];
			}
			return this;
		};
		//============================================
		// Fire an event on an object. The event can be either
		// a string containing the name of the event or an
		// object containing a strEventType property containing the
		// name of the event. Handlers registered by the 'on'
		// method that match the event name will be invoked.
		that.fire = function (event) {
			var array, func, handler, i;
			var strEventType = typeof event === 'string' ? event : event.strEventType;

			// If an array of handlers exist for this event, then
			// loop through it and execute the handlers in order.
			if (registry.hasOwnProperty(strEventType)) {
				array = registry[strEventType];
				for (i = 0; i < array.length; i += 1) {
					handler = array[i];

					// A handler record contains a method and an optional
					// array of parameters. If the method is a name, look
					// up the function.
					func = handler.method;
					if (typeof func === 'string') {
						func = this[func];
					}

					// Invoke a handler. If the record contained
					// parameters, then pass them. Otherwise, pass the
					// event object.
					try {
						func.apply(this, handler.parameters || [event]);
					} catch (exc) {
						lapp.errorAlert("Exception caught in fire('" + strEventType + "'):", exc);
					}
				}
			}
			return this;
		};		
		return that;
	};	

	//=============================================
	// This cheesy thing is an easy to find place holder for all the places where I should
	// implement real error handling code
	this.errorAlert = function(strMsg1, strMsg2){
		var eltErrBox = $("error-console");
		var strMsg;
		var eltMsg;
		
		if (strMsg1)
			strMsg = strMsg1 + "<br/>";
		
		if (strMsg2){
			if (typeof strMsg2 === "string"){	
				strMsg += strMsg2 + "<br/>";
			} else if (typeof strMsg2.msg === "string"){	
				strMsg += strMsg2.msg + "<br/>";
			} else if (typeof strMsg2 === "error" || typeof strMsg2 === "object"){
				// TODO: A more organized approach for managing these props
				// FF Throws Object, not Error objects, but with many fields
				// in common, yet with different spelling/caps
				if (strMsg2.message) strMsg += strMsg2.message;
				if (strMsg2.filename) strMsg += "<br/>in: " + strMsg2.filename;
				if (strMsg2.fileName) strMsg += "<br/>in: " + strMsg2.fileName;
				if (strMsg2.linenumber) strMsg += "@" + strMsg2.linenumber + "<br/>";
				if (strMsg2.lineNumber) strMsg += "@" + strMsg2.lineNumber + "<br/>";
			}
		}
		
		if (FVLOGGER_VERSION){
			error(strMsg);
		} else if (eltErrBox){
			eltMsg = document.createTextNode(strMsg);
			eltErrBox.innerHTML = strMsg + eltErrBox.innerHTML;
		} else {
			alert("ERROR: " + strMsg);
		}
	}
	//=============================================
	function S4() {
	   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
	}
	function guid() {
	   return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	}

	this.evaluateXPath = function (aNode, aExpr) {
		var xpe = new XPathEvaluator();
		var nsResolver = xpe.createNSResolver(aNode.ownerDocument == null ?aNode.documentElement : aNode.ownerDocument.documentElement);
		var result = xpe.evaluate(aExpr, aNode, nsResolver, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
		var found = [];
		var res;
		while (res = result.iterateNext())
			found.push(res);
		return found;
	}
	this.evaluateXPathIter = function (aNode, aExpr) {
		var xpe = new XPathEvaluator();
		var nsResolver = xpe.createNSResolver(aNode.ownerDocument == null ?aNode.documentElement : aNode.ownerDocument.documentElement);
		var result = xpe.evaluate(aExpr, aNode, nsResolver, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);

		return result;
	}
	this.evaluateXPathFirst = function (aNode, aExpr) {
		var xpe = new XPathEvaluator();
		var nsResolver = xpe.createNSResolver(aNode.ownerDocument == null ?aNode.documentElement : aNode.ownerDocument.documentElement);
		var result = xpe.evaluate(aExpr, aNode, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
		if (result && result.singleNodeValue){
			// TODO: This breaks lobj::insertpathatrr() for some reason
			//result = Element.extend(result.singleNodeValue);
			result = result.singleNodeValue;
		} else {
			result = null;
		}
		return result;
	}
	
	// Given a node from the html doc, searches each ancestor until
	// it find an element with a path attribute, then returns that node or
	// null if it reaches the root
	this.searchUpForAttrNode = function(node, attrName){
		if (!node || !attrName)
			return null;
			
		for (; node; node = node.parentNode){ 
			switch (node.nodeType){ 
				// Element
				case 1: 
					if (node.getAttribute(attrName))
						return node;
					break
				// Document
				case 9: 
					return null;			
			}			
		}
	
	}
	//========================================
	this.removeAllChildren = function (node){
		if (!node.hasChildNodes())
			return;
		while (node.childNodes.length >= 1 ){
			node.removeChild(node.firstChild );       
		} 
	}
	//========================================
	this.replaceAllChildren = function (containerNode, newChildNode){
		this.removeAllChildren(containerNode);
		containerNode.appendChild(newChildNode);
	}

	//modified from script at: http://www.quirksmode.org/js/events_properties.html#target
	this.grabID = function(e){ 
		var targ;
		evt = e || window.event;
		targ = evt.target || e.srcElement;

		if (targ.nodeType == 3) // defeat Safari bug
			targ = targ.parentNode;	

		alert(targ.parentNode) //this line may be removed or commented out
	}
	this.UI_onButtonAddtoList =function (containerPath){
		alert(containerPath);
		return;
		var selector = '[path="' + containerPath + '"]';
		var pathNode = $('view-default-container').select(selector);
		//pathNode = $('view-default-container');
		dlgWin = window.open("DlgCreateNew.php", "blah", "width=200,height=100"); 
		dlgDoc = dlgWin.document; 
		
		var newText = dlgDoc.createTextNode(containerPath);
		var newElt = dlgDoc.createElement("p");
		newElt.appendChild(newText);
		
		dlgDoc.getElementById("DlgCreatNew_ContainerPath").appendChild(newElt);
	}
}


//============================================
if (typeof Object.beget !== 'function') {
     Object.beget = function (o) {
         var F = function () {};
         F.prototype = o;
         return new F();
     };
}