
'use strict'

module.exports = exports = async (ctx, next) =>{
	// ctx.dginfo.quickfight
	let {
		nodes,
		position,
	} = ctx.chapter;
	let {
		node,
		pos,
	} = position;
	let nodelist = [];
	for (let i = 0; i < 3; i++) {
		let index = node + i;
		// 已经到最后一个节点
		if (index >= nodes.length) break;
		// 起点默认事件
		nodelist.push(nodes[index] || [{type: -1}]);
	}
	nodelist = nodelist.map(node =>{
		return node.map(({type, choose, finish}) =>{
			return {type, choose, finish}
		})
	})
	let potion = [];
	for (let [id, count] of Object.entries(ctx.dginfo.potion)) {
		potion.push({id, count})
	}
	ctx.body = {
		position,
		nodelist,
		potion: ctx.dginfo.getPotion(),
		bufflist: ctx.dginfo.buff,
		spbufflist: ctx.dginfo.spbuff,
	};
}