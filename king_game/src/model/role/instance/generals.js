/**
 * 查询当前角色全部武将并重置角色战斗力
 * @return {Promise<[]>}
 */
module.exports = async function () {

    const generalsMap = await this.findGenerals();

    // 查询武将信息
    const generals = Object.values(generalsMap);
    const base = {};
    const powers = [];
    const now = Date.now();
    const expireGenerals = [];
    base.general = [];
    let expireNewGname;
    if (this.act.NEW_GENERAL && this.act.NEW_GENERAL.expire <= now){ // 新武将链接时间结束了
        expireNewGname = global.gameconfig.generalname[this.act.NEW_GENERAL.gsid];
        this.act.NEW_GENERAL = null;
        this.markModified(`act.NEW_GENERAL`);
    }
    generals.forEach(g => {
        if (g.expireAt && g.expireAt < now) {
            // 过期了的武将
            expireGenerals.push(g);
            return null;
        }
        if (expireNewGname && global.gameconfig.generalname[g.gsid] === expireNewGname && g.inherit) {
            g.inherit = null; // 释放新武将链接,回归正常武将
            g.save();
        }
        const info = g.base();
        powers.push(info.power);
        base.general.push(info);
    });
    // 过期武将处理
    if (expireGenerals.length > 0) {
        for (const g of expireGenerals) { // 这里过期武将不会太多，目前需求只有1个，所以不存在循环内频繁 await写表的耗时
            if (g.issoul && g.inherit.guid) { // 灵魂武将替换整容
                g._replaceTeam = g.inherit.guid; // 替换本体上阵
            } else {
                g._leaveTeam = 1; // 下阵
            }
            await g.updateBattleSet(); // 更新整容
            await g.remove();
        }
    }

    // 前十武将战力
    powers.sort(function (pre, nxt) {
        return pre > nxt ? -1 : 1;
    });
    // 刷新历史最高战力
    base.power = powers.slice(0, 10).reduce(function (cur, nxt) {
        cur += nxt;
        return cur;
    }, 0);
    this.missionInvoke('POWER_HISTORY', base.power);
    // 刷新历史第二最高战力
    let power_sec = powers.slice(0, 20).reduce(function (cur, nxt) {
        cur += nxt;
        return cur;
    }, 0)
    this.missionInvoke('POWER_HISTORY_SEC', power_sec);
    this._power = base.power;
    await this.save();
    return base.general;
}
