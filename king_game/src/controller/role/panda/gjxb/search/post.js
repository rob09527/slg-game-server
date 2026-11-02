
'use strict'

module.exports = exports = async (ctx, next) =>{
	let today = new Date().setHours(0,0,0,0);
	if(today != ctx.CACHE.base.update){
		ctx.CACHE.base.update = today;
		ctx.CACHE.base.num = 0;
	}
    let { times, mapid } = ctx.request.body;
    times = parseInt(times)
	ctx.assert(times > 0 && times < 11, 'invalid times');
    let config = ctx.CONFIG.map[mapid];
    ctx.assert(config, 'invalid mapid ' + mapid);
	//计算次数
	let count = 0;
    const num = ctx.CACHE.base.num || 0;
	const score = ctx.CACHE.base.score || 0;
	const max = ctx.CONFIG.base.FREE;
	let free = max - num;
	console.log(num,max,free);
	if(free < 0 || times > free){
		count = free < 0 ? times: times - free;
		count = ctx.CONFIG.base.ONE * count;
		if(count == 10){
			count = ctx.CONFIG.base.TEN;
		}
		let cast = {
			GSID: ctx.CONFIG.base.GSID, 
			COUNT: count
		}
		ctx.role.castItemsNoSave(cast, {main: 'gjxb', sec: 'search'+times});
	}
	ctx.CACHE.base.score = score + times;
	ctx.CACHE.base.num = num + times;
	// 事件
	let events = ctx.TRIGGER_EVENT(ctx, times, config);
	// 奖励
	let items = [];
	let bigs = [];
	let bullet = {};
	for(let i = 0; i < times; ++i){
		let item = config.ITEMS[ctx.random.inweight(config.ITEMS.deepMap('CHANCE'))];
		items.push({GSID:item.GSID, COUNT:item.COUNT});
		if(config.BIG.indexOf(item.GSID) < 0){
			bigs.push(0);
		}else{
			bullet[item.GSID] = 1;
			bigs.push(1);
		}
	}
	ctx.role.addItemsNoSave(items, {main: 'gjxb', sec: 'search'+times});

	ctx.role.markModified('panda.gjxb');
    await ctx.role.save();

	// 跑马灯
	for (const gsid in bullet) {
		ctx.role.bulletScreen("GJXB_BIG", gsid);
	}

    ctx.body = {
		num: ctx.CACHE.base.num,
		score: ctx.CACHE.base.score,
		count,
		events,
        items,
		bigs
    }
}
