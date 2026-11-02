'use strict'


// 定时器
exports.name = "非定时发放邮件"; // 类似一句中文注释，后续后台可以展示该名字,

// 定时器语句
exports.cron = "*/5 * * * *";

/**
 * 定时器主体函数
 * 异常直接抛出就行
 * @return {Promise<void>}
 */
exports.main = async function () {
    let delaymails = await global.dao.dealymail.find({ finish: { $lte: 0 } });
    let mails = [];
    for (let mail of delaymails) {
        mails.push({
            type: mail.rewards.length > 0 ? 2 : 1,
            rid: mail.rid,
            title: mail.title,
            content: mail.content,
            reward: mail.rewards.length > 0 ? mail.rewards : [],
        })
    }
    let ids = delaymails.map(({ _id }) => _id.toString());
    global.dao.dealymail.updateMany({ _id: { $in: ids } }, { $set: { finish: Date.now() } }).catch(console.error);
    global.dao.mail.insertMany(mails).catch(console.error);
}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}