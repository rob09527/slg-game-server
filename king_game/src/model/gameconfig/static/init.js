'use strict';

/**
 * 重载数据库配置的配置
 */
module.exports = exports = async function () {
    const configReplace = await this.findOne();
    if (!configReplace) {
        return;
    }
    for (const k in configReplace.config) {
        if (Array.isArray(global.gameconfig[k]) || Array.isArray(configReplace.config[k])) {
            global.gameconfig[k] = configReplace.config[k];
        } else {
            global.gameconfig[k] = Object.assign((global.gameconfig[k] || {}), configReplace.config[k]);
        }
        //将独立出来的新手周活动配置 和 周活动合并，就不用修改代码里面新手周活动配置读取了，代码里面太多新手配置读取原来的zhd了，每个都去改有点虚 还不如就直接合并吧.哈哈哈哈哈，这样稳一点.....
        if(k == 'zhd') Object.assign((global.gameconfig[k] || {}), (global.gameconfig[k+"_xs"] || {}));
        console.log('INIT GAMECONFIG AT PID:', global.PROCESS_KEY, k);
    }
    return "OK";
};
