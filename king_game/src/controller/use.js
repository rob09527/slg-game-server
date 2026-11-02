
'use strict'
const gameHook = require('../hook');
module.exports = exports = async function (ctx, next) {
	// api锁
	ctx.apilock = require('./../util/apilock');
	// 文字获取
	ctx.textgetter = require('./../util/textgetter');
	// 随机(rx-wheel已加入)
	ctx.random = require('./../util/random');
	// 兑换规则
	ctx.khexec = require('./../util/exec');
	// 季节信息获取
	ctx.bseason = require('./../util/battleseason');
	// 种子生成
	ctx.seed = require('./../util/seedgetter');
	// proxy发送
	ctx.psend = require('./../util/psend');
	// proxy发送(优化后)
	ctx.psendslim = require('./../util/psendslim');
	// 请求跨服服务
	ctx.commonsend = require('./../util/commonsend');
	// 积分活动相关逻辑
	ctx.jfhd = require('../util/jfhd');
	// 日志打印
	ctx.khlog = require('../util/khlog');
	// 职业任务
	ctx.jobtask = require('../util/jobtask');
	ctx.zhdpoint = require("../util/event/point").bind(ctx.role);
	ctx.pandapoint = require("../util/event/panda").bind(ctx.role);
	// 请求自己
	ctx.reqself = require('../util/reqself');
	// 多档礼包
	ctx.is_batch = require('../util/is_batch');

	// 事件钩子
	ctx.hook = {pre: gameHook.pre.bind(ctx), end: gameHook.end.bind(ctx)};

	await next();
	ctx.assert(ctx.body, 'unknow path');
}
