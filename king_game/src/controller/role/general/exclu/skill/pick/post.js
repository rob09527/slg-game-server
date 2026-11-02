
'use strict'

module.exports = exports = async function (ctx, next) {
	let {
		level,
		skill,
	} = ctx.general.exclusive;
	ctx.assert(level >= 18, 'lv nenough');
	let {
		skillGsids = [],
	} = ctx.request.body;
	ctx.role._path_ += '#' + ctx.general._id.toString() + "," + skillGsids.join(',');
	ctx.assert(skillGsids.length >= 2, 'gsid len');
	ctx.assert(!(skillGsids[0] === skill[0] && skillGsids[1] === skill[1]), 'same skill');
	ctx.role.castItemsNoSave({gsid: 30047, count: 1});
	skillGsids = skillGsids.map(num=> Number.parseInt(num));
	// 检查技能是否在技能池中
	let skillPools = global.gameconfig.exclusive['39000'][level - 1];
	ctx.assert(skillPools, 'config nexist');
	skillPools = skillPools.SARR;
	let in_skillPool = skillGsids.every(function (gsid, index) {
		let pool = global.gameconfig.exclusiveskill[skillPools[index]];
		ctx.assert(pool, 'skillset nexist');
		return !!pool.deepQueryOne('ID', gsid);
	})
	ctx.assert(in_skillPool, 'nin skillset');
	ctx.general.exclusive.skill = skillGsids;
}