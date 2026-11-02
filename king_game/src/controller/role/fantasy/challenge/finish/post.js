'use strict'
/**
 *  奇门幻阵战斗完成
 * @param {*} ctx 
 * @param {*} next 
 */
module.exports = async (ctx, next) => {
    let { battleid } = ctx.request.body;
    let battle = await ctx.dao.c_battle.findOne({ _id: battleid });
    ctx.assert(battle, 'invalid battleid');
    await battle.cal();
    let { result: ret } = battle;

    const { rlosthp: curDamge } = ret;
    const uidStr = ctx.role.i();

    let maxDamge = ctx.record.lastdamge || 0;

    let curRank = await ctx.fantasyRank.getItemRank(uidStr);  // 当前排名
    if (+curDamge > +maxDamge) {
        // 伤害保存redis
        await ctx.fantasyRank.set({
            id: uidStr,
            score: curDamge
        });

        // 更新分数后的排名
        curRank = await ctx.fantasyRank.getItemRank(uidStr);

        // 更新记录
        maxDamge = curDamge;
        let $set = {
            lastdamge: maxDamge,
            update: Date.now()
        }

        await global.dao.fantasyboss.updateOne({ rid: uidStr }, { $set });

        // 录像保存前先做删除
        await global.dao.video.deleteMany({ rid: uidStr, type: 'fantasyboss' });
        let video = battle.getVideoObject();
        video.left.info = ctx.role.videoAvatarInfo();
        video.right.info = { index: ctx.bossConfig.bossidx };
        video = new ctx.dao.video({
            type: 'fantasyboss',
            rid: uidStr,
            video: JSON.stringify(video),
            version: battle.result.version,
        })
        video.save().catch(console.error);
    }

    ctx.body = {
        result: ret,
        last: Date.now(),
        curRank,
        maxDamge,
        curDamge
    }
}