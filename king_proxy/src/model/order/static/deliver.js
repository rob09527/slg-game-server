'use strict';

const assert = require('assert');
/**
 * 订单发货函数
 * @param host {string}
 * @param rid {string}
 * @param pid {string}
 * @param orderid {string}
 * @param amount {number}
 * @param bymail {boolean}
 * @param coinpay {boolean}
 * @param _virtual {boolean} 不发 累计
 * @return {Proxy<{ host: string, port: number,token: string }>}
 */
module.exports = exports = async function (host, rid, pid, orderid, amount = 0, bymail, coinpay, _virtual,) {
    let game = global.gameservs[host]; // 角色所在游戏实例
    if (!game) {
        const gameInstances = Object.values(global.gameservs);
        const index = Math.floor(gameInstances.length * Math.random());
        game = gameInstances[index] || gameInstances[0]; // 随机调用一台游戏实例来发货
    }
    assert(game, 'deliver error,no game instances');
    let lang = global.config.LANG ? global.config.LANG : "CN"
    const res = await game.remote.recharge({ rid, pid, orderid, amount, bymail, coinpay, _virtual, lang });
    return res;
}
