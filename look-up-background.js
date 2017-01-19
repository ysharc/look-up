//Look-up web-extension
function getMeaning(url, word, callback) {
	var client = new XMLHttpRequest();
	var w = word;
	client.timeout = 3000;
	client.addEventListener("load", callback(w));
	client.ontimeout = timeOut;
	client.addEventListener("error", transferFailed);
	client.open("GET", url, true);
	client.send();
}

function sendMeaning(word){
	return function(){
		var text = this.responseText;
		contentPort.postMessage({
			word: word,
			text: text
		});
	};
}

function timeOut(){
	contentPort.postMessage({error: "Look-Up:\n\n Network too slow. Please try again later."});
}

function transferFailed(){
	contentPort.postMessage({error: "Look-Up:\n\n An error has occured. Please check your connection and try again."});
}

// =============================================
// Connection from content script
// =============================================
var contentPort;

function connected(port) {
	contentPort = port;
	contentPort.onMessage.addListener(function(message) {
		var words = message.words;
		if (words.length > 4){
			contentPort.postMessage({warning: "too many words"});
		} else{
			for(var i in words){
				if (words[i])
					getMeaning("http://api.pearson.com/v2/dictionaries/ldoce5/entries?headword=" + words[i] + "&limit=3&apikey=iXNRYmPiIg8DFaWQsqm3BATO6yKs3qCw", words[i], sendMeaning);
			}
		}
	});
}

browser.runtime.onConnect.addListener(connected);