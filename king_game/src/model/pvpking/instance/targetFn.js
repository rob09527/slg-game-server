'use strict'

const {
    HIDE_RATE,
    STAGE_TEAMLEN,
} = global.gameconfig.others.PVPKING;

// 匹配
module.exports = exports = async function (groupmark, force) {
    let {
        target,
        finish,
    } = this;
    // 强制刷新 or 目标不存在(第一请求) or 目标已挑战
    if (force || !target || finish) {
        // 确定是否隐藏目标
        this.hide = Math.rand.hit(HIDE_RATE);
        if (!this.kingpvp || this.kingpvp.promotion || (this.kingpvp.l0 < 5 && this.kingpvp.star >= 4)) this.hide = false;
        // 整理需要排除的玩家,先排除自己
        let $nin = [this._id.toString()];
        // 过滤已匹配的玩家
        for (let [rid, index] of Object.entries(this.record)) {
            // 过滤机器人
            if (rid.startsWith('robot')) continue;
            // 5次匹配内不再匹配已匹配过的玩家
            if (this.snum > index + 5) continue;
            $nin.push(rid);
        }
        // 过滤已挑战的玩家
        for (let [rid, index] of Object.entries(this.brecord)) {
            // 过滤机器人
            if (rid.startsWith('robot')) continue;
            // 5次战斗内不再匹配已挑战过的玩家
            if (this.cnum > index + 5) continue;
            $nin.push(rid);
        }
        // 过滤去重
        $nin = Array.from(new Set($nin));


        // 获取同组服务器编号
        const list = await global.dao.kinggroup.find({groupmark: groupmark});
        let $in =  list.map(({servid}) => servid);
        // 根绝自身段位需要的队伍数量获取需要匹配的段位集合
        let l0_in = [];
        let battleset_len = 1;
        if (this.kingpvp) battleset_len = STAGE_TEAMLEN[this.kingpvp.l0];
        STAGE_TEAMLEN.forEach((num, index) => {
            if (battleset_len === num) l0_in.push(index);
        })
        let cond = {
            // 只选择同组玩家
            servid: {$in},
            // 排除已匹配/挑战玩家
            _id: {$nin},
            // 已定级
            kingpvp: {$exists: 1},
            // 匹配指定段位
            'kingpvp.l0': {
                $in: l0_in,
            },
        }
        let targets = [];
        if (!this.kingpvp) {	// 定位赛
            // 匹配低于或等于白银对手
            cond['kingpvp.l0'] = {
                $lte: 1,
            };
            targets = await global.dao.pvpking.find(cond);
            // 匹配机器人
            if (targets.length < 1) {
                // 仅匹配只有1队的机器人
                targets = global.gameconfig.robotkingpvp
                    .filter(robot => robot.TEAMLEN === 1)
                    .deepMap('ID')
                    .map(num => ({_id: 'robot_' + num}));
            }
            // 设置权重
            targets = targets.map(({_id}) => ({rid: _id.toString(), W: 100}));
        } else {
            // 晋级赛只能匹配到同段位
            if (this.promotion) {
                let {l0, l1} = this.kingpvp;
                cond['kingpvp.l0'] = l0;
                cond['kingpvp.l1'] = l1;
            }
            let tmp = await global.dao.pvpking.find(cond);
            tmp = tmp.map(({_id}) => {
                return {rid: _id.toString(), 'W': 100};
            })
            targets.append(tmp);
            let {l0} = this.kingpvp;
            // 钻石上大师的晋级赛不能匹配机器人
            if (targets.length < 1 && !(l0 === 4 && this.kingpvp.promotion)) {	// 匹配机器人
                targets = global.gameconfig.robotkingpvp
                    // 过滤相同段位的机器人
                    .filter(({L0}) => l0 === L0)
                    .deepMap('ID')
                    .map(num => ({rid: 'robot_' + num, W: 100}));
                assert(targets, 'no robot');
            }
        }
        assert(targets.length > 0, 'no targets');
        // 随机一个目标
        let rates = targets.deepMap('W');
        let target = targets[Math.rand.inweight(rates)].rid;
        this.target = target;
        // 重置挑战完成状态
        this.finish = undefined;
        // 记录已匹配玩家
        this.record[target] = this.snum;
        this.markModified('record');
        this.snum++;
        await this.save();
    }
    const tmp = {
        hide: this.hide ? 1 : 0,
        rid: this.target,
    }
    if (!this.target.startsWith('robot')) {
        // 仅返回uid,servid让游戏服自行请求proxy获取其他信息
        let target = await global.dao.pvpking.findOne({_id: this.target});
        assert(target, 'invalid target');
        if (target.kingpvp) {
            tmp.star = target.kingpvp.star;
            tmp.stage = await target.stage();
        }
        tmp.uid = target.uid;
        tmp.servid = target.servid;
    }
    return tmp;
}
