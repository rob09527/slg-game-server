'use strict'

const ms = require('ms');
// 定时器
exports.name = "王者演武赛季结算"; // 类似一句中文注释，后续后台可以展示该名字,

exports.cron = '1 1 * * 5'; // 每周五0点结算
//exports.cron = '10 18 * * 5'; // 每周五0点结算 dev

/**
 * 定时器主体函数
 * 异常直接抛出就行
 * @return {Promise<void>}
 */
exports.main = async function () {
    const WZ_NUM = global.gameconfig.others.PVPKING.WZ_CONFIG;

    // 获取所有分组标记
    let gmarklist = await global.dao.kinggroup.distinct('groupmark');
    for (let groupmark of gmarklist) {
        // 获取所在组所有服务器编号
        let $in = await global.dao.kinggroup.find({ groupmark });
        $in = $in.map(({ servid }) => servid);
        // 指定王者的数量
        let wz_num = $in.length > 1 ? WZ_NUM.MULTI : WZ_NUM.SINGLE;
        let cond = {
            servid: { $in },
            kingpvp: { $exists: 1 },
            'kingpvp.l0': 5,
        }
        let sort = {
            'kingpvp.l0': -1,
            'kingpvp.l1': -1,
            'kingpvp.star': -1,
            'kingpvp.update': 1,
        }
        let select = {
            uid: 1,
            servid: 1,
        }
        // 找出王者(分组前30/10)
        let wz = await global.dao.pvpking.find(cond, select).sort(sort).limit(wz_num);
        // 标记
        wz = wz.map(({ uid, servid }) => {
            return servid + '_' + uid;
        })
        /*
            按服务器号组织玩家列表
            data = {
                1001: [
                    {uid: 'papa12312', l0: 1, l1: 2},
                    ...
                ]
            }
        */
        let data = {};
        // 查找分组所有玩家
        cond = {
            servid: { $in },
            kingpvp: { $exists: 1 },
        }
        select.kingpvp = 1;
        let list = await global.dao.pvpking.find(cond, select);
        for (let info of list) {
            let {
                uid,
                servid,
                kingpvp: {
                    l0,
                    l1,
                },
            } = info;
            let player = { uid, l0, l1 };
            // 检查王者玩家,重新设置段位
            if (wz.includes(servid + '_' + uid)) {
                player.l0 = 6;
                player.l1 = 0;
            }
            data[servid] = data[servid] || [];
            data[servid].push(player);
        }
        for (let [sid, list] of Object.entries(data)) {
            console.time(`PVPKING SEASON SERVER DONE ${sid}`);
            await global.dao.pvpking.seasonFinish({ sid, list });
            console.timeEnd(`PVPKING SEASON SERVER DONE ${sid}`);
        }
    }
    // 清空人物身上的对应阵容
    let udp = {
        $unset: {
            'battlearr.kingpvp1': 1,
            'battlearr.kingpvp2': 1,
            'battlearr.kingpvp3': 1,
            '_powerbattleset.kingpvp1': 1,
            '_powerbattleset.kingpvp2': 1,
            '_powerbattleset.kingpvp3': 1,
        }
    }
    // 清空武将身上的阵容标记

    let udp1 = {
        $unset: {
            'battleset.kingpvp1': 1,
            'battleset.kingpvp2': 1,
            'battleset.kingpvp3': 1
        }
    }

    console.time(`PVPKING SEASON UNSET DONE`);

    await global.dao.role.updateMany({ 'battlearr.kingpvp1': { $exists: 1 } }, udp);
    await global.dao.general.updateMany({ 'battleset.kingpvp1': { $exists: 1 } }, udp1);

    console.timeEnd(`PVPKING SEASON UNSET DONE`);


    //  重新分组
    let groupConfig = global.gameconfig.wangzhe_group;
    for (let info in groupConfig) {
        await global.dao.kinggroup.updateMany({ servid: { $in: groupConfig[info] } }, { $set: { groupmark: `manual${info}`, update: Date.now() } });
    }
    // 异步删除录像
    global.dao.video.remove({ type: 'pvpking' }).catch(console.error);
}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}
