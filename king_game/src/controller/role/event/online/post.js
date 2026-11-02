
'use strict'

module.exports = exports = async function (ctx, next) {
	const nowTime = Date.now();
	ctx.role.online = ctx.role.online || nowTime;
	const diffTime = nowTime - ctx.role.online;
	ctx.assert(diffTime > 0, 'not yet');
	const {online} = global.gameconfig;
	const process_num = ctx.role.getItems(90212).count;
	let items = [], count = 0, nextTime = 0;
	for(let i = process_num; i < online.length; i++) {
		const now = online[i];
		if(now) {
			const checkTime = ctx.role.online + now.MIN * 60 * 1000;
			if(nowTime >= checkTime){
				count++;
				items = [...items, ...now.ITEMS];
			}
			else{
				nextTime = checkTime;
				break;
			}
		}
	}
	if(count > 0){
		ctx.role.addItemsNoSave({gsid: 90212, count: count});
		ctx.role.addItemsNoSave(items);
		await ctx.role.save();
	}
	ctx.body = {reward: items, next: nextTime};
}
