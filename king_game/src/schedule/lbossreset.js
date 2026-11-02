/**
 * 重置配置表中最后一个boss，需要boss已被击杀
 */
'use strict'

// 定时器
exports.name = "军团boss每日重置"; // 类似一句中文注释，后续后台可以展示该名字,

// 定时器语句
exports.cron = "30 15 * * *";

let index = global.gameconfig.legionboss.length - 1;
let cond = {
    index,
    killed: {$exists: 1},
}

exports.main = async function () {
    let $set = {
        totaldamges: 0,
    }
    let $unset = {
        killed: 1,
        _roles: 1,
    }
    await global.dao.lboss.updateMany(cond, {$set, $unset});
}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    let count = await global.dao.lboss.countDocuments(cond);
    return count < 1;
}
/*
设置子定时任务, 用于动态加载的定时任务,而非写死的一个代码文件一个任务（ 设置该属性， 基类的 cron, main, check, force_on_time 属性无效，也无用

// @return {Promise<[{main: function, cron: array|string,ID: string,name: string, force_on_time?: boolean}]>}
exports.children = async function(){
    return [
        {
            ID: 'CHILD_1', // 子定时任务ID
            name: '子定时任务',
            cron: '0 * * * *', // 子定时任务定时语句
            main: async function () {},
            check:  async function () {return true},
        }
    ]
}
*/
