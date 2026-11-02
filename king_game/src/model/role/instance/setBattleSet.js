
'use strict'

const assert = require('assert');

const BATTLESET_GENERAL_MAX_NUM = {
}
const UNQUINE_TEAM = /^(kingpvp)|(legionpvp)|(ringpvp)|(nationwar)/; // 设置互斥的阵容组
const generalConfig = global.gameconfig.general
module.exports = exports = async function (key, set, type = 1) {
	// 参数type 用于区分职业塔试炼的阵营 1先锋  2刺客  3射手  4军师

	// 移除武将数据中的阵容标记
	const old_set = this.battlearr[key];
	// 整容是否有改变, 这段逻辑的访问频次很高，绝大部分用户不会改整容直接 start 所以无效每次都进行大量更新
	let hasChange = !old_set; // 没有历史整容则一定属于改变
	let onlyPosChange = false; // 若有改变，是否只是位置改变
	if (old_set) {
		if (Object.keys(old_set.team).length !== Object.keys(set.team).length){
			hasChange = true;
		} else {
			for (let k in old_set.team) {
				if(set.team[k] !== old_set.team[k]){
					hasChange = true;
					break;
				}
			}
			if (hasChange){ // 检测武将是否有变动
				const gset = new Set([...Object.values(set.team), ...Object.values(old_set.team)]);
				onlyPosChange = gset.size === Object.values(old_set.team).length; // 如果前后设置的武将一样，则表示只有位置改变
			}
		}
		if (hasChange){
			let udp = {
				$unset: {
					[`battleset.${key}`]: 1,
				}
			}
			// 改为批量更新
			await this.db.models.general.updateMany({_id: {$in: Object.values(old_set.team)}}, udp);
		}
	}
	// const excludeMythic = {}; // 排除的神兽
	if (onlyPosChange){ // 只有武将位改变, 就不需要做武将互斥逻辑了, 也不需要将之前的武将 battleset 修改掉
		const guids = Object.values(set.team);
		const generalMap = await this.findGenerals(guids);
		if (key.startsWith('maze')) {
			const tmpGenerals = await this.db.models.tempgeneral.find({_id: {$in: guids}});
			for (const tmp of tmpGenerals) {
				generalMap[tmp._id.toString()] = tmp;
			}
		}
		assert(Object.values(generalMap).length === guids.length, 'general nexist'); // 有武将不存在了，可能是被消耗了
		let power = 0;
		this._needChangeGeneral = [];
		for (let pos in set.team){
			const guid = set.team[pos];
			let general = generalMap[guid];
			power += general.base().power;
			general.battleset[key] = pos;
			general.markModified('battleset');
			this._needChangeGeneral.push(general);
			this._powerbattleset[key] = power;
		}
	}else if (hasChange){
		// 需要排除的武将
		const exclude_generals = {};
		// 互斥队伍检测
		if (UNQUINE_TEAM.test(key)) {
			let index = key.match(/\d/);
			index = index ? +index[0]: '';
			let keyGroup = key.replace(index, '');
			for (let i = 1; i <= 3; i++) {
				// 当前队伍里武将可以设置
				if (i === index) continue;
				let battleset = this.battlearr[`${keyGroup}${i}`];
				if (!battleset) continue;
				for (let guid of Object.values(battleset.team)) {
					exclude_generals[guid] = 1;
				}
			}
			const soulGeneral = await this.db.models.general.find({_id: {$in: Object.keys(exclude_generals)} , 'inherit.guid' : {$exists: 1}}, {inherit: 1}); // 查王者演伍 其他对里面有没有灵魂武将
			if(soulGeneral.length > 0){
				for (let g of soulGeneral){
					if(!g.issoul){
						continue;
					}
					exclude_generals[g.inherit.guid] = 1; // 灵魂武将本体也需要排除
				}
			}
		}

		const generalMap = await this.findGenerals(Object.values(set.team));

		const now = Date.now();
		// 检验限时 灵魂武将不能和本体同时上战场
		for (let k in generalMap){
			const g = generalMap[k];
			if(!g || !g.expireAt){
				continue;
			}
			assert(g.expireAt > now, 'general expire'); // 武将过期不能上战场
			if(g.issoul && g.inherit.guid){
				assert(!generalMap[g.inherit.guid], 'soul generals exist');
				assert(!exclude_generals[g.inherit.guid], 'soul generals exist');

			}
		}
		// 职业试炼,判断是否是同一阵容,双职业则判断主职业
		if (key.startsWith('occtower')) {
			let _type = type;
			key = [key,_type].join(''); // 组合best的key
			let occuNum = 0;
			for (let pos in set.team) {
				const guid = set.team[pos];
				let general = generalMap[guid];
				let occu2 = generalConfig[general.gsid].OCCU2;
				if (generalConfig[general.gsid].OCCU == _type || (occu2 && occu2 == _type)) occuNum++;
			}
			assert(occuNum >= 5,'general occu err');
		} else if (key.startsWith('dltp')) {
			key = [key,type].join(''); // 组合best的key
			for (let pos in set.team) {
				const guid = set.team[pos];
				let general = generalMap[guid];
				if (type < 5) {
					if (generalConfig[general.gsid].CAMP != type) assert.fail('camp mismatch');
				}
				else if (generalConfig[general.gsid].CAMP < 5) {
					assert.fail('camp mismatch');
				}
			}
		}
		let max = BATTLESET_GENERAL_MAX_NUM[key] || 10;
		let power = 0, total = 0;

		this._needChangeGeneral = [];
		for (let pos in set.team){
			const guid = set.team[pos];
			let general = generalMap[guid];

			if (key.startsWith('maze')) {
				if (!general) general = await this.db.models.tempgeneral.findOne({_id:guid});
			}
			assert(general && general.rid === this._id.toString(), 'general nexist');
			assert(!exclude_generals[general._id.toString()], 'duplicate onset');
			total++;
			assert(total <= max, 'much general');

			power += general.base().power;
			// 王者多阵容特殊处理
			// let gkey = key;
			// if (gkey.startsWith('kingpvp')) gkey = 'kingpvp';
			// general.battleset[gkey] = pos;
			general.battleset[key] = pos;
			general.markModified('battleset');
			this._needChangeGeneral.push(general);
			this._powerbattleset[key] = power;
		}
	}

	if (this._legion){ // 设置军团战整容阵营时，
		const campCount1 = await this.db.models.role.countDocuments({
			_id: {$in: this._legion._members.map(o => o.rid)},
			[`battlearr.legionpvp1.camp`]: set.camp
		});
		const campCount2 = await this.db.models.role.countDocuments({
			_id: {$in: this._legion._members.map(o => o.rid)},
			[`battlearr.legionpvp2.camp`]: set.camp
		});
		// 先检测单阵营最大数 10
		assert(campCount1 + campCount2 < 20, 'camp full');
	}
	this.battlearr[key] = set;
	this.markModified('battlearr');
	this.markModified('_powerbattleset');
	await this.save();

	if(this._needChangeGeneral){
		await Promise.all(this._needChangeGeneral.map(g => g.save())); // 循环过后进行 save
	}
}
