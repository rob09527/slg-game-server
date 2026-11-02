
'use strict'
// 获取本层通关奖励
module.exports = exports = async (ctx, next) => {
    // 判断本层是否完成,完成不能领取
    ctx.assert(!ctx.nowchapter.finish, 'no get reward');
    if (ctx.nowchapter.rewards.length > 0) {
        ctx.role.addItemsNoSave(ctx.nowchapter.rewards, { main: 'maze', 'sec': 'pass gate' })
    }
    ctx.nowchapter.finish = Date.now();
    ctx.nowchapter.markModified('finish');
    await ctx.nowchapter.save();
    // 领了本层奖励,则本层通关
    if (ctx.nowchapter.floor < 3) {
        // 设置通关次数
        if (ctx.nowchapter.floor == 1) {
            // 通关第一层记
            ctx.role.addItemsNoSave({ gsid: 90463, count: 1 }, { main: 'maze', sec: 'add mark' });
            // 记录第一层的通关
            if (ctx.role.getItems(90459).count == 0) {
                ctx.role.addItemsNoSave({ gsid: 90459, count: 1 }, { main: 'maze', sec: 'add mark' });
            }
        } else if (ctx.nowchapter.floor == 2) {
            // 通关第二层
            ctx.role.addItemsNoSave({ gsid: 90464, count: 1 }, { main: 'maze', sec: 'add mark' });
            // 记录第一层的通关
            if (ctx.role.getItems(90459).count == 1) {
                ctx.role.addItemsNoSave({ gsid: 90459, count: 1 }, { main: 'maze', sec: 'add mark' });
            }
        }
    } else if (ctx.nowchapter.floor == 3) {
        let gate = ctx.nowchapter.gateid;
        // 新需求，新增累计通关整个远征标记
        ctx.role.addItemsNoSave({ gsid: 90597, count: 1 });
        if (gate.toString().substring(0, 1) > 1) {
            // 困难模式
            if (ctx.role.getItems(90459).count == 3) {
                ctx.role.addItemsNoSave({ gsid: 90459, count: 1 }, { main: 'maze', sec: 'add mark' });
            }
            // 设置通关次数
            ctx.role.addItemsNoSave({ gsid: 90466, count: 1 }, { main: 'maze', sec: 'add mark' });
            // 新需求,通关困难模式,普通关卡第三关也算进度(月度任务)
            ctx.role.addItemsNoSave({ gsid: 90465, count: 1 }, { main: 'maze', sec: 'add mark' });
        } else {
            if (ctx.role.getItems(90459).count == 2) {
                ctx.role.addItemsNoSave({ gsid: 90459, count: 1 }, { main: 'maze', sec: 'add mark' });
            }
            // 设置通关次数
            ctx.role.addItemsNoSave({ gsid: 90465, count: 1 }, { main: 'maze', sec: 'add mark' });
        }
    }
    await ctx.role.save();
    ctx.body = {
        items: ctx.nowchapter.rewards
    }
}