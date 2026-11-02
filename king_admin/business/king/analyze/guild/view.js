exports.name = '新手引导流失';
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
            key: 'date',
            type: 'date',
            name: '注册日',
            pickerType: 'RangePicker',
            _tooltip: '默认最近7天'
        }
    ];


    const columns = [
        {
            title: '引导ID',
            dataIndex: '_id',
            sorter: true
        },
        {
            title: '引导',
            dataIndex: 'desc'
        },
        {
            title: '人数',
            dataIndex: 'count',
            sorter: true
        }
    ];


    return {
        _type: 'AkTable',
        filter,
        filter_history: true,
        size: 'small',
        ayzKey: query.id,
        limit: 15,
        download: true,
        columns,
        action: 'king-analyze-guild-list'
    }
};

