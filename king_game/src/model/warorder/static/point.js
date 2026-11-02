"use strict";

// 卧龙战令-任务埋点
module.exports = async function (role, mark, count = 1, save = false) {
    const { OPEN = 0 } = global.gameconfig.warorder;
    if(OPEN == 0) return;
    if (this.isNotActive(role)) return; // 未激活则跳过
    await this.refresh(role); // 检查是否过期，过期则重刷
    const { TASKS } = global.gameconfig.warorder;
    const task = TASKS.find(({ MARK }) => MARK == mark);
    if (!task) return;
    const markCount = role.getProp(mark);
    const diff = Math.min(count, task.NUM - markCount);
    if (diff <= 0) return;
    role.addItemsNoSave({ GSID: mark, COUNT: diff });
    if(role.getProp(mark) == task.NUM){
        const { TASKS:tasks } = global.gameconfig.warorder;
        let dot = tasks.filter(({ MARK, NUM }) => role.getProp(MARK) == NUM).length;
        pushClient(role, { type: 'act', content: { warorder: dot } });
    }
    if(save) await role.save();
}