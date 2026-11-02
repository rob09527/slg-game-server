'use strict';

const moment = require("moment");
const actions = require('../../../../remote/recharge/right_actions');
// 充值返利
module.exports = exports = async (ctx, next) => {
    ctx.assert(global.config.REBATE && global.config.REBATE == 2, "rebate, beta not open")
    const rid = ctx.role.i();
    ctx.CACHE.reward = ctx.CACHE.reward || {};
    ctx.assert(ctx.CACHE.reward.rid == null || ctx.CACHE.reward.rid == rid, "player lock")
    let {
		pid,
        price
	} = ctx.request.body;
    if (pid) {
        ctx.assert(ctx.CACHE[pid], `not open pid:${pid}`)
        ctx.assert(!ctx.CACHE.reward[pid], `pid:${pid} is geted`);
        let udp = {
            $set: {
                ['reward.rid']: rid,
                [`reward.${pid}`]: 1
            },
        }
        await global.dao.rebate.updateOne({uid: ctx.role.uid}, udp, {upsert:true});
        // 激活特权
        const config = global.gameconfig.right[pid];
        if(config){
            let prefix = pid.replace('special', '');
            let is_xufei = false;
            let num = ctx.CACHE[pid]
           // 非自然日
            if (config.DAY > 0) {
                ctx.role.special[prefix] = Date.now() + config.DAY * 24 * 60 * 60 * 1000 * num;
            }else if (config.DAY < 0) {
                // 永久特权
                ctx.role.special[prefix] = 9999999999999;
            }
            // 自然日(月卡)
            if (config.NDAY) {
                if (ctx.role.special[prefix] > 0) is_xufei = true;
                let day = ctx.role.special[prefix] || 0;
                day += config.NDAY * num;
                ctx.role.special[prefix] = day;
            }
            ctx.role.markModified('special.' + prefix);
            const fn = actions({prefix});
            if (fn) await fn({ctx, is_xufei});
            ctx.CACHE.reward[pid] = 1;
        }
     }
    if (price) {
        // 判断天数
        ctx.assert(ctx.CACHE.price || ctx.CACHE.exp, "not open")
        const days = moment(moment().format('YYYY-MM-DD')).diff(moment(ctx.role.create).format('YYYY-MM-DD'),'days') + 1;
        let count = 0;
        if(days >= 3) {
            ctx.assert(!ctx.CACHE.reward["day3"], "is geted");
            count = 3;
        }
        else if(days >= 2) {
            ctx.assert(!ctx.CACHE.reward["day2"], "is geted");
            count = 2;
        }
        else if(days >= 1) {
            ctx.assert(!ctx.CACHE.reward["day1"], "is geted");
            count = 1;
        }
        // 领取天数，可以补领
        let priceCount = 0, expCount = 0;
        let rewardDay = (day) => {
            let allprice = (ctx.CACHE.price || 0) * 10; // 元宝是充值的10倍
            let udp = {};
            udp['reward.rid'] = rid;
            if(day >= 1) {
                if(!ctx.CACHE.reward["day1"]){
                    udp['reward.day1'] = 1
                    // udp.reward.exp = 1
                    priceCount += Math.floor(allprice * 4 / 10);
                    expCount = ctx.CACHE.exp || 0;
                    ctx.CACHE.reward["day1"] = 1
                }
            }
            if(day >= 2) {
                if(!ctx.CACHE.reward["day2"]){
                    udp['reward.day2'] = 1
                    priceCount += allprice - Math.floor(allprice * 4 / 10);
                    ctx.CACHE.reward["day2"] = 1
                }
            }
            if(day >= 3) {
                if(!ctx.CACHE.reward["day3"]){
                    udp['reward.day3']= 1
                    priceCount += allprice;
                    ctx.CACHE.reward["day3"] = 1
                }
            }
            return udp;
        }
        let udp = rewardDay(count);
        // await global.dao.rebate.updateOne({uid: ctx.role.uid}, {$set:udp}, {upsert:true});
        // 返利元宝和VIP
        let items = [];
        if(priceCount > 0){
            items.push({GSID: 38005, COUNT: priceCount});
            ctx.CACHE["38005"] = priceCount; // 客户端展示用
        }
        if(expCount > 0){
            items.push({GSID: 38003, COUNT: expCount});
        }
        ctx.role.addItemsNoSave(items, {main: 'rebate', sec: 'day'+count});
        // 特权激活
        for (pid in ctx.CACHE) {
            if(pid.startsWith("special") && ctx.CACHE[pid] && !ctx.CACHE.reward[pid]) {
                const config = global.gameconfig.right[pid];
                if(config) {
                    let prefix = pid.replace('special', '');
                    let num = ctx.CACHE[pid]
                    // 非自然日
                    if (config.DAY > 0) {
                        ctx.role.special[prefix] = Date.now() + config.DAY * 24 * 60 * 60 * 1000 * num;
                    } else if (config.DAY < 0) {
                        // 永久特权
                        ctx.role.special[prefix] = 9999999999999;
                    }
                    // 自然日(月卡)
                    if (config.NDAY) {
                        let day = ctx.role.special[prefix] || 0;
                        day += config.NDAY * num;
                        ctx.role.special[prefix] = day;
                    }
                    ctx.role.markModified('special.' + prefix);
                    const fn = actions({prefix});
                    if (fn) await fn({ctx, is_xufei:false});
                    ctx.CACHE.reward[pid] = 1;
                    udp[`reward.${pid}`] = 1;
                }
            }
        }
        ctx.CACHE.reward.num = (ctx.CACHE.reward.num || 0) + 1;
        udp['reward.num'] = ctx.CACHE.reward.num
        console.log("rebate upd ", udp);
        await global.dao.rebate.updateOne({uid: ctx.role.uid}, {$set:udp}, {upsert:true});
    }
    await ctx.role.save();
    ctx.body = ctx.CACHE
}
