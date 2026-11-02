'use strict';
/**
 * 灵魂武将 灵魂链接
 * @type {exports}
 */
module.exports = exports = async (ctx, next) => {

    const {bind} = ctx.request.body;

    if (ctx.role.act.NEW_GENERAL && ctx.role.act.NEW_GENERAL.expire > Date.now()) { // 新武将灵魂武将有效时间内
        ctx.IS_NEW_GENERAL_GENERAL = global.gameconfig.generalname[ctx.general.gsid] === global.gameconfig.generalname[ctx.role.act.NEW_GENERAL.gsid];
        // 判断活动武将和客户端传递过来的是同一个武将
        if (  ctx.IS_NEW_GENERAL_GENERAL ) {
            // 得到新武将活动的灵魂属性
            ctx.general.inherit = ctx.general.inherit || {time: 0};
            ctx.general.inherit.prop = ctx.role.act.NEW_GENERAL.inherit_prop; // 得到灵魂属性
        }

    }
    ctx.assert(ctx.general.inherit && ctx.general.inherit.prop.includes('exclusive'), 'not lh general'); // 非灵魂武将不能进行链接

    let castitems;

    if (bind) {
        // 绑定
        ctx.assert(ctx.general.inherit.guid !== bind, 'not change');
        const bindGeneral = await ctx.role.findGenerals(bind);
        ctx.assert(bindGeneral && bindGeneral.rid === ctx.role.i(), 'bind general not exist');
        ctx.general._bind = bindGeneral;
        ctx.general._leaveTeam = 1; // 绑定的时候退出队伍,玩家需要重新上阵
        ctx.general.inherit.guid = bindGeneral._id.toString();
        const time = Math.min(ctx.general.inherit.time || 0, gameconfig.others.GENERAL_BIND.length - 1);
        castitems = gameconfig.others.GENERAL_BIND[time];
        ctx.general.inherit.time = Number(ctx.general.inherit.time) || 0;
        ctx.general.inherit.time++;
    } else {

        // ctx.general._leaveTeam = 1; // 退出队伍
        // 解绑
        ctx.assert(ctx.general.inherit.guid, 'not bind');

        ctx.general._replaceTeam = ctx.general.inherit.guid; // 队伍替换,替换本体上整
        ctx.general._bind = null;
        ctx.general.inherit.guid = "";
        castitems = gameconfig.others.GENERAL_UNBIND; // 解绑消耗
        if( ctx.IS_NEW_GENERAL_GENERAL) { // 如果是新武将活动的灵魂武将，解绑过后要变成普通武将
            ctx.general.inherit = null;
        }

    }

    ctx.body = {
        general: ctx.general.base(),
    };

    if (castitems) {
        ctx.body.castitems = Array.isArray(castitems) ? castitems : [castitems];
    }
    await next();
};
