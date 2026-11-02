const {
    ObjectID,
} = require("mongodb");

exports.name = '邮件删除';
exports.type = 'I';
exports.inherit = 'mail-view';
exports.exec = async function (body, query, ctx) {
    let {
        _id,
    } = body;
    let mailTable = await this.service.game.collection('mails');
    let ret = await mailTable.deleteOne({_id: ObjectID(_id)});
    return ret;
}
