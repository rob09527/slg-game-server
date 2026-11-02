
'use strict'
// 职业试炼-战斗完成
const occtowerConfig = global.gameconfig.occtower.TOWERINFO;
const refreshConfig = global.gameconfig.occtower.REFRESH;
module.exports = exports = async (ctx, next) => {
    let { battleid } = ctx.request.body;
    let battle = await ctx.dao.c_battle.findOne({ _id: battleid });
    ctx.assert(battle, 'invalid battleid');
    await battle.cal();
    ctx.body = { result: battle.result };
    if (ctx.body.result.ret !== 'win') return;
    let [recordNum, type] = battle.mark.split('_');
    recordNum = parseInt(recordNum);
    type = parseInt(type);
    let config = occtowerConfig[type][recordNum - 1];
    // 插入闯关记录
    let towerInfo = await ctx.dao.tower.findOne({ rid: ctx.role._id, occu: type, type: 'occutower' }, { record: 1 });
    if (!towerInfo) {
        // 没有记录则保存
        await ctx.dao.tower.create({
            occu: type,
            type: 'occutower',
            rid: ctx.role._id,
            record: [{ time: Date.now(), floor: recordNum }],
            topfloor: recordNum,
            topfloortime: Date.now(),
            groupid: ctx.role._gameserv.groupid
        })
    } else {
        // 有记录则取
        let record = towerInfo.record || [];
        let obj = {
            time: Date.now(),
            floor: recordNum
        }
        record.push(obj);
        // 增加最搞楼层和到达时间
        towerInfo.topfloor = recordNum;
        towerInfo.topfloortime = Date.now();
        towerInfo.groupid = ctx.role._gameserv.groupid;
        towerInfo.markModified('groupid');
        towerInfo.markModified('record');
        towerInfo.markModified('topfloor');
        towerInfo.markModified('topfloortime');
        await towerInfo.save();
    }
    // 记录标记,保存每个职业阵营最大的关卡数
    let mark = 0;
    switch (type) {
        case 1:
            // 战士
            mark = 90446;
            break;
        case 2:
            // 刺客
            mark = 90447;
            break;
        case 3:
            // 法师
            mark = 90448;
            break;
        case 4:
            // 射手
            mark = 90449;
            break;
    }
    if (mark > 0) {
        let num = Math.max(1, recordNum);

        ctx.role.others[mark] = { count: num };
        ctx.role.markModified(`others.${mark}.count`)
        // 更新排名
        let rankService = new global.services.RankService('occu_' + type, ctx.role._gameserv.groupid);
        await rankService.set(ctx.role.i(), num);
    }

    // 保存录像
    let {
        seed,
        season,
        rcards,
		lcards,
        result: {
            version,
            ret: result,
            lper, rper,
            ltper, rtper,
            report,
        }
    } = battle;
    let video = {
        lper, rper,
        ltper, rtper,
        report,
        seed,
        rcards,
		lcards,
        season,
        result,
        left: {
            info: {
                rname: ctx.role.rname,
                level: ctx.role.level,
                iconid: ctx.role.iconid,
                headid: ctx.role.headid,
                frameid: ctx.role.frameid
            },
            'set': battle.player
        },
        right: {
            info: {
                level: battle.season.right
            },
            'set': battle.enemy
        },
    }
    video = new ctx.dao.video({
        type: 'occtower',
        rid: ctx.role._id,
        video: JSON.stringify(video),
        mark: battle.mark,
        version,
    })
    video.save().catch(console.error);
    // 返回录像id
    let videoid = video.i();
    if (ctx.body.result.ret == 'win') {
        // 赢了插入全局的tower表，显示前3位通关玩家信息
        let record = { rid: ctx.role.i(), time: Date.now(), video: videoid }
        // 判断是否插入前三记录
        await ctx.dao.gametower.addInRecord({
            type: 'occutower',
            floor: recordNum,
            groupid: ctx.role._gameserv.groupid,
            role: record,
            occu: type
        });
    }

    // 给奖励
    let rewards = config.KILL_REWARDS.map(({ GSID, COUNT }) => {
        return {
            gsid: GSID,
            count: COUNT
        }
    });
    if (rewards.length > 0) ctx.role.addItemsNoSave(rewards);
    // 是否增加扫荡令刷新上限、及送扫荡令
    let refreshInfo = refreshConfig[recordNum];
    if (refreshInfo && !ctx.role.occtower.floor[recordNum]) {
        ctx.role.occtower.floor[recordNum] = refreshInfo.NUM;
        ctx.role.occtower.refresh += refreshInfo.NUM;
        ctx.role.markModified('occtower');
        // 加扫荡令
        ctx.role.addItemsNoSave({ gsid: 38011, count: refreshInfo.NUM })
    }
    await ctx.role.save();
    ctx.role.dispatchEvent('EVENT_OCCTOWER_' + type, 1, {ret: recordNum});

    ctx.body.rewards = rewards;
    ctx.body.kill = 1;
    ctx.body.damge = result.rlosthp;
}
