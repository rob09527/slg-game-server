'use strict'
const {fpool} = require('../../../util/random');
/**
 * 挑战奖励 or 累计星级奖励
 * @param star {number} 1: 当前挑战关卡挑战的星级
 * @param getStar {number} 0:表示挑战奖励获取，other  查询累计星级奖励
 */
module.exports = function (star = 1, getStar = 0) {
    const expRes = this.chapterRes() || {
        "38006": 0,
        "30001": 0
    };

    const config = global.gameconfig.nmaze.MAP[this.mapid - 1];
    assert(config, 'miss nmaze map config, at' + this.mapid);
    const starConfig = config.EACH_STAR.find(s => s.STAR === star);

    if (!getStar) {

        const rewards = [...starConfig.REWARDS || []];

        for (const gsid in starConfig.RES) {
            const chapterRes = expRes[gsid] || 0;
            // startConfig.STAR_FEE
            // 挑战奖励：玩家当天关卡的铜钱和武将经验的挑战奖励以玩家当前的通关主城ID进行取值；取值需要再进行关卡系数，每一关铜钱和武将经验奖励=
            //                          （（远征当前关卡数-1）*   远征关卡配置的每关系数 +       征战关卡基础奖励值）*     战胜关卡的星级系数

            const count = Math.floor(((this.mapid - 1) * (starConfig.BASE_RES[gsid] || 0) + chapterRes) * starConfig.STAR_FEE);
            if (!count) {
                continue;
            }
            rewards.push({
                COUNT: count,
                GSID: +gsid
            });
        }
        return rewards;
    } else {

        const sConfig = global.gameconfig.nmaze.STAR_BOX[getStar];
        assert(sConfig, 'error star');

        const c = [...sConfig.REWARDS];
        for (const gsid in sConfig.RES) {
            if (!sConfig.RES[gsid]) continue;
            const chapterRes = expRes[gsid] || 0;
            // 2.阶段宝箱奖励（累计星数获得）：武将经验和铜钱奖励=（（远征当前关卡数-1）*远征关卡配置的每关系数+征战关卡基础奖励值）*1.5
            const count = Math.floor(((this.mapid - 1) * (starConfig.BASE_RES[gsid] || 0) + chapterRes) * 1.5);
            if (!count) continue;
            c.push({
                COUNT: count,
                GSID: +gsid
            });
        }
        return c;
    }

}
