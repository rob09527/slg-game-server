'use strict';
const fetchMobBossInfo = require('../../../../../role/legion/my/war/mob/boss/info/post');

// 查询大龙信息(供对手查询
module.exports = exports = async function (ctx, next) {
    const {legion} = ctx.request.body;
    ctx.boss = await ctx.dao.lwmboss.fetch(legion);
    await fetchMobBossInfo(ctx, next);
};
