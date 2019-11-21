/*****
	FORM VALIDATION
*****/
function fnSetErrorStyle(oObj, bIsErr)
{
	if (bIsErr)
	{
		oObj.style.backgroundColor='#f3e999';
		oObj.style.color='red';
		if (oObj.type!='radio')
		{
			oObj.style.borderTop='1px solid #abadb3';
			oObj.style.borderLeft='1px solid #dbdfe6';
			oObj.style.borderRight='1px solid #dbdfe6';
			oObj.style.borderBottom='1px solid #e3e9ef';	
		}
	}
	else
	{
		oObj.style.backgroundColor='#ffffff';
		oObj.style.color='#000000';
		if (oObj.type!='radio')
		{
			oObj.style.borderTop='1px solid #abadb3';
			oObj.style.borderLeft='1px solid #dbdfe6';
			oObj.style.borderRight='1px solid #dbdfe6';
			oObj.style.borderBottom='1px solid #e3e9ef';	
		}
	}
}

/*****
	FORM VALIDATION
*****/
function fnValidateRequiredFields(aRqFld)
{
	var iErr=0;
	for(var x=0;x<aRqFld.length;x++)
	{
		var oElem = document.getElementsByName(aRqFld[x]);

		for(var e=0;e<oElem.length;e++)
		{
			if((oElem[e].tagName=='INPUT'&&oElem[e].type=='text')||oElem[e].tagName=='TEXTAREA')
			{
				fnSetErrorStyle(oElem[e],trim(oElem[e].value)=='');
				iErr+=trim(oElem[e].value)==''?1:0;
			}
			else if(oElem[e].tagName=='INPUT'&&oElem[e].type=='radio')
			{
				var oRadio = oElem;
				var bChecked = false;
				for (var r=0;r<oRadio.length;r++)
				{
					if (oRadio[r].checked)
					{
						bChecked = true;
						break;
					}
				}

				iErr+=bChecked?0:1;
				
				for (var r=0;r<oRadio.length;r++)
				{
					fnSetErrorStyle(oRadio[r],!bChecked);
				}
			}
			else if(oElem[e].tagName=='SELECT')
			{
				fnSetErrorStyle(oElem[e],trim(oElem[e].value)=='');
				iErr+=trim(oElem[e].value)==''?1:0;
			}
		}
	}
	
	return iErr;
}