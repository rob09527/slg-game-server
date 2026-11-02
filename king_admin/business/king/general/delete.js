exports.name = '角色武将删除';
exports.type = 'N';
exports.inherit = 'general-view';

const {ObjectID} = require("mongodb");

exports.exec = async function (body, query, ctx) {
    const generals = await this.service.game.collection('generals');
    if (!body.rid || !body._id) {
        throw "MISS UID"
    }
    // 删除逻辑
    const r = await generals.deleteOne({_id: ObjectID(body._id)});
    return r;
};

