exports.name = '定时器管理';
exports.view = true;
exports.type = 'N';
exports.exec = async function (body, query, ctx) {
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id'
        },
        {
            title: '名称',
            dataIndex: 'name',
            type: 'div'
        },
        {
            title: '执行状态',
            dataIndex: 'status'
        },
        {
            title: '下次执行时间',
            dataIndex: 'next_time',
            type: 'text-date',
            sorter: true
        },
        {
            title: '最后一次执行时间',
            dataIndex: 'run_time',
            type: 'text-date',
            sorter: true
        },
        {
            title: '最后一次执行耗时(ms)',
            dataIndex: 'keep_time',
            sorter: true
        },
        {
            title: '最后一次执行结果',
            dataIndex: 'report',
            type: 'div',
            props: {
                _: {
                    _tooltip: `this.props.rowData.report_err`
                }
            }
        },
        {
            title: '操作',
            dataIndex: 'actions',
            type: 'components',
            components: [
                {
                    _type: 'AkButton',
                    children: '运行',
                    action: `king-timer-run`,
                    confirm: '确认直接执行该定时任务么?',
                    _: {
                        disabled: `!!this.props.rowData.children`
                    }
                },
            ]
        }
    ];

    const onAction = (action, data) => {
        if (action !== 'TASK_RUN') return;
        const taskId = data.id;
        const status = data.status === 1 ? '待执行' : data.status === 2 ? '执行中' : '已结束';
        const table = this.sibling['timer-table'];
        for (const item of table.state.dataSource) {
            if (taskId === item.id) {
                item.status = status;
                item.report = data.report ? '成功' : '异常';
                item.report_err = data.error;
                item.run_time = Date.now();
                item.next_time = data.next_time || item.next_time;
                item.keep_time = data.keep_time;
                break;
            }
        }
        table.setState({dataSource: [...table.state.dataSource]})
        console.log()
    }
    return {
        _type: 'SocketContainer',
        host: global.config.agent,
        _: {
            onAction: onAction.toString()
        },
        children: [{
            _type: 'AkTable',
            id: "timer-table",
            rowKey: 'id',
            size: 'small',
            limit: 50,
            columns,
            action: `king-timer-list`
        }]
    }
};

