'use strict'


module.exports = exports = async (ctx, next) => {
	const { chapter } = ctx.request.body;
	ctx.assert(parseInt(chapter) == ctx.boss.index + 1, 'boss change');
	ctx.assert(!ctx.boss.killed.time, 'boss dead');
	ctx.record = ctx.boss._roles[ctx.role.i()];
	// 可以挑战次数
	let max_time = global.gameconfig.lbosscast.TIME;
	if (ctx.role.special.gz > 0) {
		max_time += global.gameconfig.recharge.specialgz.LEGION_BOSS || 0;
	}
	if (ctx.role.special.zz > 0) {
		max_time += global.gameconfig.recharge.specialzz.LEGION_BOSS || 0;
	}
	const challenge_time = ctx.role.getItems(90267).count;
	ctx.assert(challenge_time < max_time, 'no more');
	// 挑战消耗
	const yb_num = global.gameconfig.lbosscast.COST[challenge_time];
	ctx.assert(typeof yb_num === 'number', 'no more');
	if (yb_num > 0) ctx.role.castItemsNoSave({ gsid: 38005, count: yb_num }, { main: 'legion', sec: 'boss' });
	await next();
	// 联盟特权加成
	let lm_add_rate = global.gameconfig.others.LEGION.RIGHT_ADD_RATE;
	// 春季加成
	let season_add = 0;
	let { season } = ctx.bseason();
	if (season == 1) season_add = global.gameconfig.others.BATTLESEASON.VALS[season - 1];
	// 挑战奖励
	const items = ctx.config.ITEMS.map(({ GSID, COUNT: count }) => {
		count = count * (1 + season_add / 100);	// 春季加成
		if (GSID == 30020) count = count * (1 + (ctx.role.special.lm >= Date.now() ? lm_add_rate : 0) / 100);	// 联盟特权加成
		return { GSID, COUNT: Math.floor(count) };
	})
	ctx.role.addItemsNoSave(items, { main: 'legion', sec: 'boss' });
	// 挑战次数
	ctx.role.addItemsNoSave(90267);
	await ctx.role.save();
	ctx.body = ctx.body || {};
	ctx.body.last = ctx.boss.last;
	ctx.body.rewards = items;
	// boss被击杀,发邮件
	if (ctx.boss.totaldamges >= ctx.config.BOSSHP) {
		ctx.body.kill = 1;
		ctx.boss.killed = {
			time: Date.now(),
			by: ctx.role._id,
		}
		// 邮件发放奖励
		const mails = [];
		// 所有成员通关奖励
		for (let { rid } of ctx.legion._members) {
			let obj = await ctx.dao.role.findOne({ _id: rid }, { lbossrecord: 1, special: 1 });
			if (!obj) continue;
			let mail = {
				rid,
				type: 1,
				title: ctx.textgetter("LEGIONBOSSKILLMANYT"),	// 无法获得奖励邮件通知
				content: ctx.textgetter("LEGIONBOSSKILLMANYC", ctx.boss.index + 1, ctx.config.NAME)
			}
			// 奖励发放
			if (!obj.lbossrecord[ctx.boss.index]) {
				mail.type = 2;
				mail.reward = ctx.config.KITEMS.map(({ GSID, COUNT: count }) => {
					count = count * (1 + season_add / 100);	// 春季加成
					if (GSID == 30020) count = count * (1 + (obj.special.lm >= Date.now() ? lm_add_rate : 0) / 100);	// 联盟特权加成
					return { GSID, COUNT: Math.floor(count) };
				});
				mail.title = ctx.textgetter('LEGIONBOSSKILLT');	// 击杀奖励
				mail.content = ctx.textgetter('LEGIONBOSSKILLC', ctx.boss.index + 1, ctx.config.NAME);
			}
			mails.push(mail);
		}
		// 排名奖励
		let damges = ctx.boss.roles;
		const rates = global.gameconfig.others.LEGION.BOSS.KILLRANK;
		for (let idx = 0; idx < damges.length; idx++) {
			const record = damges[idx];
			for (const r of rates) {
				const rank = idx + 1;
				if (rank > r.RANK) continue;
				const ret = await ctx.dao.role.findOne({ _id: record.rid }, { lbossrecord: 1, 'special.lm': 1 });
				if (!ret) break;
				// 已获取击杀奖励不再发排行奖励
				if (ret.lbossrecord[ctx.boss.index]) break;
				// 奖励数量根据排名比例及联盟特权加成发放
				const rate = (ret.special.lm >= Date.now() ? lm_add_rate : 0) / 100
				let reward = ctx.config.KITEMS.map(({ GSID, COUNT }) => {
					return {
						GSID,
						COUNT: Math.floor(COUNT * (r.RATE / 100) * (1 + rate)),
					}
				})
				mails.push({
					rid: record.rid, type: 2,
					title: ctx.textgetter('LEGIONBOSSKILLRANKT'),	// 击杀奖励
					content: ctx.textgetter('LEGIONBOSSKILLRANKC', ctx.boss.index + 1, ctx.config.NAME, record.damges, rank),
					reward,
				})
				break;
			}
		}
		// 更新军团成员击杀记录
		let $in = ctx.legion._members.map(({ rid }) => rid);
		let cond = {
			_id: $in,
			[`lbossrecord.${ctx.boss.index}`]: { $exists: 0 },
		}
		let $set = {
			[`lbossrecord.${ctx.boss.index}`]: Date.now(),
		}
		// 异步执行
		Promise.all([
			ctx.dao.mail.insertMany(mails),
			ctx.dao.role.updateMany(cond, { $set }),
		]).catch(console.error);
		// 推送
		const msg = {
			type: 'legion_boss',
			content: {
				id: ctx.boss.index + 1
			}
		};
		ctx.legion._members.forEach(item => {
			pushClient(item.rid, msg);
		})
	}
	ctx.boss.markModified('_roles.' + ctx.role.i());
	await ctx.boss.save();
}
