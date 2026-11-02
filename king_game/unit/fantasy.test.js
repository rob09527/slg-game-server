
const insertRoleToRank = async function ({ num = 10, isSave = false }) {

    let roles = await global.dao.role.find({}, { uid: 1, servid: 1 }).limit(num);
    let servidObj = {};
    let dbObj = {}
    //console.log('<--- roles =', JSON.stringify(roles))
    roles.map(role => {
        if (role.uid.indexOf('yoho') >= 0 || role.uid.indexOf('xh') >= 0) return;
        if (!servidObj[role.servid]) servidObj[role.servid] = [];
        if (!dbObj[role.servid]) dbObj[role.servid] = [];

        let lastdamge = Math.floor(Math.random() * 99900 + 929999990)
        servidObj[role.servid].push({ id: role._id.toString(), score: lastdamge })

        dbObj[role.servid].push({
            lastdamge: lastdamge,
            rid: role._id.toString(),
            servid: role.servid
        })
    })

    let dbFantasy = await global.dao.fantasy.findOne({});
    let existArr = await global.dao.fantasyboss.find({}, { rid: 1 });
    let existRid = existArr.map(elem => elem && elem.rid)
    let list = Object.keys(servidObj);
    let insertArr = [];
    for (let servid of list) {
        let selfGroup = await global.dao.topkingservergroup.findOne({ servid })
        console.log('<--- selfGroup =', selfGroup, servid, servidObj[servid].length)
        if (!selfGroup) continue;
        let fantasyRank = new global.services.RankService('fantasy', selfGroup.areamark);

        let redisArr = servidObj[servid].map(elem => {
            if (existRid.indexOf(elem.id) >= 0) return;
            return elem;
        }).filter(elem => elem);
        if (isSave) await fantasyRank.set(...redisArr);

        let dbObjs = dbObj[servid].map(elem => {
            if (existRid.indexOf(elem.rid) >= 0) return;
            return {
                ...elem,
                areamark: selfGroup.areamark,
                bossid: dbFantasy.bossid
            }
        }).filter(elem => elem);
        insertArr.push(...dbObjs);
    }
    console.log('<--- insertArr =', insertArr.length)
    // 插入数据库
    if (isSave) await global.dao.fantasyboss.insertMany(insertArr)
}
// 奇门幻阵定时器测试
module.exports = async () => {
    //console.log('<---- config =', global.config, global.config.fantasy)

    // await require('../src/schedule/fantasy_start').main();
    // await require('../src/schedule/fantasy_reward').main();

    // 插入假数据到奇门幻阵排行榜
    // await insertRoleToRank({ num: 700, isSave: true })
}