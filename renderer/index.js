'use strict';

const { ipcRenderer } = require('electron');
var fs = require('fs');

var Algorithm = require('./src/algorithm');
var checkups = require('./src/checkups');

var curr_alg;
var curr_filepath;

$(function () {
    curr_filepath = null;

    // Code area validation
    $.fn.form.settings.rules.codeCheck = function(value) {
        return checkups.CheckCode(getMainAlph(), getAddtAlph(), value);
    };

    // Word input validation
    $.fn.form.settings.rules.inputCheck = function(value) {
        return checkups.CheckInput(getMainAlph(), value);
    };

    // Main form validation
    $('.ui.form').form({
        on: "blur",
        fields: {
            tm: {
                identifier: 'alph-main',
                rules: [{
                    type: 'empty',
                }]
            },
            code: {
                identifier: 'code-area',
                rules: [{
                    type: 'codeCheck',
                }]
            },
            input: {
                identifier: 'word-input',
                rules: [{
                    type: 'inputCheck',
                }]
            }},
        onInvalid: function () {
            $("#run-btn").addClass("disabled");
        },
        onValid: function () {
            $("#run-btn").removeClass("disabled");
        }
    }).submit(function (e) {
        e.preventDefault();
        $("#run-btn").click();
        return false;
    });

    $("#alph-main").change(function () {
        checkups.CheckAlphabets(getMainAlph(), getAddtAlph());
    });

    $("#alph-addt").change(function () {
        checkups.CheckAlphabets(getMainAlph(), getAddtAlph());
    });

    $("#code-area").change(function () {
        checkups.CheckCode(getMainAlph(), getAddtAlph(), getCode());
    });

    $("#word-input").change(function () {
        checkups.CheckInput(getMainAlph(), getInput());
    });

    $("#run-btn").click(function () {
        curr_alg = new Algorithm(getMainAlph(), getCode(), getInput());
        $("#output-area").val(curr_alg.run());

        $("#steps-btn").removeClass('hidden');
    });

    $("#steps-btn").click(function () {
        let out_area = $("#output-area");
        let curr_text = out_area.val();

        if (curr_text.includes("Steps:")) {
            curr_text.replace('/^(\nSteps:).*$/', '');
            console.log(curr_text);
            out_area.val(curr_text);
        } else {
            let steps = curr_alg.steps;
            let steps_text = '';
            steps.forEach(function (step) {
                steps_text += ("\n" + step.i + ". " + step.rule + "  =>  " + step.result);
            });

            if (steps_text==='')
                steps_text = 'No steps have been made.';
            else
                steps_text = 'Steps:' + steps_text;

            out_area.val(curr_text + '\n' + steps_text);
        }
    });

});

ipcRenderer.on('tm', (event, value) => {
    $("#alph-main").val(value)
});

ipcRenderer.on('ta', (event, value) => {
    $("#alph-addt").val(value)
});

ipcRenderer.on('code', (event, value) => {
    $("#code-area").val(value)
});

ipcRenderer.on('output', (event, value) => {
    $("#output-area").val(value)
});

ipcRenderer.on('new-file', (event) => {
    curr_filepath = null;
    $('.ui.form').form('reset');
    setBreadcrumb("New algorithm");
});

ipcRenderer.on('open-file', (event, path) => {
    $('.ui.form').form('reset');
    fs.readFile(path, 'utf-8', (err, data) => {
        if(err){
            alert("An error occurred reading the file :" + err.message);
            return;
        }
        console.log(data);
        fillWithContent(data);
        curr_filepath = path;
        setBreadcrumb(path);
    });
});

ipcRenderer.on('save-file', (event) => {
    if (!curr_filepath) {
        console.log(event.sender);
        event.sender.send('saveas');
    } else {
        let content = contentToTxt();
        fs.writeFile(curr_filepath, content, (err) => {
            if(err){
                console.log("An error occurred creating the file " + err.message);
            }
            console.log("The file has been successfully saved");
        });
    }
});

ipcRenderer.on('saveas-file', (event, path) => {
    let content = contentToTxt();
    fs.writeFile(path, content, (err) => {
        if(err){
            console.log("An error occurred creating the file " + err.message);
        }
        console.log("The file has been successfully saved");
        curr_filepath = path;
        setBreadcrumb(path);
    });
});

function getMainAlph() {
    return $("#alph-main").val();
}

function getAddtAlph() {
    return $("#alph-addt").val();
}

function getCode() {
    return $("#code-area").val();
}

function getInput() {
    return $("#word-input").val();
}

function fillWithContent(content) {
    let lines = content.split("\n");
    $("#alph-main").val(lines[0]);
    $("#alph-addt").val(lines[1]);
    $("#word-input").val(lines[2]);

    let code = "";
    lines.forEach(function (l, i) {
        if (i>2)
            code += l + "\n";
    });
    $("#code-area").val(code);
}

function contentToTxt() {
    let text = getMainAlph() + "\n";
    text += getAddtAlph() + "\n";
    text += getInput() + "\n";
    text += getCode();
    return text;
}

function setBreadcrumb(path) {
    let html = "";
    let parts = path.split(/[\\\/]/);
    parts.forEach(function (p, i) {
        if (i === parts.length-1)
            html += '<div class="active section">'+p+'</div>';
        else
            html += '<div class="section">'+p+'</div><div class="divider"> / </div>';
    });
    console.log(html);
    $(".ui.breadcrumb").html(html);
}