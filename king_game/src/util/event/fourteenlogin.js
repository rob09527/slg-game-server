"use strict"

const actTime  = require("./eventstart");

// 七日登录奖励领取标记
const sevenMark = Array.from({ length: 7 }).fill(93301).map((v, i) => v + i);
const MARK = 94500; // 14日登录累计登录天数
const SEVENMARK = 94508; // 七日登录奖励都领取完的标记

// 14 日签到
module.exports = {
    // 判断七日登录的奖励是否领取完
    sevenDone(role) {
        // 在全服活动开启之后的创建的角色才能参加14日签到活动
        if(role.create < actTime("FOURTEENLOGIN", role.servid)) return;
        if (role.getProp(SEVENMARK) >= 1) return;
        if (!sevenMark.some(mark => role._change_items_[mark])) return;
        if (!sevenMark.every(mark => role.getProp(mark) == 0)) return;
        role.addItemsNoSave({ GSID: SEVENMARK, COUNT: 1 });
    },
    // 14日签到累计登录标记增加
    // 要求七日登录所有奖励领完的第二天才可以累计 14 日签到的登录标记
    loginRecord(role) {
        if(role.getProp(SEVENMARK) == 0) return;
        role.addItemsNoSave({ GSID: MARK, COUNT: 1 });
    },
}