
'use strict'
const ms = require('ms');
// 购买武将功勋
module.exports = exports = async (ctx, next) => {
    let { time } = ctx.request.body;
    ctx.assert(time > 0, 'invalid count');
    // 3天内才可以购买武将功勋
    ctx.assert(Date.now() + ms('3d') > ctx.role.bountyend, 'no need buy');
    // 增加功勋数
    let items = [{ gsid: 38013, count: time }];
    ctx.role.addItemsNoSave(items);
    // 武将功勋
    // 扣除元宝数
    ctx.role.castItemsNoSave({ GSID: 38005, COUNT: time});
    ctx.role.save();
    // 打印消耗元宝数量日志,武将功勋
    ctx.khlog.ybcastprint('general_exploit', ctx.role.uid, { gsid: 38005, count: time});
    ctx.body = {
        items
    };

}