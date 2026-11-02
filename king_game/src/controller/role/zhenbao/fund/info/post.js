
'use strict'

const gsid = {128:98425, 648:98427}

module.exports = async ctx => {
    // zhenbao_fund_start 开始时间戳
    const zhenbao_fund_reward = global.gameconfig.zhenbao_fund_reward;
    ctx.body = [];
    global.gameconfig.zhenbao_fund.forEach(({PRICE}, index)=>{
        let obj = {};
        obj.day = new Date(index == 0 ? ctx.role.zhenbao_fund_start : ctx.role.zhenbao_fund_start1).dayFromNow();
        obj.isbuy = !!(index == 0 ? ctx.role.zhenbao_fund_buytime : ctx.role.zhenbao_fund_buytime1);
        obj.num = ctx.role.getProp(gsid[PRICE]);
        obj.price = PRICE;
        obj.items = zhenbao_fund_reward[index].DAILY_REWARD;
        obj.reward = zhenbao_fund_reward[index].FINIAL_REWARD;
        ctx.body.push(obj);
    })
}