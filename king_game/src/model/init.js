'use strict'

const debug = require('debug')('kaihei:launcher:startdb');
const mongoose = require('mongoose');
const { Schema, model } = require('mongoose');
const fs = require('fs');
const path = require('path');
/**
 *
 * @param dbconf {{ NAME: string , AUTH? : {USER: string, PWD: string, SOURCE: string},HOST? : string,PORT? :string}}
 * @return {Promise<void>}
 */
module.exports = async function (dbconf) {
    const {
        NAME,
        AUTH,
        HOST = 'localhost',
        PORT = 27017,
    } = dbconf;
    let DOMAIN = HOST + ':' + PORT;
    let db_auth = '';
    let query = [];
    if (AUTH) {
        const {
            USER,
            PWD,
            SOURCE,
            RSNAME,
            PREFERENCE
        } = AUTH;
        db_auth = USER + ':' + PWD + '@';
        if (SOURCE) query.push('authSource=' + SOURCE);
        if (RSNAME) {
            DOMAIN = HOST;
            query.push('replicaSet=' + RSNAME)
        }
    }

    if (query.length > 0) query = '?' + query.join('&');
    const url = `mongodb://${db_auth}${DOMAIN}/${NAME}${query}`;

    debug(url);
    await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

    const dao = await loadDao(path.resolve(__dirname, './'));
    return dao;
}


async function loadDao(modeldir) {
    let dao = fs.readdirSync(modeldir);

    let tmp = {};
    for (let dir of dao) {
        // 忽略非文件夹
        if (!fs.statSync(path.resolve(modeldir, dir)).isDirectory()) {
            continue;
        }
        let schema = path.resolve(modeldir, dir, 'schema.js');
        if (!fs.existsSync(schema)) continue;
        /*
        // schema的可选参数(暂不用,有冲突)
        let opts = {
            // 时间戳自动生成,可以自动生成createdAt文档创建时间,updatedAt文档更新时间两个字段
            timestamps: {
                // 使用createdAt自定义别名,配合在数据结构中定义数据的类型及默认值,可以实现使用Number的时间戳
                createdAt: 'create',
                updatedAt: 'update',
            },
        };
         */
        schema = new Schema(require(schema), {});
        // load virtual attribute methods
        let virtual = path.resolve(modeldir, dir, 'virtual');
        if (fs.existsSync(virtual)) {
            schema.set('toJSON', { virtuals: true });
            let files = fs.readdirSync(virtual);
            for (let file of files) {
                let prefix = file.replace('.js', '');
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
        if (fs.existsSync(mid)) {
            let files = fs.readdirSync(mid);
            for (let file of files) {
                let prefix = file.replace('.js', '');
                let fns = require(path.resolve(mid, file));
                for (let fn in fns) {
                    debug(dir, 'middleware', prefix, fn);
                    schema[prefix](fn, fns[fn]);
                }
            }
        }

        // load instance methods
        let ins = path.resolve(modeldir, dir, 'instance');
        if (fs.existsSync(ins)) {
            let fns = fs.readdirSync(ins);
            for (let fn of fns) {
                let name = fn.replace('.js', '');
                let fn_path = path.resolve(ins, fn);
                debug(dir, 'methods', name, fn_path);
                schema.methods[name] = require(fn_path);
            }
        }
        // load static methods
        let statics = path.resolve(modeldir, dir, 'static');
        if (fs.existsSync(statics)) {
            let fns = fs.readdirSync(statics);
            for (let fn of fns) {
                let name = fn.replace('.js', '');
                let fn_path = path.resolve(statics, fn);
                debug(dir, 'statics', name, fn_path);
                schema.statics[fn.replace('.js', '')] = require(path.resolve(statics, fn));
            }
        }
        let indexes = path.resolve(modeldir, dir, 'indexes.js');
        if (fs.existsSync(indexes)) {
            indexes = require(indexes);
            if (!Array.isArray(indexes)) indexes = [indexes];
            for (let { keys, opts = {} } of indexes) {
                schema.index(keys, opts);
            }
        }
        tmp[dir] = model(dir, schema);
        tmp[dir].on('index', err => {
            if (err) console.error(dir, err);
        })
        debug('load dao:', dir);
    }
    dao = tmp;
    return dao;
}
