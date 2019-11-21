<%
'~~~~~
'	Enhancement: 2.0a
'~~~~~
function fnConvertToNumeric(vString)
   dim	sNumeric, _
			sChar, _
			sTmp, _
			iCnt

	if not isNull(vString) then
		if len(vString)>0 then
			sNumeric = "0123456789"
			sTmp = ""
	 
			for iCnt = 1 to len(vString)
				  sChar = mid(vString, iCnt, 1)
				  if instr(sNumeric, sChar) then
						sTmp = sTmp & sChar
				  end if
			next
		else
			sTmp = ""
		end if
	else
		sTmp = ""
	end if
   fnConvertToNumeric = sTmp
end function

function fnFormatPhoneNumber(vString)
	if len(vString)<10 and len(vString)>0 then
		vString = right("0000000000"&vString,10)
	elseif len(vString)>10 then
		vString = right(vString,10)
	end if

	if len(vString)=10 then
		fnFormatPhoneNumber = "("&left(vString,3)&")"&mid(vString,4,3)&"-"&right(vString,4)
	else
		fnFormatPhoneNumber = vString
	end if
end function
'~~~~~
%>