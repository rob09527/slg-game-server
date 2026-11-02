'use strict';
const parseCron = require('../../../../util/parse_cron');
/**
 * 提供前端处理功能展示的逻辑
 *
 * @type {function(*, *): Promise<void>}
 */
module.exports = exports = async (ctx, next) => {
    const status = await ctx.dao.north.isInTime();
    const { NEXT_START_TIME, CURRENT_START_TIME, CURRENT_END_TIME, SETTLEMENTTIME } = global.gameconfig.north_fight.CONFIG;
    const nationwarInfo = await ctx.dao.nationwar.findOne({ groupid: ctx.role._gameserv.groupid });
    const { END } = global.gameconfig.ring_rank.CONFIG;
    let ring_end = parseCron(END, 90000000).NEXT_START_TIME // 持续 25个小时开始下一轮
    const w = 604800000;
    if (ring_end - Date.now() > w) {
        ring_end -= w;
    }
    ctx.body = {
        // 皇宫远征匈奴
        EXPEDITION_HUN: {
            lock: status ? 0 : 1,
            etime: CURRENT_END_TIME,
            settlementtime: SETTLEMENTTIME, // 结算时间
            start: CURRENT_START_TIME,
        },
        // 公平演武场 hardcode
        GONGPING_PVP: {
            lock: 0,
            remark: {
                buff: 2171,
            },
            start: 1611991785000, // 开始时间
            settlementtime: 1612368000000, // 结算时间
            etime: 1612454400000, // 结束时间
        },
        PALACE: { // 皇宫
            lock: 0,
            start: 1611849600000, // 1611849600000
            preheat: 1 // 前端用于识别是否展示预告框
        },
        LEGION_PRACTICE: {  // 神将试炼
            lock: 0,
            start: 1613664000000, // 1613664000000
            preheat: 1
        },
        LEGION_WAR: { // 军团站
            lock: 0,
            start: 1612144800000,  //1612144800000
            preheat: 1
        },
        PVP_SUMMIT: {
            lock: 0,
            start: 1613059200000,
            preheat: 1
        },
        NATION_RING: { // 国战擂台时间
            lock: nationwarInfo ? 0 : 1,
            end: ring_end
        }
    };
};
