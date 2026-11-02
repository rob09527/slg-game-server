'use strict'

const {
    DINGJI_SCORE,
    WIN_STREAK = 2
} = global.gameconfig.others.PVPKING;

/**
 * @param params {{     result: string, video: string, version: string, mark: string, rid: string,}}
 * @type {(function(*): Promise<{}>)|*}
 */
module.exports = exports = async function (params) {
    const tmp = {};
    if (this.hide) tmp.hide = 1;
    let {
        result,
        video,
        version,
        mark,
        rid,
    } = params;
    // 星数量变化
    let schange = 0;
    let {
        kpdj = [],
    } = this;
    if (result === 'win') {
        this.win_streak = this.win_streak || 0;
        this.win_streak++; // 连胜次数增加
    } else { // 连胜断开
        this.win_streak = 0;
    }
    // 王者信息更新时间
    const kingUpdate = Date.now();
    if (kpdj.length < 5) {	// 定位赛未完成
        kpdj.push(result === 'win' ? 1 : 0);
        this.kpdj = kpdj;
        this.markModified('kpdj');
        // 返回定级赛状态
        tmp.locate = kpdj.map(r => {
            return r ? 'win' : 'lost';
        })
        // 已完成5场定位赛
        if (kpdj.length >= 5) {
            let win_times = kpdj.reduce(function (t, win) {
                t += win;
                return t;
            }, 0)
            // 根据胜利场次获得对应段位
            let [l0, l1] = DINGJI_SCORE[win_times];
            let config = global.gameconfig.pvpkingrank[l0][l1];
            // 定级赛后初始化kingpvp信息
            this.kingpvp = {
                hstage: config.ID,
                l0,
                l1,
                star: 0,
                update: kingUpdate,
            };
        }
    } else if (this.kingpvp.promotion) {	// 正在打晋级赛
        let {
            promotion
        } = this.kingpvp;
        promotion.push(result === 'win' ? 1 : 0);
        this.markModified('kingpvp.promotion');
        // 返回晋级赛状态
        tmp.promotion = promotion.map(r => {
            return r ? 'win' : 'lost';
        })
        // 检查胜利场次是否已经足够
        let {
            l0,
            l1,
            star,
        } = this.kingpvp;
        let config = global.gameconfig.pvpkingrank[l0][l1];
        assert(config && config.LVUP, 'invalid stage');
        let {
            // 总场次
            AMOUNT,
            // 晋级需要的胜利场次
            WIN,

        } = config.LVUP;
        if (promotion.length >= WIN) {
            let win_times = promotion.reduce(function (t, win) {
                t += win;
                return t;
            }, 0)
            // 胜利场次足够
            if (win_times >= WIN) {
                // 移除晋级赛字段
                this.kingpvp.promotion = undefined;
                this.kingpvp.l0++;
                this.kingpvp.l1 = 0;
                this.kingpvp.star = 0;
                this.kingpvp.update = kingUpdate;
                this.markModified('kingpvp');
            }
            // 失败场次足够(晋级失败,例:5场3剩中输掉3场,直接失败)
            if (promotion.length - win_times >= WIN) {
                schange = -3;
                this.kingpvp.promotion = undefined;
                this.kingpvp.star += schange;
                this.kingpvp.update = kingUpdate;
                this.markModified('kingpvp');
            }
        }
    } else {
        // 计算获得星星(输扣一颗,赢获得1颗)
        schange = result === 'win' ? 1 : -1;
        let {
            kingpvp,
            win_streak
        } = this;
        // 钻石段位以下每获得连胜则多加一颗星
        if (kingpvp.l0 < 4 && win_streak >= 3) { // 3连胜增加2星
            schange = WIN_STREAK;
        }
        kingpvp.star += schange;
        // 检查是否需要掉等级
        if (kingpvp.star < 0) {
            if (kingpvp.l1 > 0) {	// 掉等级
                kingpvp.l1--;
                kingpvp.star += 5;
            } else {	// 掉等级不掉段位
                kingpvp.star = 0;
            }
        }
        // 段位小于大师,星星5+需要晋级
        if (kingpvp.l0 < 5 && kingpvp.star >= 5) {
            let {
                l0,
                l1,
            } = this.kingpvp;
            let config = global.gameconfig.pvpkingrank[l0][l1];
            // 检查当前等级是否需要晋级
            if (config.LVUP) {
                kingpvp.promotion = [];
            } else {
                kingpvp.star = kingpvp.star - 5;
                kingpvp.l1++;
            }
        }
        this.kingpvp.update = kingUpdate;
        this.markModified('kingpvp');
    }
    tmp.schange = schange;
    tmp.kpdj = this.kpdj;
    tmp.kingpvp = this.kingpvp;
    // 本次挑战排名更新,存入redis
    // score: l0 * 100 + l1*10 + start
    // 查自己的跨服组id
    if (tmp.kingpvp && tmp.kingpvp.update === kingUpdate) {
        let mygroupid = await global.dao.kinggroup.findOne({servid: this.servid});
        let rankService = new global.services.RankService('pvpstage',mygroupid.groupmark);
        await rankService.set({
            id: this.rid,
            score: tmp.kingpvp.l0 *100+ tmp.kingpvp.l1 * 10 + tmp.kingpvp.star
        });
    }


    // 返回段位编号(若大师段判断是否王者)
    tmp.stage = await this.stage();
    // 更新连胜次数
    tmp.win_streak = this.win_streak;
    // 标记目标已挑战
    this.finish = Date.now();
    // 重置匹配记录
    this.snum = 0;
    this.record = undefined;
    this.markModified('record');
    // 已挑战对象记录
    this.brecord[this.target] = this.cnum;
    this.markModified('brecord');
    // 挑战次数增加
    this.cnum++;
    await this.save();
    // 机器人不需要处理接下来的逻辑
    if (rid.startsWith('robot')) return tmp;
    let target = await global.dao.pvpking.findOne({_id: this.target});
    if (!target) return tmp;
    // 被挑战者不扣星星
    // 只有大师段被打掉星星
    if (schange > 0 && target.kingpvp.l0 >= 5) {
        schange = -1;
        target.kingpvp.star += schange;
        target.kingpvp.star = Math.max(target.kingpvp.star, 0);
        target.kingpvp.update = kingUpdate;
        target.markModified('kingpvp');

        // 对手的排名入redis
        let target_groupid = await global.dao.kinggroup.findOne({servid: target.servid});
        let t_rankService = new global.services.RankService('pvpstage',target_groupid.groupmark);
        await t_rankService.set({
            id: target.rid,
            score: target.kingpvp.l0 * 100 + target.kingpvp.l1 * 10 + target.kingpvp.star
        });

        await target.save();
    } else {
        schange = 0;
    }
    // 查对手的跨服组id

    let stage = await target.stage();
    let {
        rname,
        power,
        level,
        iconid,
        frameid,
    } = mark;
    mark = [
        result === 'win' ? 'lose' : 'win',	// 结果取反
        schange,
        stage,
        target.kingpvp.star,
        'postive',
        rname,
        power,
        level,
        iconid,
        frameid,
    ].join('.');

    const videoData = {
        uid: target.uid,
        sid: target.servid,
        type: 'pvpking',
        video,
        version,
        mark,
    }
    if (typeof videoData.video !== 'string') videoData.video = JSON.stringify(videoData.video);
    videoData.rid = target.rid;
    // 异步保存录像
    global.dao.video.create(videoData).catch(console.error);
    return tmp;
}
