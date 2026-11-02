
'use strict'

module.exports = exports = async (ctx) => {
    let { battleid } = ctx.request.body;
    let battle = await ctx.dao.c_battle.findOne({ _id: battleid });
    ctx.assert(battle, 'invalid battleid');
    await battle.cal();
    let { result: ret } = battle;
    ctx.role.missionInvoke('FRIEND_FIGHT');
    await ctx.role.save();
    let videoid;
    if (battle.mark) {
        // 有friendid
        // 查好友信息
        let friendInfo = await ctx.dao.role.findOne({ _id: battle.mark });
        // save video
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
            lper, rper,
            ltper, rtper,
            report,
            seed,
            rcards,
		    lcards,
            season,
            result,
            left: {
                info: {
                    rname: ctx.role.rname,
                    level: ctx.role.level,
                    iconid: ctx.role.iconid,
                    headid: ctx.role.headid,
                    frameid: ctx.role.frameid
                },
                'set': battle.player
            },
            right: {
                info: {
                    rname: friendInfo.rname,
                    level: friendInfo.level,
                    iconid: friendInfo.iconid,
                    headid: friendInfo.headid,
                    frameid: friendInfo.frameid
                },
                'set': battle.enemy
            },
        }
        video = new ctx.dao.video({
            type: 'friendpvp',
            rid: ctx.role._id,
            video: JSON.stringify(video),
            mark: battle.mark,
            version,
        })
        video.save().catch(console.error);
        // 返回录像id
        videoid = video.i();
    }
    ctx.body = { result: ret, videoid };
}