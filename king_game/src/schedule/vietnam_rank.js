
'use strict'

exports.name = "越南方数据定时刷新器"; // 每日定时器，负责执行 周 日 月标记刷新

// 定时器语句
exports.cron = "0/15 * * * *"; // 每15分钟执行一次，从第0分钟开始
//exports.cron = "0 0 0 * * *";
//exports.cron = "0/15 * * * * ?";

/**
 * 全服排名
 */
const roleRank = async function () {
    const key = 'power'
    // const serv_groups = await global.dao.gameserver.fetchServers();
    let servicelist = await global.dao.gameserver.find();
    if (!servicelist) {
        return;
    }

    let group = new Set()
    for (let serv of servicelist) {
        group.add(serv.groupid)

    }
    let rankGroup = Array.from(group)
    let sortrank = []
    await Promise.all(rankGroup.map(async e => {
        const rankService = new global.services.RankService(key, e)
        let list = await rankService.rank(1, 100);
        sortrank.push(...list)
    }))

    sortrank.sort((a, b) => b.score - a.score);
    let top100 = sortrank.slice(0, 100)
    let roles = top100.map(({ id }) => id);
    roles = await global.dao.role.find({ _id: { $in: roles } });
    const tmp = {};
    roles.forEach(one => {
        tmp[one._id.toString()] = one;
    })

    top100 = top100.map(({ id, score }, index) => {
        let role = tmp[id];
        if (!role) return;
        // output: [{ rank, level, power, name, uid, serverid }] //length<=100
        return {
            name: role.name,
            uid: role.uid,
            serverid: role.servid,
            power: score,
            level: role.level,
            rno: role.rno,
            rank: index + 1
        }
    }).filter(Boolean);

    let data = {
        time: Math.round(Date.now() / 1000),
        rankList: top100
    }
    const rediskey = `VIETNAM:RANK:${key}`;

    await global.redis.set(rediskey, JSON.stringify(data));
    console.log('roleRank power top100 success', top100.length)
}

const legionLevel = function (exp) {
    let level = 0;
    const config = global.gameconfig.legionlevel;
    while (true) {
        let next = config[level];
        if (!next) break;
        next = next.EXP
        if (typeof next !== 'number' || exp < next) break;
        exp -= next;
        level++;
    }
    return level;
}



const legionRank = async function () {
    let legionResult = await global.dao.legion.find().sort({ power: -1 }).limit(100);
    let top100 = []
    legionResult.map((e, index) => {
        // ouput: [{ legion_rank, legion_level, legion_power, legion_name, serverid }] //length<=100
        let rid = ''
        e._members.forEach(e => {
            if (e.pos == 2) {
                rid = e.rid
            }
        })
        let data = {
            id: e._id.toString(),
            legion_rank: index + 1,
            legion_level: legionLevel(e._exp),
            legion_power: e.power,
            legion_name: e.name,
            rid: rid,
            serverid: e.servid
        }
        top100.push(data)
    })

    let data = {
        time: Math.round(Date.now() / 1000),
        rankList: top100
    }
    const key = 'legion'
    const rediskey = `VIETNAM:RANK:${key}`;

    await global.redis.set(rediskey, JSON.stringify(data));
    console.log('roleRank legion top100 success', top100.length)
}


const generalRank = async function () {
    let generalResult = await global.dao.generalrank.find().sort({ power: -1 }).limit(100);
    let top100 = []
    generalResult.map((e, index) => {
        //ouput: { time: 123, rankList: [{ general_rank, general_level, general_power, general_name, uid, serverid }] }//length<=100


        let data = {
            general_rank: index + 1,
            general_level: legionLevel(e._exp),
            general_power: e.power,
            general_name: e.gname,
            uid: e.role.uid,
            serverid: e.role.servid,
            name: e.role.rname
        }
        top100.push(data)
    })

    let data = {
        time: Math.round(Date.now() / 1000),
        rankList: top100
    }
    const key = 'general'
    const rediskey = `VIETNAM:RANK:${key}`;

    await global.redis.set(rediskey, JSON.stringify(data));
    console.log('roleRank general top100 success', top100.length)
}





exports.main = async function () {
    try {
        await roleRank()
        await legionRank()
        await generalRank()
    } catch (error) {
        console.error(error)
    }

}
