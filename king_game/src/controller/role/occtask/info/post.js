
'use strict'
// 职业任务-展示信息
const taskConfig = global.gameconfig.occtask;
module.exports = exports = async (ctx, next) => {
    let index = ctx.occtask.index;
    ctx.assert(taskConfig, 'task config err');
    let body = {};
    body.index = index;
    body.occtype = ctx.occtask.occtype;
    if (index == 0) {
        // 免费好礼
        let freeRewards = taskConfig.FREE_GOOD_ITEMS;
        body.rewards = freeRewards;
    } else if (index == 2) {
        // 职业任务
        let taskInfos = taskConfig.TASK[body.occtype];
        let list = taskInfos.WORK.map(info => {
            let num = ctx.role.getItems(info.PMARK).count;
            let fnum = ctx.role.getItems(info.FMARK).count;
            // 未完成 0 已完成未领取1 
            let status = num >= info.NUM ? 1 : 0;
            if (fnum == 1) {
                // 表示已经领取2
                status = 2;
            }
            return {
                status,
                rewards: info.ITEMS,
                intro: info.INTRO,
                mark: info.PMARK,
                limit: info.NUM,
                page: info.PAGE,
                num
            }
        })
        body.list = list;
        // 所有任务完成的奖励
        body.reward = taskInfos.ALLFINISH_ITEM.ITEMS;
    } else if (index == 3) {
        // 职业礼包
        let packList = taskConfig.GIFT_PACKS[body.occtype];
        let cacheId = ctx.occtask.cachegiftid;
        let packinfo = {};
        if (cacheId != 0) {
            // 取出配置信息
            packinfo = packList.PACKS.find(pack => {
                return pack.ID == cacheId;
            });
        }
        // 计算本次刷新需要的元宝数
        let refshInfo = taskConfig.REFRESH[ctx.occtask.refreshcount];
        // 刷新次数超过最大值 则取最后一个
        if (!refshInfo) refshInfo = taskConfig.REFRESH[taskConfig.REFRESH.length - 1];
        body.refcost = refshInfo
        body.packinfo = packinfo;
        // pre
        body.prewards = packList.PREWARDS
    }

    ctx.body = body;

}