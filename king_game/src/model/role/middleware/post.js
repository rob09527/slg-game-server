
'use strict'

require('rx-apiwheel');

const debug = require('debug')('kaihei:model:role:post');

const moment = require('moment');

const print_item = function (role, gsid, type, num, _path_) {
	if (!gsid) return;
	if (!num && typeof num !== 'number') num = 1;
	console.log(role.uid, role.rno, role.servid, type || 'ADD', gsid, num, moment().format('YYYY-MM-DD HH:mm:ss'), role.getProp(gsid), _path_);
}

module.exports = exports = {
	save: function (doc) {	// doc as this
		this.flushchangeItems(); // 把 changeItems 刷到props 上，避免 使用者 重复 save 导致 changeItems 被多次 原子变更
		const print = print_item.bind(null, this);
		this.item_tmp = this.item_tmp || [];
		this.checkLevelUp(this.item_tmp);
		this.pushNotice(); // 处理 红点推送
		for (const item of this.item_tmp){
			print(item.GSID || item.gsid, 'ADD', item.COUNT || item.count, this._path_);
			let gsid = Number.parseInt(item.GSID || item.gsid);
			let count = Number.parseInt(item.COUNT || item.count);
			this.notifyItemMod(gsid, count, 0, item.reason);
		}
		this.cast_items = this.cast_items || [];
		for (const item of this.cast_items){
			print(item.GSID || item.gsid, 'CST', item.COUNT || item.count , this._path_);
			let gsid = Number.parseInt(item.GSID || item.gsid);
			let count = Number.parseInt(item.COUNT || item.count);
			this.notifyItemMod(gsid, count, 1, item.reason);
		}
		for (let { GSID, gsid, COUNT, count, reason } of this.cast_items) {
			let _gsid = GSID || gsid;
			let _count = COUNT || count;
			const async_hook = {
				'30026': count => {
					return this.zhenbaoMissionInvoke({
						missionName: 'LYD_CAST',
						count
					});
				},
				'30014': count => {
					return this.zhenbaoMissionInvoke({
						missionName: 'ZMZ_CAST',
						count
					});
				},
				'30027': count => {
					return this.zhenbaoMissionInvoke({
						missionName: 'GXCOIN_CAST',
						count
					});
				},
				'30029': count => {
					return this.zhenbaoMissionInvoke({
						missionName: 'JWL_CAST',
						count
					});
				},
				'30024': (count) => {
					return this.zhenbaoMissionInvoke({
						missionName: 'BINGFU_CAST',
						count
					});
				},
				'38005': count => {
					// 不累计拍卖行相关元宝消耗
					if (reason && reason.main === 'auction') return Promise.resolve();
					return this.zhenbaoMissionInvoke({
						missionName: 'YUANBAO_CAST',
						count
					});
				},
				'30013': count => {
					return this.zhenbaoMissionInvoke({
						missionName: 'HUNYU_CAST',
						count
					});
				},
			}[_gsid];
			if (async_hook) async_hook(_count).catch(console.error);
		}

		if (this.newg.length > 0) this.refreshCampScore().catch(console.error);
		this.newg = [];
		this.item_tmp = [];
		this.cast_items = [];
		const rid = this._id.toString();
		if(CLIENT_POOL[rid] && CLIENT_POOL[rid].role){ // 每次save 过后刷新一下 role的缓存，避免聊天时候取到的数据不是最新的
			const oldRole = CLIENT_POOL[rid].role;
			this._gameserv = oldRole._gameserv;
			this._tokeninfo = oldRole._tokeninfo;
			CLIENT_POOL[rid].role = this;
		}

		if (this.__chkcreate) this.notifyRoleCreate();
		/**
		 * 简易推送列表
		 * 先把需要推送的内容保存到本列表中，等角色信息save了再发
		 */
		if (this.pushList && this.pushList.length > 0) {
			for (let msg of this.pushList) {
				global.pushClient(this._id.toString(), msg);
			}
		}
	}
}
