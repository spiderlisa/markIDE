'use strict';

const { BrowserWindow } = require('electron');

class Window extends BrowserWindow {
    constructor({file, windowSettings}) {
        const props = {
            show: false,
            webPreferences: { nodeIntegration: true },
            height: 700,
            width: 1100,
            windowSettings
        };

        super(props);

        this.loadFile(file);

        this.once('ready-to-show', () => {
            this.show()
        });
    }
}

module.exports = Window;