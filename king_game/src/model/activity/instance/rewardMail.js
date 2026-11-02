"use strict"

/**
 * 活动结束后没有领取的奖励通过邮件发放
 * @param {object} role 角色
 * @return {number} 没领取的奖励的数量
 */
module.exports = async function (role) {
    if(!Date.in(this.start, this.etime)) return 0; // 活动结束则不检查和补偿奖励
    // 这个时间点前创建的角色不予返还
    if(role.create < Date.parse("2020-10-08 00:00")) return 0;
    if (this.isactive(role)) return 0; // 还在激活期的不予返还
    if (!this.params.reward || !this.mtitle || !this.mcontent) return 0; // 直接领奖并且配有邮件文案的活动才行
    const keys = Object.keys(this.params.reward).filter(key => key.startsWith("proitem"));
    const act = role.act || {};
    act[this.type] = act[this.type] || {};
    act[this.type]["times"] = act[this.type]["times"] || 0;
    const defaultTime = this.params.reward.limit - act[this.type]["times"];
    let rewards = [];
    const logsKey = [];
    // 默认奖励
    if (defaultTime > 0 && this.requireCheck(role)) {
        rewards.push(...Array.from({ length: defaultTime }).fill(this.params.reward.items).reduce((sum, cur) => sum.concat(cur)));
        act[this.type]["times"]++;
        logsKey.push("default");
    }
    // 其他奖励
    for (const key of keys) {
        if (!this.requireCheck(role, key)) continue;
        act[this.type][key] = act[this.type][key] || { times: 0 };
        const diff = this.params.reward[key].limit - act[this.type][key]["times"];
        if (diff < 1) continue;
        rewards.push(...Array.from({ length: diff }).fill(this.params.reward[key].items).reduce((sum, cur) => sum.concat(cur)))
        act[this.type][key]["times"]++;
        logsKey.push(key);
    }
    if (rewards.length > 0) {
        rewards = rewards.arrange();
        await global.dao.mail.insertMany([{
            type: 2, rid: role.i(),
            title: this.mtitle,
            content: this.mcontent,
            reward: rewards,
        }])
        role.markModified("act." + this.type);
        console.error("REWARDMAIL", this.type.toUpperCase(), role.servid, role.uid, logsKey.join(" "));
    }
    return logsKey.length;
}