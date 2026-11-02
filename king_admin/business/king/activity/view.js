exports.name = '活动管理';
exports.view = true;
exports.type = 'N';
const fs = require('fs');

exports.exec = async function (body, query, ctx) {
    const DOC_PATH = global.config.docspath

    const columns = [
        {
            title: "活动名",
            dataIndex: "name"
        },
        {
            title: '活动标识',
            dataIndex: 'type',
        },
        {
            title: '开始时间',
            dataIndex: 'start',
            sorter: true,
        },
        {
            title: '结束时间',
            dataIndex: 'etime',
            sorter: true,
        },
        {
            title: '操作',
            dataIndex: 'action',
            type: 'components',
            components: [
                {
                    _type: 'AkButton',
                    children: '编辑活动',
                    modal: {
                        maskClosable: false, // 点击外部 不可关闭
                        width: '75%',
                        children: {
                            _type: 'KhActivityForm',
                            confirm: '确认在本服立即生效么?',
                            timezone: global.config.timezone,
                            action: 'king-activity-edit',
                            general_prop: [ // 灵魂武将可继承属性
                                {name: '等级', value: 'level'},
                                {name: '星级', value: 'star'},
                                // {name: '坐骑', value: 'exclusive'},
                                {name: '装备', value: 'equip'},
                                {name: '宝物', value: 'treasure'},
                                {name: '武魂', value: 'soul'},
                                {name: '职业套装技能', value: 'occusuitskill'},
                                {name: '兵书', value: 'book'},
                                {name: '专属', value: 'exclusive_equip'},
                                {name: '灵宠', value: 'pet'},
                                {name: '新坐骑', value: 'horse'}
                            ]
                        },

                    }
                }
            ]
        }
    ];

    const filter = [
        {
            key: 'search',
            placeholder: '活动名或标识',
            name: '模糊搜索',
        },
    ];

    const buttons = [];
    if (ctx.actionSet.has('king-activity-tran')) {
        if (fs.existsSync(DOC_PATH)) { // 有文档在服务器上展示转表按钮
            buttons.push({
                children: '活动转表',
                type: 'primary',
                action: 'king-activity-tran',
                confirm: '转表会替换现有配置，确认转换么'
            });
            buttons.push({
                children: '活动配置直接转出',
                type: 'primary',
                download: 'king-activity-tran?out=1',
                confirm: '确认执行转出配置么?'
            });
        } else {
            buttons.push({
                children: '导入活动配置',
                type: 'primary',
                modal: {
                    children: {
                        _type: 'AkForm',
                        action: 'king-activity-push',
                        confirm: '确认导入新配置么，会替换现有配置',
                        form: [
                            {
                                name: ctx.i18n('配置文件'),
                                key: 'content',
                                type: 'json'
                            }
                        ]
                    }
                }
            });
        }
        buttons.push({
            children: '导出配置',
            type: 'primary',
            download: 'king-activity-export'
        },
        {
            children: '查询活动相关数据',
            type: 'primary',
            modal: {
                title: "",
                width: "65%",
                maskClosable: false, // 窗口不关闭
                children: {
                    _type: 'AkTable',
                    filter: [
                        {
                            name: "活动标识",
                            key: 'actmarks',
                            require: true,
                            style: {minWidth: '56%'},
                            placeholder: '活动标识1,活动标记2...(多个使用英文","分割)'
                        },
                        {
                            name: "是否重置",
                            key: 'isset',
                            type: "select",
                            disabled: true,
                            options: ['false', 'true'],
                            style: {minWidth: '50%'},
                        }
                    ],
                    filter_history: true,
                    columns: [
                        {
                            title: '活动标识',
                            dataIndex: 'actMark'
                        },
                        {
                            title: '活动名称',
                            dataIndex: 'actName',
                        },
                        {
                            title: '结束时间',
                            dataIndex: 'endDate'
                        },
                        {
                            title: '未重置数据人数',
                            dataIndex: 'notRoleCount'
                        },
                        {
                            title: '未重置标记人数',
                            dataIndex: 'notMarkCount',
                        }
                    ],
                    size: 'small',
                    action: 'king-activity-findmark'
                }
            }
        })
    }
    return {
        _type: 'AkTable',
        columns,
        buttons,
        rowKey: "type",
        size: 'small',
        filter,
        limit: 15,
        action: 'king-activity-find'
    }
}
