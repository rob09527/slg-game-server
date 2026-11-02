
'use strict'

const assert = require('assert');

// 硬写最大阶级/等级
const RESON = {
	MAXCLASS: 6,
	MAXLV: 140,
}

const DEFAULT_EQUIP = [
	33001,
	33101,
	33202,
	33302,
]

const PVP_TEAM_SET = ['pvpdef', 'teampvp', 'kingpvp1'];
/**
 * @param key {string| object} // 获取指定key的阵容 或者 转化 指定整容对象得到队伍详细数据
 * @type {function(*=, *): Promise<{mythic: {}, team: {}}>}
 */
module.exports = exports = async function (key, mode) {
	let tmp = { mythic: {}, team: {}, power: 0 };
	const battleset = typeof key === 'object' ? key : this.battlearr[key];
	if (!battleset) return tmp;
	if (battleset.mythic && this.mythical[battleset.mythic]) {
		tmp.mythic = this.mythical[battleset.mythic];
		tmp.mythic.tid = battleset.mythic;
	}
	const guidList = Object.values(battleset.team);

	// 阵法信息获取
	if (battleset.zhenfa) {
		let zhenfa = await this.db.models.zhenfa.getZf(this._id, battleset.zhenfa);
		if (zhenfa) {
			zhenfa = zhenfa.info();
			tmp.zhenfa = {
				id: zhenfa.id,
				lv: zhenfa.lv,
				skillID: zhenfa.skillID,
				pos: zhenfa.pos,
				pickAttr: zhenfa.pickAttr,
			}
		}
	}

	// const temporaryGeneralList = await this.db.models.tempgeneral.find({_id: {$in: guidList}});

	// 查封地加成数据

	const generalMap = await this.findGenerals(guidList);

	for (let pos in battleset.team) {
		let guid = battleset.team[pos];
		let general = generalMap[guid];
		// 判断是否是临时武将
		// if (!general) general =  temporaryGeneralList.find(o => o._id.toString() == guid);

		if (!general) continue;
		if (general.expireAt <= Date.now()) { // 武将已经过期
			const bind = general.inherit && general.inherit.guid;
			// 灵魂武将替换逻辑
			if (bind && general.issoul && !Object.values(battleset.team).includes(bind)) { // 本体  不在在队伍中
				general._bind && (general._bind._role = general._role); //
				general = general._bind; // 本体替换上阵容
			} else {
				continue; // 没有本体
			}
			if (!general) continue;
		}


		if (mode === 'reson') {	// 共鸣模式(王者用)
			// 设置6星
			while (true) {
				let config = global.gameconfig.general[general.gsid + 1];
				if (!config || config.STAR >= 6) break;
				general.gsid++;
			}
			let config = global.gameconfig.general[general.gsid];
			assert(config, 'invalid general');
			// 设置满阶
			general.class = general.class > RESON.MAXCLASS ? general.class : RESON.MAXCLASS;
			// 设置满级
			general.level = general.level > RESON.MAXLV ? general.level : RESON.MAXLV;
			// 装备设置品质5
			let default_equip = [];
			default_equip.push(...DEFAULT_EQUIP);
			general.equip = Object.assign(default_equip, general.equip);
			for (let i = 0; i < general.equip.length; i++) {
				let gsid = general.equip[i];
				while (true) {
					let config = global.gameconfig.equip[gsid];
					if (!config || config.QUALITY >= 5) break;
					gsid++;
				}
				general.equip[i] = gsid;
			}
		}
		const d = general.base();
		if (d.exclusive_equip) {
			tmp.team[pos] = d;
			tmp.power += d.power;
		} else {
			d.skill = [];
			let skillInfo = global.gameconfig.generalclass.find(info => {
				return d.class <= info.CLASS;
			}) || { UNLOCK: 4 };
			let config = global.gameconfig.general[general.gsid];
			config.SKILL.forEach((skill, index) => {
				if (index < skillInfo.UNLOCK) {
					d.skill.push(skill);
				}
			});
			tmp.team[pos] = d;
			tmp.power += d.power;
		}
	}

	if (Object.keys(tmp.team).length === 0 && PVP_TEAM_SET.includes(key)) { // 防守阵容, 替补逻辑
		const g = await this.db.models.general.find({ rid: this._id }).hint({ rid: 1 }).sort({ level: -1 }).limit(1);
		let tibu;
		if (g.length > 0) {
			tibu = g[0];
		} else { // 如果玩家极端情况一个武将都没了
			tibu = this.db.models.general.newGeneralNoSave(this.i(), 12241);
		}
		tibu._role = this;
		const d = tibu.base();
		tmp.team[27] = d;
		tmp.power += d.power;
	}
	return tmp;
}
