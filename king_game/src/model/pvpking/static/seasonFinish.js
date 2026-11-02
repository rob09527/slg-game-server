const textgetter = require('../../../util/textgetter');

// 王者演武赛季结算
module.exports = async function (body) {
    const frameConfig = global.gameconfig.frame;
    let {
        sid,
        list
    } = body;

    let mails = [];
    console.time(`PVPKING SEASON DOING SERVER ${sid}`);

    for (let {uid, l0, l1} of list) {
        let role = await global.dao.role.findOne({servid: sid, uid}, {rno: 1, rname: 1, _frames: 1});
        if (!role) continue;
        let {ITEMS, NAME} = global.gameconfig.pvpkingrank[l0][l1];
        // let _frames = role._frames || {};
        // if (l0 == 6) {
        //     // 设置无双王者头像框
        //     let id1 = 51007
        //     let top1frameInfo = frameConfig[id1];
        //     if (top1frameInfo) {
        //         _frames[id1] = Date.now() + 3600 * 24 * 1000 * top1frameInfo.TIMELIMIT;
        //         await global.dao.role.updateOne({servid: sid, uid}, {$set: {_frames}});
        //     }
        // } else if (l0 == 5) {
        //     // 设置当世英豪头像框
        //     let id2 = 51007
        //     let top2frameInfo = frameConfig[id2];
        //     if (top2frameInfo) {
        //         _frames[id2] = Date.now() + 3600 * 24 * 1000 * top2frameInfo.TIMELIMIT;
        //         await global.dao.role.updateOne({servid: sid, uid}, {$set: {_frames}});
        //     }
        // }
        mails.push({
            type: 2, rid: role._id,
            title: textgetter('PVPKINGREWARDSEASONT'),
            content: textgetter('PVPKINGREWARDSEASONC', NAME),
            reward: ITEMS,
        })
    }

    await global.dao.mail.insertMany(mails);

    console.timeEnd(`PVPKING SEASON DOING SERVER ${sid}`);

   
}
