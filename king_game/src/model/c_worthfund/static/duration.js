"use strict"

// 活动开启关闭时间
module.exports = async function (role) {
    let worth = await this.fetch(role);
    let now = Date.now();
    if (worth) {
        const { LIMITHOUR } = global.gameconfig.worthfund;
        // 购买了基金并且在有效期内
        if (worth.fend > now) return [worth.fstart, worth.fend];
        // 没购买基金并且在限购期内
        if (worth.lend > now) return [worth.lstart, worth.lend];
        // 限购期已过，下次再出现的时间
        return [worth.tnext, worth.tnext + LIMITHOUR * 3600 * 1000];
    }
    return [0, 0];
}