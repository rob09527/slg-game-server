
'use strict';

const assert = require('assert');

const CS_CONDS = require('./../../../util/cond');

module.exports = exports = function () {
	const conf_property = global.gameconfig.general[this.gsid];
	const conf_class = global.gameconfig.generalclass[this.class];
	assert(conf_property && conf_class, 'invalid general');

	let data = {};

	const {PROPERTY, GROWTH, SHP_ADD, SATK_ADD} = conf_property;
	for (let attr in PROPERTY) {
		data[attr.toLowerCase()] = PROPERTY[attr];
	}

	for (let attr in GROWTH) {
		data[attr.toLowerCase()] = Math.floor((data[attr.toLowerCase()] + GROWTH[attr] * (this.level - 1)) * (1 + conf_class.ADD[attr] / 1000));
	}
	// SHP_ADD
	if (data.hp && SHP_ADD) data.hp = Math.floor(data.hp * (1 + SHP_ADD / 1000));
	// SATK_ADD
	if (data.hp && SATK_ADD) data.atk = Math.floor(data.atk * (1 + SATK_ADD / 1000));
	// equip
	let sets = {};
	for (let equip of this.equip) {
		if (!equip) continue;
		const conf_equip = global.gameconfig.equip[equip];
		if (!conf_equip) continue;
		if (conf_equip.SETID) {
			sets[conf_equip.SETID] = sets[conf_equip.SETID] || 0;
			sets[conf_equip.SETID]++;
		}
		for (let attr of conf_equip.PROP){
			data[attr.KEY.toLowerCase()] += attr.VAL;
		}
		for (let sp of conf_equip.SP){
			if (CS_CONDS[sp.COND] && CS_CONDS[sp.COND](this)) {
				data[sp.KEY.toLowerCase()] += sp.VAL;
			}
		}
	}
	// treasure
	if (this.treasure && global.gameconfig.treasure[this.treasure]) {
		const {PROP} = global.gameconfig.treasure[this.treasure];
		for (let attr of PROP){
			data[attr.KEY.toLowerCase()] += attr.VAL;
		}
	}
	// exclusive
	for (let attr of this.exclusive.property){
		data[attr.key] += attr.val;
	}
	// equip set
	for (let sid in sets){
		const conf_equipset = global.gameconfig.equipset[sid];
		if (!conf_equipset) continue;
		let num = sets[sid];
		if (num < 2) continue;
		num -= 2;
		for (let i = 0; i <= num; i++){
			const attrs = conf_equipset[i];
			for (let attr of attrs){
				data[attr.KEY.toLowerCase()] += attr.VAL;
			}
		}
	}
	// official
	if (this._role) {
		const lv = this._role.getItems(38004).count;
		const config = global.gameconfig.officialitems[lv > global.gameconfig.officialitems.length ? global.gameconfig.officialitems.length - 1: lv];
		if (config && config.ATTR) {
			for (const attr of config.ATTR){
				data[attr.KEY.toLowerCase()] += attr.VAL;
			}
		}
	}
	// legion
	if (this._role) {
		const tech = this._role.tech || {};
		for (const techid in tech) {
			const config = global.gameconfig.legiontech[techid];
			if (!config) continue;
			if (config.OCCU != conf_property.OCCU) continue;
			const lv = tech[techid];
			for (const attr in config.ATTR) {
				const val = config.ATTR[attr][lv - 1];
				if (typeof val !== 'number') continue;
				if (typeof data[attr.toLowerCase()] !== 'number') continue;
				data[attr.toLowerCase()] += val;
			}
		}
	}
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
			data[attr.toLowerCase()] = data[attr.toLowerCase()] || 0
			data[attr.toLowerCase()] += building[attr];
		}
	}
	// 头像框对武将属性加成
	if (this._role && this._role.frameid && this._role.frameid != 10003) {
		let frameInfo = global.gameconfig.frame[this._role.frameid];
		if (frameInfo) {
			const attArr = frameInfo.ATT || [];
			for (let arr of attArr) {
				data[arr.ID.toLowerCase()] = data[arr.ID.toLowerCase()] || 0;
				data[arr.ID.toLowerCase()] += arr.NUM;
			}
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


	for (let key in data){
		if (data[key] <= 0) delete data[key];
	}

	return data;
}
