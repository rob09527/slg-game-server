
'use strict'

module.exports = exports = async function (ctx, next) {
	const nowTime = ctx.role.getProp(90737) + (Date.now() - ctx.client.logineTime);
	ctx.assert(nowTime > 0, 'not yet');
	const {onlineDay} = global.gameconfig;
	const process_num = ctx.role.getItems(90736).count;
	let items = [], count = 0, nextTime = 0;
	for(let i = process_num; i < onlineDay.length; i++) {
		const now = onlineDay[i];
		if(now) {
			const checkTime = now.MIN * 60 * 1000;
			if(nowTime >= checkTime){
				count++;
				items = [...items, ...now.ITEMS];
			}
			else{
				nextTime = nowTime + checkTime;
				break;
			}
		}
	}

	if(count > 0){
		ctx.role.addItemsNoSave({gsid: 90736, count: count});
		ctx.role.addItemsNoSave(items);
		await ctx.role.save();
	}
	ctx.body = {reward: items, next: nextTime};
}
