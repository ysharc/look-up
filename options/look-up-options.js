function onError(error){
	alert(error);
}

function saveOptions() {
	var read_mode = document.getElementById("look-up-read-mode").checked ? "read" : "silent";
	var automatic = document.getElementById("look-up-automatic").checked;
	
	var look_up = {
		mode: read_mode,
		auto: automatic
	};
	var setting = browser.storage.local.set({look_up});
	setting.then(restoreOptions, onError);
	return false;
}

function restoreOptions() {
	var look_up = browser.storage.local.get("look_up");
	look_up.then((res) => {
		if(res.look_up.mode === "read"){
			document.getElementById("look-up-read-mode").checked = true;
		}else{
			document.getElementById("look-up-silent-mode").checked = true;
		}

		if(res.look_up.auto){
			document.getElementById("look-up-automatic").checked = true;
		}else{
			document.getElementById("look-up-automatic").checked = false;
		}
	});
}

//set parameters initially
var look_up_existing = browser.storage.local.get("look_up");
look_up_existing.then((res) => {
	if(!res.look_up) {
		var look_up = {
			mode: "read",
			auto: false
		};
		var setting = browser.storage.local.set({look_up});
		setting.then(document.addEventListener("DOMContentLoaded", restoreOptions), onError);
	} else{
		document.addEventListener("DOMContentLoaded", restoreOptions);
	}

	var save = document.getElementById("save");
	if (save.addEventListener)
		save.addEventListener("click", saveOptions);
	else if (save.attachEvent)
		save.attachEvent("onclick", saveOptions);
	browser.storage.onChanged.addListener(restoreOptions);
}, onError);

