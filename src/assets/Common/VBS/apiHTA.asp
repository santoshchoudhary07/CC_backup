<%
'~~~~~~~~~~~~~~~~~~~~~~~
'is being referenced in file applicantscreening\service\origen.asp... need to be careful to not double dip variable and routine names
'   https://dev.manageamerica.com/ApplicantScreening/Service/origen.asp?xml=<request><method>updateApplicationStatus</method><args><applicationID>67382725</applicationID><status>114</status><app_is_stale>N</app_is_stale><billable_docs_present>N</billable_docs_present></args></request>
'   https://dev.manageamerica.com/ApplicantScreening/Service/origen.asp?xml=<request><method>syncextsys</method><args><applicationID>67382725</applicationID></args></request>
'   https://dev.manageamerica.com/common/vbs/apiHTA.asp?bo_application_id=67382725&from_ofs_api_log_id=6874
'~~~~~~~~~~~~~~~~~~~~~~~
'debug
'dim bo_application_id, from_ofs_api_log_id
'bo_application_id=request("bo_application_id")
'from_ofs_api_log_id=request("from_ofs_api_log_id")
'SyncBOData bo_application_id,from_ofs_api_log_id
'~~~~~~~~~~~~~~~~~~~~~~~

sub SyncBOData(bo_application_id, from_ofs_api_log_id)
  dim bo_http_resolveTimeout, bo_http_connectTimeout, bo_http_sendTimeout, bo_http_receiveTimeout, bo_api_http_server, _
    bo_err_ret, bo_url, bo_request_string, bo_dp, bo_call_valid, bo_api_log_id, bo_sql, bo_rs, bo_return_post_errors, _
    bo_eval_app, bo_xml_return, bo_qs_hdr_id, bo_qs_detail_id, oEnc

  set bo_api_http_server = nothing
  bo_call_valid = false

  '~~~~~~~~~~~~~~~~~~~~~~~
  'save header to hta box 1 as that is where the Origen API resides to call
  '~~~~~~~~~~~~~~~~~~~~~~~
  set bo_dp = server.CreateObject("EFTUtil.DataPump")
  bo_dp.ConnectionType = "finServ" 'as opposed to the default "finServ" (cross-box)
  bo_dp.CommandTimeout = "180000"

  bo_sql = "exec disaster..spEdit_APSCRN_BO_API_Log" _
    & " @application_id=" & fnBoCleanString(bo_application_id, "numeric") _
    & ", @from_ofs_api_log_id=" & fnBoCleanString(from_ofs_api_log_id, "numeric") _
    & ", @usr_id=" & fnBoCleanString(session("usr_id"), "numeric")
  set bo_rs = bo_dp.GetData(bo_sql)
  bo_api_log_id = bo_rs("id")

  bo_sql = "exec disaster..spGet_Apscrn_BO_Application" _
    & " @ofs_app_id=" & fnBoCleanString(bo_application_id, "string")
  set bo_rs = bo_dp.GetData(bo_sql)

  if bo_rs.eof then
    bo_return_post_errors = bo_return_post_errors & fnBoWrapError("cannot find application " & bo_application_id & ".")

    bo_sql = "exec disaster..spEdit_APSCRN_BO_API_Log" _
      & " @id=" & bo_api_log_id _
      & ", @bo_xml=null" _
      & ", @process_return=" & fnBoCleanString(fnBoWrapReturn(bo_return_post_errors, false), "string")
    bo_dp.Execute bo_sql
  else
    bo_qs_hdr_id = bo_rs("header_id")
    bo_qs_detail_id = bo_rs("detail_id")
    bo_url = bo_rs("bo_url")
    set oEnc = Server.CreateObject("MACOM.Encryption")
    bo_request_string = oEnc.Decrypt(bo_rs("bo_authentication"))
    set oEnc = nothing

    if isnull(bo_url) or isnull(bo_request_string) then
      bo_return_post_errors = bo_return_post_errors & fnBoWrapError("Backoffice URL and or Authentication not setup. " & bo_application_id & ".")

      bo_sql = "exec disaster..spEdit_APSCRN_BO_API_Log" _
        & " @id=" & bo_api_log_id _
        & ", @bo_xml=null" _
        & ", @process_return=" & fnBoCleanString(fnBoWrapReturn(bo_return_post_errors, false), "string")
      bo_dp.Execute bo_sql
    else
      bo_request_string = bo_request_string & "&origenAppID=" & bo_rs("ofs_id")

      '~~~~~~~~~~~~~~~~~~~~~~~
      ' debug
      '    response.write bo_url&"?"&bo_request_string
      '~~~~~~~~~~~~~~~~~~~~~~~

      '~~~~~~~~~~~~~~~~~~~~~~~
      'set timeout parameters
      '1000ths of a second (1 second = 1000)
      '~~~~~~~~~~~~~~~~~~~~~~~
      bo_http_resolveTimeout = 100000
      bo_http_connectTimeout = 100000
      bo_http_sendTimeout = 100000
      bo_http_receiveTimeout = 100000

      if bo_api_http_server is nothing then
        set bo_api_http_server = CreateObject("MSXML2.ServerXMLHttp")
      end if

      bo_api_http_server.SetTimeouts http_resolveTimeout, http_connectTimeout, http_sendTimeout, http_receiveTimeout
      bo_api_http_server.open "POST", bo_url, false
      bo_api_http_server.setRequestHeader "Content-Type", "application/x-www-form-urlencoded"

      on error resume next

      bo_api_http_server.send bo_request_string
      '~~~~~~~~~~~~~~~~~~~~~~~
      'reason for error: can't connect with server
      '~~~~~~~~~~~~~~~~~~~~~~~
      if Err.number <> 0 then
        bo_err_ret = "An error occured connecting to " & bo_url & " server."
        bo_err_ret = bo_err_ret & "[Error] " & Err.number & "..." & Err.description & "..."
        bo_err_ret = bo_err_ret & bo_api_http_server.responseText
        bo_return_post_errors = fnBoWrapError(bo_err_ret)
      else
        set bo_xml_return = server.CreateObject("MSXML2.DOMDocument")
        bo_xml_return.async = false
        bo_xml_return.validateOnParse = false
        'response.Write bo_api_http_server.responseText
        bo_xml_return.loadXML(bo_api_http_server.responseText)
        bo_xml_return.validate()

        '~~~~~~~~~~~~~~~~~~~~~~~
        'reason for error: authentication can't be resolved
        '~~~~~~~~~~~~~~~~~~~~~~~
        if bo_xml_return.parseError.errorCode <> 0  then
          bo_return_post_errors = bo_return_post_errors & fnBoWrapError(bo_api_http_server.responseText)
          bo_return_post_errors = bo_return_post_errors & fnBoWrapError("XML parse error [Code (" & bo_xml_return.parseError.errorCode & ")]:" & bo_xml_return.parseError.reason)
        else
          bo_call_valid = true
        end if
      end if

      '~~~~~~~~~~~~~~~~~~~~~~~
      'clear error
      '~~~~~~~~~~~~~~~~~~~~~~~
      Err.Clear

      if not bo_call_valid then
        bo_sql = "exec disaster..spEdit_APSCRN_BO_API_Log" _
          & " @id=" & bo_api_log_id _
          & ", @bo_xml=null" _
          & ", @process_return=" & fnBoCleanString(fnBoWrapReturn(bo_return_post_errors, false), "string") _
          & ", @hdr_id=" & bo_qs_hdr_id _
          & ", @detail_id=" & bo_qs_detail_id
      else
        bo_sql = "exec disaster..spEdit_APSCRN_BO_API_Log" _
          & " @id=" & bo_api_log_id _
          & ", @bo_xml=" & fnBoCleanString(bo_xml_return.xml, "string") _
          & ", @process_return=" & fnBoCleanString(fnBoWrapReturn(bo_return_post_errors, true), "string") _
          & ", @hdr_id=" & bo_qs_hdr_id _
          & ", @detail_id=" & bo_qs_detail_id
      end if

      bo_dp.Execute bo_sql
    end if
  end if

  '~~~~~~~~~~~~~~~~~~~~~~~
  'debug
  '~~~~~~~~~~~~~~~~~~~~~~~
  'Response.Write "ResponseText = " & bo_api_http_server.responseText & "<BR>"
  'Response.write "ReadyState = "& bo_api_http_server.readyState & "<BR>"
  '~~~~~~~~~~~~~~~~~~~~~~~

  set bo_rs = nothing
  set bo_dp = nothing
  set bo_api_http_server = nothing
  set bo_xml_return = nothing
end sub

function fnBoCleanString(vStr, vType)
  if isNull(vStr) then
    vStr = "NULL"
  elseif trim(vStr) = "" then
    vStr = "NULL"
  else
    if vType = "string" then
      vStr = "'" & trim(replace(vStr, "'", "''")) & "'"
    else
      vStr = vStr
    end if
  end if

  fnBoCleanString = vStr
end function

function fnBoWrapError(vStr)
  fnBoWrapError = "<error>" & server.HTMLEncode(vStr) & "</error>"
end function

function fnBoWrapReturn(vStr, bPass)
  dim bo_str_pass

  if bPass then
    bo_str_pass = "pass"
  else
    bo_str_pass = "fail"
  end if

  fnBoWrapReturn = "<return><status>" & bo_str_pass & "</status>" & vStr & "</return>"
end function
%>