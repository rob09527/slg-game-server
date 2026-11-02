const ObjectId = require('mongodb').ObjectId;
exports.name = '统计数据刷新';
exports.type = 'I';
exports.inherit = 'analyze-ltvmenus';


exports.exec = async function (body, query, ctx) {

    body.date = body.ndate || Date.now();
    await this.remote.agent_shapshootflush(body.date);
    return 'OK';
};

