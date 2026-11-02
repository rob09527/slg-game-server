'use strict';

// 军团战时间表
module.exports = exports = async (ctx, next) => {
    const {MATCH} = global.gameconfig.legionpvp.CONFIG;

    const t = MATCH.split(' ');
    const h = +t[2];
    const m = +t[1];
    const s = +t[0];

    const now = new Date();

    // 找出 期号, 就是找出锁整容之前的第一个匹配日
    let DAY = MATCH.split(' ').pop().split(',');
    while (!DAY.includes(now.getDay().toString())) {
        now.setDate(now.getDate() - 1);
    }
    now.setHours(h,m,s,0); //
    ctx.body = {}
    if(Date.now() < now.getTime() ){ // 没到开始时间
        ctx.body.next = now.getTime();
        return;
    }
    // 已经过本期的开始时间，找下一期
    now.setDate(now.getDate() + 1);
    while (!DAY.includes(now.getDay().toString())) {
        now.setDate(now.getDate() + 1);
    }
    ctx.body.next = now.getTime();
};
