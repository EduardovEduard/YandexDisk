window.onload = function()
{
	var send = function (value)
	{
		var sendMessage = function()
		{
			var hostName = "ru.yandexdisk.host";
			console.log("Send message" + value);
			chrome.runtime.sendNativeMessage(hostName, {text: value.toString()});
		};
		
		return sendMessage;
	};

	document.getElementById("link1").addEventListener("click", send(0));
	document.getElementById("link2").addEventListener("click", send(1));
	document.getElementById("link3").addEventListener("click", send(2));
};
