'use strict'

const _ = require('lodash');

/**
 * 印记抽卡
 */
module.exports = async (ctx, next) => {
    let {
        times
    } = ctx.request.body;
    ctx.assert(global.gameconfig.signet_roll_cast && global.gameconfig.signet_roll_pool,'signetrollconfig not exitsts')
    let {
        CAST: _CAST,
        ITEMS: _ITEMS,
    } = global.gameconfig.signet_roll_cast[times];
    ctx.role.castItemsNoSave(_CAST);

    // 发放祈愿积分*1 
    const reward = _ITEMS.map(({ GSID, MIN, MAX }) => ({
        GSID,
        COUNT: ctx.random.between(MIN, MAX),
    }))
    const {BAODI,BAODI_COUNT = 20 } = global.gameconfig.signet_roll_others;
    let output = [];
    for (let i = 0; i < times; i++) {
        let pool = global.gameconfig.signet_roll_pool;
        pool = pool.filter(function (item) {
            return (ctx.role.level >= item.MINLV && ctx.role.level <= item.MAXLV) ||
            (ctx.role.vip >= item.MINVIP && ctx.role.vip <= item.MAXVIP);
        })
        //触发保底
        if(times == BAODI.TIMES && i < BAODI.COUNT){
            pool = global.gameconfig.signet_roll_pool.filter((s)=>{
                let signet = global.gameconfig.signet[s.GSID];
                return signet.QUALITY == BAODI.QUALITY;
            });
        }
        const counter_key = 'signet_roll_red';
        ctx.role[counter_key] =  ctx.role[counter_key]  || 0;
        ctx.role[counter_key] ++;
        let item;
        // 大于保底次数触发保
        if (ctx.role[counter_key] >= BAODI_COUNT) {
            const choice = global.gameconfig.signet_roll_pool.filter((s)=>{
                return s.ENSURE;
            });;
            let k = Math.floor(Math.random()*choice.length);
            ctx.role[counter_key] = 0;
            item = choice[k];
        }else{
            let rates = pool.deepMap('W');
            let index = ctx.random.inweight(rates);
            item = pool[index];
        }
        output.push({GSID:item.GSID,COUNT:1});
        let signet = global.gameconfig.signet[item.GSID];
        if(signet.QUALITY == 6){
            ctx.role[counter_key] = 0;
        };
       
    };
    await ctx.jfhd({name: 'ccjf', role: ctx.role, times}, 0).catch(console.error);
    ctx.zhdpoint("JFHD_RED", ctx.role,'ccjf');

    ctx.role.markModified('signet_roll_red');
    output = output.concat(reward);
    ctx.role.addItemsNoSave(output,{main:'signet',sec:'roll'});
    await ctx.role.save();
    let items =  ctx.role.newsignet.map((s)=>{
        return s.base();
    });
    ctx.body = {
        items
    }
}