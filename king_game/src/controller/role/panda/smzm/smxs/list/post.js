"use strict"

const moment = require("moment");

module.exports = exports = async function (ctx, next) {
    let reward = ctx.config.map((info, index)=>{
        return {
            title:info.NAME,
            reward:info.ITEMS,
            optional:info.OPTIONAL,
            state: ctx.record[index] ? 2 :1,//1-未领取，2-已领取
            money: info.CNUM,
            curmoney: ctx.role.panda.smzm.val,
            index
        }
    })

	let start = moment(ctx.role.create).startOf('days').valueOf();
    let time = start + (global.gameconfig.panda.SMFL[ctx.role.panda.smzm.smflseason].etime - 1) * (24 * 60 * 60 * 1000);

    ctx.body = {
        time,
        reward,
        looplimit: global.gameconfig.panda.SMFL.length,
        currentloop: ctx.role.panda.smzm.smflseason + 1,
    }
}