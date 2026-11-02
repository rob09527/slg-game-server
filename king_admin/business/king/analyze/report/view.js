exports.name = '运营报告';
exports.type = 'N';

exports.exec = async function (body, query, ctx) {


    const bundles = await this.db.mongo.bundle.getBundles(ctx.adminRole);
    const filter = [
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
            name: '分析日期',
            pickerType: 'RangePicker'
        }
    ];

    const columns = [
        {
            title: '时间',
            dataIndex: 'date',
        },
        {
            title: '注册账号数',
            dataIndex: 'registerCount',
        },
        {
            title: '注册角色数',
            dataIndex: 'registerRoleCount',
        },
        {
            title: '活跃数',
            dataIndex: 'activeCount',
        },
        {
            title: '当日流水',
            dataIndex: 'payTotal',
        },
        {
            title: '付费角色数',
            dataIndex: 'payCount'
        },
        {
            title: '付费率',
            dataIndex: 'payRate'
        },
        {
            title: '活跃ARPU',
            dataIndex: 'activeArpu'
        },
        {
            title: '付费ARPU',
            dataIndex: 'payArpu'
        },
        {
            title: '最终账号LTV',
            dataIndex: 'ltvlast',
        },
        {
            title: '当日LTV',
            dataIndex: 'ltv0',
        },
        {
            title: '当日注册付费率',
            dataIndex: 'registerPayRate0',
        },
        {
            title: '次日LTV',
            dataIndex: 'ltv2',
        },
        {
            title: '次日留存',
            dataIndex: 'activeRate2',
        },
        {
            title: '3日LTV',
            dataIndex: 'ltv3',
        },
        {
            title: '3日留存',
            dataIndex: 'activeRate3',
        },
        {
            title: '7日LTV',
            dataIndex: 'ltv7',
        },
        {
            title: '7日留存',
            dataIndex: 'activeRate7',
        },
        {
            title: '14日LTV',
            dataIndex: 'ltv14',
        },
        {
            title: '14日留存',
            dataIndex: 'activeRate14',
        },
        {
            title: '21日LTV',
            dataIndex: 'ltv21',
        },
        {
            title: '21日留存',
            dataIndex: 'activeRate21',
        },

        {
            title: '30日LTV',
            dataIndex: 'ltv30',
        },
        {
            title: '30日留存',
            dataIndex: 'activeRate30',
        },

        {
            title: '60日LTV',
            dataIndex: 'ltv60',
        },
        {
            title: '60日留存',
            dataIndex: 'activeRate60',
        },

        {
            title: '90日LTV',
            dataIndex: 'ltv90',
        },
        {
            title: '90日留存',
            dataIndex: 'activeRate90',
        },
    ];
    //

    return [{
        _type: 'AkTable',
        buttons: [
            {
                children: '刷新当日',
                action:  'king-analyze-ltv-flush',
                confirm: '刷新当日数据可能需要1分钟左右完成,访问超时也属于正常现象,超时报错您可以在5分钟后回来观察数据即可!',
                _tooltip: '刷新当日'
            }
        ],
        filter,
        filter_history: true,
        size: 'small',
        limit: 15,
        download: true,
        columns,
        action: 'king-analyze-report-list'
    }]
};

