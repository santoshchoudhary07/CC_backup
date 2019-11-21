
/* 
include this file to make "old" ie javascript functions/methods available in newer browser
THIS IS ONLY FOR THE SHORT TERM!!!
	pages need to be rewritten to use a common library (possibly based on jQuery)
	
browser support:
	ie
	firefox
	safari
	safari(mac)
	safari(iPad)
	chrome

NOTE: this file should be the first javascript source in the page 
to ensure the "prototypes" are call before any objects are created.

<!--
example:
	<script type="text/javascript" language="javascript" src="/common/js/iePrototype.js" ... script>
	... other script blocks here...
-->
        
*/            
            

function MA_browserIsIE(){
    return (window.navigator.userAgent.indexOf("MSIE") > 0) || (window.navigator.userAgent.indexOf("Trident") > 0)
}

function MA_objectHasCapability(obj, propertyName){
    //Object.getOwnPropertyNames(HTMLElement.prototype).indexOf("innerText")
    return Object.getOwnPropertyNames(obj.prototype).indexOf(propertyName) > -1;
}



function IE_PROTOTYPE_INIT(){
//	alert(window.navigator.userAgent);
	var hasHTMLElementObject = false;
	try{
		if(HTMLElement) hasHTMLElementObject = true;
	}catch(e){
		//nothing... already taken care of
	}
	//if (! MA_browserIsIE()) {
	if (hasHTMLElementObject) {
        /////////////////////////////////////////
        //innerText
        /////////////////////////////////////////                    
        if(!MA_objectHasCapability(HTMLElement,"innerText")){      
            console.log("prototype HTMLElement.innerText");
            //firefox just "has" to be different!
            if(HTMLElement.prototype.__defineGetter__ != 'undefined')
            {
                console.log("__defineGetter__/__defineSetter__");
                HTMLElement.prototype.__defineGetter__("innerText", function () {
                   var r = this.ownerDocument.createRange();
                   r.selectNodeContents(this);
                   return r.toString();
                }); 
                HTMLElement.prototype.__defineSetter__("innerText", function (sText) {
                   this.innerHTML = sText;
                });
            } else {
                console.log("simple prototyping");
                HTMLElement.prototype.innerText = {
                    get : function() {
                        return(this.textContent);
                    },
                    set : function(val) {
                        this.textContent=val;
                    }
                }                
            }
            
        }
        /////////////////////////////////////////	
        //"all" collection
        /////////////////////////////////////////
        //build a list of dependent elements matching the value
        var fn = function(val,item){
            var oEverything = this.getElementsByTagName("*");
            var oResult = [];
            for(var i=0;i<oEverything.length;i++){
                if(oEverything[i].id == val || oEverything[i].name == val){
                    oResult.push(oEverything[i]);
                }
            }
            //IE will return an array if there are more than one element ID matching
            if(item!=null){
                return(oResult[item]);
            }else{
                return(oResult.length>1?oResult:oResult[0]);
            }
        }				
        if(!MA_objectHasCapability(HTMLElement,"all")){ 
            console.log("prototype HTMLElement.all");
            HTMLElement.prototype.all = fn
        }
        if(!MA_objectHasCapability(HTMLDocument,"all")){ 
            console.log("prototype HTMLDocument.all");
            HTMLDocument.prototype.all = fn                
        }
    }

	//FireFox XML issues
	if(document.implementation && document.implementation.createDocument)	{
        
        if(!MA_objectHasCapability(XMLDocument,"loadXML")){     
            console.log("prototype XMLDocument.loadXML");   
            XMLDocument.prototype.loadXML = function(xmlString) {
                var childNodes = this.childNodes;
                for (var i = childNodes.length - 1; i >= 0; i--)
                this.removeChild(childNodes[i]);

                var dp = new DOMParser();
                var newDOM = dp.parseFromString(xmlString, "text/xml");
                var newElt = this.importNode(newDOM.documentElement, true);
                this.appendChild(newElt);
            };
        }
		// check for XPath implementation
		if( document.implementation.hasFeature("XPath", "3.0") ) {

            // prototying the XMLDocument
            
            if(!MA_objectHasCapability(XMLDocument,"selectNodes")){      
                console.log("prototype XMLDocument.selectNodes");   
                XMLDocument.prototype.selectNodes = function(cXPathString, xNode) { 
                    if( !xNode ) {
                        xNode = this; 
                    }

                    var oNSResolver = this.createNSResolver(this.documentElement)
                    var aItems = this.evaluate(cXPathString, xNode, oNSResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)

                    var aResult = [];
                    for( var i = 0; i < aItems.snapshotLength; i++)	{ 
                        aResult[i] = aItems.snapshotItem(i);
                    }

                    return aResult;
                }
            }

			// prototying the Element
            if(!MA_objectHasCapability(Element,"selectNodes")){        
                console.log("prototype Element.selectNodes");   
                Element.prototype.selectNodes = function(cXPathString) {
                    if(this.ownerDocument.selectNodes) {
                        return this.ownerDocument.selectNodes(cXPathString, this);
                    } else {
                        throw "For XML Elements Only";
                    }
                }
            }


            if(!MA_objectHasCapability(XMLDocument,"item")){       
                console.log("prototype XMLDocument.item");   
                XMLDocument.prototype.item = function(cXPathString, xNode) {
                    if( !xNode ) { xNode = this; }
                    var oNSResolver = this.createNSResolver(this.documentElement)
                    var cItems = this.evaluate(cXPathString, xNode, oNSResolver,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
                    var cResult = [];
                    for( var i = 0; i < cItems.snapshotLength; i++)	{
                        cResult[i] = cItems.snapshotItem(i);
                    }
                    return cResult;
                }
            }

			// prototying the Element
            if(!MA_objectHasCapability(Element,"item")){     
                console.log("prototype Element.item");   
                Element.prototype.item = function(cXPathString)	{
                    if(this.ownerDocument.item) {
                        return this.ownerDocument.item(cXPathString, this);
                    } else {
                        throw "For XML Elements Only";
                    }
                }
            }
			
			// prototying the XMLDocument
            if(!MA_objectHasCapability(XMLDocument,"selectSingleNode")){    
                console.log("prototype XMLDocument.selectSingleNode");   
                XMLDocument.prototype.selectSingleNode = function(cXPathString, xNode) { 
                    if( !xNode ) { xNode = this; } 
                    var xItems = this.selectNodes(cXPathString, xNode);

                    if( xItems.length > 0 )	{
                        return xItems[0];
                    } else {
                        return null;
                    }
                }
            }

			// prototying the Element
            if(!MA_objectHasCapability(Element,"selectSingleNode")){    
                console.log("prototype Element.selectSingleNode");   
                Element.prototype.selectSingleNode = function(cXPathString) {
                    if(this.ownerDocument.selectSingleNode) {
                        return this.ownerDocument.selectSingleNode(cXPathString, this);
                    } else {
                        throw "For XML Elements Only";
                    }
                }
            }
			
			// text
              
            if(!MA_objectHasCapability(Element,"text")){     
                console.log("prototype Element.text");    
                console.log("__defineGetter__/__defineSetter__");
                Element.prototype.__defineGetter__("text", 
                      function () { return(this.textContent); });
                Element.prototype.__defineSetter__("text", 
                      function (txt) { this.textContent = txt; });
            }
            
			// xml
            if(!MA_objectHasCapability(Element,"xml")){   
                console.log("prototype Element.xml");    
                console.log("__defineGetter__/__defineSetter__");
                Element.prototype.__defineGetter__("xml", 
                      function () { 
                            var oSerializer = new XMLSerializer();
                        return oSerializer.serializeToString(this);
                      });
                Element.prototype.__defineSetter__("xml", 
                      function (xmlText) { 
                        //TODO: something like loanXML... but at the current "this" element
                      });
            }
			
			// xml
            if(!MA_objectHasCapability(XMLDocument,"xml")){     
                console.log("prototype XMLDocument.xml");  
                console.log("__defineGetter__/__defineSetter__");
				XMLDocument.prototype.__defineGetter__("xml", 
				      function () { 
				      		var oSerializer = new XMLSerializer();
						return oSerializer.serializeToString(this);
				      });
				XMLDocument.prototype.__defineSetter__("xml", 
				      function (xmlText) { 
				      	//TODO: something like loanXML... but at the current "this" element
				      });
            }
			
		}
	}
	
	//window.DOMContentloaded 



}


function IE_PROTOTYPE_ONLOAD(){

    if (! MA_browserIsIE()) {
        //frames objects are based on DOMWindow object... 
        //which we cannot prototype!!!
        //so we need to LOOK for them and ADJUST after they have been created (onload)
        for(var f=0; f<window.frames.length; f++){
            frames[f].navigate = function(url){
                this.location.href = url;
            }			
        }
    }

    //alert("all done");
}



function SET_IE_PROTOTYPE_ONLOAD(){
    if(window.onload){
        var fn = window.onload;
        window.onload = function(){
            fn();
            IE_PROTOTYPE_ONLOAD();
        }
    }else{
        window.onload = IE_PROTOTYPE_ONLOAD;
    }
}

//call the function NOW
IE_PROTOTYPE_INIT();            

//if you need to have iFrames prototyped with .navigate, call the following function  at the end of the page
//SET_IE_PROTOTYPE_ONLOAD();
// or set the onload event directly
//window.onload = IE_PROTOTYPE_ONLOAD;     
