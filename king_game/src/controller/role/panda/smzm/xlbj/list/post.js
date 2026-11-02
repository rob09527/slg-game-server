"use strict"

const moment = require("moment");

module.exports = exports = async function (ctx, next) {
    let save = false;
    let reward = ctx.config.map((info, index)=>{
        let record = ctx.record[index], bought = 0;
        if (record) {
            bought = record.buy;
            if (info.REFRESHTYPE == "day") {
                let start = moment(record.got).startOf('days').valueOf();
                let end = start + 24 * 3600 * 1000;
    
                let now = Date.now();
                if (now < end && now > start) {
                    bought = record.buy;
                }
                else {
                    ctx.record[index] = null;
                    save = true;
                    bought = 0;
                }
            }
        }
        return {
            id:info.ID,
            price:info.PRICE,
            exp:info.EXP,
            limit:info.LIMIT,
            type:info.TYPE,
            reward:info.ITEMS,
            buytimes: info.LIMIT - bought,
            refershtype: info.REFRESHTYPE,
            icon: info.ICON,
            name: info.NAME,
        }
    })
    
    ctx.body = {
        reward,
        time: ctx.etime,
    }
    if (save) {
        ctx.role.markModified("panda.smzm");
        await ctx.role.save();
    }
}