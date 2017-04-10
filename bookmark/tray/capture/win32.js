"use strict";

module.exports = Object.create(null, {
    captureUrl: {enumerable: true, get: () => captureUrl},
});

const cp = require("child_process");
const {URL} = require("url");

function captureUrl() {
    return new Promise((f, r) => {
        const cmd = `${__dirname}\\ChromeURL.exe`;
        cp.exec(cmd, (err, stdout, stderr) => {
            if (stdout) {
                const urlText = stdout.startsWith("https://") ? stdout :
                      `http://${stdout}`;
                // check valid URI format with URL ctor
                return f({url: `${new URL(urlText)}`});
            }
            return r(err || stderr || "Couldn't capture chrome url");
        });
    });
}
