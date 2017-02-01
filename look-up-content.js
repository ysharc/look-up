var read_mode = true;
var auto_mode = false;
var listener_set = false;
var doc = document;

function onError(error){
	alert(error);
}

function change_settings(){
	var look_up_existing = browser.storage.local.get("look_up");
	look_up_existing.then((res) => {
		read_mode = res[0].look_up.mode;
		auto_mode = res[0].look_up.auto;
		if(read_mode === "read" && !listener_set){
			doc.addEventListener("mouseup", handleText, false);
			listener_set = true;
		} else if(read_mode === "silent" && listener_set) {
			doc.removeEventListener("mouseup", handleText, false);
			listener_set = false;
		}
	}, onError);
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
		var setting = browser.storage.local.set({look_up});
		setting.then(change_settings, onError);
	} else {
		change_settings();
	}
	browser.storage.onChanged.addListener(change_settings);
}, onError);

function handleText(){
	var text = getSelectedText();
	var words = text.split(" ");
	if (words.length > 25 && auto_mode){
		var look_up = {
			read_mode: "silent",
			auto: true
		};
		var setting = browser.storage.local.set({look_up});
		setting.then(function(){
			doc.removeEventListener("mouseup", handleText, false);
			listener_set = false;
		}, onError);
	}
	get_meaning(words);
}

function getSelectedText() {
	if (window.getSelection) {
		return window.getSelection().toString();
	} else if (document.selection) {
		return document.selection.createRange().text;
	}
	return "";
}

function notifyMeaning(word, text) {
	var meaning = JSON.parse(text);
	var notification_text = "";
	var error = false;
	for (var i in meaning.results){
		if(meaning.results[i].part_of_speech && meaning.results[i].senses[0].definition){
			notification_text += meaning.results[i].part_of_speech.toString() + ": " + meaning.results[i].senses[0].definition[0].toString();
			notification_text += "\n\n";
		} else if(meaning.results[i].senses[0].definition){
			notification_text += meaning.results[i].headword.toString() + ": " + meaning.results[i].senses[0].definition[0].toString();
			notification_text += "\n\n";
		}
	}
	if(!notification_text){
		error = true;
		notification_text = "Sorry we couldn't find the word " + word + " in pearson dictionary.\n\n Please click this notification to know the meaning"; 
	}
	showToolTip(word, notification_text);
	/*
	if (Notification.permission === "granted") {
		// If it's okay let's create a notification
		
		var notification = new Notification(word, {
			body: notification_text
		});
		if(error){
			notification.onclick = function(){
				var external = window;
				external.open("http://google.com/search?q="+word);
				external.focus();
			};
		}
	} else {
		Notification.requestPermission(function (permission) {
			// If the user accepts, let's create a notification
			if (permission === "granted") {
				var notification = new Notification(word, {
					body: notification_text
				});
				if(error){
					notification.onclick = function(){
						window.open("http://google.com/search?q="+word);
						window.focus();
					};
				}
			}
		});
	}*/
}

function showToolTip(word, text){
	var selection = window.getSelection(),
		range = selection.getRangeAt(0),
		rect = range.getBoundingClientRect(),
		div = document.createElement("div");
	div.id = "look_up_meaning";
	div.style.borderBottom = "2px solid black";
	div.style.backgroundColor = "black";
	div.style.color = "white";
	div.style.position = "fixed";
	div.style.display = "inline-block";
	div.style.top = rect.top + "px";
	div.style.left = rect.left + "px";
	div.innerText = text;
	document.body.appendChild(div);
	var look_up_meaning = document.getElementById("look_up_meaning");
}

// =============================================
// Connection to background script
// =============================================
var port = browser.runtime.connect();

function get_meaning(word){
	port.postMessage({words: word});
}

port.onMessage.addListener(function(message) {
	if (message.error)
		alert(message.error);
	if (message.word)
		notifyMeaning(message.word, message.text);//notifyMeaning(message.word, message.text);
});