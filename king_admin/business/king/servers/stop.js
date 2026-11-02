exports.name = '开停服';
exports.type = 'N';
exports.exec = async function (body, query, ctx) {

    const {rowData = {}, status} = body;

    const servid = rowData.servid || body.servid;

    const gameModel = await this.service.game.collection('gameservers');
    const servidOpt = Array.isArray(servid) ? {$in: servid.map(Number)} : +servid
    const r = await gameModel.updateMany({
        servid: servidOpt,
    }, {
        $set: {
            status: status ? 1 : 0
        }
    })
    this.remote.proxy_load_cache("gameserver");
    if (!status) {
        const tokenModel = await this.service.game.collection('tokens');
        await tokenModel.deleteMany({servid: servidOpt});

        // 停服踢用户下线
        this.remote.closeClientByServid(servid, 4104, 'maintain');
    }
    return r
};

