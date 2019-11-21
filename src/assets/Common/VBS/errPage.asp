<%@LANGUAGE="VBScript" %>
<%
	option explicit
	Response.Expires = -2009
	Response.Buffer	 = true
	
	dim	errDesc, _
			errCode, _
			errHeader, _
			sUrl, _
			bIsSessionTimeout
			
	errDesc = request("errDesc")
	errCode = request("errCode")

	if Request.ServerVariables("HTTPS") = "on" then
		sUrl = "https://"&Request.ServerVariables("HTTP_HOST")
	else
		sUrl = "http://"&Request.ServerVariables("HTTP_HOST")
	end if

	if len(trim(request("errHeader")))=0 then
		errHeader = "Application Alert"
	else
		errHeader = "Application Alert : " & request("errHeader")
	end if

	if trim(errCode)="" then
		bIsSessionTimeout=true
	elseif trim(errCode)="inactive_module" then
		bIsSessionTimeout=false
		errHeader = "Application Alert : " & request("errHeader")
	end if
%>
<html>
<head>
	<title>Application Alert</title>
	<link rel="stylesheet" type="text/css" href="..\css\ssMALayoutV00.css">
	<script type="text/javascript">
		function login()
		{
			var oWindow = window.open('<%=sUrl%>','_blank');
			//oWindow.moveTo((oWindow.screen.width/2)-(oWindow.document.body.offsetWidth/2),(oWindow.screen.height/2)-(oWindow.document.body.offsetHeight/2))
			oWindow.focus();
			window.close();
		}
	</script>
	<style type="text/css">
		legend{
		font: bold 9pt verdana;
		color: #447AC2;
		background: #fff;
		border: 1px solid #d5dfe5;
		padding: 2px 6px;		}	
	</style>
</head>
<body class="bdyMa bdyMaBgImg bdyMaBgGradient">
<table class="canvas spanAcross">
	<tr>
		<td class="canvasHdr"><%=errHeader%></td>
	</tr>
	<tr>
		<td class="canvasBody">
			<table class="matte">
				<tr>
					<td class="matteBody">
						<table class="matteInset">
							<tr>
								<td class="matteInsetBody" style="padding:8px 8px 8px 8px;">
									<fieldset>
										<legend>Alert</legend>
										<div style="width:100%;padding:25px 25px 25px 25px;">
											<br />
											<span style="font: normal 10pt verdana; color:red;"><%=errDesc%></span>
											<br />
											<br />
											<% if bIsSessionTimeout then %>
											<u style="color:blue;"><span style="cursor:pointer;" onclick="login();">Login</span></u>
											<% end if %>
											<br />
											<br />
										</div>
									</fieldset>
								</td>
							</tr>
						</table>
					</td>
				</tr>
			</table>
		</td>
	</tr>
</table>
</body>
</html>
