'use strict';

/* 
国战-判断服务器是否开战
*/
const tg = require('./../util/textgetter');
exports.name = "国战-判断服务器是否开战";
// 定时器语句
exports.cron = '10 0 * * 6';

let lastFlushTime = 0;
/**
 * @return {Promise<void>}
 */
exports.main = async function () {

    let nationwar_servers = await global.dao.nationwar_serverinfo.find({ groupmark: { $exists: 1 } }, { servers: 1, groupid: 1 })
    // 给8个王发送国战开启邮件
    let mails = [];
    for (let server of nationwar_servers) {
        // 查询国王数据和8个王数据
        let kindom = await global.dao.c_kingdom.findOne({ groupid: server.groupid });
        if (!kindom) continue;
        let {
            kingrid,
            standings,
        } = kindom
        // 国王为首任指挥官
        try {
            await global.dao.nationwar.create({
                rid: kingrid,
                groupid: server.groupid
            });
        } catch (error) {
            console.error(error)
            continue;
        }
       
        for (let rid of standings) {
            mails.push(
                {
                    rid,
                    title: tg('NATIONWAR_OPEN_T'),
                    content: tg('NATIONWAR_OPEN_C'),
                }
            )
        }
    }
    if (mails.length > 0) global.dao.mail.insertMany(mails).catch(console.error);
    
    lastFlushTime = Date.now();
}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}