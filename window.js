'use strict';

const { BrowserWindow } = require('electron');

const defaultProps = {
    show: false
};

class Window extends BrowserWindow {
    constructor({file, windowSettings}) {
        super({ webPreferences: { nodeIntegration: true },
                windowSettings});

        this.loadFile(file);

        this.once('ready-to-show', () => {
            this.show()
        })
    }
}

module.exports = Window;