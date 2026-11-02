'use strict'

require('rx-apiwheel');

const secretTask = require('../../../../model/secretRealmRole/instance/secretTask');
/**
 *
 * 复用 单独任务开始逻辑
 */
const missionStart = require('../mission/start/post');
const _key = {
    friend: 'friendsMissions',
    solo: 'missions'
};
/**
 * 一键开始悬赏任务
 * @type {exports}
 */
module.exports = exports = async (ctx, next) => {

    ctx.assert(ctx.affairs, 'no mission');
    const type = ctx.request.body.type || 'solo';
    ctx.missionKey = _key[type];
    const missions = ctx.affairs[ctx.missionKey] || [];
    ctx.assert(missions.length, 'no ' + type + ' mission');
    const dispatchData = ctx.request.body.dispatch; // 任务派遣数据
    ctx.assert(dispatchData && Object.keys(dispatchData).length, 'miss data dispatch');
    const callableFriendInfo = {};
    // 循环执行 任务开始
    for (const mission of missions) {
        const arr = dispatchData[mission.mid];
        if (!arr) {
            continue;
        }

        ctx.request.body.arr = arr;
        ctx.mission = mission;
        await missionStart(ctx, next);
        callableFriendInfo[mission.mid] = ctx._friends;
    }
    ctx.affairs.markModified(ctx.missionKey);
    await ctx.affairs.save();
    ctx.body = missions.map(m => { if (callableFriendInfo[m.mid]) m.friends = callableFriendInfo[m.mid]; return m });
}
