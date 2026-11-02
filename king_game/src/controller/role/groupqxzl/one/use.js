'use strict'

const moment = require('moment');
const config = {
    1:'qxzlonecopy',
    2:'qxzlgroupcopy',
    3:'qxzlhidecopy',
}

module.exports = exports = async (ctx, next) =>{
    let { type } = ctx.request.body;
    ctx.config = global.gameconfig[config[type]];
	let weekday = moment().weekday();
    let time = ctx.config?.TIME[weekday];
    let hour = moment().hours();
    ctx.assert(time && time.OPEN && hour >= time.START && hour < time.END, '101');

    let startTime = time.TYPE == 0 ? moment(ctx.role.create).startOf('days').valueOf() : moment(ctx.role._gameserv.start).startOf('days').valueOf();
    let endTime = startTime + (parseInt(time.TYPEDAY) - 1) * 24 * 3600 * 1000;
    let now = Date.now();
    ctx.assert(now >= endTime && ctx.role.level >= time.LEVEL, '109');

    let rid = ctx.role._id.toString();
    ctx.qxzl = await ctx.dao.c_qxzl.findOne({rid, type:type == 1 ? 1 : 2});
    ctx.assert(ctx.qxzl, 'no date');
    await next();
}