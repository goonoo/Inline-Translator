itrans.ContentWindow = itrans.Class({
	initialize: function(contentWindowDocument) {
		this.document_ = contentWindowDocument;
		this.window_ = this.document_.defaultView;
		this.message_ = null;
    this.accessToken = null;
	},

	getDocument: function() {
		return this.document_
	},

	canLoadTranslator: function() {
		if (typeof this.document_.designMode == "undefined" || this.document_.designMode == "on") {
			return false;
		} else if (this.isInFrame_() && (this.window_.innerWidth < 100 || this.window_.innerHeight < 100)) {
			return false;
		} else {
			return true;
		};
	},

	isLoadedTranslatorValid: function() {
		if (typeof this.document_.designMode == "undefined" || this.document_.designMode == "on") {
			return false;
		} else {
			return true;
		};
	},

	loadTranslator: function() {
		this.message_ = new itrans.Message(this.getDocument());
		this.registerEvents_();
	},

	isTranslatorLoaded: function() {
		return !!(this.message_);
	},

	unloadTranslator: function() {
		if (this.message_)
			this.message_.destroy();
		delete this.message_;

		this.unregisterEvents_();
		delete this.document_;
		delete this.window_;
	},

	onMouseUp: function(event) {
		if (!itrans.isActivated() || this.isMouseOnMessage(event.target)) {
			return;
		};

		var this_ = this;
		setTimeout(function() {
			var text = itrans.getSelectedText(this_.window_);
			if (!text || text.length > itrans.preferences.getPref("max_length") || !itrans.isTranslatableText(text)) {
				return;
			};

			var mousePosition = itrans.getMousePosition(event);
			this_.message_.setPosition(
				(mousePosition.x + 10),
				(this_.window_.scrollY + mousePosition.y + 5)
			);
			
			this_.translate(text);
		},10);
	},

  getAccessToken: function (next) {
		var this_ = this;
		var req = new XMLHttpRequest();
    req.addEventListener('load', function() {
			if (req.status !== 200) {
				this_.message_.showError(document.getElementById("itrans-properties").getString("RequestFailed"));
				return;
			} else if (!req.responseText) {
				this_.message_.showError(document.getElementById("itrans-properties").getString("RequestFailed"));
				return;
      } else {
        var jsonResponse = JSON.parse(req.responseText);
        
        this_.accessToken = jsonResponse.access_token;
        next();
      };
    });

    req.open('POST', 'https://datamarket.accesscontrol.windows.net/v2/OAuth2-13/');
    req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    req.send(
        'client_id='+
          encodeURIComponent(itrans.preferences.getPref("client_id")) +'&' +
        'client_secret='+
          encodeURIComponent(itrans.preferences.getPref("client_secret")) +'&' +
        'scope='+ encodeURIComponent('http://api.microsofttranslator.com') +'&' +
        'grant_type=client_credentials');
  },
	
	translate: function(text) {
    var this_ = this;

    if (!this.accessToken) {
      this.getAccessToken(function () {
        this_.translate(text);
      });
      return;
    };

		var this_ = this;
		this.message_.reset();
		this.message_.setInfo(document.getElementById("itrans-properties").getString("Searching"));

		var lang1 = itrans.preferences.getPref("language");
		var lang1alt = itrans.preferences.getPref("language_alt");
		this.translateText_(true, lang1, lang1alt, text);

		var lang2 = itrans.preferences.getPref("second_language");
		var lang2alt = itrans.preferences.getPref("language_alt");
		if (lang2)
			this.translateText_(false, lang2, lang2alt, text);
	},

	onMouseDown: function(event) {
		if (this.isMouseOnMessage(event.target))
			return;

		this.message_.hide();
	},
	
	isMouseOnMessage: function(el) {
		var messageEl = this.message_.getElement();
		if (el == messageEl)
			return true;

		var parentEl = el;
		while (parentEl = parentEl.parentNode) {
			if (parentEl == messageEl)
				return true;
		}
		
		return false;
	},

	isInFrame_: function() {
		return !!this.window_.frameElement;
	},

	translateText_: function(isLang1, lang, langAlt, text) {
		var this_ = this;
		var req = new XMLHttpRequest();
		req.addEventListener('load', function() {
			if (req.status !== 200) {
				this_.message_.showError(document.getElementById("itrans-properties").getString("RequestFailed"));
				return;
			};
			
			var translatedText = req.responseText.replace(/"/g, '');
			if (!translatedText) {
				translatedText = document.getElementById("itrans-properties").getString("NoResult");
			} else if (translatedText == text && langAlt) {
				this_.translateText_(isLang1, langAlt, null, text);
				return;
			} else if (translatedText.indexOf('AppId is over the quota') > 0) {
				translatedText = document.getElementById("itrans-properties").getString("AppIdOver");
			} else if (translatedText.indexOf('ArgumentException') >= 0) {
				this_.getAccessToken(function () {
					null;
				});
				return this_.translate(text);
			} 
				translatedText = translatedText.replace(/<[^>]*>/g, '');
				translatedText = translatedText.replace(/[\s\t\n\r]+/g, ' ');
				translatedText = translatedText.replace(/\\u000a/g, ' ');
				if (isLang1)
					this_.message_.set1(translatedText);
				else
					this_.message_.set2(translatedText);
		}, false);

		req.addEventListener('error', function() {
			this_.message_.showError(document.getElementById("itrans-properties").getString("RequestFailed"));
		}, false);

		req.open('GET',
        'http://api.microsofttranslator.com/V2/Ajax.svc/Translate?' +
          'appId='+ encodeURIComponent('Bearer '+ this_.accessToken) +'&'+
          'to='+ lang +'&'+
          'text='+ encodeURIComponent(text));
		req.send(null);
	},
	
	registerEvents_: function() {
		var this_ = this;
		this.bodyMouseupEventListener_ = function(event) {
			this_.onMouseUp(event);
		};
		this.bodyMousedownEventListener_ = function(event) {
			this_.onMouseDown(event);
		};
		this.document_.body.addEventListener("mouseup", this.bodyMouseupEventListener_, true);
		this.document_.body.addEventListener("mousedown", this.bodyMousedownEventListener_, true);
	},
	
	unregisterEvents_: function() {
		this.document_.body.removeEventListener("mouseup", this.bodyMouseupEventListener_);
		this.document_.body.removeEventListener("mousedown", this.bodyMousedownEventListener_);
	}
});
