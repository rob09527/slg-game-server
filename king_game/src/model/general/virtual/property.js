
'use strict';

const assert = require('assert');

const CS_CONDS = require('./../../../util/cond');
const { forEach, now } = require('lodash');

module.exports = exports = function () {
	const soulbind = this.soulbind;

	const conf_property = global.gameconfig.general[soulbind.gsid];
	const conf_class = global.gameconfig.generalclass[soulbind.class];

	assert(conf_property && conf_class, 'invalid general');

	let data = {};

	const { PROPERTY, GROWTH, SHP_ADD, SATK_ADD, OCCU, OCCU2, CAMP } = conf_property;
	for (let attr in PROPERTY) {
		data[attr.toLowerCase()] = PROPERTY[attr];
	}

	for (let attr in GROWTH) {
		data[attr.toLowerCase()] = Math.floor((data[attr.toLowerCase()] + GROWTH[attr] * (soulbind.level - 1)) * (1 + conf_class.ADD[attr] / 1000));
	}
	// SHP_ADD
	if (data.hp && SHP_ADD) data.hp = Math.floor(data.hp * (1 + SHP_ADD / 1000));
	// SATK_ADD
	if (data.hp && SATK_ADD) data.atk = Math.floor(data.atk * (1 + SATK_ADD / 1000));
	// equip and occcuequip
	let sets = {};
	for (let equip of soulbind.equip) {
		if (!equip) continue;
		let conf_equip = global.gameconfig.equip[equip];
		if (!conf_equip) {
			// 职业装备
			conf_equip = global.gameconfig.occuequip[equip];
		}
		if (!conf_equip) continue;
		if (conf_equip.SETID) {
			sets[conf_equip.SETID] = sets[conf_equip.SETID] || 0;
			sets[conf_equip.SETID]++;
		}
		for (let attr of conf_equip.PROP) {
			const k = attr.KEY.toLowerCase();
			data[k] = data[k] || 0;
			data[k] += attr.VAL;
		}
		if (conf_equip.SP) {
			for (let sp of conf_equip.SP) {
				if (CS_CONDS[sp.COND] && CS_CONDS[sp.COND](this)) {
					const k = sp.KEY.toLowerCase();
					data[k] = data[k] || 0;
					data[k] += sp.VAL;
				}
			}
		}
	}

	//  occuequipset 职业套装
	// 需要同一个职业的武将穿着同一个套装才能激活技能
	this._occusuitskill = [];// 赋空
	for (let sid in sets) {
		const conf_equipset = global.gameconfig.occuequipset[sid];
		if (!conf_equipset) continue;
		let num = sets[sid];
		if (num < 2) continue;
		// 双职业武将任意一个职业都可以激活
		if (OCCU != conf_equipset.OCCU && (!OCCU2 || OCCU2 != conf_equipset.OCCU)) continue;
		if (num <= 3) {
			// 一个技能
			this._occusuitskill.append(conf_equipset.SKILL[0]);
		} else if (num > 3) {
			// 二个技能
			this._occusuitskill.append(conf_equipset.SKILL[0], conf_equipset.SKILL[1]);
		}
	}

	// treasure
	if (soulbind.treasure) {
		// 宝物基础属性加成
		let treasure_gsid = soulbind._awaketreasure ? soulbind._awaketreasure.gsid : soulbind.treasure;
		if (global.gameconfig.treasure[treasure_gsid]) {
			const { PROP } = global.gameconfig.treasure[treasure_gsid];
			for (let attr of PROP) {
				const k = attr.KEY.toLowerCase();
				data[k] = data[k] || 0;
				data[k] += attr.VAL;
			}
		}
		// 觉醒宝物
		if (soulbind._awaketreasure) {
			// 觉醒加成
			let config = global.gameconfig.treasureawake.AATTRS[soulbind._awaketreasure.gsid];
			if (config) {
				for (let { KEY, VAL } of config) {
					const k = KEY.toLowerCase();
					data[k] = data[k] || 0;
					data[k] += VAL;
				}
			}
			// 无双属性加成
			for (let { key, val } of soulbind._awaketreasure.property) {
				data[key] = data[key] || 0;
				data[key] += val;
			}
		}
	}
	// 魂石加成
	if (soulbind._stone_) {
		for (let stone of soulbind._stone_) {
			if (!stone) continue;
			let config = global.gameconfig.soulstone[stone.gsid];
			if (!config) continue;
			// 主属性
			for (let [key, val] of Object.entries(config.ATTRS)) {
				data[key] = data[key] || 0;
				data[key] += val;
			}
			if (!stone.rand) continue;
			// 光暗属性
			for (let [key, val] of Object.entries(stone.rand)) {
				data[key] = data[key] || 0;
				data[key] += val;
			}
		}
	}
	// 兵书 属性加成
	if (soulbind._book_) {
		const suitMap = {};
		for (const book of soulbind._book_) {
			if (!book) { // 忽略 空位
				continue;
			}
			for (const key in book.attr) {
				data[key] = data[key] || 0;
				data[key] += book.attr[key];
			}
			suitMap[book.suit] = suitMap[book.suit] || {
				C: 0,
				STAR: 999
			};
			suitMap[book.suit].C++; // 套装数量++
			suitMap[book.suit].STAR = Math.min(suitMap[book.suit].STAR, book.star); // 记录最低星级
		}

		for (const suitId in suitMap) {
			const sItem = suitMap[suitId];
			if (sItem.C < 2) { // 不到两件套 没有套装效果
				continue;
			}

			if (!global.gameconfig.book_suit[suitId]) {
				continue;
			}
			// 取出对应星级的加成配置
			const suitConfig = global.gameconfig.book_suit[suitId][sItem.STAR - 1];

			for (let i = 0; i < sItem.C - 1; i++) { // 根据几件套来技术套装加成
				if (!suitConfig.ATTR[i]) {
					continue;
				}
				const { KEY, VAL } = suitConfig.ATTR[i];
				const _key = KEY.toLowerCase();
				data[_key] = data[_key] || 0;
				data[_key] += VAL;
			}
			if (sItem.C === 4) { // 4件套加成技能
				this._book_skill = suitConfig.SKILL;
			}
		}
	}
	// 珍宝,珍宝库加成
	if (soulbind._zbdepot_) {
		const depot_attr = soulbind._zbdepot_._attr;
		for (const [key, val] of Object.entries(depot_attr)) {
			data[key] = data[key] || 0;
			data[key] += val;
		}
	}

	// 印记属性加成
	if (soulbind._signet_) {
		for (let signet of soulbind._signet_) {
			if (!signet) continue;
			let config = global.gameconfig.signet[signet.gsid];
			if (!config) continue;
			let appraise = signet.appraise;
			if (appraise) {
				for (const key in appraise) {
					if (key != 'type') {
						if (Object.hasOwnProperty.call(appraise, key)) {
							data[key] = data[key] || 0;
							data[key] += appraise[key];
						}
					}
				}
			}

			let prop = signet.prop;
			if (prop['gsid']) {
				let name = conf_property.NAME;
				let gsids = [];
				for (const key in global.gameconfig.general) {
					if (Object.hasOwnProperty.call(global.gameconfig.general, key)) {
						if (global.gameconfig.general[key].NAME == name) {
							gsids.push(key);
						};
					};
				};
				let sg_conf = gsids.some((g) => {
					return prop["gsid"] == g;
				});
				if (sg_conf) {
					let attrs = prop['attrs']['gsid'];
					for (const key in attrs) {
						if (Object.hasOwnProperty.call(attrs, key)) {
							data[key] = data[key] || 0;
							data[key] += attrs[key];
						}
					}
				}
			}
			if (prop['occu'] && (prop['occu'] == OCCU || prop['occu'] == OCCU2)) {
				let attrs = prop['attrs']['occu'];
				for (const key in attrs) {
					if (Object.hasOwnProperty.call(attrs, key)) {
						data[key] = data[key] || 0;
						data[key] += attrs[key];
					}
				}
			}
			if (prop['camp'] && prop['camp'] == CAMP) {
				let attrs = prop['attrs']['camp'];
				for (const key in attrs) {
					if (Object.hasOwnProperty.call(attrs, key)) {
						data[key] = data[key] || 0;
						data[key] += attrs[key];
					}
				}
			}
		}
	}

	//印记套装属性加成
	if (soulbind.signet_suit) {
		let attrs = soulbind.signet_suit.attrs;
		for (const key in attrs) {
			if (Object.hasOwnProperty.call(attrs, key)) {
				data[key] = data[key] || 0;
				data[key] += attrs[key];
			}
		}
	}
	// exclusive
	for (let attr of soulbind.exclusive.property) {
		data[attr.key] = data[attr.key] || 0;
		data[attr.key] += attr.val;
	}
	// equip set
	for (let sid in sets) {
		const conf_equipset = global.gameconfig.equipset[sid];
		if (!conf_equipset) continue;
		let num = sets[sid];
		if (num < 2) continue;
		num -= 2;
		for (let i = 0; i <= num; i++) {
			const attrs = conf_equipset[i];
			for (let attr of attrs) {
				const _key = attr.KEY.toLowerCase();
				data[_key] = data[_key] || 0;
				data[_key] += attr.VAL;
			}
		}
	}
	// 武将皮肤加成
	if (soulbind.skin && global.gameconfig.generalskin[soulbind.skin]) {
		const { ATTR: attr = [] } = global.gameconfig.generalskin[soulbind.skin];
		for (let att of attr) {
			data[att.ID] = data[att.ID] || 0;
			data[att.ID] += att.NUM;
		}
	}
	// 武将皮肤全体属性加成
	if (this._role) {
		for (let skid in this._role._skins) {
			if (this._role._skins[skid] > -1 && this._role._skins[skid] < Date.now()) continue;
			if (global.gameconfig.generalskin[skid]) {
				const { ALLATTR: allattr = [] } = global.gameconfig.generalskin[skid];
				for (let att of allattr) {
					data[att.ID] = data[att.ID] || 0;
					data[att.ID] += att.NUM;
				}
			}
		}
	}

	// 专属装备
	if (soulbind.exclusive_equip) {
		let CONFIG = global.gameconfig.generals_exclusive.CONFIG[OCCU];
		CONFIG = CONFIG[soulbind.exclusive_equip - 1];

		for (const key in CONFIG.PROP) { // 专属加成
			data[key] = data[key] || 0;
			data[key] += CONFIG.PROP[key];
		}
	}

	// 灵宠 pet
	if (soulbind._pet_) {
		let CONFIG = global.gameconfig.petitem[soulbind._pet_.gsid];
		for (const key in CONFIG.ATTR) {
			data[key] = data[key] || 0;
			// 等级加成
			let add_level = (CONFIG.ADD[key] || 0) * (soulbind._pet_.level - 1);
			// 培育加成
			let RAISE = global.gameconfig.petraise[soulbind._pet_.quality] || {};
			let add_raise = (RAISE[key] || 0) * soulbind._pet_.raise;
			data[key] += Math.floor(CONFIG.ATTR[key] + add_level + add_raise)
		}
	}

	// 新坐骑 horse
	if (soulbind._horse_) {
		const { SET_ON } = global.gameconfig.horsesetting;
		for (let i = 0; i < SET_ON; ++i) {
			let horse = soulbind._horse_[i];
			if (horse) {
				for (let j = 0; j < horse.property.length; j++) {
					let obj = horse.property[j];
					data[obj.key] = data[obj.key] || 0;
					data[obj.key] += obj.val
				}
			}
		}
	}

	// 官衔 official
	if (this._role) {
		const lv = this._role.getItems(38004).count;
		const config = global.gameconfig.officialitems[lv > global.gameconfig.officialitems.length ? global.gameconfig.officialitems.length - 1 : lv];
		if (config && config.ATTR) {
			for (const attr of config.ATTR) {
				const _key = attr.KEY.toLowerCase();
				data[_key] = data[_key] || 0;
				data[_key] += attr.VAL;
			}
		}
	}
	// 军团 legion
	if (this._role) {
		const tech = this._role.tech || {};
		for (const techid in tech) {
			const config = global.gameconfig.legiontech[techid];
			if (!config) continue;
			if (config.OCCU != OCCU && config.OCCU != OCCU2) continue;
			const lv = tech[techid];
			for (const attr in config.ATTR) {
				const val = config.ATTR[attr][lv - 1];
				if (typeof val !== 'number') continue;
				const _key = attr.toLowerCase();
				data[_key] = data[_key] || 0;
				data[_key] += val;
			}
		}
	}
	// 军衔职业天赋 OCCU
	if (this._role && this._role.military && this._role.military[OCCU]) {
		const { talent = {}, skill = {} } = this._role.military[OCCU];
		Object.keys(talent).forEach(id => {
			const attrs = global.gameconfig.military_talent.TALENT[id].ATTR;
			if (!talent[id]) {
				return;
			}
			for (const attr of attrs) {
				let val = attr.BASE + attr.GROWN * (talent[id] - 1);
				const _key = attr.KEY.toLowerCase();
				data[_key] = data[_key] || 0;
				data[_key] += val;
			}
		});
		// 职业天赋技能
		this._talent_skill_ = Object.keys(skill).filter(id => Boolean(skill[id])).map(id => global.gameconfig.military_talent.TALENT_SKILL[id].SKILL);
	}
	// 国战军衔等级加成
	// if (this._role ){
	// 	const mlv = this._role.military_level;
	// 	const {
	// 		MILITARY,
	// 	} = global.gameconfig.military_position || {};
	// 	if (MILITARY && MILITARY[mlv]){
	// 		for (const {KEY, VAL} of MILITARY[mlv].ATTR) {
	// 			const _key = KEY.toLowerCase();
	// 			data[_key] = data[_key] || 0;
	// 			data[_key] += VAL;
	// 		}
	// 	}
	// }



	// 封地建筑对武将属性加成
	/**
	 * 靶场：出战武将攻速加成。pasp
	 * 军械库：出战武将攻击加成。patk
	 * 兵营：出战武将血量加成。php
	 * manorbuildingAdd  {"pasp":80,"php":90}
	 */
	if (this._role && this._role.manorbuildingBuf) {
		let building = this._role.manorbuildingBuf;
		for (const attr in building) {
			const k = attr.toLowerCase();
			data[k] = data[k] || 0
			data[k] += building[attr];
		}
	}
	// 头像框对武将属性加成
	if (this._role && this._role.frameid && this._role.frameid != 10003) {
		let frameInfo = global.gameconfig.frame[this._role.frameid];
		if (frameInfo) {
			const attArr = frameInfo.ATT || [];
			for (let arr of attArr) {
				const k = arr.ID.toLowerCase();
				data[k] = data[k] || 0;
				data[k] += arr.NUM;
			}
		}
	}

	if (this._role?._titles) {
		for (let x in this._role._titles) {
			if (this._role._titles[x] < Date.now() && this._role._titles[x] != -1) {
				continue
			}
			let titleInfo = global.gameconfig.title[x];
			if (titleInfo) {
				const attArr = titleInfo.ATT || [];
				for (let arr of attArr) {
					const k = arr.ID.toLowerCase();
					data[k] = data[k] || 0;
					data[k] += arr.NUM;
				}
			}
		}
	}

	// 称号对武将属性加成
	// if (this._role && this._role.titleid && this._role.titleid != 0) {
	// 	let titleInfo = global.gameconfig.title[this._role.titleid];
	// 	if (titleInfo) {
	// 		const attArr = titleInfo.ATT || [];
	// 		for (let arr of attArr) {
	// 			const k = arr.ID.toLowerCase();
	// 			data[k] = data[k] || 0;
	// 			data[k] += arr.NUM;
	// 		}
	// 	}
	// }
	const guid = this._id.toString();

	// 阵法加成
	if (this._role && this._role._zhenfa && this._role._zhenfa.length > 0) {
		for (let zf of this._role._zhenfa) {
			const attr = zf.info().attr;
			for (let k in attr) {
				data[k] = data[k] || 0;
				data[k] += attr[k];
			}
		}
	}
	//秘境csz加成
	if (this._role && this._role.secretRealm && this._role.secretRealm.csz) {
		const attr = this._role.secretRealm.csz.pre
		for (let k in attr) {
			data[k] = data[k] || 0;
			data[k] += attr[k];
		}
	}

	//秘境突破加成
	if (this._role && this._role.secretRealm && this._role.secretRealm.spiritbreak) {
		const attr = this._role.secretRealm.spiritbreak
		for (let k in attr) {
			data[k] = data[k] || 0;
			data[k] += attr[k];
		}
	}
	//秘境机灵加成
	if (this._role && this._role.secretRealm && this._role.secretRealm.spiritlevel) {
		const attr = this._role.secretRealm.spiritlevel
		for (let k in attr) {
			data[k] = data[k] || 0;
			data[k] += attr[k];
		}
	}





	// 官职加成
	if (this._role && this._role._general_official && this._role._general_official[guid]) {
		const oConfig = gameconfig.generalofficial;
		const pos = this._role._general_official[guid];
		if (oConfig.OFFICIAL[pos]) {
			for (let K in oConfig.OFFICIAL[pos].ATTR) {
				let k = K.toLowerCase();
				data[k] = data[k] || 0;
				data[k] += oConfig.OFFICIAL[pos].ATTR[K];
			}
		}
	}
	// 天命加成
	if (this._role && this._role.destiny && Array.isArray(this._role.destiny.general)) {
		let destiny = this._role.destiny.general.find(value => value && value.guid == guid);
		if (destiny) {
			const oConfig = gameconfig.deftiny.QUALITY[destiny.id];
			if (oConfig) {
				const attArr = oConfig.ATT || {};
				for (let key in attArr) {
					data[key] = data[key] || 0;
					data[key] += attArr[key]
				}
			}
		}
	}
	// 皇宫加成
	if (this._role && this._role.kingdomStandingIndex >= 0) {
		let config = global.gameconfig.kingdomright[this._role.kingdomStandingIndex];
		for (let right of config.RIGHTS) {
			let {
				ID,
				VALS: [
					_attr,
					_val,
				],
			} = right
			if (ID !== 2) continue;
			_attr = _attr.toLowerCase();
			data[_attr] = data[_attr] || 0;
			data[_attr] += _val;
		}
	}
	// 全部神兽天赋加成
	if (this._role && this._role.mythical && Object.keys(this._role.mythical).length > 0) {
		// 获取配置
		const mythictalentconfig = global.gameconfig.mythicaltalentattr || [];
		if (mythictalentconfig.length > 0) {
			let mythicals = this._role.mythical;
			for (let _mythic in mythicals) {
				if (!mythicals[_mythic].talent) continue;
				let talent = mythicals[_mythic].talent || [];
				for (let i = 0; i < talent.length; i++) {
					if (!talent[i]) continue;
					// 每个天赋
					for (let k = 0; k < talent[i].length; k++) {
						if (!talent[i][k]) continue;
						// 下标对应的配置
						let _config = mythictalentconfig[k];
						_config.forEach(inner => {
							const _key = inner.ID.toLowerCase();
							// 加成赋值
							data[_key] = data[_key] || 0;
							data[_key] += inner.NUM * talent[i][k].pro;
						});
					}
				}
			}
		}
	}

	//天牢加成
	if (this._role?.tianlao) {
		let failnum = 0
		let successnum = 0
		if (this._role.tianlao.battlecount > 0 && this._role.tianlao.success) {
			let success = global.gameconfig.surrenderfight[2].find(e => e.SUCCESS == this._role.tianlao.battlecount);
			success ? successnum = success.DOWN : 0;
		} else if (this._role.tianlao.battlecount > 0 && !this._role.tianlao.success) {
			let fail = global.gameconfig.surrenderfight[1].find(e => e.LOSE == this._role.tianlao.battlecount)
			fail ? fail.ADD : 0;
		}

		if (failnum > 0) {
			data.atk += Math.floor(data.atk * failnum / 100)
			data.hp += Math.floor(data.hp * failnum / 100)
		}

		if (successnum > 0) {
			data.atk -= Math.floor(data.atk * successnum / 100)
			data.hp -= Math.floor(data.hp * successnum / 100)
		}
	}


	// php
	data.hp = Math.floor(data.hp * (1 + (data.php || 0) / 1000));
	// patk
	data.atk = Math.floor(data.atk * (1 + (data.patk || 0) / 1000));
	// def
	data.def = Math.floor(data.def * (1 + (data.pdef || 0) / 1000));
	// mdef
	data.mdef = Math.floor(data.mdef * (1 + (data.pmdef || 0) / 1000));

	// 将官职 buff 放在 百分比加成属性之后
	if (this._role && this._role._GENERAL_OFFICIAL_BUFF) { // 武将官职buff
		for (const k in this._role._GENERAL_OFFICIAL_BUFF) {
			data[k] = data[k] || 0;
			data[k] += this._role._GENERAL_OFFICIAL_BUFF[k];
		}
	}

	for (let key in data) {
		if (data[key] <= 0) delete data[key];
	}

	return data;
}
