<%
Response.Expires = 60
Response.Expiresabsolute = Now() - 1
Response.AddHeader "pragma","no-cache"
Response.AddHeader "cache-control","private"
Response.CacheControl = "no-cache"
%>	
    <meta charset="utf-8" />
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	
	<title>Manage America</title>

	<link rel="shortcut icon" type="image/x-icon" href="/Common/CSS/images/favicon.ico" />

	<!-- Vendor Styles -->
	<link rel="stylesheet" href="/Common/formstone-dropdown/dropdown.css?<%=versionForIncludes %>" />
	<link rel="stylesheet" href="/Common/jquery-ui-1.11.4.custom/jquery-ui.min.css?<%=versionForIncludes %>" />
	<link rel="stylesheet" href="/Common/owl-carousel/owl.carousel.css?<%=versionForIncludes %>" />

	<!-- App Styles -->
	<link rel="stylesheet" href="/Common/CSS/style.css?<%=versionForIncludes %>" />

	<!-- Vendor JS -->
	<script src="/Common/jquery/jquery-1.11.3.min.js?<%=versionForIncludes %>"></script>
	<script src="/Common/formstone-dropdown/core.js?<%=versionForIncludes %>"></script>
	<script src="/Common/formstone-dropdown/touch.js?<%=versionForIncludes %>"></script>
	<script src="/Common/formstone-dropdown/dropdown.js?<%=versionForIncludes %>"></script>
	<script src="/Common/jquery-ui-1.11.4.custom/jquery-ui.min.js?<%=versionForIncludes %>"></script>
	<script src="/Common/owl-carousel/owl.carousel.min.js?<%=versionForIncludes %>"></script>
	<script src="/Common/highcharts/highcharts.js?<%=versionForIncludes %>"></script>
	<script src="/Common/jquery-ui-sortable-draggable-droppable/jquery-ui.min.js?<%=versionForIncludes %>"></script>
    <script src="/Scripts/bluebird.min.js?<%=versionForIncludes %>"></script>
	<script language="JavaScript" src="/js/commonRefresh.js?<%=versionForIncludes %>"></script>
	<script language="JavaScript" src="/Common/JS/common.js?<%=versionForIncludes %>"></script>
	<script language="JavaScript" src="/Common/JS/maUI.js?<%=versionForIncludes %>"></script>
	<script language="JavaScript" src="/Common/JS/maNav.js?<%=versionForIncludes %>"></script>
	<script language="JavaScript" src="/Common/JS/global.js?<%=versionForIncludes %>"></script>
	<!--<script src="/Common/JS/fxFieldFormat.js?<%=versionForIncludes %>" type="text/javascript"></script>-->
	<script src="/Common/JS/EncryptionRefresh.js?<%=versionForIncludes %>" type="text/javascript"></script>
	<script src="/Common/JS/fxFieldFormatRefresh.js?<%=versionForIncludes %>" type="text/javascript"></script>
<%
strPath= Request.ServerVariables("SCRIPT_NAME") 
strQueryString= Request.ServerVariables("QUERY_STRING")

 %>
	<script type="text/javascript">
		Promise.config({
			longStackTraces: true
		});
		Promise.onPossiblyUnhandledRejection(function(e, promise) {
			if(!!e.textStatus) {
				if(e.errorThrown == 'Internal Server Error') {
					maUI.dialog('Error', e.jqXHR.responseText);
				} else {
					throw new Error(e.textStatus + ': ' + e.errorThrown);
				}
			} else {
				throw e;
			}
		});

		maUI.attachThemeHandlers();

		function checkIfLoggedIn() {
            //Commenting out this section because now we are going to use localstorage to keep track of whether the user is logged in
			//$.ajax({
			//	url: "/Common/VBS/IsLoggedIn.asp",
			//	dataType: "text",
			//	timeout: 4000,
			//	success: function (result) {
			//		if (result == "False") {
			//			window.location = "/Account/LogOn?ReturnUrl=<%=Server.URLEncode(strPath & "?" & strQueryString)%>";
			//		}
			//		else {
			//			window.clearTimeout(timerCheckIfLoggedIn);
			//			timeoutID = window.setTimeout(checkIfLoggedIn, 5000);
			//		}
			//	},
			//	error: function (xhr, ajaxOptions, thrownError) {
			//		window.clearTimeout(timerCheckIfLoggedIn);
			//		timeoutID = window.setTimeout(checkIfLoggedIn, 5000);
			//		//Commenting this out for now.  It seems that sometimes an error occurs, but it's not something that prevents the user from continuing on.  So we don't need ot display a warning message.
			//		//maUI.dialog({
			//		//	title: 'Error',
			//		//	message: 'An error occurred.  Here are the details:  <BR><BR>' + xhr.responseText + "<BR><BR>" + thrownError
			//		//});
			//	}
			//});

            
			isLoggedIn = localStorage.getItem("isLoggedIn");

			if (isLoggedIn == 0) {
			    window.location = "/Account/LogOn?ReturnUrl=<%=Server.URLEncode(strPath & "?" & strQueryString)%>";
			}
			if (isLoggedIn == 1) {
			    window.clearTimeout(timerCheckIfLoggedIn);
			    timeoutID = window.setTimeout(checkIfLoggedIn, 5000);
			}

		}

		timerCheckIfLoggedIn = window.setTimeout(checkIfLoggedIn, 5000);
	</script>
