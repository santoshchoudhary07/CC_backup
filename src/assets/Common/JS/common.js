	var sCancelAlert = 'Cancelling will discard all changes. Do you wish to continue?';
	var sReqFieldErrAlert = 'Please enter all required fields before submitting.';
	var sSecureWindowFeature = 'menubar=yes,status=yes,location=no,toolbar=no,scrollbars=yes,resizable=yes';
	var sSecureWindowFeatureLockDown = 'menubar=no,status=no,location=no,toolbar=no,scrollbars=no,resizable=no';

	var sErrColor = "lightyellow";

	var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
	    // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
	var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
	var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
	    // At least Safari 3+: "[object HTMLElementConstructor]"
	var isChrome = !!window.chrome && !isOpera;              // Chrome 1+
	var isIE = /*@cc_on!@*/false || !!document.documentMode; // At least IE6

	function trim(sString)
	{
		sString = sString.replace(/^[\s]+/g,"");
		sString = sString.replace(/[\s]+$/g,"");
		return sString;
	}


	function blurNum(obj,ifNaN){
		if(ifNaN==null){
			ifNaN="";
		}
		if(obj.value){
			obj.value = pureNumber(obj.value,ifNaN);
		}else{
			return pureNumber(obj,ifNaN);
		}
	}

	function pureNum(obj){
		blurNum(obj,0);
	}

	function pureNumber(theNum, returnIfNaN)
	{
		//get the PURE number (without any invalid characters)
		if(theNum.tagName){
			theNum=theNum.value;
		}
		theNum=theNum.replace(/[^\.|\+|\-|0-9]/gi,"");
		if(isNaN(theNum) || theNum=="")		{
			if(returnIfNaN==null)	{
				theNum = 0;
			}	else {
				theNum = returnIfNaN;
			}
		}
		return theNum;
	}

	function fnSetEmptyElseFormatNum(elem, dec, abs, def) {
		//protect legacy code as commas in a number isNaN
		if(!def){def="";}
		formatNum(elem,dec,abs);
		if(elem.value==0){elem.value=def;}else{elem.value=pureNumber(elem.value);}
	}


	function formatNum(obj,places,isAbsolute)	{
		if(places==null)
			places=0;

		if(obj.value)
			obj.value = formatNumber(obj.value,places,"","",isAbsolute);
		else
			return formatNumber(obj,places,"","",isAbsolute);
	}

	function checkYear(fld) {
		var yearVal = pureNumber(fld.value);
		if (yearVal == "0") {
			yearVal = "";
		}
		fld.value = yearVal;
	}



	//**************************************************************************
	//	formatNumber
	//		Returns a String formated based on the arguments supplied
	//
	//	note:
	//		formatNumber calls the "pureNumber" function to strip out any
	//		NON numeric characters
	//
	//	example:
	//		formatNumber(1234.567, 2, "$", "") = "$1,234.57"
	//**************************************************************************
	function formatNumber(theNum, places, preChars, postChars, isAbsolute)
	{
		var fmtNum;
		var decNum;
		var isNegative;
		var i,strLen,mod;

		if(places==null)
			{places=0;}

		theNum = theNum.toString(); //just in case

		//get the PURE number (without any invalid characters)
		theNum = pureNumber(theNum,0);
		if(isAbsolute){
			theNum = Math.abs(theNum);
		}
		theNum = Math.round(Number(theNum) * Math.pow(10,places))/Math.pow(10,places);
		isNegative = theNum<0;

		theNum = Math.abs(theNum).toString();
		fmtNum = "";
		i=0;
		strLen = theNum.indexOf(".");
		if(strLen==-1)
			strLen=theNum.length;
		decNum = theNum.substring(strLen,theNum.length);

		mod = (strLen-1)%3+1;
		while(strLen)
		{
			fmtNum += theNum.substr(i,mod);
			i+=mod;
			strLen-=mod;
			if(strLen>0)
			{
				mod =(strLen-1)%3+1;
				fmtNum+=","
			}
		}

		if(places)
		{
			if(!decNum)
				decNum=".";

			fmtNum+=decNum;
			for(i=decNum.length;i<places+1;i++)
				fmtNum+="0";
		}

		if(!preChars)
			preChars = "";

		if(!postChars)
			postChars = "";

		return ((isNegative)?"-":"") + preChars + fmtNum + postChars;
	}
	//**************************************************************************
	//**************************************************************************

	function parseDateText(obj){
		if(isNaN(Date.parse(obj.value))){
			obj.value = "";
		}else{
			obj.value = fmtDate(obj.value);
		}
	}

	function blurDate(obj,ifNaN){
		if(ifNaN==null){
			ifNaN="BLANK";
		}
			obj.value = pureDate(obj.value, ifNaN);
	}

	function parseDateValue(obj) {
		obj.value = pureDate(obj.value, obj.undo);
	}

	function isValidDate(strDate) {
		var ret = false;
		try {
			var jsDate = new Date(strDate);
			var arrayDate = ((strDate.toString()).split('/')).length == 1 ? ((strDate.toString()).split('-')) : ((strDate.toString()).split('/'));

			if ((jsDate.getMonth() + 1) == parseInt(arrayDate[0], 10) && jsDate.getDate() == parseInt(arrayDate[1], 10) && jsDate.getFullYear() == parseInt(arrayDate[2], 10)) {
				ret = true
			}

		} catch(err){
			alert("Failed to validate date")
		}
		return ret
	}

	function pureDate(d,ifIsNaN,isAsEntered){
		if(isNaN(Date.parse(d))){
			if(!isNaN(Date.parse(ifIsNaN))){
				return fmtDate(ifIsNaN);
			}else{
				if(ifIsNaN.toUpperCase()=="BLANK"){
					return "";
				}else{
					return fmtDate(new Date);
				}
			}
		} else {
			if (!isValidDate(d)) {
				return "";
			}
			else if (!isAsEntered) {
				//~~~~~
				//	Notes:	20100208
				//check to see if the year is less than 1950
				//if so, then add 100 years to it (this will account for 1/1/04 = 1/1/2004 and not 1/1/1904)

				var dDate = new Date(d);
				var year = dDate.getFullYear();

				var aSplitDte = ((d.toString()).split('/')).length==1?((d.toString()).split('-')):((d.toString()).split('/'));

				if ((((aSplitDte[aSplitDte.length-1]).toString()).length)<4)
				{
					if (parseInt(year,10)<1000)
					{
						return "";
						//dDate.setFullYear(parseInt(1900+parseInt(year,10)));
						//d = dDate;
					}
					else if(year<1930){
						dDate.setFullYear(parseInt(year+100));
						d = dDate;
					}
				}
				else if ((((aSplitDte[aSplitDte.length-1]).toString()).length)==4)
				{
					if(year<1900)
					{
						return "";
					}
					else if(year>=4000)
					{
						return "";
					}
					else
					{
						d = dDate;
					}
				}
				else if(year>=4000)
				{
					return "";
				}



/*
				if(year<1930){
					dDate.setFullYear(parseInt(year+100));
					d = dDate;
				}
				else if(year>=4000){
					return "";
					}
*/
			}
			return fmtDate(d);
		}
	}

	function fmtDate(strDate){
		var d = new Date(strDate);
		return (parseInt(d.getMonth(),10)+1) +"/"+ d.getDate() + "/" + d.getFullYear();
	}


	function checkValid(obj){
		//this function relies on custom attributes being set in the element
		// errMsg = the message to be returned if invalid
		// errRule = the rule to be eveluated for validity (using "obj" as the source)
		//				if it does not exist, then (obj.value!="") will be used
		// srcObject = (optional) the object to be hightlighted (other than self)
		var srcObj=obj;
		var rule = obj.errRule;
		var isValid = eval(rule);

		if(obj.srcObject){
			//srcObject is an object other than itself that should be highlighted
			srcObj = document.getElementById(obj.srcObject);
		}
		var sEnabledState = srcObj.disabled;

		if(!isValid){
			srcObj.style.backgroundColor = sErrColor;
			return obj.errMsg + "\n";
		}else{
			srcObj.disabled=false;
			srcObj.style.backgroundColor = "";
			srcObj.disabled=sEnabledState;
			return "";
		}
	}


	function getParent(obj,tagName){
		var pElem = obj.parentElement;
		while(pElem.tagName.toLowerCase()!=tagName.toLowerCase()){
			pElem = pElem.parentElement;
			if(pElem.tagName.toLowerCase()=="body"){
				pElem = null;
				break;
			}
		}
		return pElem;
	}


	function toggleRow(obj,isVisible){
		var pElem = getParent(obj,"tr");

		if(pElem!=null){
			var setting = (isVisible?"block":"none");
			pElem.style.display = setting;
			//now see if there are any SELECT element that must be hidden/shown as well
			var elems = pElem.getElementsByTagName("select");
			for(var i=0;i<elems.length;i++){
				elems[i].style.display = setting;
			}
		}
	}

	function popup(href, name, optionMask, h, w){
		var features = "location="+ (optionMask & 1?"yes":"no")
						+ ",scrollbars="+ (optionMask & 2?"yes":"no")
						+ ",resizable="+ (optionMask & 4?"yes":"no")
						+ ",status="+ (optionMask & 8?"yes":"no")
						+ ",menubar="+ (optionMask & 16?"yes":"no")
						+ ",toolbar="+ (optionMask & 16?"yes":"no")
						+ ",width="+ (w?w:500) +",height="+ (h?h:600);
		var win = window.open(href,name,features);
		win.focus();
	}

	function rowHover(obj,isOn){
		if(isOn){
			obj._oldBackground = obj.style.background;
			obj.style.background = sErrColor;
		}else{
			obj.style.background = obj._oldBackground;
			obj._oldBackground = "";
		}
		//obj.style.background=(isOn?sErrColor:"");
	}

	function sizeToFit(){
		//turn off any WINDOW scroll bars.
		window.document.body.style.overflow = "hidden";

		if (! window.outerTable ){ //cross-browser
			window.outerTable = document.getElementById("outerTable");
		}
		if (! window.outerBox ){ //cross-browser
			window.outerBox = document.getElementById("outerBox");
		}
		var iWidth = window.outerTable.clientWidth+4;// + 12;
		var iHeight = window.outerTable.clientHeight;// + 30;
		var iMaxHeight = window.screen.availHeight - 200; //60 for room to "move" the window


		var iScrollSize = 0;
		var iWindowWidthPadding = 2;
		var iWindowHeightPadding = 5;

		if(iHeight > iMaxHeight){
			iHeight = iMaxHeight;
			window.outerBox.style.overflowY = "scroll";
			iScrollSize=16;		//why 16? it is the "width" of the scroll bar
		}else{
			window.outerBox.style.overflowY = "hidden";
		}

		var newHeight = iHeight;
		var newWidth = iWidth + iScrollSize;

		window.outerBox.style.height = newHeight;
		window.outerBox.style.width = newWidth;

		//get current body size
		var iCurWidth = window.document.body.offsetWidth;
		var iCurHeight = window.document.body.offsetHeight;
		//var iDifWidth = (iWidth + iScrollSize)-iCurWidth;
		//var iDifHeight = (iHeight + (iScrollSize * 2))-iCurHeight;

		var iDifWidth = (newWidth)-iCurWidth + iWindowWidthPadding;
		var iDifHeight = (newHeight)-iCurHeight + iWindowHeightPadding;


		/*
		var s = "iWidth = "+ iWidth + "\n";
		s+= "iHeight = "+ iHeight + "\n";
		s+= "iCurWidth = "+ iCurWidth + "\n";
		s+= "iCurHeight = "+ iCurHeight + "\n";
		s+= "iDifWidth = "+ iDifWidth + "\n";
		s+= "iDifHeight = "+ iDifHeight + "\n";
		alert(s);
		*/

		window.resizeBy(iDifWidth,iDifHeight);

		//window.resizeTo(iWidth + iScrollSize, iHeight + (iScrollSize * 2));
	}


/////////////////////////////////////////////////////////////////////


	function tabClick(elementArrayName,elementIndex,valueElementName){
		//first activate the elements index and hide all other
		var elementArray = document.all(elementArrayName);
		//alert(elementArray[elementIndex].tagName);
		for(i=0;i<elementArray.length;i++){
			elementArray[i].style.display = (i==elementIndex? "block" : "none");
		}

		//set the calling tab as the active tab
		//find calling tab's parent TR...
		oSrc = event.srcElement;
		oRow = oSrc.parentElement;
		oTabs = oRow.children("tab");
		for(i=0;i<oTabs.length;i++){
			oTabs[i].className = (oTabs[i] == oSrc)?"tabOn":"tabOff";
		}
		if(valueElementName){
			document.getElementById(valueElementName).value = elementIndex;
		}
		sizeToFit();
	}

	function remoteTabClick(iTabID){
		if(document.all("tab")[iTabID]){
			document.all("tab")[iTabID].click();
		}
	}

	function hasPermission(){
		//password protect
		//TODO: encrypt or something...
		ret = window.prompt("Please enter the Admin Password","")
		if(ret != "Ma"){
			alert("Invalid Password.");
			return false;
		}else{
			return true;
		}
	}

//////////////////////////////////////////////////////////////////////////////
//
//	FUNCTION TO DO WITH GENERAL DYNAMIC HTML...
//
//////////////////////////////////////////////////////////////////////////////


//************************************************************
//	Name:		absLeft
//	Args:		obj as Object
//	Returns:	long
//
//	Description:	Returns the absolute position of the object in relation
//					to the Page. This is usefull for positioning Dynamic
//					elements on the page
//
//	Example:	myDiv.style.left = absLeft(anotherObject);
//
//	Brice Cranston (2/28/2002)
//
//	[5/10/2002] bc: adjusted for accuracy
//		- include "clientLeft"
//		- loop until NO Parent is available (this will include the body)
//
//************************************************************
function absLeft(obj)
{
	var pos=0;
	do
	{
		pos += obj.offsetLeft;// + obj.clientLeft;
		obj = obj.offsetParent;
	}while(obj)
	return pos+1;
}

//************************************************************
//	Name:		absTop
//	Args:		obj as Object
//	Returns:	long
//
//	Description:	Returns the absolute position of the object in relation
//					to the Page. This is usefull for positioning Dynamic
//					elements on the page
//
//	Example:	myDiv.style.top = absTop(anotherObject);
//
//	Brice Cranston (2/28/2002)
//
//	[5/10/2002] bc: adjusted for accuracy
//		- include "clientLeft" (doesn't work, missing something)
//		- loop until NO Parent is available (this will include the body)
//
//************************************************************
function absTop(obj)
{
	var pos=0;
	do
	{
		pos += obj.offsetTop;// + obj.clientTop;
		obj = obj.offsetParent;
	}while(obj)
	return pos+1;
}

//************************************************************
//	Name:		absBottom
//	Args:		obj as Object
//	Returns:	long
//
//	Description:	Returns the absolute position of the object in relation
//					to the Page. This is usefull for positioning Dynamic
//					elements on the page
//
//	Example:	myDiv.style.top = absBottom(anotherObject);
//
//	Brice Cranston (2/28/2002)
//
//************************************************************
function absBottom(obj)
{
	return absTop(obj) + obj.offsetHeight;
}

//************************************************************
//	Name:		absRight
//	Args:		obj as Object
//	Returns:	long
//
//	Description:	Returns the absolute position of the object in relation
//					to the Page. This is usefull for positioning Dynamic
//					elements on the page
//
//	Example:	myDiv.style.left = absRight(anotherObject);
//
//	Brice Cranston (2/28/2002)
//
//************************************************************
function absRight(obj)
{
	return absLeft(obj) + obj.offsetWidth;
}


function fnTextareaMaxLength(oObj, iMaxLength) {
	if (oObj.value.length>iMaxLength)			{
		oObj.value = oObj.value.substring(0, iMaxLength);
		return false;
	}
}


function fnOnlyNumber(oEvt)		{
	/*
	var aTmp=(oObj.value).split('.');
	alert(oEvt.keyCode)
	var bValid=isNaN(aTmp.length)||aTmp.length==2?true:false;
	*/
	var iCode=oEvt.charCode? oEvt.charCode : oEvt.keyCode
	if ((iCode<8||iCode>9))		{
		if ((iCode<48||iCode>57))
		return false
    }
}


function keyPress_OnlyNumbers(){
	event.returnValue = (event.keyCode>=48 && event.keyCode<=57)
}


function fnSetErrorStyle(oObj, bIsErr)
{
	if (bIsErr)
	{
		oObj.style.backgroundColor='#f3e999';
		oObj.style.color='red';
		oObj.style.borderTop='1px solid #abadb3';
		oObj.style.borderLeft='1px solid #dbdfe6';
		oObj.style.borderRight='1px solid #dbdfe6';
		oObj.style.borderBottom='1px solid #e3e9ef';
	}
	else
	{
		oObj.style.backgroundColor='#ffffff';
		oObj.style.color='#000000';
		oObj.style.borderTop='1px solid #abadb3';
		oObj.style.borderLeft='1px solid #dbdfe6';
		oObj.style.borderRight='1px solid #dbdfe6';
		oObj.style.borderBottom='1px solid #e3e9ef';
	}
}


function toProperCase(s)
{
  return s.toLowerCase().replace( /\b((m)(a?c))?(\w)/g,
          function($1, $2, $3, $4, $5) { if($2){return $3.toUpperCase()+$4+$5.toUpperCase();} return $1.toUpperCase(); });
}

function nameFormat(obj) {

	obj.value = toProperCase(obj.value);

}

function left(str, n){
	if (n <= 0)
	    return "";
	else if (n > String(str).length)
	    return str;
	else
	    return String(str).substring(0,n);
}


function clearOptions(OptionList) {
	// Always clear an option list from the last entry to the first
	for (x = OptionList.length; x >= 0; x = x - 1) {
		OptionList[x] = null;
	}
}


function addToOptionList(OptionList, OptionValue, OptionText) {
	// Add option to the bottom of the list
	OptionList[OptionList.length] = new Option(OptionText, OptionValue);
}

/*
function dateDiff(date1, date2) {
	alert("hi");
	var dt1 = new Date(Date.parse(date1));

	var dt2 = new Date(Date.parse(date2));
	var one_day=1000*60*60*24;

	return parseInt(dt2.getTime()-dt1.getTime())/(one_day);
}
*/
function dateDiff(fromDate,toDate,interval) {
	var second=1000, minute=second*60, hour=minute*60, day=hour*24, week=day*7;
	fromDate = new Date(fromDate);
	toDate = new Date(toDate);
	var timediff = toDate - fromDate;
	if (isNaN(timediff)) return NaN;
	//changing from standard time to daylight savings time causes a loss of an hour and  when you're comparing dates without time it will calculate that not a full day has passed.
	//so if the datediff is days/weeks/months/years and doesn't involve a time of day, then convert to universal time zone to do the diff
	if ((fromDate.getHours() == 0 && fromDate.getMinutes() == 0 && fromDate.getSeconds() == 0 && toDate.getHours() == 0 && toDate.getMinutes() == 0 && toDate.getSeconds() == 0) && (interval == "days" || interval == "weeks" || interval == "months" || interval == "years")) {
		fromDate = new Date(Date.UTC(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate(), 0, 0, 0));
		toDate = new Date(Date.UTC(toDate.getFullYear(), toDate.getMonth(), toDate.getDate(), 0, 0, 0));
		timediff = toDate - fromDate;
	}
	switch (interval) {
	    case "years": return toDate.getFullYear() - fromDate.getFullYear();
	    case "months": return (
		( toDate.getFullYear() * 12 + toDate.getMonth() )
		-
		( fromDate.getFullYear() * 12 + fromDate.getMonth() )
	    );
	    case "weeks"  : return Math.floor(timediff / week);
	    case "days"   : return Math.floor(timediff / day);
	    case "hours"  : return Math.floor(timediff / hour);
	    case "minutes": return Math.floor(timediff / minute);
	    case "seconds": return Math.floor(timediff / second);
	    default: return undefined;
	}
}

function monthName(monthNum) {
	var arrMonthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
	if (monthNum >= 1 && monthNum <= 12) {
		return arrMonthNames[monthNum - 1];
	}
	else {
		return "N/A";
	}
}

function isOver55(strDOB, strToday) {
	myAge = dateDiff(strDOB,strToday,"years");
	dob = new Date(strDOB);
	today = new Date(strToday);

	//if the person has not had their birthday yet this year, subtract 1 from age
	bDayThisYear = (dob.getMonth() + 1) + "/" + (dob.getDate()) + "/" + today.getFullYear();
	if (dateDiff(bDayThisYear,today,"days") < 0) {
		myAge = myAge - 1;
	}

	if (myAge >= 55) {
		return true;
	}
	else {
		return false;
	}
}

function htmlEscape(str) {
	return String(str)
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

function setFieldRequired(container, fldId, isReq) {
	var $obj = $(container).find("#" + fldId);
	if (isReq) {
		$obj.attr("Req", "True");
	}
	else {
		$obj.attr("Req", "False");
	}
}


//Polyfill for IE
if (!Object.assign) {
	Object.defineProperty(Object, 'assign', {
		enumerable: false,
		configurable: true,
		writable: true,
		value: function (target) {
			'use strict';
			if (target === undefined || target === null) {
				throw new TypeError('Cannot convert first argument to object');
			}

			var to = Object(target);
			for (var i = 1; i < arguments.length; i++) {
				var nextSource = arguments[i];
				if (nextSource === undefined || nextSource === null) {
					continue;
				}
				nextSource = Object(nextSource);

				var keysArray = Object.keys(Object(nextSource));
				for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
					var nextKey = keysArray[nextIndex];
					var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
					if (desc !== undefined && desc.enumerable) {
						to[nextKey] = nextSource[nextKey];
					}
				}
			}
			return to;
		}
	});
}