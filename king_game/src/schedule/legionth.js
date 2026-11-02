'use strict'
const tg = require('./../util/textgetter');


// 定时器
exports.name = "军团弹劾校验"; // 类似一句中文注释，后续后台可以展示该名字,

// 定时器语句
exports.cron = "*/30 * * * *";

/**
 * 定时器主体函数
 * 异常直接抛出就行
 * @return {Promise<void>}
 */
exports.main = async function () {

    const {
        TANHETIMEHOUR,
    } = global.gameconfig.others.LEGION;

    const TANHETIME = TANHETIMEHOUR * 60 * 60 * 1000;

    // 查找已发起弹劾的军团
    let legions = await global.dao.legion.find({ 'tanhe.start': { $exists: 1 } });
    for (let legion of legions) {
        let end = legion.tanhe.start + TANHETIME;
        // 检查弹劾时间是否已到
        if (Date.now() < end) continue;
        // 检查发起人和军团长信息
        let ship = legion._members.deepQueryOne('rid', legion.tanhe.rid);
        if (!ship) continue;
        let ceo = legion._members.deepQueryOne('pos', 2);
        if (!ceo) continue;
        // 修改权限
        ship.pos = 2;
        ceo.pos = 0;
        let rid = legion.tanhe.rid;// 保存rid;
        // 重置弹劾信息
        legion.tanhe = undefined;
        legion.markModified('tanhe');
        legion.markModified('_members');
        try {
            // 保存联盟数据
            await legion.save();
            // 异步发送邮件
            let mails = [];

            // 异步保存军团日志
            ship = await global.dao.role.findOne({ _id: rid }, { rno: 1, rname: 1 });
            ceo = await legion.fetchCEOName();
            let params = [
                ship.rname || ship.name,
                ceo,
            ]
            for (let { rid } of legion._members) {
                let mail = global.dao.mail.create({
                    rid,
                    title: tg('LEGIONTANHET'),
                    content: tg('LEGIONTANHEC', ship.rname || ship.name),
                })
                mails.push(mail);
            }
            Promise.all(mails).catch(console.error);
            global.dao.c_legionlog.create({ legion: legion._id, event: 'accusewin', params }).catch(console.error);
        } catch (e) {
            console.error(e);
        }
    }
}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}