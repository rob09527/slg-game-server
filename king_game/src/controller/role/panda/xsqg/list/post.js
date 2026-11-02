"use strict"

const moment = require("moment");

module.exports = async function (ctx, next) {
    ctx.body = {
        reward: ctx.config.map((value, index) => {
            let bought = ctx.record[index] || 0;
            let obj = {
                index: value.INDEX,
                price: value.PRICE,
                exp: value.EXP,
                limit: value.LIMIT,
                items: value.ITEMS,
                buytime: value.LIMIT - bought
            };
            if (value.spec_gsid0 && value.spec_count0) {
                obj.spec_gsid0 = value.spec_gsid0;
                obj.spec_count0 = value.spec_count0;
            }
            return obj;
        })
    }
	let start = moment(ctx.role.create).startOf('days').valueOf();
    let time = start + (ctx.panda.etime - 1) * (24 * 60 * 60 * 1000);
    ctx.body.time = time;
}