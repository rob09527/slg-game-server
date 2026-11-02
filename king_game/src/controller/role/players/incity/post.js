
'use strict'

module.exports = exports = async (ctx, next) =>{
	let city = ctx.role.maxmapid.toString().slice(0, 3);
	city = global.gameconfig.city.deepQueryOne('ID', parseInt(city));
	ctx.assert(city, 'invalid mapid');
	city = city.CHAPTERS.map(function (mapid) {
		return global.gameconfig.maplist.indexOf(mapid.toString());
	})
	let roles = [];
	let tmp = await ctx.dao.role.find({_id: {$ne: ctx.role._id}, _maxmapid: {$in: city}}, {_id: 1}, {limit:5});
	roles.append(tmp);
	if (roles.length < 5) {
		tmp = await ctx.dao.role.find({'hide.38001.count': {$gte: ctx.role.level - 5, $lte: ctx.role.level + 5}}, {_id:1}, {limit: 5 - roles.length});
		roles.append(tmp);
	}
	roles = roles.map(function (r) {
		return r.i();
	})
	ctx.body = roles;
}