'use strict'
const moment = require('moment');
// 定时器
exports.name = "定期清理相关数据"; // 类似一句中文注释，后续后台可以展示该名字,

exports.children = async function(){
    const tasks = [];
    const list = [
        {id: 'mail', name: '邮件', cron: '0 0 3 * * *'},// 每天3点执行
        {id: 'video', name: '战斗录像', cron: '0 30 3 * * *'},// 每天3点30分执行
        {id: 'battle', name: '战斗记录', cron: '0 40 5 * * *'},// 每天5点40分执行
        {id: 'auction', name: '拍卖行', cron: '0 0 6 * * *'},// 每天6点40执行
    ];
    const mainFun = async (type = 'unknown') => {
        const nowDate = moment().startOf('days').format('YYYY-MM-DD');
        let delTime = moment(nowDate).add(-30, 'days').valueOf();
        const toUp = type.toUpperCase();
        if(type == 'auction') delTime = moment(nowDate).add(-15, 'days').valueOf();
        console.log(`[TIMING DELETE ${toUp}] nowDate = %s, delTime =`, nowDate, delTime);
        try{
            let delObj = null;
            if(type == 'mail'){
                delObj = await global.dao.mail.deleteMany({ create: {$lt: delTime} });
            }
            if(type == 'battle'){
                delObj = await global.dao.c_battle.deleteMany({ finish: {$lt: delTime} });
            }
            if(type == 'video'){
                delObj = await global.dao.video.deleteMany({ time: {$lt: delTime} });
            }
            if(type == 'auction'){
                delObj = await global.dao.auction.deleteMany({ expireAt: {$lt: delTime} });
            }
            console.log(`[TIMING DELETE ${toUp}] delObj =`, delObj);
        }catch(err){
            console.error(`[TIMING DELETE ${toUp}] err =`, err);
        }
    };

    list.map(elem =>{
        tasks.push({
            cron: elem.cron,
            ID: 'DELETE_'+ elem.id,
            name: '定期清理_'+ elem.name,
            main: mainFun.bind(null, elem.id)
        })
    })
    return tasks;
};

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}
