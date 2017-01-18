function onError(error){
	alert(error);
}

function saveOptions(event) {
	event.preventDefault();
	console.log("Setting events");
	var read_mode = document.getElementById("look-up-read-mode").checked;
	var automatic = document.getElementById("look-up-automatic").checked;
	
	var look_up = {
		mode: read_mode,
		auto: automatic
	};

	browser.storage.local.set({look_up});
}

function restoreOptions() {
	var look_up = browser.storage.local.get("look_up");
	look_up.then((res) => {
		alert(res["mode"]);
		if(res["mode"] === "read"){
			document.getElementById("look-up-read-mode").checked = true;
		}else{
			document.getElementById("look-up-read-mode").checked = false;
		}

		if(res["auto"]){
			document.getElementById("look-up-automatic").checked = true;
		}else{
			document.getElementById("look-up-automatic").checked = false;
		}
	});
}

//set parameters initially
var look_up_existing = browser.storage.local.get("look_up");
look_up_existing.then((res) => {
	if(!res.length || !res[0].look_up) {
		console.log("No options set yet! yo");
		var look_up = {
			mode: "read",
			auto: false
		};
		browser.storage.local.set({look_up});	
	}
	document.addEventListener("DOMContentLoaded", restoreOptions);
	document.querySelector("form").addEventListener("submit", saveOptions);	
}, onError);