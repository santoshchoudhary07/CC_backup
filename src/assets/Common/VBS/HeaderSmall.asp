<%
set dpHeader = server.CreateObject("EFTUtil.DataPump")

serverUrl = replace(Request.ServerVariables("SERVER_NAME"), "www.", "")
set rsServer = dpHeader.GetData("Disaster..spGet_Server_By_Url " & _
                                                             "@url=" & sqlText(serverUrl))
if dpHeader.SqlErrorNumber <> 0 then
	response.write "Datapump error:<BR>" & dpHeader.SqlErrorNumber & "<BR>" & dpHeader.SqlErrorDescription & "<BR>" & dpHeader.SqlErrorSource & "<BR>" & dpHeader.sql & "<BR>"
	response.end
end if

isELSQA = false
if rsServer("Server_Name") = "elsqa" then
                isELSQA = true
end if

isELS = false
if rsServer("Server_Name") = "app5" then
                isELS = true
end if

set dpHeader = nothing


function fnIsSupportDeskActive()
	dim oCompanySettings
	set oCompanySettings = server.CreateObject("MACompany.Companies")
	fnIsSupportDeskActive=cbool(oCompanySettings.GetCompanySetting(clng(Session("Company_Id")),"Allow_Access_Support_Desk"))
    set oCompanySettings=nothing
end function
%>
<script type="text/javascript">
	function openSupportDesk(){
		<% if fnIsSupportDeskActive then %>
			wkLeft = ((window.screen.availWidth /2) - (690/2) + 10)
			wkTop = (window.screen.availHeight /2) - (530/2)
			strFeatures ="width=690,height=530,toolbar=no,resizable=yes,scrollbars=yes"
				+ ",Top=" + wkTop + ",Left=" + wkLeft
			window.open("/SupportDesk","SupportDesk",strFeatures).focus()
		<% else %>
			maUI.dialog("Alert", "Support Desk Not Active");
		<% end if %>
	}
</script>

	<header class="header header-small">
		<div class="shell shell-small-wide <% if WidePage then %>wide-page<% end if %>">
			<div class="user">
				<strong>Welcome, <%= Session("Users_Actual_Name") %></strong>

				<a href="/Account/LogOff" class="user-link-logout">(Log Out)</a>
			</div><!-- /.user -->

			<div class="header-inner">
				<div class="header-bar">
					<nav class="nav-utilities">
						<ul>
							<li>
								<a href="https://attendee.gototraining.com/839l6/catalog/1816337521099118336" target="_blank">
									<i class="ico-training"></i>
									Training
								</a>
							</li>

							<li>
								<a href="javascript:openSupportDesk();">
									<i class="ico-support"></i>
									Support Desk
								</a>
							</li>
						</ul>
					</nav><!-- /.nav-utilities -->

					<!--TO DO: add a global search
					<div class="search">
						<form action="?" method="get">
							<div class="search-body">
								<label for="q" class="hidden">Search</label>

								<input type="search" name="q" id="q" placeholder="Search" value="" class="field">

								<i class="ico-magnifier search-icon"></i>
							</div>
						</form>
					</div>
					-->
				</div><!-- /.header-bar -->
			</div><!-- /.header-inner -->
		</div><!-- /.shell -->
	</header><!-- /.header -->