
'use strict'
const ms = require('ms');
// 购买勇气之证
module.exports = exports = async (ctx, next) => {
    let { time } = ctx.request.body;
    ctx.assert(time > 0, 'invalid count');
    // 3天内才可以购买勇气之证
    ctx.assert(Date.now() + ms('3d') > ctx.role.mazeend, 'no need buy');
    // 增加勇气之证数
    let items = [{ gsid: 38014, count: time }];
    ctx.role.addItemsNoSave(items);
    // 勇气之证
    // 扣除元宝数
    ctx.role.castItemsNoSave({ GSID: 38005, COUNT: time });
    await ctx.role.save();
    // 打印消耗元宝数量日志,勇气之证
    ctx.khlog.ybcastprint('proof_of_courage', ctx.role.uid, { gsid: 38005, count: time });
    ctx.body = {
        items
    };

}