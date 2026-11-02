"use strict"

/**
 * 通用红点
 * @param {Object} role 
 * @returns {Number} dot 可领取奖励数量
 */
module.exports = function (role) {
    if (!this.isactive(role) || !this.params.reward) return 0;
    const reward = this.params.reward;
    let dot = 0;
    const record = role.act[this.type] || {};
    let consumeCount = {};
    const canConsume = (role, reward) => {
        return !reward.consume ||
            // GSID 消耗估算需每项累加起来
            reward.consume.every(({ GSID, COUNT }) => {
                consumeCount[GSID] = consumeCount[GSID] || 0;
                consumeCount[GSID] += COUNT
                return role.getProp(GSID) >= consumeCount[GSID]
            })
    }
    // 默认奖励
    if (
        reward.require &&
        reward.limit - (record.times || 0) > 0 &&
        this.requireCheck(role, "") &&
        canConsume(role, reward)
    ) {
        dot++;
    }
    const proitemKeys = Object.keys(reward).filter(key => key.startsWith("proitem"))
    // 其他奖励
    dot += proitemKeys.filter(key => {
        const item = reward[key]
        const remain = item.limit - (record[key] || { times: 0 }).times
        return remain > 0 && this.requireCheck(role, key) && canConsume(role, item)
    }).length;
    return dot;
}