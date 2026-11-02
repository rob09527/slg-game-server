"use strict"

// 获取跨服录像记录
module.exports = async function(ctx, next) {
    const { videoid } = ctx.request.body
    let video = await ctx.commonsend("/activityinfo/wstz/video", {
        servid: ctx.role.servid,
        videoid,
    })
    const { err } = video
    ctx.assert(!err, 'video nexist')
    ctx.body = video
}