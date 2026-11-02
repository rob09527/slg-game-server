
'use strict'

module.exports = exports = async function (ctx, next) {
	const {rid, pid} = ctx.request.body;
	const role = await ctx.dao.role.findOne({_id: rid});
	ctx.assert(role, 'role nexist');

	ctx.body = {num: -1};
	// chargexxx 无限可买
	if (pid.startsWith('special')) {
		const prefix = pid.slice(7);
		// 贵族/至尊卡可无限续卡
		// 其他特权需要到期了才能购买
		if (prefix !== 'gz' && prefix !== 'gz' ) {
			const endtime = role.special[prefix] || 1;
			ctx.body.num = Date.now() > endtime? 1: 0;
		}
	}else if (pid.startsWith('spp')) { // 周/月礼包
		ctx.body.hide = 1;
		ctx.body.num = 0;
		const [, cycle, index] = pid.split('_');
		let cache = await ctx.dao.c_sppack.findOne({rid, type: cycle});
		if (!cache) return;
		let item = cache.items[index];
		if (!item) return;
		// 检查关卡条件
		if (item.lock > 0 && role.maxmapid <= item.lock) return;
		// 检查标记条件
		if (item.mark && role.getProp(item.mark) <= 0) return;
		delete ctx.body.hide;
		ctx.body.num = item.buytime;
	}else if (pid.startsWith('sspp')) { // 等级/星级礼包
		const [, type, index] = pid.split('_');
		const info = role.ssppack[type][index] || {end: 1, bt: 0};
		if (info.end > Date.now() && info.bt > 0) {
			ctx.body.num = info.bt;
		}else{
			ctx.body.num = 0;
		}
		if (ctx.body.num == 0) ctx.body.hide = 1;
	}else if (pid.startsWith('daypack')) { // 日礼包
		ctx.body.num = 0;
		ctx.body.hide = 1;
		// 设置默认值
		role.daypack = role.daypack || {record: []};
		if (role.daypack.ispay) return;
		let [
			,
			index,
		] = pid.split('_');
		index = Number.parseInt(index);
		let config = global.gameconfig.daypack[index];
		if (!config) return;
		// 检查购买次数
		let bought = role.daypack.record[index] || 0;
		if (bought >= config.LIMIT) return;
		delete ctx.body.hide;
		ctx.body.num = config.LIMIT - bought;
	}else if (pid.startsWith('overlord')) { // 霸王礼包
		ctx.body.num = 0;
		let [
			,
			index,
		] = pid.split('_');
		index = Number.parseInt(index);
		let config = global.gameconfig.overlord[index];
		if (!config || config.VIP > role.vip) {
			ctx.body.hide = 1;
			return;
		}
		ctx.body.num = config.LIMIT - (role.overlord[index] || 0);
	}else if (pid.startsWith('rewardcup')) {	// 委托令
		ctx.body.num = 0;
		ctx.body.hide = 1;
		let [
			,
			name,
		] = pid.split('_');
		let config = global.gameconfig.rewardcup[name];
		if (!config) return;
		if (role.daysAfterCreate() < 7) return;
		// 已购买检查
		if (config.LIMIT && role.getProp(config.LIMIT) > 0) return;
		delete ctx.body.hide;
		ctx.body.num = 1;
	}else if (pid.startsWith('cwh')) { // 超玩会限定
		let config = global.gameconfig.cwh.PRODUCT[pid];
		ctx.assert(config, 'invalid pid');
		let [, name] = pid.split('_');
		if (name === 'vipa') {
			let range_index = -1;
			for (let i = 0; i < config.RANGE.length; i++) {
				let obj = config.RANGE[i];
				if (role.vip < obj.LEASTVIP) break;
				range_index = i;
			}
			ctx.assert(range_index >= 0 && range_index < config.RANGE.length, 'invalid range');
			config = config.RANGE[range_index];
		}
		let {
			MARK,
			LIMIT = 1,
		} = config;
		ctx.body.num = 1;
		if (config.MARK) {
			let bought = role.getItems(config.MARK).count;
			ctx.body.num = LIMIT - bought;
		}
	}else if (pid.startsWith('zylb')) { // 职业礼包
		ctx.body.num = 0;
		ctx.body.hide = 1;
		let [prefix, index] = pid.split('_');
		let config = global.gameconfig.zylb[(role.tutor || 1) - 1];
		config = config[index];
		if (!config) return;
		ctx.body.hide = 0;
		let bought = role[prefix][index] || 0;
		ctx.body.num = config.LIMIT - bought;
	}else if (pid.startsWith('worthfund')) { // 超值基金
		ctx.body.num = 0;
		ctx.body.hide = 1;
		let [prefix, index] = pid.split('_');
		let {
			FUND: config,
		} = global.gameconfig.worthfund;
		config = config[index];
		if (!config) return;
		ctx.body.hide = 0;
		let record = await global.dao.c_worthfund.findOne({rid: role._id});
		if (record.bought(price)) return;
		ctx.body.num = 1;
	}else if (pid.startsWith('auctionpack')) { // 拍卖行礼包
		ctx.body.num = 0;
		ctx.body.hide = 1;
		let [prefix, type, index] = pid.split('-');
		let config = global.gameconfig.auctionpack.PACK[index];
		if (!config) return;
		let one = await global.dao.c_auctionpack.findOne({rid: ctx.role._id, type})
		if (!one) return;
		ctx.body.hide = 0;
		let record = one.record || [];
		if (record.length > 0) return;
		ctx.body.num = 1;
	}else{
		let info = pid.split('_');
		if (info[1]) {	// 活动礼包
			let [hd, index] = info;
			let [
				start = 1111111111111,
				end = start,
			] = global.config.ZHD[hd.toUpperCase()] || [];
			if (!Date.in(start, end)) {
				ctx.body.hide = 1;
				return;
			}
			let config = global.gameconfig.zhd[hd.toUpperCase()];
			ctx.assert(config, 'invalid hd');
			config = config[index];
			ctx.assert(config, 'invalid pindex');
			let {LIMIT = 1} = config;
			let bought = role[hd][index] || 0;
			ctx.body.num = LIMIT - bought;
		}
	}
}