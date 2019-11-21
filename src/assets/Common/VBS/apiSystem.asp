<%
IEOnlyLevel3Check
sub IEOnlyLevel3Check
	dim usr_agent, isIE
	usr_agent = request.serverVariables("HTTP_USER_AGENT")
	isIE = false
	if InStr(usr_agent,"MSIE") > 0 then
		isIE = true
	end if
	if InStr(usr_agent,"Windows NT") > 0 and InStr(usr_agent,"rv:11") > 0 then
		isIE = true
	end if
	if (isIE = false or Is_Mobile_Local) and trim(session("level_code"))="3"  then 
		'response.redirect("login_access_deny.asp")
	    'response.end
	end if
end sub
sub LockoutNonIE
	dim usr_agent, isIE
	usr_agent = request.serverVariables("HTTP_USER_AGENT")
	isIE = false
	if InStr(usr_agent,"MSIE") > 0 then
		isIE = true
	end if
	if InStr(usr_agent,"Windows NT") > 0 and InStr(usr_agent,"rv:11") > 0 then
		isIE = true
	end if
	if (isIE = false or Is_Mobile_Local) then 
		response.redirect("/Login2/login_access_deny.asp")
	    response.end
	end if
end sub
function Is_Mobile_Local() 
    dim user_agent, mobile_browser, Regex, match, mobile_agents, mobile_ua, i, size
    
    user_agent = Request.ServerVariables("HTTP_USER_AGENT")
    mobile_browser = 0
    
    set Regex = new RegExp
    
    with Regex
    .Pattern = "(up.browser|up.link|mmp|symbian|smartphone|midp|wap|phone|windows ce|pda|mobile|mini|palm)"
    .IgnoreCase = true
    .Global = true
    end with

    match = Regex.Test(user_agent)
    if match then 
        mobile_browser = mobile_browser+1
    
        if InStr(Request.ServerVariables("HTTP_ACCEPT"), "application/vnd.wap.xhtml+xml") or not IsEmpty(Request.ServerVariables("HTTP_X_PROFILE")) or not IsEmpty(Request.ServerVariables("HTTP_PROFILE")) then
            mobile_browser = mobile_browser+1
        end If
    
        mobile_agents = array("alcatel", "amoi", "android", "avantgo", "blackberry", "benq", "cell", "cricket", "docomo", "elaine", "htc", "iemobile", "iphone", "ipad", "ipaq", "ipod", "j2me", "java", "midp", "mini", "mmp", "mobi", "motorola", "nec-", "nokia", "palm", "panasonic", "philips", "phone", "sagem", "sharp", "sie-", "smartphone", "sony", "symbian", "t-mobile", "telus", "up\.browser", "up\.link", "vodafone", "wap", "webos", "wireless", "xda", "xoom", "zte")

        size = ubound(mobile_agents)
        mobile_ua = LCase(Left(user_agent, 4))
        for i = 0 to size
            if mobile_agents(i) = mobile_ua then
                mobile_browser = mobile_browser+1
                exit for
            end if
        next

	    if mobile_browser>0 then
	        Is_Mobile_Local=true
	    else
	        Is_Mobile_Local=false
	    end if
	else 
	        Is_Mobile_Local=false	
	end if
End Function 

dim API_systemVersion
dim API_serverName

''''''''''''''''''''
'ONLOADING... automatically call the API_INIT() sub
call API_INIT()
''''''''''''''''''''

sub API_INIT()
	'get system api info
	'populate the global variables
	dim oXML
	set oXML = APIGetSystemInfo()

	API_systemVersion = oXML.selectSingleNode("System/version").getAttribute("number")
	API_serverName = oXML.selectSingleNode("System/appSettings/setting[@appName='Server' and @key='Name']").getAttribute("value")	
	
end sub

function APIGetSystemInfo() 'returns XML object
	dim dp, rs, oXML, xmlText
	'get system information from SQL
	on error resume next
	set dp = server.CreateObject("EFTUtil.DataPump")
	dp.ConnectionType = "local" 'as opposed to the default "finServ" (box 1)
	set rs = dp.getData("select core.dbo.fnGetSystemInfo() sysInfo")
	if rs.eof then
		err.Raise 9999,"apiSystem.asp","Unable to Load System Information"
		APIGetSystemInfo = ""
		exit function 'let the calling process deal...
	end if
	on error goto 0	
	xmlText = rs("sysInfo")
	if xmlText="" then
		err.Raise 9999,"apiSystem.asp","System Information not available"
		APIGetSystemInfo = ""
		exit function 'let the calling process deal...
	end if

    set oXML = server.CreateObject("MSXML2.DOMDocument")
    oXML.async = false
    oXML.validateOnParse = false
    'response.Write bo_api_http_server.responseText
    oXML.loadXML(xmlText)
	
	set APIGetSystemInfo = oXML
	
end function

%>