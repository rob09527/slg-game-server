
'use strict'

module.exports = exports = async (ctx, next) =>{
	let list = [];
	ctx.chapterlist = await ctx.dao.c_dgchapter.find({rid: ctx.role._id, farm: true});
	for (let {nodes, index} of ctx.chapterlist) {
		for (let i = 0; i < nodes.length; i++) {
			let node = nodes[i];
			let {
				type,
				id,
				finish,
			} = node[0];
			// 跳过非商人事件
			if (type != 6) continue;
			// 跳过已结束商人事件
			if (finish) continue;
			// 检查配置
			let config = global.gameconfig.dgevent6[index].deepQueryOne('ID', id);
			if (!config) continue;
			let {
				DISC: disc,
				QUALITY: quality,
				ITEMS: item,
				CAST: consume,
			} = config;
			list.push({
				chapter: index,
				node: i,
				disc,
				item,
				consume,
				quality,
			})
		}
	}
	ctx.body = {list};
}