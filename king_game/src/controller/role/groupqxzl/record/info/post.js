'use strict'

const {ObjectId} = require("mongodb");

module.exports = exports = async (ctx, next) =>{
    let record = await ctx.dao.c_qxzlrecord.findOne({_id:ObjectId(ctx.request.body.id)});
    ctx.assert(record, 128);
    ctx.body = {
        record,
        list:[],
    };
    for (let {bid, vid} of record.ids) {
        let battle = await ctx.dao.c_battle.findOne({_id:ObjectId(bid)});
        if (battle) {
            ctx.body.list.push({base:battle.base(), result:battle.result, vid});
        }
    }
}