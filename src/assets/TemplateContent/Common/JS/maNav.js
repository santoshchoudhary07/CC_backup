//this requires maUI to be loaded
//if (!maUI)
//	throw "maUI.js library is required!"


(function (namespace) {
	//enum
	namespace.NavAction = {
		HREF: 1,
		POPUP: 2,
		MODAL: 3,
		FUNCTION: 4
	}


	//NavGroup
	namespace.NavGroup = function (config) {
		var self = this;
		var settings = $.extend({}, config);
		
		//=============================================
		//private
		//=============================================
		var _assets = [];
		_assets.hash = [];
		_assets.add = function (d) {
			if (d.id == null) return new typeerror("data must have an id");
			if (this.hash[d.id.toString()]) return new rangeerror("data id already exists: " + d.id);
			this.push(d);
			this.hash[d.id.toString()] = d;
			return d;
		}
		_assets.get = function (id) {
			return this.hash[id.toString()];
		}


		var _navSets = [];
		_navSets.hash = [];
		_navSets.add = function (obj) {
			if (obj.id == null) return new typeerror("data must have an id");
			if (this.hash[obj.id.toString()]) return new rangeerror("data id already exists: " + obj.id);
			var navSet = new namespace.NavSet(obj, self);
			this.push(navSet);
			this.hash[navSet.id.toString()] = navSet;
			return navSet;
		}
		_navSets.get = function (id) {
			return this.hash[id.toString()];
		}

		//events
		this.defaultContentCallback = function (item) {
			return item.name;
		}
		this.defaultItemWrapper = null;


		//=============================================
		//public
		//=============================================

		//properties... getter/setter
		Object.defineProperty(this, "assets", {
			enumerable: true,
			get: function () { return _assets },
			set: function (arr) {
				_assets.length = 0; //clear
				_assets.hash = []; //clear
				arr.forEach(function (v) { //copy the array using the "add"
					_assets.add(v);
				})
			}
		})


		Object.defineProperty(this, "navSets", {
			enumerable: true,
			get: function () { return _navSets },
			set: function (arr) {
				_navSets.length = 0; //clear
				_navSets.hash = []; //clear
				arr.forEach(function (v) { //copy the array using the "add"
					_navSets.add(v);
				})
			}
		})

		//methods...

		this.setContext = function (ctx) {
			this.context = ctx || null;
		}
		
		this.parseJsonParams = function (text, data) {
			if (!text) return null;
			var val = text; //this.parsePlaceholder(text);
			var from = 0;
			//data = data || this.context;
			if (maUI.util.isString(val)) {
				do {
					var start = val.indexOf("<<", from);
					if (start >= 0) {
						var end = val.indexOf(">>", start);
						var path = val.substring(start + 2, end);
						var parsed = maUI.util.parseObject(path, data);
						//if (parsed == null) parsed = undefined;
						//now replace it within the val
						var re = new RegExp("(<<" + path + ">>)", "gi");
						val = val.replace(re, parsed);
					}
					from = start + 1;
				} while (start >= 0);
			}
			var obj = JSON.parse(val);
			//clean up the object (remove null items so that we don't have dangling params)
			for(var key in obj){
				var v = obj[key];
				if (v === null || v === undefined || v.toLocaleString() == "null") {
					delete obj[key];
				}
			}
			return obj;
		}

		this.getSet = function (id) {
			return this.navSets.get(id);
		}
		this.getAsset = function (id) {
			return this.assets.get(id);
		}
		this.bindAction = function ($el, asset) {
			var selector = asset.defaultAction === namespace.NavAction.MODAL ? asset.modalSelector : asset.popupSelector;
			var useExternalHandler = false;
			if (selector) {
				if (this.hasClickEventHandler(selector)) {
					if (selector.charAt(0) == '.') {
						$el.addClass(selector.slice(1));
					} else {
						$el.attr("id", selector.slice(1));
					}
					//verify that it actually worked... if not we will handle directly
					//useExternalHandler = this.hasClickEventHandler($el);
					useExternalHandler = true;
				}
			}
			//only add the link handler if no "external" handler was specified (via selector)
			if (!useExternalHandler) {
				this.addLinkAction($el);
			}
		}
		this.addLinkAction = function ($el) {
			//add click event directly to the element to our doLink(elem)
			$el.on('click', function () {
				self.doLink($el[0]);
			});
		}
		
		this.doAdhoc = function (assetId, adhocContext) {
			var asset = this.getAsset(assetId);
			var data = {
				context: adhocContext, //page context (set for this object)
				asset: asset //the asset being called
			}
			this.handleLinkAction(asset, data);
		}
		
		this.doLink = function (elem) {
			//get the ID associated with the element
			var linkId = $(elem).attr("link-id");
			var item = $(elem).data("item");
			//get the link data
			var asset = this.getAsset(linkId);

			var data = {
				context: this.context, //page context (set for this object)
				asset: asset, //the asset being called
				item: item //the actionItem item used to build the link
			}
			this.handleLinkAction(asset, data);
		}

		
		this.handleLinkAction = function (asset, data) {
			if (asset.defaultAction === namespace.NavAction.MODAL) {
				//check to see if we have a defined ViewModel to use...
				if (asset.viewModelName) {
					this.doViewModel(asset, data);
				} else {
					//otherwise, use a generica dialog box
					this.doGenericDialog(asset, data);
				}
			} else {
				//default behavior
				this.doPopupWindow(asset, data);
			}
		}

		this.unableToLink = function (asset) {
			console.log("unable to link", asset);
			alert("unable to link to " + asset.name);
		}
		this.buildUrl = function (asset, data) {
			var url = asset.url;
			//var urlArgs = this.getParams(item);
			var urlArgs = this.parseJsonParams(asset.urlArgs, data);
			if (urlArgs) {
				var connector = url.indexOf("?") > -1 ? "&" : "?";
				url = url + connector + $.param(urlArgs); //let jquery build urlArgs from object
			}
			return url;
		}


		this.doPopupWindow = function (asset, data) {
			var url = this.buildUrl(asset, data);
			if (!url) return this.unableToLink(asset);
			var winOpt = this.parseJsonParams(asset.popupArgs, data) || {}
			var options = {
				name: winOpt.name || asset.name.replace(/ /g, "_"),
				optionMask: winOpt.optionMask || 4 + 8,//setting to 255 will open a TAB (all main features on)
				width: winOpt.width || document.body.clientWidth,
				height: winOpt.height || document.body.clientHeight
			}

			//"popup" from common.js
			popup(url, options.name, options.optionMask, options.height, options.width);

		}
		
		this.doViewModel = function (asset, data) {
			this.createViewModel(asset, data)
			.then(function (viewModel) {
				maUI.dialog(viewModel)
					.catch(function (error) {
						maUI.dialog('Error', 'An error occurred. Here are the details: <br><br>' + error);
					});
			})
		}
		
		//returns a promise
		this.createViewModel = function (asset, data) {
			return new Promise(function (resolve, reject) {
				//get the object Class constructor (from a promise wrapper)
				var findVMClass = new Promise(function (good, bad) {
					var vm = maUI.util.parseObject(asset.viewModelName); //get the actual class/object    
					if (vm) good(vm);
					else { //ensure the required script is loaded!
						maUI.ajax({
							url: asset.codeBase,
							dataType: "script"
						}).then(function () {
							//console.log("script loaded");
							vm = maUI.util.parseObject(asset.viewModelName);
							if (vm) good(vm);
							else bad(new Error("unable to load script for " + asset.viewModelName));
						})
					}
				})

				findVMClass.then(function (vm) {
					var args = self.parseJsonParams(asset.viewModelArgs, data);
					if (!args) {//if no args...
						resolve(new vm()); //simply create the new instance from the alias
					} else {
						//otherwise dynamically instantiate the object (with args)
						if (!maUI.util.isArrayLike(args)) {
							args = [args];
						}
						var o = Object.create(vm.prototype);
						resolve(vm.apply(o, args) || o); //return the object to the Promise
					}
				})
			})
		}
		
		this.doGenericDialog = function (asset, data) {
			var url = this.buildUrl(asset, data);
			if (!url) return this.unableToLink(asset);
			maUI.dialog({
				contentUrl: url,
				title: asset.name
			})
		}


		this.refreshAll = function () {
			this.navSets.forEach(function (ls) {
				ls.refresh();
			})
		}


		this.hasClickEventHandler = function (selector) {
			var result = false;
			var $items = $(selector);
			if ($items[0]) {
				var obj = $._data($items[0], 'events');
				if (obj) {
					result = obj.hasOwnProperty("click");
				}
			}
			return result;
		}


		//=============================================
		//ctor
		//=============================================
		var data = settings.data || {};
		this.id = data.id;
		this.name = data.name;

		this.setContext(settings.context);
		if (settings.defaults) {
			this.defaultItemWrapper = settings.defaults.wrapper;
			this.defaultContentCallback = settings.defaults.contentCallback;
		}

		if (data.assets) {
			this.assets = data.assets;
		}
		if (data.sets) {
			this.navSets = data.sets;
		}

		//for each setConfig, find and call the navSet's configure method
		var setConfigArray = settings.setConfig || [];
		setConfigArray.forEach(function (setConfig) {
			var setId = setConfig.id;
			if (setId !== null || setId !== undefined) {
				var navSet = self.getSet(setId);
				if (navSet) navSet.configure(setConfig);
			}
		})
	}











	//*****************************************************
	//*****************************************************
	//NavSet
	//*****************************************************
	//*****************************************************
	namespace.NavSet = function (data, group, config) {
		var self = this;

		//private
		var _onChangeCallback = null; //event callback
		var _group = group;
		var _items = [];
		_items.hash = [];
		_items.add = function (d) {
			if (d.assetId == null) return new TypeError("data must have an assetId"); //for now!!!
			if (_items.hash[d.assetId]) return new RangeError("assetId already exists: " + d.assetId);
			_items.push(d);
			_items.hash[d.assetId] = d;
			return d;
		}
		_items.get = function (assetId) {
			return _items.hash[assetId];
		}

		//public

		//getter/setter
		Object.defineProperty(this, "items", {
			enumerable: true,
			get: function () { return _items },
			set: function (arr) {
				_items.length = 0; //clear
				//_items.hash = []; //clear
				arr.forEach(function (v) { //copy the array using the "add"
					_items.add(v);
				})
			}
		})

		//setup behavior based on config settings
		this.configure = function (config) {
			var settings = $.extend({
				container: null,
				wrapper: null,
				contentCallback: null,
				editor: null, //if null, no editing
				onChange: null //called whenver editor fires a change
			}, config);
			
			//set item containers/styles/behaviors
			this.container = settings.container || this.container || null;
			this.wrapper = settings.wrapper || this.wrapper || null;
			this.toggles = settings.toggles || this.toggles || [];
			this.contentCallback = settings.contentCallback
				|| this.contentCallback
				|| function doDefaultCallback(item) { return self.getGroup().defaultContentCallback(item); };


			//set/change the onChange callback (if supplied)
			_onChangeCallback = settings.onChange || _onChangeCallback

			//if the set requires an editor..
			if (settings.editor) {
				this.editor = this.editor || {}

				this.editor.searchControl = $(settings.editor.searchControl) || this.editor.searchControl || null,
				this.editor.container = $(settings.editor.container) || this.editor.container || null,
				this.editor.filter = settings.editor.filter || this.editor.filter || null
				
				if (this.container) {
					//set the "update" event of the ui-sortable container
					this.editor.container.off("sortupdate");
					this.editor.container.on("sortupdate", function (event, ui) {
						//get the id
						var $elem = ui.item.closest("div");
						var assetId = $elem.attr("link-id");
						//find the position of the element (within the container)
						var $col = self.editor.container.children();
						var index = $col.index($elem);
						self.moveItem(assetId, index);
					})
				}				

				if (this.editor.searchControl) {

					//setup the searchControl (autocomplete)
					this.editor.searchControl.find("input")
					.autocomplete({
						minLength: 0,
						autoFocus: true, //selects the top item if the user "tabs" out of the control
						focus: function (event, ui) {
							return false;
						},
						select: function (event, ui) {
							$(this).data.selectedItem = ui.item.data;
							self.editor.searchControl.find("button").prop("disabled", false);
						},
						change: function (event, ui) {
							self.editor.searchControl.find("button").prop("disabled", !ui.item);
						},
						source: function (request, response) {
							var term = request.term.toLocaleLowerCase();
							//get source data (if a filter was passed by the config, use it.)
							var sourceAssets = self.getFilteredAssets(self.editor.filter);
							var filtered = sourceAssets.filter(function (asset) {
								if (self.items.get(asset.id)) return false; //remove if already selected
								//return true if the name is a match
								return asset.name.toLocaleLowerCase().indexOf(term) > -1
							}).map(function (asset) {
								return {
									//label: asset.name.replace(re,"<b>$1</b>"),
									value: asset.name, //so that it shows the name after selection (we will record the asset on select)
									label: asset.name,
									term: term, //text entered so-far... for highlighting
									data: asset
								}
							}).sort(function (a, b) {
								return maUI.util.sortAlgorithms.text(a.label, b.label);
							})
							response(filtered);
						}
					})
					.on("click", function () {
						$(this).autocomplete("search", $(this).val()); //drop down on enter
						event.stopImmediatePropagation();
					})
					.autocomplete("instance")._renderItem = function (ul, item) {
						var cleanTerm = item.term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
						var re = new RegExp("(" + cleanTerm + ")", "gi"); //need to "wrap" with () or the $1 will not work
						var inner = item.label.replace(re, "<em>$1</em>"); //highlight the "found" text
						return $("<li>")
							.append(inner)
							.appendTo(ul);
					}

					//setup the Add Control "button"
					this.editor.searchControl.find("button")
					.click(function (event) {
						//get the asset
						var $search = $("#userActionContainer").find("#userActionLinkSearch input")
						var asset = $search.data.selectedItem;
						//add it
						//alert(JSON.stringify(asset, null, 2));
						self.addItem(asset.id);
						$search.val(""); //clear the search
						this.disabled = true; //disable our button
					})

				}
			}
		}

		this.getGroup = function () { return _group },
		this.getFilteredAssets = function ( filter ) {
			//get group assets
			var sourceAssets = self.getGroup().assets;
			//if the set specified an asset filter, use it
			if (self.assetFilter.length) {
				sourceAssets = self.assetFilter.map(function (id) {
					return self.getGroup().getAsset(id);
				})
			}
			if (filter) return sourceAsset.filter(filter);
			else return sourceAssets;
		}
		this.refresh = function () {
			if (!this.container) return; //only if we need to build anything
			//sort the array
			//var srcAssets = this.getGroup().assets;
			this.sortItems();

			var $container = $(this.container);
			$container.empty();
			var $editContainer = maUI.util.parseObject("editor.container", this);
			if ($editContainer) {
				$editContainer.empty();
			}

			this.items.forEach(function (item) {
				var elem = self.buildLink(item);
				$container.append(elem);
				if ($editContainer) {
					$editContainer.append(self.buildEditItem(item));
				}
			})

			this.doToggles();
		}
		this.buildEditItem = function (item) {
			var asset = this.getGroup().getAsset(item.assetId);
			var displayName = item.altName || asset.name;
			var template = '<div class="link-compact item-remove ui-sortable-handle">' +
								'<a href="#" class="link-remove">' +
									'<i class="ico-x-o-red"></i>' +
								'</a>' +
								'<a href="#" class="link-title">' +
									displayName +
									'<span class="arrow arrow-right"></span>' +
								'</a>' +
								'<a href="#" class="link-reorder">' +
									'<i class="figure-grid"></i>' +
								'</a>' +
							'</div>'
			var $div = $(template);
			$div.attr("link-id", asset.id);
			$div.find(".link-remove").on('click', function (ev) {
				var id = $(this).closest("div").attr("link-id");
				self.deleteItem(id);
			})
			return $div[0]; //the raw element?

		}
		this.buildLink = function (item) {
			var $link = $("<a>");
			//add the item to the "data" of the link element
			$link.data("item", item);
			var asset = this.getGroup().getAsset(item.assetId);
			$link.attr("link-id", asset.id);

			this.getGroup().bindAction($link, asset);
			$link.append(this.contentCallback(asset));

			var wrapper = this.wrapper || this.getGroup().defaultItemWrapper;
			if (wrapper) {
				var $wrap = $(wrapper);
				$wrap.append($link);
				$link = $wrap;
			}
			return $link[0]; //return the raw element (not JQ)
		}


		this.addItem = function (assetId) {
			var item = this.items.add({ assetId: assetId, order: this.items.length + 1 });
			this.setItemsOrder();
			this.onChange(self, 'add', item);
		}
		this.deleteItem = function (assetId) {
			var item = this.items.get(assetId);
			var idx = this.items.indexOf(item);
			this.items.splice(idx, 1);
			delete this.items.hash[assetId];
			this.setItemsOrder();
			this.onChange(self, 'delete', item);
			//todo... reorder items after index
		}
		this.moveItem = function (assetId, position) {
			//insert at position, shift others down
			//renumber between old position and new position
			var item = this.items.get(assetId);
			var oldOrder = item.order;
			item.order = position + (oldOrder > position ? -.5 : .5);
			//console.log(id, position);
			this.setItemsOrder();
			this.onChange(self, 'edit', item);
		}
		this.setItemsOrder = function () {
			this.sortItems();
			for (var i = 0; i < this.items.length; i++) {
				this.items[i].order = i;
			}
		}
		this.sortItems = function () {
			var srcAssets = this.getGroup().assets;
			this.items.sort(function (a, b) {
				var asset1 = srcAssets.get(a.assetId) || {};
				var asset2 = srcAssets.get(b.assetId) || {};
				//sort by the specified order... if there is a tie, sort by name
				return maUI.util.sortAlgorithms.num(a.order, b.order)
					|| maUI.util.sortAlgorithms.text(asset1.name, asset2.name)
			})
		}

		this.doToggles = function () {
			//check toggles (hide/show based on number of items items)
			this.toggles.forEach(function (toggle) {
				var $elem = $(toggle.elem);
				if (toggle.showWhen) {
					var isOn = toggle.showWhen(this);
					//var isOn = (this.items.length >= toggle.min && this.items.length <= toggle.max)
					if (isOn) $elem.show();
					else $elem.hide();
				}

			}, this)

			//enable/disable search based on editor.maxAllowed
			if (this.editor) {
				var isDisabled = (this.maxItems <= this.items.length);
				this.editor.searchControl.find("input").prop("disabled", isDisabled);
				if (isDisabled) {
					this.editor.searchControl.find("input").attr("placeholder", "Maximum Reached")
				} else {
					this.editor.searchControl.find("input").attr("placeholder", "")
				}
			}
		}

		//callback
		this.onChange = function (navSet, action, item) {
			//then refresh the control/links
			this.refresh(); //this resort/number any elements
			//then call the passed in onChange callback function (if any)
			if (maUI.util.isFunction(_onChangeCallback)) {
				_onChangeCallback(navSet, action, item);
			}
		}

		//ctor...
		this.id = data.id;
		this.name = data.name;
		this.items = data.items; //TODO: need to handle nesting!!!
		//for user sets...
		if (data.userId !== undefined) {
			this.maxItems = data.maxItems || null;
			this.userId = data.userId || null;
			this.editDate = data.editDate || null;
			this.editUserId = data.editUserId || null;
			this.assetFilter = data.assetFilter || [];
		}
		this.configure(config);

	}

})( maUI.util.ensureObject("maUI.navigation") );