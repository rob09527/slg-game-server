'use strict';
const moment = require("moment");

module.exports = exports = function (role) {
    let start;
    let etime;

    if (this.type.toLowerCase().startsWith('xs_')) { // 新手周活动
        const days = moment(moment().format('YYYY-MM-DD')).diff(moment(role.create).format('YYYY-MM-DD'),'days') + 1;
        const week = Math.ceil(days / 7);
        if (Date.in(this.start, this.etime) && global.gameconfig.zhd_week_xs && global.gameconfig.zhd_week_xs[week] && global.gameconfig.zhd_week_xs[week].includes(this.type)) { // 判断新手活动是不是还在有效时间内
            const createTime = moment(role.create).startOf('days').valueOf() ;
            start = createTime + (week - 1) * 7 * 24 * 3600 * 1000;
            etime = createTime + week  * 7 * 24 * 3600 * 1000;
        } else {
            start = 0;
            etime = 0;
        }
    } else if (this.roleday) { // 创角天内不开启
        start = moment(role.create).startOf('days').valueOf();
        start += Math.floor(this.roleday * 24 * 3600 * 1000);
        start = Math.max(this.start, start);
        etime = this.etime;
    } else if (this.duration) { // 根据创建角色时间来计算 活动时间
        start = moment(Math.max(this.start, role.create)).startOf('days').valueOf();
        if (this.offtime) { // 偏移时间,以便于控制创觉第N天触发
            start += Math.floor(this.offtime * 24 * 3600 * 1000);
        }
        etime = start + Math.floor(this.duration * 24 * 3600 * 1000);
        etime = Math.min(this.etime, etime);
    } else {
        //排除常规活动和新手活动重叠的可能。
        if(role.isXS() && !role.isXSCanOpenAct(this.type.toLowerCase())){
            start = 0;
            etime = 0;
        }else{
            start = this.start;
            etime = this.etime;
        }
    }

    return {start, etime};
};
