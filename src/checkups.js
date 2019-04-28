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
    let alp = (tm + ta).replace(" ", "");
    if (alp.length == 0) return false;

    let empty = new RegExp('^\\s*$');
    // matches [ // my comment ... ]
    let comment = new RegExp('^\\s*(\\\/\\\/)(.*)\\s*$');
    // matches [ abc -> b ] or [ abc b ]
    let re1 = new RegExp('^\\s*(['+ alp +']+)((\\s*->\\s*)|(\\s+))(['+ alp +']+)\\s*$');
    // matches [ \ -> ab ] or [ \ ab ]
    let re2 = new RegExp('^\\s*(\\\\)((\\s*->\\s*)|(\\s+))(['+ alp +']+)\\s*$');
    // matches [ ab -> \ ] or [ ab \ ]
    let re3 = new RegExp('^\\s*(['+ alp +']+)((\\s*->\\s*)|(\\s+))(\\\\)\\s*$');

    let lines = code.split("\n");
    console.log(lines);

    let lines_n = 0;
    let flag = true;
    let new_lines = [];
    lines.forEach(function (line) {
        let l = line;
        if (!comment.test(line) && !empty.test(line)) {
            ++lines_n;

            // if line is semantically correct, make it pretty
            // else mark code as incorrect

            if (re1.test(line)) {
                l.replace(re1, "$1 -> $5");
                console.log(l);
            } else if (re2.test(line)) {
                l.replace(re2, '$1 -> $5');
            } else if (re3.test(line)) {
                l.replace(re3, '$1 -> $5');
            } else {
                flag = false;
            }
        }
        new_lines.push(l);
        console.log("NL: " + new_lines);
    });

    ipcRenderer.send('set-code', new_lines.join("\n"));
    return (lines_n > 0) && flag;
}

function checkInput(tm, input) {
    var flag = false;
    input.split("").forEach(function (ch) {
        if (!tm.includes(ch)) {
            flag = true;
        }
    });

    //ipcRenderer.send('input-ok', flag);
    return flag;
}

exports.CheckAlphabets = checkAlphabets;
exports.CheckCode = checkCode;
exports.CheckInput = checkInput;