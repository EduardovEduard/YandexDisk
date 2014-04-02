var appId = '35fc29c1180e4829a729c721da417b72';

var successfulLoginUrl = 'https://oauth.yandex.ru/verification_code*';
var yandexLoginUrl = 'https://oauth.yandex.ru/authorize?response_type=token&client_id=' + appId;

var screenshotTabId = 100;

function onTabUpdate() {
    if (!localStorage.accessToken) {
        chrome.tabs.query({url : successfulLoginUrl}, function(tabs) {
            if (0 < tabs.length) {
                var tab = tabs[0];
                var token = extractTokenFromUrl(tab.url);
                localStorage.accessToken = token;
                chrome.tabs.onUpdated.removeListener(onTabUpdate);
                console.log('Token: ' + token);
                chrome.tabs.remove(tab.id);
                console.log(tabs.length);
            }
        });
    }
}

window.onload = function () {
    chrome.tabs.onUpdated.addListener(onTabUpdate);

    chrome.browserAction.onClicked.addListener(function() {

        if (!localStorage.accessToken) {
            console.log("No access token!");

            chrome.tabs.create({}, function(tab) {
                chrome.tabs.update(tab.id, {url : yandexLoginUrl});
            });
        }
        else {
            console.log("Access token: ");
            console.log(localStorage.accessToken);
            takeScreenshot();
        }
    });
};

function extractTokenFromUrl(url) {
    var params = url.split('#')[1];
    var tokenParam = params.split('&')[0];
    return tokenParam.split('=')[1];
}

function takeScreenshot() {

    DiskApi.token = localStorage.accessToken;
    DiskApi.make_directory('/ChromePlugin');

    chrome.tabs.captureVisibleTab(null, function(image) {
        var screenshotUrl = image;
        var viewTabUrl = chrome.extension.getURL('screenshot.html?id=' + screenshotTabId++);

        chrome.tabs.create({url : viewTabUrl}, function(tab) {
            var targetId = tab.id;

            var addSnapshotImageToTab = function(tabId, changedProps) {
                if (tabId != targetId || changedProps.status != 'complete')
                    return;

                chrome.tabs.onUpdated.removeListener(addSnapshotImageToTab);

                var views = chrome.extension.getViews();
                for (var i = 0; i < views.length; i++) {
                    var view = views[i];
                    if (view.location.href == viewTabUrl) {
                        view.setScreenshotUrl(screenshotUrl, DiskApi);
                        break;
                    }
                }
            };
            chrome.tabs.onUpdated.addListener(addSnapshotImageToTab);
        });
    });
}
