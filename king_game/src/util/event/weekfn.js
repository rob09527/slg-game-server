"use strict"

// 可能需要周刷的周活动（活动持续时间大于一周的）
module.exports = {
    // 夺宝任务
    DBRW: async function() {
        let config = global.gameconfig.zhd.DBRW;
        if(!config) return;
        config = config.TASKS;
        let set = { $unset: {} }
        for (let { MARK, TYPE } of config) {
            if(TYPE != "week") continue;
            set.$unset[`others.${MARK}`] = 1;
        }
        await global.dao.role.updateMany({}, set);
        console.error(`SCHEDULEREF DBRW WEEK END`, new Date().toLocaleString());
    }
}