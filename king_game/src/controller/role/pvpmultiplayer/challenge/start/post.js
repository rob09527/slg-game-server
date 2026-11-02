
'use strict'

const getpvpinfo = require("../../../../../model/c_pvp_three/instance/getpvpinfo");
const matchscore = require("../../../../../model/c_pvp_three/instance/matchscore");
const { score } = require("../../../../../model/c_pvp_three/schema");
const isBetweenThursday2330AndFriday0030 = require("../../../../../util/isBetweenThursday2330AndFriday0030");

module.exports = exports = async (ctx, next) => {
	let {
		index = 0,
		mode = 0,
		target,
	} = ctx.request.body;
	ctx.assert(!isBetweenThursday2330AndFriday0030(), 'Not yet started');
	ctx.assert(target != ctx.role._id, 'no challenge itself');
	let role3v3 = await getpvpinfo(ctx);
	let hf = false
	role3v3.theChallenged.forEach(element => {
		if (element == target) {
			hf = true
		}
	});
	ctx.assert(hf, 'please refresh');
	console.log(ctx.request.body)
	let attacklist = ['attack1', 'attack2', 'attack3']
	let defenselist = ['defense1', 'defense2', 'defense3']
	let list = []
	let label = `${Date.now()}${ctx.role.rno}`
	let role
	let skills
	await Promise.all(attacklist.map(async (e, index) => {
		const player = await ctx.role.getBattleSet(e);
		let attackcount = 0;
		for (let x in player.team) {
			attackcount++
		}
		ctx.assert(attackcount != 0, `attack team is null`);
		const battle = new ctx.dao.c_battle({
			rid: ctx.role._id,
			type: 'pvp3vs3',
			player,
			mark: target,
		})
		let enemy;
		if (target.startsWith('robot')) {
			const robotid = parseInt(target.slice(6));
			const config = global.gameconfig.pvpmultiplayer.robot[robotid][index];
			ctx.assert(config, 'invalid rid');
			enemy = ctx.dao.role.robotGenerator(config);
		} else {
			role = !role ? await ctx.dao.role.findOne({ _id: target }) : role;
			let battleset = await role.getBattleSet(defenselist[index]);
			let defensecount = 0
			for (let x in battleset.team) {
				defensecount++
			}
			ctx.assert(defensecount != 0, `defense team is null`);
			enemy = {
				level: role.level,
				battleset,
			}
			skills = !skills ? await ctx.dao.zbdepot.getAllZbSkill({ rid: target }) : skills;
			battle.rcards.push(...skills.map(id => ({ id })));
		}
		await battle.createEnemy(enemy.battleset);
		battle.season.right = enemy.level;
		battle.label = label
		await battle.save();
		list[index] = battle.base()
	}))


	ctx.body = { list: list, id: label };
}

