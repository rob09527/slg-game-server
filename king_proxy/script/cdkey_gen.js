
// {"name":"test","exid":"lb_test101"}

'use strict'

const moment = require('moment');

const mongoose = require('mongoose');
let cdkeyDAO = require('./../src/model/cdkey/schema');
cdkeyDAO = new mongoose.Schema(cdkeyDAO);
cdkeyDAO = mongoose.model('cdkey', cdkeyDAO);

function _gen_key() {
	var str = Date.now().toString();
	str = str.slice(-8);
	str = Math.ceil(parseInt(str.split('').reverse().join('')) * Math.random()).toString(24);
	if (str.length < 6) {
		var bit = 6 - str.length;
		for (var i = 0; i < bit; i++) {
			str = '0'+str;
		}
	}
	return str.toUpperCase();   
}

async function main ([url, times, opts]) {
	console.log('times:', times);
	console.log('url:', url);
	console.log('opts:', opts);

	times = parseInt(times) || 1;
	
	try {
		opts = JSON.parse(opts);
	}catch(e){
		opts = {};
	}
	
	if (!opts.name) throw new Error('missing name');
	if (!opts.items || opts.items.length < 1) throw new Error('items err');

	for (let item of opts.items) {
		item.COUNT = parseInt(item.COUNT);
	}

	if (opts.start) opts.start = moment(opts.start).valueOf();
	if (opts.end) opts.end = moment(opts.end).valueOf();
	
	await mongoose.connect(url, {useUnifiedTopology: true});
	let cdkeys = [];
	
	while(cdkeys.length < times) {
		const key = _gen_key();
		let one = await cdkeyDAO.findOne({key});
		if (one) continue;
		one = new cdkeyDAO(opts);
		one.key = key;
		await one.save();
		cdkeys.push(one.key);
	}
	console.log('ret>>', cdkeys.join(','));
	await mongoose.disconnect();
}

main(process.argv.slice(2)).catch(console.log);
