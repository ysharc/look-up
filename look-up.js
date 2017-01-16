//Look-up web-extension
document.onmouseup = function() {
    var text = getSelectedText();
    var words = text.split(" ");
	if (words.length < 5){
		for(var i in words){
			if(words[i]){
				httpGetAsync("http://api.pearson.com/v2/dictionaries/ldoce5/entries?"+ mode + "=" + words[i] + "###############################", words[i], reqListener);
			}
		}
	}else{
		var notification = new Notification("Look-Up: Suggestion", {
								body: "Please select less than 5 words at a time. This message is displayed for your own convenience"
							});
	}
};

function getSelectedText() {
    if (window.getSelection) {
        return window.getSelection().toString();
    } else if (document.selection) {
        return document.selection.createRange().text;
    }
    return '';
}

function httpGetAsync(url, word, callback) {
    var client = new XMLHttpRequest();
    var w = word;
	client.addEventListener("load", callback(w));
	client.addEventListener("error", transferFailed);
	client.open("GET", url, true);
    client.send();

}

function reqListener(word) {
	return function(){
		text = this.responseText;
		var meaning = JSON.parse(text);
		notification_text = "";
		for (var i in meaning.results){
			if(meaning.results[i].part_of_speech && meaning.results[i].senses[0].definition){
				notification_text += meaning.results[i].part_of_speech.toString() + ": " + meaning.results[i].senses[0].definition[0].toString();
				notification_text += '\n\n';
			} else if(meaning.results[i].senses[0].definition){
				notification_text += meaning.results[i].headword.toString() + ": " + meaning.results[i].senses[0].definition[0].toString();
				notification_text += '\n\n';
			}
		}
		if(!notification_text){
			error = true;
			notification_text = "Sorry we couldn't find the word " + word + " in pearson dictionary.\n\n Please click this notification to know the meaning"; 
		} else{
			error = false;
		}
		if (Notification.permission === "granted") {
			// If it's okay let's create a notification
			var notification = new Notification(word, {
									body: notification_text
								});
			if(error){
				notification.onclick = function(){
					window.open("http://google.com/search?q="+word);
					window.focus();
				}
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
						}
					}
				}
			});
		}
	}
}

function transferFailed(){
	alert("Look-Up Addon:\n\nThere was an error fetching your data. Please check your internet connection.");
}