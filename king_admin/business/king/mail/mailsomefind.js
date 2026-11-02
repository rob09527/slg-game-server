exports.name = '多人邮件发送';
exports.type = 'N';
const moment = require("moment");

exports.exec = async function (body, query, ctx) {
    let { content, title, items, comment ='' } = body;
    items = items[0].data;
    const serverMails = {};
    const convertReward = (each, sortKeys) => {
        const reward = [];
        for (let i = 0; i < sortKeys.length;) {
            const gsid = Number.parseInt(each[sortKeys[i]]);
            if (gsid === 30999) { // 越南代金劵 不允许直接发放
                throw 'CANT SEND 30999';
            }
            reward.push({
                GSID: gsid,
                COUNT: Number.parseInt(each[sortKeys[i + 1]]),
            })
            i += 2;
        }
        return reward;
    }
    for (let each of items) {
        const keys = Object.keys(each);
        if (!keys.includes("sid") || !keys.includes("uid")) throw "表头必须有sid,uid";
        const sortKeys = keys.filter(i => i.startsWith("__EMPTY")).sort();
        if (sortKeys.length != keys.length - 2) throw "不能有多余表头";
        serverMails[each.sid] = serverMails[each.sid] || [];
        let reward = convertReward(each, sortKeys);
        const mail = {
            type: 2, uid: each.uid.toString(),
            state: 0,
            title, content, comment,
        };
        // 奖励、文本邮件区分
        if (reward.length > 0) {
            mail.reward = reward;
        } else {
            mail.type = 1;
        }
        serverMails[each.sid].push(mail);
    }
    const servers = Object.keys(serverMails).map(i => Number.parseInt(i));

    const roleModel = await this.service.game.collection('roles');
    const mailModel = await this.service.game.collection('mails');
    for (const servid of servers) {
        const uids = serverMails[servid].map(({ uid }) => uid);
        const roleCursor = await roleModel.find({ servid, uid: { $in: uids } }).project({ _id: 1, uid: 1 });
        let roles = await roleCursor.toArray();
        const mails = [];
        for (let user of roles) {
            const mail = serverMails[servid].find(({ uid }) => user.uid == uid);
            if (!mails) continue;
            const { uid, ...o } = mail;
            mails.push({ ...o, rid: user._id.toString(), create: moment().valueOf() })
        }
        if(mails.length == 0) continue;
        await mailModel.insertMany(mails);
    }
};

