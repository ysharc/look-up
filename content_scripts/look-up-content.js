var read_mode = true;
var auto_mode = false;

function onError(error){
	alert(error);
}

function change_settings(){
	var look_up_existing = browser.storage.local.get("look_up");
	look_up_existing.then((res) => {
		read_mode = res[0].look_up.read_mode;
		auto_mode = res[0].look_up.auto;
	}, onError);
	if(read_mode){
		document.addEventListener("mouseup", sendSelectedText);
	} else {
		document.removeEventListener("mouseup", sendSelectedText);
	}
}

var look_up_existing = browser.storage.local.get("look_up");
look_up_existing.then((res) => {
	if(!res[0].look_up){
		//look_up settings have not been set yet.
		// Initialize with read_mode and auto:false
		var look_up = {
			mode: "read",
			auto: false
		};
		browser.storage.local.set({look_up});
		document.addEventListener("storage", change_settings);
	} else {
		change_settings();
	}
}, onError);

/*while(true){
	document.onmouseup = function() {
		var text = getSelectedText();
		var words = text.split(" ");
		if (words.length < 5){
			for(var i in words){
				if(words[i]){
					alert(words[i]);
				}
			}
		}else{
			var notification = new Notification("Look-Up: Suggestion", {
				body: "Please select less than 5 words at a time. This message is displayed for your own convenience"
			});
			notification.sticky;
		}
	};
}*/

function sendSelectedText() {
	if (window.getSelection) {
		if(window.getSelection().toString())
			console.log(window.getSelection().toString());
	} else if (document.selection) {
		if(document.selection.createRange().text)
			console.log(document.selection.createRange().text);
	}
	//console.log("");
}