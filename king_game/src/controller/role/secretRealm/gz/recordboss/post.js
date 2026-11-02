'use strict';
const secretTask = require("../../../../../model/secretRealmRole/instance/secretTask");
//当天时间key
function thesameday() {
    // 获取当前日期
    const currentDate = new Date();
    // 提取年、月、日
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // 月份从0开始，所以需要加1，并且确保是两位数
    const day = String(currentDate.getDate()).padStart(2, '0'); // 确保日期是两位数
    // 使用-符号组合成key
    const dateKey = `${year}-${month}-${day}`;
    return dateKey
}
module.exports = async (ctx) => {
    const { bossid } = ctx.request.body;
    let taskconfig = global.gameconfig.secretRealmTask[0].find(e => e.TYPEPARAMS == bossid)
    if (taskconfig) {
        await secretTask(ctx, taskconfig.TASKTYPE, 1)
    }
    let newtaskconfig = global.gameconfig.dailyboss.find(e => e.TYPEPARAMS == bossid)
    if (newtaskconfig) {
        let gsid = newtaskconfig.PMARK
        const count = ctx.role.getProp(gsid);
        let timekey = `addnewtask:${thesameday()}:${ctx.role.rno}}`

        let info = await global.redis.get(timekey)
        if (info && count < newtaskconfig.COMPLETENUM) {
            info = JSON.parse(info)
            if (Object.keys(info)[0] == newtaskconfig.TASKID) {
                ctx.role.addItemsNoSave({ gsid: gsid, count: 1 })
                await ctx.role.save()
            }
        }

    }
};





