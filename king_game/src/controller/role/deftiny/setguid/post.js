
'use strict'
const ObjectId = require('mongodb').ObjectId;

module.exports = exports = async function (ctx, next) {
    let {guids} = ctx.request.body;
    let arrguid = [];
    for (let index in guids) {
        let guid = guids[index];
        ctx.assert(!arrguid.includes(guid),'already set');
        arrguid.push(guid);
        let general = ctx.tian.general[index];
        ctx.assert(general,'general error');
        let info = ctx.config.COST.SLOT[index];
        ctx.assert(info && info.LEVEL <= ctx.role.level,'info error'+index);
        let find_general = await ctx.dao.general.findOne({_id:ObjectId(guid)});
        ctx.assert(find_general,'no general');
        let gen = global.gameconfig.general[find_general.gsid];
        ctx.assert(gen && gen.STAR >= 5,'Insufficient stars');
        general.guid = guid;
    }

    ctx.role.markModified('destiny.general');
    ctx.body = ctx.tian.general;
}