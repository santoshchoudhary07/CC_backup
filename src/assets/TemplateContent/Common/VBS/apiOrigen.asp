<%
'~~~~~
' | Make API LINK Configurable v1.0b
' |   20090921 - PJL
'~~~~~
if trim(session("company_id")) <> "" then
  if trim(session("QS_Origen_URL_Service")) = "" then
    fnGetOrigenServicesURL session("company_id")
  end if
else
  response.redirect("../common/vbs/scrValidate.asp")
end if
'~~~~~

dim origen_api_http_server
dim origen_api_debug
dim origen_api_debug_to_file
dim origen_api_debug_file
dim origen_api_debug_file_system_object
dim origen_new_login_each_time
dim origen_validation_errors
dim http_resolveTimeout, http_connectTimeout, http_sendTimeout, http_receiveTimeout

'SET TIMEOUTS TO THIS REDICULOUS AMOUNT FOR DEV AND TRAINING DUE TO VSTAGING
'1000ths of a second (1 second = 1000)
http_resolveTimeout = session("QS_Origen_URL_HTTP_ResolveTimeout")
http_connectTimeout = session("QS_Origen_URL_HTTP_ConnectTimeout")
http_sendTimeout    = session("QS_Origen_URL_HTTP_SendTimeout")
http_receiveTimeout = session("QS_Origen_URL_HTTP_HTTP_ReceiveTimeout")

'~~~~~
' | Debug
'~~~~~
'response.write session("QS_Origen_URL_Service") & "<BR>"
'response.write session("QS_Origen_URL_HTTP_ResolveTimeout") & ": QS_Origen_URL_HTTP_ResolveTimeout<BR>"
'response.write session("QS_Origen_URL_HTTP_ConnectTimeout") & ": QS_Origen_URL_HTTP_ConnectTimeout<BR>"
'response.write session("QS_Origen_URL_HTTP_SendTimeout") & ": QS_Origen_URL_HTTP_SendTimeout<BR>"
'response.write session("QS_Origen_URL_HTTP_HTTP_ReceiveTimeout") & ": QS_Origen_URL_HTTP_HTTP_ReceiveTimeout<BR>"
'~~~~~

origen_api_debug = false
origen_api_debug_to_file = false
origen_new_login_each_time = false

set origen_api_http_server = nothing
set origen_validation_errors = nothing
set origen_api_debug_file = nothing
set origen_api_debug_file_system_object = nothing

'/////////////////////////////////////////////////////////////////
sub ensureLogIn()
  dim sessionID, sessionTime, timeSpanHours

  sessionID = session("origen_session_id")
  sessionTime = session("origen_session_time")
  timeSpanHours = datediff("h", sessionTime, now)
  debug_out "hours since last login = " & timeSpanHours

  'if not logged in already, log in now...
  'or if there is no server set (first time here) and we need to login in each time...
  'OR if the last ma_login is not the same as the current (the ma user change userID in the same session)
  if sessionID = "" _
    or timeSpanHours > 3 _
    or (origen_new_login_each_time = true and origen_api_http_server is nothing) _
    or session("origen_last_ma_user_login") <> session("userID") then
      LogIn request("qs_trans_prop_code")
  end if
end sub

'/////////////////////////////////////////////////////////////////
function LogIn(qs_trans_prop_code)
  dim userID, iWorkflowLogId, dp, rsUser, userName, origen_login, origen_password, origen_context, _
    url, requestString, oXML, sessionID, sessionKey, bAcceptedTerms, oTerms

  debug_out "<span class='origen_debug'>"
  debug_out "LogIn() Start: "& now()

  userID = session("userID")
  if userID = "" then
    iWorkflowLogId = fnAddWorkflowLog("Login", "", fnGetWFLogErrorsXml("session(""userID"") is empty"))
    err.Raise 9999, "apiOrigen.asp", "UserID is required. MA Session invalid."
    LogIn = false
    exit function 'let the calling process deal...
  end if

  'for now, do the local MA users...
  'we will circle back to update the process, but we need a way to map if the user level
  'which is not on the ma users side (however they do have a ROLE that is based on the same number)
  if trim(qs_trans_prop_code) = "" then
    qs_trans_prop_code = "null"
  end if

  set dp = server.CreateObject("EFTUtil.DataPump")
  set rsUser = dp.GetData("disaster..spGet_APSCRN_User_Info @user_id=" & userID & ", @prop_code=" & qs_trans_prop_code)
  if rsUser.eof then
    iWorkflowLogId = fnAddWorkflowLog("Login", "", fnGetWFLogErrorsXml("Unable to load user information for userID #" & userID))
    err.Raise 9999, "apiOrigen.asp", "Unable to Load User Information. #" & userID
    LogIn = false
    exit function 'let the calling process deal...
  end if

  userName = rsUser("user_name")
  origen_login = rsUser("origen_login")
  origen_password = rsUser("origen_password")
  origen_context = rsUser("origen_context")

  debug_out "userName = " & userName
  debug_out "origen_login = " & origen_login

  '~~~~~
  ' | Make API LINK Configurable v1.0b
  ' |   20090921 - PJL
  '~~~~~
  ' | url = "https://www.origenservices.com/Services/TenantScreeningAPI.asmx/Login"
  '~~~~~
  url = session("QS_Origen_URL_Service") & "Login"

  requestString = "FocusUserName=" & origen_login _
    & "&FocusPassword=" & origen_password _
    & "&ContextID=" & origen_context _
    & "&MAUserName=" & urlEncode(userName) _
    & "&MAUserID=" & userID

  iWorkflowLogId = fnAddWorkflowLog("Login", "", "<CurrentLoginInfo " & _
    fnApiEncodeXmlAttribute("origen_login", session("origen_login")) & " " & _
    fnApiEncodeXmlAttribute("origen_session_id", session("origen_session_id")) & " " & _
    fnApiEncodeXmlAttribute("origen_session_key", session("origen_session_key")) & " />")

  set oXML = GetHttpXML(url, requestString)
  if trim(oXML.xml) = "" then
    ErrorNoXMLData
  end if

  '~~~~~
  ' | Session Id is now in Session Node
  ' | 20091109
  '~~~~~
  sessionID = oXML.selectSingleNode("login/session_id").text
  ' mjd - 2013-08 - added session key for OFS document uploader
  sessionKey  = oXML.selectSingleNode("login/key").text

  session("origen_session_id") = sessionID
  session("origen_session_key") = sessionKey
  session("origen_session_time") = now()
  session("origen_login") = origen_login
  session("origen_password") = origen_password
  session("origen_context") = origen_context
  session("origen_last_ma_user_login") = userID

  'fnUpdateWorkflowLog iWorkflowLogId, "", "<NewLoginInfo " & _
  '  fnApiEncodeXmlAttribute("origen_login", session("origen_login")) & " " & _
  '  fnApiEncodeXmlAttribute("origen_session_id", session("origen_session_id")) & " " & _
  '  fnApiEncodeXmlAttribute("origen_session_key", session("origen_session_key")) & " />"
  fnUpdateWorkflowLog iWorkflowLogId, "", fnApiIif(oXML is nothing or oXML.documentElement is nothing, "", oXML.documentElement.xml)

  bAcceptedTerms = true
  set oTerms  = oXML.selectNodes("login/terms_of_use_id")
  if oTerms.length > 0 then
    bAcceptedTerms = false
    session("origen_terms_agreement") = oXML.xml
  end if
  set oTerms = nothing

  LogIn = bAcceptedTerms

  debug_out "SessionID = " & session("origen_session_id")
  debug_out "LogIn() End: " & now()
  debug_out "</span>"

  'response.write "session(origen_last_ma_user_login):" & session("origen_last_ma_user_login")
  'response.write "session(origen_login):" & session("origen_login")
end function

'/////////////////////////////////////////////////////////////////
sub LogOut()
  dim sessionID, url, requestString, ret, iWorkflowLogId
  sessionID = Session("origen_session_id")

  debug_out "<span class='origen_debug'>"
  debug_out "LogOut() Start: " & now()

  '~~~~~
  ' | Make API LINK Configurable v1.0b
  ' |   20090921 - PJL
  '~~~~~
  ' | url = "https://www.origenservices.com/Services/TenantScreeningAPI.asmx/Logout"
  '~~~~~
  url = session("QS_Origen_URL_Service") & "Logout"

  requestString = "SessionID=" & sessionID

  iWorkflowLogId = fnAddWorkflowLog("Logout", "", "<CurrentLoginInfo " & _
    fnApiEncodeXmlAttribute("origen_login", session("origen_login")) & " " & _
    fnApiEncodeXmlAttribute("origen_session_id", session("origen_session_id")) & " " & _
    fnApiEncodeXmlAttribute("origen_session_key", session("origen_session_key")) & " />")

  ret = DoHttpPost(url, requestString)

  fnUpdateWorkflowLog iWorkflowLogId, "", ""

  session("origen_session_id") = ""
  session("origen_session_key") = ""

  debug_out "LogOut() End: " & now()
  debug_out "</span>"
end sub

'/////////////////////////////////////////////////////////////////
function GetLookups()
  dim url, requestString, sessionID, oXML, iWorkflowLogId

  debug_out "<span class='origen_debug'>"
  debug_out "GetLookups() Start: " & now()

  call ensureLogIn() 'make sure logged in
  sessionID = Session("origen_session_id")

  '~~~~~
  ' | Make API LINK Configurable v1.0b
  ' |   20090921 - PJL
  '~~~~~
  ' | url = "https://www.origenservices.com/Services/TenantScreeningAPI.asmx/GetLookups"
  '~~~~~
  url = session("QS_Origen_URL_Service") & "GetLookups"

  requestString = "SessionID=" & urlEncode(sessionID)

  iWorkflowLogId = fnAddWorkflowLog("GetLookups", "", "")

  set oXML = GetHttpXML(url, requestString)
  if trim(oXML.xml) = "" then
    ErrorNoXMLData
  end if

  fnUpdateWorkflowLog iWorkflowLogId, "", "" 'too much data => fnApiIif(oXML is nothing or oXML.documentElement is nothing, "", oXML.documentElement.xml)

  set GetLookups = oXML

  debug_out "GetLookups() End: " & now()
  debug_out "</span>"
end function

'/////////////////////////////////////////////////////////////////
function GetApplication(applicationID)
  dim url, requestString, sessionID, oXML, iWorkflowLogId

  debug_out "<span class='origen_debug'>"
  debug_out "GetApplication() Start: " & now()

  call ensureLogIn() 'make sure logged in
  sessionID = Session("origen_session_id")

  '~~~~~
  ' | Make API LINK Configurable v1.0b
  ' |   20090921 - PJL
  '~~~~~
  ' | url = "https://www.origenservices.com/Services/TenantScreeningAPI.asmx/GetApplication"
  '~~~~~
  url = session("QS_Origen_URL_Service") & "GetApplication"

  requestString = "SessionID=" & urlEncode(sessionID) _
    & "&ApplicationID=" & applicationID

  iWorkflowLogId = fnAddWorkflowLog("GetApplication", cstr(applicationID), "")

  set oXML = GetHttpXML(url, requestString)
  if trim(oXML.xml) = "" then
    set oXML = ReturnErrorNoXMLData()
  end if

  fnUpdateWorkflowLog iWorkflowLogId, cstr(applicationID), ""

  set GetApplication = oXML

  debug_out "GetApplication() End: "& now()
  debug_out "</span>"
end function

'/////////////////////////////////////////////////////////////////
function SubmitApplication(applicationXML)
  dim sApplicationId, iWorkflowLogId, sessionID, url, requestString, oXML

  debug_out "<span class='origen_debug'>"
  debug_out "SubmitApplication() Start: " & now()

  sApplicationId = fnApiExtractApplicationIDFromXmlString(applicationXML, "application/@id")
  iWorkflowLogId = fnAddWorkflowLog("SubmitApplication", sApplicationId, applicationXML)

  if ValidateApplicationXML(applicationXML) then

    call ensureLogIn() 'make sure logged in
    sessionID = Session("origen_session_id")

    '~~~~~
    ' | Make API LINK Configurable v1.0b
    ' |   20090921 - PJL
    '~~~~~
    ' | url = "https://www.origenservices.com/Services/TenantScreeningAPI.asmx/SubmitApplication"
    '~~~~~
    url = session("QS_Origen_URL_Service") & "SubmitApplication"

    requestString = "SessionID=" & urlEncode(sessionID) _
      & "&ApplicationXML=" & urlEncode(applicationXML)

    set oXML = GetHttpXML(url, requestString)
    if trim(oXML.xml) = "" then
      set oXML = ReturnErrorNoXMLData()
    end if

    sApplicationId = fnApiExtractApplicationIDFromXml(oXML, "application/@id")
    fnUpdateWorkflowLog iWorkflowLogId, sApplicationId, fnApiIif(oXML is nothing or oXML.documentElement is nothing, "", oXML.documentElement.xml)

    set SubmitApplication = oXML
  else
    fnUpdateWorkflowLog iWorkflowLogId, sApplicationId, fnGetOrigenValidationErrorsForWFLog()

    set SubmitApplication = nothing
  end if

  debug_out "SubmitApplication() End: "& now()
  debug_out "</span>"

end function

'/////////////////////////////////////////////////////////////////
function GenericAPICallXML(method, args)
  dim url, requestString, sessionID, oXML

  debug_out "<span class='origen_debug'>"
  debug_out "GenericAPICallXML(" & method & ") Start: " & now()

  call ensureLogIn() 'make sure logged in
  sessionID = Session("origen_session_id")

  '~~~~~
  ' | Make API LINK Configurable v1.0b
  ' |   20090921 - PJL
  '~~~~~
  ' | url = "https://www.origenservices.com/Services/TenantScreeningAPI.asmx/" & method
  '~~~~~
  url = session("QS_Origen_URL_Service") & method

  requestString = "SessionID=" & sessionID & "&" & args
  set oXML = GetHttpXML(url, requestString)
  if trim(oXML.xml) = "" then
    set oXML = ReturnErrorNoXMLData()
  end if

  set GenericAPICallXML = oXML

  debug_out "GenericAPICallXML(" & method & ") End: " & now()
  debug_out "</span>"
end function

function GenericAPICallVoid(method, args)
  dim url, requestString, sessionID, oXML

  debug_out "<span class='origen_debug'>"
  debug_out "GenericAPICallVoid(" & method & ") Start: " & now()

  call ensureLogIn() 'make sure logged in
  sessionID = Session("origen_session_id")

  '~~~~~
  ' | Make API LINK Configurable v1.0b
  ' |   20090921 - PJL
  '~~~~~
  ' | url = "https://www.origenservices.com/Services/TenantScreeningAPI.asmx/" & method
  '~~~~~
  url = session("QS_Origen_URL_Service") & method

  requestString = "SessionID=" & sessionID & "&" & args
  set oXML = GetHttpXML(url, requestString)

  GenericAPICallVoid = (trim(pullText()) = "")

  debug_out "GenericAPICallVoid(" & method & ") End: " & now()
  debug_out "</span>"
end function

function CancelApplication(applicationID)
  '  void CancelApplication(string SessionID, int ApplicationID)
  dim url, requestString, sessionID, txt, args, iWorkflowLogId

  debug_out "<span class='origen_debug'>"
  debug_out "CancelApplication Start: " & now()

  call ensureLogIn() 'make sure logged in
  sessionID = Session("origen_session_id")

  '~~~~~
  ' | Make API LINK Configurable v1.0b
  ' |   20090921 - PJL
  '~~~~~
  ' | url = "https://www.origenservices.com/Services/TenantScreeningAPI.asmx/CancelApplication"
  '~~~~~
  url = session("QS_Origen_URL_Service") & "CancelApplication"

  args = "SessionID=" & urlEncode(sessionID) _
    & "&ApplicationID=" & urlEncode(ApplicationID)

  iWorkflowLogId = fnAddWorkflowLog("CancelApplication", cstr(applicationID), "")

  txt = DoHttpPost(url, args)
  'this is a simply void function... so if it returns something, there must have been an error
  CancelApplication = (trim(txt) <> "")

  fnUpdateWorkflowLog iWorkflowLogId, cstr(applicationID), fnGetWFLogErrorsXml(trim(txt))

  debug_out "CancelApplication End: " & now()
  debug_out "</span>"
end function

function ApproveSubmission(applicationID)
  '  void ApproveSubmission(string SessionID, int ApplicationID)
  dim url, requestString, sessionID, txt, args, iWorkflowLogId

  debug_out "<span class='origen_debug'>"
  debug_out "ApproveSubmission Start: " & now()

  call ensureLogIn() 'make sure logged in
  sessionID = Session("origen_session_id")

  '~~~~~
  ' | Make API LINK Configurable v1.0b
  ' |   20090921 - PJL
  '~~~~~
  ' | url = "https://www.origenservices.com/Services/TenantScreeningAPI.asmx/ApproveSubmission"
  '~~~~~
  url = session("QS_Origen_URL_Service") & "ApproveSubmission"

  args = "SessionID=" & urlEncode(sessionID) _
    & "&ApplicationID=" & urlEncode(ApplicationID)

  iWorkflowLogId = fnAddWorkflowLog("ApproveSubmission", cstr(applicationID), "")

  txt = DoHttpPost(url, args)
  'this is a simply void function... so if it returns something, there must have been an error
  ApproveSubmission = (trim(txt) <> "")

  fnUpdateWorkflowLog iWorkflowLogId, cstr(applicationID), fnGetWFLogErrorsXml(trim(txt))

  debug_out "ApproveSubmission End: " & now()
  debug_out "</span>"
end function

function GetApplicationListing(startDate, endDate, origenCommunityID)
  '  XmlDocument GetApplications(string SessionID, string StartDate, string EndDate, string CommunityID)
  '
  'Usage
  '  Returns a listing of applications within a date range.  CommunityID is either the published ID
  '  of the community, or empty to include all communities for this investor.  This would be used to
  '  create the �list view� of applications.
  '
  'Sample Result
  '  GetApplications - Results.xml

  dim args
  args = "StartDate=" & xmlDate(startdate) _
    & "&EndDate=" & xmlDate(enddate) _
    & "&CommunityID=" & origenCommunityID

  set GetApplicationListing = GenericAPICallXML("GetApplications", args)
end function

function GetApplicationDetails(applicationID)
  '  XmlDocument GetApplicationDetails(string SessionID, int ApplicationID)
  '
  'Usage
  '  Returns the details about the application as it stands within the system.  This is used to
  '  generate a read-only detail view of the application and it�s progress.
  '
  'Sample Result
  '  GetApplicationDetails - Results.xml

  dim args, iWorkflowLogId
  args = "ApplicationID=" & applicationID

  iWorkflowLogId = fnAddWorkflowLog("GetApplicationDetails", cstr(applicationID), "")

  set GetApplicationDetails = GenericAPICallXML("GetApplicationDetails", args)

  fnUpdateWorkflowLog iWorkflowLogId, cstr(applicationID), ""
end function

function RevealMaskedApplicationData(ApplicationID, RevealHours)
  dim url, requestString, sessionID, iWorkflowLogId

  debug_out "<span class='origen_debug'>"
  debug_out "RevealMaskedApplicationData() Start: " & now()

  call ensureLogIn() 'make sure logged in
  sessionID = Session("origen_session_id")

  '~~~~~
  ' | Make API LINK Configurable v1.0b
  ' |   20090921 - PJL
  '~~~~~
  ' | url = "https://www.origenservices.com/Services/TenantScreeningAPI.asmx/RevealMaskedApplicationData"
  '~~~~~
  url = session("QS_Origen_URL_Service") & "RevealMaskedApplicationData"

  requestString = "SessionID=" & sessionID _
    & "&ApplicationID=" & ApplicationID _
    & "&RevealHours=" & RevealHours

  iWorkflowLogId = fnAddWorkflowLog("RevealMaskedApplicationData", cstr(ApplicationID), "")

  dim ret
  ret = DoHttpPost(url, requestString)

  fnUpdateWorkflowLog iWorkflowLogId, cstr(ApplicationID), "<RevealMaskedApplicationData " & _
    fnApiEncodeXmlAttribute("result", trim(ret)) & " />"

  debug_out "RevealMaskedApplicationData() End: " & now()
  debug_out "</span>"
end function

function UpdateCondition(applicationID, conditionNumber, operation)
  '  void UpdateCondition(string SessionID, int ApplicationID, int ConditionNumber, string Operation)
  '
  'Usage
  '  Update the status of a verification condition that was requested as part of a background check.
  '
  '  Valid Operations:
  '    Accept - Cleard the condition
  '    Reject - Cancels the condition
  '    Reset  - Returns condition to an unset state

  dim sessionID, url, requestString, iWorkflowLogId
  sessionID = Session("origen_session_id")

  debug_out "<span class='origen_debug'>"
  debug_out "UpdateCondition() Start: " & now()

  '~~~~~
  ' | Make API LINK Configurable v1.0b
  ' |   20090921 - PJL
  '~~~~~
  ' | url = "https://www.origenservices.com/Services/TenantScreeningAPI.asmx/UpdateCondition"
  '~~~~~
  url = session("QS_Origen_URL_Service") & "UpdateCondition"

  requestString = "SessionID=" & sessionID _
    & "&ApplicationID=" & applicationID _
    & "&ConditionNumber=" & conditionNumber _
    & "&Operation=" & operation

  iWorkflowLogId = fnAddWorkflowLog("UpdateCondition", cstr(applicationID), "<ConditionInfo " & _
    fnApiEncodeXmlAttribute("condition_number", cstr(conditionNumber)) & " " &_
    fnApiEncodeXmlAttribute("operation", operation) & " />")

  dim txt
  txt = DoHttpPost(url, requestString)

  fnUpdateWorkflowLog iWorkflowLogId, cstr(applicationID), "<UpdateCondition " & _
    fnApiEncodeXmlAttribute("result", trim(txt)) & " />"

  debug_out "UpdateCondition() End: " & now()
  debug_out "</span>"
end function

function GetSearchCodes()
  '  XmlDocument GetSearchCodes(string SessionID)
  '
  'Usage
  '  You get the list of possible search codes with the �GetSearchCodes� function.  This will return
  '  a list of codes used for national, state, and county conviction and eviction searches.  This is
  '  a large and static list, so you will probably want to cache it.  The National Criminal Search
  '  is an automatic selection of all the instant state criminal searches, and the National Eviction
  '  Search is an automatic selection of all the instant state eviction searches.
  '
  'Sample Result
  '  GetSearchCodes - Results.xml

  dim args
  set GetSearchCodes = GenericAPICallXML("GetSearchCodes", args)
end function

function SubmitBackgroundCheck(applicantID, searchXML, returnSearch)
  '  XmlDocument SubmitBackgroundCheck(string SessionID, int ApplicantId, string SearchXML, bool ReturnSearch)
  '
  'Usage
  '  You initiate a background check search with the �SubmitBackgroundCheck� function.  You must supply
  '  a list of search codes to indicate what types of searches to perform.
  '
  '  You get the list of possible search codes with the �GetSearchCodes� function.  This will return a
  '  list of codes used for national, state, and county conviction and eviction searches.  This is a
  '  large and static list, so you will probably want to cache it.  The National Criminal Search is an
  '  automatic selection of all the instant state criminal searches, and the National Eviction Search is
  '  an automatic selection of all the instant state eviction searches.
  '
  '  If there was a problem, the �requestStatus� attribute will be �Failed� if there was a problem
  '  processing a valid search request, or �Data Validation Problem� if the data that was submitted was
  '  invalid.  The �message� attribute of the result will contain more detail.  The status of a successful
  '  search will be �In Progress�, which means the search was successfully submitted, but instant results
  '  are still being processed.  The full results can take minutes to be processed, so the function returns
  '  in this intermediate state to speed availability.
  '
  '  You can use the �ReturnSearch� argument to return the incomplete results in the data returned by
  '  SubmitBackgroundCheck, but you need to save the background check �backgroundCheckId� for future reference.
  '
  'Sample SearchXML
  '  SubmitBackgroundCheck - SearchXML.xml
  '
  'Sample Result
  '  SubmitBackgroundCheck - Results.xml

  dim args, iWorkflowLogId, sApplicationId
  args = "ApplicantID=" & applicantID _
    & "&SearchXML=" & urlEncode(searchXML) _
    & "&ReturnSearch=" & fnApiIif(returnSearch, "TRUE", "FALSE")

  iWorkflowLogId = fnAddWorkflowLog("SubmitBackgroundCheck", "", "<ApplicantInfo " & _
    fnApiEncodeXmlAttribute("applicant_id", cstr(applicantID)) & " " & _
    fnApiEncodeXmlAttribute("return_search", cstr(returnSearch)) & " />")

  set SubmitBackgroundCheck = GenericAPICallXML("SubmitBackgroundCheck", args)

  sApplicationId = fnApiExtractApplicationIDFromXml(SubmitBackgroundCheck, "BackgroundCheckResponses/BackgroundCheckResponse/@applicationID")
  fnUpdateWorkflowLog iWorkflowLogId, sApplicationId, ""
end function

function GetBackgroundChecks(applicationID, DetailLevel)
  '  XmlDocument GetBackgroundChecks (string SessionID, int ApplicationID, int ShowDetails)
  '
  'Usage
  '  You can get the full results of the search with either the �GetBackgroundChecks� or the
  '  �GetBackgroundCheckDetail� functions.  The requestStatus will tell you about the results to
  '  expect.  If the status is still �In Progress�, then the details will be empty placeholders.
  '  If the status is �Complete� then all records are complete.  If the status is �Results Pending�,
  '  then all the instant searches are complete, but the system is still waiting on one or more
  '  non-instant searches.
  '
  '  GetBackgroundChecks returns an overview of the all the background checks done for a tenant
  '  screening application, and can optionally return the full results with all the details for all
  '  searches.  The GetBackgroundCheckDetail function returns data about a specific search (as
  '  identified by the backgroundCheckId), and can be further restricted to just return a specific
  '  search record.
  '
  '  One possible use for these functions would be to use the XML from the GetBackgroundChecks
  '  function to show an overview page, and when the user clicks on a specific search result, use
  '  the GetBackgroundCheckDetail function to get the specific search results.
  '
  'Sample Result
  '  GetBackgroundChecks - Results.xml

  dim args
  args = "ApplicationID=" & applicationID _
    & "&DetailLevel=" & DetailLevel

  'set GetBackgroundChecks = GenericAPICallXML("GetBackgroundChecks", args)
  'NEW: transform the data received from TU to have "Hit Counts" and "Eviction Instances"
  set GetBackgroundChecks = TransformBackgroundCheck(GenericAPICallXML("GetBackgroundChecks", args))
end function

function GetBackgroundCheckDetail(backgroundCheckID, searchRecordID)
  '  XmlDocument GetBackgroundCheckDetail (string SessionID, string BackgroundCheckId, int SearchRecordId)
  '
  'Usage
  '  You can get the full results of the search with either the �GetBackgroundChecks� or the
  '  �GetBackgroundCheckDetail� functions.  The requestStatus will tell you about the results to
  '  expect.  If the status is still �In Progress�, then the details will be empty placeholders.
  '  If the status is �Complete� then all records are complete.  If the status is �Results Pending�,
  '  then all the instant searches are complete, but the system is still waiting on one or more
  '  non-instant searches.
  '
  '  GetBackgroundChecks returns an overview of the all the background checks done for a tenant
  '  screening application, and can optionally return the full results with all the details for all
  '  searches.  The GetBackgroundCheckDetail function returns data about a specific search (as
  '  identified by the backgroundCheckId), and can be further restricted to just return a specific
  '  search record.
  '
  '  One possible use for these functions would be to use the XML from the GetBackgroundChecks
  '  function to show an overview page, and when the user clicks on a specific search result, use
  '  the GetBackgroundCheckDetail function to get the specific search results.
  '
  'Sample Result
  '  GetBackgroundCheckDetail - Results.xml

  dim args
  args = "BackgroundCheckId=" & backgroundCheckID _
    & "&SearchRecordId=" & searchRecordID

  'set GetBackgroundCheckDetail = GenericAPICallXML("GetBackgroundCheckDetail", args)
  'NEW: transform the data received from TU to have "Hit Counts" and "Eviction Instances"
  set GetBackgroundCheckDetail = TransformBackgroundCheck(GenericAPICallXML("GetBackgroundCheckDetail", args))
end function

function GetBackgroundSummaries(applicationID)
  dim args
  args = "ApplicationID=" & applicationID
  set GetBackgroundSummaries = GenericAPICallXML("GetBackgroundSummaries", args)
end function

function CreditOverride(applicationID, pass, reason)
  'a simplified blend of the two credit override calls (with new reason field)
  dim args, method, txt, iWorkflowLogId, sOverrideResult
  args = "ApplicationID=" & applicationID _
    & "&Reason=" & reason
  method = fnApiIif(pass, "CreditOverridePass", "CreditOverrideFail")

  iWorkflowLogId = fnAddWorkflowLog(method, cstr(applicationID), "<OverrideInfo " & _
    fnApiEncodeXmlAttribute("method", method) & " " & _
    fnApiEncodeXmlAttribute("pass", cstr(pass)) & " " & _
    fnApiEncodeXmlAttribute("reason", reason) & " />")
  CreditOverride = GenericAPICallVoid(method, args)
  sOverrideResult = trim(pullText())
  fnUpdateWorkflowLog iWorkflowLogId, cstr(applicationID), "<CreditOverride " & _
    fnApiEncodeXmlAttribute("result", sOverrideResult) & " />"
end function

function CreditOverridePass(applicationID)
  '  void CreditOverridePass(string SessionID, int ApplicationID)
  '
  ' These methods should be used in the event that the customer wants to override Origen�s credit
  ' decision with their own.� So you can call CreditOverridePass to change the credit decision to
  ' a �pass� (which would result in an approval, assuming all of the other criteria are met), or vice-versa.

  dim url, requestString, sessionID, txt, iWorkflowLogId

  debug_out "<span class='origen_debug'>"
  debug_out "CreditOverridePass Start: " & now()

  call ensureLogIn() 'make sure logged in
  sessionID = Session("origen_session_id")

  '~~~~~
  ' | Make API LINK Configurable v1.0b
  ' |   20090921 - PJL
  '~~~~~
  ' | url = "https://www.origenservices.com/Services/TenantScreeningAPI.asmx/CreditOverridePass"
  '~~~~~
  url = session("QS_Origen_URL_Service") & "CreditOverridePass"

  requestString = "sessionID=" & sessionID & "&ApplicationID=" & applicationID

  iWorkflowLogId = fnAddWorkflowLog("CreditOverridePass", cstr(applicationID), "")

  txt = DoHttpPost(url, requestString)
  'this is a simply void function... so if it returns something, there must have been an error
  CreditOverridePass = (trim(txt) <> "")

  fnUpdateWorkflowLog iWorkflowLogId, cstr(applicationID), fnGetWFLogErrorsXml(trim(txt))

  debug_out "CreditOverridePass End: " & now()
  debug_out "</span>"
end function

function CreditOverrideFail(applicationID)
  '  void CreditOverrideFail(string SessionID, int ApplicationID)
  '
  ' These methods should be used in the event that the customer wants to override Origen�s credit
  ' decision with their own.� So you can call CreditOverridePass to change the credit decision to
  ' a �fail� (which would result in an approval, assuming all of the other criteria are met), or vice-versa.

  dim url, requestString, sessionID, txt, iWorkflowLogId

  debug_out "<span class='origen_debug'>"
  debug_out "CreditOverrideFail Start: " & now()

  call ensureLogIn() 'make sure logged in
  sessionID = Session("origen_session_id")

  '~~~~~
  ' | Make API LINK Configurable v1.0b
  ' |   20090921 - PJL
  '~~~~~
  ' | url = "https://www.origenservices.com/Services/TenantScreeningAPI.asmx/CreditOverrideFail"
  '~~~~~
  url = session("QS_Origen_URL_Service") & "CreditOverrideFail"

  requestString = "sessionID=" & sessionID & "&ApplicationID=" & applicationID

  iWorkflowLogId = fnAddWorkflowLog("CreditOverrideFail", cstr(applicationID), "")

  txt = DoHttpPost(url, requestString)

  'this is a simply void function... so if it returns something, there must have been an error
  CreditOverrideFail = (trim(txt) <> "")

  fnUpdateWorkflowLog iWorkflowLogId, cstr(applicationID), fnGetWFLogErrorsXml(trim(txt))

  debug_out "CreditOverrideFail End: " & now()
  debug_out "</span>"
end function

'/////////////////////////////////////////////////////////////////
function UpdateApplication(applicationXML, allowNewApplication)
  dim sApplicationId, iWorkflowLogId, sessionID, url, requestString, oXML

  debug_out "<span class='origen_debug'>"
  debug_out "UpdateApplication() Start: " & now()

  sApplicationId = fnApiExtractApplicationIDFromXmlString(applicationXML, "application/@id")
  iWorkflowLogId = fnAddWorkflowLog("SubmitApplication", sApplicationId, applicationXML)

  if ValidateApplicationXML(applicationXML) then

    call ensureLogIn() 'make sure logged in
    sessionID = Session("origen_session_id")

    '~~~~~
    ' | Make API LINK Configurable v1.0b
    ' |   20090921 - PJL
    '~~~~~
    ' | url = "https://www.origenservices.com/Services/TenantScreeningAPI.asmx/UpdateApplication"
    '~~~~~
    url = session("QS_Origen_URL_Service") & "UpdateApplication"

    requestString = "SessionID=" & urlEncode(sessionID) _
      & "&ApplicationXML=" & urlEncode(applicationXML) _
      & "&AllowNewApplication=" & fnApiIif(allowNewApplication, "True", "False")

    set oXML = GetHttpXML(url, requestString)
    if trim(oXML.xml) = "" then
      set oXML = ReturnErrorNoXMLData()
    end if

    sApplicationId = fnApiExtractApplicationIDFromXml(oXML, "application/@id")
    fnUpdateWorkflowLog iWorkflowLogId, sApplicationId, fnApiIif(oXML is nothing or oXML.documentElement is nothing, "", oXML.documentElement.xml)

    set UpdateApplication = oXML
  else
    fnUpdateWorkflowLog iWorkflowLogId, sApplicationId, fnGetOrigenValidationErrorsForWFLog()

    set UpdateApplication = nothing
  end if

  debug_out "UpdateApplication() End: "& now()
  debug_out "</span>"
end function

'===========================================
' documents
'===========================================
function GetApplicationDocuments(applicationID, includeExtendedData)
  'public XmlDocument GetApplicationDocuments(string sessionId, string applicationDocumentsRequestXml)
  'This method retrieves the list of the available documents for a given application.
  'See �GetApplicationDocuments � request.xml� for the structure of the Xml document passed in the �applicationDocumentsRequestXml�
  'parameter.
  '
  'See �GetApplicationDocuments � response.xml� for the structure of the returned Xml document.
  'The returned Xml document from this method can be used as input to the GenerateDocumentPackage() method.

  dim args, xmlArg, iWorkflowLogId
  xmlArg =  "<root>" & _
    " <application application_id=""" & applicationID & """ />" & _
    " <parameters>" & _
    "   <parameter name=""want_extended_data"" value=""" & lcase(cstr(includeExtendedData = true)) & """ /> " & _
    " </parameters>" & _
    "</root>"

  if origen_api_debug = true then
    Response.Write "Request: <BR>"
    showText xmlArg
    Response.Write "<BR>"
  end if

  args = "applicationDocumentsRequestXml=" & urlEncode(xmlArg)

  iWorkflowLogId = fnAddWorkflowLog("GetApplicationDocuments", applicationID, xmlArg)
  set GetApplicationDocuments = GenericAPICallXML("GetApplicationDocuments", args)
  fnUpdateWorkflowLog iWorkflowLogId, applicationID, ""
end function

function OrderBillableDocuments(applicationID, includeExtendedData)
  'public XmlDocument OrderBillableDocuments(string sessionId, string orderDocumentsRequestXml)
  'This method orders any billable documents. See �OrderBillableDocuments � request.xml� for the structure of the
  'Xml document passed in the �orderDocumentsRequestXml� parameter.
  '
  'See �OrderBillableDocuments � response.xml� for the structure of the returned Xml document.
  'The returned Xml document is the same as the returned value from GetApplicationDocuments()
  'and can be used as input to the GenerateDocumentPackage() method.

  dim args, xmlArg, iWorkflowLogId, xmlResult
  xmlArg =  "<root>" & _
    " <application application_id=""" & applicationID & """ />" & _
    " <parameters>" & _
    "   <parameter name=""want_extended_data"" value=""" & lcase(cstr(includeExtendedData = true)) & """ /> " & _
    " </parameters>" & _
    "</root>"

  args = "orderDocumentsRequestXml=" & urlEncode(xmlArg)

  iWorkflowLogId = fnAddWorkflowLog("OrderBillableDocuments", applicationID, xmlArg)
  set xmlResult = GenericAPICallXML("OrderBillableDocuments", args)
  fnUpdateWorkflowLog iWorkflowLogId, applicationID, fnApiIif(xmlResult is nothing or xmlResult.documentElement is nothing, "", xmlResult.documentElement.xml)

  set OrderBillableDocuments = xmlResult
end function

function GetExtendedDocumentData(applicationID, optionalDocumentIDList)
  '
  'applicationID INT, documentIDList String
  'example optionalDocumentIDList = "123,124,125,555,6646"
  'if not supplied (or optionalDocumentIDList="" then ALL WILL BE RETURNED
  '
  'public XmlDocument GetExtendedDocumentData(string sessionId, string extendedDataRequestXml)
  'This method returns the extended document metadata and cached data for the given application.
  'See �GetExtendedDocumentData � request.xml� for the structure of the Xml document passed in
  'the �extendedDataRequestXml� parameter.
  '
  'See �GetExtendedDocumentData � response.xml� for the structure of the returned Xml document.
  'The returned Xml document may be modified as necessary and subsequently passed as input to the
  'UpdateExtendedDocumentData() and GenerateDocumentPackage() method.

  dim args, xmlArg, docID, docArray, i, iWorkflowLogId, xmlResult

  docArray = split(optionalDocumentIDList, ",")

  xmlArg =  "<root>" & _
    " <application application_id=""" & applicationID & """ />"

  if ubound(docArray) <> 0 then
    xmlArg = xmlArg & "<documents>"
    for i = 0 to ubound(docArray)
      docID = docArray(i)
      xmlArg = xmlArg & "<document variation_id=""" & docID & """ />"
    next
    xmlArg = xmlArg & "</documents>"
  end if

  xmlArg = xmlArg & "</root>"

  args = "extendedDataRequestXml=" & urlEncode(xmlArg)

  iWorkflowLogId = fnAddWorkflowLog("GetExtendedDocumentData", applicationID, xmlArg)
  set xmlResult = GenericAPICallXML("GetExtendedDocumentData", args)
  fnUpdateWorkflowLog iWorkflowLogId, applicationID, fnApiIif(xmlResult is nothing or xmlResult.documentElement is nothing, "", xmlResult.documentElement.xml)

  set GetExtendedDocumentData = xmlResult
end function

function UpdateExtendedDocumentData(applicationID, xmlExtendedData)
  'xmlExtendedData is the fully formed <extended_data> node to be sent to origen

  'public XmlDocument UpdateExtendedDocumentData(string sessionId, string extendedDataXml)
  'This method updates the extended document data cache stored at Origen.
  'See �UpdateExtendedDocumentData � request.xml� for the structure of the Xml document passed
  'in the �extendedDataXml� parameter.
  '
  'See �UpdateExtendedDocumentData � response.xml� for the structure of the returned Xml document.

  dim args, xmlArg, iWorkflowLogId, xmlResult

  xmlArg =  "<root>" & _
    " <application application_id=""" & applicationID & """ />"

  xmlArg = xmlArg & xmlExtendedData
  xmlArg = xmlArg & "</root>"

  args = "extendedDataXml=" & urlEncode(xmlArg)

  iWorkflowLogId = fnAddWorkflowLog("UpdateExtendedDocumentData", applicationID, xmlArg)
  set xmlResult = GenericAPICallXML("UpdateExtendedDocumentData", args)
  fnUpdateWorkflowLog iWorkflowLogId, applicationID, fnApiIif(xmlResult is nothing or xmlResult.documentElement is nothing, "", xmlResult.documentElement.xml)

  set UpdateExtendedDocumentData = xmlResult
end function

function GenerateDocumentPackage(applicationID, documentIDList, xmlExtendedData)
  'applicationID INT, documentIDList String, xmlExtendedData XML
  'example optionalDocumentIDList = "123,124,125,555,6646"
  'xmlExtendedData is the fully formed <extended_data> node to be sent to origen

  'public XmlDocument GenerateDocumentPackage(string sessionId, string documentPackageRequestXml)
  'This method generates a document package. See �GenerateDocumentPackage � request.xml� for the
  'structure of the Xml document passed in the �documentPackageRequestXml� parameter.
  '
  'See �GenerateDocumentPackage � response.xml� for the structure of the returned Xml document.
  'On successful completion, the returned value contains a package reference that is used as input
  'to the GetDocumentPackage() method.

  dim args, xmlArg, docID, docArray, i, iWorkflowLogId, xmlResult
  dim xmlRet, oErrorNode

  'first save the extended
  if trim(xmlExtendedData) <> "" then
    set xmlRet = UpdateExtendedDocumentData(applicationID, xmlExtendedData)
  end if

  docArray = split(documentIDList, ",")
  xmlArg =  "<root>" & _
    " <application application_id=""" & applicationID & """ />"

  'add documents node
  xmlArg = xmlArg & "<documents>"
  for i = 0 to ubound(docArray)
    docID = docArray(i)
    xmlArg = xmlArg & "<document variation_id=""" & docID & """ />"
  next
  xmlArg = xmlArg & "</documents>"

  'add extended_data node
  xmlArg = xmlArg & xmlExtendedData

  'close it
  xmlArg = xmlArg & "</root>"

  args = "documentPackageRequestXml=" & urlEncode(xmlArg)

  iWorkflowLogId = fnAddWorkflowLog("GenerateDocumentPackage", applicationID, xmlArg)
  set xmlResult = GenericAPICallXML("GenerateDocumentPackage", args)
  fnUpdateWorkflowLog iWorkflowLogId, applicationID, fnApiIif(xmlResult is nothing or xmlResult.documentElement is nothing, "", xmlResult.documentElement.xml)

  set GenerateDocumentPackage = xmlResult
end function

function GetDocumentPackage(applicationID, referenceCode)
  'public byte[] GetDocumentPackage(string sessionId, string packageReferenceXml)
  'This retrieves a previously generated document package. See �GetDocumentPackage � request.xml�
  'for the structure of the Xml document passed in the �packageReferenceXml� parameter.
  '
  'The returned value from this method is the PDF content stream.
  'If the specified package reference is invalid, an error is returned.

  dim url, requestString, sessionID, xmlArg, iWorkflowLogId

  'debug_out "<span class='origen_debug'>"
  'debug_out "GetDocumentPackages() Start: "& now()

  call ensureLogIn() 'make sure logged in
  sessionID = Session("origen_session_id")

  xmlArg = "<root>" & _
    " <application application_id=""" & applicationID & """ />" & _
    " <package_reference>" & referenceCode & "</package_reference>" & _
    "</root>"

  '~~~~~
  ' | Make API LINK Configurable v1.0b
  ' |   20090921 - PJL
  '~~~~~
  ' | url = "https://www.origenservices.com/Services/TenantScreeningAPI.asmx/GetDocumentPackage"
  '~~~~~
  url = session("QS_Origen_URL_Service") & "GetDocumentPackage"

  requestString = "SessionID=" & urlEncode(sessionID) _
    & "&packageReferenceXml=" & urlEncode(xmlArg)

  iWorkflowLogId = fnAddWorkflowLog("GetDocumentPackage", applicationID, xmlArg)

  'set GetDocumentPackage = GetHttpStream(url,requestString)
  GetDocumentPackage = GetHttpStream(url, requestString)

  fnUpdateWorkflowLog iWorkflowLogId, applicationID, ""

  'debug_out "GetDocumentPackage() End: "& now()
  'debug_out "</span>"
end function

'=============================================
' focus notes
'=============================================
function GetApplicationMessagesByHeader(HeaderId)
  dim sSqlLcl, _
      oRsLcl, _
      oDPumpLcl, _
      oMsgXML, _
      oMsgTempXML, _
      oTmp, _
      sTmp

  set oMsgXML = Server.CreateObject("MSXML2.DOMDocument")
  oMsgXML.async = false

  set oDPumpLcl = Server.CreateObject("EFTUtil.DataPump")
  sSqlLcl = "DISASTER..spGetAPSCRN_Applications " & HeaderId
  set oRsLcl = oDPumpLcl.GetData(sSqlLcl)

  while not oRsLcl.EOF
    set oMsgTempXML = GetApplicationMessages(oRsLcl("Application_Id"))

    set oTmp = oMsgTempXML.selectSingleNode("messages")
    oTmp.setAttribute "application_id", oRsLcl("Application_Id")
    oTmp.setAttribute "header_id", HeaderId

    sTmp = sTmp & oTmp.xml

    set oMsgTempXML = nothing
    oRsLcl.MoveNext
  wend

  oMsgXML.loadXML("<communication>" & sTmp & "</communication>")

  set oRsLcl      = nothing
  set oDPumpLcl   = nothing
  set oMsgTempXML = nothing
  set GetApplicationMessagesByHeader = oMsgXML
end function

function GetApplicationMessages(applicationID)
  dim args
  args = "ApplicationID=" & applicationID
  set GetApplicationMessages = GenericAPICallXML("GetApplicationMessages", args)
end function

function SendApplicationMessage(applicationID, replyToMessageID, recipient, subject, message)
  'sends a FocsNotes application message to the mailbox indicated. At this point it
  'looks as though �Underwriting� will always be the Recipient unless the business
  'decides to create a separate mailbox for these applications.
  dim args, txt, oHttpResponse
  args = "ApplicationID=" & applicationID & _
    "&ReplyToMessageID=" & replyToMessageID & _
    "&Recipient=" & Server.URLEncode(recipient) & _
    "&Subject=" & Server.URLEncode(subject) & _
    "&Message=" & Server.URLEncode(message)
  ' set oHttpResponse = GenericAPICallXML("SendApplicationMessage", args)
  ' txt = pullText()
  'if no BODY TEXT was returned (errors), then it was successful
  ' SendApplicationMessage = (trim(txt)="")

  SendApplicationMessage = GenericAPICallVoid("SendApplicationMessage", args)
end function

'=============================================
' credit reports
'=============================================
function GetCreditReportListing(applicationID, applicantID)
'Returns a list of available credit reports for the application, optionally filtered by applicant
  dim args
  args = "ApplicationID=" & applicationID & _
    "&ApplicantID=" & applicantID
  set GetCreditReportListing = GenericAPICallXML("GetCreditReports", args)
end function

function GetCreditReport(creditReportID)
'returns a specific formatted credit report as plain text.
  dim args
  args = "CreditReportID=" & creditReportID
  set GetCreditReport = GenericAPICallXML("GetCreditReport", args)
end function

function GetCurrentCreditReport(applicantID)
'returns the most recent formatted credit report for an applicant as plain text.
  dim args
  args = "ApplicantID=" & applicantID
  set GetCurrentCreditReport = GenericAPICallXML("GetCurrentCreditReport", args)
end function

'=============================================
' security
'=============================================
function GetUserTokens()
  'A new method has been published on the tenant screening API � GetUserTokens.
  'This will return a list of security token names (constants) for the currently logged on user that can be
  'used to control permissions. Simply, if the user has the token then they are allowed to perform the
  'corresponding action. For your purposes, I think that the ones that you will initially be interested in are:
  '
  '*�Can override resident screening TNG decision (API: CreditOverridePass and CreditOverrideFail)
  '   TK_APPTRACK_PORTAL_OVERRIDE � allows for both a Pass or a Fail override.
  '
  '* Can update customer conditions (API: UpdateCondition)
  '   TK_APPTRACK_CLEAR_CONDITION
  '   TK_APPTRACK_RESET_CONDITION
  '
  '* Can initiate a new background check (API: SubmitBackgroundCheck)
  '   TK_BCWS_ACCESS_REQUEST
  '
  '* Has access to background check results (hits) (API: GetBackgroundChecks)
  '   TK_BCWS_ACCESS
  '
  '* Can view background check details (view rap sheet) (API: GetBackgroundChecks when DetailLevel = 2 or GetBackgroundCheckDetail)
  '   TK_BCWS_ACCESS_DETAIL
  '
  '* Can update background check conditions (API: UpdateCondition)
  '   TK_APPTRACK_CLEAR_BG_CONDITION - approve
  '   TK_APPTRACK_CANCEL_BG_CONDITION - deny
  '   TK_APPTRACK_RESET_BG_CONDITION
  dim iWorkflowLogId
  iWorkflowLogId = fnAddWorkflowLog("GetUserTokens", "", "")
  set GetUserTokens = GenericAPICallXML("GetUserTokens", "")
  fnUpdateWorkflowLog iWorkflowLogId, "", fnApiIif(GetUserTokens is nothing or GetUserTokens.documentElement is nothing, "", GetUserTokens.documentElement.xml)
end function

'/////////////////////////////////////////////////////////////////
' GetUserPermissions()
'
' returns a dictionary object containing all available tokens and subtokens
' key/value pairs come in two flavors
'
'   key = token                         ex: "TK_APPTRACK_HIDE_FORMS"
'   value = empty array                 ex: []
'
'   key = token                         ex: "TK_APPTRACK_CLEAR_CONDITION"
'   value = array of subtoken arrays    ex: [ [ "CONDITION_231", "IP_37" ]
'                                             [ "CONDITION_232", "IP_37" ]
'                                             [ "CONDITION_233", "IP_37" ]
'                                             [ "CONDITION_237", "IP_37" ]
'                                             [ "CONDITION_238", "IP_37" ]
'                                             [ "CONDITION_258", "IP_37,IP_63" ]
'                                           ]
'
function GetUserPermissions()
  dim oTokensDictionary, oTokens, oToken, oSubTokens, subTokensArray, subTokenIndex, oSubToken

  set oTokensDictionary = server.CreateObject("Scripting.Dictionary")

  set oTokens = GetUserTokens()
  for each oToken in oTokens.selectNodes("//token")
    set oSubTokens = oToken.selectNodes("sub_token")
    subTokensArray = Array()
    if not (oSubTokens is nothing) and oSubTokens.length > 0 then
      redim subTokensArray(oSubTokens.length)
      subTokenIndex = 0
      for each oSubToken in oSubTokens
        subTokensArray(subTokenIndex) = Array(oSubToken.getAttribute("key"), oSubToken.getAttribute("value"))
        subTokenIndex = subTokenIndex + 1
      next
    end if
    oTokensDictionary.Add oToken.text, subTokensArray
  next
  set oTokens = nothing

  set GetUserPermissions = oTokensDictionary
end function

'/////////////////////////////////////////////////////////////////
' GetUserSubTokens()
'
' Extracts the array of subtokens for a given token in the
' tokens dictionary. Returns an empty array if the token
' is not found in the dictionary.
'
function GetUserSubTokens(oTokensDictionary, token)
  dim subTokensArray, subTokenCount
  GetUserSubTokens = Array()
  if not (oTokensDictionary is nothing) then
    if oTokensDictionary.exists(token) then
      subTokensArray = oTokensDictionary(token)
      subTokenCount = ubound(subTokensArray)
      if subTokenCount > 0 then
        GetUserSubTokens = subTokensArray
      end if
    end if
  end if
end function

'/////////////////////////////////////////////////////////////////
function TransformBackgroundCheck(oSource)
  dim oXSL, oXML
  dim oOutput
  dim sXSLTFilePath

  debug_out "<span class='origen_debug'>"
  debug_out "TransformBackgroundCheck() Start: " & now()

  'load the source (or reload, into the correct object type)
  'set oXML = server.CreateObject("MSXML2.DOMDocument.6.0")
  set oXML = server.CreateObject("MSXML2.DOMDocument")
  oXML.validateOnParse = true
  oXML.async = false
  if not oXML.load(oSource) then
    Dim myErr
    Set myErr = oXML.parseError
    response.write myErr.reason
    err.Raise 9999, "apiOrigen.asp", "TransformBackgroundCheck: xml Data Source did not load"
    set TransformBackgroundCheck = nothing
    exit function
  end if

  'load the stylesheet
  sXSLTFilePath = server.MapPath("/ApplicantScreening/Transformation/BackgroundCheck_TRANSFORM.xslt")

  'set oXSL = server.CreateObject("MSXML2.DOMDocument.6.0")
  set oXSL = server.CreateObject("MSXML2.DOMDocument")
  oXSL.validateOnParse = true
  oXSL.async = false

  if not oXSL.load (sXSLTFilePath) then
    err.Raise 9999, "apiOrigen.asp", "TransformBackgroundCheck: xslt Transformation File did not load"
    set TransformBackgroundCheck = nothing
    exit function
  end if

  'create an object to hold the XML OUTPUT
  'set oOutput = server.CreateObject("MSXML2.DOMDocument.6.0")
  set oOutput = server.CreateObject("MSXML2.DOMDocument")
  oOutput.validateOnParse = true
  oOutput.async = false

  'because we are returning the new XML object, we need to call the "TransformNodeToObject" method
  '(the output is the second object)
  oXML.transformNodeToObject oXSL, oOutput

  'for debugging...
  if origen_api_debug then
    showXML(oOutput)
  end if

  set TransformBackgroundCheck = oOutput

  debug_out "TransformBackgroundCheck End: " & now()
  debug_out "</span>"
end function

'/////////////////////////////////////////////////////////////////
function ValidateApplicationXML(xmlText)
  dim oXMLDoc, oXMLSchema, oSchemaDOM, oXMLLookups
  dim schemaURL, applicationType
  dim isValid, i, sXML
  dim oSchemaErrors, oErr, s

  isValid = false
  Set oXMLDoc = server.CreateObject("MSXML2.DOMDocument.6.0")
  Set oSchemaDOM = server.CreateObject("MSXML2.DOMDocument.6.0")
  set oXMLSchema = server.createObject("MSXML2.XMLSchemaCache.6.0")

  set oXMLLookups = GetLookups()

  oXMLDoc.async = false
  oXMLDoc.validateOnParse = false

  if oXMLDoc.loadXML(xmlText) then
    applicationType = oXMLDoc.selectSingleNode("application").getAttribute("type")
    'response.write "before:" & applicationType & "<br/>"
    'response.write replace(replace(oXMLLookups.xml,"<", "&lt;"),">", "&gt;")

    debug_out "application Type = " & applicationType

    '~~~~~
    ' | Make API LINK Configurable v1.0b
    ' |   20090921 - PJL
    '~~~~~
    ' | schemaURL = "https://www.origenservices.com/Services/VSTAGING1/Schemas/"& applicationType &".xsd"
    '~~~~~

    dim t1, t2
    set t1 = oXMLLookups.selectSingleNode("/lookups/application_type[application_type='" & applicationType & "']")
    if not t1 is nothing then
      set t2 = t1.selectSingleNode("schema_name")
      if not t2 is nothing then
        applicationType = t2.text
      else
        applicationType = applicationType & ".xsd"
      end if
    else
      applicationType = applicationType & ".xsd"
    end if

    set oXMLLookups = nothing
    set t1 = nothing
    set t2 = nothing

    'response.write "after:" & applicationType

    schemaURL = session("QS_Origen_URL_Schema") & applicationType
    debug_out schemaURL

    sXML = GetHttpContent(schemaURL).responseText
    if not oSchemaDOM.loadXML(sXML) then
      err.Raise 9999, "apiOrigen.asp", "Schema not available: " & schemaURL
    end if

    oXMLSchema.add "", oSchemaDOM

    set oXMLDoc.schemas = oXMLSchema
    isValid = IsValidXML(oXMLDoc)
  end if

  ValidateApplicationXML = isValid
end function

'/////////////////////////////////////////////////////////////////
function IsValidXML(oXML)
  dim oXMLErrors, oErr, i, isValid

  'allow multiple errors tracking
  oXML.setProperty "MultipleErrorMessages", true

  set oXMLErrors = oXML.validate()
  isValid = (oXMLErrors.errorCode = 0)
  debug_out "isValid = " & isValid
  if not isValid then
    set origen_validation_errors = server.CreateObject("Scripting.dictionary")
    debug_out "Errors returned: " & oXMLErrors.allErrors.length
    for i = 0 to oXMLErrors.allErrors.length - 1
      set oErr = oXMLErrors.allErrors.item(i)
      debug_out "Error #" & i
      debug_out "... reason: " & oErr.reason
      debug_out "... location: " & oErr.errorXPath

      origen_validation_errors.Add i + 1, oErr
    next
  end if

  IsValidXML = isValid
end function

function fnGetOrigenValidationErrorsForWFLog()
  dim errors, errorItem, error
  errors = ""
  if ( not (origen_validation_errors is nothing) ) then
    for each errorItem in origen_validation_errors
      set error = origen_validation_errors(errorItem)
      if ( not (error is nothing) ) then
        errors = errors & vbnewline & "  <error" &_
          " " & fnApiEncodeXmlAttribute("errorCode", cstr(error.errorCode)) &_
          " " & fnApiEncodeXmlAttribute("filepos", cstr(error.filepos)) &_
          " " & fnApiEncodeXmlAttribute("line", cstr(error.line)) &_
          " " & fnApiEncodeXmlAttribute("linepos", cstr(error.linepos)) &_
          " " & fnApiEncodeXmlAttribute("srcText", error.srcText) &_
          " " & fnApiEncodeXmlAttribute("errorXPath", trim(error.errorXPath)) &_
          ">" & fnApiEncodeXmlText(error.reason) & "</error>"
      end if
    next
    errors = "<errors>" & errors & vbnewline & "</errors>"
  end if
  fnGetOrigenValidationErrorsForWFLog = errors
end function

sub debug_out(text)
  if origen_api_debug then
    cout(text)
  end if
end sub

sub cout(text)
  if origen_api_debug_to_file then
    if origen_api_debug_file_system_object is nothing then
      set origen_api_debug_file_system_object = server.CreateObject("scripting.filesystemobject")
      set origen_api_debug_file = origen_api_debug_file_system_object.OpenTextFile("c:\origen_debug.txt", 8, true)
      origen_api_debug_file.writeLine "+++++++++++++++++++++++++++++++++++++++++"
      origen_api_debug_file.WriteLine "START DEBUG: " & now
      origen_api_debug_file.writeLine "+++++++++++++++++++++++++++++++++++++++++"
    end if
    origen_api_debug_file.writeLine text
  else
    Response.Write text & "<BR>"
  end if
end sub

sub ErrorNoXMLData()
  if origen_api_debug = true then
    cout "<span class='origen_debug'>"
    cout "Error No Data: " & now()

    showText PullText()

    cout "</span>"
    cout "</span>" 'one more, for the section we are in...
  end if

  err.Raise 9999, "apiOrigen.asp", "No Data Returned: " & PullText()
end sub

function ReturnErrorNoXMLData()
  if origen_api_debug = true then
    cout "<span class='origen_debug'>"
    cout "Error No Data: " & now()

    showText PullText()

    cout "</span>"
    cout "</span>" 'one more, for the section we are in...
  end if

  dim oXML
  Set oXML = server.CreateObject("MSXML2.DOMDocument")
  oXML.loadXML(ReturnError(9999, PullText()))

  set ReturnErrorNoXMLData = oXML
end function

function ReturnError(errID, errDesc)
  dim s
  s = "<error id=""" & errID & """>"
  s = s & server.HTMLEncode(errDesc)
  s = s & "</error>"

  ReturnError = s
end function

'/////////////////////////////////////////////////////////////////
function GetOrigenOptionList(oXML, currentValue, selectNodesPath, valueNode, textNode, flagNode, createEmptyOption)
  dim oNodes, oNode, ret
  dim val,text,flag
  set oNodes = oXML.selectNodes(selectNodesPath)

  if createEmptyOption then
    ret = "<option flag=""" & """ value=""" & """></option>"
  else
    ret = ""
  end if

  for each oNode in oNodes
    val = oNode.selectSingleNode(valueNode).text
    text = oNode.selectSingleNode(textNode).text
    if flagNode <> "" then
      flag = oNode.selectSingleNode(flagNode).text
    end if

    ret = ret & "<option"
    if lcase(trim(val)) = lcase(trim(currentValue)) or oNodes.length = 1 then
      ret = ret & " selected"
    end if
    ret = ret & " flag=""" & flag & """"
    ret = ret & " value=""" & val & """>"
    ret = ret & text
    ret = ret & "</option>"
  next
  GetOrigenOptionList = ret
end function

'/////////////////////////////////////////////////////////////////
sub showXML(oXML)
  showText oXML.xml
end sub

sub showText(text)
  'Response.Write "<PRE>"
  'Response.Write  server.HTMLEncode( text )
  'Response.Write "</PRE>"

  cout "<PRE>"
  if origen_api_debug_to_file then
    cout text
  else
    cout  server.HTMLEncode( text )
  end if
  cout "</PRE>"
end sub

'/////////////////////////////////////////////////////////////////
function urlEncode(val)
  urlEncode = server.URLEncode(val)
end function

function xmlDateLong(dt)
  dim str
  str = xmlDate(dt) & "T" & numPlaces(datepart("h", dt), 2) & ":" & numPlaces(datepart("n", dt), 2) & ":" & numPlaces(datepart("s", dt), 2)
  xmlDateLong = str
end function

function xmlDate(dt)
  dim str
  str = str & datepart("yyyy", dt) & "-" & numPlaces(datepart("m", dt), 2) & "-" & numPlaces(datepart("d", dt), 2)
  xmlDate = str
end function

function numPlaces(num, places)
  numPlaces = right(String(places, "0") & num, places)
end function

'==============================================
'HTTP functions
'==============================================
function PullXML()
  'extract from current global http object
  set PullXML = origen_api_http_server.responseXML
end function

function PullText()
  'extract from current global http object
  PullText = origen_api_http_server.responseText
end function

function GetHttpContent(url)
  if origen_api_http_server is nothing then
    Set origen_api_http_server = CreateObject("MSXML2.ServerXMLHttp")
  end if
  origen_api_http_server.SetTimeouts http_resolveTimeout, http_connectTimeout, http_sendTimeout, http_receiveTimeout
  origen_api_http_server.open "GET", url, false
  on error resume next
  origen_api_http_server.send()
  if Err.number <> 0 then
    Response.Write "An error occured connecting to Origen's servers. <br>"
    Response.Write "Error: " & Err.number & "..." & Err.description & "<BR>"
    Response.Write "<a href=""javascript:window.location.reload(false);"">Retry</a>"
    'Response.Write "URL..."
    showText url
    Response.End
  end if
  on error goto 0

  if origen_api_debug = true then
    Response.write "ReadyState = " & origen_api_http_server.readyState & "<BR>"
  end if

  set GetHttpContent = origen_api_http_server
end function

function GetHttpResponse(url, requestString)
  if origen_api_http_server is nothing then
    Set origen_api_http_server = CreateObject("MSXML2.ServerXMLHttp")
  end if
  '1000ths of a second (1 second = 1000)
  'resolveTimeout, connectTimeout, sendTimeout, receiveTimeout
  origen_api_http_server.SetTimeouts http_resolveTimeout, http_connectTimeout, http_sendTimeout, http_receiveTimeout
  origen_api_http_server.open "POST", url, false
  origen_api_http_server.setRequestHeader "Content-Type","application/x-www-form-urlencoded"
  on error resume next
  origen_api_http_server.send requestString
  if Err.number <> 0 then
    Response.Write "An error occured connecting to Origen's servers. <br>"
    Response.Write "Error: " & Err.number & "..." & Err.description & "<BR>"
    Response.Write "<a href=""javascript:window.location.reload(false);"">Retry</a>"
    'Response.Write "URL..."
    showText url
    Response.End
  end if
  on error goto 0

  if origen_api_debug = true then
    Response.write "ReadyState = " & origen_api_http_server.readyState & "<BR>"
  end if

  set GetHttpResponse = origen_api_http_server
end function

function DoHttpPost(url, requestString)
  dim oHttpRet
  set oHttpRet = GetHttpResponse(url, requestString)
  doHttpPost = oHttpRet.responseText

  if origen_api_debug = true then
    Response.Write "url: " & url & "<br>"
    Response.Write "request: " & requestString & "<br>"
    Response.Write "return: " & doHttpPost & "<BR>"
  end if
end function

function GetHttpXML(url, requestString)
  dim oHttpRet
  set oHttpRet = GetHttpResponse(url, requestString)
  set getHttpXML = oHttpRet.responseXML

  if origen_api_debug = true then
    Response.Write "url: " & url & "<br>"
    Response.Write "request: " & requestString & "<br>"
    showXML(getHttpXML)
  end if
end function

function GetHttpStream(url, requestString)
  dim oHttpRet
  set oHttpRet = GetHttpResponse(url, requestString)

  GetHttpStream = oHttpRet.responseBody
  'Response.Write oHTTPRet.responseBody

  'set GetHttpStream = oHttpRet.responseStream
  'set GetHttpStream = oHttpRet.responseBody

  'if origen_api_debug=true then
  ' Response.Write "url: "& url &"<br>"
  ' Response.Write "request: "& requestString &"<br>"
  ' showXML(GetHttpStream)
  'end if
end function

function fnGetOrigenServicesURL(vCompanyId)
  dim oDPumpLcl, _
      oRSLcl, _
      sSqlLcl, _
      sApiUrl, _
      sApiSchemaUrl, _
      HTTP_ResolveTimeout, _
      HTTP_ConnectTimeout, _
      HTTP_SendTimeout, _
      HTTP_ReceiveTimeout

  set oDPumpLcl = Server.CreateObject("EFTUtil.DataPump")
  sSqlLcl = "DISASTER..spGet_APSCRN_API_By_Company " & vCompanyId
  set oRSLcl = oDPumpLcl.GetData(sSqlLcl)

  sApiUrl = oRSLcl("API_Link")
  sApiSchemaUrl = oRSLcl("API_Schema_Link")
  HTTP_ResolveTimeout = oRSLcl("HTTP_ResolveTimeout")
  HTTP_ConnectTimeout = oRSLcl("HTTP_ConnectTimeout")
  HTTP_SendTimeout = oRSLcl("HTTP_SendTimeout")
  HTTP_ReceiveTimeout = oRSLcl("HTTP_ReceiveTimeout")

  set oDPumpLcl = nothing
  set oRSLcl = nothing

  session("QS_Origen_URL_Service") = sApiUrl & "/"
  session("QS_Origen_URL_Schema") = sApiSchemaUrl
  session("QS_Origen_URL_HTTP_ResolveTimeout") = HTTP_ResolveTimeout
  session("QS_Origen_URL_HTTP_ConnectTimeout") = HTTP_ConnectTimeout
  session("QS_Origen_URL_HTTP_SendTimeout") = HTTP_SendTimeout
  session("QS_Origen_URL_HTTP_HTTP_ReceiveTimeout") = HTTP_ReceiveTimeout
end function

function ZipCodeLookup(sZipCode,sCountryCode)
  dim url, requestString, sessionID
  dim oXML

  debug_out "<span class='origen_debug'>"
  debug_out "ZipCodeLookup() Start: " & now()

  call ensureLogIn() 'make sure logged in
  sessionID = Session("origen_session_id")

  '~~~~~
  ' | Make API LINK Configurable v1.0b
  ' |   20090921 - PJL
  '~~~~~
  ' | url = "https://www.origenservices.com/Services/TenantScreeningAPI.asmx/GetApplication"
  '~~~~~
  url = session("QS_Origen_URL_Service") & "PostCodeLookup"

  requestString = "SessionID=" & urlEncode(sessionID) _
    & "&PostCode=" & sZipCode _
    & "&CountryCode=" & sCountryCode

  set oXML = GetHttpXML(url, requestString)
  if trim(oXML.xml) = "" then
    set oXML = ReturnErrorNoXMLData()
  end if

  set ZipCodeLookup = oXML

  debug_out "ZipCodeLookup() End: " & now()
  debug_out "</span>"
end function

function ApplicationApprovalOverride(applicationID)
  dim url, requestString, sessionID, oXML, iWorkflowLogId

  debug_out "<span class='origen_debug'>"
  debug_out "ApplicationApprovalOverride() Start: " & now()

  call ensureLogIn() 'make sure logged in
  sessionID = Session("origen_session_id")

  '~~~~~
  ' | Make API LINK Configurable v1.0b
  ' |   20090921 - PJL
  '~~~~~
  ' | url = "https://www.origenservices.com/Services/TenantScreeningAPI.asmx/GetApplication"
  '~~~~~
  url = session("QS_Origen_URL_Service") & "ApplicationApprovalOverride"

  requestString = "SessionID=" & urlEncode(sessionID) _
    & "&ApplicationID=" & applicationID

  iWorkflowLogId = fnAddWorkflowLog("ApplicationApprovalOverride", cstr(applicationID), "")

  set oXML = GetHttpXML(url, requestString)
  if trim(oXML.xml) = "" then
    set oXML = ReturnErrorNoXMLData()
  end if

  fnUpdateWorkflowLog iWorkflowLogId, cstr(applicationID), fnApiIif(oXML is nothing or oXML.documentElement is nothing, "", oXML.documentElement.xml)

  set ApplicationApprovalOverride = oXML

  debug_out "ApplicationApprovalOverride() End: " & now()
  debug_out "</span>"
end function

function AcceptTermsOfUse(vSessionID, vTermsOfUseID)
  dim url, requestString, sessionID, oXML

  debug_out "<span class='origen_debug'>"
  debug_out "AcceptTermsOfUse() Start: " & now()

  '~~~~~
  ' | Make API LINK Configurable v1.0b
  ' |   20090921 - PJL
  '~~~~~
  ' | url = "https://www.origenservices.com/Services/TenantScreeningAPI.asmx/GetApplication"
  '~~~~~
  url = session("QS_Origen_URL_Service") & "AcceptTermsOfUse"

  requestString = "SessionID=" & urlEncode(vSessionID) _
    & "&TermsOfUseID=" & vTermsOfUseID

  set oXML = GetHttpXML(url, requestString)
  if trim(oXML.xml) = "" then
    set oXML = ReturnErrorNoXMLData()
  end if

  set AcceptTermsOfUse = oXML

  debug_out "AcceptTermsOfUse() End: " & now()
  debug_out "</span>"
end function

function GetClientOptions()
  dim url, requestString, sessionID, oXML, iWorkflowLogId

  debug_out "<span class='origen_debug'>"
  debug_out "GetClientOptions() Start: " & now()

  call ensureLogIn() 'make sure logged in
  sessionID = Session("origen_session_id")

  '~~~~~
  ' | Make API LINK Configurable v1.0b
  ' |   20090921 - PJL
  '~~~~~
  ' | url = "https://www.origenservices.com/Services/TenantScreeningAPI.asmx/GetLookups"
  '~~~~~
  url = session("QS_Origen_URL_Service") & "GetClientOptions"

  requestString = "SessionID=" & urlEncode(sessionID)

  iWorkflowLogId = fnAddWorkflowLog("GetClientOptions", "", "")

  set oXML = GetHttpXML(url, requestString)
  if trim(oXML.xml) = "" then
    ErrorNoXMLData
  end if

  fnUpdateWorkflowLog iWorkflowLogId, "", fnApiIif(oXML is nothing or oXML.documentElement is nothing, "", oXML.documentElement.xml)

  set GetClientOptions = oXML

  debug_out "GetClientOptions() End: " & now()
  debug_out "</span>"
end function

function DuplicateSSNCheck(vCommunityID, vSSNList)
  dim url, requestString, sessionID, oXML

  debug_out "<span class='origen_debug'>"
  debug_out "DuplicateSSNCheck() Start: " & now()

  call ensureLogIn() 'make sure logged in
  sessionID = Session("origen_session_id")

  '~~~~~
  ' | Make API LINK Configurable v1.0b
  ' |   20090921 - PJL
  '~~~~~
  ' | url = "https://www.origenservices.com/Services/TenantScreeningAPI.asmx/GetLookups"
  '~~~~~
  url = session("QS_Origen_URL_Service") & "DuplicateSSNCheck"

  requestString = "SessionID=" & urlEncode(sessionID) & _
    "&CommunityID=" & urlEncode(vCommunityID) & _
    "&SSNList=" & urlEncode(vSSNList)

  set oXML = GetHttpXML(url, requestString)
  if trim(oXML.xml) = "" then
    ErrorNoXMLData
  end if
  set DuplicateSSNCheck = oXML

  debug_out "DuplicateSSNCheck() End: " & now()
  debug_out "</span>"
end function

function UncancelApplication(vApplicationID)
  dim url, requestString, sessionID, oXML, iWorkflowLogId

  debug_out "<span class='origen_debug'>"
  debug_out "UncancelApplication() Start: " & now()

  call ensureLogIn() 'make sure logged in
  sessionID = Session("origen_session_id")

  '~~~~~
  ' | Make API LINK Configurable v1.0b
  ' |   20090921 - PJL
  '~~~~~
  ' | url = "https://www.origenservices.com/Services/TenantScreeningAPI.asmx/GetLookups"
  '~~~~~
  url = session("QS_Origen_URL_Service") & "UncancelApplication"

  requestString = "SessionID=" & urlEncode(sessionID) & _
    "&ApplicationID=" & urlEncode(vApplicationID)

  iWorkflowLogId = fnAddWorkflowLog("UncancelApplication", cstr(vApplicationID), "")

  set oXML = GetHttpXML(url, requestString)
  if trim(oXML.xml) = "" then
    set oXML = ReturnErrorNoXMLData()
  end if

  fnUpdateWorkflowLog iWorkflowLogId, cstr(vApplicationID), ""

  set UncancelApplication = oXML

  debug_out "UncancelApplication() End: " & now()
  debug_out "</span>"
end function

function UpdateClientOptions(vClientOptions)
  dim url, requestString, sessionID, oXML

  debug_out "<span class='origen_debug'>"
  debug_out "UpdateClientOptions() Start: " & now()

  call ensureLogIn() 'make sure logged in
  sessionID = Session("origen_session_id")

  '~~~~~
  ' | Make API LINK Configurable v1.0b
  ' |   20090921 - PJL
  '~~~~~
  ' | url = "https://www.origenservices.com/Services/TenantScreeningAPI.asmx/GetLookups"
  '~~~~~
  url = session("QS_Origen_URL_Service") & "UpdateClientOptions"

  requestString = "SessionID=" & urlEncode(sessionID) & _
    "&xml=" & urlEncode(vClientOptions)

  set oXML = GetHttpXML(url, requestString)
  if trim(oXML.xml) = "" then
    set oXML = ReturnErrorNoXMLData()
  end if

  set UpdateClientOptions = oXML

  debug_out "UpdateClientOptions() End: " & now()
  debug_out "</span>"
end function

function SubmitCondition(vApplicationID, vConditionID, vConditionText, vCorrelationKey)
  dim url, requestString, sessionID, oXML, iWorkflowLogId

  debug_out "<span class='origen_debug'>"
  debug_out "SubmitCondition() Start: " & now()

  call ensureLogIn() 'make sure logged in
  sessionID = Session("origen_session_id")

  '~~~~~
  ' | Make API LINK Configurable v1.0b
  ' |   20090921 - PJL
  '~~~~~
  ' | url = "https://www.origenservices.com/Services/TenantScreeningAPI.asmx/GetLookups"
  '~~~~~
  url = session("QS_Origen_URL_Service") & "SubmitCondition"

  requestString = "SessionID=" & urlEncode(sessionID) & _
    "&ApplicationID=" & urlEncode(vApplicationID) & _
    "&ConditionID=" & urlEncode(vConditionID) & _
    "&ConditionText=" & urlEncode(vConditionText) & _
    "&CorrelationKey=" & urlEncode(vCorrelationKey)

  iWorkflowLogId = fnAddWorkflowLog("SubmitCondition", cstr(vApplicationID), "<ConditionInfo " & _
    fnApiEncodeXmlAttribute("condition_id", cstr(vConditionID)) & " " & _
    fnApiEncodeXmlAttribute("condition_text", cstr(vConditionText)) & " " & _
    fnApiEncodeXmlAttribute("correlation_key", cstr(vCorrelationKey)) & " />")

  set oXML = GetHttpXML(url, requestString)
  if trim(oXML.xml) = "" then
    set oXML = ReturnErrorNoXMLData()
  end if

  fnUpdateWorkflowLog iWorkflowLogId, cstr(vApplicationID), ""

  set SubmitCondition = oXML

  debug_out "SubmitCondition() End: " & now()
  debug_out "</span>"
end function


function fnAddWorkflowLog(sCallAction, sApplicationId, sSentEnvelopeData)
  dim sUserId, sOfsSessionId, sOfsLogin, sOfsApiUrl, sEnvelopeSent, sSQL, oDPump, rsWorkflowLog

  sUserId = trim(cstr(fnApiIfNull(session("userid"), "")))
  sOfsSessionId = trim(cstr(fnApiIfNull(session("origen_session_id"), "")))
  sOfsLogin = trim(cstr(fnApiIfNull(session("origen_login"), "")))
  sOfsApiUrl = trim(cstr(fnApiIfNull(session("QS_Origen_URL_Service"), "")))

  sEnvelopeSent = "<" & sCallAction & " " & fnApiEncodeXmlAttribute("origen_api_url", sOfsApiUrl)
  sApplicationId = trim(sApplicationId)
  if sApplicationId <> "" then
    sEnvelopeSent = sEnvelopeSent & " " & fnApiEncodeXmlAttribute("application_id", sApplicationId)
  end if
  if trim(sSentEnvelopeData) = "" then
    sEnvelopeSent = sEnvelopeSent & " />"
  else
    sEnvelopeSent = sEnvelopeSent & ">" & sSentEnvelopeData & "</" & sCallAction & ">"
  end if

  sSQL = "exec disaster..spAdd_APSCRN_Workflow_Log " & _
    "@usr_id = " & fnApiSqlNum(sUserId) & ", " & _
    "@ofs_session_id = " & fnApiSqlText(sOfsSessionId) & ", " & _
    "@ofs_login = " & fnApiSqlText(sOfsLogin) & ", " & _
    "@ofs_application_id = " & fnApiSqlText(trim(sApplicationId)) & ", " & _
    "@call_action = " & fnApiSqlText(sCallAction) & ", " & _
    "@envelope_sent = " & fnApiSqlText(sEnvelopeSent)

  set oDPump = Server.CreateObject("EFTUtil.DataPump")
  set rsWorkflowLog = oDPump.getdata(sSQL)
  fnAddWorkflowLog = rsWorkflowLog("id")

  set rsWorkflowLog = nothing
  set oDPump = nothing
end function

function fnUpdateWorkflowLog(iWorkflowLogId, sApplicationId, sReceivedEnvelopeData)
  dim sSQL, oDPump, rsWorkflowLog

  sSQL = "exec disaster..spUpd_APSCRN_Workflow_Log " & _
    "@id = " & fnApiSqlNum(iWorkflowLogId) & ", " & _
    "@ofs_application_id = " & fnApiSqlText(sApplicationId) & ", " & _
    "@envelope_received = " & fnApiSqlText(sReceivedEnvelopeData)

  set oDPump = Server.CreateObject("EFTUtil.DataPump")
  set rsWorkflowLog = oDPump.getdata(sSQL)
  fnUpdateWorkflowLog = rsWorkflowLog("id")

  set rsWorkflowLog = nothing
  set oDPump = nothing
end function

function fnGetWFLogErrorsXml(errText)
  fnGetWFLogErrorsXml = "<errors>" & vbnewline & "  <error>" & fnApiEncodeXmlText(errText) & "</error>" & vbnewline & "</errors>"
end function

'=======================================================================================
function fnApiEncodeXmlAttribute(sAttributeName, sText)
  if isnull(sAttributeName) or sAttributeName = "" then
    fnApiEncodeXmlAttribute = ""
  else
    fnApiEncodeXmlAttribute = sAttributeName & "=""" & fnApiEncodeXmlText(sText) & """"
  end if
end function

'=======================================================================================
function fnApiEncodeXmlText(sText)
  dim sTempText

  sTempText = sText
  if isnull(sTempText) then
    sTempText = ""
  else
    sTempText = replace(sTempText, "&", "&amp;")
    sTempText = replace(sTempText, "'", "&apos;")
    sTempText = replace(sTempText, """", "&quot;")
    sTempText = replace(sTempText, "<", "&lt;")
    sTempText = replace(sTempText, ">", "&gt;")
  end if

  fnApiEncodeXmlText = sTempText
end function

'=======================================================================================
function fnApiExtractApplicationIDFromXmlString(sApplicationXml, sXPath)
  fnApiExtractApplicationIDFromXmlString = ""
  dim oXmlDoc
  set oXmlDoc = server.CreateObject("MSXML2.DOMDocument.6.0")
  oXmlDoc.async = false
  oXmlDoc.validateOnParse = false
  if oXmlDoc.loadXML(sApplicationXml) then
    fnApiExtractApplicationIDFromXmlString = fnApiExtractApplicationIDFromXml(oXmlDoc, sXPath)
  end if
  set oXmlDoc = nothing
end function

'=======================================================================================
function fnApiExtractApplicationIDFromXml(oApplicationXml, sXPath)
  dim oApplicationIdXml
  fnApiExtractApplicationIDFromXml = ""
  if not oApplicationXml is nothing then
    set oApplicationIdXml = oApplicationXml.selectSingleNode(sXPath)
    if not oApplicationIdXml is nothing then
      fnApiExtractApplicationIDFromXml = trim(oApplicationIdXml.text)
    end if
  end if
end function

'=======================================================================================
function fnApiIif(val, ifTrue, ifFalse)
  if (val) then
    fnApiIif = ifTrue
  else
    fnApiIif = ifFalse
  end if
end function

'=======================================================================================
function fnApiIfNull(val, altVal)
  if isnull(val) then
    fnApiIfNull = altval
  else
    fnApiIfNull = val
  end if
end function

'=======================================================================================
function fnApiSqlNum(v)
  If cstr(fnApiIfNull(v, "")) = "" Then
    fnApiSqlNum = "null"
  Else
    fnApiSqlNum = v
  End If
end Function

'=======================================================================================
function fnApiSqlText(v)
  if cstr(fnApiIfNull(v, "")) = "" Then
    fnApiSqlText = "null"
  else
    fnApiSqlText = "'" & replace(v, "'", "''") & "'"
  end if
end Function

%>