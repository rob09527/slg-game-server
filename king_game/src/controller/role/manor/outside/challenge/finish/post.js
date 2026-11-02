
'use strict'
// 请求战斗结果
module.exports = exports = async (ctx, next) => {

	let { battleid, index } = ctx.request.body;
	let battle = await ctx.dao.c_battle.findOne({ _id: battleid });
	ctx.assert(battle, 'invalid battleid');
	await battle.cal();
	let ret = battle.result;
	let items = [];
	let kill_reward = []; // 击杀奖励,单独一个字段
	let kill = 0; // 被击杀状态;
	let damge;// 伤害值
	let videoid;
	let nosave;
	if (index >= 0) {
		// 小怪
		let monster = ctx.manor.monsters[index];
		ctx.assert(monster, 'no manor monster');
		// 已被击杀返回
		ctx.assert(monster.state == 1, 'monster has dead');
		let config = global.gameconfig.newmanor_monster_gift[monster.id];
		ctx.assert(config, 'invliad items config');
		// 记录是否有战斗为lose并且血量为0的时候
		if (ret.rtper <= 0 && battle.result.ret == 'lose') {
			console.error(`MANRO_FINISH_MARK_LOSE BATTLEID ${battleid}`);
		}
		// 判断胜负发击杀奖励
		if (battle.result.ret == 'win' || ret.rtper <= 0) {
			// 判断是什么类型
			const _items = config.F_KILL.map(function (item) {
				return {
					GSID: item.GSID,
					COUNT: item.COUNT
				}
			})
			items.append(_items);
			monster.state = 3;// 被击杀
			kill = monster.state
			await global.dao.warorder.point(ctx.role, 90565);  // 卧龙战令-府邸扫荡
			await global.dao.warorder.point(ctx.role, 90574);  // 卧龙战令-终极任务-府邸剿匪
			// 扣粮草
			ctx.role.castItemsNoSave({ gsid: 38007, count: 1 });
		}
		ctx.manor.monsters[index] = monster
		ctx.manor.markModified('monsters');
	} else {
		// boss
		let boss = ctx.manor.bossinfo[0];
		ctx.assert(boss, 'no manor boss');
		// 判断boss是否死掉
		ctx.assert(boss.totaldamage < boss.maxhp, 'boss has dead');
		boss.totaldamage += ret.rlosthp;
		boss.nowhp = boss.nowhp - ret.rlosthp;
		boss.state = 2; // 已挑战未击杀
		let config = global.gameconfig.newmanor_monster[ctx.manor.monsterlv];
		// 发挑战奖励
		let _items = config.BOSS_FIGHTING_GIFT.map(function (item) {
			return {
				GSID: item.GSID,
				COUNT: ctx.random.between(item.MIN, item.MAX)
			}
		})
		_items = _items[ctx.random.between(0, _items.length - 1)];
		if (_items) items.append(_items);

		if (!battle.mark) {
			boss.lastdamage = ret.rlosthp;
		}
		if (battle.mark) {
			// 有friendid
			// 查好友信息
			let friendInfo = await ctx.dao.role.findOne({ _id: battle.mark });
			// save video
			let {
				seed,
				season,
				rcards,
		    	lcards,
				result: {
					version,
					ret: result,
					lper, rper,
					ltper, rtper,
					report,
				}
			} = battle;
			let video = {
				lper, rper,
				ltper, rtper,
				report,
				seed,
				rcards,
		    	lcards,
				season,
				result,
				left: {
					info: {
						rname: friendInfo.rname || '',
						level: friendInfo.level || '',
						iconid: friendInfo.iconid || '',
						headid: friendInfo.headid || '',
						frameid: friendInfo.frameid || ''
					},
					'set': battle.player
				},
				right: {
					info: {
						level: battle.season.right
					},
					'set': battle.enemy
				},
			}
			video = new ctx.dao.video({
				type: 'manor',
				rid: friendInfo.i(),
				video: JSON.stringify(video),
				mark: battle.mark,
				version,
			})
			video.save().catch(console.error);
			// 返回录像id
			videoid = video.i();
		}
		// BOSS击杀奖励 发放
		if (boss.totaldamage >= boss.maxhp) {
			kill_reward.append(config.BOSS_KILL_GIFT);
			if (kill_reward.length > 0 ) ctx.role.addItemsNoSave(kill_reward);
			boss.state = 3; // 被击杀
			kill = boss.state;
			await global.dao.warorder.point(ctx.role, 90565);  // 卧龙战令-府邸扫荡
			await global.dao.warorder.point(ctx.role, 90574);  // 卧龙战令-终极任务-府邸剿匪
			// 生成新的关卡数据
			let { monsters, bossinfo: newboss, lv } = await ctx.dao.newmanor.createMonster(ctx.manor.monsterlv + 1);
			ctx.manor.monsters = monsters;
			ctx.manor.bossinfo = newboss;
			if (lv == ctx.manor.monsterlv + 1) {
				// 说明切关卡了,记录历史最大通关数
				ctx.role.addItemsNoSave(97054);
				// 排名保存redis
				let rankService = new global.services.RankService('manor', ctx.role._gameserv.groupid);
				await rankService.set({
					id: ctx.role.i(),
					score: ctx.manor.monsterlv
				});
				ctx.manor.monsterlv = lv;
				ctx.manor.markModified('monsterlv');
			}
			ctx.manor.markModified('monsters');
			nosave = true;
		}
		damge = ret.rlosthp;

		if (!nosave) {
			ctx.manor.bossinfo[0] = boss;
			ctx.manor.markModified('bossinfo');
		}
		ctx.role.castItemsNoSave({ gsid: 38007, count: 1 });
	}

	// save
	await ctx.manor.save();
	if (items.length > 0) ctx.role.addItemsNoSave(items);
	ctx.role.missionInvoke('MANOR_OUTSIDE_CHALLENGE');
	await ctx.role.save()
	ctx.body = {
		result: ret,
		items: [...items, ...kill_reward.map(o => ({...o, kill: 1}))],
		kill,
		damge,
		videoid
	};
}
