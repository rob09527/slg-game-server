const mongoose = require('mongoose');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const redisInit = require("./redis.init");

/*  初始化mongo */
function initMongo() {
    const mongoConn = {};
    this.db.mongo = {};
    // 多 mongo 数据库链接法
    for (const k in this.config.db.mongo) {
        const {
            database,
            auth,
            host,
            port,
        } = this.config.db.mongo[k];

        let db_auth = '';
        let query = '';
        if (auth) {
            const {user, password, source, replicaSet, readPreference} = auth;
            db_auth = user + ':' + password + '@';
            if (source) query += ('authSource=' + source);
            if (replicaSet) query += ('&replicaSet=' + replicaSet);
            if (readPreference) query += ('&readPreference=' + readPreference);
        }

        if (query.length > 0) query = '?' + query;
        const url = `mongodb://${db_auth}${host}${port ? ':' + port : ''}/${database}${query}`;
        console.log(url);
        mongoConn[k] = mongoose.createConnection(url, {useNewUrlParser: true, useUnifiedTopology: true});
        mongoConn[k].on('error', function (error) {
            console.error(`mongod:${k} link fail`);
            console.error(error);
        });
    }
    const list = fs.readdirSync(path.resolve(__dirname, '../model'));
    for (const f of list) {
        if (!f.endsWith('.js')) {
            continue;
        }
        const name = f.replace('.js', '');
        const m = require('../model/' + f);
        this.db.mongo[util.lineToUpper(name)] = m(mongoConn, this);
    }
}

const parseDateMatch = (date) => {
    if (!date) {
        return;
    }
    if (Array.isArray(date)) { // 区间搜索
        if (date[0]) {
            const hasTime = date[0].indexOf(":") > 0;
            const start = moment(date[0]);
            const end = moment(date[1]);

            // const start =  moment.parseZone(`${date[0]}${hasTime?'':'  00:00:00'}${this.timezone}`).valueOf();
            // const end = moment.parseZone(`${date[1]}${hasTime?'':' 23:59:59'}${this.timezone}`).valueOf() + 999;
            return [hasTime ? start.valueOf() : start.startOf('days').valueOf(), hasTime ? end.valueOf() : end.endOf('days').valueOf()];
        }
    } else {
        const hasTime = date.indexOf(":") > 0;
        const start = moment(date);
        const end = moment(date);
        return [hasTime ? start.valueOf() : start.startOf('days').valueOf(), hasTime ? end.valueOf() : end.endOf('days').valueOf()];
    }

}
const parseDate = (date) => {
    return moment(date).valueOf();
}
module.exports = async function (app) {

    await initMongo.call(app); // mongo 链接
    global.remote = require('./remote.init')();
    Object.defineProperty(global, 'remote', {writable: false});

    global.redis = await redisInit(global.config.game.redis);
    Object.defineProperty(global, 'redis', {writable: false});
    if (global.config.game.cacherRedis) {
        global.cacherRedis = await redisInit(global.config.game.cacherRedis);// CACHEREDIS
    } else {
        global.cacherRedis = global.redis;// CACHEREDIS
    }

    Object.defineProperty(global, 'cacherRedis', {writable: false});

    // 绑定 业务函数的 this对象
    return { // 绑定给 业务函数的 this 对象
        http: util.http,
        remote: global.remote,
        redis: global.redis,
        cacherRedis: global.cacherRedis,
        parseDateMatch: parseDateMatch,
        parseDate
    }
}
