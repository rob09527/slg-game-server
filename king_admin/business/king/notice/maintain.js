exports.name = '设置维护公告';
exports.type = 'I';
exports.inherit = 'notice-create';
exports.exec = async function (body, query, ctx) {

    const {content, etime} = body;


    if (!content) {
        throw '无效 的内容'
    }
    if (!etime) {
        throw '无效 结束时间'
    }

    const  mModel = await this.service.game.collection('maintains');

    const r = await mModel.findOneAndUpdate({type: 0},{
        $set: {
            etime: new Date(etime).getTime(),
            content
        }
    }, {
        upsert: true
    })
    this.remote.proxy_load_cache("maintain");
    return r
};

