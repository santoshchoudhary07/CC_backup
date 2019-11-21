
	function enc_control_config(objID){
		//automatically set based on current state (mask value exists or not)
		var obj = document.getElementById(objID);	
		if(obj) {
			var objValueSection = obj.children["enc_control_value_section"];	
			var objMask = objValueSection.children["enc_control_mask"];		
			//if there is no original data, or the control is readonly,
			//then hide all "dynamic edit" options
				
			if((objMask.value=="" || obj.readonly)) {		
				obj.className = obj.className.replace("optional",""); //set the class as if it was a REQUIRE version (no check box)
				//but only make it editable, if it is not readonly
				enc_toggle_edit(objID,!obj.readonly); //set it to EDIT mode.
			}else {
				enc_toggle_edit(objID,false); //set it to RO mode
			}		
		}
	}

	function enc_toggle_edit(objID,isEdit,hold,evt){
		var ev=window.event || evt; //non-ff:ff

		var obj = document.getElementById(objID);		
		//if we were requested to HOLD the last state, then ignore this request
		if(obj.getAttribute("hold")){
			if(!hold){
				obj.setAttribute("hold",false); //but only once!
			}
			return;
		}
		
		var objEdit = obj.children["enc_control_edit"];
		var objValueSection = obj.children["enc_control_value_section"];
		var objMask = objValueSection.children["enc_control_mask"];
		var objData = objValueSection.children["enc_control_data"];
		var objNoteSection = obj.children["enc_control_note_section"];
		var objNote = objNoteSection.children["enc_control_note"];				
		//state logic:................................................
		//if the control is readonly, then force isEdit to be false!
		if(obj.readonly){
			isEdit = false;
		}	else {
			//if MASK is blank (no original value), force isEdit to be true 
			if(objMask.value==""){  
				isEdit = true;
			}
		}
		//.............................................................
		
		objEdit.checked = isEdit; //may seem redundant, but this can be called from other methods then "onclick" of the edit control		
		objMask.style.display = isEdit?"none":"inline";
		objData.style.display = isEdit?"inline":"none";
		objNote.innerText = isEdit?objNote.getAttribute("edit_message"):objNote.getAttribute("mask_message");
		if(isEdit) {
			//only set the focus, if objData is not the source of this event (don't want to be trapped inside!)
			var bSetFocus = true;
			if(ev){					
				var tmpSrcElem = ev.srcElement || ev.target;
				if(tmpSrcElem==objData || ev==null){
					bSetFocus = false;
				}
			}
			if(bSetFocus){
				try{
					objData.focus();				
				}catch(e){
					//guess we couldn't set the focus... oh well.
				}
			}
			enc_toggle_warning(objID);
		} else {			
			var objWarning = objNoteSection.children["enc_control_warning"];
			objWarning.style.display = "none";
			if(objNote.innerText!=""){
				objNote.style.display = "block";
			}
		}
		
		//lock this setting in place (ignore the next toggle event request)
		if(hold){
			obj.hold = true;
		}		
	}
	
	function enc_toggle_warning(objID){		
		var obj = document.getElementById(objID);
		var objValueSection = obj.children["enc_control_value_section"];
		var objMask = objValueSection.children["enc_control_mask"];
		//if there was not previously saved data (i.e. the MASK value is empty)
		//then there is no need to do anything with the warning...
		if(trim(objMask.value)!="") {
			var objData = objValueSection.children["enc_control_data"];
			var objNoteSection = obj.children["enc_control_note_section"];
			var objWarning = objNoteSection.children["enc_control_warning"];		
			var objNote = objNoteSection.children["enc_control_note"];
			objWarning.style.display = trim(objData.value)==""?"block":"none";
			objNote.style.display = trim(objData.value)==""?"none":"block";			
		}
	}
	

/////////////////////////////////////////////////////////////
// formatting, helper functions
/////////////////////////////////////////////////////////////

	//this should be used on the "onkeypress" event with a **return** values
	//example: <input onkeypress="return fnBuildSSN(this)" value=""/>
	function fnBuildSSN(obj,evt){
		var s = obj.value;
		var ev=window.event || evt; //non-ff:ff
		var kc = ev.keyCode || ev.charCode;  //non-ff:ff
		if(kc >= 48 && kc <= 57 && obj.value.length<=10){
			s += String.fromCharCode(kc);
		}

		var numVal = s.replace(/[^0-9]/gi,"");
		var ssn = numVal.substring(0,3);
		if(numVal.length>=3) ssn += "-";
		ssn += numVal.substring(3,5);
		if(numVal.length>=5) ssn += "-";
		ssn += numVal.substring(5,9);
	
		obj.value = ssn;
		return false; //cancel all updates
	}

/////////////////////////////////////////////////////////////
// Added for blur function for androids as onkey returns 
// a non standard key-code.
/////////////////////////////////////////////////////////////
function fnFormatIssuedPernr(elem,ctryVal) 
{
	var retVal='';
	if (!ctryVal){ctryVal="USA";}
	var sSocialNumber = ((elem.value).toString()).replace(/[^0-9]/gi, "")
	var focusElem = false;
	var maxLength=(!elem.getAttribute("maxlength"))?9:elem.getAttribute("maxlength");

	if (((sSocialNumber).toString()).length == maxLength) {
		if (ctryVal == 'CAN') {
		    retVal = (sSocialNumber).substr(0, 3) + '-' + (sSocialNumber).substr(3, 3) + '-' + (sSocialNumber).substr(6, 3);
		}else {
		    retVal = (sSocialNumber).substr(0, 3) + '-' + (sSocialNumber).substr(3, 2) + '-' + (sSocialNumber).substr(5, 4);
		}
	}else{
		if(((sSocialNumber).toString()).length > 0){
			focusElem=true;
			retVal=sSocialNumber;
		}else{
			retVal=""
		}
	}
	elem.value=retVal;

	if(focusElem){	
		elem.select();
		elem.focus();
	}
}

function fnCleanPernr(elem) 
{
	elem.value=((elem.value).toString()).replace(/[^0-9]/gi, "");
	elem.select();
}