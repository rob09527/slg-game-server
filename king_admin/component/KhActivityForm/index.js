import React, {Component} from "react";
import * as Antd from 'antd';
import * as moment from "moment";
import {execFunction, CustomComponent, i18n, ComponentParse} from 'awko-admin/client';
import './index.less';
import {parseExcel} from "./parseExcel";

const Checkbox = Antd.Checkbox;
const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const getRewardRequire = (requireSet = true) => (value) => {
    if (!value) {
        return {ok: requireSet}
    } else if (!value.split(',').every(a => /(^\d{5}$)|(^\d{5}\*\d+$)/.test(a))) {
        return {ok: false}
    }
    return {ok: true}
}
/**
 *  开黑定制，活动设置表单
 * @author awko
 * @version 0.0.1
 * @example
 *  {
 *      _type: 'KhActivityForm',
 *      timezone: '+09:00',         // [必须]配置服务器时区
 *      servers: [{name: '天下无双', value: 9000}],           // [必须] 服务器列表
 *      action: 'send-mails', // [可选] 设置了 action 会自动出现一个 确认按钮，进行表单提交，并提交到该 action所设置的函数(轮训提交，每次提交都会带上一个servid)
 *      data: {id: '拓展值', name: '默认值'}, //  [可选] 默认值
 *      form: [                  // 下面的表单配置和 普通 form一致
 *          {
 *              name: '姓名',     //  设置 表单字段名
 *              key: 'name',     //  设置 表单字段 key
 *              require: true,   // [可选] 设置 要求，支持格式 boolean|string
 *              type: 'text',    // [可选] 设置 输入框类型，默认 'text', 具体参照 AkInput文档
 *              maxLength: 10    // [可选] 设置 input拓展属性，具体参照 AkInput 如 maxLength, limit, 等输入框属性
 *          }
 *      ],
 *      onSubmit: `(data)=>{ return true}`, // AkForm 自定义提交事件， return true 打断默认的提交行为
 *  }
 *
 *
 */
export default class KhActivityForm extends Component {
    constructor(props) {
        super(props);
        this.renderForm = this.renderForm.bind(this);
        this.handleExpandForm = this.handleExpandForm.bind(this);
        this.handleItemChangehandleItemChange = this.handleItemChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleExcelSelect = this.handleExcelSelect.bind(this);
        let data = props.data || {};
        let rewardAll = {default: {rewardId: 'DEFAULT'}};
        if (data.start && typeof data.start !== 'string') {
            data.start = moment(data.start).utcOffset(props.timezone).format(TIME_FORMAT);
        }
        if (data.etime && typeof data.etime !== 'string') {
            data.etime = moment(data.etime).utcOffset(props.timezone).format(TIME_FORMAT);
        }

        const params = data.params || {};

        if (params && params.reward) {
            if (params.reward.items) { // 最外层有奖励属性，则放在 default,兼容第一版一个活动只有一个奖励项
                rewardAll.default = KhActivityForm.parseRewardToString({
                    items: params.reward.items,
                    limit: params.reward.limit,
                    consume: params.reward.consume,
                    require: params.reward.require,
                }, data);
                rewardAll.default.ID = 'DEFAULT';
            }
            for (const key of Object.keys(params.reward)) { // 子奖励项
                if (!params.reward[key] || !params.reward[key].items) {
                    continue;
                }
                rewardAll[key] = KhActivityForm.parseRewardToString(params.reward[key], data);
                rewardAll[key].ID = key;
            }
        }
        const sppackAll = {};

        for (let k in params.sppack) {
            sppackAll[k] = KhActivityForm.parseRewardToString(params.sppack[k], data);
            sppackAll[k].ID = k;
        }
        const luckyAll = {};
        let luckyBase = {};
        if (params.lucky && params.lucky.items) {
            const {items, ...o} = params.lucky;
            o.items = [];// 兼容后面代码
            luckyBase = KhActivityForm.parseRewardToString(o, data);
            for (let k in params.lucky.items) {
                luckyAll[k] = KhActivityForm.parseRewardToString(params.lucky.items[k], data);
                luckyAll[k].ID = k;
            }
        }


        this.state = {
            data,
            typeEditDisabled: !!data.type, // type 不可编辑
            formType: '', // 当前表单类型,对应 rewardType
            rewardType: {
                reward: (!!params.reward) && Object.keys(params.reward).length > 0,
                sppack: (!!params.sppack) && Object.keys(params.sppack).length > 0,
                lucky: (!!params.lucky) && Object.keys(params.lucky).length > 0
            },
            // 奖励类型对应的奖励
            rewardAll: rewardAll,
            // 礼包项
            sppackAll: sppackAll,

            luckyAll: luckyAll,
            luckyBase: luckyBase
        };
        this.rewardLh = [{
            name: '灵魂属性',
            key: 'lhProps',
            type: 'checkbox',
            options: props.general_prop
        },
            {
                key: 'expire',
                name: '体验时间(D)',
                type: 'number',
                placeholder: '单位(天),设置-1就是跟随活动结束,时间设置过大，默认为到期时间戳'
            }];


        // 领取类奖励的表单框
        this.rewardForm = [
            {
                name: '奖励ID',
                key: 'ID',
                disabled: true
            },
            {
                name: '领取条件',
                key: 'require',
                _tooltip: "示例: level>=70&&maxmapid>16120&&vip>3",
                placeholder: "level>=70&&maxmapid>16120&&vip>3"
            },
            {
                name: '领取消耗',
                key: 'consume',
                placeholder: "38005*10|90443",
                require: getRewardRequire()
            },
            {
                name: '领取次数',
                key: 'limit',
                placeholder: "默认1",
                type: 'number'
            },
            {
                name: '奖励列表',
                key: 'items',
                placeholder: "38005*10|90443",
                require: getRewardRequire(false)
            }
        ];

        // 礼包类设置的表单输入框
        this.sppackForm = [
            {
                name: '礼包项ID',
                key: 'ID',
                disabled: true
            },
            {
                name: '购买条件',
                key: 'require',
                _tooltip: "示例: level>=70&&maxmapid>16120&&vip>3",
                placeholder: "level>=70&&maxmapid>16120&&vip>3"
            },
            {
                name: '购买消耗',
                key: 'consume',
                placeholder: "38005*10,90443",
                require: getRewardRequire()
            },
            {
                name: '购买次数',
                key: 'limit',
                placeholder: "默认1",
                type: 'number'
            },
            {
                name: '礼包价格(¥)',
                key: 'price',
                placeholder: "必须输入，单位：元",
                require: true,
                type: 'number'
            },
            {
                name: 'vip经验',
                key: 'exp',
                placeholder: "必须输入,整数",
                require: true,
                type: 'number',
                min: 0
            },
            {
                name: '礼包项标题',
                key: 'title',
                placeholder: "例如:招募福利包"
            },
            {
                name: '礼包项描述',
                key: 'dec',
                placeholder: "例如:招募武将领先一步"
            },
            {
                name: '拓展项',
                key: 'expand',
                placeholder: "配置前端需要额外参数，例如，折扣图标 等",
                type: 'textarea'
            },
            {
                name: '礼包内容',
                key: 'items',
                placeholder: "38005*10,90443",
                require: getRewardRequire(false)
            }
        ];


        // 抽奖类奖励的表单框
        this.luckyForm = [
            {
                name: '领取权重',
                key: 'weight',
                placeholder: "默认1",
                type: 'number'
            },
            {
                name: '奖励列表',
                key: 'items',
                placeholder: "38005*10|90443",
                require: getRewardRequire(false)
            }
        ];
    }


    static parseRewardToString(oneProItem, data) {
        let lhProps;
        let expire;
        const res = {
            ...oneProItem
        }

        res.items = oneProItem.items.map(it => {
            if (it.inherit) {
                lhProps = it.inherit;
                expire = it.expire
            }
            return `${it.GSID}*${it.COUNT}`
        }).join('|');
        res.lhProps = lhProps || [];
        res.expire = expire && parseInt(expire);

        if (Math.floor(res.expire / 1000) === Math.floor(new Date(data.etime).getTime() / 1000)) {
            // 如果活动时间同结束时间，转换为-1
            res.expire = -1;
        }
        if (oneProItem.consume) {
            res.consume = oneProItem.consume.map(it => `${it.GSID}*${it.COUNT}`).join('|');
        }
        res.require = oneProItem.require;
        res.limit = oneProItem.limit || 1;

        return res;
    }

    static parseRewardStringToData({lhProps, expire, ...reward}) {
        const sub = reward;
        let parseStr = (str) => {

            const m = one => {
                one = one.split('*');
                let thisinherit;
                let thisexpire;
                if (!/^\d{5}$/.test(one[0])) {
                    Antd.message.warn('无效的GSID ');
                    throw new Error('无效的 GSID');
                } else if (/1\d{4}/.test(one[0])) {
                    if (lhProps && lhProps.length > 0) {
                        thisinherit = lhProps;
                    }
                    if (expire) {
                        if (expire > 100000000000) { // 直接设置的时间戳
                            thisexpire = +expire;
                        } else {
                            thisexpire = expire + 'D';
                        }

                    }
                }

                return {
                    GSID: +one[0],
                    COUNT: one[1] ? (isNaN(one[1]) ? one.slice(1).join('*') : +one[1]) : 1,
                    inherit: thisinherit,
                    expire: thisexpire
                }
            };

            let r;
            if (str.indexOf('|') >= 0 || str.indexOf('IF') >= 0 || str.indexOf('RANDOM') >= 0) {
                r = str.split('|').map(m);
            } else {
                r = str.split(',').map(m);
            }

            return r;
        };

        if (reward.consume) {
            sub.consume = parseStr(reward.consume)
        }
        if (reward.items) {
            sub.items = parseStr(reward.items);
        }
        const requireStr = reward.require;
        delete sub.ID;
        if (Boolean(requireStr)) {
            let m = requireStr.match(/(^|&)[\w\d\.]+[><=]/g) || [];
            let str = requireStr;
            for (let a of m) {
                const name = a.substring(0, a.length - 1).replace('&', '');
                let sand = '';
                if (a[0] === '&') {
                    sand = '&';
                }
                str = str.replace(a, `${sand}role.getProp('${name}')${a.substr(-1)}`);
            }

            try {
                const f = new Function('role', 'moment', 'start', 'etime', 'IF', 'RANDOM', str);
                f({getProp: () => 1}, moment, 1, 1, () => true, () => Math.floor(Math.random() * 100));
            } catch (e) {
                Antd.message.warn('领取条件配置不规范')
                throw e;
            }

        }

        sub.limit = +reward.limit ? +reward.limit : 1;
        return sub;
    }

    handleExcelSelect(data) {
        const {
            rewardAll,
            sppackAll
        } = parseExcel(data);
        this.setState({
            rewardAll,
            sppackAll,
            rewardType: {
                reward: !!rewardAll,
                sppack: !!sppackAll,
                lucky: false
            }
        })
    }

    handleExpandForm(type) {
        this.setState({formType: type});
    }

    handleChangeType(type, checked) {
        this.state.rewardType[type] = checked;
        if (!checked) {
            this.setState({formType: ''});
        } else {
            this.setState({formType: type});
        }
    }

    handleItemChange(paramsType, rewardId, key, value) {

        const reward = this.state[paramsType][rewardId];
        reward[key] = value;
        this.setState({});
    }

    handleSubmit() {

        const {data, rewardType, rewardAll, sppackAll, luckyAll, luckyBase} = this.state;
        const {serverid: dataServid, type: dataType, ...otherProp} = data;
        const subData = {servid: dataServid, type: dataType && dataType.trim()};
        if (!subData.type) {
            Antd.message.warn('请设置活动标识');
            return;
        } else if (!/^[A-Za-z0-9_]+$/.test(subData.type)) {
            Antd.message.warn('活动标识请设置为字母数字');
            return;
        }

        console.log('subData', subData)
        Object.assign(subData, otherProp)
        if (data.start) {
            subData.start = moment.parseZone(`${data.start}${this.props.timezone}`).valueOf();
        }
        if (data.etime) {
            subData.etime = moment.parseZone(`${data.etime}${this.props.timezone}`).valueOf();
        }
        const params = {};
        subData.params = params;
        if (rewardType.reward) { // 直接领取的奖励
            params.reward = {};
            for (let k in rewardAll) {
                if (k === 'default') {
                    const r = KhActivityForm.parseRewardStringToData(rewardAll[k]);
                    Object.assign(params.reward, r); //默认的奖励放在最外层(兼容第一版只有一个奖励项设置的情况
                    continue;
                }
                params.reward[k] = KhActivityForm.parseRewardStringToData(rewardAll[k]);
                if (!params.reward[k].items) {
                    params.reward[k] = undefined; // 不提交不合法的数据
                }
            }
        }

        if (rewardType.sppack) { // 礼包类活动
            params.sppack = {};
            for (let k in sppackAll) {
                params.sppack[k] = KhActivityForm.parseRewardStringToData(sppackAll[k]);
            }
        }

        if (rewardType.lucky) { // 抽奖类奖励

            params.lucky = KhActivityForm.parseRewardStringToData(luckyBase);
            params.lucky.items = [];
            for (let k in luckyAll) {
                params.lucky.items.push(KhActivityForm.parseRewardStringToData(luckyAll[k]));
            }
        }

        this.setState({submitLoading: true});
        execFunction(this.props.action)(subData).then(r => {
            Antd.message.success('success');
            setTimeout(() => {
                this.props.onSubmitSuccess && this.props.onSubmitSuccess(); // 1 秒钟过后刷数据，因为服务器生效需要一定时间
            }, 1000)
        }).finally(_ => {
            this.setState({submitLoading: false});
        });
    }

    render() {
        const {className = ""} = this.props;
        const {rewardType, data, typeEditDisabled} = this.state;

        return <div className={'kh-activity-form ' + className}>
            <div className="kh-act-header">
                <div className='form-line'>
                    <label className="form-label">活动标识</label>
                    <CustomComponent.AkInput type='text' disabled={typeEditDisabled} value={data.type}
                                             placeholder="例如：lhlj"
                                             onChange={(v) => {
                                                 data.type = v;
                                                 this.setState({});
                                             }}/>
                </div>
                <div className='form-line'>
                    <label className="form-label">活动中文名</label>
                    <CustomComponent.AkInput type='text' value={data.name}
                                             placeholder="例如：灵魂链接"
                                             onChange={(v) => {
                                                 data.name = v;
                                                 this.setState({});
                                             }}/>
                </div>
                <div className='form-line'>
                    <label className="form-label">起止时间</label>
                    <div>
                        <CustomComponent.AkInput type='date' value={data.start}
                                                 placeholder="开始时间" style={{marginRight: 4}}
                                                 showTime={true}
                                                 onChange={(v) => {
                                                     data.start = v;
                                                     this.setState({});
                                                 }}/>
                        <CustomComponent.AkInput type='date' value={data.etime} placeholder="结束时间"
                                                 showTime={true}
                                                 onChange={(v) => {
                                                     data.etime = v;
                                                     this.setState({});
                                                 }}/>
                    </div>
                </div>
                <div className='form-line'>
                    <label className="form-label">是否根据创角时间</label>
                    <CustomComponent.AkInput type='switch' value={!!Number(data.duration)} placeholder="结束时间"
                                             onChange={(v) => {
                                                 data.duration = v ? 1 : '';
                                                 this.setState({});
                                             }}/>
                </div>

                <div className='form-line' style={{display: data.duration ? '' : 'none'}}>
                    <label className="form-label">持续时间(D)</label>
                    <CustomComponent.AkInput type='number' value={data.duration} placeholder="设置该活动对于该玩家持续多少天(按上下键)"
                                             onChange={(v) => {
                                                 data.duration = v;
                                                 this.setState({});
                                             }}/>
                </div>
                <div className='form-line' style={{display: data.duration ? '' : 'none'}}>
                    <label className="form-label">创角时间偏移(D)</label>
                    <CustomComponent.AkInput type='number' value={data.offtime} placeholder="设置持续时间后有效"
                                             onChange={(v) => {
                                                 data.offtime = v;
                                                 this.setState({});
                                             }}/>
                </div>
                <div className='form-line'>
                    <label className="form-label">邮件标题</label>
                    <CustomComponent.AkInput type='text' value={data.mtitle}
                                             placeholder="补偿邮件标题（直接领奖时可选）"
                                             onChange={(v) => {
                                                 data.mtitle = v;
                                                 this.setState({});
                                             }}/>
                </div>
                <div className='form-line'>
                    <label className="form-label">邮件内容</label>
                    <CustomComponent.AkInput type='text' value={data.mcontent}
                                             placeholder="补偿邮件内容（直接领奖时可选）"
                                             onChange={(v) => {
                                                 data.mcontent = v;
                                                 this.setState({});
                                             }}/>
                </div>
                <div className='form-line'>
                    <label className="form-label">活动模版</label>
                    <CustomComponent.AkInput type='text' value={data.template} placeholder="前端展示的模版效果"
                                             onChange={(v) => {
                                                 data.template = v;
                                                 this.setState({});
                                             }}/>
                </div>
                <div className='form-line'>
                    <label className="form-label">外部图标</label>
                    <CustomComponent.AkInput type='text' value={data.iconpath} placeholder="活动外部图标"
                                             onChange={(v) => {
                                                 data.iconpath = v;
                                                 this.setState({});
                                             }}/>
                </div>
                <div className='form-line'>
                    <label className="form-label">展开图标</label>
                    <CustomComponent.AkInput type='text' value={data.iconcpath} placeholder="内部活动展开图标"
                                             onChange={(v) => {
                                                 data.iconcpath = v;
                                                 this.setState({});
                                             }}/>
                </div>
                <div className='form-line'>
                    <label className="form-label">拓展配置</label>
                    <CustomComponent.AkInput type='code' value={data.expand} language="json" theme="vs"
                                             placeholder="拓展配置参数 json"
                                             onChange={(v) => {
                                                 data.expand = v;
                                                 this.setState({});
                                             }}/>
                </div>
            </div>

            <div className='w-line'><p/></div>
            <div className="activity-content">
                <div className="activity-switch">
                    <div className="form-line">
                        <Antd.Tooltip title={'通过转表填充奖励项'}>
                            <label className="form-label">转表填充</label>
                        </Antd.Tooltip>
                        <CustomComponent.AkInput
                            type="excel"
                            onChange={this.handleExcelSelect}
                        />

                    </div>
                    <div className='form-line pointer'>
                        <Antd.Tooltip title={'用户直接可以领取的奖励,非邮件奖励'}>
                            <label className="form-label">直领奖励?</label>
                        </Antd.Tooltip>

                        <Antd.Switch checked={rewardType['reward']}
                                     onChange={checked => this.handleChangeType('reward', checked)}/>
                        <Antd.Icon type="right" className="form-expand-icon"
                                   style={{display: rewardType['reward'] ? '' : 'none'}}
                                   onClick={() => this.handleExpandForm('reward')}/>
                    </div>
                    <div className='form-line pointer'>
                        <Antd.Tooltip title={'限时礼包类活动'}>
                            <label className="form-label">超值礼包</label>
                        </Antd.Tooltip>

                        <Antd.Switch checked={rewardType['sppack']}
                                     onChange={checked => this.handleChangeType('sppack', checked)}/>
                        <Antd.Icon type="right" className="form-expand-icon"
                                   style={{display: rewardType['sppack'] ? '' : 'none'}}
                                   onClick={() => this.handleExpandForm('sppack')}/>
                    </div>
                    <div className='form-line pointer'>
                        <Antd.Tooltip title={'抽奖抽卡类活动'}>
                            <label className="form-label">抽奖活动</label>
                        </Antd.Tooltip>

                        <Antd.Switch checked={rewardType['lucky']}
                                     onChange={checked => this.handleChangeType('lucky', checked)}/>
                        <Antd.Icon type="right" className="form-expand-icon"
                                   style={{display: rewardType['lucky'] ? '' : 'none'}}
                                   onClick={() => this.handleExpandForm('lucky')}/>
                    </div>
                    <div style={{textAlign: 'center', marginTop: 20}}>
                        <CustomComponent.AkButton
                            confirm={this.props.confirm}
                            style={{width: "60%"}}
                            type="primary"
                            loading={this.state.submitLoading}
                            onClick={this.handleSubmit}
                        >
                            提交
                        </CustomComponent.AkButton>
                    </div>

                </div>
                <div className="activity-form">
                    {
                        this.renderForm(this.state.formType)
                    }
                </div>
            </div>

        </div>
    }


    renderForm(formType) {
        if (!formType) {
            return;
        }
        const formDataKey = `${formType}All`;
        const formData = this.state[formDataKey];
        const form = this[`${formType}Form`];
        return <div>
            {
                formType === 'lucky' && <CustomComponent.AkForm
                    data={this.state.luckyBase} form={[
                    {
                        name: '抽取条件',
                        key: 'require',
                        _tooltip: "示例: level>=70&&maxmapid>16120&&vip>3",
                        placeholder: "level>=70&&maxmapid>16120&&vip>3"
                    },
                    {
                        name: '抽取消耗',
                        key: 'consume',
                        placeholder: "38005*10|90443",
                        require: getRewardRequire()
                    },
                    {
                        name: '抽取次数',
                        key: 'limit',
                        placeholder: "默认1",
                        type: 'number'
                    },
                ]}
                    onChange={(k, v) => {
                        this.state.luckyBase[k] = v;
                        this.setState({})
                    }}
                />
            }
            {
                Object.keys(formData).map(itemId => <div key={itemId}>
                        <Antd.Button
                            type="danger"
                            size='small'
                            icon='close'
                            onClick={() => {
                                delete formData[itemId];
                                this.setState({});
                            }}
                        >
                            移除该项</Antd.Button>
                        <CustomComponent.AkForm
                            data={formData[itemId]} form={form}
                            onChange={(...argv) => this.handleItemChange(formDataKey, itemId, ...argv)}
                        />
                        <CustomComponent.AkForm
                            style={{display: formData[itemId].items && /1\d{4}($|\*)/.test(formData[itemId].items) ? '' : 'none'}}
                            data={formData[itemId]} form={this.rewardLh}
                            onChange={(...argv) => this.handleItemChange(formDataKey, itemId, ...argv)}
                        />
                        <div className='w-line'><p/></div>
                    </div>
                )
            }
            <div>
                <Antd.Button onClick={() => {
                    const ID = 'proitem' + Object.keys(formData).length;
                    formData[ID] = {ID};
                    this.setState({});
                }}>添加项</Antd.Button>
            </div>
        </div>;
    }
}
