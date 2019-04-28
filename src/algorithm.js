'use strict';

const { ipcRenderer } = require('electron');

var alphabetM, alphabetA;
var rules = {};
var inputString, outputString;
var steps = [];
var end = false;
var terminate = false;
var cycleCount = 0;

function runCode(tm, ta, code, input) {
    alphabetM = tm.split(" ");
    alphabetA = ta.split(" ");
    code.split("\n").forEach(function (row) {
        if (row.includes("->"))
            splitRule(row);
    });
    inputString = outputString = input;

    while(!end) {
        end = noRulesToApply();
        for (let rule in rules) {
            if (outputString.includes(rule)) {
                applyRule(rule);
                break;
            }
        }
        console.log(end);
    }

    ipcRenderer.send('set-output', getMessage());

    console.log(steps);
    console.log(cycleCount);
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
    rules[parts[0]] = parts[1];
}

function applyRule(rule) {
    // if this rule is FINAL
    if (rules[rule].includes(".")) {
        let replacement = rules[rule].substring(0, rules[rule].length - 1);
        outputString = outputString.replace(rule, replacement);
        end = true;
    }
    // if the RIGHT part of rule is EMPTY
    else if (rules[rule] === "\\") {
        outputString = outputString.replace(rule, "");
    }
    // if the LEFT part of rule is EMPTY
    else if (rule === "\\") {
        outputString = rules[rule] + outputString;
    }
    // default (neither FINAL, nor contains EMPTY parts)
    else {
        outputString = outputString.replace(rule, rules[rule]);
    }

    checkForEndlessCycle();

    let step = {
        rule: rule + " -> " + rules[rule],
        result: outputString
    };
    steps.push(step);
    console.log(step);
}

function noRulesToApply() {
    for (let rule in rules) {
        if (outputString.includes(rule))
            return false;
    }
    return true;
}

function checkForEndlessCycle() {
    let steps_ = steps.reverse();
    for (let step of steps_) {
        if (outputString == step.result) {
            console.log("repeats " + outputString + " " + step.result);
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