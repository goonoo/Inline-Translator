itrans.Message = function(document_) {
	this.element = document_.createElement("div");
	this.pElement1 = document_.createElement("p");
	this.pElement2 = document_.createElement("p");
	this.pElementInfo = document_.createElement("p");
	this.colorCodes = {
		background: function() {return itrans.preferences.getPref("background_color");},
		normalText: function() {return itrans.preferences.getPref("font_color");},
		secondText: function() {return itrans.preferences.getPref("second_font_color");},
		errorText: function() {return itrans.preferences.getPref("error_font_color");},
		blankText: function() {return itrans.preferences.getPref("blank_font_color");}
	};

	this.element.style.position = "absolute";
	this.element.style.zIndex = "99999999";
	this.element.style.display = "none";
	this.element.style.top = "0";
	this.element.style.right = "0";
	this.element.style.bottom = "auto";
	this.element.style.left = "auto";
	this.element.style.height = "auto";
	this.element.style.width = "auto";
	this.pElement1.style.margin = "0";
	this.pElement2.style.margin = "0";
	this.pElementInfo.style.margin = "0";
	this.element.style.padding = "5px";
	this.pElement1.style.padding = "0";
	this.pElement2.style.padding = "0";
	this.pElementInfo.style.padding = "0";
	this.element.style.backgroundColor = this.colorCodes.background();
	this.element.style.fontSize = "13px";
	this.element.style.lineHeight = "1.2";
	this.element.style.borderRadius = "3px";
	this.element.style.color = this.colorCodes.normalText();
	this.pElement2.style.color = this.colorCodes.secondText();
	this.element.style.opacity = ".9";
	
	this.pElement1.style.display = "none";
	this.pElement2.style.display = "none";
	this.pElementInfo.style.display = "none";
	document_.body.appendChild(this.element);
	this.element.appendChild(this.pElement1);
	this.element.appendChild(this.pElement2);
	this.element.appendChild(this.pElementInfo);
};

itrans.Message.prototype = {
	getElement: function() {
		return this.element;
	},

	hide: function() {
		this.element.style.display = "none";
	},

	setPosition: function(posX, posY) {
		this.element.style.top = posY + "px";
		this.element.style.right = "auto";
		this.element.style.bottom = "auto";
		this.element.style.left = posX + "px";
	},

	reset: function() {
		this.pElement1.style.display = "none";
		this.pElement2.style.display = "none";
		this.pElementInfo.style.display = "none";
	},

	set1: function(txt) {
		this.pElement1.textContent = txt;
		this.pElement1.style.display = "block";
		this.pElementInfo.style.display = "none";
		this.element.style.display = "block";
	},
	
	set2: function(txt) {
		this.pElement2.textContent = txt;
		this.pElement2.style.display = "block";
		this.pElementInfo.style.display = "none";
		this.element.style.display = "block";
	},

	setInfo: function(txt) {
		this.pElementInfo.textContent = txt;
		this.pElementInfo.style.display = "block";
		this.pElementInfo.style.color = this.colorCodes.normalText();
		this.element.style.display = "block";
	},

	showError: function(txt) {
		this.pElementInfo.textContent = txt;
		this.pElementInfo.style.display = "block";
		this.pElementInfo.style.color = this.colorCodes.errorText();
		this.element.style.display = "block";
	},

	showBlank: function(txt) {
		this.pElementInfo.textContent = txt;
		this.pElementInfo.style.display = "block";
		this.pElementInfo.style.color = this.colorCodes.blankText();
		this.element.style.display = "block";
	},
	
	destroy: function() {
		var body = this.element.parentNode;
		if (body && body.removeChild)
			body.removeChild(this.element);
	}
};
