
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.body = {};
	let {
		sid,
	} = ctx.request.body;
	let url = '/sys' + ctx.url;
	let {data} = await ctx.req_gserv(sid, url, ctx.request.body);
	ctx.body = data;
}