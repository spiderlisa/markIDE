'use strict';

const { ipcRenderer } = require('electron');

class Algorithm {
    constructor(tm, code, input) {
        console.log("Data:\n"+tm+"\n"+"\n"+code+"\n"+input);

        this.alphabetM = tm.split(" ");
        this.inputString = input;
        this.outputString = input;

        this.rules = [];
        let rows = code.split("\n");
        for(let row of rows) {
            if (row.includes("->")) {
                const parts = row.split(" -> ");
                this.rules.push({
                    l: parts[0],
                    r: parts[1]
                });
            }
        }

        this.steps = [];
        this.end = false;
        this.terminate = false;
    }

    run() {
        let i = 1;
        while(!this.end) {
            this.end = this.noRulesToApply();
            for (let rule of this.rules) {
                if (this.outputString.includes(rule.l) || rule.l==="\\") {
                    this.applyRule(rule, i++);
                    break;
                }
            }
        }

        this.steps = this.steps.sort(function(a, b) { return a.i - b.i; });
        return this.getMessage();
    }

    applyRule(rule, i) {
        // if this rule is FINAL
        if (rule.r.includes(".")) {
            let replacement = rule.r.substring(0, rule.r.length - 1);
            this.outputString = this.outputString.replace(rule.l, replacement);
            this.end = true;
        }
        // if the RIGHT part of rule is EMPTY
        else if (rule.r === "\\") {
            this.outputString = this.outputString.replace(rule.l, "");
        }
        // if the LEFT part of rule is EMPTY
        else if (rule.l === "\\") {
            this.outputString = rule.r + this.outputString;
        }
        // default (neither FINAL, nor contains EMPTY parts)
        else {
            this.outputString = this.outputString.replace(rule.l, rule.r);
        }

        this.checkForEndlessCycle();

        let step = {
            i: i,
            rule: rule.l + " -> " + rule.r,
            result: this.outputString
        };
        this.steps.push(step);
    }

    checkForEndlessCycle() {
        if (this.outputString.length >= 500) {
            this.terminate = true;
            return;
        }

        let steps_ = this.steps.reverse();
        for (let step of steps_) {
            if (this.outputString === step.result) {
                console.log("Repeats " + this.outputString + " " + step.result);
                this.terminate = true;
                break;
            }
        }
    }

    noRulesToApply() {
        for (let rule of this.rules) {
            if (this.outputString.includes(rule.l) || rule.l==="\\")
                return false;
        }
        return true;
    }

    outputInRange() {
        let regex = new RegExp('^[' + this.alphabetM.join('') + ']+$');
        return regex.test(this.outputString);
    }

    getMessage() {
        if (this.terminate)
            return "Endless Cycle Error.\nClick STEPS to see when the process was terminated.\n";

        if (this.end && !this.outputInRange())
            return "Extra Characters Error.\nSome of the characters from the additional alphabet " +
                "made their way into the final word. Add these characters into the main " +
                "alphabet if the result below is satisfactory " +
                "or change the rules to make the characters go away from the final word.\n" +
                "Result: " + this.outputString + "\n";

        if (this.end && this.outputInRange())
            return "Run successful:\n" + this.outputString + "\n";

    }
}

module.exports = Algorithm;