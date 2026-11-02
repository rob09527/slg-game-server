
'use strict'

module.exports = exports = async (ctx, next) =>{
	let applys = await ctx.dao.apply.find({type: 'legion', to: ctx.legion._id}).sort({create: -1});
	const applysMap = {};
	const roles = await ctx.dao.role.find({
		_id: applys.map(a => {applysMap[a.rid] = a;return a.rid}),
	}, {
		_id: 1, create: 1, rname: 1,
		set: 1, _power: 1, iconid: 1,
		headid: 1, frameid: 1, "hide.38003": 1,
	});
	applys = roles.map(role => {
		const doc = applysMap[role.i()]
		let tmp = {
			id: doc._id.toString(),
			time: doc.create,
			rid: doc.rid,
			name: role.name,
			vip: role.vip,
			set: role.set,
			power: role._power,
			icon:role.iconid,
			headid:role.headid,
			frameid:role.frameid
		}
		return tmp;
	});

	ctx.body = {applylist: applys};
}
