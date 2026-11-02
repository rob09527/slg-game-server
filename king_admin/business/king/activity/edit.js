exports.name = '活动编辑';
exports.type = 'N';

exports.exec = async function (body, query, ctx) {
    const { _id, ...data} = body;

    if (data.start && isNaN(data.start)) {
        data.start = this.parseDate(data.start);
    }
    if (data.etime && isNaN(data.etime)) {
        data.etime = this.parseDate(data.etime);
    }
    data.type = data.type.toUpperCase();
    data.roleday = data.roleday && +data.roleday;
    data.offtime = data.offtime && +data.offtime;
    data.duration = data.duration && +data.duration;
    const actModel = await this.service.game.collection('activities');
    const r = await actModel.updateOne({type: data.type}, {$set: data});

    await this.remote.agent_refreshActivity({}); // 刷新agent活动配置
    await this.remote.agent_retimer('zhdendclean');
    await this.remote.agent_retimer('zhdmail');
    await this.remote.refreshActivity({}); // 刷新game活动配置

    return r;
}
