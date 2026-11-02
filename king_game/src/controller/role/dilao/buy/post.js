
'use strict'

const recharge = require("../../../../remote/recharge/post");

module.exports = exports = async (ctx, next) => {
	let {
		platform,
		bundle,
		channel,
		version,
		type,
		pos,
		index
	} = ctx.request.body;
	let info = ctx.role.dltp.shop[type][pos];
	ctx.assert(info && info.shop[index].limit > info.shop[index].buy, 'can not buy');
	let shop = info.shop[index];
	let pid = ['dltp', type, pos, index].join('_');
	if (shop.type == 0) {
		ctx.assert(ctx.role.getProp(shop.cost.GSID) >= shop.cost.COUNT, '136');
		ctx.role.castItemsNoSave(shop.cost);
		ctx.request.body.rid = ctx.role.i();
		ctx.request.body.pid = pid;
		await recharge(ctx, next);
		ctx.body = { direct: 1 }
		ctx.save = false;
		return;
	}
	if (global.config.GANGER_NO_ORDER === true) {
		// 测试环境支付特殊处理，客户端没有准确的 pid，这里帮他们缓存
		ctx.orderReq = async (...args) => {

			const data = { data: { oid: Math.floor(Math.random() * 10000000 + 10000000) } };
			console.log('MAKE VIRTURE ORDER', ctx.role.rno, ctx.role.uid, ' OID:', data.data.oid, 'PRICE:', args[0].price, ' pid:', args[0].pid)
			if (data.data && typeof data.data == 'object') {
				CACHE[data.data.oid] = args[0].pid;
			} else {
				CACHE[data.oid] = args[0].pid;
			}
			data.data.data = { oid: data.data.oid };
			return data;
		};
	} else {
		ctx.orderReq = async function (params) {
			if (ctx.request.body.deviceInfo) {
				params.deviceInfo = ctx.request.body.deviceInfo;
				params.deviceInfo.ua = ctx.headers['user-agent'];
				params.deviceInfo.ip = ctx.ip;
			}
			params.current_level = ctx.role.level; // 埋下单时候的角色等级
			params.host = `${global._HOST}:${global._PORT}`;
			const data = await global.remote.proxy_order_create(params);
			data.data = { oid: data.oid };
			return { data };
		}

	}


	let rechargeInfo = {
		platform,
		bundle,
		channel,
		version,
		pid,
		price: shop.PRICE ? shop.PRICE : shop.price,
		uid: ctx.role.uid,
		rid: ctx.role.i(),
		servid: ctx.role.servid,
	}
	let { data } = await ctx.orderReq(rechargeInfo);
	ctx.assert(!data.error, data.error);
	ctx.body = data;
}