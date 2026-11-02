
'use strict'

module.exports = exports = async (ctx, next) =>{
	let record;
	try {
		record = await ctx.dao.c_cwhstime.create({rid: ctx.role._id});
	}catch(e){
		record = await ctx.dao.c_cwhstime.findOne({rid: ctx.role._id});
	}
	ctx.body = {
		stime: record.create,
	};
}