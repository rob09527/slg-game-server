'use strict'
// 
//获取语言配置
module.exports = async function () {
    return global.config.LANG || "CN";
}
