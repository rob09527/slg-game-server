'use strict'

const textgetter = require("../../../util/textgetter");
const zhdpoint = require("../../../util/event/point");
const rolenum = require('../../..//util/rolenum_proxy');
const ObjectId = require("mongoose").Types.ObjectId;
// 创建一个新角色
module.exports = async function (uid, servid, options = {
    platform: '',
    simulator: '',
    deviceid: '',
    bundle: '',
    channel: '',
    phonetype: '',
    sex,

}) {
    let ret = await rolenum(+servid);
    if (ret.status == 200) assert(ret.data.success, "server full");

    // 指定rno
    // let maxrno = await global.dao.role.find({}, {_id: 0, rno: 1}).sort({rno: -1}).limit(1);
    // if (maxrno.length < 1) {
    //     maxrno = this.schema.obj.rno.min;
    // } else {
    //     maxrno = maxrno[0].rno;
    // }
    // let rno = maxrno + Math.trunc(Math.random() * 4) + 1;
    let rno = await global.dao.counter.getCount('rno');
    const {
        platform = '',
        simulator = '',
        deviceid = '',
        channel = '',
        phonetype = '',
        bundle = 'default',
        sex
    } = options || {};
    // return await global.dao.role.create({uid, servid, rno, platform, simulator: !!simulator, deviceid, channel});

    let LIMIT = global.gameconfig.deftiny.COST.LIMIT;
    const role = new global.dao.role({
        rno,
        uid: uid,
        servid: +servid,
        channel,
        platform,
        bundle,
        simulator: !!simulator,
        phonetype,
        deviceid,
        sex: sex,
        online: Date.now(),
        destiny: {
            val: 0,
            general: [],
            temprefersh: {},
            refersh: [LIMIT, LIMIT, LIMIT]
        },

    });
    role._path_ = 'create'; // 道具日志输出原因会用到该字段
    //rob国战脚本 生产模式需要屏蔽以下代码。国战脚本 释放
    // role.addItemsNoSave({ gsid: 38001, count: 500000000 });
    // role.addItemsNoSave({ gsid: 30028, count: 5000 });

    role.addItemsNoSave(global.gameconfig.inititems);
    await role.save();

    // 创角后初始化鸿运当头红包
    zhdpoint("HYDTINIT", 'HYDT', Date.now(), role).catch(console.error);

    // 创角邮件发放
    const INIT_MAILS = global.gameconfig.initmail;
    let template = [...INIT_MAILS.DEFAULT];
    let channel_mails = INIT_MAILS[role.channel.toUpperCase()];
    if (channel_mails && channel_mails.length > 0) template.push(...channel_mails);
    const mails = [];
    for (const mail of template) {
        const m = {
            rid: role._id.toString(),
            title: textgetter(mail.TITLE),
            content: textgetter(mail.CONTENT),
        };
        mails.push(m);
        if (mail.ITEMS) {
            m.type = 2;
            m.reward = mail.ITEMS;
        }
    }

    // 创建额外指定到邮件<运营需求>
    const extraMail = await global.dao.extra_mail.find({ uid }, { servid: 1, expire: 1, title: 1, content: 1, rwd: 1, sendtime: 1 });
    if (extraMail) {
        let $in = [];
        extraMail.map(elem => {
            if (!elem) return;
            if (elem.sendtime) return; // 已经发过了
            // 过滤有过期日期设定且已过期
            if (elem.expire && new Date(elem.expire).getTime() <= Date.now()) {
                return;
            }
            // 过滤有区服设定且不符合设定的
            if (elem.servid && +elem.servid != +servid) {
                return;
            }
            const mInfo = {
                rid: role._id.toString(),
                title: elem.title || '',
                content: elem.content || ''
            }
            if (elem.rwd && elem.rwd.length > 0) {
                mInfo.type = 2; // 2 有奖励 1 纯文本
                mInfo.reward = elem.rwd;
            }
            $in.push(ObjectId(elem._id))
            mails.push(mInfo);
        });
        // 设置已发放时间
        if ($in.length > 0) global.dao.extra_mail.updateMany({ _id: { $in } }, { $set: { sendtime: Date.now() } }).catch(console.error)
    }
    global.dao.mail.insertMany(mails).catch(console.error);
    role._path_ = null;
    return role;
}
