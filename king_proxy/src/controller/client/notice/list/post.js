'use strict'
// 公告列表
module.exports = exports = async function (ctx, next) {
    const { bundle, channel, servid, limit = 10, offset = 0 } = ctx.request.body || {};
    // const match = {
    //     bundle: {$in: [bundle, 'ALL']},
    //     type: {$ne: 'agreement'},
    //     status: 2
    // };
    // if (servid) {
    //     match.servid = +servid;
    // } else {
    //     match.servid = {
    //         $exists: false
    //     }
    // }
    // const notices = await ctx.dao.notice.find(match, {}).sort({_id: -1}).skip(+offset).limit(+limit);
    // ctx.body = notices.map(n => {
    //     return {
    //         title: n.title,
    //         type: n.type,
    //         link: '/client/notice/h5?id=' + n._id,
    //         content: n.content,
    //     }
    // });
    ctx.body = [];
    for (let v of global.CACHE.notice) {
        if (v.status != 2) continue;
        if (v.type == "agreement") continue;
        if (servid) {
            if (v.servid.indexOf(servid) < 0) continue;
        }
        else {
            if (v.servid.length > 0) continue;
        }
        ctx.body.push({
            title: v.title,
            type: v.type,
            link: '/client/notice/h5?id=' + v._id,
            content: v.content,
        })
    }
}

