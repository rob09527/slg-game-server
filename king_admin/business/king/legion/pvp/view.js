exports.name = '军团战对阵信息';
exports.view = true;
exports.type = 'N';
exports.exec = async function (body, query, ctx) {

    const columns = [
        {
            title: '军团A',
            dataIndex: 'legionA',
            type: 'html'
        },
        {
            title: '军团B',
            dataIndex: 'legionB',
            type: 'html'
        },
        {
            title: '期号',
            dataIndex: 'pvpDate'
        },
        {
            title: '报告',
            dataIndex: 'reportStr',
            type: 'AkButton',
            props: {
                modal: {
                    title: '战报详情',
                    children: {
                        _type: 'AkDetail'
                    }
                },
                _: {
                    data: `this.props.rowData.reportDetail`
                }
            }
        },
        {
            title: '参与名单',
            dataIndex: 'action',
            type: 'AkButton',
            props: {
                children: '参与名单',
                modal: `king-legion-pvp-detail`,
            }
        },
        {
            title: '创建时间',
            dataIndex: 'create',
            type: 'text-date'
        }

    ];


    if(ctx.actionSet.has('king-legion-pvp-fight')) {
        columns.push({
            title: '战斗',
            dataIndex: 'action',
            type: 'AkButton',
            props: {
                children: '进行战斗',
                type: 'danger',
                action: 'king-legion-pvp-fight',
                confirm: `确认再次战斗么，重复战斗会进行重复奖励结算哦!`,
                _: {
                    disabled: 'this.props.rowData.reportStatus !== 0'
                }
            }

        })
    }

    const filter = [
        {
            key: 'pvpDate',
            name: '期号',
            type: 'date'
        },
        {
            key: 'legionname',
            name: '军团名'
        },
    ];


    return [
        {

            _type: 'AkTable',
            rowKey: '_id',
            columns,
            limit: 10,
            filter,
            action: `king-legion-pvp-find`
        }
    ]
};

