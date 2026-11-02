
'use strict'

module.exports = exports = async function (ctx, next) {
	let cond = {
		legion: ctx.legion._id,
		create: {
			$gte: Date.now() - 7 * 24 * 60 * 60 * 1000,
		},
	}
	let loglist = await ctx.dao.c_legionsignlog.find(cond).sort({_id: -1});
	loglist = loglist.map(log => {
		log = log.toJSON();
		let {
			_id,
			__v,
			legion,
			rid,
			..._log
		} = log;
		return _log;
	});
	ctx.body = {
		log: loglist,
	}
}