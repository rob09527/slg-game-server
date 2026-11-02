
'use strict'

const assert = require('assert');

const random = require('./../../../util/random');

const DISCOUNT_RATE = [10, 9, 8, 7, 5, 3, 1];

/**
 *
 * @param role
 * @param isFirst {boolean} 是否第一次
 */
module.exports = exports = function (role , isFirst= false) {
	const {level, vip, maxmapid ,_frames} = role;
	const config = global.gameconfig['shop' + this.type];

	assert(config, 'invalid shop');
	const now = Date.now();
	const oldGoods = this.goods||[];
	this.goods = config.map((pos,index) =>{
		const old = oldGoods[index];
		pos = pos || [];
		let good;
		if(old && old.lock && old.BUYTIME > 0) { // 被锁定的位置保留
			 return old;
		}

		const firstGood = isFirst && pos.deepQueryOne('FIRST', true);

		if (!firstGood){
			pos = pos.filter(good =>{
				good.UNLOCK_ID = good.UNLOCK_ID || -1; // 增加关卡解锁的筛选
				good.HIDE_MAP_ID =  (good.HIDE_MAP_ID === -1 ||!good.HIDE_MAP_ID ) ? Infinity : good.HIDE_MAP_ID ;
				if (_frames){
					// 判断头像框,已经存在者不用展示
					if (_frames[good.GSID] && _frames[good.GSID] < now){
						return false;
					}
				}
				return good.UNLOCK_ID < maxmapid && good.HIDE_MAP_ID >= maxmapid && level >= good.REQUIRE.LEVEL.MIN &&
					level <= good.REQUIRE.LEVEL.MAX &&
					vip >= good.REQUIRE.VIP.MIN &&
					vip <= good.REQUIRE.VIP.MAX;
			});
			let chances = pos.deepMap('CHANCE');
			good = pos[random.inweight(chances)];
			if (!good) return null;
		} else {
			good = firstGood;
		}

		let chances = good.COUNT.map(count =>{
			return count.CHANCE;
		})
		let count = good.COUNT[random.inweight(chances)].NUM;
		let discount = DISCOUNT_RATE[random.inweight(good.DISCOUNT)];
		let price = Math.ceil(good.PRICE * count * (discount / 10));
		return {
			GSID: good.GSID, COIN: good.COIN, BUYTIME: good.BUYTIME,
			COUNT: count, PRICE: price, DISCOUNT: discount,
			lock: 0
		}
	});
	this.lock = 0; // 解除商店的锁定状态
	this.goods = this.goods.filter(Boolean); // 过滤掉没解锁 null的位置
	this.markModified('goods');
	return this.save();
}
