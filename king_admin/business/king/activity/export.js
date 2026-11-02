exports.name = '活动配置导出';
exports.type = 'I';
exports.inherit = 'activity-tran';

exports.exec = async function (body, query, ctx) {

    const actModel = await this.service.game.collection('activities');
    const cfgModel = await this.service.game.collection('gameconfigs');
    const c = await actModel.find();
    const acts = await c.toArray();
    const activities = acts.map(a => {
        delete a._id
        return a;
    });
    const gameconfig = (await cfgModel.findOne()) || {};
    delete gameconfig._id
    const out = JSON.stringify({activities, gameconfig});
    ctx.set('Content-Disposition', `attachment;filename=${encodeURIComponent('act_' + new Date().format() + '.json')}`);
    ctx.set('content-type', `text/text;charset=utf-8`);
    ctx.body = out;
}
