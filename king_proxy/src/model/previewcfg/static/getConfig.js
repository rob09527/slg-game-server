'use strict';

/**
 * 定向审核服配置获取
 * @return {Promise<{ appversion: string[], platform: string[],bundle: string[] }>}
 */
module.exports = exports = async function (uid) {
    let ban = await this.findOne({});
    ban = ban || {
        appversion: ["2403011530",]
    }

    return {
        appversion: ban.appversion,
        platform: ban.platform,
        bundle: ban.bundle
    };
}
