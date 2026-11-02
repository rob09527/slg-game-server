
'use strict'
// 角色月度boss最高击杀进度
const {
	BIGBATTLE: {
		MBOSS: {
			TAG,
		},
	},
} = global.gameconfig.others;
const { hitHere } = require("../../../../../util/weektarget");

module.exports = exports = async (ctx, next) =>{
	await next();
	ctx.times = ctx.times || 1;
	let items = [];
	if (ctx.chapter.CREWARDS){ // 有配置 挑战奖励则发挑战奖励
		for (let i = 0; i < ctx.times; i++) {
			const _items = ctx.chapter.CREWARDS.map(function (item) {
				return {
					GSID: item.GSID,
					COUNT: ctx.random.between(item.CCOUNT[0], item.CCOUNT[1]),
				}
			})
			items.append(_items);
		}
	}

	items = items.arrange();

	ctx.body.items = items;


	if (ctx.record.totaldamge >= ctx.chapter.BOSSHP) {
		ctx.body.kill = 1;
		const tagGsid = TAG[ctx.record.index]; // 取出埋点GSID
		const {
			INDEX_NAME: {
				[ctx.record.index]: i_name
			},
			SINDEX_NAME: {
				[ctx.record.subindex]: si_name
			},
		} = global.gameconfig.others.BIGBATTLE.MBOSS;
		const KILL_REWARDS = [];
		if (ctx.record.maxsubindex < ctx.OLD_SUBINDEX){ // 有最高通关标记 并 突破记录
			ctx.record.maxsubindex = ctx.OLD_SUBINDEX;
			ctx.record.last = Date.now();
			// 排名保存redis
			let rankService = new global.services.RankService('yuangu', ctx.role._gameserv.groupid);
			await rankService.set({
				id: ctx.role.i(),
				score: ctx.record.maxsubindex
			});
			if (ctx.config.LEVEL_MARK){ // 用标记的方式记录最高值（如果有此配置
				const historyHighest = ctx.role.getProp(ctx.config.LEVEL_MARK);
				if (ctx.OLD_SUBINDEX - historyHighest > 0){
					KILL_REWARDS.push({GSID: ctx.config.LEVEL_MARK, COUNT:  ctx.OLD_SUBINDEX - historyHighest  }); // 避免出现负数，可
				}
			}

			ctx.is_first = true; // 标记第一次击杀
			if (ctx.chapter.FIRST_REWARDS){ // 首通奖励
				KILL_REWARDS.push(...ctx.chapter.FIRST_REWARDS);
			}
		} else {
			KILL_REWARDS.push(...ctx.chapter.REWARDS);
		}
		if (ctx.chapter.REWARD_TYPE === 1) { // REWARD_TYPE === 1 表示直接发放奖励
			ctx.body.items.append(KILL_REWARDS.map(o => ({...o, kill: 1})));
			ctx.body.items.arrange();
		} else {
			await ctx.dao.mail.create({ // ，非1则 是通过邮件发放奖励,  MAIL_T配置击杀邮件标题，默认是月度boss的标题
				rid: ctx.role._id,
				type: 2,
				title: ctx.textgetter(ctx.chapter.MAIL_T || 'MONTHLYBOSSKILLT', i_name),
				content: ctx.textgetter(ctx.chapter.MAIL_C  || 'MONTHLYBOSSKILLC', si_name),
				reward: KILL_REWARDS,
			})
		}

		ctx.record.subindex++;
		ctx.record.totaldamge = 0;
		ctx.record.lastdamge = 0;
        ctx.record.update = Date.now();
		if (tagGsid){
			const historyHighest = ctx.role.getItems(tagGsid).count;
			const current = ctx.record.subindex;
			if (historyHighest < current){ // @author awko 新增历史最高BOSS挑战的埋点
				ctx.role.addItemsNoSave({GSID: tagGsid, COUNT: current-historyHighest });
			}
		}
	}
	ctx.handle_challenge_callback && ctx.handle_challenge_callback(); // 处理一些挑战过后的自定义逻辑

	ctx.role.addItemsNoSave(ctx.body.items, {main: 'bigbattle', sec: 'mboss'});

	if( ctx.params.type === 'mboss' && ctx.record.index < 3){ // index < 3 为 月度 boss ,其他情况则为限时boss
		ctx.role.missionInvoke('DAZHANYI_MBOSS_HISTORY');
		hitHere(ctx.role, 94212, ctx.times, true);	// 七日目标-月度战役挑战次数
		ctx.role.dispatchEvent('EVENT_MBOSS' , ctx.record.subindex , {ret: ctx.record.index});
	}

	await ctx.role.save();
	await ctx.record.save();
}
