const ObjectId = require("mongodb").ObjectId;
exports.name = '推荐礼包重新激活';
exports.type = 'N';
exports.inherit = 'mail-view';

exports.exec = async function (body, query, ctx) {

    const {_id} = body;



    const giftModel = await this.service.game.collection('c_recommp_gifts');
    const r = await giftModel.updateOne({_id: ObjectId(_id)}, {
        $set: {
            expireAt: Date.now() + 12 * 3600 * 1000
        }
    })

    return r;
};

