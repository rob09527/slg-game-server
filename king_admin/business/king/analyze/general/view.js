exports.name = '武将分布';
exports.type = 'N';

exports.exec = async function (body, query, ctx) {

    const servers = await this.service.game.serversOptions(ctx.adminRole);
    const bundles = await this.db.mongo.bundle.getBundles(ctx.adminRole);

    const filter = [
        {
            key: 'servid',
            name: '区服',
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
    const showVip = [3, 15];
    const columns = [
        {
            title: '武将名',
            dataIndex: 'gname',
        },
    ];

    for (let i = showVip[0]; i <= showVip[1]; i++) {
        columns.push({
            title: 'vip' + i,
            dataIndex: 'vip' + i,
        })
    }
    //

    return [{
        _type: 'AkTable',
        filter,
        filter_history: true,
        size: 'small',
        limit: 15,
        download: true,
        columns,
        action: 'king-analyze-general-list'
    }]
};

