
'use strict'
// 战役信息
module.exports = exports = async (ctx, next) =>{

 	if (ctx.params.type === 'yuangu'){
		// 远古战场
		const curlv = Math.floor(ctx.record.subindex / 1000000); // 取出 难度
		ctx.config._field_info = ctx.config._field_info || {}; // 缓存需要运算buff的配置

		let _field_info = ctx.config._field_info[curlv];

		if (!_field_info){
			_field_info = {};
			for (let i = 1; i < 999; i++) {
				const fieldId = curlv * 1000 + i;
				const r = ctx.config.FIELD_REWARD[fieldId];
				if (!r){
					break;
				}
				const b = await ctx.dao.yuangubuf.getBuff(fieldId, ctx.record.etime);
				_field_info[fieldId] = {
					debuff: [b],
					freward: r
				};
			}
			ctx.config._field_info[curlv] = _field_info;
			ctx.config._buff_cache_time = ctx.record.etime + 5000;
		}

		// subindex格式, 1,001,001 分别是 难度,战场,关卡
		return ctx.body = {
			etime: ctx.record.etime,
			subindex: ctx.record.subindex, // 原汁原味的 关卡id
			pass: ctx.record.pass,
			maxindex: ctx.record.maxsubindex,
			fieldinfo: _field_info,
			lvreward: ctx.config.LV_REWARD[curlv],
		}
	}
 	ctx.body = {};
}
