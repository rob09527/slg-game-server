exports.name = '设置开服公告';
exports.type = 'I';
exports.inherit = 'notice-create';
exports.exec = async function (body, query, ctx) {

    const {content} = body;

    if (!content) {
        throw '无效 的内容'
    }

    const  mModel = await this.service.game.collection('maintains');

    const r = await mModel.findOneAndUpdate({type:1},{
        $set: {
            content
        }
    }, {
        upsert: true
    })
    this.remote.proxy_load_cache("maintain");
    return r
};

