
'use strict'

module.exports = exports = async (ctx, next) =>{
	let {
		node: snode_index,
		pos: spos_index,
	} = ctx.request.body;
	let {
		nodes,
		position: {
			node: cnode_index,
			pos: cpos_index,
		}
	} = ctx.chapter;
	// 判断下一行节点内是否有已经选择的节点
	// 如果有是否选择了该节点
	// 否则标记已选择了新节点
	ctx.assert(Number.parseInt(snode_index) - cnode_index == 1, 'not nextnode');
	let select_node = ctx.chapter.nodes[snode_index];
	ctx.assert(select_node, 'node nexist');
	let select_pos = select_node.find(pos =>{
		return !!pos.choose;
	})
	let is_chapter_save = false;
	if (select_pos) {	// 已有选择位置
		let _index = select_node.indexOf(select_pos);
		// 检查是否同一个位置
		ctx.assert(spos_index == _index, 'already choose');
	}else{
		// 检查所选位置是否存在
		select_pos = select_node[spos_index];
		ctx.assert(select_pos, 'pos nexist');
		// 标记该位置已被选择
		select_pos.choose = 1;
		ctx.chapter.markModified('nodes');
		is_chapter_save = true;
	}
	// 兼容旧代码
	let event = select_pos;
	ctx.body = {};
	let {
		id,
		type,
		buffs,	// 战斗
		goods,	// 宝藏
	} = event;
	// 神秘事件重新指定事件
	if (type == 5) {
		({id, type, goods, buffs} = event.event);
		// 标记神秘事件
		ctx.body.secret = 1;
	}
	ctx.body.type = type;
	let config_name = type;
	// 指定战斗事件配置名
	if (config_name <= 3) config_name = 123;
	config_name = 'dgevent' + config_name;
	let config = global.gameconfig[config_name];
	// 转盘事件配置不同名
	if (config) {
		config = config[ctx.chapter.index].deepQueryOne('ID', id);
		ctx.assert(config, `invalid et${config_name}id`);
	}
	switch (type) {
		case 1:
		case 2:
		case 3: 	// 战斗事件,血量信息
			let set = global.gameconfig.battledungeon[id];
			ctx.assert(set, 'invalid bt123id');
			ctx.body.detail = {
				id,
				name: config.NAME,	// hardcode
				gsid: config.GSID,	// hardcode
				set,
				hppercent: event.hppercent,
				buffs,
			}
			break;
		case 4: 	// 宝箱事件,奖励信息
			ctx.body.detail = {
				id,
				quality: config.QUALITY,
				goods: goods,
			}
			// 直接获得宝箱内奖励
			ctx.role.addItemsNoSave(goods, {main: 'dungeon', sec: 'treasurebox'});
			await ctx.role.save();
			// 直接完成
			event.finish = Date.now();
			// 更新位置信息
			is_chapter_save = true;
			ctx.chapter.position = {
				node: snode_index,
				pos: spos_index,
			}
			break;
		case 6: 	// 商人事件
			let {
				DISC: disc,
				QUALITY: quality,
				ITEMS: item,
				CAST: consume,
			} = config;
			ctx.body.detail = {
				disc,
				item,
				consume,
				quality,
				refnum: event.refnum,
			}
			break;
		case 7: 	// 营地事件
			let {
				POTION,
			} = config;
			ctx.body.detail = {
				id: POTION,
			}
			// 获得药水
			ctx.dginfo.potion[POTION] = ctx.dginfo.potion[POTION] || 0;
			ctx.dginfo.potion[POTION]++;
			ctx.dginfo.markModified('potion.'+POTION);
			await ctx.dginfo.save();
			// 直接完成
			event.finish = Date.now();
			// 更新位置信息
			is_chapter_save = true;
			ctx.chapter.position = {
				node: snode_index,
				pos: spos_index,
			}
			break;
		case 8: 	// 转盘事件,该获得的buffid
			ctx.body.detail = {
				id,
			}
			// 获得buff
			ctx.dginfo.addBuff(ctx.chapter.index, id);
			await ctx.dginfo.save();
			// 标记完成
			event.finish = Date.now();
			// 更新位置信息
			is_chapter_save = true;
			ctx.chapter.position = {
				node: snode_index,
				pos: spos_index,
			}
			break;
	}
	// 关卡数据保存
	if (is_chapter_save) await ctx.chapter.save();
}