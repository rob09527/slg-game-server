exports.name = '服务器编辑框';
exports.type = 'I';
exports.inherit = 'servers-view';
const moment = require('moment');
exports.exec = async function (body, query, ctx) {

    const {servid, sno, name, groupid, room, start, area = {}, filter, stype, auto_num, auto_pay, auto_create} = body;
    const IS_CREATE = query.create; // 是否是开新服弹框

    const bundleModel = await this.db.mongo.bundle;
    const packages = await bundleModel.find({gameid: {$exists: 1}});
    const serv_filters = [...new Set(packages.map(p => p.gameid).filter(Boolean))]; // 通过 gameid 来配置服务器过滤
    const form = [
        {
            key: 'servid',
            name: '服务器ID',
            type: 'number',
            min: 1000,
            max: 9999,
            require: true,
            disabled: !IS_CREATE
        },
        {
            key: 'sno',
            name: '服务器编号',
            type: 'number',
            min: 1,
            require: true
        },
        {
            key: 'name',
            name: '服务名称',
            require: true
        },
        {
            key: 'groupid',
            name: '合服组ID',
            require: true,
            type: 'number',
            disabled: !IS_CREATE, // 不可编辑
            min: 1,
        },
        {
            key: 'room',
            name: '跨服聊天组',
            type: 'number',
            min: 0,
        },

        {
            key: 'area_name',
            name: '区服名称',
        },
        {
            key: 'area_id',
            name: '区服ID',
            type: 'number',
            min: 1,
        }, 
        {
            key: 'start',
            name: '开服时间',
            type: 'date',
            showTime: true
        },
        {
            key: 'filter',
            name: '隔离设置',
            type: 'select',
            showSearch: true,
            style: {minWidth: 180},
            mode: "multiple",
            options: ['all', ...serv_filters]
        }, 
        {
            key: 'stype',
            name: '类型',
            type: 'select',
            style: {minWidth: 180},
            options: [{name: '正常', value: 1},{name: '审核', value: 2}]
        },
        {
            key: 'auto_num', 
            name: '爆满人数', 
            type: "number", 
            min: 1, max: 3000, 
            placeholder: '达到人数后自动开服,最大3000'
        },
        {
            key: 'auto_pay', 
            name: '付费人数', 
            type: "number", 
            min: 1, max: 500, 
            placeholder: '达到人数后自动开服,最大500'
        },        
        {
            key: 'auto_create', 
            name: '爆满是否创角', 
            type: "select", 
            options:[{name: '能', value: 1},{name: '否', value: 2}]
        }
    ];

    let data = {};
    if (IS_CREATE) {
        data = global.CREATE_SERVER_CACHE || data;
    } else {
        form[0].require = false;
        data = {
            servid, sno, name, groupid, room, start, area_name: area.name, area_id: area.id, filter, stype, auto_num, auto_pay, auto_create
        }
    }
    return {

        children: {
            _type: 'AkForm',
            data: data,
            form: form,
            action: 'king-servers-' + (IS_CREATE ? 'create' : 'update'),
            confirm: IS_CREATE ? '确认创建一个新服务器么？' : '确认修改服务器么?'
        }

    }
};

