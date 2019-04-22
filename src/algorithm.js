'use strict';

const { ipcRenderer } = require('electron');

var alphabetM, alphabetA;
var rules = {};
var inputString, outputString;
var history = [];
var end = false;

function runCode(tm, ta, code, input) {
    alphabetM = tm.split(" ");
    alphabetA = ta.split(" ");

    code.split("\n").forEach(splitRule);

    inputString = outputString = input;

    while(!end) {
        checkForFinish();
        for (let rule in rules) {
            applyRule(rule);
            if (end) break;
        }
    }

    var message;
    if (normalConversionFailed())
        message = "Conversion unsuccessful (extra symbols were left after applying rules): ";
    else
        message = "Conversion successful: ";
    ipcRenderer.send('set-output', message + "\n" + outputString);

    console.log(history);
}

function splitRule(rule) {
    const parts = rule.split(" -> ");
    rules[parts[0]] = parts[1];
}

function applyRule(rule) {
    while (outputString.includes(rule) && !end) {
        makeStep(rule);
    }
}

function makeStep(rule) {
    if (rules[rule]==="\\") {
        outputString = outputString.replace(rule, "");
    } else if (rules[rule].includes(".")) {
        end = true;
        outputString = outputString.replace(rule, rules[rule].substring(0, rules[rule].length-1));
    } else
        outputString = outputString.replace(rule, rules[rule]);

    history.push(outputString);
}

function checkForFinish() {
    let flag = true;
    for (let rule in rules) {
        if (outputString.includes(rule))
            flag = false;
    }
    end = flag;
}

function normalConversionFailed() {
    alphabetA.forEach(function (a) {
        if (outputString.includes(a))
            return true;
    });
    return false;
}

exports.RunCode = runCode;