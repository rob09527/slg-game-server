
'use strict'

module.exports = exports = async (ctx, next) =>{
	const mail = await ctx.dao.mail.find({
		rid: ctx.role._id,
		create: {$gte: Date.now() - 30 * 24 * 60 * 60 * 1000},
		state: { $ne: 3 },
	}).sort({create: -1}).limit(50);
	ctx.body = mail.map(function (m) {
		return m.base();
	})
}