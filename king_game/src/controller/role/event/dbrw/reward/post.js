"use strict";

module.exports = async function (ctx, next) {
    const { id } = ctx.request.body;
    const task = ctx.config.find(({ ID }) => ID == id);
    ctx.assert(task, "invalid task");
    const { MARK, NUM, REWARD } = task;
    const countinfo = ctx.role.getProp(MARK);

    const count = countinfo & 0x0000ffff; //  取出低位数据作为进度
    const receiveinfo = (countinfo & 0xffff0000) >> 16; // 取出高位保存的领取记录
    const idoffset = ctx.MARK_EACH_TASK[MARK].findIndex((a) => a === id);
    const isReceive = (receiveinfo >> idoffset) & 0x0001;  // 解释一下 ，16 位以上存领取记录，
    // 17 是这个标记的第一项领取记录,18 位是这个标记的第二项领取记录，19 位则保存第3项,
    // 通过idoffset,也就是同标记奖励项下标来移位

    if (count < NUM) ctx.assert(false, "not finish");
    if (isReceive) ctx.assert(false, "rewarded");

    ctx.role.addItemsNoSave([
        ...REWARD,
        { GSID: MARK, COUNT: 1 << (16 + idoffset) }, // 把领取记录存到高位上面去
    ]);
    await ctx.role.save();
    ctx.body = REWARD;
}
