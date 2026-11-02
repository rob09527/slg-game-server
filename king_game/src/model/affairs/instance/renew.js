'use strict'

const assert = require('assert');

module.exports = exports = async function (chk_right) {
    const role = await this.db.models.role.findOne({_id: this.rid});
    if (!role) return;

    this.refresh = Date.now();
    this.missions = this.missions || [];
    this.missions = this.missions.filter(function (m) {
        return m.etime || m.lock;
    });
    // @author awko 改
    // 悬赏任务等级
    const missionLevel = role.getItems(38012).count;
    // 根据等级得到当前等级的 基础内政任务上限
    const {LIMIT = 5, STAR_SOLO = [1], STAR_FRIEND = [1]} = global.gameconfig.affairs_level[missionLevel] || {};
    const vip_ex = global.gameconfig.vip.EX_AFF[role.vip];
    let total = LIMIT + vip_ex;

    let affairConfig = global.gameconfig.affairs;
    if (this.isNew) {
        // 初次激活悬赏使用固定配置任务
        for (let id of global.gameconfig.affairs_first_id) {
            let _mission_config = affairConfig.deepQueryOne('ID', id);
            assert(_mission_config, 'invalid affairfirstconf');
            this.missions.push(this.db.models.affairs.newMissionWithConfig(_mission_config))
        }
    }else{
        // 根据内政等级来过滤内政任务星级
        affairConfig = affairConfig.filter(ac => STAR_SOLO.indexOf(ac.STAR) >= 0);
        // 勤政爱民特权 逻辑修改，修改为固定增加2个内政任务，而非固定刷新一个5+内政
        role.special.qz > Date.now() && (total+=2);
        this.missions.append(this.db.models.affairs.randMissionWithNum(total, affairConfig, 0));
    }
    this.markModified('missions');

    // 处理 好友团队赏金任务的刷新逻辑 @author awko
    let friendMissionConfig = global.gameconfig.affairs_f;
    let ftotal = global.gameconfig.others.AFFAIRS.BASE_F_MISSION_NUM || 2; // 好友团队 赏金任务的 限制
    this.friendsMissions = this.friendsMissions || [];
    this.friendsMissions = this.friendsMissions.filter(function (m) {
        return m.etime || m.lock;
    });
    const historyPower = role.getProp(90185); // 历史最高战斗力
    friendMissionConfig = friendMissionConfig.filter(fm => STAR_FRIEND.indexOf(fm.STAR) >= 0 && historyPower >= fm.POWER_LIMIT);
    this.friendsMissions.append(this.db.models.affairs.randFMissionWithNum(ftotal, friendMissionConfig));
    this.markModified('friendsMissions');
    await this.save();
}
