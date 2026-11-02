'use strict';

module.exports = exports = function (config) {
    let info = {}
    for (let x = 0; x < config.length; x++) {
        let data = config[x]
        data.LV = data.LEVEL
        data.GENERALS = []
        for (let x in data) {
            if (x.indexOf('GLEVEL') != -1) {
                let robot = {
                    CLASS: data[`GCLASS${x[x.length - 1]}`],
                    ID: data[`GID${x[x.length - 1]}`],
                    LV: data[`GLEVEL${x[x.length - 1]}`],
                    POS: data[`GPOS${x[x.length - 1]}`]
                }
                data.GENERALS.push(robot)
            }
        }
        if (!info[data['ID']]) {
            info[data['ID']] = [data]
        } else {
            info[data['ID']].push(data)
        }
    }
    return info
}