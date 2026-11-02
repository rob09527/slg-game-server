exports.name = '计费点分布';
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
            options: [ 'ALL' , ...servers]
        },
        {
            key: 'bundle',
            name: '包名',
            type: 'select',
            mode: "multiple",
            showSearch: true,
            style: {minWidth: 230},
            _tooltip: '可以长按选项试试效果',
            options: bundles
        },
        {
            key: 'date',
            type: 'date',
            name: '下单日期',
            pickerType: 'RangePicker'
        }
    ];

    const columns = [
        {
            title: '商品',
            dataIndex: '_id',
        },
        {
            title: '商品名',
            dataIndex: 'pname',
        },
        {
            title: '购买次数',
            dataIndex: 'times',
            sorter: true
        },
        {
            title: '金额',
            dataIndex: 'price',
            sorter: true
        },
        {
            title: '购买占比',
            dataIndex: 'timeRate',
        },
        {
            title: '金额占比',
            dataIndex: 'payRate'
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
        action: 'king-analyze-jifeidian-list'
    }]
};

