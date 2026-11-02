exports.name = '悬赏任务加速';
exports.type = 'I';
exports.inherit = 'role-playinfo';
exports.exec = async function (body, query, ctx) {

    const {rid, mid, type} = body;

    const AffairsModel = await this.service.game.collection('affairs');
    const opt = {rid, [`${type}.mid`]: mid};
    const r = await AffairsModel.updateOne(opt, {$set: {[`${type}.$.etime`]: Date.now()}});
    return {r, opt};
};

