exports.name = '角色封地';
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
            title: '区服',
            dataIndex: 'servid',
        },
        {
            title: 'UID',
            dataIndex: 'uid',
        },
        {
            title: '角色名',
            dataIndex: 'rname',
        },
        {
            title: 'vip',
            dataIndex: 'vip',
        },
        {
            title: '府邸',
            dataIndex: 'BUILDING_1',
            sorter: true
        },
        {
            title: '农田',
            dataIndex: 'BUILDING_2',
            sorter: true
        },
        {
            title: '金矿',
            dataIndex: 'BUILDING_3',
            sorter: true
        },
        {
            title: '马厩',
            dataIndex: 'BUILDING_4',
            sorter: true
        },
        {
            title: '铜矿',
            dataIndex: 'BUILDING_5',
            sorter: true
        },
        {
            title: '靶场',
            dataIndex: 'BUILDING_6',
            sorter: true
        },
        {
            title: '军械库',
            dataIndex: 'BUILDING_7',
            sorter: true
        },
        {
            title: '左兵营',
            dataIndex: 'BUILDING_8',
            sorter: true
        },
        {
            title: '内府',
            dataIndex: 'BUILDING_9',
            sorter: true
        },
        {
            title: '右兵营',
            dataIndex: 'BUILDING_10',
            sorter: true
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
        action: 'king-analyze-rbuild-list'
    }]
};

