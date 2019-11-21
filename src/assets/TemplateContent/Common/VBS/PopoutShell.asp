<!DOCTYPE html>

<!-- #include virtual="/common/vbs/common.asp" -->
<html lang="en">
<head>
	<!--#include virtual="/Common/VBS/HeadIncludes.asp"-->
	<% if not IsEmpty(Request.QueryString("viewTypeSrc")) then %>
	<script src="<%=Request.QueryString("viewTypeSrc")%>"></script>
	<% end if %>

</head>
<body>
	<!--#include virtual="/Common/VBS/HeaderSmall.asp"-->
	<script>
		$(document).ready(function() {
			var viewType = eval('<%=Request.QueryString("viewType")%>');
			var config = {
				<%
				dim key, isFirst
				isFirst = true
				for each key in Request.Querystring
					if key <> "viewTypeSrc" then
						if isFirst then
							isFirst = false
						else
							Response.write(",")
						end if
						Response.Write(key & ": """ & Request.Querystring(key) & """")
					end if
				next
				%>
			};
			maUI.applyView('.wrapper', new viewType(config));
		});
		//# sourceURL=PopoutShell.asp.js
	</script>
	<div class="wrapper">

	</div>

</body>
