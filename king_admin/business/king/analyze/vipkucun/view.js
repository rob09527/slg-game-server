exports.name = 'VIP库存';
exports.type = 'N';

exports.exec = async function (body, query, ctx) {

    const servers = await this.service.game.serversOptions(ctx.adminRole);
    const bundles = await this.db.mongo.bundle.getBundles(ctx.adminRole);

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
        }
    ];

    const columns = [
        {
            title: 'VIP',
            dataIndex: '_id',
        },
        {
            title: '角色数',
            dataIndex: 'count',
        },
        {
            title: '铜钱',
            dataIndex: 'gsid_38006',
        },
        {
            title: '元宝',
            dataIndex: 'gsid_38005',
        },
        {
            title: '进阶石',
            dataIndex: 'gsid_30015',
        },
        {
            title: '武将经验',
            dataIndex: 'gsid_30001',
        },
        {
            title: '点将令',
            dataIndex: 'gsid_30011',
        },
        {
            title: '神符',
            dataIndex: 'gsid_30008',
        },
        {
            title: '高级神符',
            dataIndex: 'gsid_30009',
        },
        {
            title: '坐骑丹',
            dataIndex: 'gsid_30026',
        },
        {
            title: '高级招募令',
            dataIndex: 'gsid_30006',
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
        action: 'king-analyze-vipkucun-list'
    }]
};

