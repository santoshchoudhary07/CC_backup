<%@ Page Language="C#" AutoEventWireup="true" CodeFile="ListRegions.aspx.cs" Inherits="Common_DOTNET_ListRegions" %>
<%@ Register Src="~/Controls/RegionList.ascx" TagName="RegionList" TagPrefix="ma" %>

<%
    Response.AppendHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
    Response.AppendHeader("Pragma", "no-cache"); // HTTP 1.0.
    Response.AppendHeader("Expires", "0"); // Proxies.
%>

<ma:RegionList runat="server" ID="RegionList" />
