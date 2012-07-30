itrans.getSelectedText = function(targetWindow) {
	var range = itrans.getRange(targetWindow);
	var selectedText = "";
	
	if (range && range.text) {
		selectedText = range.text;
	} else if (range && range.toString) {
		selectedText = range.toString();
	} else {
		selectedText = "";
	};

	// trim
	selectedText = selectedText.replace(/^\s*/, '').replace(/\s*$/, '');

	return selectedText;
};

itrans.getSelection = function(targetWindow) {
	var selection = null;

	if (targetWindow.getSelection) {
		selection = targetWindow.getSelection();
	} else if (targetWindow.document.selection) {
		selection = targetWindow.document.selection;
	} else {
		selection = null;
	};
	return selection;
};

itrans.getRange = function(targetWindow) {
	var selection = itrans.getSelection(targetWindow);
	var range = null;

	if (selection && selection.getRangeAt && selection.rangeCount > 0) {
		range = selection.getRangeAt(0);
	} else if (selection && selection.createRange) {
		range = selection.createRange();
	} else {
		range = null;
	};
	return range;
};
