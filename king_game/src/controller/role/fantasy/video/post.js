'use strict'
/**
 *  查看奇门幻阵战斗录像
 * @param {*} ctx 
 * @param {*} next 
 */
module.exports = async (ctx, next) => {

    const { rid } = ctx.request.body;
    ctx.assert(ctx.bossConfig.expireAt > Date.now(), 'activity expire');

    let video = await ctx.dao.video.findOne({ rid, type: 'fantasyboss' });
    ctx.assert(video, 'video nexist');
    ctx.body = {
        video: video.video,
        version: video.version,
        time: video.time,
    }
}