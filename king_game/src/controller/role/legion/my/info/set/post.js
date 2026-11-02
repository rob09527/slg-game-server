
'use strict'

const chkcontent    = require("../../../../../../util/chkcontent")
const h5post        = require("../../../../../../util/h5post")

module.exports = exports = async (ctx, next) =>{
	const pos = ctx.legion._members.deepQueryOne('rid', ctx.role.i()).pos;
	ctx.assert(pos > 1, 'permission deny');
	let {notice, minlv,demonstrate, ispass} = ctx.request.body;
	if (notice) {
		const chk = await chkcontent(ctx.role, 1, notice);
		ctx.assert(chk, "invalid string");
		ctx.legion.notice = notice;
	}
	if (demonstrate) ctx.legion.demonstrate = demonstrate;
	if (typeof ispass !== 'undefined') ctx.legion.ispass = parseInt(ispass)? true: false;
	if (typeof minlv !== 'undefined') ctx.legion.minlv = parseInt(minlv);
	await ctx.legion.save();
	ctx.body = {};
}
