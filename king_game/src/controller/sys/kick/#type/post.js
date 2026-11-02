
'use strict'

module.exports = exports = async function (ctx, next) {
	const {sid} = ctx.request.body;
	ctx.assert(sid, 'sid require');
	let cond = {servid: sid};
	if (ctx.params.type !== 'all') {
		let tmp = [];
		for (const mark of ctx.request.body.players){
			if (mark.startsWith('uid#')) {
				tmp.push(mark.replace('uid#', ''));
			}else{
				let sub_cond = {};
				if (mark.startsWith('name#')) {
					sub_cond.rname = mark.replace('name#', '');
				}else{
					sub_cond._id = mark;
				}
				const role = await ctx.dao.role.findOne(sub_cond);
				if (role) tmp.push(role.uid);
			}
		}
		cond.uid = {$in: tmp};
	}
	await ctx.dao.token.remove(cond);

	let playerlist = [];
	for (let uid of cond.uid.$in) {
		let role = await ctx.dao.role.findOne({uid});
		playerlist.push({
			uid,
			rid: role.i(),
			servid: role.servid,
			name: role.name,
			level: role.level,
			vip: role.vip,
			vipexp: role.getItems(38003).count,
			power: role._power,
			maxmapid: role.maxmapid,
			tower: role.tower+1,
			create: role.create,
		})
	}
	ctx.body = {playerlist};
}