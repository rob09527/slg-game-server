
'use strict'

/**
 * 
 * @param {missionName} 增幅任务名
 * @param {array} 其他参数
 * @returns {Promise<void>}
 */
module.exports = async function ({ missionName, ...args }) {
    const deopt = await this.db.models.zbdepot.getOne({ rid: this._id });
    // 尚未开启功能,直接返回
    if (!deopt) return;
    deopt.missionInvoke({ missionName, ...args });
}