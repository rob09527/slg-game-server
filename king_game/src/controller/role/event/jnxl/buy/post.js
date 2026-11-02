
'use strict'

module.exports = exports = async function (ctx, next) {
	let [start, end] = global.config.ZHD.JNXL || [];
	ctx.assert(Date.in(start, end), 'fn freeze');
	let jnxl_record = ctx.role.jnxl || [];
//console.error(jnxl_record);
	let {
		index: indexlist,
	} = ctx.request.body;
	let items = [];
	let cast = [];
	for (let [index, num] of indexlist) {
		let info = global.gameconfig.jnxl.LIST[index];
//console.error({index, num});
//console.error(info);
		ctx.assert(info, 'invalid index');
		ctx.assert(info.LIMIT - ((jnxl_record[index] || 0) + num) >= 0, 'cant buy');
		let _items = info.ITEMS.map(function ({GSID, COUNT}) {
			return {
				GSID,
				COUNT: COUNT * num
			}
		})
		items.append(_items);
		let _cast = info.CAST.map(function ({GSID, COUNT}) {
			return {
				GSID,
				COUNT: COUNT * num
			}
		})
		cast.append(_cast);
		jnxl_record[index] = (jnxl_record[index] || 0) + num;
	}
	cast = cast.arrange();
	for (let item of cast) {
		if (item.GSID !== 38005) continue;
		for (let [price, cut] of global.gameconfig.jnxl.DISCOUNT) {
			if (item.COUNT < price) continue;
			item.COUNT -= cut;
			break;
		}
		break;
	}
	ctx.body = items;
	ctx.role.castItemsNoSave(cast);
	ctx.role.addItemsNoSave(items);
	ctx.role.jnxl = jnxl_record;
	ctx.role.markModified('jnxl');
	await ctx.role.save();
	// 周活动日志-金牛献礼
	indexlist.forEach(([index, num]) => {
		index = Number.parseInt(index)
		ctx.zhdprint("jnxl", index + 1, num)
	})
}