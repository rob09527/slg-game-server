
'use strict'

module.exports = exports = async ctx =>{
	ctx.assert(!ctx.mission.stime, 'already start');
	const mid = ctx.mission.id;
	const config = global.gameconfig.legionmission;
	let minfo = config.deepQueryOne('ID', ctx.mission.id);
	ctx.assert(minfo, 'invalid missionid');
	const cindex = config.indexOf(minfo);
	let next = config[cindex + 1];
	ctx.assert(next, 'cant up');
	ctx.role.castItemsNoSave({gsid: 38005, count: minfo.YB}, {main: 'legion', sec: 'factorymissionlv'});
	ctx.mission.id = next.ID;
	const mindex = ctx.role.lmission.data.indexOf(ctx.mission);
	ctx.role.markModified('lmission.data.'+mindex);
	ctx.body = ctx.mission;
}