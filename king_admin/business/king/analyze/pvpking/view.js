exports.name = '排位赛';
exports.type = 'N';

exports.exec = async function (body, query, ctx) {

    const servers = await this.service.game.kingGroupOptions(ctx.adminRole);


    const filter = [
        {
            key: 'servid',
            name: '演武组',
            type: 'select',
            showSearch: true,
            style: {minWidth: 230},
            options: [...servers]
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
            title: '段位',
            dataIndex: 'lv_name',
        },
        {
            title: '段位id',
            dataIndex: 'lv_id',
        },
        {
            title: '星级',
            dataIndex: 'star',
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
        action: 'king-analyze-pvpking-list'
    }]
};

