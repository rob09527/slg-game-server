
'use strict'
const { hitHere } = require("../../../../../../../util/weektarget");

module.exports = exports = async (ctx, next) =>{
	let {battleid} = ctx.request.body;
	let battle = await ctx.dao.c_battle.findOne({_id: battleid});
	ctx.assert(battle, 'invalid battleid');
	await battle.cal();
	let {result: ret} = battle;
	
	const {rlosthp: damge} = ret;

	if (!ctx.record) {
		ctx.record = {first: Date.now(), damges: 0};
		ctx.boss._roles[ctx.role.i()] = ctx.record;
	}
	ctx.record.last = Date.now();
	ctx.record.lastdamge = damge;
	ctx.record.damges += damge;

	ctx.boss.totaldamges += damge;
	ctx.boss.last = Date.now();
	// 新七日目标，军团挑战次数
	hitHere(ctx.role, 98620, 1, true);
	ctx.role.missionInvoke('LEGION_FIGHT');
	ctx.body = {
		result: ret,
		last: ctx.boss.last,
		damge: ctx.record.lastdamge,
	};
	// 录像保存
	let video = battle.getVideoObject();
	video.left.info = ctx.role.videoAvatarInfo();
	video.right.info = {index: ctx.boss.index};
	video = new ctx.dao.video({
		type: 'legionboss',
		rid: ctx.legion._id,
		video: JSON.stringify(video),
		version: battle.result.version,
	})
	video.save().catch(console.error);
	// 挑战日志保存
	ctx.dao.c_lbchallengelog.create({
		legion: ctx.legion._id,
		rid: ctx.role._id,
		videoid: video._id,
		bossindex: ctx.boss.index,
		damage: damge,
	}).catch(console.error);
}