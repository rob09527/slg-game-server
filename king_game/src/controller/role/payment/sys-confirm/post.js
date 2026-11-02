
'use strict'
const rechange = require('../../../../remote/recharge/post');
module.exports = exports = async function (ctx, next) {
    ctx.assert(global.config.GANGER_NO_ORDER === true, 'api warning');
    // 加一层保险,避免配置问题导致的风险, 服务id 需为 9000+
    ctx.assert(Math.floor(ctx.role.servid / 1000) === 9, 'you are not tester');
    ctx.request.body.pid = CACHE[ctx.request.body.orderid];
    console.error('ctx.request.body.pid ', ctx.request.body.pid);
    console.log('ctx.request.body.orderid', ctx.request.body.orderid);
    console.log('CACHE', CACHE);
    ctx.assert(ctx.request.body.pid, 'pid "invalid');
    ctx.request.body.rid = ctx.role.i();
    delete CACHE[ctx.request.body.orderid];
    await rechange(ctx, next);
}
