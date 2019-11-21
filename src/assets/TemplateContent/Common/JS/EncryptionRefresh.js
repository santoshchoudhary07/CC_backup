
	function enc_control_config(container, objID){
		//automatically set based on current state (mask value exists or not)
	    var $obj = $(container).find("#" + objID + ', .' + objID);
	    var obj = $obj[0];
	    if (obj) {
	        var $objValueSection = $obj.find("div.enc_control_value_section");

	        var $objMask = $objValueSection.find("div.enc_control_mask");

			//if there is no original data, or the control is readonly,
			//then hide all "dynamic edit" options
				
	        if (($objMask.find("input").val() == "" || $objMask.find("input").prop("readonly") == true)) {
				//but only make it editable, if it is not readonly
	            enc_toggle_edit(container, objID, !$objMask.find("input").prop("readonly")); //set it to EDIT mode.
			}else {
	            enc_toggle_edit(container, objID, false); //set it to RO mode
			}		
		}
	}

	function enc_toggle_edit(container, objID, isEdit, hold, evt) {
		var ev=window.event || evt; //non-ff:ff

		var $obj = $(container).find("#" + objID + ', .' + objID);
		//if we were requested to HOLD the last state, then ignore this request
		if ($obj.attr("hold")) {
			if(!hold){
			    $obj.attr("hold", false); //but only once!
			}
			return;
		}
		
		var $objEdit = $obj.find("input.enc_control_edit");
		var $objValueSection = $obj.find("div.enc_control_value_section");
		var $objMask = $objValueSection.find("div.enc_control_mask");
		var $objData = $objValueSection.find("div.enc_control_data");
		var $objNoteSection = $obj.find("div.enc_control_note_section");
		var $objNote = $objNoteSection.find("span.enc_control_note");

		//state logic:................................................
		//if the control is readonly, then force isEdit to be false!
		if ($obj.prop("readonly") == true) {
			isEdit = false;
		}	else {
			//if MASK is blank (no original value), force isEdit to be true 
		    if ($objMask.find("input").val() == "") {
				isEdit = true;
			}
		}
		//.............................................................
		
		$objEdit.prop("checked", isEdit); //may seem redundant, but this can be called from other methods then "onclick" of the edit control		
		if (isEdit) {
		    $objMask.addClass("hidden");
		    $objMask.find("input").addClass("hidden");

		    $objData.removeClass("hidden");
		    $objData.find("input").removeClass("hidden");

		    $objNote.html($objNote.attr("edit_message"));

		    //only set the focus, if objData is not the source of this event (don't want to be trapped inside!)
		    var bSetFocus = true;
		    if (ev) {
		        var tmpSrcElem = ev.srcElement || ev.target;
		        if (tmpSrcElem == $objData.get() || ev == null) {
		            bSetFocus = false;
		        }
		    }
		    if (bSetFocus) {
		        try {
		            $objData.focus();
		        } catch (e) {
		            //guess we couldn't set the focus... oh well.
		        }
		    }
		    enc_toggle_warning(container, objID);
		}
		else {
		    $objMask.removeClass("hidden");
		    $objMask.find("input").removeClass("hidden");

		    $objData.addClass("hidden");
		    $objData.find("input").addClass("hidden");

		    $objNote.html($objNote.attr("mask_message"));

		    var $objWarning = $objNoteSection.find("span.enc_control_warning");

		    $objWarning.addClass("hidden");
		    $objWarning.removeClass("form-hint-block");
		    
		    if ($objNote.html() != "") {
		        $objNote.removeClass("hidden");
		        $objNote.addClass("form-hint-block");
		    }
		}
		
		//lock this setting in place (ignore the next toggle event request)
		if(hold){
			$obj.attr("hold", true);
		}		
	}
	
	function enc_toggle_warning(container, objID) {
		var $obj = $(container).find('#' + objID + ', .' + objID);
	    var $objValueSection = $obj.find("div.enc_control_value_section");

	    var $objMask = $objValueSection.find("div.enc_control_mask");

		//if there was not previously saved data (i.e. the MASK value is empty)
		//then there is no need to do anything with the warning...
	    if (trim($objMask.find("input").val()) != "") {
	        var $objData = $objValueSection.find("div.enc_control_data");

	        var $objNoteSection = $obj.find("div.enc_control_note_section");

	        var $objWarning = $obj.find("span.enc_control_warning");

	        var $objNote = $objNoteSection.find("span.enc_control_note");

	        if (trim($objData.find("input").val()) == "") {
	            $objWarning.removeClass("hidden");
	            $objWarning.addClass("form-hint-block");
	            $objNote.addClass("hidden");
	            $objNote.removeClass("form-hint-block");
	        }
	        else {
	            $objWarning.addClass("hidden");
	            $objWarning.removeClass("form-hint-block");
	            $objNote.removeClass("hidden");
	            $objNote.addClass("form-hint-block");
	        }		
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

	//**************************************************************************
	//	maUI.maskedEditControl
	//		This is an extension to maUI providing
	//
	//	Functions:
	//		Date.fromISOString(dateStr): Date
	//		date.prototype.toISOLocalString(): string
	//
	//**************************************************************************
	(function(maUI, $) { //maUI (ManageAmerica User Interface) is the object that is like "our jquery".  It's a namespace for us to create custom plugins.
		
		maUI.stdViews.MaskedEditControlView = function(fieldName, fieldValue) {
			this.fieldName = fieldName;
			this.fieldValue = fieldValue;
		};
		maUI.stdViews.MaskedEditControlView.prototype = {
			getContent: function($target) {
				var $maskedField = $target.find('input');
				var optDatepickerClass = $target.hasClass('datepicker') ? 'datepicker' : '';
				if($maskedField.length == 0) {
					$maskedField = $('<input/>').attr('name', this.fieldName).addClass('field readonly').attr('readonly', 'readonly').val(this.fieldValue);
				} else {
					this.fieldName = $maskedField.attr('name');
					this.fieldValue = $maskedField.val();
				}
				return $('<div></div>')
					.append($('<div></div>').addClass('pii-checkbox')
						.append($('<div></div>').addClass('checkbox checkbox-inline checkbox-inline-align')
								.append($('<label></label>')
									.append($('<input type="checkbox"/>').attr('name', this.fieldName + '_edit').addClass('mask-control-edit').val(1))
									.append($('<span></span>'))
								)
						)
						.append($('<div></div>').addClass('mask-control-value-section')
								.append($('<div></div>').addClass('mask-control-mask')
									.append($maskedField.addClass('field readonly'))
								)
								.append($('<div></div>').addClass('mask-control-data hidden ' + optDatepickerClass)
									.append($('<input/>').attr('name', this.fieldName + '_data').addClass('field hidden').val(''))
								)
						)
					)
					.append($('<div></div>').addClass('mask-control-note-section')
						.append($('<span></span>').addClass('mask-control-warning form-hint form-hint-block').text(maUI.stdViews.MaskedEditControlView.WarningText))
						.append($('<span></span>').addClass('mask-control-note form-hint form-hint-block'))
					);
			},
			onDomReady: function($container) {
				this.$container = $container;

				this.$container.on('click', '.mask-control-edit', this.toggleEdit.bind(this, null));
				this.$container.on('keyup', '.mask-control-data', this.toggleWarning.bind(this));

				//automatically set based on current state (mask value exists or not)
				var $objMask = this.$container.find(".mask-control-mask");

				//if there is no original data, or the control is readonly,
				//then hide all "dynamic edit" options
				if (($objMask.find("input").val() == "" || $objMask.find("input").prop("readonly") == true)) {
					//but only make it editable, if it is not readonly
					this.toggleEdit(!$objMask.find("input").prop("readonly"));
				}else {
					this.toggleEdit(false);
				}
			},
			toggleEdit: function(bEdit) {
				// TODO: "hold" logic has not been translated. I am unsure of the use-case, so I'm waiting until I encounter it to implement it correctly.

				var $objEdit = this.$container.find('.mask-control-edit');
				var $objValueSection = this.$container.find(".mask-control-value-section");
				var $objMask = $objValueSection.find(".mask-control-mask");
				var $objData = $objValueSection.find(".mask-control-data");
				var $objNoteSection = this.$container.find(".mask-control-note-section");
				var $objNote = $objNoteSection.find(".mask-control-note");

				//state logic:................................................
				//if the control is readonly, then force isEdit to be false!
				if (this.$container.prop("readonly") == true) {
					bEdit = false;
				}	else {
					//if MASK is blank (no original value), force isEdit to be true
					if ($objMask.find("input").val() == "") {
						bEdit = true;
					}
				}
				//.............................................................

				if(bEdit !== null) {
					$objEdit.prop('checked', bEdit);
				} else {
					bEdit = $objEdit.prop('checked');
				}
				if (bEdit) {
					$objMask.addClass("hidden");
					$objMask.find("input").addClass("hidden");

					$objData.removeClass("hidden");
					$objData.find("input").removeClass("hidden");

					$objNote.html(maUI.stdViews.MaskedEditControlView.NoteEditText);

					// TODO: in some places, old code toggles the edit off when the user blurs from Data, and leaves it empty. Should account for this, and that might mean care is needed in setting focus to avoid event loops.
					$objData.focus();

					this.toggleWarning();
				}
				else {
					$objMask.removeClass("hidden");
					$objMask.find("input").removeClass("hidden");

					$objData.addClass("hidden");
					$objData.find("input").addClass("hidden");

					$objNote.html(maUI.stdViews.MaskedEditControlView.NoteMaskText);

					var $objWarning = $objNoteSection.find(".mask-control-warning");

					$objWarning.addClass("hidden");
					$objWarning.removeClass("form-hint-block");

					if ($objNote.html() != "") {
						$objNote.removeClass("hidden");
						$objNote.addClass("form-hint-block");
					}
				}

			},
			toggleWarning: function() {

				var $objValueSection = this.$container.find(".mask-control-value-section");

				var $objMask = $objValueSection.find(".mask-control-mask");

				//if there was not previously saved data (i.e. the MASK value is empty)
				//then there is no need to do anything with the warning...
				if (trim($objMask.find("input").val()) != "") {
					var $objData = $objValueSection.find(".mask-control-data");

					var $objWarning = this.$container.find(".mask-control-warning");

					var $objNote = this.$container.find(".mask-control-note");

					if (trim($objData.find("input").val()) == "") {
						$objWarning.removeClass("hidden");
						$objWarning.addClass("form-hint-block");
						$objNote.addClass("hidden");
						$objNote.removeClass("form-hint-block");
					}
					else {
						$objWarning.addClass("hidden");
						$objWarning.removeClass("form-hint-block");
						$objNote.removeClass("hidden");
						$objNote.addClass("form-hint-block");
					}
				}
			}
		};
		// These three values should be set by the client code that includes EncryptionRefresh.js, after the inclusion of Encryption.asp.
		// Use the server variables, gblEnc_Control_Warning_Text, gblEnc_Control_Note_Mask_Text, and gblEnc_Control_Note_Edit_Text.
		maUI.stdViews.MaskedEditControlView.WarningText = '';
		maUI.stdViews.MaskedEditControlView.NoteMaskText = '';
		maUI.stdViews.MaskedEditControlView.NoteEditText= '';



	})(maUI, jQuery);