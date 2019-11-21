function fnSelTab(oObj)		{
	if (oObj)		{
		for (var x=0;x<document.all("oTab").length;x++)		{
			if (document.all("oTab",x)!=oObj)	{
				document.all(document.all("oTab",x).getAttribute("value")).style.display = "none";
				document.all("oTab",x).style.filter ="progid:DXImageTransform.Microsoft.Gradient(GradientType=0, StartColorStr='#00c8c8c8', EndColorStr='#ff696969')";
				document.all("oTab",x).style.cursor = "pointer";
				document.all("oTab",x).style.backgroundColor = "#c8c8c8";
				document.all("oTab",x).style.color = "#c8c8c8";
				//document.all("oTab",x).style.fontWeight = "normal";
				document.all("oTab",x).style.borderBottom = "#cccccc 1px solid";			}
			else	{
				document.all(document.all("oTab",x).getAttribute("value")).style.display = "block";
				document.all("oTab",x).style.filter ="progid:DXImageTransform.Microsoft.Gradient(GradientType=0,StartColorStr='#00000000',EndColorStr='#00000000')";
				//document.all("oTab",x).style.fontWeight = "bold";
				document.all("oTab",x).style.cursor = "default";
				document.all("oTab",x).style.color = "#000000";
				document.all("oTab",x).style.backgroundColor = "#ffffff";
				document.all("oTab",x).style.borderBottom = "#ffffff 1px solid";			}	}	}	}