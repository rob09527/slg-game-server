'use strict';
const ms = require('ms');
const moment = require('moment');
// 计算下次刷新时间戳
let whichtime = (time, cyc) => {
    // cycle - 刷新间隔
    let cycle = ms(cyc);
    // createDayStart - 角色创建当天00:00
    let createDayStart = moment(time).startOf('day').valueOf();
    // del - 第几次刷新
    const del = (Date.now() - createDayStart) / cycle;
    return createDayStart + Math.ceil(del) * cycle;
};

/**
 * 返回一些玩法的时间
 *
 * @type {function(*, *): Promise<void>}
 */
module.exports = exports = async (ctx, next) => {

    let myserver = await ctx.dao.gameserver.findOne({servid: ctx.role.servid});
    ctx.assert(myserver, 'invalid servid');
    ctx.body = {
        MAZE_ETIME: { // 远征结束时间
            etime: whichtime(ctx.role.create, '2d'),
        },
        YUANGU_ETIME: { // 远古结束时间
            etime: whichtime(moment(myserver.start).startOf('day').valueOf(), global.gameconfig.chapter_boss_yuangu.BY_SERVER_TIME + 'd'),
        },
    };
};
