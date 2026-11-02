
'use strict'

module.exports = exports = async function (ctx, next) {
	let {
		monument,
		index,
	} = ctx.request.body;
	index = Number.parseInt(index);
	let config = global.gameconfig.rankmission[monument];
	ctx.assert(config, 'invalid monument');
	config = config[index];
	ctx.assert(config, 'invalid mission');
	let {
		MARK,
		BENEFIT,
	} = config;
	ctx.assert(ctx.role.getItems(MARK).count <= 0, 'already take');
	let record = await ctx.dao.rankmission.findOne({type: monument, missionIndex: index, groupid: ctx.role._gameserv.groupid});
	ctx.assert(record, 'not avaliable');
	ctx.role.addItemsNoSave([...BENEFIT, MARK]);
	await ctx.role.save();
	ctx.body = BENEFIT;
}
