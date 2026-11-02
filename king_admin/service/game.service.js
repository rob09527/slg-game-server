const BaseService = require('awko-admin/base.service');
const MongoClient = require('mongodb').MongoClient;
const path = require('path');
const fs = require('fs');
const elasticsearch = require("elasticsearch");
const pathDesc = require("../gconfig/pathDesc.json");

const moment = require('moment');
const util = require('../common/util');
const FORMAT = 'YYYY-MM-DD HH:mm:ss';

/**
 * 游戏数据查询
 * @type {AdminService}
 */
module.exports = class AdminService extends BaseService {
    config; // 游戏配置 gameconfig,
    elastic; // 存放游戏事件和日志的 elasticsearch
    es_config;
    constructor(app) { // if you need
        super(app);
        this._CONFIG = {};
        const _this = this;
        this.config = {};
        this.elastic = null;
        console.log("打印", app.config.gameconfigpath)
        const gameconfigpath = path.resolve(app.config.gameconfigpath);
        // 加载配置
        const gameConfigs = fs.readdirSync(gameconfigpath);
        for (const c of gameConfigs) {
            const name = c.replace('.json', '');
            Object.defineProperty(this.config, name, {
                get() {
                    if (_this._CONFIG[name]) {
                        return _this._CONFIG[name];
                    }
                    _this._CONFIG[name] = require(gameconfigpath + '/' + c);
                    return _this._CONFIG[name];
                }
            })
        }
        this.connectionPool = {}; // 连接池
        this.es_config = app.config.game.es;
        initEs(app.config.game.es).then(es => {
            this.elastic = es;
            endEs(app.config.game.es);
        });
    }

    async connect(conf) {
        const host = conf.HOST;
        const port = conf.PORT || conf.POST || ''; // fix 写错的配置
        const linkKey = `${host}:${port}`;
        // console.log('this linkKey', linkKey, conf);
        if (this.connectionPool[linkKey]) {
            this.connectionPool[linkKey].last = Date.now();
            return Promise.resolve(this.connectionPool[linkKey].client);
        }

        // Connection URL, out_port 是隧道过后的端口
        let url = `mongodb://${host}${port ? ':' + port : ''}`;

        const option = { useUnifiedTopology: true };
        if (conf.AUTH) {
            option.auth = {
                user: conf.AUTH.USER,
                password: conf.AUTH.PWD,
            };
            option.authSource = conf.AUTH.SOURCE;
            if (conf.AUTH.RSNAME) {
                option.replicaSet = conf.AUTH.RSNAME;
            }
            if (conf.AUTH.PREFERENCE) {
                option.readPreference = conf.AUTH.PREFERENCE;
            }
        } else {
            option.authSource = 'admin'; // 默认授权数据库为 admin
        }
        const client = await MongoClient.connect(url, option);
        this.connectionPool[linkKey] = {
            client,
            last: Date.now() // 记录最后一次使用时间
        }
        if (Object.keys(this.connectionPool).length > 8) { // 断开相对较久没有访问的 链接
            const keys = Object.keys(this.connectionPool).sort((a, b) => this.connectionPool[a].last - this.connectionPool[b].last);
            keys.splice(-3);
            for (let k of keys) {
                if (this.connectionPool[k].mserver) { // 断开隧道
                    this.connectionPool[k].mserver.close();
                }
                this.connectionPool[k].client.close();
                delete this.connectionPool[k];
                // console.log('CLOSE DB :', k)
            }
        }
        return client;
    }

    /**
     * 获取表
     * @param collectionName
     */
    async collection(collectionName) {
        let conf = this.app.config.game.db;

        const client = await this.connect(conf);
        const DB = client.db(conf.NAME);
        return DB.collection(collectionName);
    }

    async collections() {
        let conf = this.app.config.game.db;

        const client = await this.connect(conf);
        const DB = client.db(conf.NAME);
        return DB.collections();
    }

    /**
     * 服务器列表(选择框数据格式
     * @return {Promise<void>}
     */
    async serversOptions(admin_role) {
        if (this._servers_ && this._servers_[admin_role] && global._servers_cache_ == this._servers_[admin_role].__count__) { // 缓存服务器列表
            // console.log(this._servers_[admin_role])
            return this._servers_[admin_role];
        }
        const authInfo = __group__auth__cache__[admin_role] === undefined ? await this.app.db.mongo.adminGroupAuth.findOne({ group: admin_role }) : __group__auth__cache__[admin_role];
        __group__auth__cache__[admin_role] = authInfo;
        const m = await this.collection('gameservers');
        const matchOpt = { type: { $ne: 1 } };
        if (authInfo) {
            matchOpt.servid = { $gte: authInfo.serv.min, $lte: authInfo.serv.max };
        }
        const c = m.find(matchOpt).project({ servid: 1, name: 1, groupid: 1, room: 1 });
        const items = await c.toArray();
        const out = items.map(serv => {
            return {
                value: serv.servid,
                name: `${serv.name}[${serv.servid}]`,
                groupid: serv.groupid,
                room: serv.room || 1
            }
        });
        out.__is_all__ = !authInfo; // 表示是否被隔离
        out.__count__ = items.length;

        global._servers_cache_ = items.length
        this._servers_ = this._servers_ || {};
        this._servers_[admin_role] = out;
        return out;
    }

    /**
     * 查询排位赛跨服组
     * @return {Promise<*>}
     */
    async kingGroupOptions(admin_role) {
        const m = await this.collection('kinggroups');
        const authInfo = __group__auth__cache__[admin_role] === undefined ? await this.app.db.mongo.adminGroupAuth.findOne({ group: admin_role }) : __group__auth__cache__[admin_role];
        __group__auth__cache__[admin_role] = authInfo;
        const $match = {};
        if (authInfo) {
            $match.servid = { $gte: authInfo.serv.min, $lte: authInfo.serv.max };
        }
        const c = m.aggregate([
            $match,
            {
                $group: {
                    _id: '$groupmark',
                    servid: {
                        $push: "$servid"
                    }
                }
            }
        ]);
        const items = await c.toArray();
        return items.map(item => ({
            value: item.servid.join(','),
            name: `演武组(${item.servid.join(',')})`
        }));
    }

    /**
     * 查询日志
     * @param indexList {string|[string]}
     * @param match {[]}
     * @param moffset {number}
     * @param olimit {number}
     * @return {Promise<{total: number, items: *[]}>}
     */
    async queryLog(indexList, match, moffset = 0, olimit = 20, body = {}) {

        // 聚合查询 时间段内的事件操作数量
        const res = await this.elastic.search({
            // index: 'addcst-2022-10-29',
            index: indexList,
            ignoreUnavailable: true,
            type: '_doc',
            body: {
                "track_total_hits": true,
                query: {
                    "constant_score": {
                        "filter": {
                            "bool": {
                                "must": match
                            }
                        }
                    }
                },
                size: +olimit,
                from: moffset,
                sort: [
                    {
                        "create": {
                            "order": "desc"
                        }
                    }
                ]
            }

        }).catch(e => {
            if (e.statusCode !== 404) { // index_not_found_exception 错误日志无需输出
                console.error(e);
                return {
                    hits: {
                        total: { value: 0 },
                        hits: []
                    }
                }
            }
            return Promise.reject(e);
        });
        return {
            total: res.hits.total.value,
            items: res.hits.hits.map(item => {
                item = item._source;
                item.origin = item.frompath;
                let path = item.frompath;
                if (path) {
                    if (path.startsWith("recharge/confirm")) path = "recharge/confirm";
                    let [desc, exid = ''] = path.split("#");
                    item.frompath = (pathDesc[desc] || desc) + exid;
                }

                item.typeEm = body._export_ ? (item.act === 'ADD' ? '增加' : '消耗') : item.act === 'ADD' ? `<span style="color: #23d588">增加</span>` : `<span style="color: #ad1b1b">消耗</span>`;
                item.create = moment(item.create).format(FORMAT);
                return item;
            })
        }
    }

    // 清档
    async cleanAll() {
        const protocol = (this.es_config.PROTO || 'http') + '://';
        const host = this.es_config.HOST || '127.0.0.1:9200';
        const path = '/_all';

        const url = protocol + host + path;
        const body = { "index": { "number_of_replicas": 0 } };
        // const body = {"index": {"number_of_replicas": 0, "max_result_window": 20000}}
        const query = "";
        const header = { "Content-Type": "application/json" };
        const resp = await util.http.del(url, body, query, header);
        console.log("cleanAll", resp)
    }
}

const initEs = async (es_config) => {
    const getInstance = (es_config = {}) => new Promise(((resolve, reject) => {
        const client = elasticsearch.Client({
            host: es_config.HOST || '127.0.0.1:9200',
            log: es_config.LOG || 'error'
        });

        client.ping({
            // ping usually has a 3000ms timeout
            requestTimeout: 1000
        }, function (error) {
            if (error) {
                console.error('elasticsearch cluster is down!', error);
                return reject(error);
            }
            return resolve(client);
        });
    }));

    const client = await getInstance(es_config);
    /**
     *  封装添加数据
     * @param tableName {string} // 类似传统数据库的表名
     * @param data {any} // 数据对象
     * @param index? {string} 类似传统数据库的数据库名， 默认 king
     * @return {Promise<*>}
     */
    client.insertOne = async (tableName, data, index = 'king') => {
        return client.index({
            index: index,
            type: tableName,
            body: data
        });
    }
    return client;
}

const endEs = (es_config) => {
    const es = global.config.es || { replicas: 0, shards: 1 };
    const template = async () => {
        const protocol = (es_config.PROTO || 'http') + '://';
        const host = es_config.HOST || '127.0.0.1:9200';
        const path = '/_template/logstash_template';

        const url = protocol + host + path;
        const body = { "template": "*", "settings": { "number_of_replicas": es.replicas, "number_of_shards": es.shards } };
        // const body = {"template" : "*", "settings" : {"number_of_replicas" : 0, "max_result_window": 20000}}
        const query = "";
        const header = { "Content-Type": "application/json" };
        const resp = await util.http.put(url, body, query, header);
        console.log("endEs template", resp)
    }
    const settings = async () => {
        const protocol = (es_config.PROTO || 'http') + '://';
        const host = es_config.HOST || '127.0.0.1:9200';
        const path = '/_all/_settings';

        const url = protocol + host + path;
        const body = { "index": { "number_of_replicas": es.replicas } };
        // const body = {"index": {"number_of_replicas": 0, "max_result_window": 20000}}
        const query = "";
        const header = { "Content-Type": "application/json" };
        const resp = await util.http.put(url, body, query, header);
        console.log("endEs settings", resp)
    }

    template();
    settings();
}