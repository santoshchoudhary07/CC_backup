		document.onkeydown = function() 
		{
  	 		if (window.event) 
			{
      				if (window.event.keyCode == 8)
				{
					var src = window.event.srcElement;
					var tag = src.tagName ? src.tagName.toUpperCase() : '';
					var typ = (tag == 'INPUT') ? src.type.toUpperCase() : '';
					var isTextArea = (tag == 'TEXTAREA');
					var isTextField = ((tag == 'INPUT') && (typ == 'TEXT'));
					var isText = isTextField || isTextArea;
					var disabled = isText ? src.disabled : false;
					var readOnly = isText ? src.readOnly : false;
					if (!isText || disabled || readOnly)
					{
     					window.event.cancelBubble = true;
     					window.event.returnValue = false;
     					return false;
          		}
      		}
  			}
		}