exports.name = '开新服';
exports.type = 'I';
exports.inherit = 'topkingpvp-warzone-view';

const assert = require('assert');
exports.exec = async function (body, query, ctx) {

    const {servid: servids, areamark} = body;
    console.log(body);
    const model = await this.service.game.collection('topkingservergroups');

    let cursor = await model.find({servid: {$in: servids}})
    const d = await cursor.toArray();
    if (d && d.length > 0) {
        let err = "exist server:"
        for (const s of d) {
            err = err + s.servid +','
        }
        assert(false, err);
    }
    let now = Date.now();

    for (let sid of servids) {
        await model.insertOne({ servid: parseInt(sid), areamark: areamark, create: now, update: now })
    }

    return 'OK';
};

