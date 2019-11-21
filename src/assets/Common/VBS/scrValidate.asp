<%
	'**********************************************************************************
	'DEBUG:****************************************************************************
	'WRITE SESSION VALUES
	'dim k
	'for each k in Session.Contents
	'	Response.Write k & " < " & Session(k) & "<BR>"
	'next
	'Response.End
	'dim x
	'for each x in Request.ServerVariables
	'	Response.Write x & " : " & Request.ServerVariables(x) & "<BR>"
	'next	
	'Response.End
	'**********************************************************************************

	dim	errDesc, _
			errCode, _
			errHeader, _
			sUrl

	if Request.ServerVariables("HTTPS") = "on" then
		sUrl = "https://"
	else
		sUrl = "http://"
	end if
		
	sUrl		= sUrl & Request.ServerVariables("HTTP_HOST") & "/common/vbs/errPage.asp"
	errDesc	= "Your session has timed out. Please login again."
	errCode	= "EU-01"
	errHeader= "Session Timeout"

	if len(trim(session("userId")))=0 then
%>
<html>
<script type="text/javascript">
	function fnSubmit()
	{
		document.getElementById('confirmation').submit();
	}
</script>
<body onload="fnSubmit();">
<form method="post" id="confirmation" action="<%=sUrl%>">
	<input type="hidden" name="errCode" value="<%=errCode%>"/>
	<input type="hidden" name="errHeader" value="<%=errHeader%>"/>
	<textarea style="display:none;" name="errDesc"><%=errDesc%></textarea>
</form>
</body>
</html>
<%
		response.end
	end if
 %>