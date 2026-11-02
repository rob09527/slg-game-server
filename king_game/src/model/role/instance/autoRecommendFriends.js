
'use strict'

const _ = require('lodash');

const {CAHPTER_NODE: chaperNodes} = global.gameconfig.arf;

module.exports = async function (chapterid) {
	chapterid = Number.parseInt(chapterid);
	// 判断是否在设定节点上
	if (!chaperNodes.includes(chapterid)) return;
	const {
		role: roleModel,
		apply: applyModel,
	} = this.db.models;
	// 在线及关卡相关玩家
	let cond = {
		_id: {
			$ne: this._id,
		},
		_maxmapid: {
			$gte: 5,	// 10201
			$lte: 52,	// 10608
		},
		update: {
			$gte: Date.now() - 30 * 60 * 1000,	// 30min
		},
		rname:{$exists:1},
		servid: {
            $in: this._gameserv.group_sid_list // 需要排除非本跨服组玩家
        }
	}
	let list = await roleModel.find(cond, {uid: 1});
	if (list.length < 1) return;
	// 过滤好友
	list = list.map(({_id}) => _id.toString());
	list = _.difference(list, this.friends);
	if (list.length < 1) return;
	// 过滤已给玩家自动发送申请的玩家
	cond = {
		type: 'friend',
		to: this.i(),
	}
	let applylist = await applyModel.find(cond, {rid: 1});
	applylist = applylist.map(({rid}) => rid);
	list = _.difference(list, applylist);
	if (list.length < 1) return;
	// 随机抽取
	list.shuffle();
	cond = {
		type: 'friend',
		rid: list[0],
		to: this.i(),
	}
	await applyModel.create(cond);
}