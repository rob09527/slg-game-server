
'use strict'
const LISTEN_TAG = require('../../hook/roleTagChange').LISTEN_TAG;
const BATTLE_SETS = {
	'role/chapter/challenge/start': 'normal',
	'role/chapter/challenge/start': 'normal',
	'role/secretRealm/fight/start': 'normal',
	'role/nmaze/challenge/start': 'normal',
	'role/chapter/dboss/one/start': 'normal',
	'role/bigbattle/chapter/start': 'normal',
	'role/bigbattle/mboss/start': 'normal',
	'role/bigbattle/yuangu/start': 'normal',
	'role/tower/challenge/start': 'normal',
	'role/pvp/challenge/start': 'pvpatt',
	'role/exped/challenge/start': 'expedition',
	'role/affairs/boss/start': 'normal',
	'role/legion/my/boss/start': 'normal',
	'role/event/ns2020/boss/start': 'normal',
	'role/manor/outside/challenge/start': 'normal',
	'role/manor/outside/challenge/yijianfarm': 'normal',
	'role/event/tnqw/boss/start': 'normal',
	'role/legion/my/worldboss/start': 'normal',
	'role/occtower/start': 'occtower',
	'role/friend/friendpvp/challenge/start': 'pvpatt',
	"role/event/tgsl/start": "normal",
	'role/maze/chapter/one/node/challenge/start': 'maze',
	'role/legion/my/war/mob/boss/start': 'normal',
	'role/legion/my/war/mob/my/start': 'normal',
	'role/event/wstz/boss/challenge/start': 'normal',
	'role/event/western_treasure/treasure/battle/start': 'normal',
	'role/event/western_treasure/boss/battle/start': 'normal',
	'role/event/map/type1/challenge/start': 'normal',
	'role/fantasy/challenge/start': 'fantasy',
	'role/secrettrial/challenge/start': 'normal',
	'role/groupqxzl/one/challenge/start': 'qxzldef',
	'role/panda/xftz/fight/start': 'normal',
	'role/mjxw/challenge/start': 'normal',
	'role/panda/legend/fight/start': 'normal',
	'role/panda/hsgc/challenge/start': 'normal',
	'role/panda/gjxb/event/fight/start': 'normal',
	'role/dilao/challenge/start': 'dltp',
}

const EXCLUDE_PATHS = [
	'/role/official/srender/list',
	'/role/friend/list',
	'/role/friend/apply/list',
	'/role/friend/quest/info',
	'/role/affairs/list',
	'/role/payment/sppack/gstar/gstar/list',
	'/role/payment/sppack/level/level/list',
	'/role/mail/get',
	'/role/guild/step/list',
]

module.exports = exports = async (ctx, next) => {
	const _gameserv = ctx.role._gameserv;
	const _tokeninfo = ctx.role._tokeninfo;
	ctx.role = await ctx.dao.role.findOne({ _id: ctx.role._id });
	ctx.zhdpoint = require("../../util/event/point").bind(ctx.role); // 周活动判断需要绑定 role,来判断是否新手，所以放在这里 bind
	ctx.pandapoint = require("../../util/event/panda").bind(ctx.role); // 熊猫新活动判断需要绑定 role,来判断是否新手，所以放在这里 bind

	const listenTag = {}; // 监听标识位改变,放最前面，避免异步数据出错
	for (let k of LISTEN_TAG) {
		listenTag[k] = ctx.role.getProp(k);
	}
	ctx.role.rid = ctx.role.i();
	ctx.role._path_ = ctx.path;
	ctx.role._gameserv = _gameserv;
	ctx.role._tokeninfo = _tokeninfo;
	let path_exclude = EXCLUDE_PATHS.includes(ctx.path);
	let lock_params;
	if (!path_exclude) {
		lock_params = {
			uid: ctx.role.uid,
			serv: ctx.role.servid,
			path: ctx.path
		}
		const lock_time = await ctx.apilock.chkAndLock(lock_params);
		ctx.assert(!lock_time, 'api lock');
		ctx.request.lock = lock_params;
	}
	//rob国战脚本 生产模式只屏蔽以下内容
	// if (ctx.path == 'role/pvp/challenge/start') {
	// 	let result = await global.dao.general.find({ rid: ctx.role.rid })
	// 	ctx.request.body.battleset = {
	// 		team: { "3": result[0].id, "5": result[1].id },
	// 	}
	// 	ctx.request.body.target = 'robot_1014'
	// }
	//rob国战脚本end

	if (ctx.request.body.battleset && BATTLE_SETS[ctx.path]) {
		await ctx.role.setBattleSet(BATTLE_SETS[ctx.path], ctx.request.body.battleset, ctx.request.body.type);
	}

	await next();

	let needUpdate = false;
	for (let k in listenTag) {
		let now = ctx.role.getProp(k);
		if (listenTag[k] === now) {
			continue;
		}
		(await ctx.hook.end(EVENT_ENUM.TAG_CHANGE, k, now - listenTag[k], now)) && (needUpdate = true);
	}
	needUpdate && await ctx.role.save();
	// unlock in err cb when err occu
	if (!path_exclude) await ctx.apilock.unLock(lock_params);

	if (ctx.role.__newg) {
		const generals = await ctx.role.generals();
		ctx.client.emit('GENERALS', generals);
		delete ctx.role.__newg;
	}
	if (ctx.role.__newh) {
		const horses = await ctx.role.horses();
		ctx.client.emit('HORSES', horses);
		delete ctx.role.__newh;
	}
	if (ctx.role.__newp) {
		const pets = await ctx.role.pets();
		ctx.client.emit('PETS', pets);
		delete ctx.role.__newp;
	}
}
