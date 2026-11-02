
'use strict'

const moment = require('moment');
const secretTask = require('../../../../../model/secretRealmRole/instance/secretTask');

module.exports = exports = async (ctx, next) => {
	// 检查未完成关卡数量(必须小于等于1)
	let unfinish_chapters = await ctx.dao.c_dgchapter.find({ rid: ctx.role._id, finish: { $exists: 0 } });
	ctx.assert(unfinish_chapters.length <= 1, 'chapter unfinish');
	// 当前关卡全部完成,检查是否需要生成新关卡
	if (unfinish_chapters.length < 1) {
		let last_finish_chapter = await ctx.dao.c_dgchapter.findOne({ rid: ctx.role._id }, { index: 1 }).sort({ index: -1 });
		// 如不存在设置默认值
		last_finish_chapter = last_finish_chapter || { index: -1 };
		let index = last_finish_chapter.index + 1;
		// 随机模板
		let tindex = ctx.random.between(0, global.gameconfig.dgnodetemplate.length - 1);
		let template = global.gameconfig.dgnodetemplate[tindex];
		ctx.assert(template, 'invalid tindex');
		// 没有全部通关则生成
		if (index < global.gameconfig.dgchapter.length - 1) {
			//生成新关卡
			await secretTask(ctx, 99566, index + 1)
			let chapter = new ctx.dao.c_dgchapter({ rid: ctx.role._id, index });
			await chapter.fill(template);
		}

	}
	// 获取所有关卡
	let chapters = await ctx.dao.c_dgchapter.find({ rid: ctx.role.id }, { index: 1, complete: 1 });
	let dungeonlist = chapters.map(({ complete }) => {
		return { isget: complete ? 1 : 0 };
	})
	let refreshtime = moment(ctx.dginfo.create).startOf("day").add(2, "days").valueOf();
	ctx.body = {
		dglength: global.gameconfig.dgchapter.length - 1,
		refreshtime,
		dungeonlist,
		dungeonset: Object.values(ctx.dginfo.generals),
		rebirth: ctx.dginfo.rebirth,
	}
}