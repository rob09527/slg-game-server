'use strict'

// 秘境宝阁信息查询
module.exports = exports = async function (ctx, next) {
	let MJBG = global.gameconfig.zhd_mjbg
	if(!ctx.role.mjbg) {
		const empty = Array.from({ length: 35 }, () => 0);
		ctx.role.mjbg = { index: 0, open: empty, openitem: empty };
		ctx.role.markModified("mjbg");
		await ctx.role.save();
	}
	let items = []
	let currentItems = MJBG.ITEMS[ctx.role.mjbg.index]
	ctx.assert(currentItems, "config nexists");
	for (let i = 0; i < currentItems.length; i++) {
		let tmp = {}
		tmp.gsid = currentItems[i].GSID
		tmp.count = currentItems[i].COUNT,
		tmp.num = ctx.role.mjbg.openitem[i]
		items.push(tmp)
	}
	let finals = []
	for (let item of MJBG.FINALLIST) {
		let final = []
		for (let f of item) {
			final.push({ gsid: f.GSID, count: f.COUNT, maxnum: f.MAXNUM })
		}
		finals.push(final)
	}
	let list = []
	for (let li of MJBG.LIST) {
		list.push({ intro: li.INTRO, page: li.PAGE })
	}
	let {GSID: djgsid, COUNT: djcount} = MJBG.CONSUME[ctx.role.mjbg.index];
	let result = {
		djgsid, djcount,
		index: ctx.role.mjbg.index,
		items: items,
		strbox: ctx.role.mjbg.open.join(''),
		finallist: finals,
		finalindex: MJBG.FINALINDEX,
		hased: ctx.role.mjbg.hased || [],
		list: list
	}
	if (ctx.role.mjbg.final) {
		let [floor, box] = ctx.role.mjbg.final.split(",");
		floor = parseInt(floor);
		box = parseInt(box);
		let myfinal = MJBG.FINALLIST[floor][box];
		result.final = { gsid: myfinal.GSID, count: myfinal.COUNT }
		if (ctx.role.mjbg.hased) result.final.num = ctx.role.mjbg.hased.filter(f => f === ctx.role.mjbg.final).length
	}
	ctx.body = result
	// 周活动日志-秘境宝阁-信息获取
	ctx.zhdprint("mjbg_info");
}