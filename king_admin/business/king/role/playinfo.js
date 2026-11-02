exports.name = '角色任务管理';
exports.type = 'N';

const moment = require('moment');

exports.exec = async function (body, query, ctx) {

    const {_id: rid, servid} = body;

    const AffairsModel = await this.service.game.collection('affairs');
    const opt = {rid};
    const affair = await AffairsModel.findOne(opt);
    const missions = [];
    const friendsMissions = [];
    if (affair) {
        if (affair.missions) {
            missions.push(...affair.missions);
        }
        if (affair.friendsMissions) {
            friendsMissions.push(...affair.friendsMissions);
        }
    }
    missions.forEach(one => {
        one.rid = rid;
        one.servid = servid;
        one.type = 'missions';
        if (one.reward) {
            one.rewardStr = one.reward.map(o => `${o.GSID}*${o.COUNT}`).join(',');
        }
    });
    friendsMissions.forEach(one => {
        one.rid = rid;
        one.servid = servid;
        one.type = 'friendsMissions';
    });
    const affAction = 'king-role-affend';
    return {
        width: '65%',
        children: {
            _type: 'Tabs',
            defaultActiveKey: "1",
            children: [
                {
                    _type: 'Tabs.TabPane',
                    tab: '个人悬赏',
                    key: '1',
                    children: {
                        _type: 'AkTable',
                        rowKey: 'mid',
                        id: 'mission-table',
                        timezone: global.TIMEZONE,
                        columns: [
                            {title: '任务ID', dataIndex: 'id'},
                            {title: '奖励', dataIndex: 'rewardStr'},
                            {title: '结束时间', dataIndex: 'etime', type: 'text-date'},
                            {
                                title: '操作', dataIndex: 'action', type: 'AkButton',
                                props: {
                                    _: {
                                        disabled: `!this.props.rowData.etime`,
                                        onSubmitSuccess: `()=>{
                                            this.props.rowData.etime = Date.now();
                                            console.log('-->',this.sibling['mission-table']);
                                            this.sibling['mission-table'].setState({});
                                        }`
                                    },
                                    confirm: '确认加速么?',
                                    action: affAction,
                                    children: '加速'
                                }
                            },
                        ],
                        dataSource: missions
                    },
                },
                {
                    _type: 'Tabs.TabPane',
                    tab: '好友悬赏',
                    key: '2',
                    children: {
                        _type: 'AkTable',
                        rowKey: 'mid',
                        id: 'fmission-table',
                        columns: [
                            {title: '任务ID', dataIndex: 'id'},
                            {title: '结束时间', dataIndex: 'etime', type: 'text-date'},
                            {
                                title: '操作', dataIndex: 'action', type: 'AkButton',
                                props: {
                                    _: {
                                        disabled: `!this.props.rowData.etime`,
                                        onSubmitSuccess: `()=>{
                                            this.props.rowData.etime = Date.now();
                                             this.sibling['fmission-table'].setState({});
                                        }`
                                    },
                                    confirm: '确认加速么?',
                                    action: affAction,
                                    children: '加速'
                                }
                            },
                        ],
                        dataSource: friendsMissions
                    },
                }
            ]
        }
    }
};

