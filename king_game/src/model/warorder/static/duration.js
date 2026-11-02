"use strict";

// 活动开始结束时间
module.exports = async function (role) {
    const one = await this.findOne({ rid: role.i() }, { start: 1, end: 1 });
    if(!one) return [0,0];
    return [one.start, one.end];
}