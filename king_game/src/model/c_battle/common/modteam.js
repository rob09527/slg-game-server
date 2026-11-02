
const { join } = require('path');
const assert = require('assert');
const mod = require('./mod');

const { general } = global.gameconfig;

module.exports = exports = function (type, ...args) {
	let [enemy, hps, vipfactor, levelfactor] = args;
	/**
	 * args里的字段释义
	 * enemy 敌方的怪物id或者传入的敌方的阵容
	 * hps 缓存血量 || 缓存的血量与蓝量  两种结构 {'0':100} ||  {'0':{hp:11,mp:11}}
	 * vipfactor vip战斗因子
	 * levelfactor (征战)等级战斗因子
	 */

	// 类型判断(远征&演武类自行组织目标阵容信息)

	if (type === 'exped' || type.startsWith('pvp') || type.startsWith('secretpvp') || type.startsWith('prisonerpvp') || type.startsWith('pvp3vs3') || type.startsWith('friend') || type.startsWith('topking') || type.startsWith('mazepvp') || type.startsWith('nationwar')) {
		assert(typeof enemy === 'object', 'object need');
		return { enemy: enemy };
	}

	// 检查配置
	let config;
	if (type == 'maze' && typeof enemy === 'object') {
		// 如果是远征则使用玩家缓存的属性
		config = enemy;
	} else {
		config = global.gameconfig['battle' + type];
		assert(config, 'invalid config');
		config = config[parseInt(enemy)];
	}

	// 对象深拷贝
	config = JSON.parse(JSON.stringify(config));
	assert(config, 'invalid enemy');

	// 生成目标阵容信息
	let right;
	let tmp = {};
	let zhenfa = {};
	let power = 0;
	for (const pos in config) {
		if (pos === 'zhenfa') {
			zhenfa = {
				pos: global.dao.zhenfa.getPosById(config[pos].id),
				...config[pos]
			};
			continue;
		}
		const pinfo = config[pos];
		// 保存敌方显示等级(默认第一个目标的等级)
		if (!right) right = pinfo.level;
		// 初始化目标数据
		const ginfo = general[pinfo.gsid];
		if (!ginfo) continue;
		tmp[pos] = mod(ginfo, pinfo, vipfactor, levelfactor);
		// 剩余血量传入
		if (hps) {
			if (typeof hps[pos] === 'number') {
				if (type === "manor" || type === "newmanorboss" || type === 'qxzlteam' || type === 'qxzlhide') {
					tmp[pos].nowhp = hps[pos];
				} else {
					tmp[pos].hppercent = hps[pos];
				}
			}
			// 新远征(迷宫),传入剩余血量与剩余蓝量
			if (typeof hps[pos] === 'object') {
				if (typeof hps[pos].hp === 'number') tmp[pos].nowhp = hps[pos].hp;
				if (typeof hps[pos].mp === 'number') {
					if (!hps[pos].star || hps[pos].star >= ginfo.STAR) {
						tmp[pos].nowmp = hps[pos].mp;
					}
				}
			}
		}
		power += tmp[pos].power;
	}
	return {
		enemy: {
			team: tmp,
			zhenfa,
			power
		},
		right,
	};
}