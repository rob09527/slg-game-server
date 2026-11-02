"use strict";

// 信息接口
module.exports = async function (ctx, next) {
    const { price, reward, buytime = 0 } = ctx.war.charge;
    const { get, cost } = ctx.war.levelbuy;
    const { WDMARK } = global.gameconfig.warorder;
    const wdexp = ctx.role.getProp(WDMARK);
    let currentLevel = Math.trunc(wdexp / get) + 1;
    currentLevel = Math.min(currentLevel, ctx.war.wdlevel.length); // 不能超出最大等级
    ctx.body = {
        wdexp,
        level: currentLevel,
        charge: { price, reward, buytime },
        levelbuy: { get, cost },
        wdlevel: ctx.war.wdlevel.map(({ nget = 0, hget = 0, level, ...o }) => {
            if (currentLevel >= level && nget != 2) {
                nget = 1;
            }
            if (buytime > 0 && currentLevel >= level && hget != 2) {
                hget = 1;
            }
            return { nget, hget, level, ...o };
        }),
        tasks: ctx.tasks.map(({
            TYPE: type, INTRO: intro,
            MARK: mark, NUM,
            PAGE: page, REWARD: reward,
            NUM: num,
        }) => {
            let count = ctx.role.getProp(mark);
            return {
                type:type, intro, mark, page, reward,
                // 0-未完成 1-已完成为领取 2-已领取
                status: count < NUM ? 0 : (count == NUM ? 1 : 2),
                num,
                curnum: Math.min(count, num), // 当前完成任务数量
            }
        })
    }
}