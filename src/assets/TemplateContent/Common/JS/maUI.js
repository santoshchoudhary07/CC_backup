// Custom UI constructs implemented as plugins on the Manage America UI namespace
var maUI = {};

(function(maUI, $, document, window) { //maUI (ManageAmerica User Interface) is the object that is like "our jquery".  It's a namespace for us to create custom plugins.

	//**************************************************************************
	//	Dates
	//		These additions to the date type aid in marshalling dates for the
	//		MA system.
	//
	//	Functions:
	//		Date.fromISOString(dateStr): Date
	//		date.prototype.toISOLocalString(): string
	//
	//**************************************************************************

	// Current MA Transfer format is en-US locale format
	Date.fromMATransferFormat = function(dateStr) {
		return new Date(dateStr);
	};
	Date.prototype.toMATransferFormat = function() {
		var month = this.getMonth() + 1;
		var day = this.getDate();

		return ('0' + month).slice(-2) + '/' + ('0' + day).slice(-2) + '/' + this.getFullYear();
	};

	//**************************************************************************
	//	applyView()
	//		Constructs a self-contained view in the specified container
	//		If the container has the attribute data-enhanced="true", its contents
	// 		are preserved, and only the behavior is added to it.
	//
	//	Signatures:
	//		dialog(selector: string|DOMElement|jQuery, view: object)
	//
	//**************************************************************************
	var ViewBase = {
		// getContentUrl
		// return value: URL string: indicates the endpoint where the HTML content is located
		contentUrl: '',
		getContentUrl: function() { return this.contentUrl; },

		// getContent
		// target param: the outer shell wherein the view is placed -
		//		more than the immediate container, this is the jQuery object passed to applyView(),
		//		or in the case of dialog(), the maUIDialog object that is constructing the dialog.
		// return value: HTML string | jQuery, or Promise resolved with HTML|jQuery value
		//		HTML string (optionally jQuery wrapped) content for the dialog
		content: '',
		getContent: function(target) {
			var url = this.getContentUrl();
			if(!!url) {
				return maUI.ajax({url: url});
			} else {
				return this.content; // effectively: return Promise.resolve(this.content);
			}
		},

		// onDomReady
		// $contentContainer param: jQuery wrapper around DOM element
		//		Passes the containing HTML element for the UI the View controls
		// return value: Promise (optional)
		//		Promise notifies of outstanding asynchronous process, if any. Excluding a return statement is acceptable.
		//		Caller awaits promise, if any, but does not use resolution value.
		onDomReady: function($contentContainer) {
			return Promise.resolve();
		}

	};

	maUI.applyView = function(selector, view) {
		var $target = $(selector);
		var _view = $.extend(true, {}, ViewBase, view);

		_view.$ = $target.addClass('view-container');

		var ret;
		if($target.data().enhanced) {
			ret = Promise.resolve();
		} else {
			ret = Promise.resolve(_view.getContent($target)).then(function (content) {
				_view.$.html(content);
			})
		}

		return ret.then(_view.onDomReady.bind(_view, _view.$));
	};

	maUI.stdViews = {};

	//**************************************************************************
	//	dialog()
	//		Creates a popup dialog and returns a promise that will resolve when
	//		dialog has closed.
	//
	//	Signatures:
	//		dialog(message: string)
	//		dialog(title: string, message: string)
	//		dialog(options: object)
	//
	//**************************************************************************
	var dlgStdActions = {
		close: {
			classes: 'dialog-close',
			attributes: { 'data-dlg-result': 'x' },
			events: {},
			icon: 'ico-x-medium-white'
		},
		closeAlt: {
			classes: 'dialog-close',
			attributes: { 'data-dlg-result': 'x' },
			events: {},
			icon: 'ico-x'
		},
		popout: function(view, viewType, viewTypeSrc) {
			return {
				classes: 'popup-open-new-window',
				attributes: {},
				events: {
					click: function(dlg) {
						var params = '';
						if(typeof view.getConfig == 'function') {
							params = '&' + $.param(view.getConfig());
						}

						popup('/Common/VBS/PopoutShell.asp?viewTypeSrc=' + viewTypeSrc +'&viewType=' + viewType + params, "CommunityAccounts", 4 + 8, 800, 1200);
						dlg.close();
					}
				},
				icon: 'ico-arrow-popout-white'
			};
		}
	};

	var DialogViewBase = $.extend(true, ViewBase, {
		// onDialogReady
		// $contentContainer param: jQuery wrapper around DOM element
		//		Passes the containing HTML element for the UI the View controls
		// return value: Promise (optional)
		//		Promise notifies of outstanding asynchronous process, if any. Excluding a return statement is acceptable.
		//		Caller awaits promise, if any, but does not use resolution value.
		onDomReady: function($contentContainer) {
			// The onDialogReady function is deprecated. Use onDomReady. For backward-compat, we redirect.
			// TODO: remove this statement once all references to onDialogReady are removed from the system. This function will become empty.
			if(typeof this.onDialogReady == 'function') {
				return this.onDialogReady($contentContainer);
			}
		},

		// onDialogClose
		// result param: string
		//		Receives the dialog result for the close button that was clicked
		// return value: boolean, or Promise resolved with a boolean value
		//		Indicates if the dialog should be closed. Cancel close by returning false.
		onDialogClose: function(result) { return true; /* Promise.resolve(true); */ },

		// getReturnData
		// return value: any
		//		This value is passed on to the caller of dialog() in the resolution of the promise, as the dlgData member
		returnData: null,
		getReturnData: function() { return this.returnData; },

		// getDialogButtons
		// return value: Array of Objects
		//		Defines the buttons that should be placed at the bottom of the diaog. The text is used for the button
		//		label, and the value becomes the dialog result.
		buttons: [
			{
				text: 'OK',
				value: 'ok'
			}
		],
		getDialogButtons: function() { return this.buttons; },

		// getTitle
		// return value: string | HTML
		//		This content is displayed in the title bar of the dialog.
		title: '',
		getTitle: function() { return this.title; },

		// getActions
		// return value: Array of Objects
		//		These are configuration objects for the action buttons that are in the upper right corner.
		//		See the stdActions for examples.
		actions: [ dlgStdActions.close ],
		getActions: function() { return this.actions; },

		// getType
		//		return value: string (HTML class name)
		//			This value is used to define a class on the dialog that is selected by the stylesheet to style
		//			properties like width and height. Example values: alert, form, form-wide, modules.
		type: 'alert',
		getType: function() { return this.type; },

		// getConfig
		// return value: object
		//		This object should be a simple object with the values that define the current state of the view.
		//		Ideally, this object could be passed to the constructor of the view type to create a clone.
		//		This function primarily accommodates the stdAction.popout action.
		getConfig: function() { return {}; },

		// Misc parameters
		parent: 'body',
		fadeOut: false
	});

	maUI.dialog = function() {
		// Process the arguments into configuration settings.
		var options = {};
		if(arguments.length > 1) {
			options.title = arguments[0];
			options.content = arguments[1];
		} else if (arguments.length == 1) {
			if(typeof arguments[0] == 'string' || arguments[0] instanceof String) {
				options.content = arguments[0];
			} else {
				options = arguments[0];
				if(options.hasOwnProperty('message')) {
					options.content = options.message;
				}
			}
		}

		var view = $.extend({}, DialogViewBase, options);

		// Create the dialog and return a promise on it's events.
		var dlg = new maUIDialog(view);

		// This is not included in the normal extension from DialogViewBase, because it is has a complicated interface,
		//	and I don't want to encourage extending it by "publishing" it in DialogViewBase.
		if(typeof(view.getDialogShell) == 'function') {
			dlg.$ = view.getDialogShell();
		} else {
			dlg.$ = createStandardDialogShell.call(view);
		}

		// Add dialog contents
		dlg.addDialogButtons();

		// Prepare the return promise, starting with the dialog content.
		var ret = Promise.resolve(view.getContent(dlg));

		ret = ret.then(function(content) {
			dlg.$.find('.popup-entry').html(content);
			dlg.$ = dlg.$.appendTo(view.parent);
			dlg.setTitle();
			dlg.$.addClass("popup-open");
		});

		//everytime we say ret = ret.then(), we're saying chain a new promise onto ret and then hold onto the new promise that will resolve at the very end of the chain as ret.
		ret = ret.then(dlg.addDialogActions.bind(dlg));

		ret = ret.then(view.onDomReady.bind(view, dlg.$.find('.popup-entry'), dlg));

		return ret.then(dlg.attachCloseEvents.bind(dlg));
	};

	maUI.dialog.stdActions = dlgStdActions;
	maUI.dialog.stdViews = {};

	//**************************************************************************
	//	Dialog Shells
	//		These functions create the HTML shell that surrounds the content
	//		And makes it look like a dialog.
	//
	//	Signatures:
	//		These functions assume that the 'this' variable has been set to
	//		the view, so it must be bound to the view, or called with .call():
	//
	//			view.createStandardDialogShell.call(view)
	//		(or similar)
	//
	//**************************************************************************
	var idCounter = 1;
	function createStandardDialogShell() {
		var id = this.id;
		if(!this.id) {
			id = 'popup-' + idCounter;
		}
		var dlgClass = 'popup';
		var dlgType = this.getType();
		if(dlgType) {
			dlgClass += ' popup-' + dlgType;  //uses classes in style.css that start with "popup-".  known types: form, form-wide, alert, messages, tasks, modules, chart-details, all-charts-details, quicklinks, as-tooltip, properties, report-builder, add-message
		}
		return $('<div></div>').attr('id', id).addClass(dlgClass)
		.append($('<div></div>').addClass('popup-overlay dialog-close'))
		.append(
			$('<div></div>').addClass('popup-inner')
			.append(
				$('<div></div>').addClass('popup-head')
				.append($('<h1></h1>').addClass('popup-title'))
				.append($('<div></div>').addClass('popup-actions'))
			)
			.append(
				$('<div></div>').addClass('popup-body')
				.append($('<div></div>').addClass('popup-entry'))
				.append($('<div></div>').addClass('popup-buttons'))
			)
		);
	}
	function createTooltipShell() {
		var id = this.id;
		if(!this.id) {
			id = 'popup-' + idCounter;
		}
		var dlgClass = 'popup-as-tooltip';
		var ret = $('<div></div>').attr('id', id).addClass(dlgClass)
		.append(
			$('<div></div>').addClass('popup-inner')
			.append($('<div></div>').addClass('popup-actions'))
			.append(
				$('<div></div>').addClass('popup-body')
				.append($('<div></div>').addClass('popup-entry'))
				.append($('<div></div>').addClass('popup-buttons'))
			)
		);
		if(this.top) {
			ret.css('top', this.top);
		}
		if(this.left) {
			ret.css('left', this.left);
		}
		return ret;
	}

	var maUIDialog = function(view) {
		this.view = view;
	};
	maUIDialog.prototype = {
		setTitle: function() {
			this.$.find('.popup-title').html(this.view.getTitle());
		},
		addDialogActions: function() {
			var self = this;
			var actions = self.view.getActions();
			if(Array.isArray(actions)) {
				var $actionsDiv = self.$.find('.popup-actions');
				$actionsDiv.empty();
				for(var i = 0; i < actions.length; i += 1) {
					var actionCfg = actions[i];
					var $newAction = $('<a></a>').addClass(actionCfg.classes);  // $('<a></a>') creates an element that exists outside the DOM that exists in memory somewhere.
					if(actionCfg.attributes instanceof Object) {  //they may have added attributes within an action and we add those attributes to the link element.   And Object in Javascript can be treated as an array of key/value pairs.
						Object.keys(actionCfg.attributes).forEach(function(key) {
							$newAction.attr(key, actionCfg.attributes[key]);
						});
					}
					$newAction.append($('<i></i>').addClass(actionCfg.icon));
					$actionsDiv.append($newAction);

					var selectingClass = actionCfg.classes.split(' ')[0];
					if(actionCfg.events instanceof Object) {
						Object.keys(actionCfg.events).forEach(function(key) {
							$actionsDiv.on(key, '.' + selectingClass, actionCfg.events[key].bind(null, self));  // .on is a jquery handler.  key is the event handlder name that was passed in.  and then it gets attached to the class that we determined (selectingClass).  Then the value of the key is the function that gets executed because we called bind.
						});
					}
				}
			} else {
				throw 'Unexpected usage: non-array action collection for dialog.';
			}
		},
		addDialogButtons: function() {
			var buttons = this.view.getDialogButtons();
			if(Array.isArray(buttons)) {
				var $container = this.$.find('.popup-buttons');
				$container.empty();

				for(var i = 0; i < buttons.length; i += 1) {
					var button = buttons[i];
					$('<a class="btn dialog-close" data-dlg-result="' + button.value + '">' + button.text + '</a>')
					.addClass(button.class)
					.appendTo($container);
				}

			} else {
				throw 'Unexpected usage: non-array button collection for dialog.';
			}
		},
		attachCloseEvents: function() {
			var self = this;
			return new Promise(function(resolve) {

				// Give the view a method to close the dialog and properly resolve the promise.
				self.view.closeDialog = function(dlgResult) {
					resolve(self.close(dlgResult));
				};

				self.$.on('click', 'a.popup-close, a.dialog-close', function(evt) {
					var dlgResult = $(evt.currentTarget).data().dlgResult;
					Promise.resolve(self.view.onDialogClose(dlgResult)).then(function(bShouldClose) {
						if(bShouldClose) {
							resolve(self.close(dlgResult));
						}
					})
				});

				// Process fadeOut option
				if(self.view.fadeOut !== false) {
					setTimeout(function () {
						self.$.fadeOut('slow', function () {
							resolve(self.close('fade'));
						});
					}, self.view.fadeOut === true ? 2000 : self.view.fadeOut);
				}
			});
		},
		close: function(dlgResult) {

			this.$.removeClass('popup-open');

			// Dispose of the HTML
			this.$.remove();

			var resolution = {
				dlgResult: dlgResult,
				dlgData: this.view.getReturnData()
			};
			if(resolution.dlgData === null) {
				return Promise.resolve(resolution.dlgResult);
			} else{
				return Promise.resolve(resolution);
			}
		}

	};





	//*********************************************************************************************
	//	SubmitDialogView
	//		This standard dialog view allows calling a URL for the contents of a dialog which has
	// 		self-contained behavior (JS in a script tag, etc)
	//
	//	cfgView object: This config object can be a full DialogView, but it specifically expects two members:
	//		contentUrl: string, URL for the AJAX call to retrieve the dialog contents
	//		postUrl: string, URL where the results of the dialog will be posted
	//
	//	Submission:
	//		If a postUrl is specified, the values of the first <form> element in the dialog will
	// 		be sent to it, in a POST request, when the dialog is closed with a non-cancelling result.
	//
	//		Cancelling/non-cancelling results:
	//			All dialogs have an "X" button in the upper right corner which cancels the dialog
	// 			with result 'x'.
	//
	//			The content endpoint (at contentUrl) is responsible for specifying any other close
	//			buttons. Close buttons are specified with a class 'dialog-close', and a result is
	//			specified with the data-dlg-result attribute. Dialog result values of 'cancel' or
	//			'x' are considered cancelling results, and will not trigger the POST request.
	//			See the "Close" link/button in the example.
	//
	//			Any other result is included in the POST request as the 'action' parameter, which
	//			the server can use to determine what action to take. So for instance, clicking
	// 			"Edit" in the example, would result in a POST request with parameters:
	//				resid=42&resname=John%20Doe&action=edit
	//
	//	Other Conventions
	//		Dynamic behavior on dialog:
	//			Contents of the dialog, retrieved from contentUrl via AJAX, are expected to be
	//			self-contained. Any behavioral code can be included in a script tag.
	//			jQuery is available to JS code, and using jQuery event attachment (.on, .click, etc)
	//			will *probably* work, as long as it is attached in a $(document).ready(). But the
	//			timing of "document ready" from AJAX content may not be consistent across browsers,
	// 			so the recommendation is to attach handlers to elements through event attributes on
	// 			elements, and put the script before other HTML. See the "Add" link/button in the example.
	//
	//		Validation/Programmatic cancel of dialog close:
	//			Handler attachment through event attributes ensures that it is the first handler
	//			executed. This is necessary so that handlers on close buttons have the ability to
	//			cancel the POST request programmatically. This is done using the event object
	//			function "stopImmediatePropagation()". See the validate() function in the example.
	//
	//	Example content from contentUrl loaded via AJAX:
	//			<script>
	//				function validate(evt) {
	//					var $target = $(evt.currentTarget);
	//					if ($target.closest('form').find('[name=resid]').val() == '') {
	//						evt.stopImmediatePropagation();
	//						maUI.dialog('Validation', 'Please enter the name.')
	//						.then(function() {
	//							$target.focus();
	//						});
	//					}
	//				}
	//			</script>
	//			<form>
	//				<label>ID:</label><input name="resid" type="text" value="42" />
	//				<label>Name:</label><input name="resname" type="text" value="John Doe" />
	//				<a class="btn dialog-close" data-dlg-result="edit">Edit</a>
	//				<a class="btn dialog-close" onclick="validate()" data-dlg-result="add">Add</a>
	//				<a class="btn dialog-close" data-dlg-result="cancel">Close</a>
	//			</form>
	//*********************************************************************************************
	maUI.dialog.stdViews.SubmitDialogView = function(cfgView) {
		$.extend(this, cfgView);
	};
	maUI.dialog.stdViews.SubmitDialogView.prototype = {
		type: 'form',
		buttons: [],
		onDomReady: function($container) {
			this.$container = $container;
			maUI.attachThemeHandlers(this.$container);
			this.onDomReadyCustom(this.$container);
		},
		getContent: function() {
			return maUI.ajax({url: this.getContentUrl(), dataType: 'html', type: 'get'});
		},
		onDialogClose: function(dlgResult) {
			var self = this;
			var $frm = self.$container.find('form');
			var ajaxData = $frm.serializeArray();
			var bValid = true;

			if(dlgResult != 'x' && dlgResult != 'cancel' && (bValid = maUI.validateForm($frm))) {
				ajaxData.push({name: 'action', value: dlgResult});
				return maUI.ajax({
					url: self.postUrl,
					type: 'post',
					data: $.param(ajaxData)
				}).then(function(result) {
					self.returnData = result;
					return true;
				}).catch(function(response) {
					return maUI.dialog("Error", response.jqXHR.responseText).then(function() {
						return false;
					});
				});
			} else {
				return bValid;
			}
		},
		getReturnData: function() {
			return this.returnData;
		},
		onDomReadyCustom: function() {}
	};

	//*********************************************************************************************
	//	SimpleDataInputDialogView
	//		This standard dialog view allows creation of a simple dialog that queries and returns
	//		a collection of values from the user. The view automatically builds a styled form
	//		with the necessary inputs. At this time it only supports text input and no validation.
	//
	//	cfgView object:
	// 		A DialogView that extends this view. It expects a member named 'data', which defines fields for the form.
	//		The 'data' object is a collection of named members for which input fields will be
	//		generated.
	//		Each named member should have 'text' which will label the input, and 'value', if a starting
	//		value is desired (if omitted, it will start with an empty field).
	//
	//	Return value:
	//		When the dialog is closed, the Promise that it resolves will have a standard dialog()
	//		resolution with data ({dlgResult: '...', dlgData: {...}}).
	//
	//		The dlgResult member will indicate whether the user clicked "OK", "Cancel", or the "X",
	//		with values, 'ok', 'cancel', and 'x', respectively.
	//
	//		The dlgData member will have the values specified in the dialog when it was closed,
	//		as an object with name/value pairs. The names match the named members of 'data' in the
	//		cfgView object.
	//
	//	Example usage:
	//		function editCustomer() {
	//			maUI.dialog(new maUI.dialog.stdViews.SimpleDataInputDialogView({
	//				title: 'Edit Customer',
	//				type: 'form',
	//				data: {
	//					id: { text: 'Customer Id', value: '42' },
	//					name: { text: 'Customer Name', value: 'John Doe' }
	//				}
	//			})
	//			.then(function(dlgResults) {
	//				if(dlgResults.dlgResult == 'ok') {
	//					// ... save customer ...
	//					maUI.dialog('Success', 'Saved Customer, ' + dlgResults.dlgData.name +
	//											' with ID, ' + dlgResults.dlgData.id);
	//				}
	//			});
	//		}
	//*********************************************************************************************
	maUI.dialog.stdViews.SimpleDataInputDialogView = (function() {

		var generators = {
			text: function(name, cfg) {
				var ret =  $('<input />').attr('name', name).attr('type', 'text').addClass('field').val(cfg.value);
				// Add validation data, if it exists.
				if(cfg.validation && cfg.validation.$empty) {
					ret.attr('data-val-msg-empty', cfg.validation.$empty)
				}
				return ret;
			},
			radios: function(name, cfg) {
				var ret = $('<ul></ul>').addClass('list-actions');
				cfg.values.forEach(function(item) {
					var $inp = null;
					ret.append($('<li></li>').addClass('radio')
						.append($('<label></label>')
							.append($inp = $('<input />').attr('type', 'radio').attr('name', name).attr('value', item.value))
							.append($('<span></span>').text(item.text))
						)
					);

					if(item.value == cfg.value) {
						$inp.prop('checked', true);
					}
				});
				return ret;
			}
		};

		var SimpleDataInputDialogView = function(cfgView) {
			$.extend(this, cfgView);
		};
		SimpleDataInputDialogView.prototype = {
			type: 'form',
			getContent: function() {
				return this.genContent();
			},
			genContent: function() {
				var cfg = this.data;
				var $form = $('<form></form>').addClass('form form-small');
				Object.keys(cfg).forEach(function(k, i) {
					if(!(cfg[k].type)) cfg[k].type = 'text';
					var $ctrls = generators[cfg[k].type](k, cfg[k]);

					$form.append(
						$('<div></div>').addClass('form-row')
						.append($('<label></label>').addClass('form-label').text(cfg[k].text))
						.append(
							$('<div></div>').addClass('form-controls')
							.append($ctrls)
						)
					);
				});

				return $form;
			},
			onDomReady: function($container) {
				this.$container = $container;
			},
			getReturnData: function() {
				return this.$container.find('form').serializeArray();
			},
			buttons: [
					{ text: 'OK', value: 'ok' },
					{ text: 'Cancel', value: 'cancel' }
			]
		};

		return SimpleDataInputDialogView;
	})();
	//*********************************************************************************************
	//	SubmitSimpleInputDialogView
	//		This standard dialog is a sort of combination of the SubmitDialogView and the
	//		SimpleDataInputDialogView. It can generate a form based on a JSON definition, which
	//		can be optionally loaded from an AJAX endpoint, and submits the results of the dialog via AJAX
	//
	//	cfgView object: This config object can be a full DialogView, but it specifically expects any of these members:
	//		contentUrl: optional string, URL for the AJAX call to retrieve the dialog contents
	// 					(in JSON definition form - see SimpleDataInputDialogView parameter, data
	//		postUrl: string, URL where the results of the dialog will be posted
	//		data:	optional object, defines the inputs to be generated for the form.
	//
	//	More documentation and examples will be provided, but the main thing to understand is that
	//	the end result of this dialog is the same as SubmitDialogView, but it can be set up using
	//	the form construction SimpleDataInputDialogView, either from a JSON object provided in the
	//	cfgView.data member or from JSON returned from a URL specified in the cfgView.contentUrl
	//	member.
	//*********************************************************************************************
	maUI.dialog.stdViews.SubmitSimpleInputDialogView = function(cfgView) {
		$.extend(this, maUI.dialog.stdViews.SimpleDataInputDialogView.prototype);
		$.extend(this, maUI.dialog.stdViews.SubmitDialogView.prototype);
		this.getContent = this.getContentCustom;
		$.extend(this, cfgView);
	};
	maUI.dialog.stdViews.SubmitSimpleInputDialogView.prototype = {
		type: 'form',
		getContentCustom: function() {
			var self = this;
			if(this.getContentUrl() == '') {
				return self.genContent();
			} else {
				return maUI.ajax({url: this.getContentUrl(), dataType: 'json', type: 'get'})
					.then(function(data) {
						self.data = data;
						return self.genContent();
					});
			}
		},
	};

	maUI.dialog.stdViews.SubmitFileUploadDialogView = function (cfgView) {
	    $.extend(this, cfgView);
	};
	maUI.dialog.stdViews.SubmitFileUploadDialogView.prototype = {
	    type: 'form',
	    buttons: [],
	    onDomReady: function ($container) {
	        this.$container = $container;
	        maUI.attachThemeHandlers(this.$container);
	    },
	    getContent: function () {
	        return maUI.ajax({ url: this.contentUrl, dataType: 'html', type: 'get' });
	    },
		onDialogClose: function (dlgResult) {
			var self = this;
			var formData = new FormData(self.$container.find('form')[0]);

			if (dlgResult != 'x' && dlgResult != 'cancel') {
				formData.append("action", dlgResult);
				return maUI.ajax({
					url: self.postUrl,
					type: 'post',
					data: formData,
					contentType: false,
					processData: false
				}).then(function (result) {
					self.returnData = result;
					return true;
				}).catch(function (response) {
					return maUI.dialog("Error", response.jqXHR.responseText).then(function () {
						return false;
					});
				});
			} else {
				return true;
			}
		},
		getReturnData: function () {
			return this.returnData;
		}
	};

	//**************************************************************************
	//	tooltip()
	//		Creates a tooltip with specified HTML content. Functionally the
	//		same as a dialog, but with a different shell.
	//
	//	Parameters:
	//		See maUI.dialog(). The shell is simpler, so title and type are ignored.
	//**************************************************************************
	maUI.tooltip = function(config) {
		if(typeof(config.getDialogShell) != 'function') {
			config.getDialogShell = createTooltipShell.bind(config);
		}
		if(!config.actions) {
			config.actions = [ dlgStdActions.closeAlt ];
		}

		return maUI.dialog(config);
	};

	//**************************************************************************
	//	toast()
	//		Creates an Android-style toast message that fades after a short delay
	//
	//	Parameters:
	//		message: string
	//		type: enum - toast.type.(normal|success|error))
	//**************************************************************************
	maUI.toast = function(message, type) {
		// TODO: need an implementation that actually does an Android-style message. For now, we use dialog's fadeOut functionality
		var title = '';
		switch(type) {
			case maUI.toast.type.success: title = 'Success'; break;
			case maUI.toast.type.normal: title = 'Message'; break;
			case maUI.toast.type.error: title = 'Error'; break;
		}
		maUI.dialog({title: title, message: message, fadeOut: true});
	};

	maUI.toast.type = {normal: 1, success: 2, error: 3};

	//**************************************************************************
	//	ajax()
	//		Performs an ajax call with the same config as jQuery ajax, but returns
	//		a compliant promise, and ignores the 'success' and 'error' callbacks.
	//		In the case of an Ajax error, catch an object with this shape:
	// 			{jqXHR, textStatus, errorThrown}
	//		Corresponding to the arguments in the jQuery.ajax error callback.
	//
	//	Parameters:
	//		jqAjaxConfig: object - see http://api.jquery.com/jquery.ajax/ for documentation
	//**************************************************************************
	maUI.ajax = function (jqAjaxConfig) {
		return new Promise(function(resolve, reject) {
			jqAjaxConfig.success = resolve;
			jqAjaxConfig.error = function(jqXHR, textStatus, errorThrown) {
				reject({
					jqXHR: jqXHR,
					textStatus: textStatus,
					errorThrown: errorThrown
				});
			};
			$.ajax(jqAjaxConfig);
		});
	};

	//**************************************************************************
	//	print()
	//		Opens the browser's print dialog so that a page portion can be printed
	//		The intention is for this function to return a Promise that resolves
	//		when the print dialog has been closed, but testing indicates that the
	//		timing is not accurate for all browsers.
	//
	//	Browser Issues:
	// 		MS browsers (IE11, Edge) resolve the promise almost immediately, so
	//		any functionality placed after print() in the promise chain will begin
	//		executing before the print dialog has closed, in those browsers.
	//
	//	Parameters:
	//		element: null|HTMLElement|jQuery object|selector - the container for
	// 					the portion of the page to be printed. If null, the
	// 					entire page is printed.
	//		styling: true|string-css - custom css to be used for the print. When
	//				true (default), uses common/css/style.css
	//		isLink: boolean - if true, styling is assumed to be a filename that
	//				must be included in a <link> element, if false, assumes that
	//				styling is literal CSS code to be included in a <style> element
	//				Default: false, unless styling is omitted; see styling default
	//**************************************************************************
	maUI.print = (function() {
		// Static variables/functions for the print function to use.
		var printFrame = null;
		var frameLoadedPromise = null;
		var styleLoadedPromise = null;
		var afterPrintPromise = null;
		var resolveCurrentStyleLoaded = function() {};
		var resolveCurrentAfterPrintPromise = function() {};
		function printMediaQueryListener(mql) {
			if(!mql.matches) {
				resolveCurrentAfterPrintPromise();
			}
		}
		function onAfterPrintHandler() {
			resolveCurrentAfterPrintPromise();
		}
		function lazyLoadPrintFrame() {
			if (frameLoadedPromise === null) {
				frameLoadedPromise = new Promise(function(resolveFrameLoaded) {
					printFrame = document.createElement('iframe');
					printFrame.style.display = 'none';
					printFrame.onload = function() {
						// Note: we have two methods of capturing print finish event. Most browsers will only use one,
						//		but for the rare browser that might support both, or otherwise generate multiple calls
						//		to the handler, we take advantage of the nature of promise resolution, which resolves
						//		only once, and only executes '.then()' once per time that it is called.

						// Use MediaQueryList for browsers that support it.
						var mediaQueryList = printFrame.contentWindow.matchMedia('print');
						mediaQueryList.addListener(printMediaQueryListener);

						// Use onafterprint for browsers that support it.
						printFrame.contentWindow.onafterprint = onAfterPrintHandler;

						resolveFrameLoaded();
					};
					document.body.appendChild(printFrame);
				});
			}
		}

		// The print function.
		return function(element, styling, isLink) {
			var $target = null;
			if(element) {
				$target = $(element);
				if(!styling && styling !== false) {
					styling = true;
				}
				if(styling === true) {
					styling = '/Common/CSS/style.css';
					isLink = true;
				}
				var sEl;
				if(isLink) {
					sEl = document.createElement('link');
					sEl.rel = 'stylesheet';
					sEl.href = styling;
				} else {
					sEl = document.createElement('style');
					sEl.appendChild(document.createTextNode(styling));
				}
				sEl.onload = function() {
					resolveCurrentStyleLoaded();
				};
			} else {
				$target = $(document.body);
			}

			lazyLoadPrintFrame();

			return frameLoadedPromise.then(function() {
				styleLoadedPromise = new Promise(function(resolve) {
					resolveCurrentStyleLoaded = resolve;
				});
				printFrame.contentWindow.document.head.appendChild(sEl);
				printFrame.contentWindow.document.body.innerHTML = $target.html();
				afterPrintPromise = new Promise(function(resolve) {
					resolveCurrentAfterPrintPromise = resolve;
				});

				styleLoadedPromise.then(function() {
					// This method is required to print properly in IE 11.
					var result = printFrame.contentWindow.document.execCommand('print', false, null);

					// If it doesn't work, we are in a browser that doesn't support execCommand, but supports print().
					if (!result) {
						printFrame.contentWindow.print();
					}
				});

				return afterPrintPromise;
			})
		}
	})();

	//**************************************************************************
	//	validateForm()
	//		A function to validate a form, display the first error it encounters,
	//		using maUI.dialog(), and return a boolean indicating if it validated.
	//
	//	Parameters:
	//		frm: HTMLElement|jQuery object|selector - the form that is to be validated
	//
	//	Return Value: boolean - true if validation succeeded, otherwise false
	//
	//	Remarks
	//		At this time the validation function is very simple. It only checks
	//		for text inputs that are empty and should not be. An input indicates
	//		that it should not be empty by having a data-val-msg-empty attribute
	//		whose value is the error message that should be displayed to the user.
	//**************************************************************************
	maUI.validateForm = function(frm) {
		var ret = true;
		// At this time, the validate function only checks text inputs for empty values.
		var $inputs = $(frm).find('input[type=text]');
		$inputs.each(function(i, el) {
			var valMsg = $(el).data().valMsgEmpty;
			if(valMsg && el.value == '') {
				maUI.dialog('Validation', valMsg);
				ret = false;
				return false;
			}
		});

		return ret;
	};


	//**************************************************************************
	//	attachThemeHandlers()
	//		Attaches handlers that operate basic widgets of the theme.
	//		Includes things like the Datepicker, Tabs, Accordions, and other
	//		Show/Hide type UI behavior.
	//
	//		More Thorough documentation to come.
	//
	//	Parameters:
	//		element: null|HTMLElement|jQuery object|selector - the container for
	// 					the portion of the page to be printed. If null, the
	// 					entire page is printed.
	//		styling: true|string-css - custom css to be used for the print. When
	//				true (default), uses common/css/style.css
	//		isLink: boolean - if true, styling is assumed to be a filename that
	//				must be included in a <link> element, if false, assumes that
	//				styling is literal CSS code to be included in a <style> element
	//				Default: false, unless styling is omitted; see styling default
	//**************************************************************************
	maUI.attachThemeHandlers = (function() {
		var $win = $(window);
		var $doc = $(document);

		var setMaHandler = function(eventName, parent, selector, context, func) {
			if(parent == null) parent = document;
			if(context == null) {
				$(parent).find(selector).on(eventName, func);
			} else {
				$(parent).find(context).on(eventName, selector, func);
			}
		};

		var attachThemeHandlers = function(parent, context) {
			if(!context) context = null;
			if(!parent) {
				parent = $(document);
			} else {
				parent = $(parent);
			}

			// select
			parent.find('.select select').dropdown();
			setMaHandler('change', parent, '.select select', context, function (event) {
				$(this).dropdown("destroy");
				$(this).dropdown();
			});

		    // tooltip
			setMaHandler('click', parent, '.tooltip-toggle', context, function (event) {
			    event.preventDefault();

			    $(this).closest('.tooltip').toggleClass('tooltip-visible');
			});

		    // tooltip
			setMaHandler('click', parent, '.tooltip-toggle-next', context, function (event) {
			    event.preventDefault();

			    $(this).next('.tooltip').toggleClass('tooltip-visible');
			    
			});

			// Masked Edit Control
			// Intentionally before datepicker, so that Masked Edit Controls that use datepickers are enhanced properly.
			if(!!maUI.stdViews.MaskedEditControlView) {
				parent.find('.masked-edit-control').each(function(i, el) {
					maUI.applyView(el, new maUI.stdViews.MaskedEditControlView());
				});
			}

			// datepicker
			parent.find('.datepicker .field').datepicker({
				changeMonth: true,
				changeYear: true,
				showOn: 'both',
				yearRange: '-100:+100',
				dateFormat: 'm/d/yy'
			});

			// tabs
			setMaHandler('click', parent, '.tabs-nav a', context, function(event){
				event.preventDefault();

				var $tabLink = $(this);
				var target = $tabLink.attr('href');

				$tabLink
				.parent()
				.addClass('current')
				.siblings()
				.removeClass('current');

				$(target)
				.addClass('current')
				.siblings()
				.removeClass('current');
			});

			// popup
			setMaHandler('click', parent, '.popup-toggle', context, function(event){
				event.preventDefault();

				var target = $(this).attr('href');

				$(target).addClass('popup-open');
			});

			setMaHandler('click', parent, '.popup-close', context, function(event){
				event.preventDefault();

				$(this).closest('.popup')
				.removeClass('popup-open');
			});

			setMaHandler('keydown', parent, 'a', context, function(e){
				if (e.keyCode == 9);

				e.preventDefault()
			});

			(function(){
				var hasSelectedClass = 'file-upload-has-selected';
				var holderSelector = '.file-upload';
				var namesSelector = '.file-upload-names';
				var inputSelector = '.file-upload-input';
				var multipleNamesDivider = ', ';

				setMaHandler('change', parent, inputSelector, context, function() {
					var input = this;
					var files = input.files;

					// Files property polyfill
					if(!('files' in input)) {
						files = [];
						files.push({
							name: input.value.replace('C:\\fakepath\\', '')
						});
					}

					$(input)
					.closest(holderSelector)
					.toggleClass(hasSelectedClass, input.value !== '')
					.find(namesSelector)
					.val(
						$.map(files, function(file) {
							return file.name;
						})
						.join(multipleNamesDivider)
					);
				});
			})();

			//  box
			setMaHandler('click', parent, '.box-toggle', context, function(event){
				event.preventDefault();

				$(this).closest('.box-interactive').toggleClass('expanded').removeClass('edit');
			});

			setMaHandler('click', parent, '.box-toggle-edit', context, function(event) {
				event.preventDefault();

				$(this).closest('.box-interactive').addClass('expanded').toggleClass('edit');
			});

			// messages
			setMaHandler('click', parent, '.message-toggle', context, function(event){
				event.preventDefault();

				var $toggle = $(this);

				$toggle.closest('.messages').toggleClass('messages-expanded');
				$toggle.closest('.message-holder').toggleClass('message-holder-expanded');

				$toggle.closest('.popup-body').scrollTop(0);
			});

			// slider charts
			var $sliderCharts = parent.find('.slider-charts');
			var $sliderChartsSlides = $sliderCharts.find('.slides');

			$sliderChartsSlides.owlCarousel({
				items: 1,
				mouseDrag: false,
				loop: true
			});

			setMaHandler('click', parent, '.slider-charts .slider-prev', context, function(event){
				event.preventDefault();

				$sliderChartsSlides.trigger('prev.owl.carousel');
			});

			setMaHandler('click', parent, '.slider-charts .slider-next', context, function(event){
				event.preventDefault();

				$sliderChartsSlides.trigger('next.owl.carousel');
			});

			// example loading
			setMaHandler('click', parent, '.toggle-loading', context, function(event){
				event.preventDefault();

				$('.loading-overlay').addClass('visible');
			});

			// accordion
			setMaHandler('click', parent, '.accordion-head', context, function(){
			    $(this)
				.closest('.accordion-section')
				.toggleClass('accordion-section-expanded')
				.siblings()
				.removeClass('accordion-section-expanded');
			});

			setMaHandler('click', parent, '.open-next-accordion-section', context, function(event){
				event.preventDefault();
				$(this)
				.closest('.accordion-section')
				.next()
				.toggleClass('accordion-section-expanded')
				.siblings()
				.removeClass('accordion-section-expanded');
			});

			setMaHandler('click', parent, '.open-prev-accordion-section', context, function(event){
				event.preventDefault();

				$(this)
				.closest('.accordion-section')
				.prev()
				.toggleClass('accordion-section-expanded')
				.siblings()
				.removeClass('accordion-section-expanded');
			});

			setMaHandler('click', parent, '.item-toggle', context, function(event){
				event.preventDefault();

				$(this).toggleClass('item-hidden');
			});

			// scrollable table
			setMaHandler('scroll', parent, '.table-scroll-x-y .table-body .table-part-scrollable', context, function(){
				var $tablePartScrollable = $(this);
				var $table = $(this).closest('.table-scroll-x-y');
				var $tablePartScrollX = $table.find('.table-part-scroll-x');
				var $tablePartScrollY = $table.find('.table-part-scroll-y');

				$tablePartScrollX.css('margin-left', '-' + $tablePartScrollable.scrollLeft() + 'px');
				$('.form-filter-inner').css('margin-left', '-' + $tablePartScrollable.scrollLeft() + 'px');
				$tablePartScrollY.css('margin-top', '-' + $tablePartScrollable.scrollTop() + 'px');
			});

			// charts
			var chartDefaultConfig = {
				chart: {
					type: 'pie',
					backgroundColor: null,
					style: {
						'font-family': '"DIN", sans-serif;',
						'text-transform': 'uppercase',
						'font-size': '12px',
						'font-weight': 'bold'
					}
				},
				plotOptions:{
					pie: {
						dataLabels: {
							enabled: true,
							distance: -30,
							style: {
								fontWeight: 'bold',
								color: 'white',
								textShadow: null
							},
							formatter: function(){
								return  this.percentage + '%'
							}
						},
						showInLegend: true,
						states: {
							hover: {
								enabled: false
							}
						}
					}
				},
				legend: {
					// floating: true,
					layout: 'vertical',
					align: 'right',
					symbolHeight: 0,
					symbolWidth: 0,
					margin: 0,
					padding: 0,
					verticalAlign: 'middle',
					style: {
						'text-transform': 'uppercase'
					},
					// labelFormat: '{name} {point.y}'
					labelFormatter: function(){
						return this.name + '<br>' + this.percentage + '%'
					}
				},
				title: null
			};

			parent.find('.chart-canvas').each(function(){
				var $chart = $(this);

				$.ajax({
					url: $chart.attr('data-feed-url'),
					type: 'get'
				}).success(function(response){
					var highChartConfig = $.extend({}, chartDefaultConfig);

					highChartConfig.series = response;

					$chart.highcharts(highChartConfig)
				});
			});

			// remove
			setMaHandler('click', parent, '.link-remove', context, function(event){
				event.preventDefault();

				$(this).closest('.item-remove').remove();
			});

			// link toggle all
			setMaHandler('click', parent, '.link-toggle-all', context, function(event){
				event.preventDefault();

				$('.accordion-section').addClass('accordion-section-expanded');
			});

			// sortable
			// parent.find('.sortable').sortable();
			// parent.find('.sortable').disableSelection();

			// parent.find('.draggable').draggable({
			// 	revert: true,
			// 	revertDuration: 0
			// });

			// parent.find('.droppable').droppable({
			// 	activeClass: 'droppable-highlight',
			// 	greedy: true,
			// 	drop: function(){
			// 		$($('#' + $('.droppable').data('template')).html()).appendTo($(this).find('.template-holder'));
			// 	}
			// });

			// check if iOS
			if (navigator.appVersion.indexOf('Macintosh') > 1) {
				$('html').addClass('page-macintosh');
			}

		};

		$doc.ready(function() {
			attachThemeHandlers(document, null);
		});

		$win.on('load resize', function() {
			// equalise height
			$('.eq-elements').each(function(){
				$(this).find('.eq-element').equalizeHeight();
			});
		});

		$.fn.equalizeHeight = function() {
			var maxHeight = 0, itemHeight;

			for (var i = 0; i < this.length; i++) {
				itemHeight = $(this[i]).height('auto').height();
				if (maxHeight < itemHeight) {
					maxHeight = itemHeight;
				}
			}

			return this.height(maxHeight);
		};

		return attachThemeHandlers;

	})();


    //jquery extentions...
    (function ($) {
        //**************************************************************************
        //  $.maTooltip( options );
        //      auto apply a standard ma style tooltip to any element that has the
        //      "title" attribute. This is similar to the jquery.ui, without a lot
        //      of overhead
        //
        //  Parameters:
        //      options:    adjust the default behavior of the function. currently
        //                  only "container" and "selector" are available... but we
        //                  can expand to include: styles, classes, etc...
        //          container:  this will set the outer "bounds" of the tooltip area,
        //                      if set with a position: relative, then the tooltip will
        //                      flip to stay within the container...
        //                      defaults to the $(document.body)
        //          items:      a "selector" of items for which this function should be applied.
        //                      these are the elements "within" the initial source selector.
        //                      the default is "[title]" (i.e. anything with a "title" attribute)
        //
        //  Examples:
        //
        //      1) Default... anything in the document with a "title" attribute
        //          $.maTooltip();
        //          ...
        //          <input title="my content" value="" />
        //
        //      2) anything with the ".btn" class within any "section"
        //          $("section").maTooltip({ 
        //              items: ".btn" 
        //          });
        //          ...
        //          <a href="#" class="btn" title="will be in maTooltip">hi</a>
        //          <a href="#" title="will be oldschool">by</a>
        //
        //      3) with containing boundaries
        //          $("#myArea").maTooltip({
        //              container: "#myArea", // can be itself
        //          });    
        //
        //  CSS:   this uses the ".ma-jq-tooltip" series of styles in the common/style.css
        //
        //**************************************************************************

        //----------
        // private helper
        //----------
        var _refId = 0;
        var _newId = function () { return ++_refId; }

        // public function
        $.fn.maTooltip = function (options) {
            var settings = $.extend({ //defaults
                container: $(document.body),
                items: "[title]"
            }, options);

            var fn = {
                open: function () {
                    console.log("tip -> mouseenter");
                    var $el = $(this);
                    var content = $el.attr("title");
                    if (content == "") return;

                    var tip = $("<div>" + content + "</div>");
                    var id = "ma-tip-" + _newId();
                    tip.attr("id", id)
                        .addClass("ma-jq-tooltip")
                        .addClass("tip-at-left")
                        .addClass("tip-at-top")

                    //hide/rename the "title" attribute, so that it doesn't popup natively
                    $el.attr("ma-title", content)
                        .attr("ma-tip-id", id)
                        .attr("title", "");

                    //set default placement to get good height/width measurments
                    tip.css({ left: "0px", top: "0px", opacity: 0 }); //also... hide
                    $container.append(tip);//add to dom (so that we can measure)

                    //get abs measurments
                    var elRect = $el[0].getBoundingClientRect();
                    var tipRect = tip[0].getBoundingClientRect();
                    var contRect = $container[0].getBoundingClientRect();

                    //calc TOP, based on overlapping "container"
                    var tipTop = (elRect.top - tipRect.height);

                    //if top is past container "view" area, flip vertically
                    if ((tipTop + contRect.top) < 0) {
                        tip.removeClass("tip-at-top").addClass("tip-at-bottom");
                        tipTop = elRect.bottom;
                    }
                    tip.css("top", tipTop + "px"); //set

                    //calc LEFT, based on overlapping "container"
                    var tipLeft = elRect.left;

                    //if right is past container "view" area, flip horizontally
                    if ((tipLeft + tipRect.width) > contRect.right) {
                        tip.removeClass("tip-at-left").addClass("tip-at-right");
                        tipLeft = elRect.right - tipRect.width;
                        if ((tipLeft + tipRect.width) > contRect.right) {
                            tipLeft = contRect.right - tipRect.width;
                        }
                    }
                    tip.css("left", tipLeft + "px"); //set
                    tip.css("opacity", 1);//show
                },
                close: function () {
                    var $el = $(this);
                    var id = $el.attr("ma-tip-id");
                    var tip = $container.find("#" + id);
                    //reset default title
                    if ($el.attr("title") == "") {
                        $el.attr("title", $el.attr("ma-title"));
                    }
                    $el.removeAttr("ma-title");
                    tip.css({ opacity: 0 });//hide (for css3 fade)
                    setTimeout(function () {
                        tip.remove();
                    }, 300) //wait .3s to remove (per css fade!)
                }
            }

            var $container = $(settings.container);

            //if already loaded (from a prior ajax based content load...) remove it
            var priorLoadedFunctions = this.data("maTooltipFunctions");
            if (priorLoadedFunctions) {
                this.off('mouseenter', settings.items, priorLoadedFunctions.open);
                this.off("mouseleave", settings.items, priorLoadedFunctions.close);
            }
            this.data("maTooltipFunctions", fn); //keep reference to the event functions

            return this.on({
                mouseenter: fn.open,
                mouseleave: fn.close
            }, settings.items);
        }



        //**************************************************************************
        //  $.offOn( events, selector, handler );
        //    like ".on()" however it first removes any pre-existing event for the selector
        //     
        //  Parameters:
        //      events:     One or more space-separated event types and optional namespaces, 
        //                  such as "click" or "keydown.myPlugin"
        //      selector:   A selector string to filter the descendants of the selected 
        //                  elements that trigger the event. If the selector is null, the event 
        //                  is always triggered when it reaches the selected element
        //      handler:    A function to execute when the event is triggered
        //
        //  Example:
        //      $container.offOn('click','.btn', function(event){ alert("HI"); } );
        //      $container.offOn('click','.btn', function(event){ alert("BYE"); } );
        //
        //      when the ".btn" element is clicked (in the $container), only the alert("BYE")
        //      will be fired.
        //
        //**************************************************************************
        $.fn.offOn = function (events, selector, handler) {
            this.off(events, selector) //not specifying handler, because it may be from a new object "instance" (so technically not be the same)
                .on(events, selector, handler);
        }

    })($);

    /*************************************

    create a set of utilities for maUI

    **************************************/
    (function () {
        if (!maUI.util) {
            maUI.util = {};
        }

        maUI.util.sortAlgorithms = {
            num: function (a, b) { return a - b },
            text: function (a, b) {
                if (a === b) return 0;
                if (a > b) return 1
                return -1;
            }
        }



        ///a safe way to "find" objects based on text (without using eval)
        ///will return null if not found
        ///if context is omitted, then the global scope will be used
        ///
        ///var obj = maUI.util.parseObject('my.container.something');
        ///same as...
        ///var obj = maUI.util.parseObject('something', my.container);
        maUI.util.parseObject = function (path, context) {
            var obj = null;
            context = context || window;
            var parts = path.split('.');
            for (var i = 0; i < parts.length; i++) {
                var t = context[parts[i]];
                if (t == undefined) return null;
                obj = context = t;
            }
            return obj;
        }

        ///like parseObject, but will create the object if it does not exist
        maUI.util.ensureObject = function (path, context) {
            var obj = null;
            context = context || window;
            var parts = path.split('.');
            for (var i = 0; i < parts.length; i++) {
                var t = context[parts[i]];
                if (t === undefined) t = context[parts[i]] = {}; //add it
                obj = context = t;
            }
            return obj;
        };
        ///like ensureObject, but SETS the value at the end
        ///returns the context object (for additional chaining)
        maUI.util.setObjectValue = function (path, context, value) {
            var originalContext = context = context || window;
            var parts = path.split('.');
            for (var i = 0; i < parts.length; i++) {
                var t = context[parts[i]];
                if (t === undefined) t = context[parts[i]] = {}; //add it
                if (i == parts.length - 1) {
                    context[parts[i]] = value;
                    break;
                }
                context = t;
            }
            return originalContext;
        };

        //true if object (not string or array or date etc...)
        maUI.util.isObject = function (obj) {
            switch (typeof obj) {
                case "string":
                case "boolean":
                case "function":
                case "number": return false; break;
                default:
                    if (obj instanceof Date) return false;
                    if (obj instanceof Array) return false;
                    if (obj == null) return false;
                    if (obj == undefined) return false;
                    return true;
                    break;
            }
        };

        ///pure JavaScript Array object ([], new Array())
        maUI.util.isArray = function (obj) {
            //redundant, but for completeness sake...
            return Array.isArray(obj);
        }

        ///identify Array and objects inheriting the Array prototype
        ///i.e. MySubArrayClass.prototype = new Array;
        maUI.util.isArrayBased = function (obj) {
            return obj instanceof Array;
        }

        ///identify any object supporting basic array functionality, utilizing for..next loops
        ///examples include the "arguments" within a function and dom NodeList collections
        maUI.util.isArrayLike = function (obj) {
            if (!obj) return false;
            return maUI.util.isArrayBased(obj)
                || obj.toString() === '[object Arguments]' //"arguments" passed to a function
                || obj.toString() === '[object NodeList]' //DOM node list (e.g. document.getElementsByName('foo');)
        }

        maUI.util.isObjectOrArray = function (obj) {
            return maUI.util.isObject(obj) || Array.isArray(obj);
        };

        //check for function
        maUI.util.isFunction = function (obj) {
            return (obj instanceof Function);
        }
        //why not...
        maUI.util.isString = function (str) {
            return typeof (str) == 'string' || str instanceof String;
        }

        //allows special charactors to be used within selectors
        //example:
        // <div id="something.named:funky|here" />
        //  ...
        // var $( maUI.util.cssEscape("#something.named:funky|here") ).click();
        maUI.util.cssEscape = function cssEscape(str) {
            return str.replace(/(:|\.|\[|\]|\||,|=|@)/g, "\\$1")
        }


    })();

    //add some simple function wrappers (for quick js replacement)
    maUI.fn = {
        //returns a promise of true or false
        alert: function (msg) {
            return maUI.dialog({ title: "Alert", message: msg })
                .then(function () {
                    return true;
                });
        },
        //returns true if YES is clicked... false otherwise (canceled or closed by "x")
        confirm: function (msg) {
            //wrap with a promise that will throw a REJECT
            return new Promise(function (resolve, reject) {
                return maUI.dialog({
                    title: "Confirm",
                    message: msg,
                    buttons: [
                        { text: "Yes", value: true },
                        { text: "No", value: false }
                    ]
                }).then(function (ok) {
                    if (ok === true) resolve(true)
                    else resolve(false)
                })
                .catch(function (err) {
                    resolve(false);
                })
            });
        }
    }

})(maUI, jQuery, document, window);