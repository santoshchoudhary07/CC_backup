/*************************************************************************
**	Requires reference to common.js
**
**
/************************************************************************/

var gblStringToolTipPhoneNumber='Enter the 10 digits of the phone number, no dashes.';
var gblStringToolTipEmail = 'Please enter a valid email address';
var gblStringToolTipSSN = 'Please enter a valid social security number';
var gblStringToolTipLastActualScheduledRentIncrease = 'The effective date of the last official rent increase for this resident. Note that an \"official\" rent increase is the annual increase with notice; manual rent adjustments are not reflected.';
var gblStringToolTipNextScheduledRentIncrease = 'The programmed date of the next official rent increase for this resident. If an increase is not programmed for this site, it will show \"Not Scheduled.\"';
var gblStringToolTipNextAnticipatedRentIncrease = 'The next time this resident should receive an official rent increase. Note that an \"official\" rent increase is the annual increase with notice; manual rent adjustments are not reflected.';
var gblStringToolTipNoChangeSOSIfNoQSCompleted = 'Since no Quickscreen application was completed, the SOS may not be changed.';
/*
var gblWindowEvt;
if (window.captureEvents){
	window.captureEvents(Event.MOUSEDOWN);
	window.onclick=sourceCheck;
}
else
{
	document.onclick=sourceCheck;
}

function sourceCheck(e){
	gblWindowEvt=(typeof event!=='undefined')? event.srcElement : e.target
	if (gblWindowEvt.tagName=='IMG')
	{
		window.onclick=false;
	}
}

function fnLockTT()
{

	return null;
	if((event.button==1||event.button==2)&&document.getElementById('bTTOnFocus').value==1)
	{
		return false;
	}
	else
	{
		return true;
	}

e = window.event
e.cancelBubble = true;
//alert()
}
document.onmousedown=noClick
document.onmouseup=noClick
document.onclick=noClick
*/





/*************************************************************************
**	Function:fnFmtNum()
*/
function fnFmtNum(oObj, bNumString)
{
	var myNum = ((oObj.value).toString()).replace(/[^0-9]/gi,'');
//	alert(myNum)
//	var myNum = pureNumber(oObj.value, bNumString?'':0);
//	oObj.value = !bNumString?Math.abs(parseInt(myNum,10)):(myNum.toString()).replace(/[^\[0-9]/gi,'');
}

/*************************************************************************
**	Function:fnFormatPhoneNumber()
*/
function fnFormatPhoneNumber(oObj)
{
	var sValue = ((oObj.value).toString()).replace(/[^0-9]/gi,'');

	if (oObj.getAttribute('isDirty'))
	{

		if (oObj.getAttribute('isDirty')=='1')
		{

			//fnFmtNum(oObj, true);

			if(trim(sValue)!='')
			{
				if ((sValue).length<10)
				{		
					oObj.value=sValue;
					window.setTimeout(function(){
						oObj.focus();
						oObj.select();
                			},0);
				}
				else
				{
					oObj.value='('+(sValue).substr(0,3)+')'+(sValue).substr(3,3)+'-'+(sValue).substr(6,4);
				}
			}
			else
			{
				oObj.value='';
			}
		}
	}
}

/*************************************************************************
**	Function:fnEmailIsValidAndNotBlank ()
*/
function fnEmailIsValidAndNotBlank (fldEmail, sDefaultResEmail, sAlert)
{
	// fldEmail = document.getElementById("txtEmail");

	if (fldEmail.value == ""){
	    if (sDefaultResEmail != ""){
	        alert(sAlert);
	        fldEmail.value=sDefaultResEmail;
	        fldEmail.focus();
	        fldEmail.select();
	        return false;
		}
	}
	else {
		if (!emailCheck(fldEmail.value)) {
			alert("Please note that you have entered an invalid email address into the \"Email\" field.  Please correct your entry before proceeding.");
			fldEmail.focus();
			fldEmail.select();
			return false;
		}
	}
	
	return true;

}

/*************************************************************************
**	Function:fnFormatEmail()
*/
function fnFormatEmail(oObj)
{
	//document.getElementById('bTTOnFocus').value=0;
	var sValue = ((oObj.value).toString());

	if (oObj.getAttribute('isDirty'))
	{
		if (oObj.getAttribute('isDirty')=='1')
		{
			fnFmtNum(oObj, true);

			if(trim(sValue)!='')
			{
				if (emailCheck(sValue))
				{
				}
				else
				{
					//document.getElementById('bTTOnFocus').value=1;
					oObj.focus();
					oObj.select();
				}
			}
			else
			{
			}
		}
	}
}

/*************************************************************************
**	Function:fnFormatEmail()
*/
function fnFormatSSN(oObj)
{
	//document.getElementById('bTTOnFocus').value=0;
	var sValue = ((oObj.value).toString());

	if (oObj.getAttribute('isDirty'))
	{
		if (oObj.getAttribute('isDirty')=='1')
		{
			fnFmtNum(oObj, true);

			if(trim(sValue)!='')
			{
				if (ssnCheck(sValue))
				{
					//add dashes if missing
					ssn = sValue;
					if (ssn.indexOf("-") == -1) {
						ssn = String(ssn).substring(0,3) + "-" + String(ssn).substring(3,5) + "-" + String(ssn).substring(5,9);
					}
					oObj.value = ssn;
				}
				else
				{
					//document.getElementById('bTTOnFocus').value=1;
					oObj.value = "";
					oObj.focus();
				}
			}
			else
			{
			}
		}
	}
}

function emailCheck(str) {

	var at="@"
	var dot="."
	var lat=str.indexOf(at)
	var lstr=str.length
	var ldot=str.indexOf(dot)
	if (str.indexOf(at)==-1){
	   return false
	}

	if (str.indexOf(at)==-1 || str.indexOf(at)==0 || str.indexOf(at)==(lstr - 1)){
	   return false
	}

	if (str.indexOf(dot)==-1 || str.indexOf(dot)==0 || str.indexOf(dot)==(lstr -1)){
	    return false
	}

	 if (str.indexOf(at,(lat+1))!=-1){
	    return false
	 }

	 if (str.substring(lat-1,lat)==dot || str.substring(lat+1,lat+2)==dot){
	    return false
	 }

	 if (str.indexOf(dot,(lat+2))==-1){
	    return false
	 }

	 if (str.indexOf(" ")!=-1){
	    return false
	 }
	 return true					
}

function ssnCheck(ssn) {
	var matchArr = ssn.match(/^(\d{3})-?\d{2}-?\d{4}$/);
	var numDashes = ssn.split('-').length - 1;
	if (matchArr == null || numDashes == 1) {
		return false;
	}
	else {
		if (parseInt(matchArr[1],10)==0) {
			return false;
		}
		else {
			return true;
		}
	}
}

/*************************************************************************
**	Function:fnPopToolTip()
*/
function fnPopToolTip(oObj, bDisplay, sInnerText)
{	
	if (oObj.readOnly!=true)
	{
		var oToolTip		= document.getElementById('oToolTip');
		var oToolTipText	= document.getElementById('oToolTipText');

		if(document.all){
			oToolTipText.innerText=sInnerText;
		}else{
			oToolTipText.textContent=sInnerText;
		}

		oToolTip.style.left = absRight(oObj) - (oToolTip.offsetWidth+oObj.offsetWidth) + "px";
		oToolTip.style.width = absRight(oObj) - absLeft(oObj) + "px";

		oToolTip.style.display = bDisplay?'block':'none';	
		oToolTip.style.top = absTop(oObj) - (oToolTip.offsetHeight) + "px";
	}
}

/*************************************************************************
**	Function:fnInitNumEntry()
*/
function fnInitNumEntry(oObj,bSelect)
{
	if (oObj.getAttribute('isDirty'))
	{
		if (oObj.getAttribute('isDirty')=='1')
		{
			oObj.value=fnCleanNum(oObj.value);
			bSelect?oObj.select():null;
		}
		else if (trim(oObj.value)!='')
		{
			oObj.select();
		}
		
	}
}

/*************************************************************************
**	Function:fnCleanNum()
*/
function fnCleanNum(sNum)
{
	return sNum.replace(/[^\.|0-9]/gi,'');
}

/*************************************************************************
**	Function:fnCleanNum()
*/
function	fnValidateTT()
{
	return (document.getElementById('bTTOnFocus').value==0);
}
