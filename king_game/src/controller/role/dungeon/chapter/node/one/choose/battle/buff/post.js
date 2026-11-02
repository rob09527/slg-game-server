
'use strict'

module.exports = exports = async (ctx, next) =>{
	let {
		node,
		pos,
		buff: buff_index,	// 玩家选择的buff的下标
	} = ctx.request.body;
	let {
		type,
		id,
		buffs,
		finish,
		hppercent = {},	// set default val
	} = ctx.pos;
	if (type == 5) ({type, id, buffs} = ctx.pos.event);
	// 是否已完成
	ctx.assert(!finish, 'already finish');
	// 怪的血量是不是都空了
	let set = global.gameconfig.battledungeon[id];
	ctx.assert(set, 'invalid bconfig');
	set = Object.keys(set);
	for (let pos of set) {
		let hp = hppercent[pos];
		ctx.assert(hp == 0, 'not finish');
	}
	// 添加buff
	let buffid = buffs[Number.parseInt(buff_index)];
	ctx.assert(buffid, 'buff nexist');
	ctx.dginfo.addBuff(ctx.chapter.index, buffid);
	await ctx.dginfo.save();
	// 标记事件完成
	ctx.pos.finish = Date.now();
	ctx.chapter.markModified(['nodes', node, pos].join('.'));
	// 更新位置
	ctx.chapter.position = {
		node,
		pos,
	}
	await ctx.chapter.save();
	ctx.body = {
		buffid,
	}
}