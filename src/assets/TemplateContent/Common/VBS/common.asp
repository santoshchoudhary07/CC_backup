<%
dim gblStringToolTipPhoneNumber, gblStringToolTipEmail, gblStringToolTipSSN, gblStringToolTipLastActualScheduledRentIncrease, gblStringToolTipNextScheduledRentIncrease, gblStringToolTipNextAnticipatedRentIncrease, gblStringToolTipNoChangeSOSIfNoQSCompleted
dim jsVersion, versionForIncludes

gblStringToolTipPhoneNumber="Enter the 10 digits of the phone number, no dashes."
gblStringToolTipEmail = "Please enter a valid email address"
gblStringToolTipSSN = "Please enter a valid social security number"
gblStringToolTipLastActualScheduledRentIncrease = "The effective date of the last official rent increase for this resident. Note that an ""official"" rent increase is the annual increase with notice; manual rent adjustments are not reflected."
gblStringToolTipNextScheduledRentIncrease = "The programmed date of the next official rent increase for this resident. If an increase is not programmed for this site, it will show ""Not Scheduled."""
gblStringToolTipNextAnticipatedRentIncrease = "The next time this resident should receive an official rent increase. Note that an ""official"" rent increase is the annual increase with notice; manual rent adjustments are not reflected."
gblStringToolTipNoChangeSOSIfNoQSCompleted = "Since no Quickscreen application was completed, the SOS may not be changed."
versionForIncludes = "1.0.0" '*** This will be used for all javascript and css includes.  So if you make an update to a javascript or css file, changing this value will force user's browsers to clear their cache of that file.  We may decide to pull this value from the database.

'/////////////////////////////////////////////////////////////////////
function formatDateRange(dFrom,dTo)
	if(not isnull(dFrom))then
		if( isnull(dTo) ) then
			formatDateRange = formatDate(dFrom) & " on "
		else
			formatDateRange = formatDate(dFrom) & " - "& formatDate(dTo)
		end if
	end if
end function

function formatDollar(n,dec)
	if not isnull(n) then
		formatDollar = "$" & formatnumber(n,dec)
	end if
end function

function formatDecimalsNoCommas(n,dec)
	if isnumeric(n) then
		formatDecimalsNoCommas = formatnumber(n, dec, -1, 0, 0)
	else
		formatDecimalsNoCommas = null
	end if
end function

function formatDate(d)
	if not isnull(d) then
		formatDate = month(d) &"/"& day(d) &"/"& right(year(d),2)
	end if
end function

function fmtMethodAmount(amount, method)
	select case method
		case 0:
			'fmtMethodAmount = "..."
			fmtMethodAmount = ""
		case 1:
			fmtMethodAmount = formatpercent(amount)
		case 2:
			fmtMethodAmount = "$" & formatnumber(amount,2)
	end select
end function

function methodName(i)
	select case i
		case 0:
			methodName = "Total Balance Due"
		case 1:
			methodName = "Percent of Balance"
		case 2:
			methodName = "Not to Exceed"
	end select
end function

function createSelectList(rs, valueField, textField, selectedValue)
	dim sReturn
	while not rs.eof
		sReturn = sReturn &  "<option "
		if(trim(cstr(selectedValue)) = trim(cstr(rs(valueField).value)) )then
			sReturn = sReturn &  "selected "
		end if
		sReturn = sReturn & "value="""
		sReturn = sReturn & trim(cstr(rs(valueField).value))
		sReturn = sReturn & """>"
		sReturn = sReturn & trim(cstr(rs(textField).value))
		sReturn = sReturn & "</option>"
		sReturn = sReturn & vbnewline
		rs.movenext
	wend
	createSelectList = sReturn
end function

function ifBlank(val,altVal)
	if trim(val)="" then
		ifBlank = altval
	else
		ifBlank = val
	end if
end function

function ifNull(val,altVal)
	if isnull(val) then
		ifNull = altval
	else
		ifnull = val
	end if
end function

function iif(val, ifTrue, ifFalse)
	if(val)then
		iif = ifTrue
	else
		iif = ifFalse
	end if
end function

function sqlNum(v)
    If cstr(ifNull(v, "")) = "" Then
        sqlNum = "NULL"
    Else
        sqlNum = replace(v, ",", "")
    End If
end function

Function sqlText(v)', nullVal)
    If cstr(ifNull(v, "")) = "" Then
        sqlText = "NULL"
    Else
        sqlText = "'" & Replace(v, "'", "''") & "'"
    End If
End Function

Function noNull(var, ifNull)
    If (IsNull(var)) Then
		noNull = ifNull
    Else
        noNull = var
    End If
End Function

function fnConvertToHTML(sStr)
	sStr = ifNull(sStr, "")
	sStr = replace(sStr,"'", "&#39") 'REPLACE APOSTRAPHE TO ASCII
	sStr = replace(sStr,chr(34), "&#34") 'REPLACE APOSTRAPHE TO ASCII
	'sStr = replace(sStr,"<", "&#60") 'REPLACE I DUNNO WHAT THIS IS TO ASCII
	'sStr = replace(sStr,">", "&#62") 'REPLACE I DUNNO WHAT THIS IS TO ASCII
	sStr = replace(sStr,vbnewline, "<BR>") 'REPLACE CARRIAGE RETURN TO ASCII
	sStr = replace(sStr,chr(10), "<BR>") 'REPLACE LINE FEED TO ASCII

	fnConvertToHTML = sStr
end function

function fnConvertTextToHTML(lclString)
	if isNull(lclString) then
		fnConvertTextToHTML=""
	else
		fnConvertTextToHTML = replace(replace(replace(lclString,">","&gt;"),"<","&lt;"),chr(34),"&quot;")
	end if
end function

function validateDate(dFieldVal, dFieldDesc)
	retMsg = ""
	if isdate(dFieldVal) = false then
		retMsg = "Unable to save this form because the " & dFieldDesc & " is invalid."
	else
		if instr(dFieldVal, "/") = 0 or instr(instr(dFieldVal, "/") + 1, dFieldVal, "/") = 0 then
			retMsg = "Unable to save this form because the " & dFieldDesc & " is invalid.  The date format should be: mm/dd/yyyy."
		end if
		if year(cdate(dFieldVal)) < 1900 or year(cdate(dFieldVal)) > 2200 then
			retMsg = "Unable to save this form because the " & dFieldDesc & " is invalid.  The year must be a 4-digit year between 1900 and 2200."
		end if
	end if
	validateDate = retMsg
end function

function isMobile()
	dim u, b, v
	set u=Request.ServerVariables("HTTP_USER_AGENT")
	set b=new RegExp
	set v=new RegExp
	'DAVE HERE: I added |android|ipad|playbook|sil to the end of b.Pattern below because it was not detecting tablets
	b.Pattern="(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|sil"
	v.Pattern="1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-"
	b.IgnoreCase=true
	v.IgnoreCase=true
	b.Global=true
	v.Global=true
	if b.test(u) or v.test(Left(u,4)) then 
		isMobile = true
	else
		isMobile = false
	end if
end function

function isOldIE()
	dim u
	u=Request.ServerVariables("HTTP_USER_AGENT")
	if instr(lcase(u), "msie 5") > 0 or instr(lcase(u), "msie 6") > 0 or instr(lcase(u), "msie 7") > 0 or instr(lcase(u), "msie 8") > 0 or instr(lcase(u), "msie 9") > 0 or instr(lcase(u), "msie 10") > 0 or instr(lcase(u), "trident/5")>0 or instr(lcase(u), "trident/4")>0 or instr(lcase(u), "trident/6")>0 then
		isOldIE = true
	else
		isOldIE = false
	end if
end function

function GetCompatibleMeta()
	if not isOldIE then
		GetCompatibleMeta="Edge"
	else
		GetCompatibleMeta="Edge"
	end if
end function

function CleanTheString(theString)
  'msgbox thestring
      strAlphaNumeric = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"'Used to check for numeric characters.
      For i = 1 to len(theString)
          strChar = mid(theString,i,1)
          If instr(strAlphaNumeric,strChar) Then
              CleanedString = CleanedString & strChar
          End If
      Next
      'msgbox cleanedstring
      CleanTheString = CleanedString
end function
    
function IsIE()
	dim usr_agent, isBrowserIE
	usr_agent = request.serverVariables("HTTP_USER_AGENT")
	isBrowserIE = false
	if InStr(usr_agent,"MSIE") > 0 then
		isBrowserIE = true
	end if
	if InStr(usr_agent,"Windows NT") > 0 and InStr(usr_agent,"rv:11") > 0 then
		isBrowserIE = true
	end if
    IsIE = isBrowserIE
end function
%>