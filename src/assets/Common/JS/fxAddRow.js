function addRow(objTable){
	/****************************************************************
	Version:
	========
	1.0

	Created:
	=========
	04/04/2002 (brice)
	
	Input:
	=======
	objTable as TABLE Object
	
	Usage:
	=======
	Adds a Row to the end of the provided table based on the pre-defined
	"template" row (within the given table).
	
	Requirements:
	==============
	There must be a TR with "id='template'" inside of the table - Use
	a stylesheet to hide: <Style> #template {display:none;} </Style>.
	
	Notes:
	======
	This function DOES NOT use counters as in previous versions
	This function will simple ADD the exact template Over and Over, creating
	an Array for EACH field named in the template. It is up to the programmer
	to figure out what items are to be used or not.
	
	** REMEMBER!!! checkboxes and optionButtons DO NOT SUBMIT IF NOT CHECKED!!! **
	
	If you want to check for "Delete" rows (for example), you must either set a
	value to the check box, or add a hidden field to flag the deletion.
	
	*****************************************************************/

	//var objTemplate = objTable.all("template");//find the template
	//var oTR = objTemplate.cloneNode(true);//make copy of template
	//objTable.tBodies(0).appendChild(oTR);//add copy to bottom of Table
	//oTR.id="";//remove "template" identifier	
	var oTable = document.all(objTable);
	var oTemplate = oTable.all("template");
	var oBody = oTable.tBodies[0];
	var oNewRow = oTemplate.cloneNode(true);
	oBody.appendChild(oNewRow);
	oNewRow.style.display="block";
	
	//remove the named id					
	oNewRow.id="";								}

function fnResetFormElement(oFormElem)	{
	if (oFormElem.defvalue!=null)			{
		oFormElem.value = oFormElem.defvalue;			}				}

function fnAddRow(sTableId, sTemplateId, bSimpleAddRow, sAddRowCounter, bResetFormElements)			{
	var oTable = document.all(sTableId);
	var oBody = oTable.tBodies[0];
	var oTemplate = oTable.all(sTemplateId);
	var oNewRow = oTemplate.cloneNode(true);
	var oAddRowCounter = document.all(sAddRowCounter);
	var aTmp;
	var sTmp;
	
	if(oTable&&oTemplate)		{
		if (!bSimpleAddRow&&oAddRowCounter)			{
				oAddRowCounter.value=parseInt(oAddRowCounter.value)+1;
				//loop through all elements and append counter
				var oElem = oNewRow.getElementsByTagName('*');
				for(var y=0;y<oElem.length;y++)			{
					if(trim(oElem(y).id)!='')		{ 
						aTmp = (oElem(y).id).split('_');
						sTmp = aTmp.length?aTmp[0]+'_'+oAddRowCounter.value:aTmp;
						oElem(y).id = sTmp;
						//alert(sTmp)
						if (oElem(y).name!=null)			{
							oElem(y).name = sTmp;				}
						
						if (bResetFormElements)		{
							
							fnResetFormElement(oElem(y));		}		}		}		}

		oNewRow.style.display="block";
		oBody.appendChild(oNewRow);
		oNewRow.id="";						}		}