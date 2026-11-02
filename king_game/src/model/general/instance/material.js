
'use strict'

module.exports = exports = function (ext) {
	let cast = {};
	// class
	for (let i = 0; i <= this.class; i++) {
		let config = global.gameconfig.generalclass[i];
		if (!config) break;
		for (let item of config.ITEMS) {
			cast[item.GSID] = cast[item.GSID] || 0;
			cast[item.GSID] += item.COUNT;
		}
	}
	// level
	for (let i = 0; i < this.level - 1; i++) {
		let config = global.gameconfig.generallevel[i];
		if (!config) break;
		for (let item of config) {
			cast[item.GSID] = cast[item.GSID] || 0;
			cast[item.GSID] += item.COUNT;
		}
	}
	if (ext !== 'RESET') {
		// exclusive.level
		for (let i = 0; i < this.exclusive.level; i++) {
			let config = global.gameconfig.exclusivelevel[i];
			if (!config) break;
			for (let item of config.ITEMS) {
				cast[item.GSID] = cast[item.GSID] || 0;
				cast[item.GSID] += item.COUNT;
			}
		}
	}
	// awake 武将升级到该星级的消耗
	if (ext === 'REBORN' || ext === 'DECOMP') {
		let config = global.gameconfig.generalawake[this.gsid];
		while (config) {
			for (let item of config.ITEMS) {
				cast[item.GSID] = cast[item.GSID] || 0;
				cast[item.GSID] += item.COUNT;
			}
			config = global.gameconfig.generalawake[config.MAIN];
		}
	}
	
	// 重生需要返还专属升级消耗
	if (ext === 'REBORN') {
		let current = this.exclusive_equip || 0;
		let gconfig = global.gameconfig.general[this.gsid];
		let TGRADE = gconfig.TGRADE;
		let consumeConfig = global.gameconfig.generals_exclusive.CONSUME[TGRADE];
		if (consumeConfig && consumeConfig.length > 0) {
			for (let j = 0; j < current; j++) {
				if (!consumeConfig[j]) break;
				for (let item of consumeConfig[j]) {
					cast[item.GSID] = cast[item.GSID] || 0;
					cast[item.GSID] += item.COUNT;
				}
			}
		}
	}

	// 返回比例
	let items = [];
	let m_rate = global.gameconfig.others.GENERAL_MATERIAL.RATE[ext] || {};
	let {
		SP = {},
		DEFAULT = 1,
	} = m_rate;
	for (let gsid in cast) {
		const count = cast[gsid];
		if (count < 1) continue;
		let rate = SP[gsid];
		if (typeof rate !== 'number') rate = DEFAULT;
		items.push({ GSID: parseInt(gsid), COUNT: Math.floor(count * rate) });
	}

	// equip
	for (let gsid of this.equip) {
		if (!gsid) continue;
		items.push({ unmark: 1, GSID: Number.parseInt(gsid), COUNT: 1 });
	}

	// treasure
	if (this.treasure && this.treasure.length !== 24) items.push({ unmark: 1, GSID: this.treasure, COUNT: 1 });


	return items;
}