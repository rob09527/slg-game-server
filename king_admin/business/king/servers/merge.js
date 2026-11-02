exports.name = '游戏合服';
exports.type = 'N';
const moment = require('moment');

exports.exec = async function (body, query, ctx) {
    const { servid } = body;
    if (!Array.isArray(servid)) {
        throw "请选择合服区服"
    }
    const servers = servid.map(Number).filter(Boolean);
    if (servers.length < 2) {
        throw "请选择2个及其以上的服务器"
    }
    // 不是周五抛错
    if (moment().isoWeekday() != 5) {
        throw "请周五合服"
    }
    // 处理合服逻辑
    const headerSid = servers.sort()[0];

    const gameModel = await this.service.game.collection('gameservers');
    const serversInfos = await gameModel.find({ servid: { $in: servers } }).project({ sno: 1, groupid: 1, status: 1, servid: 1 }).sort({ servid: 1 }).toArray();
    let openServers = serversInfos.filter(s => s.status != 0);
    if (openServers.length > 0) {
        throw "请先停服再进行合服"
    };
    if (global.isMergering) {
        throw '正在合服中...'
    }
    global.isMergering = 1;
    /**
     * 组合成
     * 1001:{servid:1001,sno:1,groupid:1}
     */
    let serverObjs = {};
    serversInfos.forEach(s => serverObjs[s.servid] = s);
    const headerServer = serversInfos.filter(s => s.servid == headerSid); // 头部服信息
    const headerGroupid = headerServer[0].groupid; // 头部服的groupid
    const allGroupIds = serversInfos.map(g => g.groupid);// 所有的groupid
    const otherGroupids = serversInfos.filter(s => s.groupid != headerGroupid).map(g => g.groupid);
    const c_wangpvpModel = await this.service.game.collection('c_wangpvps');
    const wangpvpModel = await this.service.game.collection('wangpvps');
    const wangpvprecordModel = await this.service.game.collection('wangpvprecords');
    const roleModel = await this.service.game.collection('roles');
    const legionModel = await this.service.game.collection('legions');
    const gametowerModel = await this.service.game.collection('gametowers');
    const rankmissionsModel = await this.service.game.collection('rankmissions');

    //  把其他的服改成头部服的 group_id
    console.log("MERGE SERVER ING HEADER IS", headerSid, "ALL:", servers.join(','));
    console.log("MERGE SERVER HEADER GROUPID IS", headerGroupid, "OTHERS:", otherGroupids.join(','));
    console.log(serverObjs)
    // ------------------ 合服脚本逻辑------------------
    /**
     * 删除其他服中不需要的数据
     **/
    // 选出参加的王战人数添加到头部服
    const createWangpvp = async ({ groupid, servers }) => {
        await c_wangpvpModel.deleteMany({ groupid: { $in: otherGroupids } });
        // 移除王战人数（所有服）
        await wangpvpModel.deleteMany({ groupid: { $in: allGroupIds } });
        // 分组记录
        await wangpvprecordModel.deleteMany({ groupid: { $in: allGroupIds } })
        // 选64个人参加王战插入头部服
        // 查玩家需要按照分组
        let roles = await roleModel.find({ servid: { $in: servers }, 'battlearr.normal': { $exists: 1 } }).project({ '_id': 1 }).sort({ 'others.90185.count': -1 }).limit(64).toArray();
        let wangpvps = [];
        // 只取64人
        for (let i = 0; i < roles.length; i++) {
            let obj = {
                mark: i,
                rid: roles[i]._id.toString(),
                groupid
            }
            wangpvps.push(obj);
        };
        if (wangpvps.length > 0) await wangpvpModel.insertMany(wangpvps);
        console.log("WANGPVP PEOPLE INSERT", wangpvps.length, new Date().toLocaleString());
    }
    await createWangpvp({ groupid: headerGroupid, servers });
    // 军团重名处理
    const legionDupName = async (servers) => {
        let search = {
            $match: {
                servid: { $in: servers }
            }
        }
        let $group = {
            _id: '$name',
            num: {
                $sum: 1,
            }
        }
        let $sort = {
            num: -1,
        }
        let $match = {
            num: {
                $gt: 1,
            }
        }
        let pipeline = [
            search,
            { $group },
            { $sort },
            { $match },
        ];
        let data = await legionModel.aggregate(pipeline).toArray();
        for (let { _id: name } of data) {
            let cursor = await legionModel.find({ name }).project({ _id: 1, name: 1, servid: 1 }).toArray();
            // 重命名
            for (let { _id, name, servid } of cursor) {
                let cond = {
                    _id
                }
                let $set = {
                    name: name + '_' + servid < 2001 ? 's' : 'y' + serverObjs[servid].sno
                }
                await legionModel.updateOne(cond, { $set });
            }
        }
        console.log('LEGION DUPNAME DONE ', new Date().toLocaleString());
    }
    await legionDupName(servers);
    // 用户名重名处理
    const rnameDup = async (servers) => {
        let search = {
            $match: {
                servid: { $in: servers }
            }
        }
        let $group = {
            _id: '$rname',
            num: {
                $sum: 1,
            }
        }
        let $sort = {
            num: -1,
        }
        let $match = {
            num: {
                $gt: 1,
            }
        }
        let pipeline = [
            search,
            { $group },
            { $sort },
            { $match },
        ]
        let data = await roleModel.aggregate(pipeline).toArray();
        for (let { _id: rname } of data) {
            let cursor = await roleModel.find({ rname, servid: { $in: servers } }).project({ _id: 1, rname: 1, servid: 1 }).toArray();
            // 重命名
            for (let { _id, rname, servid } of cursor) {
                console.log(_id, rname, servid);
                if(!rname) continue;
                let cond = {
                    _id
                }
                let $set = {
                    rname: rname + (servid < 2001 ? 's' : 'y') + (serverObjs[servid] ? serverObjs[servid].sno : servid)
                };
                console.log($set)
                await roleModel.updateOne(cond, { $set });
            }
        }
        console.log('RNAME DUP DONE', new Date().toLocaleString())
    }
    await rnameDup(servers);
    
    // 处理首通前3玩家-tower和occutower
    const passThreePeople = async () => {
        let types = await gametowerModel.distinct('type')
        for (let type of types) {
            let occus = await gametowerModel.distinct('occu', { type })
            if (occus.length == 0) {
                // tower
                let floors = await gametowerModel.distinct('floor', { type })
                for (let floor of floors) {
                    // 这个楼层下的所有数据
                    let list = await gametowerModel.find({ floor, type, groupid: { $in: allGroupIds } }).project({ record: 1, groupid: 1 }).sort({ groupid: 1 }).toArray();
                    if (list.length < 2) continue;
                    // 所有的信息添加到一个数组里,前提是需要去除了record为1或者2的数据
                    let tmprecords = [];
                    for (let { record } of list) {
                        tmprecords.push(...record);
                    }
                    tmprecords.sort(function (pre, nxt) {
                        return pre.time > nxt.time ? 1 : -1;
                    })
                    tmprecords = tmprecords.slice(0, 3);
                    // 除了第一个以外其他删除
                    for (let [i, obj] of Object.entries(list)) {
                        if (i === '0') {
                            let $set = {
                                record: tmprecords,
                            }
                            await gametowerModel.updateOne({ _id: obj._id }, { $set });
                        } else {
                            await gametowerModel.deleteOne({ _id: obj._id });
                        }
                    }
                }
            } else {
                // occutower
                for (let occ of occus) {
                    // 去重该类型所有楼层
                    let floors = await gametowerModel.distinct('floor', { occu: occ })
                    for (let floor of floors) {
                        // 这个楼层下的所有数据
                        let list = await gametowerModel.find({ floor, type, occu: occ, groupid: { $in: allGroupIds } }).project({ record: 1, occu: 1, groupid: 1 }).sort({ groupid: 1 }).toArray()
                        if (list.length < 2) continue;
                        // 所有的信息添加到一个数组里,前提是需要去除了record为1或者2的数据
                        let tmprecords = [];
                        for (let { record } of list) {
                            tmprecords.push(...record);
                        }
                        tmprecords.sort(function (pre, nxt) {
                            return pre.time > nxt.time ? 1 : -1;
                        })
                        tmprecords = tmprecords.slice(0, 3);
                        // 除了第一个以外其他删除
                        for (let [i, obj] of Object.entries(list)) {
                            if (i === '0') {
                                let $set = {
                                    record: tmprecords,
                                }
                                await gametowerModel.updateOne({ _id: obj._id }, { $set });
                            } else {
                                await gametowerModel.deleteOne({ _id: obj._id });
                            }
                        }
                    }

                }
            }
        }
        console.log('PASSTHREEPEOPLE DONE', new Date().toLocaleString())
    }
    await passThreePeople()
 
    // 武门丰碑
    const rankmissionFun = async () => {
        // 查出本次合服组中所有数据
        let types = await rankmissionsModel.distinct('type')
        for (let type of types) {
            let missionIndexs = await rankmissionsModel.distinct('missionIndex', { type })
            for (let missionIndex of missionIndexs) {
                let list = await rankmissionsModel.find({ type, missionIndex, groupid: { $in: allGroupIds } }).toArray()
                if (list.length < 2) continue;
                let tmproles = [];
                for (let { roles } of list) {
                    tmproles.push(...roles);
                }
                tmproles.sort(function (pre, nxt) {
                    return pre.time > nxt.time ? 1 : -1;
                })
                tmproles = tmproles.slice(0, 5);
                // 除了第一个以外其他删除
                for (let [i, obj] of Object.entries(list)) {
                    if (i === '0') {
                        let $set = {
                            roles: tmproles,
                        }
                        await rankmissionsModel.updateOne({ _id: obj._id }, { $set });
                    } else {
                        await rankmissionsModel.deleteOne({ _id: obj._id });
                    }
                }
            }
        }
        console.log('RANKMISSION DONE ', new Date().toLocaleString())
    }
    await rankmissionFun();

    // 处理redis的排名数据
    // 1,所有的数据插入到头部服
    // 2,后面没问题了,再删除其他服数据
    const redisFun = async (type, topGroupid, othersGroupids) => {
        let _type = type;
        let REDIS_KEY = `KING:RANK:${_type}`;
        let top_redis_key = `${REDIS_KEY}:${topGroupid}`;

        for (let gid of othersGroupids) {
            let redis_key = `${REDIS_KEY}:${gid}`;
            // 查出所有成员,先设为1W为最大人数
            let members = await this.redis.ZREVRANGE(redis_key, 0, 10000, 'WITHSCORES');
            for (let i = 0; i < members.length / 2; i++) {
                let member = members[i * 2];
                members[i * 2] = members[i * 2 + 1];
                members[i * 2 + 1] = member;
            }
            if (members.length > 0) await this.redis.ZADD(top_redis_key, ...members);
        }
        // 删除redis的数据
        let keys = [];
        for (let o_groupid of othersGroupids) {
            let r_key = `${REDIS_KEY}:${o_groupid}`;
            keys.push(r_key)
        }
        for (let key of keys) {
            await this.redis.del(key);
        }
        console.log('redisFun DONE', _type, top_redis_key)

    }
    // 武门丰碑
    let wutypes = ["main", "tower", "qun", "shu", "wei", "wu", "shen", "mo", "power"]
    for (let w_type of wutypes) {
        await redisFun(w_type, headerGroupid, otherGroupids);
    }
    // 一骑当先
    await redisFun('dungeon', headerGroupid, otherGroupids);

    //单人擂台
    await redisFun('pvp', headerGroupid, otherGroupids);

    // 上古战场
    await redisFun('yuangu', headerGroupid, otherGroupids);

    // 封地
    await redisFun('manor', headerGroupid, otherGroupids);


    // 其他groupid设为topgroupid
    await gameModel.updateMany({ groupid: { $in: otherGroupids } }, { $set: { groupid: headerGroupid } })

    // 执行完后再调用接口执行王战分组
    await this.remote.agent_retimer('wangpvp_randomgroup');

    console.log("MERGE SERVER END", headerSid, new Date().toLocaleString());
     global.isMergering = 0;
    return "OK";
};

