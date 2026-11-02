exports.name = '组队赛';
exports.type = 'N';

exports.exec = async function (body, query, ctx) {

    const servers = await this.service.game.kingGroupOptions(ctx.adminRole);
    const bundles = await this.db.mongo.bundle.getBundles(ctx.adminRole);

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
            title: '积分',
            dataIndex: 'score',
        },
        {
            title: '战斗力',
            dataIndex: 'power',
        },
        {
            title: '战队名',
            dataIndex: 'name',
        },
        {
            title: '队长',
            children: [
                {
                    title: '角色名',
                    dataIndex: 'leader.name'
                },
                {
                    title: 'UID',
                    dataIndex: 'leader.uid'
                },
                {
                    title: '战斗力',
                    dataIndex: 'leader.power'
                }
            ]
        },
        {
            title: '成员1',
            children: [
                {
                    title: '角色名',
                    dataIndex: 'member1.name'
                },
                {
                    title: 'UID',
                    dataIndex: 'member1.uid'
                },
                {
                    title: '战斗力',
                    dataIndex: 'member1.power'
                }
            ]
        },
        {
            title: '成员2',
            children: [
                {
                    title: '角色名',
                    dataIndex: 'member2.name'
                },
                {
                    title: 'UID',
                    dataIndex: 'member2.uid'
                },
                {
                    title: '战斗力',
                    dataIndex: 'member2.power'
                }
            ]
        }

    ];
    //

    return [{
        _type: 'AkTable',
        filter,
        filter_history: true,
        size: 'small',
        limit: 15,
        bordered: true,
        download: true,
        columns,
        action: 'king-analyze-pvpteam-list'
    }]
};

