
'use strict'

const assert = require('assert');

module.exports = exports = function () {
	const config = global.gameconfig.general[this.soulbind.gsid];
	assert(config, 'invalid general');

	let data = this.toJSON({ virtual: true });

	data.power = 0;
	data.power += (data.property.hp || 0) * 0.0625;
	data.power += (data.property.atk || 0) * 1;
	data.power += (data.property.def || 0) * 2.5;
	data.power += (data.property.mdef || 0) * 2.5;
	data.power += (data.property.pasp || 0) * 10;
	data.power += (data.property.ppthr || 0) * 10;
	data.power += (data.property.pmthr || 0) * 10;
	data.power += ((data.property.pcri || 0) - 50) * 10;
	data.power += ((data.property.pcrid || 0) - 1500) * 2;
	data.power += (data.property.pdex || 0) * 10;
	data.power += (data.property.pmdex || 0) * 10;
	data.power = Math.floor(data.power * 10);

	data.star = config.STAR;
	data.camp = config.CAMP;
	data.occu = config.OCCU;
	data.occu2 = config.OCCU2;
	data.skill = config.SKILL;

	data.exclusive_equip = data.soulbind.exclusive_equip; // 专属等级返回
	if (data.exclusive_equip) {
		let CONFIG = global.gameconfig.generals_exclusive.CONFIG[config.OCCU];
		CONFIG = CONFIG[data.exclusive_equip - 1];
		const _skill = [...data.skill];
		for (const i of CONFIG.SKILL_COUNT) {
			const index = i - 1;
			_skill[index] = config.SKILL[index] + 1; // 加成的技能 等级 ++
		}
		data.skill = _skill;
	}

	data.soul = data.soulbind.soul;
	data.exclusive = data.soulbind.exclusive;
	data.exclusive.gsid = config.EXCLUSIVE;
	data.equip = data.soulbind.equip;
	data.treasure = data.soulbind.treasure;
	if (data.treasure && data.treasure.length === 24 && data.soulbind._awaketreasure) {
		data.treasure = data.soulbind._awaketreasure;
	}

	data._ownerlevel = data.level; // 自身原本等级
	data.level = data.soulbind.level;
	data.class = data.soulbind.class;
	data.gsid = data.soulbind.gsid;
	data.occusuitskill = data.soulbind.occusuitskill; // 职业套装技能id组
	data.bookskill = this._book_skill;
	data.book = this._book_ || [];
	data.stone = this._stone_ || [];
	if (this._signet_) data.signet = this._signet_;
	data.globalbuf = this._globalbuf;
	data.skin = data.soulbind.skin;// 武将皮肤
	if (data.soulbind.signet_suit) data.signetSuitAttrs = data.soulbind.signet_suit;//印记套装属性

	data.pet = this._pet_;
	data.horse = this._horse_ || [];
	data.destiny = this.destiny;

	data.beastsoul = [];
	for (let i = 0; i < 3; i++) {
		let startidx = i * 2;
		// 检查魂石及配置
		let stone0 = data.stone[startidx];
		if (!stone0) continue;
		let stone1 = data.stone[startidx + 1];
		if (!stone1) continue;
		stone0 = global.gameconfig.soulstone[stone0.gsid];
		if (!stone0) continue;
		stone1 = global.gameconfig.soulstone[stone1.gsid];
		if (!stone1) continue;
		let star = Math.min(stone0.STAR, stone1.STAR);
		let mark = [
			stone0.BEAST,
			stone1.BEAST,
		]
		mark.sort();
		mark = mark.join('_');
		let beast = global.gameconfig.beastsoul[mark];
		if (!beast) continue;
		beast = beast[star - 1];
		if (!beast) continue;
		let is_active = false;
		// 检查是否有同类型兽魂
		for (let _conf of data.beastsoul) {
			_conf = _conf || {};
			if (_conf.TYPE === beast.TYPE) {
				is_active = true;
				break;
			}
		}
		if (!is_active) data.beastsoul[i] = beast;
	}
	data.beastsoul = data.beastsoul.map(_conf => _conf ? _conf.ID : null);

	// 皮肤技能替换规则
	if (data.soulbind.skin && global.gameconfig.generalskin[data.soulbind.skin]) {
		const { SKILLS } = global.gameconfig.generalskin[data.soulbind.skin];
		const _skill = [...data.skill];
		for (const k in _skill) {
			let id = _skill[k];
			if (SKILLS[id]) {
				_skill[k] = SKILLS[id];
			}
		}
		data.skill = _skill;
	}

	data.guid = data._id.toString();

	delete data.soulbind;
	delete data.battleset;
	delete data.id;
	delete data._id;
	delete data.__v;
	delete data.rid;
	return data;
}
