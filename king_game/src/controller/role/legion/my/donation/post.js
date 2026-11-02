
'use strict'

module.exports = exports = async (ctx, next) =>{
	let list = [];
	for (let [rid, {count, last}] of Object.entries(ctx.legion.donation)) {
		let member = ctx.legion._members.deepQueryOne('rid', rid);
		if (!member) continue;
		let role = await ctx.dao.role.findOne({_id: rid}, {iconid: 1, rno: 1, rname: 1,frameid:1,headid:1});
		if (!role) continue;
		list.push({
			name: role.name,
			icon: role.iconid,
			headid:role.headid,
			frameid:role.frameid,
			score: count,
			pos: member.pos,
			last,
		})
	}
	list.sort(function (pre, nxt) {
		if (pre.score == nxt.score) return pre.last > nxt.last? 1: -1;
		return pre.score > nxt.score? -1: 1;
	})
	ctx.body = list;
}