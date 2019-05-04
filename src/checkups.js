'use strict';

const { ipcRenderer } = require('electron');

function checkAlphabets(tm, ta) {
    let alphabet_main = tm.split("");
    alphabet_main = alphabet_main.filter(function (elem, pos, self) {
        return elem !== " " &&
            self.indexOf(elem) === pos &&
            elem !== "\\" && elem !== "."
    });

    ipcRenderer.send('set-tm', alphabet_main.join(" "));

    if (ta!=='') {
        let alphabet_additional = ta.split("");
        alphabet_additional = alphabet_additional.filter(function (elem, pos, self) {
            return elem !== " " &&
                !alphabet_main.includes(elem) &&
                self.indexOf(elem) === pos &&
                elem !== "\\" && elem !== "."
        });

        ipcRenderer.send('set-ta', alphabet_additional.join(" "));
    }
}

function checkCode(tm, ta, code) {
    let alp = (tm + ta).replace(/\s/g, "");
    if (alp.length == 0) return false;

    let empty = new RegExp('^\\s*$');
    // matches [ // my comment ... ]
    let comment = new RegExp('^\\s*(\\\/\\\/)(.*)\\s*$');
    // matches [ abc -> b ] or [ abc b ]
    let re1 = new RegExp('^\\s*(['+ alp +']+)((\\s*->\\s*)|(\\s+))(.?['+ alp +']+)\\s*$');
    // matches [ \ -> ab ] or [ \ ab ]
    let re2 = new RegExp('^\\s*(\\\\)((\\s*->\\s*)|(\\s+))(.?['+ alp +']+)\\s*$');
    // matches [ ab -> \ ] or [ ab \ ]
    let re3 = new RegExp('^\\s*(['+ alp +']+)((\\s*->\\s*)|(\\s+))(\\\\)\\s*$');
    // matches [ ab -> . ] or [ ab . ]
    let re4 = new RegExp('^\\s*(['+ alp +']+)((\\s*->\\s*)|(\\s+))(.)\\s*$');

    let lines = code.split("\n");

    let lines_n = 0;
    let flag = true;
    lines.forEach(function (line) {
        if (!comment.test(line) && !empty.test(line)) {
            ++lines_n;

            // if line is semantically correct, make it pretty
            // else mark code as incorrect
            let l;
            if (re1.test(line))
                l = line.replace(re1, '$1 -> $5');
            else if (re2.test(line))
                l = line.replace(re2, '$1 -> $5');
            else if (re3.test(line))
                l = line.replace(re3, '$1 -> $5');
            else if (re4.test(line))
                l = line.replace(re4, '$1 -> $5');
            else {
                flag = false;
                l = line;
                //console.log("Wrong line: " + line);
            }
            code = code.replace(line, l);
        }
    });

    ipcRenderer.send('set-code', code);
    return (lines_n > 0) && flag;
}

function checkInput(tm, input) {
    if (input.trim() == "") return true;

    let tm_reg = new RegExp('^['+ tm.replace(" ", "") +']+$');
    return tm_reg.test(input);
}

function checkOutput(tm, output) {
    if (output.trim() == "") return true;

    let regex = new RegExp('^['+ tm.join('') +']+$');
    return regex.test(output);
}

exports.CheckAlphabets = checkAlphabets;
exports.CheckCode = checkCode;
exports.CheckInput = checkInput;
exports.CheckOutput = checkOutput;