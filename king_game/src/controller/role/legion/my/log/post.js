
'use strict'

module.exports = exports = async (ctx, next) =>{
	let select = {
		_id: 0,
		event: 1,
		params: 1,
		create: 1,
	}
	let list = await ctx.dao.c_legionlog.find({legion: ctx.legion._id}).select(select).sort({_id: -1}).limit(30);
	ctx.body = {list};
}