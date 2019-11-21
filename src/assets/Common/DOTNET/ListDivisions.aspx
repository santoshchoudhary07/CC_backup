<%@ Page Language="C#" AutoEventWireup="true" CodeFile="ListDivisions.aspx.cs" Inherits="Common_DOTNET_ListDivisions" %>
<%@ Register Src="~/Controls/DivisionList.ascx" TagName="DivisionList" TagPrefix="ma" %>

<%
    Response.AppendHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
    Response.AppendHeader("Pragma", "no-cache"); // HTTP 1.0.
    Response.AppendHeader("Expires", "0"); // Proxies.
%>

<ma:DivisionList runat="server" ID="DivisionList" />
