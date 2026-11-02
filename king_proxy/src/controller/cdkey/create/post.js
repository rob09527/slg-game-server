
'use strict'

const moment = require('moment');

const _gen_key = function () {
	var str = Date.now().toString();
	str = str.slice(-8);
	str = Math.ceil(parseInt(str.split('').reverse().join('')) * Math.random()).toString(24);
	if (str.length < 6) {
		var bit = 6 - str.length;
		for (var i = 0; i < bit; i++) {

			str = '0' + str;
		}
	}
	return str.toUpperCase();
}

module.exports = exports = async function (ctx, next) {
	const opts = ctx.request.body;
	let { count = '0' } = opts;
	count = parseInt(count) || 1;
	ctx.assert(opts.name, 'missing name');
	ctx.assert(opts.items && opts.items.length > 0, 'items err');

	for (let item of opts.items) {
		item.COUNT = parseInt(item.COUNT);
	}
	if (opts.start) opts.start = moment(opts.start).valueOf();
	if (opts.end) opts.end = moment(opts.end).valueOf();
	// if (opts.servid == "ALL") delete opts['servid'];
	delete opts['count'];
	let cdkeys = [];
	console.log("CDKEY_CREATE", JSON.stringify({ count, opts }))
	while (cdkeys.length < count) {
		const key = _gen_key();
		let one = await ctx.dao.cdkey.findOne({ key });
		if (one) continue;
		one = new ctx.dao.cdkey(opts);
		one.key = key;
		await one.save();
		cdkeys.push(one.key);
	}
	ctx.assert(cdkeys.length > 0, 'gen fail');
	ctx.body = { count: cdkeys.length };
}