
'use strict'

const assert = require('assert');
const moment = require('moment');
// 创建64位参赛玩家
module.exports = exports = async function (groupid) {

    let _nationwarservers = global.gameconfig.join_nationwar_server || {};
    let nationwarservers = [];
    // 归集
    for (let s in _nationwarservers) {
        nationwarservers.push(..._nationwarservers[s])
    }
    let g_kingdom = await global.dao.c_kingdom.findOne({ groupid });
    // 服务器分组信息
    let g_servers = await global.dao.gameserver.fetchServerByGroupId(groupid);

    // 首次获取生成王国数据
    if (!g_kingdom) {
        let standings = [];
        // 冠军
        let first = await global.dao.wangpvp.findOne({ groupid, progress: 7 }, { rid: 1 });
        global.assert(first, 'no data');
        standings.push(first.rid);
        // 亚军
        let second = await global.dao.wangpvp.findOne({ groupid, progress: 6 }, { rid: 1 });
        standings.push(second.rid);
        // 4强淘汰的2人
        let last4rids = await global.dao.wangpvp.find({ groupid, progress: 5 }, { rid: 1 }).limit(2);
        let tmp = [];
        for (let { rid } of last4rids) {
            let doc = await global.dao.role.findOne({ _id: rid }, { _power: 1 });
            tmp.push({
                rid,
                power: doc._power,
            })
        }
        tmp.sort(function (pre, nxt) {
            return pre.power > nxt.power ? 1 : -1;
        })
        standings.push(...tmp.map(({ rid }) => rid));
        // 8强淘汰的4人
        let last8rids = await global.dao.wangpvp.find({ groupid, progress: 4 }, { rid: 1 }).limit(4);
        tmp = [];
        for (let { rid } of last8rids) {
            let doc = await global.dao.role.findOne({ _id: rid }, { _power: 1 });
            tmp.push({
                rid,
                power: doc._power,
            })
        }
        tmp.sort(function (pre, nxt) {
            return pre.power > nxt.power ? 1 : -1;
        })
        standings.push(...tmp.map(({ rid }) => rid));
        // 保存
        g_kingdom = await global.dao.c_kingdom.create({
            kingrid: standings[0],
            standings,
            groupid
        })

        // 服务器排重
        let servers = g_servers.group_sid_list;
        // 国王的名字的首个字符
        let kingInfo = await global.dao.role.findOne({ _id: standings[0] }, { rname: 1 });
        let rname = kingInfo && kingInfo.rname ? kingInfo.rname.substring(0, 1) : 'null'
        //开服20天才上传信息
        let startTime = moment(g_servers.start).add(20, 'day',).valueOf();
        if (Date.now() > startTime) {
            // 上传王战信息到common。准备国战数据
            if (nationwarservers.includes(g_servers.servid)) {
                try {
                    //插入国战数据表
                    await global.dao.nationwar_serverinfo.create({
                        standings,
                        servers,
                        servid: g_servers.servid,
                        name: rname,
                        kingname: kingInfo.rname,
                        icon: 0,
                        groupid
                    })
                } catch (error) {
                    console.error(error);
                }

            }
        }
        // 保存每一期的8王记录
        let c_wangpvpinfo = await global.dao.c_wangpvp.find({ groupid }).sort({ index: -1 });
        if (c_wangpvpinfo.length > 0) {
            await global.dao.c_wangpvp.create({
                kingrid: standings[0],
                standings,
                groupid,
                index: c_wangpvpinfo[0].index + 1
            })
        } else {
            await global.dao.c_wangpvp.create({
                kingrid: standings[0],
                standings,
                groupid
            })
        }
    }
}