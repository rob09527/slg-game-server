exports.name = '越南礼包码增删管理';
exports.type = 'N';

exports.exec = async function (body, query, ctx) {
    const websaleconfigs = await this.service.game.collection('websaleconfigs');
    const r = await websaleconfigs.updateOne({
        packageid: body.packageid
    }, {
        $set: {
            state: body.state,
            notify: {
                state: 1,
                message: 'init',
                update: Date.now()
            }
        }
    });
    return r;

};

