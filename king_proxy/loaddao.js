
'use strict'

require('./util/string_ext');

const debug = require('debug')('kaihei:launcher:' + require('./util/debug_extend')(__filename));
const path = require('path');
const { promisify } = require('util');
let { readdir, exists } = require('fs');
readdir = promisify(readdir);
exists = promisify(exists);

const { Schema, model } = require('mongoose');

module.exports = exports = function (modeldir) {
	return new Promise(async (resolve, reject) => {
		let dao;
		try {
			dao = await readdir(modeldir);
			let tmp = {};
			for (let dir of dao) {
				if (dir == ".DS_Store") {
					continue
				}
				let schema = path.resolve(modeldir, dir, 'schema');
				if (!exists(schema)) return;
				schema = new Schema(require(schema));
				// load virtual attribute methods
				let virtual = path.resolve(modeldir, dir, 'virtual');
				if (await exists(virtual)) {
					schema.set('toJSON', { virtuals: true });
					let files = await readdir(virtual);
					for (let file of files) {
						let prefix = file.fbase();
						let fns = require(path.resolve(virtual, file));
						if (typeof fns === 'function') {
							schema.virtual(prefix).get(fns);
							debug(dir, 'virtual', prefix, 'get');
						} else if (typeof fns === 'object') {
							if (fns.get) schema.virtual(prefix).get(fns.get);
							debug(dir, 'virtual', prefix, 'get');
							if (fns.set) schema.virtual(prefix).set(fns.set);
							debug(dir, 'virtual', prefix, 'set');
						}
					}
				}

				// load middleware methods
				let mid = path.resolve(modeldir, dir, 'middleware');
				if (await exists(mid)) {
					let files = await readdir(mid);
					for (let file of files) {
						let prefix = file.fbase();
						let fns = require(path.resolve(mid, file));
						for (let fn in fns) {
							debug(dir, 'middleware', prefix, fn);
							schema[prefix](fn, fns[fn]);
						}
					}
				}

				// load instance methods
				let ins = path.resolve(modeldir, dir, 'instance');
				if (await exists(ins)) {
					let fns = await readdir(ins);
					for (let fn of fns) {
						let name = fn.fbase();
						let fn_path = path.resolve(ins, fn);
						debug(dir, 'methods', name, fn_path);
						schema.methods[name] = require(fn_path);
					}
				}
				// load static methods
				let statics = path.resolve(modeldir, dir, 'static');
				if (await exists(statics)) {
					let fns = await readdir(statics);
					for (let fn of fns) {
						let name = fn.fbase();
						let fn_path = path.resolve(statics, fn);
						debug(dir, 'statics', name, fn_path);
						schema.statics[fn.fbase()] = require(path.resolve(statics, fn));
					}
				}
				let indexes = path.resolve(modeldir, dir, 'indexes.js');
				if (await exists(indexes)) {
					indexes = require(indexes);
					if (!Array.isArray(indexes)) indexes = [indexes];
					for (let { keys, opts = {} } of indexes) {
						schema.index(keys, opts);
					}
				}
				tmp[dir] = model(dir, schema);
				debug('load dao:', dir);
			}
			dao = tmp;
		} catch (e) {
			return reject(e);
		}
		return resolve(dao);
	})
}