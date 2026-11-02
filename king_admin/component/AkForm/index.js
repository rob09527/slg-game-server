import React, {Component} from "react";
import * as Antd from 'antd';
import {execFunction, CustomComponent, i18n} from 'awko-admin/client';
import './index.less';

/**
 *
 * @author awko
 * @version 0.0.1
 * @example
 *  {
 *      _type: 'AkForm',
 *      action: 'admin-create', // [可选] 设置了 action 会自动出现一个 确认按钮，进行表单提交，并提交到该 action所设置的函数
 *      download: "actionid",   // [可选] 和 action 不能同时设置，指定表单为下载表单
 *      data: {id: '拓展值', name: '默认值'}, //  [可选] 默认值
 *      cancelModal: boolean,               // [可选] 完成表单操作过后是否关闭弹框(弹框表单时有效), 默认 true
 *      form: [
 *          {
 *              name: '姓名',     //  设置 表单字段名
 *              key: 'name',     //  设置 表单字段 key
 *              require: true,   // [可选] 设置 要求，支持格式 boolean|string
 *              type: 'text',    // [可选] 设置 输入框类型，默认 'text', 具体参照 AkInput文档
 *              maxLength: 10    // [可选] 设置 input拓展属性，具体参照 AkInput 如 maxLength, limit, 等输入框属性
 *          },
 *          {
 *              key: 'email',
 *              name: '邮箱',
 *              show: false,        // [可选] 可以隐藏该项
 *              require: "请设置邮箱" // 设置为 string 时，如果没有设置该字段会出现对应的提示
 *          },
 *          {
 *              key: 'desc',
 *              name: '描述',
 *              // 设置函数类型的 require, ps: 注意，也是字符串,且必须为function开头，不能用箭头函数
 *              require: `function(value){
 *                  if(!value){ return {ok: false} } // 请注意函数 返回格式
 *                  else if(!/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(value)){
 *                      return {ok: false, message: '请输入正确的邮箱'} // 如果有自定义描述则可以利用 message
 *                  }
 *                  else { return {ok: true} }
 *              }`
 *          },
 *          {
 *              key: 'icon',
 *              type: 'image',
 *              name: '头像',
 *              describe: '600*600', // [可选]可以设置一个简单的字段描述语句
 *          },
 *          {
 *              type: "dividing" // 分割线
 *          }
 *      ],
 *      onSubmit: `(data)=>{ return true}`, // AkForm 自定义提交事件， return true 打断默认的提交行为
 *      // AkForm 自定义提交成功事件, this.props.onSubmitSuccess()来执行按钮默认的提交成功事件（cancelModal： false,可以关掉关闭弹框的行为
 *      onSubmitSuccess: `(data)=> {}`
 *  }
 *
 *
 *
 *
 */
export default class AkForm extends Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.initRequire = this.initRequire.bind(this);
        this.checkFormValue = this.checkFormValue.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.state = {
            data: props.data || {},
            errorStatus: {}, // 错误状态
            message: {},
            errorCount: 0,
            /* 首次设置阀门,true 表示没有进行首次设置 */
            notInit: true,
            submitLoading: false,
        };
        this.require = {};
        this.unmount = false;
        this.initRequire();
        // 第一次需要 先验证表单
        const {form = []} = this.props;
        form.forEach(item => {
            this.checkFormValue(item.key, this.state.data[item.key]);
        })
        this.state.notInit = false;

    }

    componentDidMount() {
        if (this.props.data) { // 有默认数据,处理一下require函数，有可能有渲染逻辑在 require 里面
            const form = this.props.form || [];
            for (const item of form) {
                this.require[item.key](this.props.data[item.key]);
            }
        }
    }

    /**
     * 初始化验证
     */
    initRequire() {
        const {form = []} = this.props;
        form.forEach(item => {
            const key = item.key;
            if (!item.require) { // 没有设置 require
                this.require[key] = (value) => true; // 直接返回 ok
            } else if (typeof item.require === "boolean") { // 如果 要求设置为 boolean true
                this.require[key] = (value) => !!(value && (value+"").length > 0);
            } else if (typeof item.require === "string" || typeof item.require === "function") { //  string 类型的要求说明解析
                if (typeof item.require === "function" || item.require.startsWith('function')) { // 函数类型

                    let f;
                    if (typeof item.require === "string") {
                        try {
                            f = new Function('return ' + item.require);
                            f = f();
                            f = f.bind(this);
                        } catch (e) {
                            console.warn(`require error [${key}]`, e);
                            return this.require[key] = (value) => true;
                        }
                    } else {
                        f = item.require;
                    }
                    this.require[key] = (value) => {
                        let r;
                        try {
                            r = f(value);
                        } catch (e) {
                            console.warn(`require error [${key}]`, e);
                            return false;
                        }
                        if (!r) {
                            return false;
                        } else if (!r.ok) {
                            if (r.message) {
                                this.state.message[key] = r.message;
                            }
                            return false;
                        } else {
                            return true;
                        }
                    };
                } else {
                    this.require[key] = (value) => {
                        console.log('current value', key, value)
                        if (!value) {
                            this.state.message[key] = item.require;
                            return false;
                        }
                        return true;
                    };
                }
            } else {
                this.require[key] = (value) => true; // 其他情况 同没设置
            }
        });
    }

    checkFormValue(key, value) {
        // 之前的状态
        const before = this.state.errorStatus[key];
        // 改变后的状态
        const after = this.require[key](value);

        if (before === undefined && after) { // 第一次处理不进行 errorCount 变化
        } else if (before !== after) { // 状态改变
            after ? this.state.errorCount-- : this.state.errorCount++;
        }
        this.state.errorStatus[key] = after;
    }

    handleChange(key, value) {
        if (this.state.notInit) { // 第一次修改数据 进行全字段校验
            const {form = []} = this.props;
            form.forEach(item => {
                this.checkFormValue(item.key, this.state.data[item.key]);
            })
            this.state.notInit = false;
        }
        this.checkFormValue(key, value);
        this.props.onChange && this.props.onChange(key, value, this.state.errorCount);
        this.state.data[key] = value;
        this.setState({});
    }

    componentWillUnmount() {
        this.unmount = true;
    }

    /* 提交事件 */
    onSubmit() {
        const interrupt = this.props.onSubmit && this.props.onSubmit(this.state.data, this.state.errorCount);
        if (interrupt) {
            return;
        }
        this.setState({submitLoading: true});
        execFunction(this.props.action)(this.state.data).then(_ => {
            this.props.onSubmitSuccess && this.props.onSubmitSuccess(this.state.data, _, {cancelModal: this.props.cancelModal === undefined ? true : this.props.cancelModal});
            Antd.message.success('success');
        }).finally(_ => {
            // 避免这个组件已经被销毁，执行 setState出现警告
            (!this.unmount) && this.setState({submitLoading: false});
        });
    }

    render() {
        const {form = [], action, disabled, className = "", style, download } = this.props;
        const AkInput = CustomComponent.AkInput;
        return <div className={"ak-form " + className} style={style}>
            {
                form.map(item => {
                    if (item.show === false) {
                        return "";
                    }
                    if (item.type === "dividing"){
                        return <div className="ak-form-dividing"></div>
                    }
                    return <div className="ak-form-item" key={item.key}>
                        <span className="ak-form-name">{
                            item._tooltip ? <Antd.Tooltip>
                                {item.name}
                            </Antd.Tooltip> : item.name}
                            {
                                item.describe && <span className="ak-form-describe">
                                    {item.describe}
                                </span>
                            }
                        </span>
                        <div className="ak-form-ipt">
                            <AkInput {...item} disabled={disabled || item.disabled} require={undefined}
                                     value={this.state.data[item.key]}
                                     className={this.state.errorStatus[item.key] || this.state.errorStatus[item.key] === undefined ? '' : 'ak-form-error'}
                                     onChange={(value) => this.handleChange(item.key, value)}/>
                            {
                                item.require && (typeof item.require === 'string' || typeof item.require === 'function') &&
                                <span className="ak-form-require"
                                      style={{opacity: this.state.errorStatus[item.key] === false && this.state.message[item.key] ? 1 : 0}}>
                                    <Antd.Icon type="close-circle" className="ak-form-require-icon"/>
                                    {this.state.message[item.key]}
                                </span>
                            }
                        </div>

                    </div>
                })
            }
            {
                action && <div className="ak-form-footer">
                    <CustomComponent.AkButton className="ak-form-button" type="primary"
                                              onClick={this.onSubmit}
                                              confirm={this.props.confirm}
                                              loading={this.state.submitLoading}
                                              disabled={this.state.notInit || this.state.errorCount}>
                        {i18n('confirm')}
                    </CustomComponent.AkButton>
                </div>
            }
            {
                download && <div className="ak-form-footer">
                    <CustomComponent.AkButton className="ak-form-button" type="primary"
                                              data={this.state.data}
                                              confirm={this.props.confirm}
                                              loading={this.state.submitLoading}
                                              download={download}
                                              disabled={this.state.notInit || this.state.errorCount}>
                        {i18n('download')}
                    </CustomComponent.AkButton>
                </div>
            }
        </div>
    }
}
