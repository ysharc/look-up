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
	var audio_text = prepareAudio(word, meaning);
	var notification_text = "";
	var error = false;
	for (var i in meaning.results){
		if(meaning.results[i].part_of_speech && meaning.results[i].senses[0].definition){
			notification_text += meaning.results[i].part_of_speech.toString() + ": " + meaning.results[i].senses[0].definition[0].toString();
			notification_text += "<br><br>";
		} else if(meaning.results[i].senses[0].definition){
			notification_text += meaning.results[i].headword.toString() + ": " + meaning.results[i].senses[0].definition[0].toString();
			notification_text += "<br><br>";
		} else if(meaning.results[i].senses[0].definition){
			notification_text += meaning.results[i].headword.toString() + ": " + meaning.results[i].senses[0].definition[0].toString();
			notification_text += "<br><br>";
		}
	}
	if(!notification_text){
		error = true;
		notification_text = "Sorry we couldn't find the word " + word + " in the Pearson dictionary.\n\n You can see the google meaning <a target='_blank' href='http://google.com/search?q=" + word +"'>here</a>"; 
	}
	showToolTip(word, notification_text, audio_text);
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

function showToolTip(word, text, audio_text){
	console.log("tooltip called!");
	if (!box_present)
		insertBox();box_present = true;
	prependMeaning(word, text, audio_text);
}

function createBox(){
	var meaning_box = document.createElement("aside");
	meaning_box.id = "look_up_meaning_box";
	meaning_box.style.backgroundColor = "#7FDBFF";
	meaning_box.style.border = "1px solid black";
	meaning_box.style.position = "fixed";
	meaning_box.style.top = "50vh";
	meaning_box.style.left = "78vw";
	meaning_box.style.height = "50vh";
	meaning_box.style.width = "20vw";
	meaning_box.style.overflowY = "scroll";
	meaning_box.style.zIndex = "1000";
	return meaning_box;
}

function insertBox(){
	var meaning_box = createBox();
	document.body.appendChild(meaning_box);
	var look_up_meaning_box = document.getElementById("look_up_meaning_box");
	look_up_meaning_box.innerHTML = '<header style="background:black;color:white;height:5vh;width:inherit;position:fixed;margin-bottom:4px;"><h4 style="float:left;margin:4px;">Look-Up</h4><button onclick=lookUpClose() style="color:black;float:right;height:24px;margin:4px;">x</button><button onclick=lookUpToggle() style="color:black;float:right;height:24px;margin:4px">-</button></header><article id="look_up_text_area" style="margin-top:40px;background-color:#7FDBFF;"></article>';
	var toggle_function = document.createElement("script");
	toggle_function.innerHTML = 'var look_up_maximized = true;function lookUpToggle(){var look_up_meaning_box = document.getElementById("look_up_meaning_box");look_up_meaning_box.style.top = look_up_maximized ? "95vh" : "50vh";if(look_up_maximized){look_up_maximized=false}else{look_up_maximized=true}}function lookUpClose(){var look_up_meaning_box = document.getElementById("look_up_meaning_box");document.body.removeChild(look_up_meaning_box);}';
	document.body.appendChild(toggle_function);
}

function prependMeaning(word, text, audio_text){
	var text_area = document.getElementById("look_up_text_area");
	var look_up_meaning = document.createElement("div");
	look_up_meaning.innerHTML = '<div class="look_up_meaning" style="box-shadow: 0 4px 8px 0 rgba(0,0,0,0.5);background-color:#FAFAFA;transition: 0.3s;color:black;margin:9px;border-radius:9px;">' + '<h5>' + word + '</h5>' + '<p>' + text + '</p>'+ audio_text+'</div>';
	text_area.insertBefore(look_up_meaning, text_area.childNodes[0]);
}

function prepareAudio(word, meaning){
	console.log("Audio called!");
	var audio_string = "<audio src=";
	var flag=false;
	for(var i in meaning.results){
		for(var j in meaning.results[i].pronunciations){
			if(meaning.results[i].pronunciations[j].audio[0].url){
				audio_string += "'http://api.pearson.com"+meaning.results[i].pronunciations[j].audio[0].url+"'";
				flag=true;
				break;
			}
		}
		if(flag)
			break;
	}
	audio_string += " id='look_up_" + word + "'></audio><button onclick='document.getElementById('look_up_"+word+"').play()'>Pronunce it!</button>";
	console.log(audio_string);
	return audio_string;
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