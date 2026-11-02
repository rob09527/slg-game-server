
'use strict'
// 职业试练塔通关录像
module.exports = exports = async function (ctx, next) {
    let floor = parseInt(ctx.request.body.floor) || 1;
    const type = ctx.request.body.type // 职业试炼类别 1战士,2法师,3刺客,4射手
    ctx.assert(type >= 1, 'invalid type');
    // 职业试练塔
    let gametowers = await ctx.dao.gametower.findOne({ floor, occu: type, groupid: ctx.role._gameserv.groupid, type: "occutower" }, { record: 1 });
    ctx.body = [];
    if (!gametowers) return;
    if (ctx.request.body.needvideo) {
        // 查录像
        if (gametowers && gametowers.record.length > 0) {
            let $in = gametowers.record.map(towers => towers.video);
            let videos = await ctx.dao.video.fetchVideoByVid({ _id: $in }, ctx.role._id);
            ctx.body = videos.sort((a, b) => b.power - a.power);
            return;
        }
    }
    let roleMap = {};
    let videoList = [];
    if (gametowers.record && gametowers.record.length > 0) {
        let rids = gametowers.record.map(towers => towers.rid);
        let rolelist = await global.dao.role.find({ _id: { $in: rids } });
        rolelist.forEach(role => roleMap[role.i()] = role);
        // 不需要录像则按照时间排最前面
        for (let { rid, time } of gametowers.record) {
            let role = roleMap[rid];
            if (!role) continue;
            let { power, frameid, rname: name, friends, headid } = await role.base();
            let friend = 0;
            if (friends.includes(ctx.role.i())) friend = 1;
            videoList.push({
                power, frameid, name, friend, time,
                headid
            })
        }
    }

    ctx.body = videoList;
}
