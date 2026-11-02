"use strict";

// 14日签到奖励领取标记
const FOURTEEN_MARK = Array.from({ length: 7 }).fill(94501).map((v, i) => v + i);

// 是否没激活卧龙战令
module.exports = function (role) {
    return FOURTEEN_MARK.some(mark => role.getProp(mark) == 1);
}