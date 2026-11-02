'use strict'
let moment = require('moment');
// 元宵灯会 --- 信息获取
module.exports = exports = async function (ctx) {
    const labterns = ctx.config;
    ctx.assert(labterns && labterns.length > 0,'invalid labternsConfig');
    let [start, ] = global.config.ZHD.YXDH;
    let days = moment(moment().format('YYYY-MM-DD')).diff(moment(start).format('YYYY-MM-DD'),'days') + 1;

    //根据天数来加载不同的灯笼
    let curDayLabterns = labterns.filter((l)=> l.DAY == days).map((c, index) => {
        let status = ctx.role.yxdh[index];
        return {
            day:c.DAY,
            title: c.RIDDLE,
            content: c.CONTENT,
            answer:c.CONTENT.findIndex((a)=>a == c.ANSWER0),
            status
        }
    });
    ctx.assert(curDayLabterns && curDayLabterns.length > 0,'invalid labternsConfig')
    ctx.body = {curDayLabterns};
}