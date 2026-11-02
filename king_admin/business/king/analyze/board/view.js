exports.name = '实时数据看版';
exports.type = 'N';

exports.exec = async function (body, query, ctx) {


    const servers = await this.service.game.serversOptions(ctx.adminRole);
    if (!servers) {
        return [
            {
                _type: 'KhBoard',
            }
        ]
    }
    const  monetary_unit = config.monetary_unit || 'RMB';

    const bundles = await this.db.mongo.bundle.getBundles(ctx.adminRole);

    return [
        {
            _type: 'KhBoardList',
            servers: servers,
            show_coupon: false, // 韩国渠道增加忽略代金券订单的按钮
            show_auto: ctx.actionSet.has( 'king-analyze-board-auto'),
            channels: bundles,
            download: ctx.actionSet.has('king-analyze-board-download') &&  'king-analyze-board-download' ,
            monetary_unit: monetary_unit,
            action: 'king-analyze-board-data'
        }
    ]
};

