'use strict'


// 定时器
exports.name = "军团战战斗"; // 类似一句中文注释，后续后台可以展示该名字,

const moment = require('moment');
const doBattle = require('../util/battleOne');
const tg = require('../util/textgetter');
const ObjectId = require("mongoose/lib/types/objectid");

exports.cron = async function () {
    return global.gameconfig.legionpvp.CONFIG.START_FIGHT;
}


const CAMPS = ['top', 'mid', 'down'];

const MAX_DOING = 3; // 最大同时执行数

// 解析军团战buff
const parseBuffToSpecialbuff = (team) => {
    if (!team || team.legionbuff === null) { // 初始值不会是 null,避免计算多次
        return;
    }
    team._streak_buff = 0;
    team.specialbuff = team.specialbuff || [];
    for (const buff of [].concat(team.rolebuff, team.legionbuff)) {
        if (!buff) {
            continue;
        }
        if (buff.KEY === '_streak_buff') {
            team._streak_buff += Number(buff.VAL)
        } else {
            team.specialbuff.push({
                [buff.KEY]: buff.VAL
            })
        }
    }
    team.rolebuff = null;
    team.legionbuff = null;
}

const initSettlement = () => {
    // 初始化 积分结算函数
    const SETTLEMENT = gameconfig.legionpvp.SETTLEMENT;
    if (SETTLEMENT.winnerSettle) {
        return SETTLEMENT;
    }
    Object.defineProperty(SETTLEMENT, 'winnerSettle', {
        get() {
            if (this._winner) {
                return this._winner;
            }
            this._winner = new Function('SCORE_DIFF', 'SCORE', 'POINT_DIFF', 'return ' + this.WINNER);
            return this._winner;
        }
    });
    Object.defineProperty(SETTLEMENT, 'loserSettle', {
        get() {
            if (this._loser) {
                return this._loser;
            }
            this._loser = new Function('SCORE_DIFF', 'SCORE', 'POINT_DIFF', 'return ' + this.LOSER);
            return this._loser;
        }
    });
    Object.defineProperty(SETTLEMENT, 'drawSettle', {
        get() {
            if (this._draw) {
                return this._draw;
            }
            this._draw = new Function('SCORE_DIFF', 'SCORE', 'POINT_DIFF', 'return ' + this.DRAW);
            return this._draw;
        }
    });
    return SETTLEMENT;
}

/**
 *
 * @param legionId {string} 军团sid_lid
 * @param type {string} win|win0|lose
 * @param rids {string[]}  参与战斗的rid 数组
 */
const sendReward = async (legionId, type, rids) => {
    const title = tg(`LEGION_PVP_${type.toUpperCase()}_T`);
    const content = tg(`LEGION_PVP_${type.toUpperCase()}_C`);

    if (type === 'win0') { // 轮空
        type = 'win'; // 轮空发胜利的奖励
    }

    const reward = gameconfig.legionpvp.REWARD[type.toUpperCase()];
    const legion = await global.dao.legion.findOne({_id: legionId}, {servid: 1, _members: 1});
    if (!legion) {
        console.error('LEGION SEND REWARD ERROR, NO FOUND LEGION', legionId);
        return;
    }
    const gameserv = await global.dao.gameserver.findOne({servid: legion.servid}, {groupid: 1}); // 查询该军团所在服务器的服务器分组id
    // 创建拍卖商品
    global.dao.auction.createAuction('legion_' + legion._id, {
        type: (type === 'win' || type === 'draw') ? 'WIN' : 'LOSE',
        bounceList: rids,
        groupid: gameserv.groupid
    })
        .catch(console.error.bind('', 'CREATE AUCTION ERROR'));

    const mails = legion._members.map(r => {
        return {
            rid: r.rid,
            type: 2,
            reward: reward,
            title,
            content
        }
    });
    await global.dao.mail.insertMany(mails);

}

/**
 * 定时器主体函数
 * 异常直接抛出就行
 * @param info {{pvpDate: string, legion: string }} 手动打某一场军团战战斗
 * @return {Promise<void>}
 */
exports.main = async function (info = undefined) {
    const MAC_STREAK_TIMES = gameconfig.legionpvp.MAC_STREAK_TIMES || 3; // 最大连胜次数
    const MATCH = gameconfig.legionpvp.CONFIG.MATCH;
    const SETTLEMENT = initSettlement();
    const now = new Date();

    // 找出 期号, 就是找出战斗之前的第一个匹配日
    let DAY = MATCH.split(' ').pop().split(',');
    while (!DAY.includes(now.getDay().toString())) {
        now.setDate(now.getDate() - 1);
    }
    const pvpDate = info ? info.pvpDate : moment(now).format('YYYY-MM-DD') ;
    const _match_ = {pvpDate};
    if(info) { // 固定打某一场
        _match_.legion = info.legion;
    }
    const legions = await global.dao.legionpvp.find(_match_); // 找出本期所有参与军团
    const legionGroupByServid = {};

    legions.forEach(item => {
        const legion = item.legion[0]; // 取对阵军团 的第一个 军团来作为 计算服务器
        const servid = '1'; // 兼容旧逻辑，新逻辑中 已经没有 servid 保存了

        legionGroupByServid[servid] = legionGroupByServid[servid] || [];
        legionGroupByServid[servid].push({ // 按服务器分组,方便同服务器串行计算
            legion1: legion,
            legion2: item.legion[1]
        });
    });
    /**
     *
     * @param servid 废弃参数
     * @param left
     * @param right
     * @param time battle次数
     * @return {Promise<any>}
     */
    const battleOne = async (servid, left, right, time = 1) => {
        let battle;
        try {
            battle = await doBattle(left, right);
            if (battle.error) {
                throw battle.error;
            }
        } catch (e) {
            if (time > 3) { // 重试次数达到上限
                console.error('ERROR BATTLE', e);
                return null;
            }
            return await battleOne(servid, left, right, time + 1);
        }

        let {
            lper,
            rper,
            ltper,
            rtper,
            report,
            version,
            ret
        } = battle.result;

        const video = {
            result: ret,
            seed: battle.seed,
            season: battle.season,
            left,
            right,
            lper, rper,
            ltper, rtper,
            lcards:battle.lcards,
            rcards:battle.rcards,
            report,
            id: 'legion_video_id',
        };

        let myVideo = await global.dao.video.create({
            type: 'legionpvp',
            video: JSON.stringify(video),
            version
        })
        await myVideo.save().catch(console.error.bind(null, 'LEGION PVP VIDEO SAVE'));
        return {
            ret,
            lper,
            rper,
            video_id: myVideo._id.toString()
        };
    }
    /* 单阵营战斗  */
    const campBattle = async (servid, leftTeams, rightTeams, legionBoth) => {
        let rightIndex = 0;
        const reportDetail = []; // 战报细节
        for (let leftIndex = 0; leftIndex < leftTeams.length;) {
            const left = leftTeams[leftIndex];
            const right = rightTeams[rightIndex];
            if (!right) {
                break;
            }
            parseBuffToSpecialbuff(left); // 计算多次只会有一次有效
            parseBuffToSpecialbuff(right);
            const report = await battleOne(servid, left, right);
            if (!report) { // 战斗报错 的情况,作废这一场
                reportDetail.push({
                    left: leftIndex,
                    right: rightIndex,
                    video: null,
                    winner: null
                });
                left._DIED_ = 1;
                right._DIED_ = 1;
                console.error('LEGION PVP ERROR AT', legionBoth);
                rightIndex++;
                leftIndex++;
                continue;
            }
            const winnerTeam = report.ret === 'win' ? left : right;
            const failTeam = report.ret === 'win' ? right : left;
            failTeam._DIED_ = 1; // 标记 淘汰
            const hperKey = report.ret === 'win' ? 'lper' : 'rper';
            winnerTeam._streak = winnerTeam._streak || 0;
            winnerTeam._streak++; // 连胜++
            winnerTeam._streak_buff = winnerTeam._streak_buff || 0; // 连胜 buff
            for (const k in report[hperKey]) {
                winnerTeam.team[k].hppercent = report[hperKey][k];
            }

            reportDetail.push({
                left: leftIndex,
                right: rightIndex,
                streak: winnerTeam._streak,
                video: report.video_id,
                winner: report.ret === 'win' ? 'left' : 'right'
            });

            if (winnerTeam._streak >= MAC_STREAK_TIMES + winnerTeam._streak_buff) {  // 连胜达到上限
                leftIndex++;
                rightIndex++;
                winnerTeam._OUT_ = 1; // 因为连胜达到上限出局
            } else {
                if (report.ret === 'win') { // 左侧赢了
                    rightIndex++;
                } else { // 右侧赢了
                    leftIndex++;
                }
            }
        }
        const leftLive = leftTeams.filter(o => !o._DIED_);
        const rightLive = rightTeams.filter(o => !o._DIED_);

        const leftExists = leftLive.filter(o => !o._OUT_);
        const rightExists = rightLive.filter(o => !o._OUT_);
        let score = 0; // 得分积分
        const scoreTeams = [];
        let winner = '';
        if (leftExists.length === rightExists.length && rightExists.length === 0) { // 两边队伍都已经用完，则，最后一对是连胜队的一方胜利
            const leftEnd = leftLive.pop();
            const rightEnd = leftLive.pop();
            if (leftEnd && leftEnd._OUT_) { // left 胜利
                scoreTeams.push(leftEnd);
                winner = 'left';
            } else if (rightEnd && rightEnd._OUT_) { // 右侧胜利
                scoreTeams.push(rightEnd);
                winner = 'right';
            } else { // 正常逻辑不会出现该 case ，打一句日志，方便排查
                leftTeams.length && rightTeams.length && console.error('INVALID RESULT', legionBoth);
            }
        } else if (leftExists.length > 0) {
            winner = 'left';
            scoreTeams.push(...leftExists);
        } else if (rightExists.length > 0) {
            winner = 'right';
            scoreTeams.push(...rightExists);
        }

        // 计算平均等级
        const getAverageLevel = (team = []) => {
            return Math.floor(team.reduce((a, b) => ({level: a.level + b.level})).level / team.length);
        }

        // 按照平均等级计算 当前路得分
        scoreTeams.forEach(o => {
            score += getAverageLevel(Object.values(o.team));
        });

        return {
            winner,
            score,
            detail: reportDetail
        }
    }
    const battle = async (servid, legionBothSides = []) => {
        for (const legionBoth of legionBothSides) { // 对战双方数组
            // 查出阵营
            const camps = await global.dao.legionpvpteam.find({
                legion: {$in: Object.values(legionBoth).filter(Boolean)},
                pvpDate
            });

            if (camps.length === 0) {
                console.warn('INEFFECTIVE LEGION VS', legionBoth);
                continue;
            } else if (camps.length === 1) { // 只有一对的情况, 处理轮空逻辑
                await global.dao.legionpvp.updateOne({legion: camps[0].legion, pvpDate}, {
                    $set: {
                        report: {
                            _legion_: {
                                left: camps[0].legion,
                                right: null
                            },
                            top: {
                                detail: [],
                                winner: 'left',
                                score: 1
                            },
                            mid: {
                                detail: [],
                                winner: 'left',
                                score: 1
                            },
                            down: {
                                detail: [],
                                winner: 'left',
                                score: 1
                            },
                            pvpscore: {
                                left: 0
                            },
                            score: {
                                left: 3,
                                right: 0
                            },
                            winner: 'left'
                        },
                    }
                }).then(r => {
                    // 发送奖励通知
                    sendReward(camps[0].legion, 'win0', null);
                });
                continue;
            }
            // 明确左右双方的 军团id
            const outReport = {_legion_: {left: camps[0].legion, right: camps[1].legion}};
            const scoreObj = {
                left: 0,
                right: 0
            };
            const RIDS = [new Set(), new Set()]; // 左右军团入驻的玩家 rid

            for (const camp of CAMPS) { // camp is top mid down
                for (let _i = 0; _i < camps.length; _i++) { // 给每个军团赋值大龙buff到每队
                    const lg = camps[_i];
                    lg.team[camp].forEach(_ => {
                        _.legionbuff = lg.specialbuff;
                        RIDS[_i] && RIDS[_i].add(_._role.rid);
                    }); // 把 军团 buff 赋值给每一队的 legionbuff
                }
                const report = await campBattle(servid, camps[0].team[camp], camps[1].team[camp], outReport._legion_);
                outReport[camp] = report; // 各路分数明细
                if (report.winner) {
                    scoreObj[report.winner] += report.score;
                }
            }
            const _legion_ = outReport._legion_;
            // 总分数对比
            outReport.score = scoreObj;
            if (scoreObj.left === scoreObj.right) {
                outReport.winner = ''; // 平局
                sendReward(_legion_.left, 'draw', [...RIDS[0]]);
                sendReward(_legion_.right, 'draw', [...RIDS[1]]);

            } else {
                outReport.winner = scoreObj.left > scoreObj.right ? 'left' : 'right';
                sendReward(_legion_.left, outReport.winner === 'left' ? 'win' : 'lose', [...RIDS[0]]);
                sendReward(_legion_.right, outReport.winner === 'left' ? 'lose' : 'win', [...RIDS[1]]);
            }
            // 异步更新数据

            const winnerLegion = _legion_[outReport.winner]; // 得到胜利者的 军团ID
            // 胜点差
            const POINT_DIFF = Math.abs(scoreObj.left - scoreObj.right);


            global.dao.legion.find({_id: {$in: Object.values(_legion_).map(lid => ObjectId(lid))}}, {
                pvpscore: 1,
                _id: 1,
                legion: 1
            }).limit(2).then(legioninfos => {
                return Promise.all(legioninfos.map(lg => {
                    // 得到对手，方便计算积分差
                    const opponent = legioninfos.find(l => l._id !== lg._id) || {pvpscore: 1000}; // 对手如果解散了军团，按默认1000分的基数基数
                    const SCORE_DIFF = lg.pvpscore - opponent.pvpscore;
                    // POINT_DIFF
                    let addScore = 0
                    if (!winnerLegion) { // 平局
                        addScore = SETTLEMENT.drawSettle(SCORE_DIFF, lg.pvpscore, POINT_DIFF);
                    } else if ((lg._id + '') === winnerLegion) { // 胜利者
                        addScore = SETTLEMENT.winnerSettle(SCORE_DIFF, lg.pvpscore, POINT_DIFF);
                    } else { //失败者
                        addScore = SETTLEMENT.loserSettle(SCORE_DIFF, lg.pvpscore, POINT_DIFF);
                    }
                    let changeScore = Math.floor(addScore) || 1;
                    const ltype = (lg._id + '') === _legion_.left ? 'left' : 'right';
                    outReport.pvpscore = outReport.pvpscore || {};
                    if ((lg.pvpscore + changeScore) < 0) { // 最后积分不能为负数，最低为0
                        changeScore = -lg.pvpscore;
                    }
                    outReport.pvpscore[ltype] = changeScore; // 记录得分明细

                    return global.dao.legion.updateOne({_id: lg._id}, {$inc: {pvpscore: changeScore}});
                }));
            }).then(_ => {
                return global.dao.legionpvp.updateOne({legion: _legion_.left, pvpDate}, {
                    $set: {
                        report: outReport,
                    }
                })
            }).then(_ => {

                console.log('FINISH ONE LEGION', _legion_.left, _legion_.right, _);
            }).catch(e => {
                console.error('FINISH ONE LEGION, BUT ERROR', _legion_.left, _legion_.right, e);
            });
        }
    }
    const doing = [];

    for (let servid of Object.keys(legionGroupByServid)) {

        if (isNaN(servid)) {
            continue;
        }
        console.log('START DOING', servid, legionGroupByServid[servid]);
        doing.push(battle(servid, legionGroupByServid[servid]).then(console.log.bind(null, 'FINISHED FOR', servid))
            .catch(console.error.bind(null, 'FINISHED ERROR', servid)));
        if (doing.length >= MAX_DOING) {
            await Promise.all(doing);
            doing.splice(0, doing.length);
        }
    }
    if (doing.length > 0) {
        await Promise.all(doing);
    }

    if(info) {
        // 打单独某一场 ，不执行清理逻辑
        return ;
    }
    // 刷新全服野区
    await global.dao.lwmboss.deleteMany({});
    await global.dao.lwmob.deleteMany({});
    await global.dao.role.updateMany({}, { // 清空布阵
        $unset: {
            'battlearr.legionpvp1.camp': 1,
            'battlearr.legionpvp2.camp': 1
        }
    }).then(_ => console.log(_));
}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}
