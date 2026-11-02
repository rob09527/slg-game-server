"use strict";

// 卧龙战令激活
module.exports = async function (role) {
    const { OPEN = 0 } = global.gameconfig.warorder;
    if(OPEN == 0) return;
    const rid = role.i();
    const one = await this.findOne({ rid }, { _id: 1 });
    if (one) return;
    // 领取完14日签到所有奖励后立即激活战令
    if (this.isNotActive(role)) return;
    const data = this.data(rid);
    if(!data) return;
    await this.create(data);
}