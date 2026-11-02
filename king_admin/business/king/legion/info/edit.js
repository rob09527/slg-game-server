const {ObjectId} = require("mongodb");
exports.name = '军团编辑';
exports.type = 'N';

exports.exec = async function (body, query, ctx) {

    const {_id, name, ceo, notice} = body;


    const legions = await this.service.game.collection('legions');
    const legion = await legions.findOne({_id: ObjectId(_id)});
    if (!legion) {
        throw '无效军团'
    }

    let old_ceo;

    for (const mem of legion._members) {
        if (mem.pos === 2) {
            old_ceo = mem;
            mem.pos = 0;
        }
        if (mem.rid === ceo) {
            mem.pos = 2;
        }
    }
    const $set = {};
    if (!old_ceo || old_ceo.rid !== ceo) {
        $set._members = [...legion._members];
    }
    $set.name = name;
    $set.notice = notice;
    const r = await legions.updateOne({_id: legion._id, __v: legion.__v}, {$set});
    return r;
};

