
'use strict'

const {ITEMS_COUNT, CAST_ITEMS, VIP_LIMIT, FREE_TYPE_HOUR, GOLD_LIMIT = 2000} = global.gameconfig.others.RECRUIT;
const GOLD_RECRUIT_GSID = 90591; // 金币招募限制标记
const TYPE_STR = [
		'NORMAL', 			// 名将招募
		'FRIEND', 			// 友情招募
		'PREMIUM', 			// 神将招募
		'RARE'				// 种族招募
	];


const {
	RECRUIT: {
		SAFE_PREMIUM,
		SAFE_LEFT,
	},
} = global.gameconfig.others;

const { hitHere } = require("../../../util/weektarget");
const poolRandom = require('../../../util/random/fpool');

module.exports = exports = async (ctx, next) =>{

	const {
		ZF_VAL_MAX=60,
		CHANCE_SCALE_1000 = 450,
	} = global.gameconfig.zhd_xs[ctx.role.isXSConKey("XS_ZMQY").toUpperCase()] || {};
	// 查是否执行招募许愿保底代码
	let zmqyInfo = global.ACTIVITY['zmqy'];
	let isBaoDi = zmqyInfo?(zmqyInfo.getExpand().isbaodi || 0):0;

	const randinpool = function (star = 1, camp = 0, quality = 0) {
		let gsidlist = [];
		if (star == 5 && ctx.role.zmqy) {
			// 过滤已获得许愿武将
			gsidlist = ctx.role.zmqy.gsidlist.filter(({gsid, got}) =>{
				return !got;
			}).map(({gsid}) =>{
				return gsid;
			})
		}
		const generals = global.gameconfig.recruit.filter(function (g) {
			if(quality > 0 && g.QUALITY > quality) return false; //资质限制
			const config = global.gameconfig.general[g.ID];
			if (!config) return false;
			return config.STAR == star && ( camp == 0 || camp == config.CAMP) &&
			(((ctx.role.level >= g.MINLV && ctx.role.level <= g.MAXLV) && (ctx.role.vip >= g.MINVIP && ctx.role.vip <= g.MAXVIP)) || (gsidlist.includes(g.ID)))
		})
		let rates = generals.deepMap('CHANCE');
		// 只在5星武将中开启
		if (star == 5 && ctx.role.zmqy) {	// 祈愿活动逻辑
			// 过滤已获得许愿武将
			// let gsidlist = ctx.role.zmqy.gsidlist.filter(({gsid, got}) =>{
			// 	return !got;
			// }).map(({gsid}) =>{
			// 	return gsid;
			// })
			if (gsidlist.length > 0) {
				// 计算成功率加成
				let roleval = ctx.role.zmqy.val;
				let chance_add = (CHANCE_SCALE_1000 * roleval)/ 1000;
				rates = generals.map(({ID, CHANCE}) =>{
					// 判断候选武将是否在许愿列表内
					let have = gsidlist.includes(ID);
					let add = have? chance_add: 0;
					if (roleval > ZF_VAL_MAX) {
						if (have) {
							return Math.trunc(CHANCE * (1 + add));
						}
						return 0;
					}
					return Math.trunc(CHANCE * (1 + add));
				})
			}
		}
		const getIndex = ctx.random.inweight(rates);
		let general = generals[getIndex];
		ctx.assert(general, 'invalid general');
		if (star == 5 && ctx.role.zmqy) {	// 祈愿活动逻辑

			// 返回前端权重列表，后续删掉该逻辑
			// ctx.generals = (ctx.generals || []);
			// ctx.generals.push(generals.map((g, i) => ({...g, CHANCE: rates[i]})))
			// 查找是否还有许愿武将还没被抽到
			let one = ctx.role.zmqy.gsidlist.find(({got}) =>{
				return !got;
			})
			if (one) {
				// 判断是否抽到许愿的武将
				let {
					gsidlist,
				} = ctx.role.zmqy;
				let info = gsidlist.deepQueryOne('gsid', general.ID);
				if (!info && ctx.role.zmqy.val >= ZF_VAL_MAX) {
					let findGen = generals.find(value=>value.ID == one.gsid);
					general = findGen || general;
					info = gsidlist.deepQueryOne('gsid', general.ID);
				}


				if (info && !info.got) {	// 抽到许愿武将,标记已抽到
					info.got = Date.now();
					// ctx.rate_ = rates[getIndex];

					ctx.role.zmqy.val = 0;
					// 周活动日志-武将许愿
					ctx.khlog.zhdprint("zmqy", ctx.role, info.gsid)
				}else{	// 没抽到许愿武将,祝福值增加
					let {
						val
					} = ctx.role.zmqy;
					val++;
					ctx.role.zmqy.val = Math.min(ZF_VAL_MAX, val);
				}
				ctx.role.markModified('zmqy');
			}
		}
		return {...general};
	}
	ctx.hook.pre(EVENT_ENUM.PUB);
	const times = parseInt(ctx.request.body.times) || 1;
	const type = TYPE_STR[(parseInt(ctx.request.body.type) || 1) - 1];
	// if (type === 'RARE') ctx.assert(ctx.role.vip >= 3 || ctx.role.level >= 70 , 'vip limit');
	const rates_star = global.gameconfig.recruitstar[type];
	ctx.assert(rates_star, 'invalid type');
	let camp = 0;
	let quality = 0;
	if (type === 'RARE') {
		quality = 6;
		camp = parseInt(ctx.request.body.camp || 0);
		ctx.assert(ctx.role.getItems(90234).count > 0,"RACE limit");
		ctx.role.castItemsNoSave({gsid: 90234, count: 1});
	}
	let blackboard = await ctx.dao.c_recruit.findOne({rid: ctx.role._id});
	if (!blackboard) blackboard = new ctx.dao.c_recruit({rid: ctx.role._id});
	let replace10 = true
	let out = [];
	let star5_counter = 0;
	for (let i = 0; i < times; i++) {
		// 普通首次免费
		if (type === 'NORMAL' && ctx.role.getItems(90210).count > 0) {
			ctx.role.castItemsNoSave({gsid: 90210, count: 1});
			let index = ctx.role.getItems(90210).count;
			let gsid = global.gameconfig.others.RECRUIT.FIRST_SPECIAL.NORMAL[index];
			if(gsid){
				out.push({ID: gsid});
				continue;
			}
		}
		// 高级首次免费
		if (type === 'PREMIUM' && ctx.role.getItems(90211).count > 0) {
			ctx.role.castItemsNoSave({gsid: 90211, count: 1});
			let index = ctx.role.getItems(90211).count;
			let gsid = global.gameconfig.others.RECRUIT.FIRST_SPECIAL.PREMIUM[index];
			if(gsid){
				out.push({ID: gsid});
				replace10 = false;
				continue;
			}
		}
		// 星级指定
		let star = ctx.random.inweight(rates_star) + 1;
		ctx.assert(star >= 1 && star <= 5, 'random err');
		// 高招保底记录
		if (type === 'PREMIUM') {
			blackboard.times++;
			if (blackboard.times >= SAFE_PREMIUM) star = 5;
			// if (star == 5) blackboard.times = 0;
			// if (SAFE_PREMIUM - blackboard.times <= SAFE_LEFT && ctx.role.getItems(90307).count == 0){
			//	// 为了触发推荐礼包
			// 	ctx.role[`SAFE_PREMIUM`] = 1;
			// }
			if (star == 5) {
				blackboard.times = 0;
				if(ctx.role.getItems(90307).count == 0){
					// 触发推荐礼包
					ctx.role[`SAFE_PREMIUM`] = 1;
				}
			}
		}
		// 10连续抽，5星最多3个
		if (star == 5) {
			star5_counter++;
			if(star5_counter > 3) star = 4;
		}
		out.push(randinpool(star, camp, quality));
	}
	// 十连比中5星,每角色一次 改为中1个特定5星 
	if (replace10 && type === 'PREMIUM' && times >= 10 && ctx.role.getItems(90307).count > 0) {
		const scOut = randScGeneral(ctx.role.getItems(90307).count);
		for (let k =0; k < out.length; k++){ // 不能用 for in 因为 array的原型链中新增了一些方法
			let star  = global.gameconfig.general[out[k].ID] ? global.gameconfig.general[out[k].ID].STAR : console.log('ERROR GID', k,out[k].ID);
			if (star >= 5){ // 替换 已经抽到的5星为特定5星
				scOut.length > 0 && (out[k] = scOut.shift());
			}
		}
		if (scOut.length > 0){ // 如果 还剩特定五星
			for (let k =0; k < out.length; k++){
				let star  = global.gameconfig.general[out[k].ID] ? global.gameconfig.general[out[k].ID].STAR : console.log('ERROR GID', k,out[k].ID);
				if (star < 5){ // 把小于 5星的替换为特定5星
					if (scOut.length <= 0){
						break;
					}
					out[k] = scOut.shift();
				}
			}
			out.shuffle(); // 洗牌一次 避免5星都在前面看起来很假
		}
		// ctx.role.castItemsNoSave({gsid: 90307, count: ctx.role.getItems(90307).count});
		ctx.role.castItemsNoSave({gsid: 90307, count: 1});
		blackboard.times = 0;
	}

	let castitems = [];
	const interval_hour = FREE_TYPE_HOUR[type];
	const hour = (Date.now() - ctx.role.recruitfree[type.toLowerCase()]) / (60 * 60 * 1000);
	let is_free = false;
	// 免费倒计时
	if (times == 1 && interval_hour && hour >= interval_hour) {
		ctx.role.recruitfree[type.toLowerCase()] = Date.now();
		is_free = true;
	}else{
		const casts_type = global.gameconfig.recruitcost[type];
		ctx.assert(casts_type, 'invalid type');
		const casts = casts_type[times];
		ctx.assert(casts, 'invalid type');
		// 只消耗其中一种物品(兵符or元宝)
		let castflag = false;
		let use38005 = false;
		for (let item of casts){
			// 不从others里的CAST_ITEMS
			// let count = item.COUNT * times;
			// if (item.EVERY) {
			// 	let minus = item.EVERY.MINUS * Math.floor(times / item.EVERY.TIMES);
			// 	count -= minus;
			// }
			const castitem = {gsid: item.GSID, count: item.COUNT};
			try{
				ctx.role.castItemsNoSave(castitem, `recruit_${type.toLowerCase()}`);
			}catch(e){
				continue;
			}
			use38005 = item.GSID == 38005; // 使用元宝消耗
			castitems.push(castitem);
			castflag = true;
			break;
		}
		ctx.assert(castflag, 'not enough');
		if (use38005){
			// 元宝招募限制
			const tagCount = ctx.role.getProp(GOLD_RECRUIT_GSID);
			ctx.assert(tagCount + times <= GOLD_LIMIT, 'gold limit');
			ctx.role.addItemsNoSave([{GSID: GOLD_RECRUIT_GSID, COUNT: times}]);
		}
	}
	// 祝福值保底：祝福值>=50时,给玩家一个三选一个的武将(招募许愿中的武将)
	if (ctx.zhdpoint('ISZHD','zmqy') && ctx.role.zmqy && ctx.role.zmqy.val >= ZF_VAL_MAX && isBaoDi ) {	// 祈愿活动逻辑
		// 查找是否还有许愿武将还没被抽到
		let one = ctx.role.zmqy.gsidlist.find(({got}) =>{
			return !got;
		});
		if (one) {
			let {
				gsidlist,
			} = ctx.role.zmqy;
			// 判断是否抽到许愿的武将
			let getIt = false;
			for (let i = 0 ;i < out.length;i++) {
				let info = gsidlist.deepQueryOne('gsid', out[i].ID);
				if (info){
					getIt = true;
					break;
				}
			}
			if (!getIt) {
				let is_gotGsid = 0;
				// 未抽到,判断是否有5星武将,有的话替换成祝福值的武将
				for (let {ID: gsid} of out) {
					let {STAR: star} = global.gameconfig.general[gsid];
					if (star >= 5) {
						is_gotGsid = gsid;
						break;
					}
				}
				if (is_gotGsid >0) {
					// 替换gsid
					for (let j = 0;j < out.length; j++) {
						if(out[j].ID == is_gotGsid) {
							out[j].ID = one.gsid;
							break;
						}
					}
					let info = gsidlist.deepQueryOne('gsid',one.gsid);
					if (info && !info.got) {	// 抽到许愿武将,标记已抽到
						info.got = Date.now();
						ctx.role.zmqy.val = 0;
						ctx.role.markModified('zmqy');
					}
				}
			}
		}
	}
	let maxstar = {star:0,gsid:0};
	let GROWUP_AWAKE = false
	out = out.map(function (g) {
		let {STAR: star} = global.gameconfig.general[g.ID];
		if (star >= 5) {GROWUP_AWAKE = true};
		if(star > maxstar.star) {maxstar.star = star; maxstar.gsid = g.ID};
		return {gsid: g.ID, count: 1, reason: `recruit_${type.toLowerCase()}`};
	})
	// 为了触发推荐礼包
	if(GROWUP_AWAKE) ctx.role["GROWUP_AWAKE"] = 1;
	// 跑马灯
	ctx.role.bulletScreen("RECRUIT",maxstar.star, maxstar.gsid);

	ctx.role.addItemsNoSave(out);
	const newg = [].append(ctx.role.newg);
	let add_items = [{gsid: 30007, count: ITEMS_COUNT[type] * times}];
	ctx.role.addItemsNoSave(add_items);
	ctx.role.dispatchEvent('EVENT_ZM_' + type, times );
	if (ctx.role.isXS('xs_xyzm') && ctx.zhdpoint('ISZHD', 'xs_xyzm')) await ctx.role.addWish(type, times);
	// 许愿筑梦,增加许愿值
	if (ctx.zhdpoint('ISZHD', 'xyzm')) await ctx.role.addWish(type, times);
	// 招募积分
	if (type === 'PREMIUM') {
		// 七日目标-酒馆高级招募次数
		hitHere(ctx.role, 94209, times, true);
		ctx.role.addItemsNoSave({gsid: 97301, count: times}); // 高级招募次数累计统计

		ctx.zhdpoint('SDBJ_POINT',ctx.role,98204, times); //圣诞笔记-神将招募
		ctx.zhdpoint('ZJD_POINT',ctx.role,98301, times); //欢乐砸金蛋-神将招募

		await global.dao.warorder.point(ctx.role, 90571, times);  // 卧龙战令-终极任务-高级招募
		await ctx.jfhd({name: 'zmjf', role: ctx.role, times}, 1);
	}

	if (type !== 'RARE') {
		if(type === 'PREMIUM'){
			ctx.hook.end(EVENT_ENUM.LOOKSTAR_PREMIUM,times);
			if (is_free) ctx.role.notifyRecruitPremium(ctx.role.recruitfree.premium);
		} else if(type === 'NORMAL'){
			ctx.hook.end(EVENT_ENUM.LOOKSTAR,times);
		}
		await ctx.role.missionInvoke(`ZHAOMU_${type}_DAILY_HISTORY`, times).save();
	}else{
		await ctx.role.save();
	}
	await blackboard.save();

	ctx.body = newg.map(function (doc) {
		doc._role = ctx.role;
		return doc.base();
	});
	ctx.body = {
		generals: ctx.body,
		castitems: castitems,
		items: add_items,
		nextFreshTime: ctx.role.recruitfree[type.toLowerCase()] + interval_hour * 3600 * 1000
	};
	await ctx.role.zhenbaoMissionInvoke({missionName: `ZHAOMU_${type}`, count: times});
	// 打印招募消耗元宝数量日志
	ctx.khlog.ybcastprint('recruit', ctx.role.uid, castitems);
	if (ctx.role.level < 50 && times == 10){
		console.log('MONITOR_RECRUIT_AFTER',`uid:${ctx.role.uid},yb:${ctx.role.getItems(38005).count},gzl:${ctx.role.getItems(30006).count},pzl:${ctx.role.getItems(30005).count}`);
	}
	ctx.assert(ctx.body.generals.length, 'empty generals');

	//限时抽将增加积分
	if (type == "PREMIUM") {
		let [ok, _season, id, _t1, _t2, arg] = ctx.role.isInPanda("XSCJ");
		if (ok && (arg == 0 || arg == 1)) {
			let rank = "panda-xscj" + arg + id;
			let rankService = new global.services.RankService(rank, ctx.role._gameserv.groupid);
			let score = await rankService.getItemScore(ctx.role.i())
			await rankService.set({
				id: ctx.role.i(),
				score: times * 3 + score
			});
		}
	}
}


/**
 * 首抽
 * @param flag
 */
const randScGeneral = (flag, count = 1)=>{
	const pool = global.gameconfig.recruit.filter(g => g.SC_FLAG >= flag);
	return poolRandom(pool, count, 'CHANCE', true).map( g => ({ID: g.ID}));
}
exports.randScGeneral = randScGeneral;
