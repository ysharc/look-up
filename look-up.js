//Look-up web-extension
document.onmouseup = function() {
    var text = getSelectedText();
    var words = text.split(" ");
    for(var i in words){
        if(words[i]){
			httpGetAsync("http://api.pearson.com/v2/dictionaries/ldoce5/entries?headword=" + words[i] + "&limit=3&apikey=iXNRYmPiIg8DFaWQsqm3BATO6yKs3qCw", words[i], reqListener);
        }
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
		console.log(meaning.results[0].senses[0].definition[0]);
		notification_text = "";
		for (var i in meaning.results){
			notification_text += meaning.results[i].part_of_speech.toString() + ": " + meaning.results[i].senses[0].definition[0].toString();
			notification_text += '\n\n';
		}
		
		if (Notification.permission === "granted") {
			// If it's okay let's create a notification
			var notification = new Notification(word, {
									body: notification_text
								});
		} else {
				Notification.requestPermission(function (permission) {
					// If the user accepts, let's create a notification
					if (permission === "granted") {
						var notification = new Notification(word, {
						body: notification_text
					});
				}
			});
		}
	}
}

function transferFailed(){
	alert("There was an error fetching your data");
}