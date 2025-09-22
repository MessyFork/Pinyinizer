// Called when the user clicks on the action.
chrome.action.onClicked.addListener(function(tab) {
    chrome.tabs.sendMessage(tab.id, {action: 'pinyinize'}, function() {});
});
