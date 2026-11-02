'use strict'

// 返利礼包
module.exports = async function(ctx, next) {
	for (let index = 1; index <= 4; index++) {
		if (ctx.zhdpoint("ISZHD", 'fllb'+index)) {
            ctx.KEY = `fllb${index}`;
			break;
		}
	}
	ctx.assert(ctx.KEY, "fn freeze");

	ctx.config = global.gameconfig.zhd_newhero[ctx.KEY.toUpperCase()] || global.gameconfig.zhd[ctx.KEY.toUpperCase()];
	ctx.assert(ctx.config, "invalid "+ctx.KEY);

	if (!ctx.role[ctx.KEY]) {
		ctx.role[ctx.KEY] = {record:[], luck:0, refersh:0};
		ctx.save = true;
	}
	ctx.record = ctx.role[ctx.KEY];
	if (!ctx.record.record) {
		ctx.record.record = [];
		ctx.save = true;
	}
	if (ctx.record.luck == undefined) {
		ctx.record.luck = 0;
		ctx.save = true;
	}
	if (ctx.record.refersh == undefined) {
		ctx.record.refersh = 0;
		ctx.save = true;
	}
	if (global.config.GANGER_NO_ORDER === true) {
    	// 测试环境支付特殊处理，客户端没有准确的 pid，这里帮他们缓存
		ctx.orderReq = async (...args)=> {

			const data = {data:{oid: Math.floor(Math.random() * 10000000 + 10000000)} } ;
			console.log('MAKE VIRTURE ORDER',ctx.role.rno,ctx.role.uid,' OID:',data.data.oid, 'PRICE:',args[0].price,' pid:',args[0].pid )
			if (data.data && typeof data.data == 'object') {
				CACHE[data.data.oid] = args[0].pid;
			}else {
				CACHE[data.oid] = args[0].pid;
			}
    		data.data.data = { oid: data.data.oid };
			return data;
		};
    } else {
		ctx.orderReq = async function(params) {
			if (ctx.request.body.deviceInfo) {
				params.deviceInfo = ctx.request.body.deviceInfo;
				params.deviceInfo.ua = ctx.headers['user-agent'];
				params.deviceInfo.ip = ctx.ip;
			}
			params.current_level = ctx.role.level; // 埋下单时候的角色等级
			params.host = `${global._HOST}:${global._PORT}`;
			const data = await global.remote.proxy_order_create(params);
			data.data = { oid: data.oid};
			return {data};
		}

    }
	await next();
	if (ctx.save) {
		ctx.role.markModified(`${ctx.KEY}`);
		await ctx.role.save();
	}
}