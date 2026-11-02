'use strict'
const {ObjectId} = require("mongodb");

module.exports = exports = async (ctx, next) =>{
    ctx.body = [];
    if (ctx.role.qxzlrecord[ctx.request.body.type]?.length) {
        let ids = ctx.role.qxzlrecord[ctx.request.body.type].map(_id=>ObjectId(_id));
        ctx.body = await ctx.dao.c_qxzlrecord.find({_id:{$in:ids}}).sort({create:-1});
    }
}