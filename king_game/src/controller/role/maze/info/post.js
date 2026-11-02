
'use strict'
// 获取信息接口
const mazeConfig = global.gameconfig.mazechapter;
module.exports = exports = async (ctx, next) => {
	// 返回玩家当前关卡

	let unfinish_chapters = await ctx.dao.mazechapter.find({ rid: ctx.role._id, finish: { $exists: 0 } });
	// 检查关卡是否有未完成的,小于等于1
	ctx.assert(unfinish_chapters.length <= 1, 'chapter has two unfinish');
	// 返回关卡信息
	let chapters = await ctx.dao.mazechapter.find({ rid: ctx.role.id }).sort({ floor: -1 });
	chapters = chapters[0];
	/// 查询临时武将列表
	let tempgeneral = await ctx.dao.tempgeneral.find({ rid: ctx.role._id, type: "maze" });
	// 查封地加成数据
	let building = await ctx.dao.newmanor.findOne({ rid: ctx.role._id });
	if (building) ctx.role.manorbuildingBuf = await building.buildingBuf();
	// 返回玩家的武将详情
	tempgeneral = tempgeneral.map((g) => {
		g._role = ctx.role;
		return g.base()
	});
	// 返回一个层增长系数
	// 取出层系数
	let config = mazeConfig.find(node => node.ID == chapters.gateid);
	ctx.assert(config, 'maze config err');
	let floorfactor = config.MONSTER_ADD_FLOOR;

	ctx.body = {
		floor: chapters.floor,
		row: chapters.row,
		pos: chapters.pos,
		map: chapters.nodes,
		nextreftime: ctx.mazeInfo.nextreftime,
		cardbag: ctx.mazecards.cardbag,
		tempgeneral,
		gcache: ctx.mazeInfo.gcache,
		specialbuf: [ctx.mazeInfo.specialbuf],
		nextgatetype: chapters.nextgatetype,
		finishitems: chapters.rewards,
		finish: chapters.finish,
		floorfactor
	}
}
