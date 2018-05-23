/**
 * Created by mac on 2018/2/1.
 */

var locs = require('./loc.json');

var language;
if (navigator.language) {
	language = navigator.language;
} else {
	language = navigator.browserLanguage;
}

function initialize() {
	var elems = document.querySelectorAll('*[data-text]'),i,t,ele;
	for (i = 0, t = elems.length; i < t; ++i) {
		ele = elems[i];
		ele.innerText = loc(ele.getAttribute('data-text'));
	}
	elems = document.querySelectorAll('*[data-placeholder]');
    for (i = 0, t = elems.length; i < t; ++i) {
        ele = elems[i];
        ele.placeholder = loc(ele.getAttribute('data-placeholder'));
    }
    elems = document.querySelectorAll('*[data-html]');
    for (i = 0, t = elems.length; i < t; ++i) {
        ele = elems[i];
        ele.innerHTML = loc(ele.getAttribute('data-html'));
    }
}

function loc(text) {
	return initialize.words[text] || text;
}
initialize.loc = loc;

initialize.set = function(lan) {
    if (/^zh/.test(lan)) {
        initialize.words = locs['zh-CN'];
        initialize.language = 'zh';
    }else {
        initialize.words = locs['en'];
        initialize.language = 'en';
    }
};

initialize.set(language);

module.exports = initialize;
