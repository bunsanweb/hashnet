"use strict";

module.exports = Object.create(null, {
    captureUrl: {enumerable: true, get: () => captureUrl},
});

const cp = require("child_process");

function captureUrl() {
    return new Promise((f, r) => {
        const code = `
"use strict";
const app = Application("Google Chrome");
console.log(JSON.stringify({url: app.windows[0].activeTab.url()}));
`;

        const cmd = `osascript -l JavaScript -s o -e '${code}'`;
        cp.exec(cmd, (err, stdout, stderr) => {
            if (err) r(err);
            if (stderr) f(JSON.parse(stderr)); 
        });
    });
}
