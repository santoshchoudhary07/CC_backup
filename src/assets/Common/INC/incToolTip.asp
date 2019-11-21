<%
	'Requires reference link to common/js/fxFieldFormat.js
%>
<style type="text/css">
.toolTip
{
	z-index: 13;
	position:absolute;
	left:0;
	top:0;
	display:none;
	text-align:left;
    box-sizing: border-box;
}
.toolTip p {
	margin:0;
	padding:0;
}
.toolTip span
{
	color: #C9960C;
	font:normal 7pt verdana;
	font-weight:bold;
}

.toolTip .body
{
	border-top:ridge 1px #999999;
	border-left:ridge 1px #999999;
	border-bottom:outset 1px #999999;
	border-right:outset 1px #999999;
	background-color: #fff;
	clear:both;
	margin:0px;
	padding:4px;
    box-sizing: border-box;
}

.toolTip .callout
{
	clear:both;
	margin:-1px 0px 0px 0px;
	padding:0px 0px 2px 4px;
	height:4px;
    box-sizing: border-box;
}
</style>
<div id="oToolTip" class="toolTip">
	<div class="body"><p><span id="oToolTipText">Tool Tip</span></p></div>
	<div class="callout"><img src="../common/img/Callout_Top.png" align="top"/></div>
</div>
<input type="hidden" name="bTTOnFocus" id="bTTOnFocus" value="0"/>
