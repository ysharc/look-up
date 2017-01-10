//Look-up web-extension
document.onmouseup = function() {
    var text = getSelectedText();
    var words = text.split(" ");
    for(var i in words){
        if(words[i]){
            alert(words[i]);
            console.log(httpGetAsync("http://api.pearson.com/v2/dictionaries/entries?headword=magic", parseJSON));
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
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", url, false); // true for asynchronous 
    xmlHttp.send(null);
}

function parseJSON(jsonObject){
    return JSON.parse(jsonObject);
}