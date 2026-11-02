
'use strict'

const isBetweenThursday2330AndFriday0030 = require("../../../../util/isBetweenThursday2330AndFriday0030");
module.exports = exports = async (ctx, next) => {

    let data = {
        //true 休战期 false 战斗阶段
        truce: isBetweenThursday2330AndFriday0030(),
        //时间戳  date.now() 1721316600000
        time: getNextThursday2330Timestamp()
    }
    // 服务端信息 {"action":"API","data":{"path":"role/pvpmultiplayer/time","data":{"truce":false,"time":1721316600000}}
    ctx.body = data
}


function getNextThursday2330Timestamp() {
    // 获取当前日期和时间
    const now = new Date();

    // 获取当前是周几（0-周日，1-周一，...，6-周六）
    const currentDay = now.getDay();

    // 计算到下一个周四的天数差
    // 如果今天是周四或之后的任何一天，则下一个周四在本周之后的7-currentDay+3天
    // 如果今天是周三或之前的任何一天，则下一个周四在本周的4-currentDay天后
    let daysUntilNextThursday = (currentDay < 4) ? 4 - currentDay : 7 - currentDay + 4;

    // 设置时间到下一个周四的23:30
    now.setDate(now.getDate() + daysUntilNextThursday);
    now.setHours(23, 30, 0, 0); // 设置小时、分钟、秒、毫秒

    // 转换为时间戳
    return now.getTime();
}

// 调用函数并打印结果
console.log(getNextThursday2330Timestamp());
