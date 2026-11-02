
'use strict'

const _ = require('lodash');

const select_field = {
	rno: 1, rname: 1, headid: 1, frameid: 1,
	update: 1, hide: 1,
}

module.exports = exports = async (ctx, next) =>{
	let blacklist = await ctx.dao.blacklist.find({rid: ctx.role._id}, {target: 1, _id: 0});
	blacklist = _.map(blacklist, async obj =>{
		let {
			target,
		} = obj;
		target = await ctx.dao.role.findOne({_id: target}, select_field);
		if (!target) return {};
		return {
			rid: target.i(),
			headid: target.headid,
			frameid: target.frameid,
			name: target.name,
			level: target.level,
			lasttime: target.update,
		}
	});
	ctx.body = await Promise.all(blacklist);
}