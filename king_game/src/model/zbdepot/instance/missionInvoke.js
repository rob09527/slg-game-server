
'use strict'

/**
 * 触发增幅任务事件
 * @param {string} missionName 事件名
 * @param {array} args 额外参数
 */

module.exports = function ({ missionName, ...args }) {
    // 开发打印
    if (process.env.NODE_ENV === 'development') {
        console.log(process.pid, new Date().toLocaleString(), 'ZBMISSION TRYINVOKE', missionName, this.rid);
    }
    let mission;
    try {
        mission = require('./../common/zfmission/' + missionName.toLowerCase());
    } catch (e) {
        console.error(`ZHENBAO MISSION NEXIST ${missionName}`);
        return;
    }
    mission.call(this, args)
        .then(_ => console.log(`${process.pid} ${new Date().toLocaleString()} ZB MISSION INVOKED ${missionName} ${this.rid}`))
        .catch(console.error);
}