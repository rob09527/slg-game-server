
'use strict'

const debug = require('debug')('kaihei:model:role:pre');

const tg = require('./../../../util/textgetter');
const ms = require('ms');

const { zhdprint } = require("../../../util/khlog")
const zhdpoint = require('../../../util/event/point');
const { sevenDone } = require("../../../util/event/fourteenlogin");
const { smsHit } = require("../../../util/event/smanskin");

function _mail_attr(...vals) {
	const t_title = ['NACTIVITY_TITLE'].append(vals);
	const t_content = ['NACTIVITY_CONTENT'].append(vals);
	return {
		type: 2,
		rid: this._id,
		title: tg.apply(null, t_title),
		content: tg.apply(null, t_content),
	}
}
// 头像框配置
const frameConfig = global.gameconfig.frame;
// 称号配置
const titleConfig = global.gameconfig.title;
const gConfig = global.gameconfig.general;

const _type = require('./../common/type');
module.exports = exports = {
	save: async function (next) {
		this.__chkcreate = this.isNew;
		this._bind_data_ = null; // 一旦修改，把缓存的灵魂属性清空
		if (this.getItems(90222).count >= 6 && !this.firstcharge) this.firstcharge = Date.now();
		this.newg = this.newg || [];
		this.item_tmp = this.item_tmp || [];
		let __new_general_act__; // 判断正在激活状态的新武将活动
		if (this.newg.length) {
			__new_general_act__ = zhdpoint.call(this, "ISZHD", "YHZH") ? 'YHZH' : undefined;
			__new_general_act__ = __new_general_act__ || (zhdpoint.call(this, "ISZHD", "YHZH1") ? 'YHZH1' : undefined);
			__new_general_act__ = __new_general_act__ || (zhdpoint.call(this, "ISZHD", "ATYZM") ? 'ATYZM' : undefined);
			__new_general_act__ = __new_general_act__ || (zhdpoint.call(this, "ISZHD", "ATYZM1") ? 'ATYZM1' : undefined);
		}

		const __now__ = Date.now();
		// 插入新的武将
		this.newg = this.newg.map(ng => {
			if (__new_general_act__) { // 英魂召唤活动时间内
				const cfg = global.gameconfig.zhd_newhero[__new_general_act__]; // 判断配置有链接，则进行触发链接武将逻辑
				if (cfg.LJ && ng.gsid === cfg.LJ.GSID && this.getProp(98200) === 0 && (!this.act.NEW_GENERAL || this.act.NEW_GENERAL.expire < __now__)) { // 触发新武将活动的链接活动逻辑
					this.act.NEW_GENERAL = { // 无论是 什么新武将活动 共享一个字段,NEW_GENERAL
						expire: __now__ + cfg.LJ.EXPIRE * 3600 * 1000,
						gsid: cfg.LJ.GSID,
						inherit_prop: cfg.LJ.INHERIT_PROP
					}
					this.addItemsNoSave({ gsid: 98200, count: 1 });
					pushClient(this._id, { type: 'new_general', content: this.act.NEW_GENERAL });
					console.log('NEW_GENERAL_LJ_TOUCH', this.uid, this.rno, this.servid, ng.gsid, new Date().format());
					this.markModified(`act.NEW_GENERAL`);
				}
			}

			return ng.save();
		});


		// 筛选出重生的武将gsid,如果当前招募祝福里面有重生的武将gsid,则不送装备
		this.dontmarklist = this.item_tmp.map(({ GSID, dontmark }) => {
			if (dontmark) return GSID;
		}).filter(g => g);

		// 插入新的兵书
		if (this.newbook && this.newbook.length > 0) this.newbook = await this.db.models.book.insertMany(this.newbook);
		// 插入新的魂石
		if (this.newsoulstone && this.newsoulstone.length > 0) this.newsoulstone = await this.db.models.soulstone.insertMany(this.newsoulstone);
		// 插入新的印记
		if (this.newsignet && this.newsignet.length > 0) this.newsignet = await this.db.models.signet.insertMany(this.newsignet);
		// 插入新的灵宠物
		if (this.newpet && this.newpet.length > 0) {
			this.newpet = await this.db.models.pet.insertMany(this.newpet);
			this.petnum = await this.db.models.pet.countDocuments({ rid: this._id });
			this.__newp = true;
		}
		// 插入新坐骑
		if (this.newhorse && this.newhorse.length > 0) {
			this.newhorse = await this.db.models.horse.insertMany(this.newhorse);
			this.horsenum = await this.db.models.horse.countDocuments({ rid: this._id });
			this.__newh = true;
		}

		const res = await Promise.all(this.newg).then(g_arr => {
			this.newg = g_arr;
			return this.db.models.general.countDocuments({ rid: this._id });
		}).then(num => {
			// 招募祝福
			if (zhdpoint.call(this, "ISZHD", "zmzf")) {
				for (let { gsid } of this.newg) {
					let items = global.gameconfig.zhd.ZMZF[gsid];
					if (!items) continue;
					// 重生获得的武将也不送
					if (this.dontmarklist.includes(gsid)) continue;
					this.db.models.mail.create({
						type: 2, rid: this._id,
						title: tg('ZHDZMZFT'),
						content: tg('ZHDZMZFC'),
						reward: items
					}).catch(console.error)
					// 周活动日志-招募祝福(只需记录达成的时间)
					zhdprint("zmzf", this)
				}
			}
			// 龙帝赐福
			zhdpoint.call(this, "LDCF", this);
			// 代言人皮肤活动埋点
			smsHit(this);
			let _hda = 0;
			for (let item of this.item_tmp) {
				let gsid = item.GSID || item.gsid;
				if (parseInt(gsid) == 30020) {
					let count = item.COUNT || item.count;
					_hda += count;
				}
			}
			if (_hda > 0) this.addItemsNoSave({ gsid: 90299, count: _hda });
			// 等级礼包开始检测
			const lv = this.level;
			for (let i = 0; i < global.gameconfig.ssppacklevel.length; i++) {
				const config = global.gameconfig.ssppacklevel[i];
				if (lv < config.LEVEL) continue;
				if (this.ssppack.level[i]) continue;
				this.ssppack.level[i] = { end: Date.now() + config.LIMITHOUR * 60 * 60 * 1000, bt: 1 };
				this.markModified('ssppack.level.' + i);
			}
			let mails = [];
			//	武将星级礼包检测
			//	武将封神活动标记
			for (const g of this.item_tmp) {
				if (g.dontmark || g.unmark) continue;
				const GSID = g.GSID || g.gsid;
				if (global.gameconfig.treasure[GSID]) { // 宝物获得检测
					const treasureConfig = global.gameconfig.treasure[GSID];
					this.TREASURE_QUALITY = treasureConfig.QUALITY; // 标记触发字段 ,目前是作为跑马灯的触发
					this.TREASURE_QUALITY_GSID = GSID;
				} else if (global.gameconfig.occuequip[GSID]) { // 检测职业套装获得
					const occConfig = global.gameconfig.occuequip[GSID];
					this.OCC_EQUIP = occConfig.TTAG; // 标记触发字段 ,目前是作为跑马灯的触发  看 houseLampNotify.js
				}

				const config = global.gameconfig.general[GSID];
				if (!config) continue;
				// const reward_config = global.gameconfig.nactivitygstar.deepQueryOne('STAR', config.STAR);
				let TGRADE = this.TGRADE || 0;
				// 跑马灯武将获得通知，只处理5星武将(6星因为是合成的不需要在通报
				if (config.STAR === 5 && Boolean(config.TGRADE) && config.TGRADE > TGRADE) {
					this.TGRADE = config.TGRADE; // 标记获得武将的T级,方便事件监听
					this.TGRADE_GSID = GSID; // 不能删除，跑马灯通知的文案参数,具体调用 看 houseLampNotify.js
				}
				// 配置存在且尚未达到上限
				// if (g.formark && reward_config && this.getItems(reward_config.RMARK).count < reward_config.NUM) {
				// 	this.addItemsNoSave(reward_config.RMARK);
				// 	const m_name = global.gameconfig.text.NACTIVITY_NAME_GSTAR;
				// 	let info = _mail_attr.call(this, m_name, reward_config.NAME);
				// 	info.reward = reward_config.ITEMS;
				// 	mails.push(this.db.models.mail.create(info));
				// }

			}
			// 2023/2/1 修改月度目标奖励领取方式
			// const set = ['affairs', 'exped', 'pvp'];
			// for (const n of set) {
			// 	const config = global.gameconfig['nactivity'+n];
			// 	if (!config) continue;
			// 	const m_name = global.gameconfig.text['NACTIVITY_NAME_'+n.toUpperCase()];
			// 	for (const row of config) {
			// 		if (this.getItems(row.RMARK).count > 0) continue;
			// 		if (this.getItems(row.PROCESS).count < row.NUM) continue;
			// 		let info = _mail_attr.call(this, m_name, row.NAME);
			// 		info.reward = row.ITEMS;
			// 		this.addItemsNoSave(row.RMARK);
			// 		mails.push(this.db.models.mail.create(info));
			// 	}
			// }
			// // 月度活动完成检查
			// for (const row of global.gameconfig.factivity) {
			// 	if (this.getItems(row.RMARK.N).count > 0) continue;
			// 	if (!row.CHK) continue;
			// 	const flag = row.CHK.every(item => {
			// 		if (typeof item !== 'object') item = {GSID: item, COUNT: 1};
			// 		return this.getItems(item.GSID).count >= item.COUNT;
			// 	})
			// 	if (!flag) continue;
			// 	// 普通奖励
			// 	this.addItemsNoSave(row.RMARK.N);
			// 	let info = _mail_attr.call(this);
			// 	info.title = tg('YDKHACTIVITY_TITLE');
			// 	info.content = tg('YDKHACTIVITY_N_CONTENT', row.NAME);
			// 	info.reward = row.ITEMS.N;
			// 	mails.push(this.db.models.mail.create(info));
			// 	// 特权奖励
			// 	if (!this.special.yd) continue;
			// 	this.addItemsNoSave(row.RMARK.S);
			// 	info = _mail_attr.call(this);
			// 	info.title = tg('YDKHACTIVITY_TITLE');
			// 	info.content = tg('YDKHACTIVITY_S_CONTENT', row.NAME);
			// 	info.reward = row.ITEMS.S;
			// 	mails.push(this.db.models.mail.create(info));
			// }
			this.gnum = num;
			if (this.newg.length > 0) {
				this.__newg = true;
				this.missionInvoke('GENERAL_NUMSTAR_HISTORY', this.item_tmp);
				this.zhenbaoMissionInvoke({ missionName: 'STAR5GENERAL', generals: this.item_tmp }).catch(console.error);
			}
			if (this.item_tmp.length > 0) this.missionInvoke('EQUIP_TREASURE_CHK', this.item_tmp);
			// 点将任务
			zhdpoint.call(this, "DJRW", this);
			// icons
			const icons = new Set(this._icons.split('|'));
			for (const g of this.newg) {
				icons.add(g.gsid.toString())
			}
			let _icons = Array.from(icons);
			if (_icons.length > 0) {
				// 历史获得的头像和形象
				for (const gsid of _icons) {
					if (gsid) {
						if (!gConfig[gsid]) continue;
						let { IMAGEID, HEADID } = gConfig[gsid];
						//todo fetch time in config
						// -1为永久
						if (!this._heads[HEADID]) this._heads[HEADID] = -1;
						if (!this._images[IMAGEID]) this._images[IMAGEID] = -1;
					}
				}
			}

			// 判断玩家是否可以解锁vip10和vip13的头像框
			if (this.vip >= 10) {
				// vip10 51008
				let vip10framInfo = frameConfig[51008];
				if (vip10framInfo) {
					let vip10time = vip10framInfo.TIMELIMIT || 1;
					this._frames[51008] = vip10time;
				}
				if (this.vip == 13) {
					// vip13 51009
					let vip13framInfo = frameConfig[51009];
					if (vip13framInfo) {
						let vip13time = vip13framInfo.TIMELIMIT || 1;
						this._frames[51009] = vip13time;
					}
				}
			}
			// 头像框过期set为默认值
			if (this.frameid && this.frameid != 51001 && this.frameid != 10003) {
				// 不是默认值,判断头像框过期时间
				let frameInfo = frameConfig[this.frameid];
				if (frameInfo) {
					let expireTime = frameInfo.TIMELIMIT || 1;
					if (expireTime != -1) {
						if (this._frames[this.frameid] < Date.now()) this.frameid = 51001
					}
					this.markModified('frameid');
				}
			}
			// 判断旧数据头像id和形象id的字段值,赋默认值
			if (this.frameid == 10003 || this.imageid == 10002) {
				let { HEADID, IMAGEID } = gConfig[this.iconid];
				this.imageid = IMAGEID;
				this.frameid = 51001;
				this.headid = HEADID;
				this.markModified('imageid');
				this.markModified('frameid');
				this.markModified('headid');
			}
			// 称号过期set为默认值
			if (this.titleid && this.titleid != 0) {
				let titleInfo = titleConfig[this.titleid];
				if (titleInfo) {
					let expireTime = titleInfo.TIMELIMIT || 1;
					if (expireTime != -1) {
						if (this._titles[this.titleid] < Date.now()) this.titleid = 0
					}
					this.markModified('titleid');
				}
			}
			_icons = _icons.filter(function (gsid) {
				return !!gsid;
			}).join('|');
			if (_icons.length > this._icons.length) this._icons = _icons;
			// fboss phys
			const { MAXBPHYS, BPINTERVAL } = global.gameconfig.others.FRIEND;
			if (this.fbossphys == MAXBPHYS) {
				this.fboss.num = 0;
				this.fboss.last = Date.now();
			} else {
				const interval_num = Math.floor((Date.now() - this.fboss.last) / BPINTERVAL);
				if (interval_num > 0) {
					this.fboss.num -= interval_num;
					this.fboss.num = Math.max(this.fboss.num, 0);
					this.fboss.last = Date.now() - interval_num * BPINTERVAL;
				}
			}
			this.markModified('fboss');
			this.markModified('_frames');
			this.markModified('_heads');
			this.markModified('_images');
			return Promise.all(mails);
		});
		// 最后进行 _change_items , 因为 上面部分逻辑还有 addItemsNoSave的操作
		if (this._change_items_) {
			// 14 日签到埋点
			sevenDone(this);
			// 卧龙战令
			global.dao.warorder.active(this).catch(console.error);
			if (this._change_items_[38005] < 0) {
				await global.dao.warorder.point(this, 90575, Math.abs(this._change_items_[38005]));  // 卧龙战令-终极任务-消耗元宝			
				zhdpoint.call(this, "XHY_RANK", this)
			}
			// 夺宝任务
			zhdpoint.call(this, "DBRW", this, 0, 1, true);
			// 新春任务
			zhdpoint.call(this, 'XCRW_ROLE', this);
			// 圣诞笔记
			zhdpoint.call(this, 'SDBJ_POINT', this)
			// 砸金蛋
			try {
				zhdpoint.call(this, 'ZJD_POINT', this)
			} catch (error) {
				console.log(error)
			}

			if (this._change_items_[38001]) await global.dao.c_worthfund.fetch(this, true);
			await zhdpoint.call(this, "MARKSPUSH", this);
			if (!this.isNew) {
				let u;
				let con = { _id: this._id };
				for (let k in this._change_items_) {
					if (!this._change_items_[k]) {
						continue;
					}
					u = u || {};
					const m = `${_type(k)}.${k}.count`;
					u[m] = this._change_items_[k];
					if (this._change_items_[k] < 0) {
						con[m] = { $gte: -this._change_items_[k] };
					}
				}
				if (u) {
					const r = await this.db.models.role.updateOne(con, { $inc: u, });
					if (r.n === 0) {
						assert.fail('no enough gsid');
					}
				}
			} else { //  创建角色，直接将 gsid 赋值到 this 即可
				this.flushchangeItems();
			}
		}
		if (this._limit_items) {
			let u;
			let con = { _id: this._id };
			for (let k in this._limit_items) {
				if (!this._limit_items[k]) {
					continue;
				}
				u = u || {};
				const m = `castlimit.${k}.count`;
				u[m] = this._limit_items[k];
			}
			if (u) {
				await this.db.models.role.updateOne(con, { $inc: u });
			}
		}
		return res;
	}
}
