
'use strict'

/**
 * @deprecated 废弃
 * @type {exports}
 */
module.exports = exports = async (ctx, next) =>{
	const {MAXBPHYS: maxbphys, MAXQPHYS: maxqphys} = global.gameconfig.others.FRIEND;
	let boss = await ctx.dao.fboss.fetchBoss(ctx.role._id);
	if (boss) {
		ctx.body = {maxbphys};
		ctx.body.boss = boss.base();
		let fconfig = global.gameconfig.battlefboss;
		ctx.assert(fconfig, 'fconfig nexist');
		fconfig = fconfig[boss.bossid];
		ctx.assert(fconfig, 'invalid bossid');
		ctx.body.boss.bset = fconfig;
		const self = boss.roles.deepQueryOne('rid', ctx.role.i());
		if (self) ctx.body.boss.lastdamges = self.lastdamges;
		return;
	}
	ctx.body = {maxqphys};
	let chapters = [];
	const {fchapter} = global.gameconfig;
	for (const c_config of fchapter) {
		let tmp = {
			chapterid: c_config.ID,
			exploremin: c_config.MIN,
			power: c_config.POWER,
			status: 0,
		}
		const record = await ctx.dao.fquest.findOne({rid: ctx.role._id, chapterid: c_config.ID});
		if (record) {
			tmp.friends = [];
			for (const frid of record.friends) {
				const friend = await ctx.dao.role.findOne({_id: frid});
				if (!friend) continue;
				tmp.friends.push({
					id: frid,
					iconid: friend.iconid,
					headid:friend.headid,
					frameid:friend.frameid,
					rname: friend.name,
					level: friend.level,
					power: friend._power,
					lasttime: friend.update,
				})
			}
			tmp.etime = record.start + c_config.MIN * 60 * 1000;
			tmp.status = Date.now() > tmp.etime? 2: 1;
		}
		chapters.push(tmp);
	}
	ctx.body.chapters = chapters;
}
