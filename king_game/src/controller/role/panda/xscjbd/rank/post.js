"use strict"

const moment = require("moment");

const SELECT_SET = {
    XSCJ:{
        rno:1, rname:1, 'hide.38001': 1,
        iconid: 1, _power: 1, headid: 1,
		frameid: 1,
		pvpscore: 1,
    }
}

module.exports = async function(ctx, next) {
	
	let rank = "panda-xscj" + ctx.panda.arg + ctx.panda.id;
	let rankService = new global.services.RankService(rank, ctx.role._gameserv.groupid);
    let list = await rankService.rank(1,ctx.config.REWARD[ctx.config.REWARD.length-1].MAX);
    let roles = list.map(({id})=>id);
    let select = SELECT_SET[ctx.KEY];
    roles = await ctx.dao.role.find({_id: {$in:roles}}, select);
    const temp = {};
    roles.forEach(one => {
        temp[one._id.toString()] = one;
    });
    list = list.map(({id, score})=>{
        let role = temp[id];
        if (!role) {return};
		let bsetpower = undefined;
		let servid = role.servid; 
		return {
			rid: role.i(),
			rname: role.name,
			iconid: role.iconid,
			frameid: role.frameid,
			headid: role.headid,
			power: role._power,
			bsetpower: bsetpower,
			level: role.level,
			servid,
			score,
		}
    }).filter(Boolean);

	let selfrank = await rankService.getItemRank(ctx.role.i());
	let selfscore = await rankService.getItemScore(ctx.role.i());
	ctx.body = {
		list,
	}
	if (selfrank) ctx.body.selfrank = selfrank;
	if (selfscore) ctx.body.selfscore = selfscore;
}