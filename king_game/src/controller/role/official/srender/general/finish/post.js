
'use strict'

const expireUserinfo = require("../../../../../../util/expireUserinfo");


module.exports = exports = async (ctx) => {
    let { battleid, id } = ctx.request.body;
    // 查找目标 
    let battle = await ctx.dao.c_battle.findOne({ _id: battleid });
    ctx.body = []
    var target
    let targetrid = battle.mark
    target = await global.dao.role.findOne({ _id: targetrid });
    let body = {}
    await battle.cal();

    let { result: ret } = battle;
    body = { result: ret };

    // 录像保存
    let {
        seed,
        season,
        rcards,
        lcards,
        result: {
            version,
            ret: result,
            lper, rper,
            ltper, rtper,
            report,
        }
    } = battle;
    let video = {
        seed,
        result,
        season,
        lper, rper,
        ltper, rtper,
        report,
        left: {
            info: {
                rname: ctx.role.name,
                level: ctx.role.level,
                iconid: ctx.role.iconid,
                headid: ctx.role.headid,
                frameid: ctx.role.frameid
            },
            'set': battle.player,
        },
        right: {
            info: {
                rname: target.name,
                level: target.level,
                iconid: target.iconid,
                headid: target.headid,
                frameid: target.frameid
            },
            'set': battle.enemy,
        },
        lcards,
        rcards
    }
    let videostr = JSON.stringify(video);

    let myVideo = new ctx.dao.video({
        type: 'prisonerpvp',
        rid: ctx.role.rid,
        video: videostr,
        mark: [video.result, targetrid].join('.'),
        version,
    });

    // 异步保存
    myVideo.save().catch(console.error);
    body.videoid = myVideo.i();
    body.result.item = global.gameconfig.secretRealmWdjz[0][0].item
    ctx.body = body

    ctx.dao.video.create({
        type: 'prisonerpvp',
        rid: targetrid,
        video: videostr,
        mark: [video.result === 'win' ? 'lose' : 'win', ctx.role.rid].join('.'),
        version,
    }).catch(console.error);

    const key = `${ctx.role._id.toString()}-prisoner`
    var cacheInfo = await expireUserinfo(key, true)
    if (result == "win") {
        cacheInfo.battle.success = true
        cacheInfo.battle.claimstatus = true
        cacheInfo.battle.itemInfo[cacheInfo.battle.itemInfo.length - 1].state = 1
    } else {
        cacheInfo.battle.success = false
    }
    cacheInfo.battle.battlecount += 1
    var cacheInfo = await expireUserinfo(key, false, cacheInfo)
}




