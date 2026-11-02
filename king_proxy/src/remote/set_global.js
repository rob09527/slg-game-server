'use strict'

/**
 * 全局变量
 *
 */

module.exports = async function (value) {
    for(var key in value){
        global.setting[key] = value[key];
    }
    await global.dao.global.update({}, {$set:value}, {upsert: true});
    console.log("global.setting", global.setting)
    return global.setting
}
