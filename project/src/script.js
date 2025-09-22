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
 * @param {Element} elem - The DOM element that will be analyzed.
 * @param {object} hanziList - The json object containing Hanzis as keys and
 *                             the corresponding pinyins as values.
 */
function recursiveReplace(elem, hanziList) {
    // Exceptional elements that won't be replaced.
    exceptions = ['input', 'textarea', 'pre', 'code'];

    /**
     * Check if the element contains any exceptional elements.
     * @param {Element} elem - The DOM element that will be checked.
     */
    function containsExceptionalElement(elem) {
        for (var i = 0; i < exceptions.length; i++) {
            var exception = exceptions[i];
            if (elem.querySelector(exception) !== null) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if the element is one of exceptional elements.
     * @param {Element} elem - The DOM element that will be checked.
     */
    function isException(elem) {
        var tagName = elem.tagName.toLowerCase();
        return exceptions.includes(tagName);
    }

    if (containsExceptionalElement(elem)) {
        // Recursively search and replace the children.
        var children = elem.children;
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            recursiveReplace(child, hanziList);
        }
    } else if (isException(elem)) {
        return;
    } else {
        // Found a element to be pinyinized.
        var html = elem.innerHTML;
        var pinyinized = pinyinize(html, hanziList);
        elem.innerHTML = pinyinized;
    }
}


chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.action && msg.action === 'pinyinize') {
        fetch(chrome.runtime.getURL('/resources/hanzi.json'))
            .then(function(response) { return response.json(); })
            .then(function(hanziList) {
                var body = document.body;
                if (body.getAttribute('pinyinized')) {
                    return;
                }
                recursiveReplace(body, hanziList);
                body.setAttribute('pinyinized', 'true');
            });
    }
});
