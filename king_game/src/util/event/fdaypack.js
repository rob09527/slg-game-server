"use strict";
const moment = require("moment")

// 领取奖励的时间
const rtime = function (role) {
    const { RHOUR } = global.gameconfig.fdaypack || {};
    if (!RHOUR) return [0, 0];
    const [start, end] = RHOUR;
    let date = moment(role.create).format("YYYY-MM-DD");
    return [moment(`${date} ${start}:00:00`).valueOf(), moment(`${date} ${end}:00:00`).valueOf()];
}

// 活动结束的时间
const etime = function (role) {
    return  moment(role.create).endOf("days").valueOf();
}

module.exports = {
    rtime,
    etime,
}