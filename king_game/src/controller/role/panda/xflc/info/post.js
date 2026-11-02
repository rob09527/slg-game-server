"use strict"

const moment = require("moment");

module.exports = async function(ctx, next) {
	let start = moment(ctx.role.create).startOf('days').valueOf();
    let record = ctx.role.xflc.record;
    let reward = ctx.config.ITEMS.map(({TITLE: title, PRICE: price, ITEMS: items}, index) => ({
        title,
        money:price,
        reward:items,
        // 1-未领取，2-已领取
        state: record[index] ? 2 : 1,
    }));
    let time = start + (ctx.panda.etime - 1) * (24 * 60 * 60 * 1000);
    ctx.body = {
        reward,
        time,
        money:ctx.role.xflc.money
    }
}