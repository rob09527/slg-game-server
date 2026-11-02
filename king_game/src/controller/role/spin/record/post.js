
'use strict'

const {RECORD_LIMIT} = global.gameconfig.others.SPIN;

module.exports = exports = async (ctx, next) =>{
	let condition = {type: ctx.stype};
	const self = parseInt(ctx.request.body.self);
	if (self) condition.rid = ctx.role._id;
	let records = await ctx.dao.spinrecord.find(condition);
	records = records.map(function (r) {
		return new Promise(function (resolve, reject) {
			r = r.info();
			if (self) {
				delete r.rid;
				resolve(r);
			}else{
				ctx.dao.role.findOne({_id: r.rid}, {rname: 1}).limit(RECORD_LIMIT).exec()
				.then(function (ret) {
					r.name = ret.rname;
					delete r.rid;
					resolve(r);
				})
				.catch(reject)
			}
		});
	})
	ctx.body = await Promise.all(records);
}