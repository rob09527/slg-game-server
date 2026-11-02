
'use strict'

const moment = require('moment');

module.exports = async (ctx, next) => {
    let TYPE_MATCH = ['gz', 'dj', 'gx'];
    let {
        type,
    } = ctx.request.body;
    ctx.assert(TYPE_MATCH.includes(type), 'invalid type');
    ctx.KEY = (ctx.role.isXS(`xs_zztjj_${type}`) ? `xs_zztjj_${type}` : `zztjj_${type}`)
    let zhd = global.ACTIVITY[ctx.KEY].getInterval(ctx.role);
    let [start, end] = [zhd.start, zhd.etime];
    let zzzjj_time = moment(moment(end).format('YYYY-MM-DD')).diff(moment(start).format('YYYY-MM-DD'),'days');
    let nowzzzjj_time = moment(moment().format('YYYY-MM-DD')).diff(moment(start).format('YYYY-MM-DD'),'days');
    ctx.zzzjj_time = nowzzzjj_time > zzzjj_time ? zzzjj_time : nowzzzjj_time
    ctx.KEY = ctx.role.isXS(`xs_zztjj_${type}`) ? ctx.role.isXSConKey( ctx.KEY).toUpperCase(): ctx.KEY.toUpperCase();
    ctx.config = global.gameconfig.zhd[ctx.KEY.toUpperCase()];
    await next()
}
