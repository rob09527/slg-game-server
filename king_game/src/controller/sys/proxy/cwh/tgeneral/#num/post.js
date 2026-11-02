
'use strict'

module.exports = exports = async function (ctx, next) {
	let {uid} = ctx.request.body;
	let role = await ctx.dao.role.findOne({uid});
	ctx.assert(role, 'role nexist');
	let generals = await role.generals();
	generals.sort(function (pre, nxt) {
		return pre.power > nxt.power ? -1: 1;
	})
	let num = parseInt(ctx.params.num) || 1;
	generals = generals.reduce((cur, general) =>{
		let name = 'unknow';
		let config = global.gameconfig.general[general.gsid];
		if (config) name = config.NAME;
		cur[name] = cur[name] || {power: -1};
		if (general.power > cur[name].power) {
			let {power, guid} = general;
			cur[name] = {power, guid};
		}
		return cur;
	}, {})
	let tmp = [];
	for (let name in generals) {
		let {power, guid} = generals[name];
		tmp.push({name, power, guid});
	}
	tmp.sort((pre, nxt) =>{
		return pre.power > nxt.power? -1: 1;
	})
	ctx.body = tmp.slice(0, num);
}
