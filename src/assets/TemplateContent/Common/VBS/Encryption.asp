<%
dim gblEnc_Control_Warning_Text
dim gblEnc_Control_Note_Mask_Text
dim gblEnc_Control_Note_Edit_Text

'set the default GLOBAL values for control TEXT
'gblEnc_Control_Warning_Text="WARNING: leaving the value blank will DELETE any previously saved data"
gblEnc_Control_Warning_Text="WARNING: leaving the value blank or incomplete will DELETE any previously saved data."
gblEnc_Control_Note_Mask_Text="check the box to edit."
gblEnc_Control_Note_Edit_Text="uncheck box to undo edit."


'////////////////////////////////////////////////////////////////
'START: ENCRYPTION FUNCTIONS
function MaskData(value)
	'call the mask data custom with default values
	MaskData = MaskDataCustom(value,"*",4)
end function

function MaskDOB(value)
	'try to evaluate the value as a date		
	if isdate(value) and NOT(isnumeric(value)) then
		MaskDOB = year(cdate(value))
	else
		'if it has already been stripped of Month/Day...
		if isnumeric(value) and len(trim(value))=4 then
			'just return it
			MaskDOB = trim(value)
		else
			'any other value gets evaluated like any other MASK
			MaskDOB = MaskData(value)
		end if
	end if
end function

function MaskDataCustom(value,maskChar,showAtEnd)
	dim maskCount
	dim showCount

	if isnull(value) then
		MaskDataCustom = ""
		exit function
	end if
	if trim(value)="" then
		MaskDataCustom = ""
		exit function
	end if

'	'if the value evaluates to a DATE VALUE, then do special formatting	
'	if isdate(value) and NOT(isnumeric(value)) then
'		'simply return the YEAR of the date
'		MaskDataCustom = year(cdate(value))
'		exit function
'	end if
	
	if len(value)<showAtEnd then
		showCount = 0
	else
		showCount = showAtEnd
	end	if	
	maskCount = len(value)-showCount
	if maskCount<showAtEnd then
		showCount = len(value)-maskCount
	end if	
	if maskCount < showCount then
		'swap em
		dim t 
		t = maskCount
		maskCount = showCount
		showCount = t
	end if
	MaskDataCustom = string(maskCount,maskChar) & right(value,showCount)
end function

'END: ENCRYPTION FUNCTIONS
'////////////////////////////////////////////////////////////////
%>