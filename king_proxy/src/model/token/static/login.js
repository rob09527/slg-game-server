'use strict';

const crypto = require('crypto');
/**
 *
 * @param uid
 * @param servid
 * @param option
 * @return {Proxy<{ host: string, port: number,token: string }>}
 */
module.exports = exports = async function (uid, servid, option = {
    gameid: 0,
    platform,
    simulator: '',
    deviceid: '',
    channel: '',
    bundle: '',
    phonetype: '',
    deviceInfo,
    sdkInfo
}) {
    const salt = global.config.TOKENSALT || 'nosalt';
    const now = Date.now();
    const token = crypto.createHash('md5').update(uid + salt + now).digest('base64');
    const serv = this.getGameInstance(servid);

    await this.findOneAndUpdate({
        uid: uid,
        servid: +servid
    }, {
        $set: {
            update: now,
            ...option,
            token: token,
            repeat: 0
        }
    }, {
        upsert: 1, // 无则添加
    })
    return {
        ...serv,
        token: token
    }
}
