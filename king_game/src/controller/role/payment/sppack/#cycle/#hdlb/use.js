
'use strict'
const moment = require("moment")

module.exports = exports = async function (ctx, next) {
	let {hdlb = 'unknow'} = ctx.params;
	if(hdlb == 'cplb' || hdlb == 'cplb2'){
		ctx.hook.pre(EVENT_ENUM.ACTIVITY_ZHD_XUNBAO);
	}
	// 非周活动礼包单独限制
	if(hdlb == "zylb") {
		// 职业礼包，创角七天内才给于显示和购买
		ctx.assert(Date.now() < moment(ctx.role.create).startOf("day").add(7, "day").valueOf(), "not open")
		let tutor = ctx.role.tutor || 1;
		ctx.config = global.gameconfig.zylb[tutor - 1]
	}else {
		const {
			SPECIAL_XS,	// 新手排除活动
		} = global.gameconfig.zhd_special_xs;
		// 角色为新手且活动不在排除范围内,需要转换成新手礼包
		const key = ctx.role.isXS('xs_'+hdlb) && !SPECIAL_XS[hdlb.toUpperCase()]? 'xs_'+hdlb: hdlb;
		const up = ctx.role.isXS('xs_'+hdlb)  ? ctx.role.isXSConKey(key).toUpperCase():key.toUpperCase();
		ctx.KEY = up.toUpperCase();
		ctx.assert(ctx.zhdpoint("ISZHD", key) , 'not open');
		ctx.config =  global.gameconfig.zhd_newhero[up] ||  global.gameconfig.zhd[up]
	}
	ctx.assert(ctx.config, 'invalid hdlb');
	await next();
}
