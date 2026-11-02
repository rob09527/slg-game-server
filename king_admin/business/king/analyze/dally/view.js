exports.name = '运营日报';
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
            mode: "multiple",
            options: [...servers]
        },
        {
            key: 'bundle',
            name: '包名',
            type: 'select',
            mode: "multiple",
            showSearch: true,
            style: {minWidth: 230},
            _tooltip: '可以长按选项试试效果',
            options: [ ...bundles]
        },
        {
            key: 'create_at',
            type: 'date',
            name: '分析日期',
            pickerType: 'RangePicker'
        }
    ];

    // 去掉了所有的 单元格跳转 （ 因为两边过滤器不一致了，这不的channel 和 platform 是多个整合的
    const columns = [
        {
            title: '服务器',
            dataIndex: 'servid'
        },
        {
            title: '包名',
            dataIndex: 'bundle'
        },
        {
            title: '统计时间',
            dataIndex: 'create_at',
            sorter: true
        },
        {
            title: '注册数',
            dataIndex: 'registerCount',
            sorter: true,
            // _to: '/home/'+this.channel_group+'-role-view#serverid=${servid}&platform=${platform}&channel=${channel}&create=${create_at},${create_at}'
        }
        ,
        {
            title: '滚服注册数',
            dataIndex: 'rollRegister',
            sorter: true,
        },
        {
            title: '活跃数',
            dataIndex: 'activeCount',
            sorter: true,
            // _to: '/home/'+ this.channel_group +'-role-view#serverid=${servid}&platform=${platform}&channel=${channel}&activeDate=${create_at}'
        },
        {
            title: '付费数',
            dataIndex: 'payCount',
            sorter: true,
            // _to: '/home/'+ this.channel_group +'-order-view#ignore=true&serverid=${servid}&platform=${platform}&channel=${channel}&create=${create_at},${create_at}'
        },
        {
            title: '付费金额',
            dataIndex: 'payTotal',
            sorter: true,
            // _to: '/home/' + this.channel_group + '-order-view#ignore=true&serverid=${servid}&platform=${platform}&channel=${channel}&create=${create_at},${create_at}'
        },
        {
            title: '滚服付款数',
            dataIndex: 'rollPayCount',
            sorter: true,
        },
        {
            title: '滚服金额',
            dataIndex: 'rollPayTotal',
            sorter: true,
        },
        {
            title: '活跃付费率',
            dataIndex: 'activePayRate'
        },
        {
            title: '付费ARPPU',
            dataIndex: 'arppu'
        },
        {
            title: '活跃ARPU',
            dataIndex: 'arpu'
        },
        {
            title: '注册付费数',
            dataIndex: 'registerPayCount'
        },
        {
            title: '注册付费总额',
            dataIndex: 'registerPayTotal'
        },
        {
            title: '注册付费率',
            dataIndex: 'registerPayRate'
        },
        {
            title: '注册付费ARPPU',
            dataIndex: 'registerPayArppu'
        },
        {
            title: '注册ARPU',
            dataIndex: 'registerArppu'
        }
    ];
    //


    return {
            _type: 'AkTable',
            buttons: [],
            filter,
            filter_history: true,
            size: 'small',
            limit: 15,
            download: true,
            columns,
            action: 'king-analyze-dally-list'
        }
};

