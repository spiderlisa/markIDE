'use strict';

const { app, ipcMain, Menu, shell, dialog } = require('electron');
const path = require('path');

const Window = require('./window');
let mainWindow;

function main() {
    mainWindow = new Window({
        file: path.join('renderer','index.html')
    });

    ipcMain.on('set-tm', (event, val) => {
        mainWindow.send('set-tm', val)
    });

    ipcMain.on('set-ta', (event, val) => {
        mainWindow.send('set-ta', val)
    });

    ipcMain.on('set-code', (event, val) => {
        mainWindow.send('set-code', val)
    });

    ipcMain.on('set-input', (event, val) => {
        mainWindow.send('set-input', val)
    });

    ipcMain.on('set-output', (event, res) => {
        mainWindow.send('set-output', res)
    });
}

function initMenu() {
    const isMac = (process.platform === 'darwin');
    const template = [
        (isMac ? {
            label: app.getName(),
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideothers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        } : {}), {
            label: 'File',
            submenu: [{
                label: 'New',
                accelerator: 'CmdOrCtrl+N',
                click() {
                    mainWindow.webContents.send('new-file');
                }
            },{
                label: 'Open',
                accelerator: 'CmdOrCtrl+O',
                click() {
                    dialog.showOpenDialog({
                            filters: [{ name: 'NMA files', extensions: ['mi']}],
                            properties: ["openFile"]
                        },
                        (fileNames) => {
                            if(fileNames === undefined){
                                console.log("No file selected");
                                return;
                            }
                            mainWindow.webContents.send('open-file', fileNames[0]);
                    });
                }
            }, {
                label: 'Save',
                accelerator: 'CmdOrCtrl+S',
                click() {
                    mainWindow.webContents.send('save-file');
                }
            }, {
                label: 'Save As',
                accelerator: 'Alt+CmdOrCtrl+S',
                click() {
                    dialog.showSaveDialog({
                        filters: [{ name: 'NMA files', extensions: ['mi']}]
                    }, (fileName) => {
                        if (fileName === undefined){
                            console.log("You didn't save the file");
                            return;
                        }
                        mainWindow.webContents.send('saveas-file', fileName);
                    });
                }
            }]
        }, {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                ...(isMac ? [
                    { type: 'separator' },
                    {
                        label: 'Speech',
                        submenu: [
                            { role: 'startspeaking' },
                            { role: 'stopspeaking' }
                        ]
                    }
                ] : [])
            ]
        }, {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forcereload' },
                { role: 'toggledevtools' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        }, {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'zoom' },
                ...(isMac ? [
                    { type: 'separator' },
                    { role: 'front' },
                    { type: 'separator' },
                    { role: 'window' }
                ] : [
                    { role: 'close' }
                ])
            ]
        }, {
            role: 'help',
            submenu: [{
                label: 'Learn More',
                click () {
                    shell.openExternal('https://github.com/spiderlisa/markIDE')
                }
            }]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

app.on('ready', () => {
    main();
    initMenu();
});

app.on('window-all-closed', app.quit);

app.on('saveas', (event) => {
    console.log("hi");
    dialog.showSaveDialog({
        filters: [{ name: 'NMA files', extensions: ['mi']}]
    }, (fileName) => {
        if (fileName === undefined){
            console.log("You didn't save the file");
            return;
        }
        mainWindow.webContents.send('saveas-file', fileName);
    });
});