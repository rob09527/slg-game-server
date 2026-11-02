exports.name = '夺宝统计';
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
            title: '远征关卡',
            dataIndex: '_id',
        },
        {
            title: '未参与人数',
            dataIndex: 'un_rolecount',
        },
        {
            title: '停留人数',
            dataIndex: 'fail_count',
        },
        {
            title: '通关人数',
            dataIndex: 'finish_count',
        },
        {
            title: '通关率',
            dataIndex: 'finish_rate'
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
        action: 'king-analyze-maze-list'
    }]
};

