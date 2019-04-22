'use strict';

const { ipcRenderer } = require('electron');

function checkAlphabets(tm, ta) {
    var alphabet_main = tm.split("");
    alphabet_main = alphabet_main.filter(function (elem, pos, self) {
        return elem !== " " &&
            self.indexOf(elem) === pos
    });

    ipcRenderer.send('set-tm', alphabet_main.join(" "));

    if (ta!=='') {
        var alphabet_additional = ta.split("");
        alphabet_additional = alphabet_additional.filter(function (elem, pos, self) {
            return elem !== " " &&
                !alphabet_main.includes(elem) &&
                self.indexOf(elem) === pos
        });

        ipcRenderer.send('set-ta', alphabet_additional.join(" "))
    }
}

function checkCode(tm, ta, code) {
    // var alp = tm + ta;
    //
    // var re = new RegExp(alp, "->");
    // code.forEach(function (line) {
    //
    // });

    //ipcRenderer.send('set-code', lines)
}

function checkInput(tm, input) {
    var flag = false;
    input.split("").forEach(function (ch) {
        if (!tm.includes(ch)) {
            flag = true;
        }
    });

    ipcRenderer.send('input-ok', flag)
}

exports.CheckAlphabets = checkAlphabets;
exports.CheckCode = checkCode;
exports.CheckInput = checkInput;