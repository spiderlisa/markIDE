const Store = require('electron-store');

class DataStore extends Store {
    constructor (settings) {
        super(settings);

        this.tm = this.get.tm || "";
        this.ta = this.get.ta || "";
        this.code = this.get.code || "";
        this.input = this.get.input || "";
        this.output = this.get.output || ""
    }

    saveTm() {
        this.set('tm', this.tm);
        return this
    }

    getTm() {
        this.tm = this.get('tm');
        return this
    }

    saveTa() {
        this.set('ta', this.ta);
        return this
    }

    getTa() {
        this.ta = this.get('ta');
        return this
    }

    saveCode() {
        this.set('code', this.code);
        return this
    }

    getCode() {
        this.code = this.get('code');
        return this
    }

    saveInput() {
        this.set('input', this.input);
        return this
    }

    getInput() {
        this.input = this.get('input');
        return this
    }

    saveOutput() {
        this.set('output', this.output);
        return this
    }

    getOutput() {
        this.output = this.get('output');
        return this
    }
}

module.exports = DataStore;