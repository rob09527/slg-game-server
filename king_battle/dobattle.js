
'use strict'

global.window = false;

const dbMythical = require('./bconfig/dbmythical.json');
const dbGeneral = require('./bconfig/general.json');
const dbTreasure = require('./bconfig/treasure.json');

const dbHalo = require('./bconfig/dbHalo.json');


const DoBattleClass = require("./lib/dobattlecls")

var _isClass = function (obj) {
	if (obj === null) return "Null";
	if (obj === undefined) return "Undefined";
	return Object.prototype.toString.call(obj).slice(8, -1);
};
var _deepClone = function (obj) {
	var result, oClass = _isClass(obj);	//确定result的类型
	if (oClass === "Object") {
		result = {};
	} else if (oClass === "Array") {
		result = [];
	} else {
		return obj;
	}
	for (let key in obj) {
		var copy = obj[key];
		if (_isClass(copy) == "Object" || _isClass(copy) == "Array") {
			result[key] = _deepClone(copy);//递归调用
		} else {
			result[key] = obj[key];
		}
	}
	return result;
}
global.gUtils = {};
global.gUtils.deepClone = _deepClone;
global.gConfig = {
	// 光环羁绊配置
	HaloJ: {
		"103": "9",
		"101": "10",
		"102": "11",
		"104": "12",
	},
	// 阵营羁绊配置
	FetterF: {
		1: [{ need: 3, sid: "wei1" },
		{ need: 5, sid: "wei2" },
		],
		2: [{ need: 3, sid: "shu1" },
		{ need: 5, sid: "shu2" },
		],
		3: [{ need: 3, sid: "wu1" },
		{ need: 5, sid: "wu2" },
		],
		4: [{ need: 3, sid: "qun1" },
		{ need: 5, sid: "qun2" },
		],
		5: [{ need: 2, sid: "shen1" },
		{ need: 4, sid: "shen2" },
		],
		6: [{ need: 2, sid: "mo1" },
		{ need: 4, sid: "mo2" },
		]
	},
	// 职业羁绊配置 	//modyfi 2023/02/21调整为2档，这里屏蔽掉第三档
	FetterO: {
		1: [
			{ need: 2, sid: "zhanshi1" },       //  战士
			{ need: 4, sid: "zhanshi2" },
			// {need: 6, sid: "zhanshi3"},
		],
		2: [
			{ need: 2, sid: "cike1" },       //  刺客
			{ need: 4, sid: "cike2" },
			// {need: 6, sid: "cike3"},
		],
		3: [
			{ need: 2, sid: "sheshou1" },       //  射手
			{ need: 4, sid: "sheshou2" },
			// {need: 6, sid: "sheshou3"},
		],
		4: [
			{ need: 2, sid: "junshi1" },       //  军师
			{ need: 4, sid: "junshi2" },
			// {need: 6, sid: "junshi3"},
		],
		5: [
			{ need: 2, sid: "moushi1" },       //  谋士
			{ need: 4, sid: "moushi2" },
			// {need: 6, sid: "moushi3"}
		],
		6: [
			{ need: 2, sid: "huwei1" },       //  护卫
			{ need: 4, sid: "huwei2" },
			// {need: 6, sid: "huiwe3"},
		],
		7: [
			{ need: 1, sid: "hu1" },           // 虎
			{ need: 2, sid: "hu2" },
			// {need: 3, sid: "hu3"}
		],
		8: [
			{ need: 1, sid: "zhen1" },         // 臻
			{ need: 2, sid: "zhen2" },
			// {need: 3, sid: "zhen3"}
		]
	}
}

global.app = {};
global.app.db = {};
global.app.db.getMythicalById = function (parmId) {
	if (!parmId) {
		console.log("[getMythicalById] invalid mythical id");
		return;
	}
	if (!dbMythical[parmId]) {
		console.log("[getMythicalById] no mythical info by id: " + parmId);
		return;
	}
	return dbMythical[parmId];
}

global.app.db.getGBaseByGsid = function (parmGsid) {
	if (!parmGsid) {
		console.log("[getGBaseByGsid] invalid General GSID", Date.now());
		return;
	}
	if (!dbGeneral[parmGsid]) {
		console.log("[getGBaseByGsid] no General Info by GSID: " + parmGsid, Date.now());
		return;
	}

	return dbGeneral[parmGsid];
}

global.app.db.getTBaseByGsid = function (parmGsid) {
	if (!parmGsid) {
		console.log("[getTBaseByGsid] invalid Treasure GSID");
		return;
	}
	if (!dbTreasure[parmGsid]) {
		console.log("[getTBaseByGsid] no Treasure Info by GSID: " + parmGsid);
		return;
	}

	return dbTreasure[parmGsid];
}

var checkHaloHead = function (heroList, actheroid) {
	for (let i = 0; i < heroList.length; i++) {
		let curHeroGsid = heroList[i];
		if (curHeroGsid >= actheroid && curHeroGsid <= actheroid + 10) {
			return true;
		}
	}

	return false;
}
//判断武将光环羁绊是否激活
var checkGeneralHaloActive = function (curHeroGsid, heroList) {
	let haloList = dbHalo;
	let isJihuo = false;
	for (let haloId in haloList) {
		let item = haloList[haloId];
		if (curHeroGsid >= item.ACTHEROID && curHeroGsid <= item.ACTHEROID + 10) {
			return true;
		}
		if (checkHaloHead(heroList, item.ACTHEROID)) {
			item.HEROLIST.forEach((gsid) => {
				if (curHeroGsid >= Number(gsid) && curHeroGsid <= Number(gsid) + 10) {
					isJihuo = true;
				}
			})
		}
	}
	return isJihuo;
}

global.app.getFettersByGsidArr = function (arrGsid) {
	if (!arrGsid) return [];
	let camp = {};
	let occu = {};
	let halo = {};
	let fetter = [];
	for (let i = 1; i <= 6; ++i) { // 初始化 势力 1 2 3 4 5 6
		camp[i] = {}; camp[i].num = 0; camp[i].arr = [];
	}

	for (let i = 1; i <= 8; ++i) { // 初始化 职业 1 2 3 4 5 6 7 8
		occu[i] = {}; occu[i].num = 0; occu[i].arr = [];
	}

	for (let i = 0; i < arrGsid.length; ++i) {
		let ginfo = app.db.getGBaseByGsid(arrGsid[i]);
		let gsid = Number(ginfo.GSID) - (Number(ginfo.GSID) % 20 - 1); 	//获取该武将第一个gsid
		if (ginfo.CAMP && camp[ginfo.CAMP].arr.indexOf(gsid) < 0) {
			camp[ginfo.CAMP].num += 1;
			camp[ginfo.CAMP].arr.push(gsid);
		}
		if (ginfo.OCCU && occu[ginfo.OCCU].arr.indexOf(gsid) < 0) {
			occu[ginfo.OCCU].num += 1;
			occu[ginfo.OCCU].arr.push(gsid);
		}
		if (ginfo.OCCU2 && occu[ginfo.OCCU2].arr.indexOf(gsid) < 0) {
			occu[ginfo.OCCU2].num += 1;
			occu[ginfo.OCCU2].arr.push(gsid);
		}
		if (ginfo.HALO) {
			let bool = checkGeneralHaloActive(arrGsid[i], arrGsid);
			if (!bool) continue;
			let ani = gConfig.HaloJ[String(ginfo.HALO)];
			let dt = halo[String(ginfo.HALO)];
			if (!dt) {
				dt = { num: 0, ani: ani, arr: [], halo: ginfo.HALO }
			}
			if (dt.arr.indexOf(gsid) < 0) {
				dt.arr.push(gsid);
				dt.num++;
			}
			halo[String(ginfo.HALO)] = dt;
		}

	}

	for (let k in camp) {
		let carr = gConfig.FetterF[k];
		let i = 0;
		for (; i < carr.length; ++i) {
			if (camp[k].num < carr[i].need) break;
		}
		fetter.push({ level: i, camp: Number(k), num: camp[k].num, need: carr[Math.min(i, carr.length - 1)].need, max: carr[carr.length - 1].need, fid: carr[Math.max(i - 1, 0)].sid })
	}

	for (let k in occu) {
		let oarr = gConfig.FetterO[k];
		let i = 0;
		for (; i < oarr.length; ++i) {
			if (occu[k].num < oarr[i].need) break;
		}
		fetter.push({ level: i, occu: Number(k), num: occu[k].num, need: oarr[Math.min(i, oarr.length - 1)].need, max: oarr[oarr.length - 1].need, fid: oarr[Math.max(i - 1, 0)].sid })
	}

	for (let k in halo) {
		let item = halo[k]
		fetter.push({ level: item.halo, halo: item.halo, num: item.num, need: 0, max: 0, fid: 0, ani: item.ani })
	}
	return fetter;
}


function doBattle(battleseed, player, enemy, nRound, season, lcards, rcards, btype) {
	let battle = new DoBattleClass()
	battle.doBattle(battleseed, player, enemy, nRound, season, lcards, rcards, btype)
	while (!battle.IsBattleOver()) {
		battle.doUpdate()
	}
	return battle.CollectBattleResult()
}

module.exports = exports = doBattle;