	<meta charset="utf-8" />
	

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
	<script src="/Common/JS/fxFieldFormat.js?<%=versionForIncludes %>" type="text/javascript"></script>
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
	</script>
