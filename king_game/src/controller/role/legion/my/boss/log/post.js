
'use strict'

const moment = require('moment');

module.exports = async function (ctx, next) {
	let $gte = moment().startOf('day');
	let $lte = moment().endOf('day');
	let cond = {
		legion: ctx.legion._id,
		create: {$gte, $lte},
	}
	let loglist = await ctx.dao.c_lbchallengelog.find(cond).sort({_id: -1});
	ctx.body = [];
	for (let log of loglist) {
		let {
			rid,
			videoid,
			bossindex,
			damage,
			farm,
			create,
		} = log;
		let v = await ctx.dao.video.findOne({_id: videoid}, {_id: 0, video: 1, version: 1});
		if (!v) continue;
		let role = await ctx.dao.role.findOne({_id: rid}, {_power: 1,headid:1,frameid:1,iconid:1,'hide':1});
		if (!role) continue;
		ctx.body.push({
			power: role._power,
			version: v.version,
			video: v.video,
			iconid:role.iconid,
			headid:role.headid,
			frameid:role.fremeid,
			level:role.level,
			bossindex,
			damage,
			farm,
			create,
		})
	}
}