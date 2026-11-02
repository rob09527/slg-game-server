
'use strict'

const secretTask = require("../../../../../../../../../../model/secretRealmRole/instance/secretTask");

module.exports = exports = async (ctx, next) => {
	// 私有逻辑设置阵容
	let {
		battleset,
	} = ctx.request.body;
	if (battleset) {
		let guid = Object.values(battleset.team);
		ctx.assert(guid.length == 1, 'only ageneral');
		guid = guid[0];
		let general = ctx.dginfo.generals[guid];
		ctx.assert(general, 'gcache nexist');
		ctx.role.battlearr.dungeon = battleset;
		ctx.role.markModified('battlearr.dungeon');
		ctx.role._powerbattleset.dungeon = general.power;
		ctx.role.markModified('_powerbattleset.dungeon');
		await ctx.role.save();
	}
	let { type, id, hppercent } = ctx.pos;
	// 神秘事件内容指定
	if (type == 5) ({ type, id } = ctx.pos.event);
	ctx.assert(type <= 3, 'not battleevent');
	// 处理增益
	let specialbuff = [];
	for (let [attr, val] of Object.entries(ctx.dginfo.buff)) {
		specialbuff.push({ [attr]: val });
	}
	for (let [attr, val] of Object.entries(ctx.dginfo.spbuff)) {
		specialbuff.push({ [attr]: val });
	}
	// 获取武将缓存数据
	let player = {
		mythic: {},
		team: {},
		// zhenfa: {},
	}
	ctx.assert(ctx.role.battlearr.dungeon, 'no battleset')
	let {
		mythic,
		team,
		zhenfa,
	} = ctx.role.battlearr.dungeon;
	if (zhenfa) {
		zhenfa = await ctx.dao.zhenfa.getZf(ctx.role._id, zhenfa);
		if (zhenfa) {
			zhenfa = zhenfa.info();
			player.zhenfa = {
				id: zhenfa.id,
				lv: zhenfa.lv,
				skillID: zhenfa.skillID,
				pos: zhenfa.pos,
				pickAttr: zhenfa.pickAttr,
			}
		}
	}
	if (mythic && ctx.role.mythical[mythic]) {
		player.mythic = ctx.role.mythical[mythic];
		player.mythic.tid = mythic;
	}
	for (let [pos, general] of Object.entries(team)) {
		general = ctx.dginfo.generals[general];
		ctx.assert(general, 'invalid guid');
		general.specialbuff = specialbuff;
		player.team[pos] = general;
	}
	ctx.assert(player, 'no battleset');
	let battle = new ctx.dao.c_battle({
		type: 'dungeon',
		rid: ctx.role._id,
		player,
	})
	// 剩余血量传入
	await battle.createEnemy(id, hppercent).save();
	ctx.body = battle.base();
	//秘境主线任务打点
	await secretTask(ctx, 99549, 1)
}
