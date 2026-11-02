
'use strict'

module.exports = exports = async function (ctx, next) {
	let { hdlb = 'unknow' } = ctx.params;
	ctx.body = ctx.config.map(({ PRICE: price, LIMIT: limit, ITEMS: items,
		VALUE: value = 0, ICON: icon, BG: bg, SPECIAL: special = [], BG1: bg1, BG2: bg2,
		HERO: hero, HERONAME: heroname, TXBIG: txbig, NORMAL: normal, CHECK: check, PATH: path = "", EXP: exp,
		COST: cost, ISSHOW: isshow, OCC: occ, DISCOUNT: discount, ID: id, REFRESH: refresh,
		SELECTITEMS:selectitems,NAME:name
	},
		index) => {
		let bought = ctx.role[hdlb][index] || 0;
		return {
			id,
			value,
			price,
			items,
			buytime: limit - bought > 0 ? limit - bought : 0,
			limit,
			icon,
			bg,
			special,
			exp,
			cost,
			isshow,
			occ,
			discount,
			refresh,
			bg1,bg2,hero,heroname,txbig,normal,check,path,
			selectitems,
			name
		}
	})
	// 周活动日志-[端午礼包]
	if(hdlb == "dwlb") {
		ctx.khlog.zhdprint(hdlb, ctx.role);
	}
}