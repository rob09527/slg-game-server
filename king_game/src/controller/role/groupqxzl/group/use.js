'use strict'

const {ObjectId} = require("mongodb");
const moment = require('moment');

const config = {
    1:'qxzlonecopy',
    2:'qxzlgroupcopy',
    3:'qxzlhidecopy',
}

module.exports = exports = async (ctx, next) =>{
    ctx.type = ctx.request.body.type;
    ctx.config = global.gameconfig[config[ctx.type]];
    ctx.assert(ctx.type > 1 && ctx.config, '112');
	let weekday = moment().weekday();
    let time = ctx.config.TIME[weekday];
    let hour = moment().hours();
    ctx.assert(time && time.OPEN && hour >= time.START && hour < time.END, '101');
    ctx.teamword = ctx.type == 2 ? 'qxzlteamid' : "hideteamid";

    ctx.findTeam = async ()=>{
        let id = ctx.role[ctx.teamword];
        id = id == 0 ? "" : id;
        if (!id) {
            return null;
        }
        return await ctx.dao.c_qxzlteam.findOne({_id: ObjectId(id)});
    }

    await next()
}