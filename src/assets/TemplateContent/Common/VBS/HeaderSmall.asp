
	<header class="header header-small">
		<div class="shell shell-small-wide">
			<div class="user">
				<strong>Welcome, <%= Session("Users_Actual_Name") %></strong>

				<a href="/Account/LogOff" class="user-link-logout">(Log Out)</a>
			</div><!-- /.user -->

			<div class="header-inner">
				<div class="header-bar">
					<nav class="nav-utilities">
						<ul>
							<li>
								<a href="#">
									<i class="ico-training"></i>
									Training
								</a>
							</li>

							<li>
								<a href="#">
									<i class="ico-support"></i>
									Support Desk
								</a>
							</li>
						</ul>
					</nav><!-- /.nav-utilities -->

					<div class="search">
						<form action="?" method="get">
							<div class="search-body">
								<label for="q" class="hidden">Search</label>

								<input type="search" name="q" id="q" placeholder="Search" value="" class="field">

								<i class="ico-magnifier search-icon"></i>
							</div><!-- /.search-body -->
						</form>
					</div><!-- /.search -->
				</div><!-- /.header-bar -->
			</div><!-- /.header-inner -->
		</div><!-- /.shell -->
	</header><!-- /.header -->