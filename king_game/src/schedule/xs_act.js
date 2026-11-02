'use strict'
const cleanfn = require('../util/event/xscleanfn');
const moment = require("moment");
const getBeforWeekDays = require('../util/event/getBeforWeekDays');

// 定时器
exports.name = "新手周活动清理";

exports.force_on_time = true;//强制执行

// 定时器语句
exports.cron = "5 0 0 * * *";

/**
 * 
 * 28天新手期 对应的全服活动都不会出现在新手期里面 因此这样写不会和全服周有冲突,
 * 每个人的所在周的配置可能不同 他们清除的标记也可能不相同
 * @return {Promise<void>}
 */
exports.main = async function () {
    let weekDays = getBeforWeekDays();
    // 0 最后一周 1 第三周 2 第二周 1 第一周
    //第四周的数据
    for (let i = 0; i < weekDays.length ; i++) {
        let cond = weekDays[i];
        let week = weekDays.length - i;
        let zhds  = global.gameconfig.zhd_week_xs[week];
        if(!zhds) {
            console.error(`${week}周没有开启活动,清检查`)
            continue
        };
        let set = { $unset: {} ,$set:{}};
        if(i == 0) {
            set.$unset.ljcz = 1;
            set.$unset.ljcz1 = 1;
            set.$unset.ljcz2 = 1;
            set.$unset.ljcz3 = 1;
            set.$unset.ljcz4 = 1;
        };
        for (let index = 0; index < zhds.length; index++) {
            const xs_zhd = zhds[index];
            if(xs_zhd != 'XS_QXSY'){
                let key1 = `${xs_zhd}${week}`;
                let config = global.gameconfig.zhd[key1.toUpperCase()];
                if(!config) {
                    console.error(`${xs_zhd}周活动不存在结构配置表中,清检查`)
                    continue
                };
            };
            if(!cleanfn[xs_zhd]){
                console.error(`${xs_zhd}周活动清理方法不存在清检查`)
                continue
            }
            await cleanfn[xs_zhd](set,week,cond);
        }
        await global.dao.role.updateMany(cond, set);
    }
}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}
