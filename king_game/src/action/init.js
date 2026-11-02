const fs = require("fs");
const path = require("path");

/**
 * 初始化 actions
 * @return {Promise<any>}
 */
module.exports = async function () {
    const ACTIONS = {};
    const BASE_PATH = __dirname;
    var sepReg
    if (global.config.windows) {
        let text = "\\"
        sepReg = text.replace(/\\/g, "\\");
    } else {
        sepReg = new RegExp(path.sep, 'g');
    }
    // const sepReg = new RegExp(path.sep, 'g');
    const readAction = (p) => {
        for (const f of fs.readdirSync(p)) {
            if (f === 'init.js') {
                continue;
            }
            const clientPath = path.join(p, f);
            if (fs.statSync(clientPath).isDirectory()) {
                readAction(clientPath);
            }
            if (f.endsWith('.js')) { //
                const actionName = clientPath.replace(BASE_PATH + path.sep, '').replace(sepReg, '_').replace('.js', ''); // 替换分割符号为 _;

                ACTIONS[actionName.toUpperCase()] = require(clientPath);
            }
        }
    }
    readAction(BASE_PATH);

    return ACTIONS;
}
