
'use strict'

const {
	FREE_TYPE_HOUR,
} = global.gameconfig.others.RECRUIT;

const frameConfig = global.gameconfig.frame;
const titleConfig = global.gameconfig.title;
const generalConfig = global.gameconfig.general;

module.exports = exports = async function () {
	let base = this.toJSON();
	const now = Date.now();
	// 包裹物品分开
	const bags = ['hide', 'props', 'others'];
	for (const bag of bags) {
		for (const gsid in base[bag]) {
			if (base[bag][gsid].count <= 0) delete base[bag][gsid];
		}
	}
	// 觉醒宝物(没有被穿戴的)
	let atreasurelist = await this.db.models.awake_treasure.find({ rid: this._id, general: { $exists: 0 } });
	for (let awake_treasure of atreasurelist) {
		base.props[awake_treasure._id.toString()] = await awake_treasure.base();
	}
	// 没有被穿戴的兵书
	base.books = {};
	let booklist = await this.db.models.book.find({ rid: this._id, general: { $exists: 0 } });
	for (let book of booklist) {
		base.books[book._id.toString()] = await book.base();
	}
	// 没有装备的魂石
	base.soulstones = {};
	let stonelist = await this.db.models.soulstone.find({ rid: this._id, general: { $exists: 0 } });
	for (let stone of stonelist) {
		base.soulstones[stone._id.toString()] = await stone.fullbase();
	}
	// 没有装备的印记
	base.signets = {};
	let signetist = await this.db.models.signet.find({ rid: this._id});
	for (let signet of signetist) {
		base.signets[signet._id.toString()] = await signet.base();
	}
	// 判断头像框有没有过期,过期了设置为默认头像框
	if (base.frameid && base.frameid != 51001 && base.frameid != 10003) {
		// 不是默认值,判断头像框过期时间
		let frameInfo = frameConfig[base.frameid];
		if (frameInfo) {
			let expireTime = frameInfo.TIMELIMIT;
			if (expireTime != -1) {
				let frameTime = base._frames[base.frameid];
				if (frameTime < now) base.frameid = 51001;
			}
		}

	}
	// 判断称号有没有过期,过期了设置为默认称号
	if (base.titleid && base.titleid != 0) {
		// 不是默认值,判断头像框过期时间
		let titleInfo = titleConfig[base.titleid];
		if (titleInfo) {
			let expireTime = titleInfo.TIMELIMIT;
			if (expireTime != -1) {
				let titleTime = base._titles[base.titleid];
				if (titleTime < now) base.titleid = 0;
			}
		}
	}
	base.power = base._power;
	// 设置rid
	base.id = base._id;
	// 设置rname
	base.rname = base.name;
	// 试练塔从1层开始
	base.tower++;
	// 删除需要隐藏的字段
	delete base._id;
	delete base.__v;
	delete base.cdkeys;
	delete base.name;
	delete base._nowmapid;
	delete base._maxmapid;
	delete base._power;
	delete base._powerbattleset;
	delete base.ssppack;
	delete base.fboss;
	delete base.lmission;

	delete base.lxljcz;
	delete base.lxljcz1;
	delete base.lxljcz2;
	delete base.lxljcz3;

	delete base.vipzksd1;
	delete base.vipzksd2;
	delete base.vipzksd3;
	delete base.vipzksd4;

	delete base.fllb1;
	delete base.fllb2;
	delete base.fllb3;
	delete base.fllb4;

	delete base.hglb1;
	delete base.hglb2;
	delete base.hglb3;
	delete base.hglb4;
	delete base.bless;
	// 保证武将封赏系统有数据返回
	base.general_official = base.general_official || { official: {}, retinue: {} };
	// 招募免费倒计时
	for (const type in base.recruitfree) {
		base.recruitfree[type] += FREE_TYPE_HOUR[type.toUpperCase()] * 60 * 60 * 1000;
	}
	// 月度活动结束时间点
	const month_sec = 30 * 24 * 60 * 60 * 1000;
	base.ydend = new Date(base.create + month_sec).setHours(0, 0, 0, 0);
	while (base.ydend < now) base.ydend += month_sec;
	// 在model/role/middleward/pre.js 里面保存所有头像和形象
	// // 判断旧数据头像id和形象id的字段值,赋默认值
	// if (base.frameid == 10003 || base.imageid == 10002) {
	// 	let { HEADID, IMAGEID } = generalConfig[base.iconid];
	// 	base.imageid = IMAGEID;
	// 	base.frameid = 51001;
	// 	base.headid = HEADID;
	// }
	// 判断职业任务结束时间30天
	if (base.occtaskend == 0) {
		// base[global.gameconfig.function_luck.OCCTASK.REQUIRE_NAME] >= global.gameconfig.function_luck.OCCTASK.REQUIRE_COUNT
		// 0为初始值
		base.occtaskend = now + 3600 * 24 * 30 * 1000;
	}
	// 观星/高级招募保底次数
	base.safe = {
		spin: {
			normal: global.gameconfig.others.SPIN.SAFE_EIGHT_TIMES_N,
			premium: global.gameconfig.others.SPIN.SAFE_EIGHT_TIMES_P,
		},
		recruit: {
			premium: global.gameconfig.others.RECRUIT.SAFE_PREMIUM,
		},
	}
	// 观星保底剩余次数
	let blackboards = await this.db.models.c_spin.find({ rid: base.id });
	for (let obj of blackboards) {
		base.safe.spin[obj.type] = base.safe.spin[obj.type] - obj.rolltimes;
	}
	// 高级招募保底剩余次数
	blackboards = await this.db.models.c_recruit.findOne({ rid: base.id });
	if (blackboards) base.safe.recruit.premium = base.safe.recruit.premium - blackboards.times;
	// 神兽天赋计算好加成值再返回
	base.mythical = this.countAllMythicAttr();
	// 先锋召唤结束时间
	let vanguard = await this.db.models.vanguard.findOne({ rid: base.id });
	if (vanguard) {
		base.vanguard = {
			end: vanguard.confirm ? vanguard.confirm : vanguard.start + 60 * 24 * 60 * 60 * 1000,
		}
	}
	// 百级关羽入口
	base.guanyu = await this.db.models.guanyu.duration(this._id, this.getProp(90222));

	// 武将升星入口
	base.generalstar = await this.db.models.generalstar.duration(this._id, 'guanyu', {"93203":this.getProp(93203),"93312":this.getProp(93312)})

	// 返回珍宝普通抽奖免费冷却时间
	const {
        FREE_CD_HOUR,
    } = global.gameconfig.zhenbao_roll_others;
    const CD_MS = FREE_CD_HOUR * 60 * 60 * 1000;
	base.zhenbao_free += CD_MS;
	
	return base;
}
