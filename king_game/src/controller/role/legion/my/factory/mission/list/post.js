
'use strict'

module.exports = exports = async ctx =>{
	const {isupdate} = ctx.request.body;
	const del = Date.now() - ctx.role.lmission.refresh;
	let isref = false;
	if (isupdate) {
		ctx.assert(del > 12 * 60 * 60 * 1000, 'time limit');
		isref = true;
	}
	if (isref) {
		ctx.role.lmission.refresh = Date.now();
		ctx.role.lmission.data = ctx.getNewMission();
		ctx.role.markModified('lmission');
		await ctx.role.save();
	}
	const list = ctx.role.lmission.data.map(function (m) {
		const config = global.gameconfig.legionmission.deepQueryOne('ID', m.id);
		ctx.assert(config, 'invalid missionid');
		if (m.stime) m.etime = m.stime + config.TIMEMIN * 60 * 1000;
		return m;
	})
	ctx.body = {
		list,
		time: ctx.role.lmission.refresh,
	};
}