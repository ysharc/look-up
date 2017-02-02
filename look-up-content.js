var read_mode = true;
var auto_mode = false;
var listener_set = false;
var doc = document;
var box_present = false;
var maximized = true;

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
			notification_text += "<br><br>";
		} else if(meaning.results[i].senses[0].definition){
			notification_text += meaning.results[i].headword.toString() + ": " + meaning.results[i].senses[0].definition[0].toString();
			notification_text += "<br><br>";
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
	console.log("tooltip called!");
	if (!box_present)
		insertBox();box_present = true;
	appendMeaning(word, text);
}

function createBox(){
	var meaning_box = document.createElement("aside");
	meaning_box.id = "look_up_meaning_box";
	meaning_box.style.border = "1px solid black";
	meaning_box.style.position = "fixed";
	meaning_box.style.top = "55vh";
	meaning_box.style.left = "78vw";
	meaning_box.style.height = "45vh";
	meaning_box.style.width = "20vw";
	meaning_box.style.overflowY = "scroll";
	meaning_box.style.zIndex = "1000";
	return meaning_box;
}

function insertBox(){
	console.log("insertBox called!");
	var meaning_box = createBox();
	document.body.appendChild(meaning_box);
	var look_up_meaning_box = document.getElementById("look_up_meaning_box");
	look_up_meaning_box.innerHTML = '<header style="background:black;color:white;height:36px;width:inherit;position:fixed;margin-bottom:4px;"><h4 style="float:left;margin:4px;">Look-Up</h4><button style="float:right;height:24px;margin:4px;"></button><button onclick="lookUpToggle()" style="float:right;height:24px;margin:4px"></button></header><article id="look_up_text_area" style="margin-top:40px;"></article>';
}

function appendMeaning(word, text){
	var text_area = document.getElementById("look_up_text_area");
	var look_up_meaning = document.createElement("div");
	look_up_meaning.innerHTML = '<div class="look_up_meaning" style="background-color:grey;color:black;margin:4px;border-radius:9px;">' + '<h5>' + word + '</h5>' + '<p>' + text + '</p></div>';
	text_area.appendChild(look_up_meaning);
}

function lookUpToggle(){
	var look_up_meaning_box = document.getElementById("look_up_meaning_box");
	look_up_meaning_box.style.top = maximized ? "98vh" : "55vh";
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