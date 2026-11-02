exports.name = '通天塔排行';
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
            title: '排名',
            dataIndex: 'rank',
        },
        {
            title: '区服',
            dataIndex: 'servid',
        },
        {
            title: 'UID',
            dataIndex: 'uid',
        },
        {
            title: '角色',
            dataIndex: 'rname',
        },
        {
            title: '战斗力',
            dataIndex: '_power',
        },
        {
            title: '层数',
            dataIndex: 'tower',
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
        action: 'king-analyze-towerrank-list'
    }]
};

