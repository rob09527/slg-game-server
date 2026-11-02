'use strict';

module.exports = exports = function (config) {
    let items = []
    for (let x in config) {
        if (x.indexOf('gsid') != -1) {
            items.push({ gsid: config[x], count: config[`count${x[x.length - 1]}`] })
        }
    }
    return items
}