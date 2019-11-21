<%@ Page Language="C#" AutoEventWireup="true" CodeFile="ListProperties.aspx.cs" Inherits="Common_DOTNET_ListProperties" %>
<%@ Register Src="~/Controls/PropertyList.ascx" TagName="PropertyList" TagPrefix="ma" %>

<%
    Response.AppendHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
    Response.AppendHeader("Pragma", "no-cache"); // HTTP 1.0.
    Response.AppendHeader("Expires", "0"); // Proxies.
%>

<ma:PropertyList runat="server" ID="PropertyList" />
