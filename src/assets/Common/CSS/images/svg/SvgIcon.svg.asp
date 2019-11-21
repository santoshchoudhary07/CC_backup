<% 
' svgIcon is useful for accessing pristine vector icons that can be resized or color changed on if more are need 32px x 32px is the default
'css can be used with the "simple" style and 'fill: currentcolor' is the recommended style 



'simple:  < %=svgIcon("Copy",16,"")% >' %>
<% function svgIcon(iconName,size,color) %>
	<?xml version="1.0" encoding="utf-8"?>
		<% if iconName="Copy" or iconName="copy" then %><%=svgIconCopy(size,color)%>
	<% else %>
		?svgIcon
	<% end if %>
<% end function %>

<% 'img src: <img src='< %=svgIconSrc("Copy",16,"#0366dd")% > /> %>
<% '----still hoping there is a way to import these via CSS %>
<% function svgIconSrc(iconName,size,color)%>
	data:image/svg+xml;utf8,
	<% if iconName="Copy" or iconName="copy" then %><%=svgIconCopy(size,color)%>
		<%=svgIconCopy(size,color)%>
	<% else %>
		?svgIcon
	<% end if %>
<% end function %> 


<% function svgIconCopy(size,color) %>
	<svg class="svgIcon" <% if color <> "" then %> style="fill: <%=color%>;" <% end if %> width="<%=size%>" height="<%=size%>" data-name="Copy-icon" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
		 viewBox="0 0 32 32">
	<g scale="<%=(size/32)%>" >
		<path d="M23.2,8C23.6,8,24,8.4,24,8.8v18.3c0,0.5-0.4,0.8-0.8,0.8H4.8C4.4,28,4,27.6,4,27.2V8.8C4,8.4,4.4,8,4.8,8H23.2 M23.2,5
		H4.8C2.7,5,1,6.7,1,8.8v18.3C1,29.3,2.7,31,4.8,31h18.3c2.1,0,3.8-1.7,3.8-3.8V8.8C27,6.7,25.3,5,23.2,5L23.2,5z"/>

		<path d="M25.3,1H11c-0.5,0-1,0.5-1,1s0.5,1,1,1h13.7C27.1,3,29,4.9,29,7.3V21c0,0.5,0.5,1,1,1s1-0.5,1-1V6.7C31,3.6,28.4,1,25.3,1z"
		/>
	</g>
	</svg>
<% end function %>
<% ' add more svgIcon[iconName](s) below %>