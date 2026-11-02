exports.name = '活动配置导入';
exports.type = 'I';
exports.inherit = 'activity-tran';

exports.exec = async function (body, query, ctx) {
    const {content} = body;
    let configObj;
    try {
        configObj = JSON.parse(content);
    } catch (e) {
        throw  '无效的配置文件';
    }

    if (!Array.isArray(configObj.activities)) {
        throw  '无效的配置文件';
    }

    if (!configObj.gameconfig || !configObj.gameconfig.config) {
        throw  '无效的配置文件';
    }

    const actModel = await this.service.game.collection('activities');
    for (const act of configObj.activities) {
        await actModel.updateOne({type: act.type}, {$set: act}, {upsert: true});
    }

    const cfgModel = await this.service.game.collection('gameconfigs');

    await cfgModel.findOneAndUpdate({}, {
        $set: configObj.gameconfig
    }, {
        upsert: true
    });

    await this.remote.agent_refreshActivity({}); // 刷新agent活动配置
    await this.remote.agent_refreshGameConfig({}); // 重载agent的gameconfig配置
    await this.remote.agent_retimer('zhdendclean');
    await this.remote.agent_retimer('zhdmail');


    await this.remote.refreshActivity({}); // 刷新game活动配置
    await this.remote.refreshGameConfig({}); // 重载gameconfig配置


    return "OK";
}
