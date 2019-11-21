<%

	qString = Request.QueryString
	sortByLoc = Instr(qString, "&sortBy=")
	If sortByLoc > 0 Then
		newQString = Replace(qString, "&sortBy=" & Request("sortBy"), "")
		'newQString = Left(qString, (sortByLoc - 1))
	Else
		newQString = qString
	End If

	xlsLoc = Instr(newQString, "&xls=")
	If xlsLoc > 0 Then
		newQString = Replace(newQString, "&xls=" & Request("xls"), "")
	End If

	if Instr(newQString, "xls=") = 1 then
		newQString = Replace(newQString, "xls=" & Request("xls"), "")
	end if

	pageLoc = Instr(qString, "&page=")
	If pageLoc > 0 Then
		newQStringForPaging = Replace(qString, "&page=" & page, "")
	Else
		if Instr(qString, "page=") > 0 then
			newQStringForPaging = Replace(qString, "page=" & page, "")
		else
			newQStringForPaging = qString
		end if
	End If

%>
<% If NOT isExcel Then %>
	<% If rsReport.RecordCount > 0 Then %>
		<% maxItems = rsReport("maxItems") %>
		<% if maxItems > itemsPerPage then %>
			<%
				'get the remainder
				if maxItems mod itemsPerPage = 0 then
					'no remainder
					numOfPages = maxItems/itemsPerPage
				else
					'returns a whole number
					numOfPages = maxItems\itemsPerPage
					numOfPages = numOfPages + 1
				end if

			%>
			<div class="reportTime" style="padding-bottom:10px;">
			Pages:
			<% for i = 1 to numOfPages %>
				<% if i > 1 then %>
					|
				<% end if %>
				<% if i = page then %>
					<b><%=i%></b>
				<% else %>
					<a href="<%=thisPageFileName%>?<%=newQStringForPaging%><% if newQStringForPaging <> "" then %>&<% end if %>page=<%=i%>" title="Page <%=i%>"><%=i%></a>
				<% end if %>
			<% next %>
			</div>
		<% end if %>
	<% End If %>
<% End If %>