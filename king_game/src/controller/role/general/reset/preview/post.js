
'use strict'

module.exports = exports = async (ctx, next) => {
  ctx.body = {
    items: ctx.general.material('RESET'),
  }
  // 返回觉醒宝物数据
  if (ctx.general.treasure && ctx.general.treasure.length === 24) {
    let awake_treasure = await ctx.dao.awake_treasure.findOne({_id: ctx.general.treasure});
    awake_treasure = await awake_treasure.base();
    // 前端显示兼容
    awake_treasure.GSID = awake_treasure.gsid;
    awake_treasure.count = 1;
    ctx.body.items.push(awake_treasure);
  }
  // 返回兵书
	for (let b of ctx.general.book) {
		b = await ctx.dao.book.findOne({_id: b});
		if (!b) continue;
		b = await b.base();
		b.count = 1;	// 前端显示兼容
		ctx.body.items.push(b);
	}
  // 返回魂石
  for (let s of ctx.general.stone) {
		let _s = await ctx.dao.soulstone.findOne({_id: s});
		if (!_s) continue;
		_s = await _s.base();
		_s.count = 1;	// 前端显示兼容
		ctx.body.items.push(_s);
	}
  // 返回新坐骑
	const {SET_ON} = global.gameconfig.horsesetting;
	for(let i = 0; i < SET_ON; ++i ){
		let guid = ctx.general.horse.guids[i]
		if(guid){
			let horse = await ctx.role.findHorses(guid);
      if(horse){
        horse = await horse.base();
        horse.count = 1;	// 前端显示兼容
        ctx.body.items.push(horse);
      }
		}
	}
	// 返回灵宠
	if(ctx.general.pet.guid){
		let pet = await ctx.role.findPets(ctx.general.pet.guid);
    if(pet){
      pet = await pet.base();
      pet.count = 1;	// 前端显示兼容
      ctx.body.items.push(pet);
      }
	}
}
