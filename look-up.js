//Look-up web-extension
document.onmouseup = function() {
    var text = getSelectedText();
    var words = text.split(" ");
    for(var i in words){
        if(words[i]){
			alert(words[i]);
            httpGetAsync("http://api.pearson.com/v2/dictionaries/ldoce5/entries?headword=" + words[i] + "&apikey=#######################", reqListener);
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

function httpGetAsync(url, callback) {
    var client = new XMLHttpRequest();
    
	client.addEventListener("load", callback);
	client.open("GET", url, true);
    client.send();

}

function reqListener() {
	text = this.responseText;
	var meaning = JSON.parse(text);
	console.log(meaning);
	notification_text = "";
	for (var i in meaning.results){
		notification_text += meaning.results[i].part_of_speech.toString() + ":" + meaning.results[i].senses[0].definition[0];
		notification_text += '\n\n';
	}
	
	if (Notification.permission === "granted") {
		// If it's okay let's create a notification
		var notification = new Notification("Hi there!", {
								body: notification_text
							});
  	} else {
			Notification.requestPermission(function (permission) {
				// If the user accepts, let's create a notification
				if (permission === "granted") {
					var notification = new Notification("Hi there!", {
					body: notification_text
				});
			}
		});
	}
}
