exports.name = '临时数据修复';
exports.type = 'I';
exports.inherit = 'gameinstance-view';

async function redis_set(REDIS_KEY, ...data) {
    const params = []; //  score1 member1 [score2 member2] ....
    let t = 1 - Math.floor(Date.now() / 1000) / 10000000000; // 小数部分记录时间戳(这样可以保证同分数按时间排序
    if (typeof data[0] === 'string' && typeof data[1] === "number") {
        params.push(+data[1] + t);
        params.push(data[0]);
    } else {
        for (const item of data) {
            if (isNaN(+item.score)) {
                throw new Error('NaN For score');
            }
            let score = +item.score + t;
            params.push(score);
            params.push(item.id);
        }
    }

    await this.redis.ZADD(REDIS_KEY, ...params);
}

exports.exec = async function (body, query, ctx) {
    const type = 'pvpdef_power';
    const RANK_KEY = `KING:RANK:${type}`;
    const roles = await this.service.game.collection('roles');

    const opt = {
        $and:[
            {lastreap:{$lte:1673897820000}},
            {'_powerbattleset.pvpdef':{$exists:true}}
        ]
    }
    const itemOpt = {
        _id: 1,
        servid: 1,
        '_powerbattleset.pvpdef': 1,
    }

    let servers = {};
    const gameModel = await this.service.game.collection('gameservers');
    const cursor1 = await gameModel.find({});
    const items1 = await cursor1.toArray();
    items1.forEach(item => {
        servers[item.servid] = item.groupid;
    });
    console.log("****** repear servers ******",servers)
    let total = 0;
    const cursor = await roles.find(opt).project(itemOpt);
    const items = await cursor.toArray();
    items.forEach(item => {
        let groupid = servers[item.servid];
        let PRE = groupid ? `:${groupid}` : "";
        redis_set(RANK_KEY + PRE, item._id.toString(), item._powerbattleset.pvpdef * 10);
        total++;
    });
    console.log("****** repear count ******",total)
}
