"use strict"
const moment = require("moment");

// 活动时间
const smsTime = function (role) {
    const { DAY } = global.gameconfig.spokesman_skin || {};
    const start = moment(role.create).startOf("day").valueOf();
    return [start, start + DAY * 24 * 3600 * 1000];
}

const inTime = function (role) {
    const [start, end] = smsTime(role);
    return Date.in(start, end);
}

const marks = function () {
    const { TASKS = [] } = global.gameconfig.spokesman_skin || [];
    if (TASKS.length == 0) return [];
    return TASKS.map(({ TARGET }) => TARGET.map(({ GSID, MARK }) => ({ GSID, MARK })))
        .reduce((sum, cur) => sum.concat(cur));
}

// 活动埋点
const smsHit = function (role, targetGsdi = null) {
    if (!inTime(role)) return;
    const gsidMark = marks();
    // 升星、置换途径
    if (targetGsdi) {
        const one = gsidMark.find(({ GSID }) => GSID == targetGsdi);
        if (!one) return;
        if (role.getProp(one.MARK) > 0) return;
        role.addItemsNoSave({ GSID: one.MARK, COUNT: 1 });
    }
    // 其他活动途径
    else {
        const newGisd = role.newg.map(({ gsid }) => gsid);
        for (let { GSID, MARK } of gsidMark) {
            if (role.dontmarklist.includes(GSID)) continue;
            if (!newGisd.includes(GSID)) continue;
            if (role.getProp(MARK) > 0) continue;
            role.addItemsNoSave({ GSID: MARK, COUNT: 1 });
        }
    }
    // 长连接红点
    const dot = smsRed(role);
    if (dot > 0) global.pushClient(role, { type: "act", content: { "smanskin": dot } });
}

// 活动红点
const smsRed = function (role) {
    if (!inTime(role)) return 0;
    const gsidMark = marks();
    let dot = 0;
    for (let { MARK } of gsidMark) {
        if (role.getProp(MARK) == 1) {
            dot++;
        }
    }
    return dot;
}

// 代言人皮肤活动
module.exports = {
    smsTime,
    inTime,
    smsHit,
    smsRed,
}