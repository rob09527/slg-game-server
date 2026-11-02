exports.name = '分时看板';
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
            options: [   ...bundles]
        },
        {
            key: 'platform',
            name: '设备',
            type: 'select',
            style: {minWidth: 180},
            options: [ 'ALL' , 'android', 'ios', 'h5', 'wechatgame']
        },
        {
            key: 'date',
            type: 'date',
            name: '分析日期'
        }
    ];


    // 去掉了所有的 单元格跳转 （ 因为两边过滤器不一致了，这不的channel 和 platform 是多个整合的
    const columns = [
        {
            title: '时间',
            dataIndex: '_id'
        },
        {
            title: '注册数',
            dataIndex: 'registerCount',
        }
        ,
        {
            title: '活跃数',
            dataIndex: 'activeCount'
        },
        {
            title: '充值金额',
            dataIndex: 'payTotal',
        },
        {
            title: '付费人数',
            dataIndex: 'payRoleCount',
        },
        {
            title: '付费次数',
            dataIndex: 'payCount'
        }

    ];
    //


    return {
            _type: 'AkTable',
            buttons: [],
            filter,
            download: true,
            size: 'small',
            limit: 24,
            columns,
            action: 'king-analyze-hourboard-data'
        }
};

