const {ObjectID} = require("mongodb");
exports.name = '礼包码停用与恢复';
exports.type = 'N';
exports.exec = async function (body, query, ctx) {

    const {rowData, status} = body;

    const cdkeyModel = await this.service.game.collection('cdkeys');
    const r = await cdkeyModel.updateOne({_id: ObjectID(rowData._id)}, {$set: {pause: !status}});
    return r;
};

