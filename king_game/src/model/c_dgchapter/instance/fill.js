
'use strict'

const assert = require('assert');

const random = require('./../../../util/random');

function randEventFromType(type, chapter) {
	let pos = {type};
	// 指定配置
	let config;
	switch(type) {
		case 1:
		case 2:
		case 3: 	// 战斗
			config = global.gameconfig.dgevent123[chapter].deepQuery('TYPE', type);;
			break;
		case 8: 	// 转盘(增益)
			config = global.gameconfig.dgbuffs[chapter].deepQuery('TYPE', type);
			break;
		default:
			config = global.gameconfig['dgevent'+type][chapter];
	}
	// 根据关卡/事件类型随机
	let rates = config.deepMap('W');
	config = config[random.inweight(rates)];
	// 处理事件内容
	switch(type) {
		case 1:
		case 2:
		case 3: 	// 战斗
			pos.id = config.ID;
			// 去重随机buff选项
			let buffs = [];
			config = global.gameconfig.dgbuffs[chapter].deepQuery('TYPE', type);
			while(buffs.length < 3) {
				config = config.filter(({BUFFID}) =>{
					return !buffs.includes(BUFFID);
				})
				let rates = config.deepMap('W');
				let {BUFFID} = config[random.inweight(rates)];
				buffs.push(BUFFID);
			}
			pos.buffs = buffs;
			break;
		case 4: {	// 宝箱
			let {
				ID,
				ITEMS,
			} = config;
			pos.id = ID;
			pos.goods = ITEMS.map(({GSID, COUNT: [MIN, MAX]}) =>{
				return {
					GSID,
					COUNT: random.between(MIN, MAX),
				}
			})
			break;
		}
		case 5: {	// 神秘
			let {
				ID,
				TYPE,
			} = config;
			pos.id = ID;
			// 随机神秘事件指定事件
			pos.event = randEventFromType(TYPE, chapter);
			break;
		}
		case 6: {	// 商店
			let {
				ID,
			} = config;
			pos.id = ID;
			// 初始化刷新次数
			pos.refnum = 0;
			break;
		}
		case 7: 	// 营地
			pos.id = config.ID;
			break;
		case 8: 	// 转盘
			// 随机该获得的buff
			pos.id = config.BUFFID;
			break;
	}
	return pos;
}

module.exports = exports = async function (template) {
	let self = this;
	let config = global.gameconfig.dgchapter[self.index];
	assert(config, 'invalid index');
	self.reward = config.ITEMS.map(({GSID, COUNT: [MIN, MAX]}) =>{
		return {GSID, COUNT: random.between(MIN, MAX)};
	})
	if (self.farm) {
		for (let {TYPE: type, NUM} of config.FARMS) {
			for (let i = 0; i < NUM; i++) {
				let pos = randEventFromType(type, self.index);
				// 除商人事件外其他全部完成
				if (type != 6) pos.finish = Date.now();
				self.nodes.push([pos])
			}
		}
		// todo 
	}else{
		self.nodes = template.map(positions =>{
			return positions.map(type =>{
				if (type == 0) return;
				return randEventFromType(type, self.index);
			}).filter(pos =>{
				return !!pos;
			})
		})
	}
	await this.save();
}