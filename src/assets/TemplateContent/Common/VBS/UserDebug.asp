<%

'**************************************************************************************************
' In the interest of full disclosure, I'm placing globals here. With a bit of luck, we will not
' run into any variable name conflicts.
'
const dbgDivStartTag = "<div class=""debug"" style=""font-family: monospace; font-size: 10pt; text-align: left; white-space: pre;"">"
const dbgTextAreaStartTag = "<textarea class=""debug"" rows=""6"" style=""font-family: monospace; font-size: 10pt; width: 100%;"">"

dim dbgUserDebugFlags            ' this will be set to a Scripting.Dictionary object when needed
set dbgUserDebugFlags = nothing


'**************************************************************************************************
' subDebugComment
'
'   enabled:  bool - when true, text will be written to the response
'   text:     string - the text to write to the response
'
' Use this method to write "text" to a <!-- -->. The <!-- --> will be written to the response at
' the current location in your markup. Obviously, if "enabled" is false, nothing is written.
' Existing comment delimiters are replaced with "{!--" and "--}".
'
sub subDebugComment(enabled, text)

  if enabled and (not isnull(text)) then
    response.write vbnewline & "<!-- " & replace(replace(text, "<!--", "{!--"), "-->", "--}") & " -->" & vbnewline
  end if

end sub


'**************************************************************************************************
' subDebugXmlComment
'
'   enabled:        bool - when true, text will be written to the response
'   xmlObjectName:  string - the name of the xml object
'   xmlObject:      xml - the text to write to the response
'
' Use this method to write the contents of an XML object to the response. The contents of the
' XML object will be written using the subDebugComment() method above.
'
sub subDebugXmlComment(enabled, xmlObjectName, xmlObject)
  if enabled then
    if xmlObject is nothing then
      subDebugComment enabled, xmlObjectName & ": nothing"
    else
      subDebugComment enabled, xmlObjectName & ".xml: " & vbnewline & xmlObject.xml
    end if
  end if
end sub


'**************************************************************************************************
' subDebugCollection
'
'   enabled:        bool - when true, text will be written to the response
'   collectionName: string - the name of the collection
'   collection:     collection (key/value pairs) - the collection of key/value pairs to write
'                   to the response
'   skipKeys:       string - comma-separated list of keys that will not be written to the response
'
' Use this method to write the contents of a key/value collection (aka: dictionary) to the
' response. The contents of the collection will be written using the subDebugComment() method
' above.
'
sub subDebugCollection(enabled, collectionName, collection, skipKeys)
  dim text, keysToSkip, item, skipItem, keyToSkip
  if enabled then
    text = collectionName & ": "
    if collection is nothing or isnull(collection) then
      text = text & "nothing"
    else
      text = text & "(" & cstr(collection.count) & " items)" & vbnewline
      keysToSkip = split(skipKeys, ",")
      for each item in collection
        skipItem = false
        for each keyToSkip in keysToSkip
          if lcase(cstr(item)) = lcase(keyToSkip) then
            skipItem = true
            exit for
          end if
        next
        if skipItem = false then
          text = text & item & " = [" & collection(item) & "]" & vbnewline
        end if
      next
    end if
    subDebugComment enabled, text
  end if
end sub


'**************************************************************************************************
' subDebugDiv
'
'   enabled:  bool - when true, text will be written to the response
'   text:     string - the text to write to the response
'
' Use this method to write "text" to a <div>. The <div> will be written to the response at the
' current location in your markup. Obviously, if "enabled" is false, nothing is written.
'
sub subDebugDiv(enabled, text)

  if enabled then
    response.write dbgDivStartTag & fnCleanDebugTextForHtmlOutput(text) & "</div>"
  end if

end sub


'**************************************************************************************************
' subDebugTextArea
'
'   enabled:  bool - when true, text will be written to the response
'   caption:  string - the caption to write to the response
'   text:     string - the text to write to the response
'
' Use this method to write "text" to a <textarea>. The <textarea> will be written to the response
' at the current location in your markup. The "caption" will be written to a <div> just above the
' <textarea>. Obviously, if "enabled" is false, nothing is written.
'
sub subDebugTextArea(enabled, caption, text)

  if enabled then
    response.write dbgDivStartTag & fnCleanDebugTextForHtmlOutput(caption) & "<br/>" & _
      dbgTextAreaStartTag & fnCleanDebugTextForHtmlOutput(text) & "</textarea></div>"
  end if

end sub


'**************************************************************************************************
' subLoadUserDebugFlags
'
'   companyId:  number or string - the company ID of the user to load debug flags for
'   userId:     number or string - the ID of the user to load debug flags for
'
' Use this method to load debug flags for the specified user (note: both "companyId" and "userId"
' are needed to make sure we are truly pulling the correct flags the user on a "per box" level).
' The flags are pulled from the [Disaster].[User_Debug_Flags] table via the [spGet_User_Debug_Flags]
' procedure. The flags are stored in a dictionary. A flag's enabled state can be checked via the
' fnGetUserDebugFlagEnabled() method.
'
' IMPORTANT: We're using just a single dictionary here and as such, are capturing debug flags
'            only for the user specified in the FIRST call to this method. This method should
'            be called only once per page.
'
sub subLoadUserDebugFlags(companyId, userId)

  dim sCompanyId, sUserId, oDPump, sSql, oRs, sFlag, sFlagEnabled, bEnabled, sKey

  sCompanyId = trim(cstr(companyId))
  sUserId = trim(cstr(userId))

  if dbgUserDebugFlags is nothing then
    set dbgUserDebugFlags = CreateObject("Scripting.Dictionary")

    set oDPump = server.CreateObject("EFTUtil.DataPump")
    sSql = "exec disaster..spGet_User_Debug_Flags @company_id = " & sCompanyId & ", @usr_id = " & sUserId
    set oRs = oDPump.GetData(sSql)
    if not (oRs is nothing) then
      while not oRs.eof
        sFlag = ucase(cstr(oRs("flag")))
        sFlagEnabled = lcase(cstr(oRs("flag_enabled")))
        bEnabled = sFlagEnabled = "1" or sFlagEnabled = "true"
        sKey = sCompanyId & "_" & sUserId & "_" & sFlag
        if dbgUserDebugFlags.exists(sKey) then
          dbgUserDebugFlags.item(sKey) = bEnabled
        else
          dbgUserDebugFlags.add sKey, bEnabled
        end if
        oRs.moveNext
      wend
    end if
    set oRs = nothing
    set oDPump = nothing
  end if

end sub


'**************************************************************************************************
' fnGetUserDebugFlagEnabled
'
'   companyId:  number or string - the company ID of the user to load debug flags for
'   userId: number or string - the ID of the user to check debug flag for
'   flag:   string - the flag to retrieve the enabled state for
'
' Use this method to get the enabled state (bool) for the given "userId"'s debug "flag". As a
' convenience, if the user's debug flags have not already been loaded, this method will load
' them.
'
function fnGetUserDebugFlagEnabled(companyId, userId, flag)

  dim bEnabled, sKey

  bEnabled = false

  if dbgUserDebugFlags is nothing then
    subLoadUserDebugFlags companyId, userId
  end if

  if not dbgUserDebugFlags is nothing then
    sKey = trim(cstr(companyId)) & "_" & trim(cstr(userId)) & "_" & ucase(flag)
    if dbgUserDebugFlags.exists(sKey) then
      bEnabled = dbgUserDebugFlags.item(sKey)
    end if
  end if

  fnGetUserDebugFlagEnabled = bEnabled

end function


'**************************************************************************************************
' fnCleanDebugTextForHtmlOutput
'
'   text: the text to "clean up" for output as html
'
' Use this method to clean up text for output as html. It isn't awesome, but does the job.
'
function fnCleanDebugTextForHtmlOutput(text)

  dim sText

  sText = text
  if isnull(sText) then
    sText = ""
  else
    sText = replace(sText, "&", "&amp;")
    sText = replace(sText, "'", "&apos;")
    sText = replace(sText, """", "&quot;")
    sText = replace(sText, "<", "&lt;")
    sText = replace(sText, ">", "&gt;")
  end if

  fnCleanDebugTextForHtmlOutput = sText

end function

%>
