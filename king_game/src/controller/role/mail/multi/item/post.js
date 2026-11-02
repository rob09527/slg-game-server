'use strict';

module.exports = exports = async (ctx, next) => {
    let items = [];
    const match = {rid: ctx.role.i(), type: 2, state: {$lt: 2}};
    let ids = ctx.request.body.arr;
    // 领取单个邮件
    if(ids && ids.length === 1) match._id = { $in: ids };
    // 批量邮件领取改为 一键领取所有
    ctx.mails = await ctx.dao.mail.find(match);
    ctx.assert(ctx.mails.length, 'no mail');

    for (const mail of ctx.mails) {
        mail.unpackNotify().catch(console.error);
        items.append(mail.reward);
    }

    ctx.body = items.arrange();
    ctx.role._NO_LAMP_ = true; // 标记不要进行跑马灯通知
    ctx.role.addItemsNoSave(ctx.body, 'mail');
    await ctx.dao.mail.updateMany(match, {$set: {state: 2}});
    await ctx.role.save();
};
