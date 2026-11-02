'use strict';

module.exports = exports = function (config, type) {
    if (type == 'mj') {
        secretRealmGz(config)
        return
    }
    if (type == 'mj0') {
        secretRealmGz_0(config)
    }
    if (!type) {
        for (let x = 0; x < config.length; x++) {
            let data = config[x]
            data.item = []
            for (let x in data) {
                if (x.indexOf('gsid') != -1) {
                    data.item.push({ gsid: data[x], count: data[`count${x[x.length - 1]}`] })
                } else if (x.indexOf('GSID') != -1) {
                    data.item.push(({ gsid: data[x], count: data[`COUNT${x[x.length - 1]}`] }))
                }
            }
        }
    } else if (type == 1) {
        for (let x = 0; x < config.length; x++) {
            let data = config[x]
            data.item = []
            for (let x in data) {
                if (x.indexOf('gsid') != -1) {
                    data.item.push({ gsid: data[x], count: data[`count_${x[x.length - 1]}`] })
                } else if (x.indexOf('GSID') != -1) {
                    data.item.push(({ gsid: data[x], count: data[`COUNT_${x[x.length - 1]}`] }))
                }
            }
        }
    }


    return
}


function secretRealmGz(config) {
    for (let x = 0; x < config.length; x++) {
        let data = config[x]
        data.item = []
        for (let x in data) {
            if (x.indexOf('itemid') != -1) {
                data.item.push({ gsid: data[x], count: data[`num${x[x.length - 1]}`] })
            } else if (x.indexOf('ITEMID') != -1) {
                data.item.push(({ gsid: data[x], count: data[`NUM${x[x.length - 1]}`] }))
            }
        }
    }
}

function secretRealmGz_0(config) {
    for (let x = 0; x < config.length; x++) {
        let data = config[x]
        data.item = []
        for (let x in data) {
            let item = []
            if (x.indexOf('itemid') != -1) {
                item.push({ gsid: data[x], count: data[`num${x[x.length - 1]}`] })
                item.push({ gsid: data["exp"], count: data[`expcount_${x[x.length - 1]}`] })
                data.item[x[x.length - 1]] = item

            } else if (x.indexOf('ITEMID') != -1) {
                item.push(({ gsid: data[x], count: data[`NUM${x[x.length - 1]}`] }))
                item.push(({ gsid: data[`EXP_${x[x.length - 1]}`], count: data[`EXPCOUNT_${x[x.length - 1]}`] }))
                data.item[x[x.length - 1]] = item
            }

        }
    }
}