'use strict'


// 定时器
exports.name = "聊天记录删除";

const moment = require('moment');
const FORMAT = "YYYY_MM";


exports.cron = "0 3 15,16 * *"; // 每个月的15，16号，删除上个月聊天记录(重复一天执行是为了确保

/**
 * 删除 15天前的聊天记录
 * @return {Promise<void>}
 */
exports.main = async function () {
    // 取得上个月的 index
    const indexs = 'chat_' + moment().add(-1, 'month').format(FORMAT);
    await global.elastic.indices.delete({index: indexs}).catch(e => null);
    // global.elastic.indices.get({index: indexs}).then(async r => {
    //     for (const index in r) {
    //         await global.elastic.indices.delete({index: index}).catch(e => null);
    //     }
    // }).catch(e => null);

    const m = Date.now() - 24 * 3600 * 1000 * 30;
    await global.dao.loginlog.deleteMany({date: {$lte: m}}); // 删除一个月之前的玩家登录日志
}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    const chatIndex = 'chat_' + moment().add(-1, 'month').format(FORMAT);
    const res = await global.elastic.search({
        index: chatIndex,
        body: {
            size: 1, // 查询多少调
            sort: [{time: 'desc'}], // 指定字段 降序 // asc 升序 @see https://www.elastic.co/guide/en/elasticsearch/reference/7.13/sort-search-results.html
        }
    }).catch(e => ({hits: {hits: []}}));

    return res.hits.hits.length === 0; // 复查数据为空
}
