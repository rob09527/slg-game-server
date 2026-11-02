
'use strict'

module.exports = exports = async (ctx, next) =>{
	// 根据坐标获取角色所在位置
	let {
		// 节点坐标
		node,
		// 位置坐标
		pos,
	} = ctx.request.body;
	ctx.pos = ctx.chapter.nodes[Number.parseInt(node)];
	ctx.assert(ctx.pos, 'invalid nodeindex')
	ctx.pos = ctx.pos[Number.parseInt(pos)];
	ctx.assert(ctx.pos, 'invalid posindex')
	await next();
	let is_role_save = ctx._need_role_save_ || false;
	let {
		chapter: dgtchapter = -1,
		node: dgtnode = -1,
	} = ctx.role.dgtop
	// 更新最高关卡
	if (ctx.chapter.index > dgtchapter) {
		ctx.role.dgtop.chapter = ctx.chapter.index;
		ctx.role.dgtop.node = ctx.chapter.position.node;
		ctx.role.markModified('dgtop.chapter');
		is_role_save = true;
	}
	// 更新最高节点
	if (ctx.chapter.index == dgtchapter && node > dgtnode) {
		ctx.role.markModified('dgtop.node');
		ctx.role.dgtop.node = node;
		ctx.role.markModified('dgtop.update');
		ctx.role.dgtop.update = Date.now();
		is_role_save = true;
	}
	// 最后一个节点事件完成,标记关卡完成
	if (node == ctx.chapter.nodes.length - 1 && ctx.pos.finish) {
		ctx.chapter.finish = Date.now();
		await ctx.chapter.save();
		// 更新通关的最高关卡
		let top = ctx.role.dgtop.pass || -1;
		if (top < ctx.chapter.index) {	// 记录最高关卡
			ctx.role.dgtop.pass = ctx.chapter.index;
			ctx.role.markModified('dgtop.pass');
			is_role_save = true;
		}
	}
	if (is_role_save) {
		await ctx.role.save();
		// 一骑当先排行保存到redis
		// score:章节*10000+节点位置
		let rankService = new global.services.RankService('dungeon', ctx.role._gameserv.groupid);
		await rankService.set({
			id: ctx.role.i(),
			score: (ctx.role.dgtop.chapter * 10000 ) + ctx.role.dgtop.node
		});
	}
}
