'use strict';

const { ipcRenderer } = require('electron');
const CodeMirror = require('../src/codemirror');

const checkups = require('../src/checkups');
const algorithm = require('../src/algorithm');

var editor;

$(function () {
    /*editor = CodeMirror.fromTextArea($("#code-area")[0], {
        lineNumbers : true,
        theme : "mdn-like"
    }).on('change',
        checkups.CheckCode(getMainAlph(), getAddtAlph(), getCode()
        // ));*/
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
    checkups.CheckAlphabets(getMainAlph(), getAddtAlph());
    checkups.CheckCode(getMainAlph(), getAddtAlph(), getCode());
    checkups.CheckInput(getMainAlph(), getInput());

    algorithm.RunCode(getMainAlph(), getAddtAlph(), getCode(), getInput());
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

