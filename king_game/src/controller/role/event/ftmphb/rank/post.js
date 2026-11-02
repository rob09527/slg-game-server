
'use strict'

const timekey = require("../../../../../util/timekey");

async function dailyrankinfo(ctx) {
    let act = global.ACTIVITY['ftmphb']
    let id = timekey().ftmphb.dailykey
    console.log("当前获取", id)
    let groupid = ctx.role._gameserv.groupid;
    let rankService = new global.services.RankService(id, groupid);
    let list = await rankService.rank(1, 50);
    let roles = list.map(({ id }) => id);
    roles = await ctx.dao.role.find({ _id: { $in: roles } });
    let selfrank = await rankService.getItemRank(ctx.role.i());
    let selfscore = await rankService.getItemScore(ctx.role.i());
    const tmp = {};
    let maxrank = 0
    let useritem = []
    roles.forEach(one => {
        tmp[one._id.toString()] = one;
    })
    list = list.map(({ id, score, rank }) => {
        let role = tmp[id];
        let servid = role.servid;
        let item = []
        for (let x in global.gameconfig.ftmphb[0]) {
            let data = global.gameconfig.ftmphb[0][x]

            if (score >= data.condition && item.length == 0 && rank <= data.max) {
                item = data.item
            }

            if (selfscore >= data.condition && useritem.length == 0 && selfrank <= data.max) {
                useritem = data.item
            }
            maxrank = data.max
        }
        return {
            rid: role.i(),
            rname: role.name,
            iconid: role.iconid,
            frameid: role.frameid,
            headid: role.headid,
            power: role._power,
            item,
            level: role.level,
            rank,
            servid,
            score,
        }

    }).filter(Boolean);
    ctx.body = {
        list,
    }
    if (selfrank <= maxrank) {
        ctx.body.selfrank = selfrank
        ctx.body.useritem = useritem
    }
    if (selfscore) {
        ctx.body.selfscore = selfscore;
    } else {
        ctx.body.selfscore = ctx.role.ftmphb[timekey().ftmphb.dailykey_db];

    }
    return ctx.body
}

async function gloalrankinfo(ctx) {
    let act = global.ACTIVITY['ftmphb']
    let id = timekey().ftmphb.globalkey
    let rankService = new global.services.RankService(id);
    let list = await rankService.rank(1, 50);
    let roles = list.map(({ id }) => id);
    roles = await ctx.dao.role.find({ _id: { $in: roles } });
    let selfrank = await rankService.getItemRank(ctx.role.i());
    let selfscore = await rankService.getItemScore(ctx.role.i());
    let config = global.ACTIVITY['ftmphb']
    const te_d = (new Date)
    const tmp = {};
    let maxrank = 0
    let useritem = []
    roles.forEach(one => {
        tmp[one._id.toString()] = one;
    })
    list = list.map(({ id, score, rank }) => {
        let role = tmp[id];
        let servid = role.servid;
        let item = []
        for (let x in global.gameconfig.ftmphb[0]) {
            let data = global.gameconfig.ftmphb[0][x]
            if (score >= data.condition && item.length == 0 && rank <= data.max) {
                item = data.item
            }

            if (selfscore >= data.condition && useritem.length == 0 && selfrank <= data.max) {
                useritem = data.item
            }
            maxrank = data.max
        }
        return {
            rid: role.i(),
            rname: role.name,
            iconid: role.iconid,
            frameid: role.frameid,
            headid: role.headid,
            power: role._power,
            item,
            level: role.level,
            rank,
            servid,
            score,
        }

    }).filter(Boolean);
    ctx.body = {
        list,
    }

    if (selfrank <= maxrank) {
        ctx.body.selfrank = selfrank
        ctx.body.useritem = useritem
    }
    if (selfscore) {
        ctx.body.selfscore = selfscore;
    } else {
        ctx.body.selfscore = ctx.role.ftmphb[timekey().ftmphb.globalkey_db]
    }
    return ctx.body
}

module.exports = exports = async ctx => {
    let { rank } = ctx.request.body
    if (rank == 1) {
        return await gloalrankinfo(ctx)
    } else {
        return await dailyrankinfo(ctx)
    }

}
