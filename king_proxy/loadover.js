
'use strict'

const path = require('path');
const fs = require('fs');
const load_cache = require('./src/remote/load_cache');

const loadconfig = function () {
	global.proxyconfig = {};
	if(!global.config.CONFIGS) return;

	for (var config of global.config.CONFIGS){		
		let _default = path.resolve(__dirname, config);
		try{
			let data = fs.readFileSync(_default);
			data = JSON.parse(data);

			let name = path.parse(config).name;
			global.proxyconfig[name] = data;
		}catch(e){
			console.error(e.message, config);
		}
	}
	Object.defineProperty(global, 'proxyconfig', {writable: false});
}

module.exports = exports = async function () {
	loadconfig();
	global.setting = await global.dao.global.findOne() || {};
	global.recommendNum = 0;
	global.WECHAT = {};
	
	console.log("global.setting", global.setting)

	// 最后预加载
	global.CACHE = {};
	load_cache();
}
