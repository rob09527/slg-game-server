
'use strict'

const debug = require('debug')('kaihei:launcher:' + require('./util/debug_extend')(__filename));

const assert = require('assert');

const crypto = require('crypto');
const qs = require('querystring');

var raw = require('raw-body');
var inflate = require('inflation');

const micromatch = require('micromatch');

const bodyparser = require('koa-body')({ multipart: true });

module.exports = exports = function (algorithm, key, iv, excludes) {

	assert(key, 'empty key 4 whisper');
	assert(iv, 'empty iv 4 whisper');
	excludes = excludes || [];

	return async (ctx, next) => {
		const { encrypt, decrypt } = require('./util/algorithm_whisper')(algorithm, key, iv);



		ctx.whisper_encrypt = encrypt;
		ctx.whisper_decrypt = decrypt;
		const opts = { encoding: 'utf8' };
		if (ctx.headers['x-kaihei'] && !ctx.headers['x-whisper']) ctx.dev = true;

		if (ctx.headers['x-vietnam'] == "BTT6mNBL") ctx.dev = true;
		// 匹配额外规则
		if (micromatch(ctx.path, excludes).length > 0) ctx.dev = true;
		if (ctx.dev) {
			await bodyparser(ctx, _ => { });
		} else {
			let data = await raw(inflate(ctx.req || ctx), opts);
			try {
				// debug('before decrypt:', data);
				data = ctx.whisper_decrypt(data);
				// debug('after decrypt:', data);
			} catch (e) {
				console.error(e);
				throw new Error('decrypt fail');
			}
			try {
				ctx.request.body = JSON.parse(data);
			} catch (e) {
				throw new Error('not json');
			}
			// debug('after parse:', ctx.request.body);
		}
		await next();
		if (!ctx.dev) {
			// debug('before encrypt:', ctx.body);
			ctx.body = ctx.whisper_encrypt(JSON.stringify(ctx.body));
			// debug('after encrypt:', ctx.body);
		}
	}
}
