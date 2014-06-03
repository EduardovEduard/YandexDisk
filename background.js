var appId = '35fc29c1180e4829a729c721da417b72';

var successfulLoginUrl = 'https://oauth.yandex.ru/verification_code';
var yandexLoginUrl = 'https://oauth.yandex.ru/authorize?response_type=token&client_id=' + appId;

var tabId = 0;

function getToken() {
    chrome.tabs.query({active: true}, function(tabs) {
        for (var i = 0; i < tabs.length; ++i) {
            console.log("Trying: " + i);
            if (tabs[i].url.indexOf(successfulLoginUrl) == 0) {
                var tab = tabs[i];
                var token = extractTokenFromUrl(tab.url);

                localStorage.accessToken = token.token;

                var date = new Date();
                date.setSeconds(date.getSeconds() + token.expires);
                localStorage.expires = date.getTime();

                chrome.tabs.remove(tab.id);
                chrome.tabs.onUpdated.removeListener(getToken);
            }
        }
    });
}

window.onload = function () {

    var onClicked = function() {
        if (!localStorage.accessToken || parseInt(localStorage.expires) < new Date().getTime()) {
            console.log("No access token!");

            chrome.tabs.onUpdated.addListener(getToken);
            chrome.tabs.create({}, function(tab) {
                chrome.tabs.update(tab.id, {url : yandexLoginUrl});
            });
        }
        else {
            console.log("Access token: ");
            console.log(localStorage.accessToken);
            takeScreenshot();
        }
    };

    chrome.browserAction.onClicked.addListener(onClicked);
};

function extractTokenFromUrl(url) {
    var params = url.split('#')[1];
    params = params.split('&');
    var tokenParam = params[0];
    var expiresParam = params[3];

    return { token : tokenParam.split('=')[1], expires : parseInt(expiresParam.split('=')[1]) };
}

function takeScreenshot() {

    DiskApi.token = localStorage.accessToken;
    DiskApi.make_directory('/ChromePlugin');

    chrome.tabs.getSelected(null, function(tab) {
        var title = tab.title;
        chrome.tabs.captureVisibleTab(null, {'format' : 'png'}, function(image) {
            var screenshotUrl = image;
            var viewTabUrl = chrome.extension.getURL('screenshot.html?id=' + tabId++);

            chrome.tabs.create({url : viewTabUrl}, function(tab) {
                var targetId = tab.id;

                var addSnapshotImageToTab = function(tabId, changedProps) {
                    if (tabId != targetId || changedProps.status != 'complete') {
                        return;
                    }
                    console.log("CREATE ON_SCREEN!!!");
                    console.log("Title: " + title);
                    chrome.tabs.onUpdated.removeListener(addSnapshotImageToTab);
                    var views = chrome.extension.getViews();


                    for (var i = 0; i < views.length; i++) {
                        var view = views[i];
                        if (view.location.href == viewTabUrl) {
                            view.setScreenshotUrl(screenshotUrl, title, DiskApi);
                            break;
                        }
                    }
                };
                chrome.tabs.onUpdated.addListener(addSnapshotImageToTab);
            });
        });
    });
}