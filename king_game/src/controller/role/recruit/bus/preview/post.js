
'use strict'

const {
	RECRUIT:{
		BUS_LIMIT,
	},
} = global.gameconfig.others;

module.exports = exports = async function (ctx, next) {
	let {
		force,
	} = ctx.request.body;
	if (ctx.blackboard.buslist.length !== 10 || (force && BUS_LIMIT - ctx.role.getProp(93198) >= 10)) {
		let tutor = ctx.role.tutor || 1;
		let generallist = global.gameconfig.recruitbus.deepQuery('TYPE', tutor);
		const rates_star = global.gameconfig.recruitstar['PREMIUM'];
		let starDict = {};
		for (let i = 0; i < 10; i++) {
			let star = ctx.random.inweight(rates_star) + 1;
			starDict[star] = starDict[star] || 0;
			starDict[star]++;
		}
		// 每次抽卡都能保底获得一张5星
		if (!starDict[5]) {
			starDict[5] = 1;
			for (let star of Object.keys(starDict)) {
				if (star === 5) continue;
				starDict[star]--;
				break;
			}
		}
		let gsids = [];
		for (let [star, num] of Object.entries(starDict)) {
			let _list = generallist.filter(elem =>{
				let _config = global.gameconfig.general[elem.GSID];
				return _config && _config.STAR === Number.parseInt(star)? true: false;
			});
			for (let i = 0; i < num; i++) {
				gsids.push(_list[ctx.random.between(0, _list.length - 1)].GSID);
			}
		}
		gsids.shuffle();
		ctx.role.addItemsNoSave({gsid: 93198, count: 10});
		ctx.body = gsids;
		ctx.blackboard.buslist = ctx.body;
		await ctx.blackboard.save();
		await ctx.role.save();
	}
	ctx.body = ctx.blackboard.buslist;
}
