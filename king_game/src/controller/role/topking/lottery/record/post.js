'use strict'

async function findList(ctx, params) {
    let {
        servid,
        uid,
    } = params;
    let cond = {
        uid,
        servid,
        expire: {$exists: 1},
    }
    let lotterylist = await ctx.dao.lottery.find(cond);
    let _lotterylist = [];
    for (let _lottery of lotterylist) {
        let {
            progress,
            battlemark,
            bettime,
            amount = 0,
            repay,
        } = _lottery;
        // 赛别
        let type = progress <= 3 ? 0 : 1;
        // 回合
        let stage = progress <= 3 ? progress : progress - 3;
        // 撇除冠军的progress=7
        stage = Math.min(stage, 3);
        // 查询双方servid,uid
        let players = battlemark.split('_');
        let _players = [];
        for (let mark of players) {
            let player = await ctx.dao.topking.findOne({mark});
            if (!player) {
                _players.push({});
                continue;
            }
            _players.push({
                uid: player.uid,
                servid: player.servid
            })
        }
        let tmp = {
            type,
            stage,
            players: _players,
        }
        if (bettime) {
            tmp.bingo = repay ? 1 : 0;
            tmp.money = repay ? repay - amount : amount;
        }
        // 战斗结果
        let battle = await ctx.dao.lotterybattle.findOne({battlemark});
        if (battle && battle.result) {
            let {
                result: ret,
                videoid,
            } = battle.result;
            tmp.videoid = videoid;
            if (ret == 'win') {
                tmp.players[0].ret = 1;
                tmp.players[1].ret = 0;
            } else {
                tmp.players[0].ret = 0;
                tmp.players[1].ret = 1;
            }
        }
        _lotterylist.push(tmp);
    }
    return _lotterylist;
}

module.exports = exports = async function (ctx, next) {
    let params = {
        uid: ctx.role.uid,
        servid: ctx.role.servid
    }
    let lotterylist = await findList(ctx, params);
    let _lotterylist = [];
    for (let _lottery of lotterylist) {
        let {
            players,
            ..._lotteryothers
        } = _lottery;
        let _players = [];
        for (let _player of players) {
            let {
                servid,
                uid,
                ..._playerothers
            } = _player;
            let player = await ctx.dao.role.getOtherInfoAndBattleSet({servid, uid},'topkingpvp');
            _players.push(Object.assign({}, {servid, uid}, _playerothers, player))
        }
        _lotteryothers.player = _players;
        _lotterylist.push(_lotteryothers);
    }
    ctx.body = _lotterylist;
}
