
'use strict'
// 招募祝福信息获取
module.exports = exports = async function (ctx, next) {
    let { ZMZF } = global.gameconfig.zhd;
    let gsid = Object.keys(ZMZF).join('')
	ctx.body = {
		gsid,
		items: ZMZF[gsid]
	};
}