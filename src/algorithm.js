'use strict';

const { ipcRenderer } = require('electron');

var alphabetM, alphabetA;
var inputString, outputString;
var rules = [];
var steps = [];
var end = false;
var terminate = false;

function runCode(tm, ta, code, input) {
    alphabetM = tm.split(" ");
    alphabetA = ta.split(" ");
    code.split("\n").forEach(function (row) {
        if (row.includes("->"))
            splitRule(row);
    });
    inputString = outputString = input;

    console.log(rules);

    let i = 1;
    while(!end) {
        end = noRulesToApply();
        for (let rule of rules) {
            if (outputString.includes(rule.l) || rule.l==="\\") {
                applyRule(rule, i++);
                break;
            }
        }
    }

    steps = steps.sort(function(a, b) { return a.i - b.i; });
    console.log(steps);
    ipcRenderer.send('set-output', getMessage());
}

function getMessage() {
    if (terminate)
        return "Endless Cycle Error.\nClick STEPS to see when the process was terminated.\n";

    if (end && !outputInRange())
        return "Extra Characters Error.\nSome of the characters from the additional alphabet " +
            "made their way into the final word. Add these characters into the main " +
            "alphabet if the result below is satisfactory " +
            "or change the rules to make the characters go away from the final word.\n" +
            "Result: " + outputString + "\n";

    if (end && outputInRange())
        return "Run successful:\n" + outputString + "\n";

}

function splitRule(rule) {
    const parts = rule.split(" -> ");
    rules.push({
        l: parts[0],
        r: parts[1]
    });
}

function applyRule(rule, i) {
    // if this rule is FINAL
    if (rule.r.includes(".")) {
        let replacement = rule.r.substring(0, rule.r.length - 1);
        outputString = outputString.replace(rule.l, replacement);
        end = true;
    }
    // if the RIGHT part of rule is EMPTY
    else if (rule.r === "\\") {
        outputString = outputString.replace(rule.l, "");
    }
    // if the LEFT part of rule is EMPTY
    else if (rule.l === "\\") {
        outputString = rule.r + outputString;
    }
    // default (neither FINAL, nor contains EMPTY parts)
    else {
        outputString = outputString.replace(rule.l, rule.r);
    }

    checkForEndlessCycle();

    let step = {
        i: i,
        rule: rule.l + " -> " + rule.r,
        result: outputString
    };
   steps.push(step);
}

function noRulesToApply() {
    for (let rule of rules) {
        if (outputString.includes(rule.l) || rule.l==="\\")
            return false;
    }
    console.log("No rules to apply");
    return true;
}

function checkForEndlessCycle() {
    if (outputString.length >= 500) {
        terminate = true;
        return;
    }

    let steps_ = steps.reverse();
    for (let step of steps_) {
        if (outputString == step.result) {
            console.log("Repeats " + outputString + " " + step.result);
            terminate = true;
            break;
        }
    }
}

function outputInRange() {
    let regex = new RegExp('^[' + alphabetM.join('') + ']+$');
    return regex.test(outputString);
}

exports.RunCode = runCode;
exports.GetSteps = steps;