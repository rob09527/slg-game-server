'use strict'
/**
 * 征战因子奖励基础值
 */
module.exports = function () {

    const role = this._role;
    const chapterId = (role.maxmapid + '').slice(0, 3); // 获取章节id
    const expRes = global.gameconfig.nmaze.CHAPTER_RES[chapterId];
    return expRes;
}
