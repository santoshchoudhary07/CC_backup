/*****************************************************************
 * Begin date validation script.
 */
// Declaring valid date character, minimum year and maximum year
var dtCh= "/";
var minYear=1900;
var maxYear=2200;

function isInteger(s){
	var i;
    for (i = 0; i < s.length; i++){
        // Check that current character is number.
        var c = s.charAt(i);
        if (((c < "0") || (c > "9"))) return false;
    }
    // All characters are numbers.
    return true;
}

function stripCharsInBag(s, bag){
	var i;
    var returnString = "";
    // Search through string's characters one by one.
    // If character is not in bag, append to returnString.
    for (i = 0; i < s.length; i++){
        var c = s.charAt(i);
        if (bag.indexOf(c) == -1) returnString += c;
    }
    return returnString;
}

function daysInFebruary (year){
	// February has 29 days in any year evenly divisible by four,
    // EXCEPT for centurial years which are not also divisible by 400.
    return (((year % 4 == 0) && ( (!(year % 100 == 0)) || (year % 400 == 0))) ? 29 : 28 );
}
function DaysArray(n) {
	for (var i = 1; i <= n; i++) {
		this[i] = 31
		if (i==4 || i==6 || i==9 || i==11) {this[i] = 30}
		if (i==2) {this[i] = 29}
   }
   return this
}

function validateFieldDate(field) {
	if (field.value != "") {
		if (isDate(field.value) == true) {
			return true;
		}
		else {
			field.value = ""; field.focus();
			return false;
		}
	}
	else {
		return true;
	}
}

function validDate(value){
	return (!isNaN(new Date (value).getYear()));
}

function isDate(dtStr){
	var daysInMonth = DaysArray(12)
	var pos1=dtStr.indexOf(dtCh)
	var pos2=dtStr.indexOf(dtCh,pos1+1)
	var strMonth=dtStr.substring(0,pos1)
	var strDay=dtStr.substring(pos1+1,pos2)
	var strYear=dtStr.substring(pos2+1)
	strYr=strYear
	if (strDay.charAt(0)=="0" && strDay.length>1) strDay=strDay.substring(1)
	if (strMonth.charAt(0)=="0" && strMonth.length>1) strMonth=strMonth.substring(1)
	for (var i = 1; i <= 3; i++) {
		if (strYr.charAt(0)=="0" && strYr.length>1) strYr=strYr.substring(1)
	}
	month=parseInt(strMonth)
	day=parseInt(strDay)
	year=parseInt(strYr)
	//alert("strYr:" + strYr + ", strYear:" + strYear + ", year:" + year + ", dtStr:" + dtStr);
	if (pos1 == -1 || pos2 == -1) {
	    maUI.dialog("Alert", "The date format should be : mm/dd/yyyy").then(function (res) {
	        return false;
	    });
	}
	if (strMonth.length<1 || month<1 || month>12){
	    maUI.dialog("Alert", "Please enter a valid month.").then(function (res) {
	        return false;
	    });
	}
	if (strDay.length < 1 || day < 1 || day > 31 || (month == 2 && day > daysInFebruary(year)) || day > daysInMonth[month]) {
	    maUI.dialog("Alert", "Please enter a valid day.").then(function (res) {
	        return false;
	    });
	}
	if (strYear.length != 4 || year == 0 || year < minYear || year > maxYear) {
	    maUI.dialog("Alert", "Please enter a valid 4 digit year between " + minYear + " and " + maxYear).then(function (res) {
	        return false;
	    });
	}
	if (dtStr.indexOf(dtCh, pos2 + 1) != -1 || isInteger(stripCharsInBag(dtStr, dtCh)) == false) {
	    maUI.dialog("Alert", "Please enter a valid date").then(function (res) {
	        return false;
	    });
	}
return true
}


if(typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, ''); 
  }
}

function validateDateField(fld, fldName, sectionToDisplay) {
	if (fld) {
		var dtStr = fld.value;
		if (dtStr.trim() == "") {
			fld.value = "";
		}
		else {
			dateIsOkay = true;
			errMsg = "";
			var daysInMonth = DaysArray(12)
			var pos1=dtStr.indexOf(dtCh)
			var pos2=dtStr.indexOf(dtCh,pos1+1)
			var strMonth=dtStr.substring(0,pos1)
			var strDay=dtStr.substring(pos1+1,pos2)
			var strYear=dtStr.substring(pos2+1)
			strYr=strYear
			if (strDay.charAt(0)=="0" && strDay.length>1) strDay=strDay.substring(1)
			if (strMonth.charAt(0)=="0" && strMonth.length>1) strMonth=strMonth.substring(1)
			for (var i = 1; i <= 3; i++) {
				if (strYr.charAt(0)=="0" && strYr.length>1) strYr=strYr.substring(1)
			}
			month=parseInt(strMonth)
			day=parseInt(strDay)
			year=parseInt(strYr)
			//alert("strYr:" + strYr + ", strYear:" + strYear + ", year:" + year + ", dtStr:" + dtStr);
			if (pos1==-1 || pos2==-1){
				dateIsOkay = false;
				errMsg = "The date format for " + fldName + " should be : mm/dd/yyyy";
			}
			if (strMonth.length<1 || month<1 || month>12){
				dateIsOkay = false;
				errMsg = "Please enter a valid month for " + fldName;
			}
			if (strDay.length<1 || day<1 || day>31 || (month==2 && day>daysInFebruary(year)) || day > daysInMonth[month]){
				dateIsOkay = false;
				errMsg = "Please enter a valid day of month for " + fldName;
			}
			if (strYear.length != 4 || year==0 || year<minYear || year>maxYear){
				dateIsOkay = false;
				errMsg = "Please enter a valid 4 digit year between " + minYear + " and " + maxYear + " for " + fldName;
			}
			if (dtStr.indexOf(dtCh,pos2+1)!=-1 || isInteger(stripCharsInBag(dtStr, dtCh))==false){
				dateIsOkay = false;
				errMsg = "Please enter a valid date for " + fldName;
			}

			if (!dateIsOkay) {
				alert(errMsg);
				if (sectionToDisplay) {
					sectionToDisplay.style.display = "block";
				}
				fld.focus();
				fld.select();
				return false;
			}
		}
	}
	return true;
}

/*****************************************************************
 * End date validation script.
 */




/***************BEGIN FUNCTIONS TO PREVENT NON-NUMERIC ENTRIES INTO FIELDS******************/

function getKeyCharCode(e) {
	if (navigator.appName.indexOf("Microsoft") != -1) {
		e = window.event;
		return e.keyCode;
	} else {
		return e.which;
	}
}


/*
Use in onKeyPress or onKeyDown JavaScript event handler on a textfield
to prevent entry of non-numeric characters.
<input type="text" name="decimalText" onKeyDown="return isDecimalKey(event);">
*/
function isNumericKey(e) {
	var charCode = e.keyCode;
	var charString = String.fromCharCode(charCode);
	var shiftKey = false;
	if (navigator.appName.indexOf("Microsoft") != -1) {
		shiftKey = e.shiftKey;
	}

	if (shiftKey == false &&
		(charString == "0" ||
	     charString == "1" || charString == "2" || charString == "3" ||
		  charString == "4" || charString == "5" || charString == "6" ||
		  charString == "7" || charString == "8" || charString == "9" ||
		  	  charString == "a" || // 1 on the number pad on right-side of keyboard
		  	  charString == "b" || // 2 on the number pad on right-side of keyboard
		  	  charString == "c" || // 3 on the number pad on right-side of keyboard
		  	  charString == "d" || // 4 on the number pad on right-side of keyboard
		  	  charString == "e" || // 5 on the number pad on right-side of keyboard
		  	  charString == "f" || // 6 on the number pad on right-side of keyboard
		  	  charString == "g" || // 7 on the number pad on right-side of keyboard
		  	  charString == "h" || // 8 on the number pad on right-side of keyboard
		  	  charString == "i" || // 9 on the number pad on right-side of keyboard
		  	  charString == "`" || // 0 on the number pad on right-side of keyboard
		  	  charString == "n" || // . on the number pad on right-side of keyboard
		  	  charCode==8  || // backspace
			  charCode==16 || // shift
			  charCode==9 || // tab
			  charCode==17 || // ctrl
			  charCode==18 || // alt
			  charCode==46 || // delete
			  charCode==36 || // home
			  charCode==35 || // end
			  charCode==37 || // left
			  charCode==39) ||
			  shiftKey == true && charCode==9)
	{
		return true;
	} else {
		return false;
	}
} // end function isNumericKey


/*
Extends isNumericKey to check for the decimal point.
*/
function isDecimalKey(e) {
	var charCode = getKeyCharCode(e);
	var charString = String.fromCharCode(charCode);
	var shiftKey = false;
	if (navigator.appName.indexOf("Microsoft") != -1) {
		shiftKey = e.shiftKey;
	}

	if ( isNumericKey(e) || (shiftKey == false && (charCode==110 || charCode==190)) || charString == "n" ) { // add dot sign to allowed characters
		return true;
	} else {
		return false;
	}
} // end isDecimalKey


/*
Extends isDecimalKey to check for the decimal point or minus sign.
*/
function isDecimalKeyWithNegatives(e) {
	var charCode = getKeyCharCode(e);
	var charString = String.fromCharCode(charCode);
	var shiftKey = false;
	if (navigator.appName.indexOf("Microsoft") != -1) {
		shiftKey = e.shiftKey;
	}
	//alert("charCode:" + charCode + " - charString:" + charString);

	if ( isDecimalKey(e) || (shiftKey == false && (charCode==109 || charCode==189)) ) { // add minus sign to allowed characters
		return true;
	} else {
		return false;
	}
} // end isDecimalKeyWithNegatives




/*
Use on onKeyUp JavaScript event handler to check if the field contains a valid decimal value.
If not, correct the field to have the specified format, size and precision.
decimal text field example:
<input type="text" name="decimalText" size="10" maxlength="100" onKeyDown="return isDecimalKey(event);" onKeyUp="checkDecimal(this, 3,2);">
*/
function checkDecimal(field, size, precision) {
	var fieldValue = field.value;

	var fieldAdjusted = false;
	var integralValue = null;
	var decimalValue = null;

	size = size - precision; // convert size to just the integral part

	var minusSplits = fieldValue.split("-");
	if (minusSplits.length > 1) {
		startAt = 0;
		newFieldValue = "";
		if (minusSplits[0] == "") {
			newFieldValue = "-";
			startAt = 1;
		}
		for (var j=startAt; j<minusSplits.length; j++) {
			newFieldValue = newFieldValue + minusSplits[j];
		}
		fieldValue = newFieldValue;
	}

	var splits = fieldValue.split(".");
	if (splits.length > 1) {
		integralValue = splits[0];
		if (integralValue == "") {
			integralValue = "0";
		}

		var i=1;
		do {
			decimalValue = splits[i];
		} while (++i<splits.length && decimalValue == "");
	} else {
		integralValue = fieldValue;
	}


	if (integralValue.length > size) {
		integralValue = integralValue.substring(0, size);
	}
	if (decimalValue != null && decimalValue.length > precision) {
		decimalValue = decimalValue.substring(0, precision);
	}

	if (splits.length > 1 && decimalValue != null) {
		fieldValue = integralValue + "." + decimalValue;
	} else {
		fieldValue = integralValue;
	}

	if (fieldValue != field.value) {
		field.value = fieldValue;
	}
} // end checkDecimal




/***************END FUNCTIONS TO PREVENT NON-NUMERIC ENTRIES INTO FIELDS******************/






/*************** BEGIN BROWSER DETECTION ******************/
var nom = navigator.appName.toLowerCase();
var agt = navigator.userAgent.toLowerCase();
var is_major   = parseInt(navigator.appVersion);
var is_minor   = parseFloat(navigator.appVersion);
var is_ie      = (agt.indexOf("msie") != -1);
var is_ie4up   = (is_ie && (is_major >= 4));
var is_not_moz = (agt.indexOf('netscape')!=-1)
var is_nav     = (nom.indexOf('netscape')!=-1);
var is_nav4    = (is_nav && (is_major == 4));
var is_mac     = (agt.indexOf("mac")!=-1);
var is_gecko   = (agt.indexOf('gecko') != -1);
var is_opera   = (agt.indexOf("opera") != -1);
/*************** END BROWSER DETECTION ******************/






/****** BEGIN FUNCTION FOR FIND ON PAGE ************/

var TRange = null;
var dupeRange = null;
var TestRange = null;
var win = null;

var is_rev=0
if (is_gecko) {
temp = agt.split("rv:")
is_rev = parseFloat(temp[1])
}



//  USE THE FOLLOWING VARIABLE TO CONFIGURE FRAMES TO SEARCH
//  (SELF OR CHILD FRAME)

//  If you want to search another frame, change from "self" to
//  the name of the target frame:
//  e.g., var frametosearch = 'main'

//var frametosearch = 'main';
var frametosearch = self;


function search(whichform, whichframe) {



if (is_ie4up && is_mac) return;

if (is_gecko && (is_rev <1)) return;

if (is_opera) return;


if(whichform.findthis.value!=null && whichform.findthis.value!='') {
       str = whichform.findthis.value;
       win = whichframe;
       var frameval=false;
       if(win!=self){
		   frameval=true;  // this will enable Nav7 to search child frame
		   win = parent.frames[whichframe];
		}
}

else return;

var strFound;


if(is_nav4 && (is_minor < 5)) {

  strFound=win.find(str); // case insensitive, forward search by default

}


if (is_gecko && (is_rev >= 1)) {

    if(frameval!=false) win.focus(); // force search in specified child frame
    strFound=win.find(str, false, false, true, false, frameval, false);

    if (is_not_moz)  whichform.findthis.focus();

}

 if (is_ie4up) {

  if (TRange!=null) {

   TestRange=win.document.body.createTextRange();

   if (dupeRange.inRange(TestRange)) {

   TRange.collapse(false);
   strFound=TRange.findText(str);
    if (strFound) {
        //the following line added by Mike and Susan Keenan, 7 June 2003
        win.document.body.scrollTop = win.document.body.scrollTop + TRange.offsetTop;
        TRange.select();
        }


   }

   else {

     TRange=win.document.body.createTextRange();
     TRange.collapse(false);
     strFound=TRange.findText(str);
     if (strFound) {
        //the following line added by Mike and Susan Keenan, 7 June 2003
        win.document.body.scrollTop = TRange.offsetTop;
        TRange.select();
        }



   }
  }

   if (TRange==null || strFound==0) {
   TRange=win.document.body.createTextRange();
   dupeRange = TRange.duplicate();
   strFound=TRange.findText(str);
    if (strFound) {
        //the following line added by Mike and Susan Keenan, 7 June 2003
        win.document.body.scrollTop = TRange.offsetTop;
        TRange.select();
        }


   }

 }

  if (!strFound) alert ("String '"+str+"' not found!") // string not found


}
/****** END FUNCTION FOR FIND ON PAGE ************/



function tabNext(field, threshold, nextField) {
	if (field.value.length == threshold) {
		nextField.focus();
	}
}

function tabNextIfEnterKey(e, field, threshold) {
	if (field.value.length >= threshold) {
		var charCode = e.keyCode;
		if (charCode == 13) {
			field.blur();
		}
	}
}


function validateNumeric(fieldName,fieldDisplayName) {
	field = eval("frm" + "['" + fieldName + "']");
	if (field) {
	}
	else {
		alert(fieldName); return false;
	}
	if (field.value != "") {
		if (String(parseFloat(field.value))=="NaN") {
			alert(fieldDisplayName + " must be a number."); field.focus(); return false;
		}
	}
}

function zeroIfNotNumber(num) {
    if (num) {
        num = num.replace(",", "");
    }
	if (String(parseFloat(num))=="NaN") {
		return 0;
	}
	else {
		return parseFloat(num);
	}
}

function formatCurrency(strValue) {
	strValue = strValue.toString().replace(/\$|\,/g,'');
	dblValue = parseFloat(strValue);

	blnSign = (dblValue == (dblValue = Math.abs(dblValue)));
	dblValue = Math.floor(dblValue*100+0.50000000001);
	intCents = dblValue%100;
	strCents = intCents.toString();
	dblValue = Math.floor(dblValue/100).toString();
	if(intCents<10)
		strCents = "0" + strCents;
	for (var i = 0; i < Math.floor((dblValue.length-(1+i))/3); i++)
		dblValue = dblValue.substring(0,dblValue.length-(4*i+3))+','+
		dblValue.substring(dblValue.length-(4*i+3));
	return (((blnSign)?'':'-') + '$' + dblValue + '.' + strCents);
}



function openWin(myWidth,myHeight,URL,name) {
	wkLeft = (window.screen.availWidth /2) - (600/2)
	wkTop = (window.screen.availHeight /2) - (700/2)


	strFeatures ="width=" + myWidth + ",height=" + myHeight + ",center=yes,titlebar=no,toolbar=no,scrollbars=yes,alwaysRaised=yes,resizable=yes"
			+ ",Top=" + wkTop + ",Left=" + wkLeft

	wkform = URL;

	window.open(wkform,name,strFeatures)
}


function textareaMaxLength(Object, MaxLen) {
  return (Object.value.length <= MaxLen);
}

function ismaxlength(obj){
	var mlength=obj.getAttribute? parseInt(obj.getAttribute("maxlength")) : "";
	if (obj.getAttribute && obj.value.length>mlength) {
		obj.value=obj.value.substring(0,mlength);
	}
}



function updateField(e, fieldId, theValue) {
	var $elem = $(e.currentTarget);
	var $frm = $elem.parents("form:first");
	var $theField = $frm.find("#" + fieldId);
	$theField.val(theValue);
}

function showHide(elemId) {
	if (document.getElementById(elemId)) {
		if (document.getElementById(elemId).style.display == "none") {
			document.getElementById(elemId).style.display = "block";
		}
		else {
			document.getElementById(elemId).style.display = "none";
		}
	}
}

function showHideTR(elemId) {
	if (document.getElementById(elemId)) {
		if (document.getElementById(elemId).style.display == "none") {
			document.getElementById(elemId).style.display = "table-row";
		}
		else {
			document.getElementById(elemId).style.display = "none";
		}
	}
}

function showHideInline(elemId) {
	if (document.getElementById(elemId)) {
		if (document.getElementById(elemId).style.display == "none") {
			document.getElementById(elemId).style.display = "inline";
		}
		else {
			document.getElementById(elemId).style.display = "none";
		}
	}
}

function showDiv(id) {
	document.getElementById(id).style.display = "block";
}

function showDivInline(id) {
	document.getElementById(id).style.display = "inline";
}

function hideDiv(id) {
	document.getElementById(id).style.display = "none";
}

function nothing() {
}


function roundNumber(num,dec) {
	result = Math.round(num * (10*dec))/(10*dec);
	return result;
}

function stripAlphaChars(pstrSource) { 
var m_strOut = new String(pstrSource); 
    m_strOut = m_strOut.replace(/[^0-9]/g, ''); 

    return m_sOut; 
}

function removeNonNumerics(field) {
	field.value = stripAlphaChars(field.value);
}





function listbox_move(listID, direction) {

    var listbox = document.getElementById(listID);
    var selIndex = listbox.selectedIndex;

    if(-1 == selIndex) {
	alert("Please select an option to move.");
	return;
    }

    var increment = -1;
    if(direction == 'up')
	increment = -1;
    else
	increment = 1;

    if((selIndex + increment) < 0 ||
	(selIndex + increment) > (listbox.options.length-1)) {
	return;
    }

    var selValue = listbox.options[selIndex].value;
    var selText = listbox.options[selIndex].text;
    listbox.options[selIndex].value = listbox.options[selIndex + increment].value
    listbox.options[selIndex].text = listbox.options[selIndex + increment].text

    listbox.options[selIndex + increment].value = selValue;
    listbox.options[selIndex + increment].text = selText;

    listbox.selectedIndex = selIndex + increment;
}


function listbox_selectall(listID, isSelect) {
	var listbox = document.getElementById(listID);
	for(var count=0; count < listbox.options.length; count++) {
	    listbox.options[count].selected = isSelect;
	}
}

function listbox_moveacross(sourceID, destID) {
    var src = document.getElementById(sourceID);
    var dest = document.getElementById(destID);

    for(var count=0; count < src.options.length; count++) {

	if(src.options[count].selected == true) {
		var option = src.options[count];

		var newOption = document.createElement("option");
		newOption.value = option.value;
		newOption.text = option.text;
		newOption.selected = true;
		try {
			 dest.add(newOption, null); //Standard
			 src.remove(count, null);
		 }catch(error) {
			 dest.add(newOption); // IE only
			 src.remove(count);
		 }
		count--;
	}
    }
}


function listbox_sort(id) {
	var lb = document.getElementById(id);
	arrTexts = new Array();

	for(i=0; i<lb.length; i++) {
	    arrTexts[i] = lb.options[i].text+':'+lb.options[i].value;
	}
	arrTexts.sort();
	for(i=0; i<lb.length; i++) {
	    el = arrTexts[i].split(':');
	    lb.options[i].text = el[0];
	    lb.options[i].value = el[1];
	} 
}



// GENERAL SORT FUNCTION:
// Sort on single or multi-column arrays.
// Sort set up for six colums, in order of u,v,w,x,y,z.   For single columns (single-dimensioned array), omit all u,v....
// Sort will continue only as far as the specified number of columns: "w,x" only sorts on two columns, etc.
// Sort will place numbers before strings, and swap until all columns are in ascending order.
// Sorter algorithm:
// Is result of a-b NaN?.  Then one or both is text.
//   Are both text?  Then do a general swap. Set var 'swap' to 1:0:-1, accordingly: 1 push up list, -1 push down.
//   Else one is text, the other a number.  Therefore, is 'a' text?  Then push up, else 'b' is text - push 'a' down.
// Else both are numbers.
// return result in var 'swap'.
// To do multi-columns, repeat the operations for each column.
// Should you wish to sort in mixed ascending/descending sort order (say col'm 0 ascending, col'm 1, descending

function SortArray(TheArr,us,u,vs,v,ws,w,xs,x,ys,y,zs,z){
// us-zs: 1=asc, -1=desc.  u-z: column-numbers.  See example

  if(u==undefined){TheArr.sort(Sortsingle);} // if this is a simple array, not multi-dimensional, ie, SortIt(TheArr,1): ascending.
  else{TheArr.sort(Sortmulti);}

  function Sortsingle(a,b){
    var swap=0;
    if(isNaN(a-b)){
      if((isNaN(a))&&(isNaN(b))){swap=(b<a)-(a<b);}
      else {swap=(isNaN(a)?1:-1);}
    }
    else {swap=(a-b);}
    return swap*us;
  }

  function Sortmulti(a,b){
  var swap=0;
    if(isNaN(a[u]-b[u])){
      if((isNaN(a[u]))&&(isNaN(b[u]))){swap=(b[u]<a[u])-(a[u]<b[u]);}
      else{swap=(isNaN(a[u])?1:-1);}
    }
    else{swap=(a[u]-b[u]);}
    if((v==undefined)||(swap!=0)){return swap*us;}
    else{
      if(isNaN(a[v]-b[v])){
        if((isNaN(a[v]))&&(isNaN(b[v]))){swap=(b[v]<a[v])-(a[v]<b[v]);}
        else{swap=(isNaN(a[v])?1:-1);}
      }
      else{swap=(a[v]-b[v]);}
      if((w==undefined)||(swap!=0)){return swap*vs;}
      else{
        if(isNaN(a[w]-b[w])){
          if((isNaN(a[w]))&&(isNaN(b[w]))){swap=(b[w]<a[w])-(a[w]<b[w]);}
          else{swap=(isNaN(a[w])?1:-1);}
        }
        else{swap=(a[w]-b[w]);}
        if((x==undefined)||(swap!=0)){return swap*ws;}
        else{
          if(isNaN(a[x]-b[x])){
            if((isNaN(a[x]))&&(isNaN(b[x]))){swap=(b[x]<a[x])-(a[x]<b[x]);}
            else{swap=(isNaN(a[x])?1:-1);}
          }
          else{swap=(a[x]-b[x]);}
          if((y==undefined)||(swap!=0)){return swap*xs;}
          else{
            if(isNaN(a[y]-b[y])){
              if((isNaN(a[y]))&&(isNaN(b[y]))){swap=(b[y]<a[y])-(a[y]<b[y]);}
              else{swap=(isNaN(a[y])?1:-1);}
            }
            else{swap=(a[y]-b[y]);}
            if((z=undefined)||(swap!=0)){return swap*ys;}
            else{
              if(isNaN(a[z]-b[z])){
                if((isNaN(a[z]))&&(isNaN(b[z]))){swap=(b[z]<a[z])-(a[z]<b[z]);}
                else{swap=(isNaN(a[z])?1:-1);}
              }
              else{swap=(a[z]-b[z]);}
              return swap*zs;
} } } } } } }



function checkRequiredFields(frm) {

	/********* BEGIN CHECK FOR REQUIRED FIELDS **********/
	for (var i = 0; i < frm.elements.length; i++) {
		var elem = frm.elements[i];
		elemLabel = "";
		alertReq = false;
		if (elem.getAttribute("label")) {
			elemLabel = elem.getAttribute("label");
		}

		//check required for text fields and textareas
		if (elem.type == "text" || elem.type == "textarea") {
		    if (elem.getAttribute("req")) {
		        itemVisible = true;
		        if (elem.style.display == "none") {
		            itemVisible = false;
		        }
		        if (elem.classList.contains("hidden")) {
		            itemVisible = false;
		        }
		        if (elem.getAttribute("req") == "True" && (elem.value == "" || elem.value == " ") && itemVisible) {
					alertReq = true;
					if (elem.getAttribute("section")) {
					    //If in hidden subsection, make sure field is visible before calling focus()
					    if (document.getElementById(elem.getAttribute("section")).style.display == "none") {
					        document.getElementById(elem.getAttribute("section")).style.display = "block";  
					    }
					    if (document.getElementById(elem.getAttribute("section")).classList.contains("hidden")) {
					        document.getElementById(elem.getAttribute("section")).classList.remove("hidden");
					    }
					}
					if (elem.getAttribute("onlyReqIfVisible")) {
						if (document.getElementById(elem.getAttribute("onlyReqIfVisible")).style.display == "none") {
							alertReq = false;
							document.getElementById(elem.getAttribute("section")).style.display = "none";
						}
						if (document.getElementById(elem.getAttribute("onlyReqIfVisible")).classList.contains("hidden")) {
						    alertReq = false;
						    document.getElementById(elem.getAttribute("section")).classList.add("hidden");
						}
					}
					if (alertReq) {
					    maUI.dialog("Alert", elemLabel + " is required").then(function () {
					        elem.focus();
					    });

						return false;
					}
				}
			}
		}

		//check required for single select dropdowns
		if (elem.type == "select-one") {
			if (elem.getAttribute("req")) {
				//alert if required but no options in list
				if (elem.options.length == 0) {
				    maUI.dialog("Alert", elemLabel + " is required but contains no options.").then(function () {
				        elem.focus();
				    });
					return false;
				}
				else {
					if (elem.getAttribute("req") == "True" && elem.options[elem.options.selectedIndex].value == "") {
						alertReq = true;
						if (elem.getAttribute("section")) {
						    //If in hidden subsection, make sure field is visible before calling focus()
						    if (document.getElementById(elem.getAttribute("section")).style.display == "none") {
						        document.getElementById(elem.getAttribute("section")).style.display = "block";
						    }
						    if (document.getElementById(elem.getAttribute("section")).classList.contains("hidden")) {
						        document.getElementById(elem.getAttribute("section")).classList.remove("hidden");
						    }
						}
						if (elem.getAttribute("onlyReqIfVisible")) {
							if (document.getElementById(elem.getAttribute("onlyReqIfVisible")).style.display == "none") {
								alertReq = false;
								document.getElementById(elem.getAttribute("section")).style.display = "none";
							}
							if (document.getElementById(elem.getAttribute("onlyReqIfVisible")).classList.contains("hidden")) {
							    alertReq = false;
							    document.getElementById(elem.getAttribute("section")).classList.add("hidden");
							}
						}
						if (alertReq) {
						    maUI.dialog("Alert", elemLabel + " is required").then(function () {
						        elem.focus();
						    });
							return false;
						}
					}
				}
			}
		}

		//check required for multi select dropdowns
		if (elem.type == "select-multiple") {
			if (elem.getAttribute("req")) {
				if (elem.getAttribute("req") == "True") {
					oneSelected = false;
					for (var j = 0; j < elem.options.length; j++) {
						if (elem.options[j].selected) {
							oneSelected = true;
						}
					}
					if (oneSelected == false) {
						alertReq = true;
						if (elem.getAttribute("section")) {
						    //If in hidden subsection, make sure field is visible before calling focus()
						    if (document.getElementById(elem.getAttribute("section")).style.display == "none") {
						        document.getElementById(elem.getAttribute("section")).style.display = "block";
						    }
						    if (document.getElementById(elem.getAttribute("section")).classList.contains("hidden")) {
						        document.getElementById(elem.getAttribute("section")).classList.remove("hidden");
						    }
						}
						if (elem.getAttribute("onlyReqIfVisible")) {
							if (document.getElementById(elem.getAttribute("onlyReqIfVisible")).style.display == "none") {
								alertReq = false;
								document.getElementById(elem.getAttribute("section")).style.display = "none";
							}
							if (document.getElementById(elem.getAttribute("onlyReqIfVisible")).classList.contains("hidden")) {
							    alertReq = false;
							    document.getElementById(elem.getAttribute("section")).classList.add("hidden");
							}
						}
						if (alertReq) {
						    maUI.dialog("Alert", elemLabel + " is required").then(function () {
						        elem.focus();
						    });
							return false;
						}
					}
				}
			}
		}

		//check required for checkboxes and radio buttons
		if (elem.type == "checkbox" || elem.type == "radio") {
			if (elem.getAttribute("req")) {
				if (elem.getAttribute("req") == "True") {
					chk = document.getElementsByName(elem.name);
					oneChecked = false;
					for (var j = 0; j < chk.length; j++) {
						if (chk[j].checked) {
							oneChecked = true;
						}
					}
					if (oneChecked == false) {
					    if (elem.getAttribute("section")) {
					        //If in hidden subsection, make sure field is visible before calling focus()
					        if (document.getElementById(elem.getAttribute("section")).style.display == "none") {
					            document.getElementById(elem.getAttribute("section")).style.display = "block";
					        }
					        if (document.getElementById(elem.getAttribute("section")).classList.contains("hidden")) {
					            document.getElementById(elem.getAttribute("section")).classList.remove("hidden");
					        }
						}
					    maUI.dialog("Alert", elemLabel + " is required").then(function () {
					        elem.focus();
					    });
						return false;
					}
				}
			}
		}
	}
	/********* END CHECK FOR REQUIRED FIELDS **********/

	return true;
}