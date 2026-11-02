
'use strict'
// 职业任务-累计完成任务积分

const assert = require('assert');
const taskConfig = global.gameconfig.occtask;

module.exports = exports = async function ({ mark, rid, times = 1 }, no_save) {
    let role = await global.dao.role.findOne({ _id: rid });
    if (Object.keys(role.occtask).length == 0) return;
    // 是否正在进行任务
    if (role.occtask.index != 2) return;
    let works = taskConfig.TASK[role.occtask.occtype].WORK;
    assert(works, 'invalid config');
    let info = works.find((work, index) => {
        if (work.PMARK == mark) {
            work.index = index;
            return work;
        }
    });
    // index 不等于0时,需要判断前一个标记任务是否完成
    if (info.index != 0) {
        let preInfo = works[info.index - 1];
        assert(preInfo, 'invalid pre config');
        if (role.getItems(preInfo.FMARK).count < preInfo.FNUM) return;
    }
    let { NUM: limit } = info;
    let score = role.getItems(mark).count;
    // 分数不满,则继续执行
    if (score >= limit) return;
    let cur_score = Math.min(limit, score + times);
    let del = cur_score - score;
    if (del > 0) role.addItemsNoSave({ gsid: mark, count: del });
    if (no_save) return;
    await role.save();
}
