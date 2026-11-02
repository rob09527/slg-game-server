"use strict"

const moment = require("moment");

module.exports = exports = async function (ctx, next) {
    let now = Date.now();
    let reward = ctx.config.map((info, index)=>{
        let record = ctx.record[index], bought = 0;
        if (record) {
            bought = record.buy;
            if (info.REFRESHTYPE == "day") {
                let start = moment(record.got).startOf('days').valueOf();
                let end = start + 24 * 3600 * 1000;
    
                if (now < end && now > start) {
                    bought = record.buy;
                }
                else {
                    ctx.record[index] = null;
                    ctx.role.markModified(ctx.mode);
                    ctx.save = true;
                    bought = 0;
                }
            }
        }
        return {
            id:index,
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
    }
    let act = global.ACTIVITY[ctx.mode];
    const {params, ...out } = act.base(ctx.role);
    ctx.body.time = (out && out.etime) || Date.now();
}