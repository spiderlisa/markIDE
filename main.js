'use strict';

const path = require('path');
const { app, ipcMain } = require('electron');

const Window = require('./window');
const Store = require('./datastore');

let mainWindow;

const store = new Store({ name: 'markIDE' });

function main() {
    mainWindow = new Window({
        file: path.join('renderer','index.html')
    });

    //mainWindow.webContents.openDevTools();

    ipcMain.on('set-tm', (event, val) => {
        store.saveTm();
        mainWindow.send('tm', val)
    });

    ipcMain.on('set-ta', (event, val) => {
        store.saveTa();
        mainWindow.send('ta', val)
    });

    ipcMain.on('set-code', (event, val) => {
        store.saveCode();
        mainWindow.send('code', val)
    });

    ipcMain.on('set-input', (event, val) => {
        store.saveInput();
        mainWindow.send('input', val)
    });

    ipcMain.on('set-output', (event, res) => {
        store.saveOutput();
        mainWindow.send('output', res)
    })
}

app.on('ready', main);

app.on('window-all-closed', app.quit);