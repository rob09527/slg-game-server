'use strict'
/**
 * 关卡盒子(每3关一个产出，代码逻辑看配置MAP_BOX
 */
module.exports = function () {
    let boxreward = null;
    const role = this._role;
    // 关卡奖励盒子
    const mapBoxConfig = global.gameconfig.nmaze.MAP_BOX[this.mapid];
    if (mapBoxConfig) {
        boxreward = [...mapBoxConfig.REWARDS || []];
        const expRes = this.chapterRes();
        if (!expRes) { // 没有拓展资源直接返回固定奖励
            return boxreward;
        }
        for (const gsid in expRes) {
            if (!mapBoxConfig.RES[gsid]) { // 当前远征关卡的盒子产出拓展资源判定
                continue;
            }
            if (!expRes[gsid]) { // 征战拓展资源判定
                continue;
            }

            // 策划算法解释：武将经验和铜钱奖励=关卡基础奖励数量*第1关的3星奖励系数
            const count = Math.floor(expRes[gsid] * global.gameconfig.nmaze.MAP[0].EACH_STAR[2].STAR_FEE);
            if (!count) {
                continue;
            }
            boxreward.push({
                COUNT: count,
                GSID: +gsid
            });
        }
    }
    return boxreward;
}
