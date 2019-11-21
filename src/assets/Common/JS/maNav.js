//this requires maUI to be loaded
//if (!maUI)
//	throw "maUI.js library is required!"


(function (namespace) {
	//enum
	namespace.NavAction = {
		HREF: 1,
		POPUP: 2,
		MODAL: 3,
		FUNCTION: 4,
		POPOUT: 5,
		TAB: 6
	}
	namespace.NavDisplay = {
	    NORMAL: 0,
	    HIDE: 1,
	    DISABLE: 2
	}

    //helper
	function splice(str, from, to, val) {
	    return str.slice(0, from) + val + str.slice(to);
	}

    //private (lazy injection... we could have created a real object that inherits from Array! see nuco)
	function CreateSetting(data) {
	    return {
	        key: data.key.toLowerCase(), //maybe toLower should just be for the "item.key" function!
	        dateType: data.dataType,
            value: data.value
	    }
	}
	function CreatePageFieldSettings(fieldArray) {
	    var firstRecord = fieldArray[0];
	    var obj = {
	        key: firstRecord.pageKey,
	        name: firstRecord.name,
	        settings: CreateHashArray(
                function (item) { return item.key;},
                function (item) { return CreateFieldSetting(item);}
            )
	    }
	}
	function CreateFieldSetting(data) {
	    var obj = {	        
	        key: data.fieldKey,
	        name: data.name,
            section: data.name,
	        isVisible: data.isVisible,
	        isRequired: data.isRequired,
	        isReadOnly: data.isReadOnly,
	        isReadOnlyLevel1: data.isReadOnlyLevel1,
	        isReadOnlyLevel2: data.isReadOnlyLevel2,
            isLeaseAdminEditable: data.isLeaseAdminEditable,
	        args: data.args,
	        items: CreateHashArray(
                function (item) { return item.key;},
                function (arg) {
                    var kv = arg.split('=');
                    if (kv.lengh == 2) {
                        return {
                            key: kv[0],
                            value: kv[1]
                        }
                    } else {
                        return {
                            key: arg,
                            value: arg
                        }
                    }
                }
            )
	    }
	    obj.items.import(data.args.split(';'));
	}
	function CreateHashArray(fnItemKey, fnItemConstructor) {
	    var arr = [];
	    arr.hash = [];
	    arr.add = function (data) {
	        var item = data;
	        if (fnItemConstructor) {
	            item = fnItemConstructor(data);
	        }
	        var key = fnItemKey(item);
	        if (key == null) return new typeerror("data must does not the required key");
	        if (arr.hash[key]) return new rangeerror("data key already exists: " + fnItemKey(item));
            
	        arr.push(item);
	        arr.hash[key] = item;
	        return item;
	    }
	    arr.get = function (key) {
	        return arr.hash[key];
	    }
	    arr.clear = function () {
	        arr.length = 0;
	        arr.hash = [];
	    }
	    arr.has = function (key) {
	        return arr.hash[key] != undefined;
	    }
	    arr.import = function (array) {
	        array.forEach(function (v) { //copy the array using the "add"
	            arr.add(v);
	        })
	    }

	    return arr;
	}


	//NavGroup
	namespace.NavGroup = function (config) {
		var self = this;
		var settings = $.extend({}, config);
		
		//=============================================
		//private
		//=============================================
		//var _assets = [];
		//_assets.hash = [];
		//_assets.add = function (d) {
		//	if (d.id == null) return new typeerror("data must have an id");
		//	if (this.hash[d.id.toString()]) return new rangeerror("data id already exists: " + d.id);
		//	this.push(d);
		//	this.hash[d.id.toString()] = d;
		//	return d;
		//}
		//_assets.get = function (id) {
		//	return this.hash[id.toString()];
		//}
		var _assets = CreateHashArray(function (item) { return item.id.toString() });

		//var _navSets = [];
		//_navSets.hash = [];
		//_navSets.add = function (obj) {
		//	if (obj.id == null) return new typeerror("data must have an id");
		//	if (this.hash[obj.id.toString()]) return new rangeerror("data id already exists: " + obj.id);
		//	var navSet = new namespace.NavSet(obj, self);
		//	this.push(navSet);
		//	this.hash[navSet.id.toString()] = navSet;
		//	return navSet;
		//}
		//_navSets.get = function (id) {
		//	return this.hash[id.toString()];
	    //}
		var _navSets = CreateHashArray(
            function (item) { //item key
                return item.id.toString()
            },
            function (item) { //item constructor
                return new namespace.NavSet(item, self);
            }
        );

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
				//_assets.length = 0; //clear
				//_assets.hash = []; //clear
				//arr.forEach(function (v) { //copy the array using the "add"
				//	_assets.add(v);
			    //})
			    _assets.clear();
			    _assets.import(arr);
			}
		})


		Object.defineProperty(this, "navSets", {
			enumerable: true,
			get: function () { return _navSets },
			set: function (arr) {
				//_navSets.length = 0; //clear
				//_navSets.hash = []; //clear
				//arr.forEach(function (v) { //copy the array using the "add"
				//	_navSets.add(v);
			    //})
			    _navSets.clear();
			    _navSets.import(arr);
			}
		})


		//methods...

		this.setContext = function (ctx) {
			this.context = ctx || null;
		}
		
		this.parseJsonParams = function (text, packet) {
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

					    //if the "path" is a function (has a "(")... then call "this.evaluate"
						var parsed = "";
						if (path.indexOf("(") >= 0) {
						    parsed = self.evaluate(path, packet);
						} else {
						    parsed = maUI.util.parseObject(path, packet); //safe scope based parsing
						}

						//if (parsed == null) parsed = undefined;
						//now replace it within the val
						//var re = new RegExp("(<<" + path + ">>)", "gi");
					    //val = val.replace(re, parsed);
						val = splice(val, start, end + 2, parsed);

					}
					from = start + 1;
				} while (start >= 0);
			}
		    try{
		        var obj = JSON.parse(val);
		        //clean up the object (remove null items so that we don't have dangling params)
		        for(var key in obj){
		            var v = obj[key];
		            if (v === null || v === undefined || v.toLocaleString() == "null") {
		                delete obj[key];
		            }
		        }
		        return obj;
		    } catch (e) {
		        console.log('maNav parseJsonParams error', {
		            text: text,
		            packet: packet,
		            error: e
		        });
                return null;
		    }
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
				if (selector.charAt(0) == '.') {
					$el.addClass(selector.slice(1));
				} else {
					$el.attr("id", selector.slice(1));
				}
				//verify that it actually worked... if not we will handle directly
				//useExternalHandler = this.hasClickEventHandler($el);
				useExternalHandler = true;
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

		this.createDataPacket = function (fullAsset, item, altContext) {
		    //console.log('create data packet', item, asset);
		    var packet = {
		        context: altContext || this.context, //page context (set for this object)
		        asset: this.cloneAssetData(fullAsset), //the asset being called (copy of core, without additional "conditions")
		        item: item || {} //(optionally) the actionItem item used to build the link
		    }
            
		    var asset = packet.asset;
		    //evaluate and set the active condition (if any)
		    asset.activeCondition = this.findActiveCondition(fullAsset, packet) || {
		        displayType: namespace.NavDisplay.NORMAL //default
		    };
		    if (asset.activeCondition.override) { //apply overrides (if any)
		        this.applyOverride(asset, asset.activeCondition.override);
		    }

		    //if the asset specified a url, then build a full url (with args) as a single datapoint
		    if (asset.url) {
		        packet.resolvedUrl = this.buildUrl(packet);
		    }
		    return packet;
		}
		this.cloneAssetData = function (asset) {
		    if (!asset) return {};

		    var clone = $.extend({}, asset);
		    delete clone.conditions;
		    return clone;
		}
		this.findActiveCondition = function (asset, packet) {
		    if (asset.conditions) {
		        for (var i = 0; i < asset.conditions.length; i++) {
		            var condition = asset.conditions[i];
		            if (this.evaluate(condition.test, packet)) {
		                return condition; //shortcut out!
		            }
		        }
		    }
		    return null;
		}
		this.applyOverride = function (assetData, override) {
		    //simple for now... but we need to look for "NULL" as a value and actually remove the original
		    //$.extend(assetData, override);
		    for (var key in override) {
		        var val = override[key];
		        if (val == null) continue; //skip, move on to next in loop
		        assetData[key] = val.toLocaleLowerCase() == "null" ? null : val;
		    }
		}

		this.doAdhoc = function (assetId, adhocContext) {
		    var asset = this.getAsset(assetId);
		    if (!asset) {
                console.log("assetId does not exist:", assetId)
		        return;
		    }
			var packet = this.createDataPacket(asset, null, adhocContext);
			this.handleLinkAction(packet);
		}

		this.doLink = function (elem) {
			//get the ID associated with the element
			var linkId = $(elem).attr("link-id");
		    var item = $(elem).data("item");
            
			//get the link data
		    var asset = this.getAsset(linkId);
		    if (!asset) {
		        console.log("assetId does not exist:", linkId);
		        return;
		    }

			var packet = this.createDataPacket(asset, item);
            
			this.handleLinkAction(packet);
		}

		
		this.handleLinkAction = function (packet) {
		    var asset = packet.asset;
		    switch (asset.defaultAction) {
		        case namespace.NavAction.MODAL:
		            //check to see if we have a defined ViewModel to use...
		            if (asset.viewModelName) {
		                this.doViewModel(packet);
		            } else {
		                //otherwise, use a generica dialog box
		                this.doGenericDialog(packet);
		            }
		            break;
		        case namespace.NavAction.POPUP:
		            //default behavior
		            this.doPopupWindow(packet);
		            break;
				case namespace.NavAction.TAB:
					//default behavior
					this.doPopupTab(packet);
					break;
		        case namespace.NavAction.POPOUT:
		            this.doPopout(packet);
		            break;
                case namespace.NavAction.FUNCTION:
		        default:
                    this.unableToLink(asset)
		    }
		}

		this.unableToLink = function (asset) {
			console.log("unable to link", asset);
			maUI.fn.alert("unable to link to " + asset.name);
		}
		this.buildUrl = function (packet) {
		    var asset = packet.asset;
			var url = asset.url;
			//resolve the Json (replacing lookup values)
			var urlArgs = this.parseJsonParams(asset.urlArgs, packet);
			if (urlArgs) {
				var connector = url.indexOf("?") > -1 ? "&" : "?";
				url = url + connector + $.param(urlArgs); //let jquery build urlArgs from object
			}
			return url;
		}
		this.doPopout = function (packet) {
		    var asset = packet.asset;
		    if (!asset.viewModelName) return this.unableToLink(asset);            

		    var url = '/common/vbs/popoutShell.asp?';
		    url += 'viewTypeSrc=' + (asset.codeBase || "/common/js/common.js" );
		    url += '&viewType=' + asset.viewModelName;
		    url += ('&' + $.param(this.parseJsonParams(asset.viewModelArgs, packet)));
            
		    var winOpt = this.parseJsonParams(asset.popupArgs, packet) || {}
		    var options = {
		        name: winOpt.name || asset.name.replace(/ /g, "_"),
		        optionMask: winOpt.optionMask || 2 + 4 + 8,//setting to 255 will open a TAB (all main features on)
		        width: winOpt.width || document.body.clientWidth,
		        height: winOpt.height || document.body.clientHeight
		    }

		    //"popup" from common.js
		    popup(url, options.name, options.optionMask, options.height, options.width);
            
		}

		this.doPopupWindow = function (packet) {
		    var asset = packet.asset;
			var url = this.buildUrl(packet);
			if (!url) return this.unableToLink(asset);
			var winOpt = this.parseJsonParams(asset.popupArgs, packet) || {}
			var options = {
				name: winOpt.name || asset.name.replace(/ /g, "_"),
				optionMask: winOpt.optionMask || 2 + 4 + 8,//setting to 255 will open a TAB (all main features on)
				width: winOpt.width || document.body.clientWidth,
				height: winOpt.height || document.body.clientHeight
			}

			//"popup" from common.js
			popup(url, options.name, options.optionMask, options.height, options.width);

		}

		this.doPopupTab = function (packet) {
			var asset = packet.asset;
			var url = this.buildUrl(packet);
			if (!url) return this.unableToLink(asset);
			var winOpt = this.parseJsonParams(asset.popupArgs, packet) || {}
			var options = {
				name: winOpt.name || asset.name.replace(/ /g, "_")
			}

			//"popup" from common.js
			window.open(url, options.name);

		}
		
		this.doViewModel = function (packet) {
			this.createViewModel(packet)
			.then(function (viewModel) {

			    var sourceView = viewModel;
			    if (packet.asset.viewModelWrapper) {
			        var wrapper = maUI.util.parseObject(packet.asset.viewModelWrapper);
			        if (wrapper) {
			            sourceView = new wrapper(viewModel);//instantiate
			        }
			    }

			    maUI.dialog(sourceView)
					.catch(function (error) {
						maUI.dialog('Error', 'An error occurred. Here are the details: <br><br>' + error);
					});
			})
		}
		
		//returns a promise
		this.createViewModel = function (packet) {
		    var asset = packet.asset;
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
				}).then(function (vm) {
					var args = self.parseJsonParams(asset.viewModelArgs, packet);
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
		
		this.doGenericDialog = function (packet) {
		    var asset = packet.asset;
			var url = this.buildUrl(packet);
			if (!url) return this.unableToLink(asset);
			maUI.dialog({
				contentUrl: url,
				title: asset.name,
                type: 'form',
				buttons: []
			})
		}


		this.refreshAll = function () {
			this.navSets.forEach(function (navSet) {
			    navSet.refresh();
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

		this.evaluate = function (test, packet) {
		    var self = this;
            //if no test is set, then there are no constraints!
		    if (test === null || test === undefined) return true;

		    //unpack packet to the local scope (so eval will work with "this")
		    var context = packet.context,
                asset = packet.asset,
                item = packet.item;
            
		    //create local "function" to be used within the evaluated statement

		    //userPermission("foo")

		    //companySetting("someStringValue") == "foo"
		    //companySetting("someNumValue") > 5
		    //companySetting("someBoolValue")

		    //propertySetting("someStringValue") == "foo"
		    //propertySetting("someNumValue") > 5
		    //propertySetting("someBoolValue")

		    //page("myPage", "myField").isVisible
		    //page("myPage", "myField").isRequired
		    //page("myPage", "myField").items("label")

		    function userPermission(key) {
		        return self.session.user.permissions.has(key.toLowerCase());
		    }

		    function companySetting(key) {
		        var obj = self.session.company.settings.get(key.toLowerCase());
		        if (obj === null || obj === undefined) return null; //maybe default to ""?
		        return obj.value;
		    }
            
		    try {
		        var result = eval(test);
		    } catch (e) {
		        console.log("NavGroup.evaluate error", e);
		        result = false;
		    }
		    return result;
		}
        
	    //todo. make a property?
		this.setSession = function (obj) {
		    this.setUser(obj.user);
		    this.setCompany(obj.company);
		    //TODO: this.setPropertySettings(obj.property.settings);
		    //TODO: this.setPageSettings(obj.pageSettings);
		}
		this.setUser = function (userData) {
		    this.session.user = userData;
		    var permissions = CreateHashArray(
                function (item) { return item } //pure hash (key IS the value)
		    );
		    permissions.import(userData.permissions);
		    this.session.user.permissions = permissions;
		}
		this.setCompany = function (companyData) {
		    this.session.company.id = companyData.id,
            this.session.company.name = companyData.name,
            this.session.company.settings.clear();
		    this.session.company.settings.import(companyData.settings);
		}
		//this.setCompanySettings = function (settings) {
		//    this.session.settings.company.clear();
		//    this.session.settings.company.import(settings);
		//}

		//=============================================
		//ctor
		//=============================================
		var data = settings.data || {};
		this.id = data.id;
		this.name = data.name;

		this.setContext(settings.context);
		if (settings.defaults) {
		    if (settings.defaults.wrapper) {
		        this.defaultItemWrapper = settings.defaults.wrapper;
		    }
		    if (settings.defaults.contentCallback) {
		        this.defaultContentCallback = settings.defaults.contentCallback;
		    }
		    if (settings.defaults.className) {
		        this.defaultClassName = settings.defaults.className;
		    }
		}

		if (data.assets) {
			this.assets = data.assets;
		}
		if (data.sets) {
			this.navSets = data.sets;
		}

	    //prep session information
		this.session = {
		    user: {},
		    company: {
		        id: null,
		        name: null,
		        settings: CreateHashArray(
                    function (item) { return item.key; },
                    function (item) { return CreateSetting(item); }
                )
		    },
		    property: {
		        id: null,
		        name: null,
		        settings: CreateHashArray(
                    function (item) { return item.key; },
                    function (item) { return CreateSetting(item); }
                )
		    },
		    pages: CreateHashArray( //looks crazy, but making a hash array in a hash array (collection of fields inside a collection of pages)
                function (item) { return item.key; }, //page key
                function (item) { return CreatePageFieldSettings(item); }
            )//,
		    //settings: {
		    //    company: CreateHashArray(
            //        function (item) { return item.key; },
            //        function (item) { return CreateSetting(item); }
            //    ),
		    //    property: CreateHashArray(
            //        function (item) { return item.key; },
            //        function (item) { return CreateSetting(item); }
            //    ),
		    //    pages: CreateHashArray( //looks crazy, but making a hash array in a hash array (collection of fields inside a collection of pages)
            //        function (item) { return item.key; }, //page key
            //        function (item) { return CreatePageFieldSettings(item); }
            //    )
		    //}
		};


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
                className: null,
				contentCallback: null,
				editor: null, //if null, no editing
				onChange: null //called whenver editor fires a change
			}, config);
			
			//set item containers/styles/behaviors
			this.container = settings.container || this.container || null;
			this.wrapper = settings.wrapper || this.wrapper || null;
			this.className = settings.className || this.className || null;
			this.toggles = settings.toggles || this.toggles || [];
			this.contentCallback = settings.contentCallback
				|| this.contentCallback
				|| function doDefaultCallback(item) { return self.getGroup().defaultContentCallback(item); };


			//set/change the onChange callback (if supplied)
			_onChangeCallback = settings.onChange || _onChangeCallback

			//if the set requires an editor..
			if (settings.editor) {
				this.editor = this.editor || {}

				this.editor.searchControl = $(settings.editor.searchControl) || this.editor.searchControl || null;
				this.editor.container = $(settings.editor.container) || this.editor.container || null;
				this.editor.filter = settings.editor.filter || this.editor.filter || null;
				
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
				    var $input = this.editor.searchControl.find("input");

					$input
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
								
								//console.log('source.filtering', asset);
								var dataPacket = _group.createDataPacket(asset);
								//per becci/dave: if the item would be hidden or disabled as an assigned link
								//	then don't even show it in the list
								//	concern: potentially, it may only be disabled or hidden for a current property selection
								//	which (in my opinion) shouldn't impact the user's ability to assign for "when" valid.
								if (dataPacket.asset.activeCondition.displayType !== namespace.NavDisplay.NORMAL) {
									console.log("skipping", asset, dataPacket.asset.activeCondition);
									return; //skip it.
								}
								//console.log('f',dataPacket);

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
					    //var $search = $("#userActionContainer").find("#userActionLinkSearch input")
					    var $search = $input; //from above
						var asset = $search.data.selectedItem;
						//add it
						//alert(JSON.stringify(asset, null, 2));
						self.addItem(asset.id);
						$search.val(""); //clear the search
						this.disabled = true; //disable our button
					})

					this.doToggles(); //fire off toggles
				}
			}
		}

		this.getGroup = function () { return _group },
		this.getFilteredAssets = function ( filter ) {
			//get group assets
			var sourceAssets = self.getGroup().assets;
			//if the set specified an asset filter, use it
			if (self.assetFilter && self.assetFilter.length) {
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
			    if (elem) { //only write if enabled
			        $container.append(elem);
			    }
				if ($editContainer) { //always allow for editor?
					$editContainer.append(self.buildEditItem(item));
				}
			})

			this.doToggles();
		}
		this.buildEditItem = function (item) {
		    var group = this.getGroup();
		    var fullAsset = group.getAsset(item.assetId);
		    if (!fullAsset) {
		        console.log("assedId does not exist:", item.assetId);
		        return;
		    }
		    //seems like a long way to go, but there may be a different name based on some condition
		    var packet = group.createDataPacket(fullAsset, item);
		    var asset = packet.asset;
			//per becci/dave: if the item would be hidden or disabled as an assigned link
			//	then don't even show it in the list
			//	concern: potentially, it may only be disabled or hidden for a current property selection
			//	which (in my opinion) shouldn't impact the user's ability to assign for "when" valid.
			//DAVE (2019-01-09): COMMENTING OUT THE BELOW THREE LINES.  THE USER NEEDS TO BE ABLE TO REMOVE THE QUICKLINK IF THEY NO LONGER HAVE PERMISSION TO VIEW IT.
			//if (asset.activeCondition.displayType !== namespace.NavDisplay.NORMAL) {
		    //	return; //skip it.
		    //}

			var displayName = item.altName || asset.name;
			var template = '<div class="link-compact item-remove ui-sortable-handle">' +
								'<a href="#" class="link-remove">' +
									'<i class="ico-x-o-red"></i>' +
								'</a>' +
								'<a href="#" class="link-title">' +
									displayName +
									//'<span class="arrow arrow-right"></span>' +
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
		    var group = this.getGroup();
		    var fullAsset = group.getAsset(item.assetId);
		    if (!fullAsset) {
		        console.log("assedId does not exist:", item.assetId);
		        return;
		    }
		    var packet = group.createDataPacket(fullAsset, item);
		    var asset = packet.asset; //resolved based on conditions

		    if (asset.activeCondition.displayType == namespace.NavDisplay.HIDE) {
		        return null; //don't continue if we should not display the link
		    }

		    var $link = $("<a>");
		    var className = this.className || group.defaultClassName;
		    if (className) {
		        $link.addClass(className);
		    }
			//add the item to the "data" of the link element
			$link.data("item", item);
			$link.attr("link-id", asset.id);

			if (asset.activeCondition.displayType == namespace.NavDisplay.DISABLE) {
			    $link.addClass('disabled');
			} else {
			    group.bindAction($link, asset); //only bind action if link is enabled
			}

			$link.append(this.contentCallback(asset));
			var wrapper = this.wrapper || group.defaultItemWrapper;
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
				if (isDisabled) {
					this.editor.searchControl.find("input").attr("placeholder", "Maximum Reached")
				} else {
				    if (this.getFilteredAssets(this.editor.filter).length == this.items.length) {
				        this.editor.searchControl.find("input").attr("placeholder", "No More Available");
				        isDisabled = true;
				    } else {
				        this.editor.searchControl.find("input").attr("placeholder", "")
				        isDisabled = false;
				    }
				}
				this.editor.searchControl.find("input").prop("disabled", isDisabled);
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