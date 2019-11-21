<%@EnableSessionState=False%>
<%
	response.expires = -1
	response.contenttype = "text/xml"

	PID = Request.QueryString("pid")
	response.write PID & "<BR>"

	Set UploadProgress = Server.CreateObject("Persits.UploadProgress")
	Response.Write UploadProgress.XmlProgress(PID)
%>