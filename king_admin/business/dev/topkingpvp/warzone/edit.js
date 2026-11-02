exports.name = '开新服';
exports.type = 'I';
exports.inherit = 'topkingpvp-warzone-view';
exports.exec = async function (body, query, ctx) {

    const {servid: servids, areamark} = body;

    const model = await this.service.game.collection('topkingservergroups');
    let now = Date.now();

    const updateOne = async function(servid){
        let topserver = await model.findOne({ servid });
        if (topserver) {
            // 更新
            await model.update({servid},{$set:{areamark:areamark, update: now}});
        } else {
            // 创建
            await model.insertOne({ servid: servid, areamark: areamark, create: now, update: now })
        }
    }

    for (let server of servids) {
        // 去common服设置服务器
        await updateOne(parseInt(server));
    }

    return 'OK';
};

