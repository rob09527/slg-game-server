"use strict";

// 此轮卧龙战令过期时刷新下一轮
module.exports = async function (role) {
    const { OPEN = 0 } = global.gameconfig.warorder;
    if(OPEN == 0) return false;
    const rid = role.i();
    const one = await this.findOne({ rid }, { end: 1, cycle: 1 });
    if (!one || Date.now() < one.end) return false;
    const data = this.data(rid, one.cycle + 1);
    if (!data) return;
    // 重刷数据
    await one.updateOne({
        $inc: {
            cycle: 1,
        },
        $set: data,
    })
    const { TASKS, WDMARK } = global.gameconfig.warorder;
    // 清理战令经验
    role.castItemsNoSave({ GSID: WDMARK, COUNT: role.getProp(WDMARK) });
    // 清理任务标记
    for (const { MARK } of TASKS) {
        const cur = role.getProp(MARK);
        if (cur == 0) continue;
        role.castItemsNoSave({ GSID: MARK, COUNT: cur });
    }
    console.error("WARORDER REFRESH", role.servid, role.uid, one.cycle + 1, new Date().toLocaleString());
    return true;
}