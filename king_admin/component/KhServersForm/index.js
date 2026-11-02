import React, {Component} from "react";
import * as Antd from 'antd';
import {execFunction, CustomComponent, i18n} from 'awko-admin/client';
import './index.less';

const Checkbox = Antd.Checkbox;
/**
 *  开黑定制，全服数据操作表单控件,
 * @author awko
 * @version 0.0.1
 * @example
 *  {
 *      _type: 'KhServerForm',
 *      servers: [{name: '天下无双', value: 9000}],           // [必须] 服务器列表
 *      batch_push: false,      //[可选] 是否一次性提交，默认false 也就是轮训提交
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
export default class KhServersForm extends Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleItemSelect = this.handleItemSelect.bind(this);
        this.handleCheckAll = this.handleCheckAll.bind(this);
        this.lineMove = this.lineMove.bind(this);
        this.lineMoveStart = this.lineMoveStart.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        // 随机一个 ID
        this.RANDOM = (Math.random() * 1000).toFixed(0) + "SV";
        const servers = props.servers;
        const serverGroup = {};
        servers.forEach(s => {
            const g = Math.floor(s.value / 100);
            serverGroup[g] = serverGroup[g] || [];
            serverGroup[g].push(s);
        });
        const selectMap = {};
        if (props.data && props.data.servid) {
            const sidList = Array.isArray(props.data.servid) ? props.data.servid : [props.data.servid];
            for (const sid of sidList) {
                selectMap[sid] = true;
            }
        }
        this.state = {
            data: props.data || {},
            message: {},
            serverGroup,
            submitLoading: false,
            selectMap,
            checkAll: {},
            indeterminate: {},
            errorCount: 0
        };
    }


    handleItemSelect(g, e) {
        if (e.target.checked) {
            this.state.selectMap[e.target.value] = true;
        } else {
            delete this.state.selectMap[e.target.value];
        }
        const servers = this.state.serverGroup[g] || [];
        this.state.indeterminate[g] = false;
        this.state.checkAll[g] = true;
        let selectCount = 0;
        for (let s of servers) {
            if (this.state.selectMap[s.value]) {
                selectCount++;
            }
        }
        if (selectCount !== 0 || selectCount !== servers.length) {
            this.state.indeterminate[g] = true;
        }
        if (selectCount < servers.length) {
            this.state.checkAll[g] = false;
        }
        this.setState({});
    }

    handleCheckAll(g, e) {
        const servers = this.state.serverGroup[g] || [];
        const selectMap = this.state.selectMap;
        this.state.indeterminate[g] = false;
        this.state.checkAll[g] = e.target.checked;

        servers.forEach(s => {
            if (e.target.checked) {
                selectMap[s.value] = true;
            } else {
                delete selectMap[s.value];
            }
        });

        this.setState({
            selectMap,
        });
    }

    handleChange(key, value, errorCount) {
        this.state.data[key] = value;
        this.setState({
            errorCount
        })
    }

    lineMoveStart(e) {
        if (!this.serverBox) {
            const parent = e.target.tagName === 'P' ? e.target.parentElement.parentElement : e.target.parentElement;
            this.serverBox = parent.getElementsByClassName('kh-sv-form-list')[0]
        }
        const cmpStyle = this.serverBox.getBoundingClientRect();
        this.startHeight = cmpStyle.height;
        this.moveDown = e.clientY;
        document.onmousemove = this.lineMove;
        const end = () => {
            this.moveDown = false;

            document.onmouseup = null;
            document.ondragend = null;
            document.onmousemove = null;
        }
        document.onmouseup = end;
        document.ondragend = end;

    }

    lineMove(e) {
        if (this.moveDown) {

            const change = e.clientY - this.moveDown;

            this.serverBox.style = "height: " + (change + this.startHeight) + "px;";

        }
    }

    handleSubmit() {
        const {action, batch_push} = this.props;
        const selectServers = Object.keys(this.state.selectMap);
        const interrupt = this.props.onSubmit && this.props.onSubmit(selectServers, this.state.data, this.state.errorCount);
        if (interrupt) {
            return;
        }
        if (!action) {
            return;
        }

        this.setState({submitLoading: true});

        if (batch_push) { // 如果是批量提交
            return execFunction(action)({...this.state.data, servid: selectServers, }).then(r => {
                Antd.message.success('success');
                this.props.onSubmitSuccess && this.props.onSubmitSuccess();
            }).finally(() => {
                this.setState({submitLoading: false});
            });
        }

        const waitServers = [...selectServers];
        const exec = (servid) => {
            const target = document.getElementById(this.RANDOM + servid);

            target.className = target.className.replace(" success", "").replace(" fail", "")

            execFunction(action)({servid, ...this.state.data}).then(r => {
                target.className = target.className + " success";
            }).catch(e => {
                target.className = target.className + " fail";
            }).finally(() => {
                target.scrollIntoView();
                if (waitServers.length === 0) {
                    this.props.onSubmitSuccess && this.props.onSubmitSuccess();
                    return this.setState({submitLoading: false});
                }
                exec(waitServers.shift());
            })

        }
        exec(waitServers.shift());
    }

    render() {
        const {servers = [], form = [], action, className = ""} = this.props;
        const {data, serverGroup} = this.state;

        return <div className={"kh-sv-form " + className} ref={(ref) => this.ref = ref}>
            {this.state.submitLoading && <div className="kh-sv-form-mc">
                <h1>请不要中途关闭网页...</h1>
            </div>}
            <div className='kh-sv-form-list'>

                {
                    Object.keys(serverGroup).map(g => <div key={g}>
                        <div className='kh-sv-form-line-select-all'>
                            <Checkbox
                                indeterminate={!!this.state.indeterminate[g]}
                                onChange={(checked) => this.handleCheckAll(g, checked)}
                                checked={!!this.state.checkAll[g]}
                                disabled={this.state.submitLoading}
                            > 全选
                            </Checkbox>
                        </div>
                        <div className="ant-checkbox-group">
                            {
                                serverGroup[g].map(item => <label style={{color: "#ff0000 !important"}}
                                                                  key={item.value} id={this.RANDOM + item.value}
                                                                  className="ant-checkbox-group-item ant-checkbox-wrapper">
                                    <Checkbox disabled={this.state.submitLoading || item.disabled}
                                              value={item.value}
                                              checked={!!this.state.selectMap[item.value]}
                                              onChange={(e) => this.handleItemSelect(g, e)}>
                                        {item.name}
                                    </Checkbox>
                                </label>)
                            }

                        </div>
                    </div>)
                }


            </div>
            <div className='w-line' onMouseDown={this.lineMoveStart}><p/></div>
            <CustomComponent.AkForm
                form={form}
                data={data}
                disabled={this.state.submitLoading}
                onChange={this.handleChange}
            />
            {
                action && <div className="kh-form-footer">
                    <CustomComponent.AkButton className="ak-form-button" type="primary"
                                              onClick={this.handleSubmit}
                                              confirm={this.props.confirm}
                                              loading={this.state.submitLoading}
                                              disabled={Object.keys(this.state.selectMap).length === 0 || this.state.errorCount}>
                        {i18n('confirm')}
                    </CustomComponent.AkButton>
                </div>
            }
        </div>
    }
}
