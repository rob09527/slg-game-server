const elasticsearch = require("elasticsearch");

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

/**
 * @doc https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/index.html
 * @param es_config {{HOST: string, LOG: string, DEF_INDEX: string}}
 */
module.exports = async function (es_config) {

    const client = await getInstance(es_config);
    /**
     *  封装添加数据
     * @param tableName {string} // 类似传统数据库的表名
     * @param data {any} // 数据对象
     * @param index? {string} 类似传统数据库的数据库名， 默认 king
     * @return {Promise<*>}
     */
    client.insertOne = async (tableName, data, index = es_config.DEF_INDEX || 'king') => {
        return global.elastic.index({
            index: index,
            type: tableName,
            body: data
        });
    }
    return client;
}
