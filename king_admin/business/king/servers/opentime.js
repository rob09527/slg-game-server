exports.name = '设置开服时间';
exports.type = 'I';
exports.inherit = 'servers-create';
exports.exec = async function (body, query, ctx) {

    const {start_serverid, end_serverid, start_time} = body;
    if (isNaN(start_serverid)) {
        throw '无效服务ID'
    }

    if (isNaN(end_serverid)) {
        throw '无效服务ID'
    }
    if (!start_time) {
        throw '请设置服务器开服时间'
    }

    const gameModel = await this.service.game.collection('gameservers');
    const r = await gameModel.updateMany({
        $and: [
            {servid:{$gte:+start_serverid}},
            {servid:{$lte:+end_serverid}},
        ]
    }, {
        $set: {
            start: new Date(start_time).getTime()
        }
    })
    this.remote.proxy_load_cache("gameserver");
    return r
};

