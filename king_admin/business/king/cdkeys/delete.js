exports.name = '礼包码删除';
exports.type = 'I';
exports.inherit = 'cdkeys-create';

const {ObjectID} = require("mongodb");

exports.exec = async function (body, query, ctx) {
    let {
        _id,
    } = body;

    const cdkeyModel = await this.service.game.collection('cdkeys');
    const r = await cdkeyModel.deleteOne({_id: ObjectID(_id)});
    return r;
};

