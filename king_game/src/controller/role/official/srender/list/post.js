
'use strict'

module.exports = exports = async function (ctx, next) {
	let prisonerlist = await ctx.dao.prisoner.find({ rid: ctx.role._id });
	ctx.body = prisonerlist.map(prisoner => {
		let {
			gsid,
			loyal,
			state,
			create,
			imprisonmentTime,
			type
		} = prisoner;
		let config = global.gameconfig.surrender.deepQueryOne('GSID', gsid);
		if (!config) return;
		return {
			id: prisoner._id.toString(),
			gsid,
			loyal,
			state,
			cost: config.CAST,
			kill: config.KILL,
			rating: config.RATING,
			create,
			type,
			imprisonmentTime

		}
	}).filter(Boolean);
}
