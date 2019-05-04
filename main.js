'use strict';

const path = require('path');
const { app, ipcMain, Menu, shell } = require('electron');

const Window = require('./window');
let mainWindow;

function main() {
    mainWindow = new Window({
        file: path.join('renderer','index.html')
    });

    //mainWindow.webContents.openDevTools();

    ipcMain.on('set-tm', (event, val) => {
        mainWindow.send('tm', val)
    });

    ipcMain.on('set-ta', (event, val) => {
        mainWindow.send('ta', val)
    });

    ipcMain.on('set-code', (event, val) => {
        mainWindow.send('code', val)
    });

    ipcMain.on('set-input', (event, val) => {
        mainWindow.send('input', val)
    });

    ipcMain.on('set-output', (event, res) => {
        mainWindow.send('output', res)
    })
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
                    //ipcMain.send('open-file-dialog');
                }
            },{
                label: 'Open',
                accelerator: 'CmdOrCtrl+O',
                click() {
                    ipcMain.send('open-file-dialog');
                }
            }, {
                label: 'Save',
                accelerator: 'CmdOrCtrl+S',
                click() {

                }
            }, {
                label: 'Save As',
                accelerator: 'Alt+CmdOrCtrl+S',
                role: 'save-dialog'
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