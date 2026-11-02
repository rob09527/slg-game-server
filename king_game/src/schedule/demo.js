'use strict'


// 定时器
exports.name = "测试定时器"; // 类似一句中文注释，后续后台可以展示该名字,

// 定时器语句
exports.cron = "0 0 * * * *";
/* 支持逻辑查询或者读配置获得定时器时间
exports.cron = async function(){
    return global.gameconfig.***.CRON; // 可以return 时间戳来实现定点定时器,若时间已过期 判断逻辑 return null 即可
    return [time1, time2]; // 支持配置数组，一个定时任务多个定时时间
}

exports.force_on_time = true; // 强制准时，设置为 true时，定时器到点时直接执行，而不是添加到任务队列中等待执行（默认 false
* */
/**
 * 定时器主体函数
 * 异常直接抛出就行
 * @return {Promise<void>}
 */
exports.main = async function () {
    let IF_ERROR = true;
    // assert(!IF_ERROR, 'ERROR MESSAGE'); // 异常直接抛出，后续会做后台展示定时器的执行情况
}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
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
