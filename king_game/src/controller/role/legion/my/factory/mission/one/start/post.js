
'use strict'

module.exports = exports = async (ctx, next) =>{
	ctx.assert(!ctx.mission.stime, 'already start');
	ctx.mission.stime = Date.now();
	const mindex = ctx.role.lmission.data.indexOf(ctx.mission);
	ctx.role.markModified('lmission.data.'+mindex+'.stime');
	ctx.mission.etime = ctx.mission.stime + ctx.config.TIMEMIN * 60 * 1000;
	ctx.body = ctx.mission;
}