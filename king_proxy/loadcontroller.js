
'use strict'

require('./util/string_ext');

const debug = require('debug')('kaihei:launcher:' + require('./util/debug_extend')(__filename));

const { promisify } = require('util');

const path = require('path');
const fs = require('fs');
const exists = promisify(fs.exists);
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

const KoaRouter = require('koa-router');

const allow_method = ['use', 'post', 'get'];
const method_weight = { 'use': 2, 'post': 1, 'get': 1 };

let router;
//前后端需要保持一致---begin///////////////////////////////////////////////////////////////////////////////////////////
//路由修改配置 前后端完全保持一致，避免出问题 请保持格式便于查看和修改 仅用于ios的马甲包 暂时不用于其他
//后端位置 king_proxy/loadcontroller.js 中  前端位置 assets\scripts\model\serverConect.js
const MUL_toOne = {
	//路由                         ios官包             ios马甲包1           ios马甲包2
	//  一旦定义不可修改，禁止修改已经发布对外的包 不替换的 这里用空字符串即可 所有的字符串互斥 请注意 理论上任何a-z的字符串都可以 避免审核问题 这里使用单词避免被抓包
	"/client/udp": ["/crimeoutlast", "/ddd/sss1", "", "", "", ""],
	"/client/maintain": ["/fleetbehalf", "", "", "", "", ""],
	"/client/notice/list": ["/peachzebra", "", "", "", "", ""],
	"/account/login": ["/peachzebra", "", "", "", "", ""],
	"/sdk/yiyou/token": ["/slalomwheat", "", "", "", "", ""],
	"/user/reconnect": ["/iratebikini", "", "", "", "", ""],
	"/user/enter": ["/ciderbehalf", "", "", "", "", ""],
	"/servers": ["/grazechief", "", "", "", "", ""],
	"/lamp/list": ["/slantnegate", "", "", "", "", ""],
	"/dev/udp": ["/drapedamper", "", "", "", "", ""],
	"/dev/login": ["/deaconaxial", "", "", "", "", ""]
}
//前后端需要保持一致---begin///////////////////////////////////////////////////////////////////////////////////////////

var tmpList = null
async function walk(router, dir, prefix) {
	prefix = prefix || '/';
	let dirs = await readdir(dir);
	dirs.sort((pre, nxt) => {
		if (pre.startsWith('#')) pre = -1;
		if (nxt.startsWith('#')) nxt = -1;
		if (typeof pre !== 'number') pre = method_weight[pre.fbase()] || 0;
		if (typeof nxt !== 'number') nxt = method_weight[nxt.fbase()] || 0;
		return nxt - pre;
	})
	for (let f of dirs) {
		let file_path = path.join(dir, f);
		let info = await stat(file_path);
		if (info.isDirectory()) {

			await walk(router, file_path, path.join(prefix, f));
		} else if (f.endsWith('.js')) {
			let method = f.fbase();
			let controller = require(path.resolve(file_path));
			if (allow_method.indexOf(method) > -1 && typeof controller === 'function') {
				debug(method, prefix);
				router[method](prefix.replace(/#/gi, ':'), controller);
				// console.log(path.join(prefix))
				tmpList = MUL_toOne[prefix]
				if (tmpList) {
					for (var k = 0; k < tmpList.length; k++) {
						let val2 = tmpList[k]
						if (val2 && val2.length > 0) {
							// console.log("add luyou:::::::::::" + val2 + " =====>" + prefix)
							router[method](val2.replace(/#/gi, ':'), controller);
						}
					}
				}
			}
		}
	}
	return router;
}

module.exports = exports = function (app, dir) {

	return new Promise(async (resolve, reject) => {
		if (router) return resolve(app);
		router = KoaRouter();
		try {
			if (await exists(dir)) await walk(router, dir);
		} catch (e) {
			return reject(e);
		}
		router.routes()
		app.use(router.routes(), next => {
		});
		return resolve(app);
	})
};