const moment = require('moment');
'use strict'
module.exports = exports = async (ctx, next) => {
	ctx.legion = await ctx.dao.legion.findOne({ _id: ctx.role.legion });
	ctx.assert(ctx.legion, 'invalid legion');
	const { LEGION_LEVEL: wBossOpenLevel = 0, OPEN_SERVER_DAY: open_server_day = -1 } = global.gameconfig.legionwboss.UNLOCK

	// 判断有几个解锁条件。有1个解锁条件则只需判断一个。两个则判断两个。
	ctx.unlock = {};
	let server_day = 0;
	if (wBossOpenLevel > 0) ctx.unlock['LEGION_LEVEL'] = wBossOpenLevel;
	if (open_server_day > -1) {
		// 判断当前服务器开服几天了。
		server_day = moment(ctx.role._gameserv.groupstart).add(open_server_day, 'day').valueOf();
		ctx.unlock['OPEN_SERVER_DAY'] = server_day;
	}
	// 军团等级与开服时间，条件判断
	if ((((ctx.legion.level >= ctx.unlock['LEGION_LEVEL'] || Date.now() > ctx.unlock['OPEN_SERVER_DAY']) && Object.keys(ctx.unlock).length == 1) ||
		ctx.legion.level >= ctx.unlock['LEGION_LEVEL'] && Date.now() > ctx.unlock['OPEN_SERVER_DAY'] && Object.keys(ctx.unlock).length == 2
	) && ctx.legion.secretplace == 0) {
		// 设置secretplace值
		let lmails = ctx.legion._members.map(function (m) {
			let cond = {
				rid: m.rid,
				title: ctx.textgetter('LEGION_OPEN_SECRETPLACET'),
				content: ctx.textgetter('LEGION_OPEN_SECRETPLACEC')
			};
			let mail = new ctx.dao.mail(cond);
			mail.from.type = 'legion';
			// 军团开启神将试炼后,当前的成员不需要获得诅咒状态
			ctx.dao.role.updateOne({ _id: m.rid }, { $set: { 'others.90390.count': 1 } }).catch(console.error);
			return mail.save();
		});
		await Promise.all(lmails);
		ctx.legion.secretplace = Date.now();
		await ctx.legion.save();
	}
	await next();
}
