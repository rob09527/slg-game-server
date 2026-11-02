
'use strict'

module.exports = exports = async function (ctx, next) {
	let {
		// boss下标
		index,
	} = ctx.request.body;
	index = parseInt(index || 0);
	ctx.boss = await ctx.dao.tnqwboss.findOne({rid: ctx.role.i(), index, tag: ctx.tag});
	// 根据等级生成boss信息
	let {
		BOSS: {
			LIST,
			DETAIL,
		},
		SCORE,
	} = global.gameconfig.zhd[ctx.tag.toUpperCase()];
	if (!ctx.boss) {
		ctx.boss = new ctx.dao.tnqwboss({rid: ctx.role.i(), index, tag: ctx.tag});
		let {
			NUM,
			TARGETS
		} = LIST[index];
		if(ctx.tag == "sslx") {
			if (index < 4) {	// 检查积分足够激活
				ctx.assert(ctx.total_score >= NUM, 'not active');
			}else{	// 检查前几个boss是否被击杀(麒麟)
				let all = [];
				for (let i = 0; i < 4; i++) {
					let boss = await ctx.dao.tnqwboss.findOne({rid: ctx.role.i(), index: i, tag: ctx.tag});
					if (boss && boss.kill) all[i] = true;
				}
				all = all.every(kill => !!kill);
				ctx.assert(all, 'not active');
			}
		}else {
			if(index > 0) {
				let last = await ctx.dao.tnqwboss.findOne({rid: ctx.role.i(), index: index - 1, tag: ctx.tag},{ kill: 1});
				ctx.assert(last && last.kill, 'not active');
			}
		}
		for (let bossid of TARGETS) {
			let {
				LV: [
					lv_min,
					lv_max,
				]
			} = DETAIL[bossid];
			if (ctx.role.level >= lv_min && ctx.role.level <= lv_max) {
				ctx.boss.bossid = bossid;
				break;
			}
		}
		ctx.assert(ctx.boss.bossid, 'empty bossid');
		await ctx.boss.save();
	}
	ctx.config = LIST[ctx.boss.index];
	ctx.detail_config = DETAIL[ctx.boss.bossid];
	await next();
}