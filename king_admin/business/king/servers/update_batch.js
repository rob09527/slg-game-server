exports.name = '编辑服务器批量';
exports.type = 'I';
exports.inherit = 'servers-update';
exports.exec = async function (body, query, ctx) {

    const {servid, filter} = body;


    const servidOpt = Array.isArray(servid) ? {$in: servid.map(Number)} : +servid;

    let filter_info;
    if (!Array.isArray(filter)) {
        filter_info = filter ? [filter] : [];
    } else {
        filter_info = filter;
    }

    const gameModel = await this.service.game.collection('gameservers');
    const r = await gameModel.updateMany({
        servid: servidOpt,
    }, {
        $set: {
            'info.filter': filter_info
        }
    });
    return r
};

