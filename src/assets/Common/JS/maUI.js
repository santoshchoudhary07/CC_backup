// Custom UI constructs implemented as plugins on the Manage America UI namespace
var maUI = {};

(function(maUI, $, document, window) { //maUI (ManageAmerica User Interface) is the object that is like "our jquery".  It's a namespace for us to create custom plugins.

	//**************************************************************************
	//	document.currentScript
	//		This is a very simple polyfill. It should only be necessary for IE11,
	//		and seems to work in that context.
	//
	//		Note that this may not work in scripts that are loaded via
	//		AJAX. It is only tested for scripts embedded pages directly.
	//**************************************************************************
	if(!document.currentScript) {
		Object.defineProperty(document, "currentScript", {
			get: function() {
				var scripts = document.getElementsByTagName('script');
				return scripts[scripts.length - 1];
			}
		});
	}

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

	maUI.types = {};

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
	var ViewBase = maUI.types.ViewBase = {
		// getContentUrl
		// return value: URL string: indicates the endpoint where the HTML content is located
		contentUrl: '',
		getContentUrl: function() { return this.contentUrl; },

		// getContent
		// target param: the outer shell wherein the view is placed -
		//		more than the immediate container, this is the jQuery object passed to applyView(),
		//		or in the case of dialog(), the maUIDialog object that is constructing the dialog.
		// getParams param: a basic JS Object (key/value pair collection), that defines extra GET parameters that should be
		//		sent with AJAX content calls, assuming this view defines a contentUrl for the standard getContent() method.
		// return value: HTML string | jQuery, or Promise resolved with HTML|jQuery value
		//		HTML string (optionally jQuery wrapped) content for the dialog
		content: '',
		getContent: function(target, getParams, postParams) {
			var cfg = {
				url: this.getContentUrl()
			};
			if(!!cfg.url) {
				cfg.url = maUI.util.appendParams(cfg.url, getParams);

				if(typeof(postParams) == 'object' && !!postParams) {
					cfg.data = postParams;
				}

				return maUI.ajax(cfg);
			} else {
				return this.content; // effectively: return Promise.resolve(this.content);
			}
		},

		// onDomReady
		//		onDomReady is called by maUI on initialization after the content has been fully loaded into the DOM.
		// 		This is the best place to attach handlers for the view that should only be applied once.
		// $contentContainer param: jQuery wrapper around DOM element
		//		Passes the containing HTML element for the UI the View controls
		// return value: Promise (optional)
		//		Promise notifies of outstanding asynchronous process, if any. Excluding a return statement is acceptable.
		//		Caller awaits promise, if any, but does not use resolution value.
		onDomReady: function($contentContainer) {
			return Promise.resolve();
		},


		// onBeforeContentLoad
		//		This event handler is called before content is loaded into the view.
		//		It occurs both after initialization (immediately before onDomReady), as well as after every reload (as per the
		//		default implementation of reload())
		//		This is the best place to put client side DOM transformations that need to happen before the HTML is visible
		//		(to prevent flicker, etc.)
		//	$html parameter: a jQuery object with the HTML that is prepared for insertion to the DOM
		//	return value: HTML string or jQuery object
		//		The HTML that will be inserted into the DOM, after any manipulations or overrides.
		onBeforeContentLoad: function($html) { return $html; },

		// onContentLoad
		//		This event handler is called after content is loaded into the view.
		//		It is different from onDomReady in that this function is called both after initialization (immediately after
		//		onDomReady), as well as after every reload (as per the default implementation of reload())
		//		This is the best place to put client side DOM transformations that need to happen on every load (ie, jQuery UI, etc).
		//	return value: current object instance.
		//		For overrides, returning <this> is recommended, so that the promise returned by applyView() resolves on this instance.
		//		Doing this ensures that any .then() calls have a current reference to the view.
		//		Present implementation does not guarantee that references of the view created before the applyView() will not be copied during applyView()
		onContentLoad: function() { return this; },

		//	reload
		//		This is a helpful function to reload the content. It automatically calls onContentLoad().
		reload: function(getParams, postParams) {
			var self = this;
			self.$container.append(getLoadingOverlay(self.$container.children().length == 0));

			// Record expanded sections
			// NOTE: If multiple accordion sections have the same title, refresh will expand both if either is expanded. This is more likely if there are multiple accordions.
			var expanded = [];
			self.$container.find('.accordion .accordion-section-expanded').each(function() {
				expanded.push($(this).find('.accordion-head').find('h2,h3,h4').text());
			});

			return self.getContent(self.$container, getParams, postParams).then(function(html) {
				html = self.onBeforeContentLoad(maUI.parse$HTML(html));
				self.$container.html(html);
				self.onContentLoad();

				// Reset expanded sections
				if(expanded.length > 0) {
					self.$container.find('.accordion .accordion-section').removeClass('accordion-section-expanded')
						.each(function() {
							var $section = $(this);
							if (expanded.indexOf($section.find('.accordion-head').find('h2,h3,h4').text()) != -1) {
								$section.addClass('accordion-section-expanded');
							}
						});
				}

			}).catch(function (errorObjs) {
				self.$container.find('.loading-overlay').remove();
				var message = 'Unexpected error.';
				if(!!errorObjs.jqXHR) {
					maUI.dialog('Error', errorObjs.jqXHR.responseText);
				}
				if(!!errorObjs.message) {
					message = errorObjs.message;
				}
				maUI.dialog('Error', message);

			});
		},

		// closeView
		//		This function provides a way for a view to be "closed". This could mean different things to different views.
		//		It might mean that all interactive UI is removed and a message is shown informing that interaction is complete
		//		(for instance, an AJAX Contact Us form).
		//		Notably, a dialog view would use this to close (hide) the dialog.
		//	return value: a promise that resolves when the view is closed
		//		Catching this promise is currently problematic. It is returned by maUI.dialog(), but not by maUI.applyView().
		//		Ultimately, it should probably be returned from applyView, but this would be a breaking change, and until
		//		it is necessary, I am deferring that refactor.
		closeView: function() { return Promise.resolve(); }
	};

	maUI.applyView = function(selector, view) {
		var $target = $(selector);
		// Extend using a temp variable so we can preserve the reference
		var temp = $.extend(true, {}, ViewBase, view);
		var _view = $.extend(view, temp);

		_view.$ = $target.addClass('view-container');

		var $loadOverlay = getLoadingOverlay(_view.$.children().length == 0);
		_view.$.append($loadOverlay);

		var ret;
		//var data = $target.data()||{};
		var enhanced = $target.data("enhanced");
		if(enhanced) {
			ret = new Promise(function(resolve) {
				$loadOverlay.remove();
				resolve();
			});
		} else {
			ret = Promise.resolve(_view.getContent($target)).then(function (content) {
				var $html = _view.onBeforeContentLoad(maUI.parse$HTML(content));
				_view.$.html($html);
			})
		}

		var closePromise = new Promise(function(resolve) {
			var closeView = view.closeView;
			view.closeView = function() {
				resolve(closeView.call(view, arguments));
			};
		});

		return ret.then(_view.onDomReady.bind(_view, _view.$))
			.then(_view.onContentLoad.bind(_view))
			.then(function() {
				return closePromise;
			});
	};


	//applyView was changed to return a promise of closeView instead of returning itself.
	//The below maUI.setView is a copy of the old applyView.  It is needed for those pieces of functionality that need it to return itself instead of a closeView.
	maUI.setView = function (selector, view) {
		var $target = $(selector);
		var _view = $.extend(true, {}, ViewBase, view);

		_view.$ = $target.addClass('view-container');

		var ret;
		//var data = $target.data()||{};
		var enhanced = $target.data("enhanced");
		if (enhanced) {
			ret = Promise.resolve();
		} else {
			ret = Promise.resolve(_view.getContent($target)).then(function (content) {
				var $html = _view.onBeforeContentLoad(maUI.parse$HTML(content));
				_view.$.html($html);
			})
		}

		return ret.then(_view.onDomReady.bind(_view, _view.$))
			.then(_view.onContentLoad.bind(_view));
	};


	//**************************************************************************
	//	maUI.stdViews.ListBuilderControlView
	//		This is a view that manages a "List Builder" UI pattern. At it's core,
	//	it consists of two 'multi' select boxes, with buttons to move items back
	//	and forth between them.
	//
	//	Parameters
	//		cfg:	this config option has any settings that need to be added to the
	//				view to determine included features and specifics to their
	//				behavior.
	//
	//	Features
	//		This control is implemented to grow. Ultimately, many features may be
	//	useful, such as ability to order one or both lists, ability to filter
	//	either list, etc. Features can, and should, be added as needed, but
	//	should be careful not to unduly alter existing usages of the view.
	// 		Because maUI.applyView() acknowledges the 'enhanced' (data-enhanced attr)
	//	attribute, the client is welcome to supply the HTML for the control,
	//	excluding any features that are not desired in context. The view will
	//	supply the behavior (event handlers) to make it work.
	// 		If the user does not indicate, with 'enhanced', that the HTML has
	//	been supplied, the view will also provide that UI. Idealy, the 'cfg'
	//	parameter will also be used to determine what features are included.
	//
	//	Currently implemented (CSS selector notation for UI elements with implemented behavior)
	//		.lbc-left:	the left-hand select box
	//		.lbc-right:	the right-hand select box
	//		.lbc-mv-left:	the button to move items to the left box
	//		.lbc-mv-right:	the button to move items to the right box
	//		.lbc-mv-all-left:	the button to move all items to the left box
	//		.lbc-mv-all-right:	the button to move allitems to the right box
	//**************************************************************************
	maUI.stdViews = {};

	maUI.stdViews.ListBuilderControlView = function(cfg) { $.extend(this, cfg); };
	maUI.stdViews.ListBuilderControlView.prototype = {
		getContent: function() {
			// TODO: Ideally, the view should provide the DOM for the control, for the client's convenience.
			//	It just hasn't been necessary to implement yet.
			// See EditLateFeeProfile.asp:div.list-builder-control for a working DOM that uses this View.
			return '<pre>This view does not provide a DOM at this time. See comments.</pre>';
		},
		onDomReady: function($container) {
			this.$container = $container;
			this.$container.on('click', '.lbc-mv-left', this.moveItemsLeft.bind(this));
			this.$container.on('click', '.lbc-mv-right', this.moveItemsRight.bind(this));
			this.$container.on('click', '.lbc-mv-all-left', this.moveAllItemsLeft.bind(this));
			this.$container.on('click', '.lbc-mv-all-right', this.moveAllItemsRight.bind(this));

			// Double Click - commented event handlers would be for straight listboxes.
			//this.$container.on('dblclick', '.lbc-right', this.moveItemsLeft.bind(this));
			//this.$container.on('dblclick', '.lbc-left', this.moveItemsRight.bind(this));
			// TODO: double click doesn't work because of the Formstone Dropdown transformation.
			//	While the options could be reached ('.lbc-right + .fs-dropdown-options > button'), we have code that explicitly
			//	destroys and recreates the dropdown on every change (see maUI.attachThemeHandlers()), and this cancels any
			//	attempt at a double click. So either that code needs to be rethought, or we implement the List Builder without
			//	Formstone Dropdown. I prefer the latter idea - it would just take some CSS, a la .fauxstone-dropdown. ~JJ
		},
		onContentLoad: function() {
			this.$container.find('.select select').dropdown();
			return this;
		},
		moveItemsLeft: function() {
			var leftList = this.$container.find('.lbc-left');
			this.$container.find(".lbc-right option:selected")
				.detach()
				.appendTo(leftList)
				.removeAttr("selected");

			this.sortOptions(leftList);
			this.refreshLists();
		},
		moveItemsRight: function() {
			var rightList = this.$container.find('.lbc-right');
			this.$container.find(".lbc-left option:selected")
				.detach()
				.appendTo(rightList)
				.removeAttr("selected");

			this.sortOptions(rightList);
			this.refreshLists();
		},
		moveAllItemsLeft: function() {
			var leftList = this.$container.find('.lbc-left');
			this.$container.find(".lbc-right option")
				.detach()
				.appendTo(leftList)
				.removeAttr("selected");

			this.sortOptions(leftList);
			this.refreshLists();
		},
		moveAllItemsRight: function() {
			var rightList = this.$container.find('.lbc-right');
			this.$container.find(".lbc-left option")
				.detach()
				.appendTo(rightList)
				.removeAttr("selected");

			this.sortOptions(rightList);
			this.refreshLists();
		},
		prepareSubmitRight: function() {
			this.$container.find('.lbc-left option').prop('selected', false);
			this.$container.find('.lbc-right option').prop('selected', true);
		},
		refreshLists: function() {
			this.$container.find('.lbc-left').dropdown('update');
			this.$container.find('.lbc-right').dropdown('update');
		},
		sortOptions: function ($select) {
			var $opts = $select.children();

			$opts.sort(function (a, b) {
				if ($(a).text() < $(b).text()) {
					return -1;
				}

				if ($(a).text() > $(b).text()) {
					return 1;
				}

				return 0;
			});

			$select.empty().append($opts);
		}
};

	maUI.stdViews.PropertySelectWrapper = function(wrappedView) {
		$.extend(this, wrappedView, maUI.stdViews.PropertySelectWrapper.prototype);

		this.wrappedView = wrappedView;

	};
	maUI.stdViews.PropertySelectWrapper.prototype = {
		getContent: function() {
			var self = this;
			return $('<div></div>').append(
				$('<div></div>').addClass('form form-smaller ctrl-property-select').append(
					$('<label></label>').addClass('form-label').text('Property:'),
					$('<div></div>').addClass('form-controls').append(
						$('<select></select>').addClass('fauxstone-dropdown')
					)
				),
				$('<div></div>').addClass('clear'),
				self.clientArea = $('<div></div>')
			);
		},
		onDomReady: function($container) {
			var self = this;
			self.$container = $container;
			return self;
		},
		onBeforeContentLoad: function($html) { return $html; },
		onContentLoad: function() {
			var self = this;
			if(!self.$container && self.$) {
				self.$container = self.$;
				console.warn('maUI.stdViews.PropertySelectWrapper - self.$container did not exist');
			}
			self.$propSelect = self.$container.find('.ctrl-property-select select');
			maUI.applyView(this.$container.find(this.clientArea), this.wrappedView);
			maUI.ajax({
				url: '/Login2/GetCurrentCompanyProps.asp',
				dataType: 'json'
			}).then(function(props) {
				if(Array.isArray(props)) {
					for(var i = 0; i < props.length; i += 1) {
						self.$propSelect.append($('<option></option>').val(props[i].code).text(props[i].name));
					}
					self.$propSelect.val(self.propCode);
					self.propName = self.$propSelect.find('option:selected').text();
				}
				self.$propSelect.on('change', self.propertyChanged.bind(self));
			});
		},
		propertyChanged: function(evt) {
			this.wrappedView.propCode = this.propCode = evt.target.value;
			this.wrappedView.propName = this.propName = $(evt.target).find('option:selected').text();
			this.wrappedView.reload();
		}
	};

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
		popout: function(view, viewType, viewTypeSrc, windowName) {
			return {
				classes: 'popup-open-new-window',
				attributes: {},
				events: {
					click: function(dlg) {
						maUI.popout(view || dlg.view || {}, viewType, viewTypeSrc, windowName);
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
		fadeOut: false,
		fadeOutFast: false
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

		// Extend using a temp variable so we can preserve the reference
		var temp = $.extend({}, DialogViewBase, options);
		var view = $.extend(options, temp);

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

		//Make the background stuff not printable so that if you print the dialog, it only prints that. In Chrome, only the modal prints automatically, but in IE it tries to print the underneath layers as well.
		$(".wrapper").addClass("do-not-print");
		$(".popup").addClass("do-not-print");

		// Prepare the return promise, starting with the dialog content.
		var ret = Promise.resolve(view.getContent(dlg));

		ret = ret.then(function(content) {
			var $html = view.onBeforeContentLoad(maUI.parse$HTML(content));
			dlg.$.find('.popup-entry').html($html);
			dlg.$ = dlg.$.appendTo(view.parent);
			dlg.setTitle();
			dlg.$.addClass("popup-open");
		});

		//everytime we say ret = ret.then(), we're saying chain a new promise onto ret and then hold onto the new promise that will resolve at the very end of the chain as ret.
		ret = ret.then(dlg.addDialogActions.bind(dlg));

		ret = ret.then(view.onDomReady.bind(view, dlg.$.find('.popup-entry'), dlg))
			.then(view.onContentLoad.bind(view))
			.then(dlg.$.find('.popup-inner').draggable({ handle: '.popup-head' }));

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
	function newId() {
	    //return idCounter++; //simple, but could reset if file loaded twice.
	    return performance.now().toString(36).replace('.', '_'); //based on performance timer. unique for life of page
	}
	function createStandardDialogShell() {
		var id = this.id;
		if(!this.id) {
		    id = 'popup-' + newId();
		}
		var dlgClass = 'popup';
		var dlgType = this.getType();
		if(dlgType) {
			dlgClass += ' popup-' + dlgType;  //uses classes in style.css that start with "popup-".  known types: form, form-wide, alert, messages, tasks, modules, chart-details, all-charts-details, quicklinks, as-tooltip, properties, report-builder, add-message
		}
		var $entry = null;
		var ret = $('<div></div>').attr('id', id).addClass(dlgClass)
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
				.append(
					$entry = $('<div></div>').addClass('popup-entry')
				)
				.append($('<div></div>').addClass('popup-buttons'))
			)
		);
		if(!!$entry) {
			$entry.append(getLoadingOverlay($entry.children().length == 0));
		}
		return ret;
	}
	function createTooltipShell() {
		var id = this.id;
		if(!this.id) {
		    id = 'popup-' + newId();
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
	function getLoadingOverlay(bUseLightBg) {
		var addedClasses = '';
		if(bUseLightBg) {
			addedClasses = ' light-bg';
		}
		return $('<div></div>').addClass('loading-overlay visible' + addedClasses)
			.append($('<div></div>').addClass('loading-overlay-content')
				.append(
					$('<img>').attr('src', '/Common/CSS/images/loading.gif')
						.attr('width', '30')
						.attr('height', '30')
				)
				.append('Loading')
			)
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
				self.view.closeView = function(dlgResult) {
					resolve(self.close(dlgResult));
				};

				self.$.on('click', 'a.popup-close:not(.btn-disabled), a.dialog-close:not(.btn-disabled)', function (evt) {
					var dlgResult = $(evt.currentTarget).data().dlgResult;
					var $btnClicked = $(evt.currentTarget || evt.target);
					$btnClicked.addClass("btn-disabled"); //prevent double clicking
					Promise.resolve(self.view.onDialogClose(dlgResult)).then(function(bShouldClose) {
						if(bShouldClose) {
							resolve(self.close(dlgResult));
						}
						else {
							$btnClicked.removeClass("btn-disabled");
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
				// Process fadeOutFast option
				if (self.view.fadeOutFast !== false) {
					setTimeout(function () {
						self.$.fadeOut('fast', function () {
							resolve(self.close('fade'));
						});
					}, self.view.fadeOutFast === true ? 500 : self.view.fadeOutFast);
				}
			});
		},
		close: function(dlgResult) {

			this.$.removeClass('popup-open');

			// Dispose of the HTML
			this.$.remove();
			 
			//Make the background stuff printable again.  In Chrome, only the modal prints automatically, but in IE it tries to print the underneath layers as well.
			//$(".wrapper").removeClass("do-not-print");
			//$(".popup").removeClass("do-not-print"); 

			//only remove the do-not-print class from the wrapper if there are no popups left open
			if ($(".popup.popup-open").length == 0) {
				$(".wrapper").removeClass("do-not-print");
			}
			//remove the do-not-print class only from nested open popups so that the hidden popup still will not print
			$(".popup.popup-open").each(function (index) {
				if (index > 0 || $(".popup.popup-open").length == 1) {
					$(this).removeClass("do-not-print");
				}
			});
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
	maUI.types.maUIDialog = maUIDialog;



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
	//				<a class="btn dialog-close" onclick="validate(event)" data-dlg-result="add">Add</a>
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
			if(this.getContentUrl() != '') {
				return maUI.ajax({url: this.getContentUrl(), dataType: 'html', type: 'get'});
			} else {
				return
			}
		},
		onDialogClose: function(dlgResult) {
			var self = this;
			var $frm = self.$container.find('form');
			var ajaxData = $frm.serializeArray();
			var bValid = true;

			if (dlgResult != 'x' && dlgResult != 'cancel' && (bValid = maUI.validateForm($frm))) {
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
			var pid = self.$container.find('#PID').val();

			if (dlgResult != 'x' && dlgResult != 'cancel') {
				formData.append("action", dlgResult);
				return maUI.ajax({
					url: self.postUrl + '&PID=' + pid,
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


	//*********************************************************************************************
	//	NoteViewerDlgView
	//		This standard dialog is an alternative to the maNoteViewer jQuery plugin. It functions
	//		as a DialogView, so that it can be loaded with maUI.dialog(). It uses "refresh" design
	//		artifacts, but otherwise should function the same as maNoteViewer does/did.
	//
	//		Unlike maNoteViewer, all of the CSS is baked into the style.css file, so it is
	//		independent of maNoteViewer.css
	//
	//	settings object: This config object is the same as the settings object passed to maNoteViewer.
	//		However, as it was discovered that all of the existing uses of maNoteViewer used the
	//		same values, those values have been pushed into the defaults, so that settings may be
	//		omitted in most cases.
	//
	//	NOTE: Some of the default values in the settings parameter were also pushed into the CSS.
	//		If specialized values are required in the future, this may cause unexpected results,
	//		and that implementation choice may need to be re-evaluated.
	//*********************************************************************************************
	maUI.dialog.stdViews.NoteViewerDlgView = function(notes, settings) {
		this.notes = notes;
		this.settings = {
			data: [],
			headerHeight: 30,
			height: 510,
			notesHeight: 100,
			photosHeight: 250,
			popoutUrl: "/Rent_Roll/ImageView.aspx",
			width: 660
		};
		if(!!settings) {
			$.extend(this.settings, settings);
		}
	};
	maUI.dialog.stdViews.NoteViewerDlgView.prototype = {
		title: 'Note Viewer',
		type: 'form-medium',
		getContent: function() {
			var self = this;
			var ret = $('<div></div>').addClass('tabs');
			if (!self.notes.length) {
				ret
				.empty()
				.html("No notes present");

				return ret;
			}
			// Navigation
			var $navList;
			ret.append($('<header></header>').addClass('tabs-head').append(
				$('<nav></nav>').addClass('tabs-nav').append(
					$navList = $('<ul></ul>')
				)
				)
			);

			// Tab body
			var $tabsBody = $('<div></div>').addClass("tabs-body");
			ret.append($tabsBody);

			$.each(this.notes, function (i, note) {
				var $noteSection;
				$navList.append(
					$("<li />").addClass(i == 0 ? 'current' : '').append(
						$("<a />").attr("href", "#maNoteViewerNote" + note.id).text("Note " + (i + 1))
					)
				);

				$tabsBody.append(
					$("<div></div>").addClass('tab' + (i == 0 ? ' current' : '')).attr("id", "maNoteViewerNote" + note.id).append(
						$('<section></section>').addClass('section').append(
							$('<header></header>').addClass('section-head').append(
								$('<h4></h4>').addClass('section-title').text(
									note.subject + ' - ' +
									(note.timestamp.getMonth() + 1).toString() + "/" + note.timestamp.getDate() + "/" + note.timestamp.getFullYear() +
									' - ' + note.category
								)
							),
							$('<div></div>').addClass('section-body').append(
								$("<div />").addClass("ma-note-viewer-image-outer-panel").append(
									$('<div></div>').addClass('ma-note-viewer-arrow ma-note-viewer-left-arrow ma-note-viewer-hidden'),
									$('<div></div>').addClass('ma-note-viewer-arrow ma-note-viewer-right-arrow ma-note-viewer-hidden'),
									$('<div></div>').addClass('ma-note-viewer-rotate ma-note-viewer-hidden'),
									$('<div></div>').addClass('ma-note-viewer-popout ma-note-viewer-hidden'),
									$("<p />").html("No image uploaded"),
									$("<div class='ma-note-viewer-image'/>")
									.append(
										$("<img />")
										.addClass("ma-note-viewer-hidden")
										.data("angle", 0)
									)
								),
								$noteSection = $("<div></div>").addClass('ma-note-viewer-thumbnails'),
								$('<div></div>').addClass('ma-note-viewer-note-section').text(note.text)
							)
						)
					)
				);

				$.each(note.photos, function (j, photo) {
					$noteSection.append(
						$("<img />")
						.addClass("ma-note-viewer-thumbnail")
						.attr("alt", photo.name)
						.attr("data-url", photo.url)
						.attr("src", photo.thumbnailUrl || photo.url)
					);
				});
			});

			ret


			return ret;
		},
		onDomReady: function($container) {
			this.$container = $container;

			this.$container.on("click", "div.ma-note-viewer-thumbnails img", this.onSelectImage.bind(this));
			this.$container.on("click", ".ma-note-viewer-left-arrow", this.onPrevImage.bind(this));
			this.$container.on("click", ".ma-note-viewer-right-arrow", this.onNextImage.bind(this));
			this.$container.on("click", ".ma-note-viewer-image-outer-panel .ma-note-viewer-rotate", this.onRotateImage.bind(this));
			this.$container.on("click", ".ma-note-viewer-image-outer-panel .ma-note-viewer-popout", this.onPopoutImage.bind(this));

			// display the first image by default
			$.each(this.$container.find("div.ma-note-viewer-thumbnails"), function (j, tn) {
				$(tn).find("img:first").click();
			});

			maUI.attachThemeHandlers(this.$container);
		},
		onSelectImage: function (e) {
			var $thumbnail = $(e.currentTarget),
				$img = $thumbnail.closest("div.ma-note-viewer-thumbnails").parent().find("div.ma-note-viewer-image-outer-panel img"),
				$p = $thumbnail.closest("div.ma-note-viewer-thumbnails").parent().find("div.ma-note-viewer-image-outer-panel p"),
				$tools = $thumbnail.closest("div.ma-note-viewer-thumbnails").parent().find("div.ma-note-viewer-image-outer-panel .ma-note-viewer-rotate, div.ma-note-viewer-image-outer-panel .ma-note-viewer-popout");

			$thumbnail
			.siblings().removeClass("selected").end()
			.addClass("selected");

			$p.addClass("ma-note-viewer-hidden");

			$img
			.attr("alt", $thumbnail.attr("alt"))
			.attr("src", $thumbnail.data("url"))
			.data("angle", 0)
			.removeClass("ma-note-viewer-hidden");

			$tools.removeClass("ma-note-viewer-hidden");

			$img.siblings("div.ma-note-viewer-arrow").addClass("ma-note-viewer-hidden");

			if ($thumbnail.parent().children("img").length <= 1) {
				return;
			}

			if ($thumbnail.is($thumbnail.parent().children("img:first"))) {
				$img.siblings("div.ma-note-viewer-right-arrow").removeClass("ma-note-viewer-hidden");
			} else if ($thumbnail.is($thumbnail.parent().children("img:last"))) {
				$img.siblings("div.ma-note-viewer-left-arrow").removeClass("ma-note-viewer-hidden");
			} else {
				$img.siblings("div").removeClass("ma-note-viewer-hidden");
			}
		},
		onPrevImage: function (e) {
			var $elem = $(e.currentTarget),
				$tn = $elem.parent().parent().find(".ma-note-viewer-thumbnail.selected");

			$tn.prev().click();
		},
		onNextImage: function (e) {
			var $elem = $(e.currentTarget),
				$tn = $elem.parent().parent().find(".ma-note-viewer-thumbnail.selected");

			$tn.next().click();
		},
		onRotateImage: function (e) {
			var self = this;
			var $elem = $(e.currentTarget).siblings(".ma-note-viewer-image").children("img"),
				angle = $elem.data("angle"),
				isLandscape = $elem.width() > $elem.height(),
				height;

			if (angle === 270) {
				angle = 0;
			} else {
				angle += 90;
			}

			$elem
			.css("-moz-transform", "rotate(" + angle.toString() + "deg)")
			.css("-webkit-transform", "rotate(" + angle.toString() + "deg)")
			.css("-o-transform", "rotate(" + angle.toString() + "deg)")
			.css("-ms-transform", "rotate(" + angle.toString() + "deg)")
			.data("angle", angle);

			if (angle === 90 || angle === 270) {
				height = (self.settings.photosHeight / $elem.width()) * 100;

				if (isLandscape) {
					$elem
					.css("height", height.toString() + "%")
					.css("top", (self.settings.photosHeight - $elem.height()) / 2);
				} else {
					$elem
					.css("height", "100%")
					.css("top", 0);
				}
			} else {
				if (isLandscape) {
					$elem
					.css("height", "100%")
					.css("top", 0);
				} else {
					$elem
					.css("height", height.toString() + "%")
					.css("top", (self.settings.photosHeight - $elem.height()) / 2);
				}
			}
		},
		onPopoutImage: function (e) {
			var self = this;
			var $elem = $(e.currentTarget).siblings(".ma-note-viewer-image").children("img");

			window.open(self.settings.popoutUrl + "?" + "url=" + encodeURIComponent($elem.attr("src")) + "&angle=" + $elem.data("angle"), "note_photo", "height=600,width=600,resizable=1,scrollbars=1");
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
		return maUI.dialog({title: title, message: message, fadeOut: true});
	};

	maUI.toast.type = {normal: 1, success: 2, error: 3};

	// To allow popout into a tab, exclude width and height.
	maUI.popout = function(view, viewType, viewTypeSrc, windowName, options, width, height) {

		var params = '';
		var winInstance = '';

		if (typeof view.getConfig == 'function') {
			var cfg = $.extend({pageTitle: view.getTitle()}, view.getConfig());
			params = '&' + $.param(cfg);

			// Create an identifying string to be used to name the popout window.
			if(!windowName) {
				winInstance = Object.keys(cfg).reduce(function(instId, key) {
					return instId + '_' + key + cfg[key].toString();
				}, '');
			}
		}

		if(!windowName) {
			windowName = (view.id || viewType) + winInstance;
		}

		var win = window.open(
			'/Common/VBS/PopoutShell.asp?viewTypeSrc=' + viewTypeSrc + '&viewType=' + viewType + params,
			windowName,
			maUI.popout.encodeFeatures(options, width, height)
		);
		win.focus();
	};
	maUI.popout.encodeFeatures = function(optionMask, width, height) {
		var features = (optionMask & 1 ? ',location' : '')
			+ (optionMask & 2 ? ',scrollbars' : '')
			+ (optionMask & 4 ? ',resizable' : '')
			+ (optionMask & 8 ? ',status' : '')
			+ (optionMask & 16 ? ',menubar' : '')
			+ (optionMask & 16 ? ',toolbar' : '');



		if ((optionMask & 32) || !!width || !!height) {
			width = !!width ? width : 500;
			height = !!height ? height : 600
			features += (width ? ",width=" + width : '')
			+ (height ? ",height=" + height : '');
		}

		return features;
	}
	maUI.popout.options = {
		locationBar: 1,
		scrollBars: 2,
		resizable: 4,
		statusBar: 8,
		menuBar: 16,
		toolBar: 16,
		defaultWindowSize: 32
	};
	maUI.popout.optGroups = {
		standard: maUI.popout.options.locationBar + maUI.popout.options.resizable + maUI.popout.options.statusBar + maUI.popout.options.defaultWindowSize,
		tab: 0
	};

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
	//	parse$HTML()
	//		Produces a jQuery object with the parsed HTML.
	//		This is different than simply $(str) because it avoids syntax errors
	//		when str is a string without markup. In such a case, the string is
	//		transformed into a text node, and wrapped in a jQuery object.
	//
	//	Parameters:
	//		str: String containing HTML or text to be turned to an HTML text node
	//			If str is actually a jQuery object, or DOM object, this function
	//			is a graceful no-op. Passing in a selector, however, will merely
	// 			create a text node with the selector text.
	//
	//	Implementation note: The conditionals for checking if it is valid HTML
	//		are lifted directly from the jQuery.fn.init function in jquery-1.11.3.js
	//**************************************************************************
	maUI.parse$HTML = function(str) {
		var match;
		var bIsNonString = false;
		if(typeof str === "string" ) {
			str = str.trim();
			if (str.charAt(0) === "<" && str.charAt(str.length - 1) === ">" && str.length >= 3) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [null, str, null];

			} else {
				var rQuickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/;
				match = rQuickExpr.exec(str);
			}
		} else {
			bIsNonString = true;
		}

		if( bIsNonString || (match && match[1]) ) {
			return $(str);
		} else {
			return $($.parseHTML(str));
		}
	}

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
	//
	//		[settings]
	//		styling: true|string-css - custom css to be used for the print. When
	//				true (default), uses common/css/style.css
	//		isLink: boolean - if true, styling is assumed to be a filename that
	//				must be included in a <link> element, if false, assumes that
	//				styling is literal CSS code to be included in a <style> element
	//				Default: false, unless styling is omitted; see styling default
	//		onPrePrint: function(container) - use this callback to preprocess
	//			content Html before it is printed. The container is a <body>
	//			node that contains a copy of everything that will be printed.
	//			Changes made to the contents will not be reflected in the originating
	//			DOM. This function is useful, for example, to modify visibility
	//			of content so that it all appears in the printout.
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
		return function(element, settings) {
			var cfg = $.extend({styling: true, onPrePrint: function(){}}, settings);
			var $target = null;
			if(element) {
				$target = $(element);
				if(cfg.styling === true) {
					cfg.styling = '/Common/CSS/style.css';
					cfg.isLink = true;
				}
				var sEl;
				if(cfg.isLink) {
					sEl = document.createElement('link');
					sEl.rel = 'stylesheet';
					sEl.href = cfg.styling;
				} else {
					sEl = document.createElement('style');
					sEl.appendChild(document.createTextNode(cfg.styling));
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

				// Give the client a chance to alter the print content.
				cfg.onPrePrint(printFrame.contentWindow.document.body);

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
	//		parent: null|HTMLElement|jQuery object|selector - outer container of the
	//				region that will be themed. document, if null
	//		context: null|HTMLElement|jQuery object|selector - context for event
	//				handlers. Where possible, the handlers will be attached to
	//				this context, so that they persist even if elements are
	//				destroyed/recreated that need to retain the behavior.
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
		    parent.find('.select select:not(.fauxstone-dropdown)').dropdown();
		    setMaHandler('change', parent, '.select select:not([multiple]):not(.fauxstone-dropdown)', context, function (event) {
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

			// List Builder Control
			if(!!maUI.stdViews.ListBuilderControlView) {
				parent.find('.list-builder-control').each(function(i, el) {
					maUI.applyView(el, new maUI.stdViews.ListBuilderControlView());
				});
			}

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
			//parent.find('.datepicker .field, .datepicker input').on('change', function (event) {
			//    console.log("jq change");
			//    var good = false;
			//    var raw = $(this).val();
			//    var date = maUI.util.parseDate(raw, 'mdy'); //basic ma date logic
			//    if (date) {
			//        good = date.getFullYear() >= minYear && date.getFullYear() <= maxYear; //min/max year from commonRefresh.js
			//    }
			//    if (good) {			        
			//        $(this).val(date.toMATransferFormat());
			//    } else {
			//        isDate(raw); //fire off the alerts (from commonRefresh.js)
			//        $(this).val('');
			//    }
			//});

			// tabs
			setMaHandler('click', parent, '.tabs-nav a', context, function (event) {
				var evtTgt = $(event.currentTarget || event.target);
				if (!evtTgt.hasClass("disabled") && !evtTgt.hasClass("btn-disabled")) {
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
				}
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

			// accordion tree (don't collapse siblings when clicking on a level)
			setMaHandler('click', parent, '.accordion-head-tree', context, function(){
				$(this)
				.closest('.accordion-section')
				.toggleClass('accordion-section-expanded');
			});

			setMaHandler('click', parent, '.open-next-accordion-section', context, function(event){
				event.preventDefault();

				var $clickedBtnSection = $(this).closest('.accordion-section');
				var $nextSection = $clickedBtnSection.nextAll(".accordion-section").not(".hidden").first();
				$nextSection.addClass('accordion-section-expanded')
				.siblings()
				.removeClass('accordion-section-expanded');
				//$(this)
				//.closest('.accordion-section')
				//.next(':not(.hidden)')
				//.addClass('accordion-section-expanded')
				//.siblings()
				//.removeClass('accordion-section-expanded');
			});

			setMaHandler('click', parent, '.open-prev-accordion-section', context, function(event){
				event.preventDefault();

				var $clickedBtnSection = $(this).closest('.accordion-section');
				var $prevSection = $clickedBtnSection.prevAll(".accordion-section").not(".hidden").first();
				$prevSection.addClass('accordion-section-expanded')
				.siblings()
				.removeClass('accordion-section-expanded');
				//$(this)
				//.closest('.accordion-section')
				//.prev()
				//.addClass('accordion-section-expanded')
				//.siblings()
				//.removeClass('accordion-section-expanded');
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

			// remove
			setMaHandler('click', parent, '.link-remove', context, function(event){
				event.preventDefault();

				$(this).closest('.item-remove').remove();
			});

			// link toggle all
			setMaHandler('click', parent, '.link-toggle-all', context, function(event){
				event.preventDefault();

				// Note: it is possible that we would prefer just the class selector, and not all form elements here. ~JJ
				$(this).closest('form, .form').find('.accordion-section').addClass('accordion-section-expanded');
			});

			// sortable
			parent.find('.sortable').sortable();
			parent.find('.sortable').disableSelection();

			parent.find('.draggable').draggable({
				revert: true,
				revertDuration: 0
			});

			parent.find('.droppable').droppable({
				activeClass: 'droppable-highlight',
				greedy: true,
				drop: function(){
					$($('#' + $('.droppable').data('template')).html()).appendTo($(this).find('.template-holder'));
				}
			});

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
                items: "[title]",
				milliseconds: 7000
            }, options);

            var fn = {
            	open: function (event) {
            		//close any existing open tooltips
            		$container.find("div[id^='ma-tip-']").remove();

                    //console.log("tip -> open:"+ event.type);
                    var $el = $(this);
                    $el.data("isOpen", true);
                    var content = $el.attr("title");
                    if (content == "") { console.log('tip-skip'); return; }
                    $el.attr("title", ""); //as soon as possible (to avoid the "browser" default tip)

                    var id = "ma-tip-" + _newId();
                    //hide/rename the "title" attribute, so that it doesn't popup natively
                    $el.attr("ma-title", content)
                        .attr("ma-tip-id", id);

                    var tip = $("<div>" + content + "</div>")
                        .on('click mouseenter mouseleave', function () { //if for some reason it remains open. these will close it.
                            fn.close.call($el[0], event);
                        });
                    tip.attr("id", id)
                        .addClass("ma-jq-tooltip")
                        .addClass("tip-at-left")
                        .addClass("tip-at-top")
                    //record the source element
                    //tip.data("srcElement", this);
                    

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

                    //put a long delay to "auto-close"
					if (settings.milliseconds != null) {
						setTimeout(function () {
							if ($el.data("isOpen")) {
								fn.close.call($el[0], event);
							}
						},settings.milliseconds); //5 seconds is default
					}

                },
                close: function (event) {
                    if (event.relatedTarget == null) return; //hack! for select/option issue
                    //console.log("tip -> close:" + event.type);
                    var $el = $(this);
                    var id = $el.attr("ma-tip-id");
                    if (id == undefined) {
                        console.log('tip-skip:close');
                        return;
                    }
                    var tip = $container.find("#" + id);
                    //reset default title
                    if ($el.attr("title") == "") {
                        $el.attr("title", $el.attr("ma-title"));
                    }
                    $el.removeAttr("ma-title");
                    tip.css({ opacity: 0 });//hide (for css3 fade)

                    $el.data("isOpen", false);
                    setTimeout(function () {
                        tip.remove();
                    }, 300) //wait .3s to remove (per css fade!)
                },
                destroy: function ($elem) {
                    var $el = $elem || $(this);
                    $el.remove();
                }
            }


            var $container = $(document.body); //global... for now!
            //todo: account for the offset of custom (internal) containers before doing the following...
            //var $container = $(settings.container);   

            //if already loaded (from a prior ajax based content load...) remove it
            var priorLoadedFunctions = this.data("maTooltipFunctions");
            if (priorLoadedFunctions) {
            	this.off('mouseenter', settings.items, priorLoadedFunctions.open);
            	this.off("mouseleave", settings.items, priorLoadedFunctions.close);
                //this.off('focusin', settings.items, priorLoadedFunctions.open);
                //this.off("focusout", settings.items, priorLoadedFunctions.close);
            }
            this.data("maTooltipFunctions", fn); //keep reference to the event functions
            this.close = fn.close;
            this.open = fn.open;
            this.destroy = fn.destroy;


            return this.on({
            	mouseenter: fn.open,
            	mouseleave: fn.close,
                //focusin: fn.open,
                //focusout: fn.close
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
        //good to know...
        maUI.util.isJQuery = function (obj) {
            return !!obj.jquery;
        }

        //allows special charactors to be used within selectors
        //example:
        // <div id="something.named:funky|here" />
        //  ...
        // var $( maUI.util.cssEscape("#something.named:funky|here") ).click();
        maUI.util.cssEscape = function cssEscape(str) {
            return str.replace(/(:|\.|\[|\]|\||,|=|@)/g, "\\$1")
        }



        maUI.util.scrollToCoords = function (element, coords, duration) {
            //thanks to: http://stackoverflow.com/questions/8917921/cross-browser-javascript-not-jquery-scroll-to-top-animation
            if (duration <= 0) return;
            coords = coords || {};

            var step = 10;
            var stats = {
                top: {
                    diff: coords.top ? coords.top - element.scrollTop : 0,
                    perTick: null
                },
                left: {
                    diff: coords.left ? coords.left - element.scrollLeft : 0,
                    perTick: null
                }
            }
            stats.top.perTick = parseInt(stats.top.diff / duration * step);
            stats.left.perTick = parseInt(stats.left.diff / duration * step);

            setTimeout(function () {
                element.scrollTop += stats.top.perTick;
                element.scrollLeft += stats.left.perTick;
                if (element.scrollTop === coords.top && element.scrollLeft === coords.left) return;
                maUI.util.scrollToCoords(element, coords, duration - step);
            }, duration / step);
        }


        maUI.util.scrollIntoView = function (elem, container, options) {
            //utilizes jquery animate
            options = $.extend({ gutter: 0, speed: 0 }, options);
            container = container || element.ownerDocument;

            var containerRect = container.getBoundingClientRect();
            var elemRect = elem.getBoundingClientRect();

            var scrollCoords = {
                top: 0,
                left: 0
            }
            //return if already in view
            if (elemRect.top >= containerRect.top && elemRect.bottom <= containerRect.bottom
                && elemRect.left >= containerRect.left && elemRect.right <= containerRect.right
              ) return;

            var currentScrollTop = container.scrollTop;
            if (elemRect.top < containerRect.top) {
                //scroll to top
                scrollCoords.top = currentScrollTop + elemRect.top - containerRect.top - options.gutter;
            } else {
                //scroll to bottom
                scrollCoords.top = currentScrollTop + elemRect.bottom - containerRect.bottom + options.gutter;
            }
            var currentScrollLeft = container.scrollLeft;
            if (elemRect.left < containerRect.left) {
                //scroll to left
                scrollCoords.left = currentScrollLeft + elemRect.left - containerRect.left - options.gutter;
            } else {
                //scroll to bottom
                scrollCoords.left = currentScrollLeft + elemRect.right - containerRect.right + options.gutter;
            }

            maUI.util.scrollToCoords(container, scrollCoords, options.speed);
        }

        maUI.util.pureNumber = function pureNumber(str) {
            return str.replace(/[^\.|\+|\-|0-9]/gi, "");
        }
        maUI.util.parseNum = function parseNum(str, ifNaN) {            
            str = maUI.util.pureNumber(str); //get only valid number charactors
            var val = parseFloat(str); //try to cast it to Float
            if (isNaN(val)) return (ifNaN===undefined ? null : ifNaN); //if not a number, return the ifNaN (null by default)
            return (val % 1 == 0) ? parseInt(val) : val; //if it IS a number, cast it to INT if it does not have decimals
        }
        maUI.util.parseBool = function parseBool(val){
            try {
                if (typeof(val)=="string") {
                    if (val.toLowerCase() == "true") return true;
                    if (val.toLowerCase() == "false") return false;
                }
                return Boolean(val);
            } catch (e) {
                return false;
            }
        }
        maUI.util.parseDate = function parseDate(val, fmt) {
            var m, d, y;
            var arr = val.split(/[^0-9]/).filter(function (item) {
                return item.trim() != '';
            });
            if (fmt === undefined) fmt = "mdy"; //default
            try {
                switch (fmt) {
                    case "mdy":
                        m = parseInt(arr[0]);
                        d = parseInt(arr[1]);
                        y = parseInt(arr[2]);
                        break;
                    case "dmy":
                        d = parseInt(arr[0]);
                        m = parseInt(arr[1]);
                        y = parseInt(arr[2]);
                        break;
                    case "ymd":
                        y = parseInt(arr[0]);
                        m = parseInt(arr[1]);
                        d = parseInt(arr[2]);
                        break;
                    default:
                        break;
                }
                if (y < 100) {
                    y += 2000
                }
                var date = new Date(y, m - 1, d);
                //make sure the parts are the same (do not allow "fuzzy" date math... month 13 == jan of next year)
                if (date.getDate() == d && date.getMonth() + 1 == m && date.getFullYear() == y) {
                    return date;
                }
            } catch (e) {
                console.log(e);
            }
            return null;
        }
        maUI.util.formatDate = function formatDate(date, fmt, separator) {
            if (date == null || isNaN(date.getTime())) return null;
            var m = date.getMonth() + 1;
            var d = date.getDate();
            var y = date.getFullYear();
            if (fmt === undefined) fmt = "mdy"; //default     
            switch (fmt) {
                case 'mdy':
                    return m + separator + d + separator + y;
                case 'dmy':
                    return d + separator + m + separator + y;
                case 'ymd':
                    return y + separator + m + separator + d;
                default:
                    return null;
            }
        }
        maUI.util.shrinkObject = function shrinkObject(obj) {
            //clean up the object (remove null items so that we don't have dangling params)
            for (var key in obj) {
                var v = obj[key];
                if (v === null || v === undefined) {
                    delete obj[key];
                }
            }
            return obj; //optional return (for chaining)
        }
        maUI.util.clone = function clone(obj, shrink) {
            var clone = $.extend({}, obj);
            if (shrink) {
                maUI.util.shrinkObject(clone);
            }
            return clone;
        }
        maUI.util.sizeWindow = function (baseElement, options) {
            var config = $.extend(true, {
                delay: 10, //millisecond until sizing (increase if it take a while to finalize base element size)
                width: {
                    canGrow: true, //can it grow
                    canShrink: false, //can it shrink
                    margin: 40, //min-space between window width and screen size
                    padding: 40 //additional buffer room between baseElement width and edge of window
                },
                height: {
                    canGrow: false, //can it grow
                    canShrink: false, //can it shrink
                    margin: null, //min-space between window width and screen size
                    padding: 20 //additional buffer room between baseElement width and edge of window
                }
            }, options);

            setTimeout(function () {

                var baseRect = baseElement.getBoundingClientRect();
                var screen = {
                    width: window.screen.availWidth,
                    height: window.screen.availHeight
                }

                var curWidth = window.outerWidth;
                //var scrollBarWidth = Math.max(window.outerWidth - window.innerWidth, window.innerWidth - window.document.body.clientWidth);
                var scrollBarWidth = Math.max(0, window.innerWidth - window.document.body.clientWidth);

                var curHeight = window.outerHeight;
                //var scrollBarHeight = Math.max(window.outerHeight - window.innerHeight, window.innerHeight - window.document.body.clientHeight);
                var scrollBarHeight = Math.max(0, window.innerHeight - window.document.body.clientHeight);

                //var newWidth = Math.min(screen.width - config.width.margin || 0, baseRect.left + baseRect.right + config.width.padding || 0 + scrollBarWidth);
                var newWidth = Math.min(screen.width - config.width.margin || 0, baseRect.width + config.width.padding || 0 + scrollBarWidth);
                var newHeight = Math.min(screen.height - config.height.margin||0, baseRect.top + baseRect.bottom + config.height.padding||0 + scrollBarHeight);

                var targetWidth = curWidth;
                var targetHeight = curHeight;
                var doResize = false;
                if ( (curWidth > newWidth && config.width.canShrink) || (curWidth < newWidth && config.width.canGrow) ){
                    targetWidth = newWidth;
                    doResize = true;
                }
                if ((curHeight > newHeight && config.height.canShrink) || (curHeight , newHeight && config.height.canGrow)) {
                    targetHeight = newHeight;
                    doResize = true;
                }
                if (doResize) {
                    window.resizeTo(targetWidth, targetHeight);
                }

            }, config.delay)
        }

		maUI.util.appendParams = function(url, getParams) {
			var ret = url;
			if(typeof(getParams) == 'object' && !!getParams) {
				var delim = '?';
				if(ret.indexOf(delim) != -1) delim = '&';

				ret = ret + delim + $.param(getParams);
			}
			return ret;
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


    ////polyfill... 
    ////****************************************
    //if (!Element.prototype.matches) {
    //    Element.prototype.matches =
    //        Element.prototype.matchesSelector ||
    //        Element.prototype.mozMatchesSelector ||
    //        Element.prototype.msMatchesSelector ||
    //        Element.prototype.oMatchesSelector ||
    //        Element.prototype.webkitMatchesSelector ||
    //        function (s) {
    //            var matches = (this.document || this.ownerDocument).querySelectorAll(s),
    //                i = matches.length;
    //            while (--i >= 0 && matches.item(i) !== this) { }
    //            return i > -1;
    //        };
    //}
    ////****************************************

    //maUI.onEvent = function onEvent(container, eventType, selector, callback) {
    //    var outer = container;
    //    container.addEventListener(eventType, function (e) {
    //        if (e.target && e.target.matches(selector)) {
    //            console.log(outer, e.currentTarget);
    //            callback.call(e.target, e);
    //        }
    //    }, true);
    //}

})(maUI, jQuery, document, window);