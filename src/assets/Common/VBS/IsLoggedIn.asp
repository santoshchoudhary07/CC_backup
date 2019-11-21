<% 
	if isnull(Session("Usr_Id"))  or Session("Usr_Id") = "" then
		response.write "False"
	else
		response.write "True"
	end if
%>