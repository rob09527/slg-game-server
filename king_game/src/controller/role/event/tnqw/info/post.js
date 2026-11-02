
'use strict'

module.exports = exports = async function (ctx, next) {
	let {
		SCORE,
		BOSS: {
			LIST,
			DETAIL
		},
	} = global.gameconfig.zhd[ctx.tag.toUpperCase()];
	let event = SCORE.map(function (info) {
		let {
			MARK: mark,
			LIMIT: limit,
			INTRO: intro,
		} = info;
		return {mark, limit, intro};
	})
	// 按照下标遍历boss状态
	let bosslist = [];
	for (let i = 0; i < LIST.length; i++) {
		let {
			NUM,
			TARGETS,
		} = LIST[i];
		// 整理击杀奖励中gsid
		let rewardgsids = {};
		for (let bossid of TARGETS) {
			let config = DETAIL[bossid];
			if (!config) continue;
			for (let {GSID} of config.KREWARD) {
				rewardgsids[GSID] = 1;
			}
		}
		rewardgsids = Object.keys(rewardgsids);
		let tmp = {
			// 默认没有激活
			status: 0,
			// 击杀后可获得的物品gsid列表
			rewardgsids,
		}
		if (NUM) tmp.actscore = NUM;
		let boss = await ctx.dao.tnqwboss.findOne({rid: ctx.role.i(), index: i, tag: ctx.tag});
		if (boss) {	// boss已生成
			let base = boss.base();
			tmp.status = 1;
			tmp.maxhp = base.maxhp;
			tmp.nowhp = base.nowhp;
			if (boss.kill) tmp.status = 2;
		}else{	// boss为生成,判断积分是否足够激活
			if(ctx.tag == "sslx") {
				if (i < 4) {	// 青龙,白虎,朱雀,玄武
					if (ctx.total_score >= NUM) tmp.status = 1;
				}else{	// 麒麟
					// 特殊条件(前4个boss击杀后激活麒麟)
					let all_kill = bosslist.every(({status}) =>{
						return status == 2;
					})
					if (all_kill) tmp.status = 1;
				}
			}else { // tnqw boss按顺序一个激活
				if(i == 0) { // 第一个boss默认激活
					tmp.status = 1;
				}else {
					let last = await ctx.dao.tnqwboss.findOne({rid: ctx.role.i(), index: i - 1, tag: ctx.tag},{ kill: 1});
					if(last && last.kill) tmp.status = 1;
				}
			}
		}
		bosslist.push(tmp);
	}
	const data = { bosslist };
	if(ctx.tag == "sslx") data.event = event;
	ctx.body = data;
}