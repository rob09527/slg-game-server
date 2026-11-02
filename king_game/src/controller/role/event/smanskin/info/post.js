"use strict"

module.exports = async function (ctx, next) {
    ctx.body = ctx.tasks.map(({ ID: id, TARGET }) => ({
        id, target: TARGET.map(({
            INTRO: intro,
            MARK,
            SKINID: skinid,
            GSID: gsid,
            REWARD: reward,
            URL: url,
        }) => ({
            intro,
            status: ctx.role.getProp(MARK),
            skinid,
            gsid,
            reward,
            url,
        }))
    }))
}