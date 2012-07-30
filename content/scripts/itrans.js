/**
 * @namespace itrans
 */
var itrans = {};

itrans.contentWindows = [];

itrans.init = function() {
	if (itrans.preferences.getPref("firstUse") === true) {
		this.initFirstTimeUser();
	};

	var appcontent = document.getElementById("appcontent");
	appcontent.addEventListener("DOMContentLoaded", function(event) {
    // migration guide page for old user
    if (itrans.preferences.getPref("api_key")) {
      var win = Components.classes['@mozilla.org/appshell/window-mediator;1']
                  .getService(Components.interfaces.nsIWindowMediator)
                  .getMostRecentWindow('navigator:browser');
      win.gBrowser.selectedTab = win.gBrowser.addTab(
        'http://miya.pe.kr/2012/01/23/how-to-change-app-id-in-inline-translator/'
      );
      itrans.preferences.setPref("api_key", "");
    };

		var d = event.originalTarget;
		var w = d.defaultView;
		if (w.location.href.substr(0,4) != 'http' ||
				w.parent != w)
			return;

		for (var i=0, l=itrans.contentWindows.length;
				i<l; i++) {
			if (itrans.contentWindows[i].getDocument() == d) {
				return;
			};
		};

		var contentWindow_ = new itrans.ContentWindow(d);
		if (contentWindow_.canLoadTranslator() &&
				itrans.isActivated()) {
			contentWindow_.loadTranslator();
		};
		itrans.contentWindows.push(contentWindow_);
	}, true);
	appcontent.addEventListener("beforeunload", function(event) {
		var d = event.originalTarget;
		var w = d.defaultView;
		if (w.location.href.substr(0,4) != 'http' ||
				w.parent != w)
			return;

		for (var i=0, l=itrans.contentWindows.length;
				i<l; i++) {
			if (d == itrans.contentWindows[i].getDocument()) {
				itrans.contentWindows[i].unloadTranslator();
				itrans.contentWindows[i] = null;
				itrans.contentWindows.splice(i, 1);
				break;
			};
		};
	}, true);

	var KEY_CTRL = 17, KEY_ALT = 18,
			ctrlPressed = false, altPressed = false;
	window.addEventListener('keydown', function(e) {
		var keyCode = e.keyCode;
		if (ctrlPressed && altPressed) {
			var sc = itrans.preferences.getPref('shortcut');
			if (e.keyCode == sc.toLowerCase().charCodeAt() ||
					e.keyCode == sc.toUpperCase().charCodeAt()) {
				itrans.toggleItrans();
			};
		};

		if (keyCode == KEY_CTRL)
			ctrlPressed = true;
		else if (keyCode == KEY_ALT)
			altPressed = true;
	}, false);
	window.addEventListener('keyup', function(e) {
		var keyCode = e.keyCode;
		if (keyCode == KEY_CTRL)
			ctrlPressed = false;
		else if (keyCode == KEY_ALT)
			altPressed = false;
	}, false);
	
	if (itrans.isActivated()) {
		itrans.onActivated();
	} else {
		itrans.onDisabled();
	};
};

itrans.$A = function(arraylike) {
	var len = arraylike.length, a = [];
	while (len--) {
		a[len] = arraylike[len];
	}
	return a;
};

itrans.EMPTY_FUNCTION = function() {};

itrans.Class = function() {
	var parent = null, properties = itrans.$A(arguments), key;
	if (typeof properties[0] === "function") {
		parent = properties.shift();
	}
	
	function klass() {
		this.initialize.apply(this, arguments);
	}
	
	if(parent) {
		for (key in parent.prototype) {
			klass.prototype[key] = parent.prototype[key];
		}
	}
	
	for (key in properties[0]) if(properties[0].hasOwnProperty(key)){
		klass.prototype[key] = properties[0][key];
	}
	
	if (!klass.prototype.initialize) {
		klass.prototype.initialize = itrans.EMPTY_FUNCTION;
	}
	
	klass.prototype.constructor = klass;
	
	return klass;
};

// void
itrans.attachToolbarButton = function() {
	var toolButtonId = "itrans-button";
	var firefoxnav = document.getElementById("nav-bar");
	var curSet = firefoxnav.currentSet;
	var set;

	if(curSet.indexOf(toolButtonId) == -1) {
		if (curSet.indexOf("urlbar-container") != -1)
			set = curSet.replace(/urlbar-container/, toolButtonId+ ",urlbar-container");
		else  // at the end
			set = firefoxnav.currentSet + ","+ toolButtonId;

		firefoxnav.setAttribute("currentset", set);
		firefoxnav.currentSet = set;
		document.persist("nav-bar", "currentset");
		try {
			BrowserToolboxCustomizeDone(true);
		}
		catch(e) {}
	}

	itrans.preferences.setPref("firstUse", false);
};

itrans.toggleItrans = function() {
	if (itrans.isActivated()) {
		itrans.preferences.setPref("activated", false);
		itrans.onDisabled();
	} else {
		itrans.preferences.setPref("activated", true);
		itrans.onActivated();
	};
};

itrans.isActivated = function() {
	return itrans.preferences.getPref("activated") === true;
};

itrans.onActivated = function() {
	var toolButton = document.getElementById("itrans-button");
	//var statusBar = document.getElementById("itrans-status-bar");

	itrans.element.removeClass(toolButton, "off");
	//itrans.element.removeClass(statusBar, "off");

	for (var i=0; i<itrans.contentWindows.length; i++) {
		var contentWindow = itrans.contentWindows[i];
		if (contentWindow && !contentWindow.isTranslatorLoaded() && contentWindow.canLoadTranslator()) {
			contentWindow.loadTranslator();
		};
	};
};

itrans.onDisabled = function() {
	var toolButton = document.getElementById("itrans-button");
	//var statusBar = document.getElementById("itrans-status-bar");

	itrans.element.addClass(toolButton, "off");
	//itrans.element.addClass(statusBar, "off");
};

itrans.initFirstTimeUser = function() {
	itrans.attachToolbarButton();

	var propertyBundle = document.getElementById("itrans-properties");
	var defaultLanguage = propertyBundle.getString("Language");
	itrans.preferences.setPref("language", defaultLanguage);
};

itrans.isTranslatableText = function(text) {
	var emailPattern = /^[_a-zA-Z0-9-\.]+@[\.a-zA-Z0-9-]+\.[a-zA-Z]+$/;
	var urlPattern = /^[a-z]+:\/\/[^\s]+$/;
	var numberOrSymbolPattern = /^[0-9\.,!@#\$%\^\&*\(\)`~_\-=\+|\\{}\[\]\s:;<>\?\/]+$/;
	var trimmedText = text.replace(/ /g, "");

	if (emailPattern.test(trimmedText) || urlPattern.test(trimmedText) || numberOrSymbolPattern.test(trimmedText)) {
		return false;
	} else {
		return true;
	};
};

itrans.isScriptIncluded = function(targetWindow, scriptUrl) {
	var scripts = targetWindow.document.getElementsByTagName("script");

	for (var i=0, l=scripts.length; i<l; i++)
		if (scripts[i] && typeof scripts[i].src == "string" && scripts[i].src == scriptUrl)
			return true;

	return false;
};

itrans.removeScript = function(targetWindow, scriptUrl) {
	var scripts = targetWindow.document.getElementsByTagName("script");
	for (var i=0, l=scripts.length; i<l; i++)
  	if (scripts[i] && scripts[i].src == scriptUrl)
			scripts[i].parentNode.removeChild(scripts[i]);
};

itrans.getMousePosition = function(event) {
	if (!event) return {x:0, y:0};

	var mouseX = event.clientX || 0;
	var mouseY = event.clientY || 0;

	return {x: mouseX, y: mouseY};
};

itrans.element = {
	addClass: function(e,c) {
		if (!e)
			return;
		var a = e.className.split(" ");
		for (var i=0;i<a.length;i++)
			if (a[i] == c)
				return;
		a.push(c);
		e.className = a.join(" ");
	},
	
	removeClass:function(e,c) {
		if (!e)
			return;
		var a = e.className.split(" ");
		for (var i=0;i<a.length;i++) {
			if (a[i] == c) {
				a.splice(i,1);
				break;
			}
		}
		e.className = a.join(" ");
	},
	
	hasClass: function(e,c) {
		var a = e.className.split(" ");
		for (var i=0;i<a.length;i++)
			if (a[i] == c)
				return true;
		return false;
	}
};

itrans.openOptions = function() {
	window.openDialog('chrome://itrans/content/options.xul','ItransOptions', 'modal,centerscreen,chrome,resizable=no');
};

itrans.preferences = {
	SERVICE_COMPONENT: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.itrans."),

	getPref: function(key) {
		var type = this.SERVICE_COMPONENT.getPrefType(key);
		switch (type) {
			case this.SERVICE_COMPONENT.PREF_BOOL:
				return this.SERVICE_COMPONENT.getBoolPref(key);

			case this.SERVICE_COMPONENT.PREF_STRING:
				return this.SERVICE_COMPONENT.getCharPref(key);

			case this.SERVICE_COMPONENT.PREF_INT:
				return this.SERVICE_COMPONENT.getIntPref(key);

			default:
				return null;
		}
	},

	setPref: function(key,value) {
		var type = this.SERVICE_COMPONENT.getPrefType(key);
		switch (type) {
			case this.SERVICE_COMPONENT.PREF_STRING:
				return this.SERVICE_COMPONENT.setCharPref(key,value);

			case this.SERVICE_COMPONENT.PREF_INT:
				return this.SERVICE_COMPONENT.setIntPref(key,value);

			case this.SERVICE_COMPONENT.PREF_BOOL:
				return this.SERVICE_COMPONENT.setBoolPref(key,value);

			default:
				return null;
		};
	}
};

itrans.preferences.SERVICE_COMPONENT.QueryInterface(Components.interfaces.nsIPrefBranch2);
