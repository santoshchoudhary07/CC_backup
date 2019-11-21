<%
  Company_Id = Session("Company_Id")
  
  set dataPump = server.CreateObject("EFTUtil.DataPump")
  dataPump.ConnectionType = "local" 'as opposed to the default "finServ" (box 1)
  dataPump.ConnectionString = dataPump.ConnectionString & ";App=MA/Rent_Roll/Add_Quickset.asp;"
  dataPump.SaveContext cstr(session("contextId"))

  set rsSetting = dataPump.GetData("Core..spSelCompanySettings " & _
							"@companyID=" & sqlNum(Company_Id) & _
							",@key=" & sqlText("Send_Notices_On_Stop_Payment"))
  if dataPump.SqlErrorNumber <> 0 then
	  response.write "Datapump error:<BR>" & dataPump.SqlErrorNumber & "<BR>" & dataPump.SqlErrorDescription & "<BR>" & dataPump.SqlErrorSource & "<BR>" & dataPump.sql & "<BR>"
	  response.end
  end if

  if (rsSetting("value") AND 1) = 0 then        ' bitwise operation
      isSendNoticeOnStopPaymentCompanySettingOn = false
  else
      isSendNoticeOnStopPaymentCompanySettingOn = true
  end if
  set rsSetting = nothing


  function fnReadOnly(fieldKey, allowEditDuringMoveIn, allowEditWhileMovedOut)
	  isReadOnly = false
	  if Level_Code = 3 and oPage.FieldSettings(fieldKey).IsReadOnly then
		  isReadOnly = true
	  end if
	  if Level_Code = 2 and oPage.FieldSettings(fieldKey).IsReadOnlyLevel2 then
		  isReadOnly = true
	  end if
	  if Level_Code = 1 and oPage.FieldSettings(fieldKey).IsReadOnlyLevel1 then
		  isReadOnly = true
	  end if
	  if Is_Lease_Admin and oPage.FieldSettings(fieldKey).LeaseAdminCanEdit then
		  isReadOnly = false
	  end if
	  if allowEditDuringMoveIn and Is_Move_In = "Y" then
		  isReadOnly = false
	  end if
	  if allowEditWhileMovedOut and (SOS_Res_Moving_Out = "Y" or SOS_Res_Moved_Out = "Y") and Is_Move_In <> "Y" then
		  isReadOnly = false
	  end if
	  if allowEditWhileMovedOut = false and (SOS_Res_Moving_Out = "Y" or SOS_Res_Moved_Out = "Y") and Is_Move_In <> "Y" then
		  isReadOnly = true
	  end if

	  'special rules for certain fields
	  if (fieldKey = "fname" or fieldKey = "lname") and Is_Move_In <> "Y" and allowPrimaryNameChange = false then
		  isReadOnly = true
	  end if
	  if (fieldKey = "fname" or fieldKey = "lname") and Is_Move_In <> "Y" and allowEditWhileMovedOut = false and (SOS_Res_Moving_Out = "Y" or SOS_Res_Moved_Out = "Y") then
		  isReadOnly = true
	  end if
	  if fieldKey = "abandonDate" and wkCanChangeAbandonDate = 0 then
		  isReadOnly = true
	  end if
	  if fieldKey = "currSiteRent" and (hasDependentUnits = true and wkSum_Dependent_Rents = "Y") then
		  isReadOnly = true
	  end if
	  if fieldKey = "currSiteRent" and (SOS_Act_TMHC_Charges = "Y" and SOS_Act_TMHC_Component_To_Update = "Base Rent") then
		  isReadOnly = true
	  end if
	  if (fieldKey = "lmsLeaseRenewComplete" or fieldKey = "leaseAgreeType" or fieldKey = "leaseAgreeDate" or fieldKey = "leaseExpDate") and (lmsLockFields and lmsIsLMSProp) then
		  isReadOnly = true
	  end if
    if not rsWater_Care is nothing then
	    if fieldKey = "careWater" and rsWater_Care.recordcount <= 0 then
		    isReadOnly = true
	    end if
    end if
    if not rsSewer_Care is nothing then
	    if fieldKey = "careSewer" and rsSewer_Care.recordcount <= 0 then
		    isReadOnly = true
	    end if
	  end if
	  if fieldKey = "mktRent" and Level_Code = 3 and newburyProp then
		  isReadOnly = true
	  end if
	  if fieldKey = "nextAnticipatedRentIncrease" and Level_Code = 3 and Assumption_Agreement_Active then
		  isReadOnly = true
	  end if
	  if fieldKey = "originalRent" and Is_Move_In = "Y" then
		  isReadOnly = true
	  end if
	  if fieldKey = "moveInDate" and isForceMoveInDateToToday = true and Level_Code <> 1 then
		  isReadOnly = true
	  end if

	  'if the company requires a Quickscreen app be complete for move in and this is a level 3 user and the resident does not have a completed QS app, then do not allow them to change the SOS.
	  'The reason is because there is a flag on SOS codes to allow move in without a complete QS app.  So it is possible to do a move in to one
	  'of these "exceptions".  But if they do it, they can't be allowed to change the SOS to something that does not have that exception.
	  'only if the move in date for the resident is after the effective date for the company setting
	  'Also, if the site is an STR site, then the SOS can be editable regardless of QS.
	  if fieldKey = "sos" and Level_Code = 3 and QS_Required_For_Move_In = true and qs_app_is_complete = false and wkSite_Type <> "STR" then
		  if (Is_Move_In = "Y") then
			  if isdate(wkMove_In_Date) then
				  if cdate(wkMove_In_Date) >= QS_Required_For_Move_In_Date then
					  isReadOnly = true
				  end if
			  end if
		  end if
	  end if


	  if isReadOnly then
		  fnReadOnly = true
	  else
		  fnReadOnly = false
	  end if
  end function

%>

<script type="text/javascript">
  function onStopPaymentChangedToYes(onStopType) {
    var isSendNoticeOnStopPaymentCompanySettingOn = <%=LCase(isSendNoticeOnStopPaymentCompanySettingOn)%>;

    var warningTextDiv = document.getElementById("StopPaymentWarningText");

    if (isSendNoticeOnStopPaymentCompanySettingOn && onStopType == 1){
      if (warningTextDiv) warningTextDiv.style.display = "block";
      alert("This resident has been placed on a \"Payment Stop\". Rent payments will not be accepted AND notices will not generate.");
    }
    else  {
      if (warningTextDiv) warningTextDiv.style.display = "none";
    }

    document.getElementById("txtOn_Stop_Funds_Type").value = 1;
  }

  function onStopPaymentChangedToNo(onStopType) {
    var isSendNoticeOnStopPaymentCompanySettingOn = <%=LCase(isSendNoticeOnStopPaymentCompanySettingOn)%>;

    var warningTextDiv = document.getElementById("StopPaymentWarningText");

    if (isSendNoticeOnStopPaymentCompanySettingOn){
      if (warningTextDiv) warningTextDiv.style.display = "none";
    }

    document.getElementById("txtOn_Stop_Funds_Type").value = 0;
  }

  function onStopPaymentChanged() {
    var e = document.getElementById("txtOn_Stop_Dropdown");
    var onStopType = parseInt(e.options[e.selectedIndex].value);

    var onStopElement = document.getElementById("txtOn_Stop");
    var fundsTypeElement = document.getElementById("txtOn_Stop_Funds_Type");

    if (onStopType >= 1){
      onStopElement.value = "Y";
      onStopPaymentChangedToYes(onStopType);
    } else {
      onStopElement.value = "N";
      onStopPaymentChangedToNo(onStopType);
    }
    fundsTypeElement.value = onStopType;
  }
</script>