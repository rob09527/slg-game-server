
'use strict'

module.exports = exports = async (ctx, next) =>{
	let {
		node,
		pos,
		battleid,
	} = ctx.request.body;
	let battle = await ctx.dao.c_battle.findOne({_id: battleid});
	ctx.assert(battle, 'invalid battleid');
	await battle.cal();
	let {
		seed,
		season,
		rcards,
		lcards,
		result: {
			version,
			ret: result,
			lper,
			rper,
			report,
		}
	} = battle;
	// 清空临时增益
	ctx.dginfo._buff.battle = [];
	ctx.dginfo.markModified('_buff.battle');
	// 保存武将血量
	for (let [pos, {guid}] of Object.entries(battle.player.team)) {
		if (typeof lper[pos] == 'number') {
			ctx.dginfo.generals[guid].hppercent = lper[pos];
		}
	}
	ctx.dginfo.markModified('generals');
	await ctx.dginfo.save();
	// 保存怪血量
	let hppercent = {};
	for (let [pos, percent] of Object.entries(rper)) {
		if (percent >= 10000) continue;
		hppercent[pos] = percent;
	}
	if (Object.keys(hppercent).length > 0) ctx.pos.hppercent = hppercent;
	ctx.chapter.markModified(['nodes', node, pos].join('.'));
	await ctx.chapter.save();
	ctx.body = {result: battle.result};
	// 保存录像
	let video = {
		lper,
		rper,
		report,
		seed,
		season,
		result,
		rcards,
		lcards,
		left: {
			info: {
				rname: ctx.role.name,
				level: ctx.role.level,
				iconid: ctx.role.iconid,
				headid:ctx.role.headid,
				frameid: ctx.role.frameid
			},
			'set': battle.player
		},
		right: {
			info: {
			},
			'set': battle.enemy
		},
	}
	video = new ctx.dao.video({
		type: 'dungeon',
		rid: ctx.role.i(),
		video: JSON.stringify(video),
		mark: result,
		version,
	})
	ctx.role.addItemsNoSave(90457); // 记录战斗 次数
	if (battle.result.ret === 'win'){
		ctx.role.dispatchEvent('EVENT_DUNGEON' , 1 , {ret: node, node});
	}
	ctx._need_role_save_ = true;

	video.save().catch(console.error);
	// 返回录像id
	ctx.body.videoid = video.i();
}
