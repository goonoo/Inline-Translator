// this file is for bookmarklet loading.
(function(){
	var SCRIPT_URL = "http://miya.pe.kr/inline_translator.js";
	var TEXT_LENGTH_LIMIT = 500;
	var TARGET_LANGUAGE = "ko";

	var InlineTranslator = {
		init: function(targetWindow) {
			var this_ = this;

			this.window_ = targetWindow;
			this.activated_ = false;

			var outputElement = this.window_.document.createElement("div");
			outputElement.style.position = "fixed";
			outputElement.style.zIndex = "9999999";
			outputElement.style.display = "block";
			outputElement.style.top = "0";
			outputElement.style.left = "0";
			outputElement.style.padding = "5px";
			outputElement.style.border = "1px solid #666";
			outputElement.style.backgroundColor = "#fff";
			outputElement.style.color = "#006";
			outputElement.innerHTML = "inine translator 로딩중입니다. :)";
			this.window_.document.body.appendChild(outputElement);
			this.outputElement_ = outputElement;

			this.loadMSLanguageApi();
		},

		loadMSLanguageApi: function() {
			// do nothing
			this.initAfterLoadApi();
		},

		initAfterLoadApi: function() {
			var this_ = this;
			var outputElement = this.getOutputElement();
			this.addEventListener(this.window_.document.body, "mouseup", function(evt) {
				if (!this_.activated_) return;
				var targetElement = evt.srcElement ? evt.srcElement : evt.target;
				if (targetElement == this_.getOutputElement())
					return;

				var text = this_.getSelectedTextFromRange(this_.getRange());
				if (!text || text.length > TEXT_LENGTH_LIMIT) return;
				this_.translateAndShowResult(evt, text);
			});

			this.addEventListener(this.window_.document.body, "mousedown", function(evt) {
				var targetElement = evt.srcElement ? evt.srcElement : evt.target;
				if (targetElement != this_.getOutputElement())
					this_.hideOutputElement();
			});

			outputElement.innerHTML = "inline translator가 로딩되었습니다. :)";

			var loaderElement = this.window_.document.createElement("div");
			loaderElement.style.position = "fixed";
			loaderElement.style.zIndex = "9999998";
			loaderElement.style.display = "block";
			loaderElement.style.right = "0";
			loaderElement.style.bottom = "0";
			loaderElement.innerHTML = '<img title="inline translator를 제거하려면 클릭하세요." alt="inline translator가 실행중입니다." src="http://www.miya.pe.kr/it.png" style="cursor: pointer;" />';
			// image
			this.window_.document.body.appendChild(loaderElement);
			loaderElement.onclick = function() {
				this_.removeInlineTranslator();
				this.parentNode.removeChild(this);
			};

			setTimeout(function() {
				outputElement.style.display = "none";
				outputElement.style.position = "absolute";
			}, 1500);

			this.activated_ = true;
		},

		removeInlineTranslator: function() {
			if (this.isScriptIncluded(SCRIPT_URL))
				this.removeScript(SCRIPT_URL);

			InlineTranslator = null;
			this.activated_ = false;
		},

		addEventListener: function(targetObject, eventType, callback) {
			if (targetObject.addEventListener) {
				targetObject.addEventListener(eventType, callback, false);
			} else if (targetObject.attachEvent) {
				targetObject.attachEvent("on"+ eventType, callback);
			};
		},

		getOutputElement: function() {
			return this.outputElement_;
		},

		translateAndShowResult: function(evt, text) {
			var this_ = this;
			var mousePosition = this.getMousePosition(evt);
			this.showOutputElementWithLoadingMessage(mousePosition.x, mousePosition.y);

            window.InlineTranslatorCallback = function(response) {
				this_.showTranslatedResult(response);
			};
            var s = document.createElement("script");
            s.src = "https://api.microsofttranslator.com/V2/Ajax.svc/Translate?appId="+
                    "4CEC1ACDC05DD131B324891DEE15AEA26337C236"+
                    "&oncomplete=InlineTranslatorCallback&to=" + TARGET_LANGUAGE + "&text=" + text;
            document.getElementsByTagName("head")[0].appendChild(s);
		},

		showTranslatedResult: function(translatedText) {
			if (translatedText) {
				this.showOutputElementWithText(translatedText);
			} else {
				this.showOutputElementWithEmptyResult();
			};
		},

		hideOutputElement: function() {
			this.getOutputElement().style.display = "none";
		},

		showOutputElementWithLoadingMessage: function(posX, posY) {
			var outputElement = this.getOutputElement();
			outputElement.innerHTML = '<span style="color: #bbb;">Seaching…</span>';
			outputElement.style.display = "block";
			outputElement.style.left = posX + "px";
			outputElement.style.top = posY + "px";
		},

		showOutputElementWithText: function(text) {
			var outputElement = this.getOutputElement();
			outputElement.innerHTML = text;
		},

		showOutputElementWithEmptyResult: function() {
			var outputElement = this.getOutputElement();
			outputElement.innerHTML = '<span style="color: #f99;">결과없음.</span>';
		},

		getMousePosition: function(evt) {
			var targetWindow = this.getWindow();
			var evt = evt || targetWindow.event;
			if (!evt) return;

			var doc = targetWindow.document;
			var mouseX = evt.pageX || (evt.clientX + (doc.documentElement.scrollLeft || doc.body.scrollLeft)) || 0;
			var mouseY = evt.pageY || (evt.clientY + (doc.documentElement.scrollTop || doc.body.scrollTop)) || 0;

			return {x: mouseX, y: mouseY};
		},

		getSelectedTextFromRange: function(range) {
			var selectedText = "";
			if (range && range.text) {
				selectedText = range.text;
			} else if (range && range.toString) {
				selectedText = range.toString();
			};
			return selectedText;
		},

		getWindow: function() {
			return this.window_;
		},

		getSelection: function() {
			var targetWindow = this.getWindow(), selection = null;
			if (targetWindow.getSelection) {
				selection = targetWindow.getSelection();
			} else if (targetWindow.document.selection) {
				selection = targetWindow.document.selection;
			};
			return selection;
		},

		getRange: function() {
			var selection = this.getSelection(), range = null;
			if (selection && selection.getRangeAt && selection.rangeCount > 0) {
				range = selection.getRangeAt(0);
			} else if (selection && selection.createRange) {
				range = selection.createRange();
			}
			return range;
		},
		
		isScriptIncluded: function(scriptUrl) {
			var scripts = this.getWindow().document.getElementsByTagName("script");
			var result = false;
			for (var i=0, l=scripts.length; i<l; i++)
				if (scripts[i] && scripts[i].src == scriptUrl)
					result = true;
			return result;
		},
		
		includeScript: function(scriptUrl) {
			if (this.isScriptIncluded(GOOGLE_API_URL)) return;
	  	var doc = this.getWindow().document;
			var script = doc.createElement("script");
			script.setAttribute("type", "text/javascript");
			script.setAttribute("charset", "utf-8");
			script.setAttribute("src", scriptUrl);
			doc.body.appendChild(script);
		},
		
		removeScript: function(scriptUrl) {
			var scripts = this.getWindow().document.getElementsByTagName("script");
			for (var i=0, l=scripts.length; i<l; i++)
		  	if (scripts[i] && scripts[i].src == scriptUrl)
					scripts[i].parentNode.removeChild(scripts[i]);
		}
	};
	InlineTranslator.init(window);
})();
