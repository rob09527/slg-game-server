"use strict"

const actTime = require("../util/event/eventstart").bind(null, 'WEEKTARGET');
//获取创建天数
const getDay = function(create) {
    const { WEEKTARGET: { DAY, DAY1 } } = global.gameconfig.others;
    let nowTime = new Date().setHours(0, 0, 0, 0);
    let createDay = (nowTime - create) / (24 * 3600 * 1000);
    return createDay < DAY ? DAY : DAY1;//14日目标判断
}

const hasTime = function(role) {
    const _create = new Date(role.create);
    _create.setHours(0, 0, 0, 0);

    let day = getDay(_create);
    // 活动第 8 天才关闭
    return role.create >= actTime(role.servid) && Date.now() < _create.valueOf() + day * 24 * 3600 * 1000;//14日目标判断
}

function getCFG(create) {
    let day = getDay(new Date(create).setHours(0, 0, 0, 0));
    const { WEEKTARGET: { DAY } } = global.gameconfig.others;
    return day == DAY ? "weektarget" : "twoweektarget";
}

// 七日目标公共方法
module.exports = {
    // 活动持续天数
    day(index) {
        const { WEEKTARGET: { DAY,DAY1 } } = global.gameconfig.others;
        return index == 0 ? DAY : DAY1;
    },
    // 获取活动开启时间
    start: actTime,
    // 活动是否开启
    isTime: hasTime,
    //判断7日或者14日是否开启
    is7or14(role,index) {
        const _create = new Date(role.create);
        _create.setHours(0, 0, 0, 0);
        if (!role.create >= actTime(role.servid)) {
            return false;
        }
    
        const { WEEKTARGET: { DAY, DAY1 } } = global.gameconfig.others;
        let now = Date.now();
        if (index == 0) {
            return now < _create.valueOf() + DAY * 24 * 3600 * 1000;//7日目标判断
        }
        // 活动第 8 天才关闭
        return (now < _create.valueOf() + DAY1 * 24 * 3600 * 1000) && (now >= _create.valueOf() + DAY * 24 * 3600 * 1000);//7日目标判断
    },
    /**
     * 事件埋点
     * @param {object} role 角色
     * @param {number} _mark 标记
     * @param {number} num 数量
     * @param {boolean} isAdd 是否直接添加标记，默认否
     */
    hitHere(role, _mark, num, isAdd = false) {
        // 新人手册 “点将台任务”完成条件：在任意时间段内进行指定次数的点将即可完成任务
        if(_mark != 94213){//2023/3/6周洪宇要求修改
            const { WEEKTARGET: { DAY1 } } = global.gameconfig.others;
            const _create = new Date(role.create);
            _create.setHours(0, 0, 0, 0);
            if(Date.now() >= _create.valueOf() + DAY1 * 24 * 3600 * 1000) return;
        }
        const { EVENT: event } = global.gameconfig.weektarget;
        if(!event.map(({ MARK }) => MARK).includes(_mark)) {
            const { EVENT: event } = global.gameconfig.twoweektarget;
            if(!event.map(({ MARK }) => MARK).includes(_mark)) {return}
        };
        if(isAdd) {
            role.addItemsNoSave({ GSID: _mark, COUNT: num });
            return;
        }
        let curNum = role.getProp(_mark);
        let diff = num - curNum;
        if(diff <= 0) return;
        role.addItemsNoSave({ GSID: _mark, COUNT: diff });
    },
     // 福利礼包红点
     welDot(role) {
        if(!hasTime(role)) return 0;
        let word = getCFG(role.create);
        const { WELFARE } = global.gameconfig[word];
        const _create = new Date(role.create);
        _create.setHours(0, 0, 0, 0);
        let day = Math.floor((Date.now() - _create.valueOf()) / (24 * 3600 * 1000));
        let dot = 0;
        let record = role[word] || {};
        if(!record.wel) record.wel = [];
        WELFARE.forEach(({ DATE, COST, LIMIT }, index) => {
            if(day < DATE) return;
            if(COST[0].COUNT > 0) return; // 免费礼包才有红点
            let buynum = LIMIT - (record.wel[index] || 0);
            if(buynum > 0) dot += 1;
        })
        return dot;
    },
}