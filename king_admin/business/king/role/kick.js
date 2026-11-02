exports.name = '踢下线';
exports.type = 'N';

exports.exec = async function (body, query, ctx) {

    const {uid, servid, rid} = body;

    const tokenModel = await this.service.game.collection('tokens');
    const r = await tokenModel.updateOne({uid, servid: +servid}, {$set: {update: -1}});
    await this.remote.closeClient(rid, null, 4102, 'gm kick'); //

    return r;
};

