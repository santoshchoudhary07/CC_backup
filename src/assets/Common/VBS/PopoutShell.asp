<!DOCTYPE html>

<!-- #include virtual="/common/vbs/common.asp" -->
<html lang="en">
<head>
	<!--#include virtual="/Common/VBS/HeadIncludes.asp"-->
	<% if not IsEmpty(Request.QueryString("viewTypeSrc")) then %>
	<script src="<%=Request.QueryString("viewTypeSrc")%>?<%=versionForIncludes %>"></script>
	<% end if %>
	<% if Request.QueryString("viewTypeSrc") = "/Accounting/Balances.js" then %>
		<%
		' Dependencies for Metering feature.
		%>
		<script src="/Scripts/underscore-1.8.3.min.js?<%=versionForIncludes %>" type="text/javascript"></script>
		<script src="/Scripts/backbone-1.2.1.min.js?<%=versionForIncludes %>" type="text/javascript"></script>
		<script src="/Scripts/handlebars.min.js?<%=versionForIncludes %>" type="text/javascript"></script>
		<script src="/Scripts/moment.min.js?<%=versionForIncludes %>" type="text/javascript"></script>
		<script src="/Scripts/app/views/meterInfoRefresh/app.js?<%=versionForIncludes %>" type="text/javascript"></script>
		<script src="/Metering/Metering.js?<%=versionForIncludes %>"></script>
	
		<script src="/Accounting/Ledger.js?<%=versionForIncludes %>"></script>
		<script src="/Accounting/ViewNotes.js?<%=versionForIncludes %>"></script>
	<% end if %>
	<% if Request.QueryString("viewTypeSrc") = "/Operations/BizLicenses.js" then %>
		<%
		' Dependencies for Business Licenses feature.
		%>
		<script src="/Common/JS/maUIExtensions/maUI.report.js?<%=versionForIncludes %>"></script>
	<% end if %>
	

</head>
<body class="popout">
	<!--#include virtual="/Common/VBS/HeaderSmall.asp"-->
	<script type="text/javascript">
		function popout_onDomReadyExtra(baseFunc, $container) {
			this.$container = $container;
			var ret = baseFunc.call(this, $container);
			this.$container.on('click', '.dialog-close', window.close.bind(window));

			return ret;
		}
		window.popoutView = maUI.types.ViewBase;
		$(document).ready(function() {
			var viewType = eval('<%=Request.QueryString("viewType")%>');
			var config = {
				<%
				dim key, isFirst
				isFirst = true
				for each key in Request.Querystring
					if key <> "viewTypeSrc" and key <> "viewType" then
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
			if(!!viewType) {
				window.popoutView = new viewType(config);
				window.popoutView.closeView = window.close.bind(window);
				var origOnDomReady = window.popoutView.onDomReady;
				window.popoutView.onDomReady = popout_onDomReadyExtra.bind(window.popoutView, origOnDomReady);

				maUI.applyView('.wrapper',  window.popoutView);
			}
		});
		//# sourceURL=PopoutShell.asp.js
	</script>
	<% 'If the page title is provided then add the page title header bar (which also adds a margin around the page content) %>
	<% pageTitle = request.QueryString("pageTitle")  %>
	<% if pageTitle <> "" then %>
		<div class="container container-no-gutter">
			<main class="main">
				<header class="main-head">
					<div class="shell">
						<h1 class="main-title"><%=pageTitle%></h1><!-- /.main-title -->
					</div>
				</header>

				<div class="main-body">
					<div class="shell">
	<% end if %>
						<div class="wrapper">
						</div>
	<% if pageTitle <> "" then %>				
					</div>
				</div>
			</main>
		</div>
	<% end if %>
</body>
