/**
 * Ruby the given character.
 * @param {string} c - The character to be replaced with the rubied element.
 * @param {object} hanziList - The json object containing Hanzis as keys and
 *                             the corresponding pinyins as values.
 * @returns {string} String containing the ruby tag.
 */
function ruby(c, hanziList) {
    var pinyin = hanziList[c];
    return '<ruby>' + c + '<rt>' + pinyin + '</rt></ruby>';
}

/**
 * Decompose the given element's html into characters and ruby them one by one.
 * @param {string} elem - The HTML string to be pinyinized.
 * @param {object} hanziList - The json object containing Hanzis as keys and
 *                             the corresponding pinyins as values.
 * @returns {string} String whose containing characters has been replaced with
 *                   corresponding ruby tags.
 */
function pinyinize(elem, hanziList) {
    var chars = elem.split('');
    var c = '';
    for (var i = 0; i < chars.length; i++) {
        c = chars[i];
        if (c in hanziList) {
            chars[i] = ruby(chars[i], hanziList);
        }
    }

    return chars.join('');
}

/**
 * Recursively search elements to be pinyinized in the given DOM, and replace
 * them with elements containing ruby tags.
 * @param {Object} elem - The jQuery object that will be analized.
 * @param {object} hanziList - The json object containing Hanzis as keys and
 *                             the corresponding pinyins as values.
 */
function recursiveReplace(elem, hanziList) {
    // Exceptional elements that won't be replaced.
    exceptions = ['input', 'textarea', 'pre', 'code'];

    /**
     * Check if the element contains any exceptional elements.
     * @param {Object} elem - The jQuery object that will be checked.
     */
    function containsExceptionalElement(elem) {
        for (var i = 0; i < exceptions.length; i++) {
            var exception = exceptions[i];
            if (elem.find(exception).length !== 0) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if the element is one of exceptional elements.
     * @param {Object} elem - The jQuery object that will be checked.
     */
    function isException(elem) {
        for (var i = 0; i < exceptions.length; i++) {
            var exception = exceptions[i];
            if (elem.is(exception)) {
                return true;
            }
        }
        return false;
    }

    if (containsExceptionalElement(elem)) {
        // Recursively search and replace the children.
        var children = elem.children()
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            recursiveReplace($(child), hanziList);
        }
    } else if (isException(elem)) {
        return;
    } else {
        // Found a element to be pinyinized.
        var html = elem.html();
        var pinyinized = pinyinize(html, hanziList);
        elem.html(pinyinized);
    }
}


chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.action && msg.action === 'pinyinize') {
        $.getJSON(chrome.extension.getURL('/resources/hanzi.json'), function(hanziList) {
            var body = $('body');
            if (body.attr('pinyinized')) {
              return;
            }
            recursiveReplace(body, hanziList);
            body.attr('pinyinized', true);
        });
    }
});
