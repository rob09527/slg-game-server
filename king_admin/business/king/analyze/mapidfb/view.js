exports.name = '关卡分布';
exports.type = 'N';

exports.exec = async function (body, query, ctx) {

    const servers = await this.service.game.serversOptions(ctx.adminRole);
    const bundles = await this.db.mongo.bundle.getBundles(ctx.adminRole);
    const gameConfig = this.service.game.config;
    const vipExp = gameConfig.vip.EXP;
    const filter = [
        {
            key: 'servid',
            name: '服务器',
            type: 'select',
            showSearch: true,
            style: {minWidth: 180},
            options: ['ALL', ...servers]
        },
        {
            key: 'bundle',
            name: '包名',
            type: 'select',
            mode: "multiple",
            style: {minWidth: 230},
            _tooltip: '可以长按选项试试效果',
            options: [...bundles]
        },
        {
            key: 'create',
            type: 'date',
            name: '创角日期',
            pickerType: 'RangePicker'
        },
        {
            key: 'update',
            type: 'date',
            name: '最后登录日期',
            pickerType: 'RangePicker'
        },
        {
            key: 'vip_filter',
            name: 'VIP',
            type: 'select',
            style: {minWidth: 120},
            options: [{name: '全部', value: 'ALL'}, ...vipExp.map((e, i) => {
                return {
                    name: i === 0 ? '拥有vip经验' : `vip${i}以上`,
                    value: i === 0 ? 1 : e
                }
            })]
        }
    ];

    const columns = [
        {
            title: '关卡ID',
            dataIndex: '_id',
        },
        {
            title: '角色数',
            dataIndex: 'count',
        }
    ];
    //

    return [{
        _type: 'AkTable',
        filter,
        filter_history: true,
        size: 'small',
        limit: 15,
        download: true,
        columns,
        action: 'king-analyze-vipfb-list?type=maxmapid'
    }]
};

