"use strict";

module.exports = async function (ctx, next) {
    ctx.body = ctx.config.map(({
        ID: id, TYPE: type, INTRO: intro,
        MARK, NUM: num, REWARD: reward,
        PAGEID: pageid,
    }) => {
        const countinfo = ctx.role.getProp(MARK); // 如果进度大于 65535 会影响判断
        const count = countinfo & 0x0000ffff; //  取出低位数据作为进度
        const receiveinfo = (countinfo & 0xffff0000) >> 16; // 取出高位保存的领取记录
        const idoffset = ctx.MARK_EACH_TASK[MARK].findIndex((a) => a === id);
        const isReceive = (receiveinfo >> idoffset) & 0x0001;  // 解释一下 ，16 位以上存领取记录，
        // 17 是这个标记的第一项领取记录,18 位是这个标记的第二项领取记录，19 位则保存第3项 ....

        return {
            id, intro, num, type,
            curnum: Math.min(count, num),
            // 0-可领取 1-未完成 2-已领取
            status: count < num ? 1 : ( isReceive ? 2 : 0),
            reward, pageid,
        }
    })
}
