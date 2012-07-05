function CSVGFactory() {
	//============================================
	this.init = function(){
		this.m_hashSVGObjects = new Hash();
		// lapp.bestowPublisher(this);
		// this.hashCurSelection = new Hash();
		// this.curActivePath = null;
		// For keypress actions upon selected records
		// document.addEventListener("keypress", function (e){lapp.cont.keyPress(e);}, true);	
		// lapp.lobj.observe("event-list-transaction", this.onTransaction.bind(this) );				
	}

	//============================================
	this.create = function(strWidgetType, strObjName){
		var svgObj = {
			m_strWidgetName: strObjName,
			m_eltDOMContainer: undefined,
			m_eltDOMSelf: undefined,
			
			//============================================
			setDOMContainer : function(eltContainer){
				this.m_eltDOMContainer = eltContainer;
				//this.m_eltDOMSelf = document.createElement("object");
				//this.m_eltDOMSelf.setAttribute("data", "meter.svg");
				//this.m_eltDOMSelf.setAttribute("name", strObjName);
				
				this.m_eltDOMSelf = document.createElement("embed");
				this.m_eltDOMSelf.setAttribute("src", "meter.svg");
				this.m_eltDOMSelf.setAttribute("name", strObjName);
				//Element.extend(this.m_eltDOMSelf);
				//m_eltDOMSelf = new Element("object", {'data': 'meter.svg'});
				eltContainer.appendChild(this.m_eltDOMSelf);
				//m_eltDOMSelf.update();
			},
			
			//============================================
			onEvent : function(event){				
			},

			//============================================
			setValue : function(iValue){
				console.log("SVG obj got value: " + iValue);
				//svgelt = m_eltDOMSelf.select('[name="mask"]');
				var svgelt = this.getSvgElementsByClassName('mask');
				svgelt.height.baseVal.value = iValue;
				svgelt = this.getSvgElementsByClassName('tvalue');
				//var svgelt = this.m_eltDOMSelf.select('[class="mask"]');
				svgelt.textContent = iValue;
			},
			
			//============================================
			getSvgElementsByClassName : function (elemClassName){
				var svgDoc = this.m_eltDOMSelf.getSVGDocument();
				//var svgelt = svgDoc.getAnonymousElementByAttribute(svgDoc, 'class', elemClassName);
				var svgelt = svgDoc.getElementById(elemClassName);
				return svgelt;
			},
		}
		
		
		this.m_hashSVGObjects.set(strObjName, svgObj);
		return svgObj;
	}
	
	//============================================
	this.GetSVGObject = function(strObjName){
		var svgObj = this.m_hashSVGObjects.get(strObjName, svgObj);
		return svgObj;
	}
	
	var mask;
	var tvalue;


}


