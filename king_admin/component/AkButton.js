import React, {Component} from "react";
import * as Antd from 'antd';
import {execFunction, paramReplace, ComponentParse, CustomComponent, customPropsKey} from 'awko-admin/client';

/**
 *
 * @example
 *  {
 *      _type: 'AkButton',
 *      _i18n: "children",  // [可选] 所以组件都可以设置动态语言的属性，多个可使用对象的方式, {"children":1, "name":1}
 *      modal: {            // [可选] 设置为弹框按钮， ps:设置了 onClick 时该属性无效
 *          children: {
 *              _type: 'AkForm' // 弹框 展示的组件，较多会配合 AkForm 来实现弹框表单
 *              ...     // 对应组件属性即可
 *              _ :{
 *                  onSubmit: `(data)=>{ return true}`, // AkForm 自定义提交事件， return true 打断默认的提交行为
 *                  // AkForm 自定义提交成功事件, this.props.onSubmitSuccess()来执行按钮默认的提交成功事件（cancelModal： false,可以关掉关闭弹框的行为
 *                  onSubmitSuccess: `(data)=> this.props.onSubmitSuccess(data, {cancelModal: false})`
 *              }
 *          }
 *      },
 *      action: '',              // [可选] 直接提交处理数据的按钮
 *      download: '',            // [可选] 下载按钮，download 为资源地址
 *      onSubmitSuccess: ()=> {} // [可选] 按钮如果存在提交操作，这里可以做提交完成的监听
 *      //  更多属性参照 https://3x.ant.design/components/button-cn/#API
 *  }
 * @description modal 内部默认传递 onSubmitSuccess,内部执行 onSubmitSuccess来触发弹框关闭，如果是在表格头部，还会触发表格刷新
 * @author awko
 * @version 0.0.1
 */
export default class AkButton extends Component {
    constructor(props) {
        super(props);
        this.createModal = this.createModal.bind(this);
        this.onClick = this.onClick.bind(this);
        this.state = {};
    }

    createModal(modalChildren) {
        return <ComponentParse data={this.props.data || this.props.rowData} {...modalChildren}
                               onSubmitSuccess={(data, res,options = {cancelModal: true}) => {
                                   this.props.onSubmitSuccess && this.props.onSubmitSuccess(data, res);
                                   options.cancelModal && this.props.cancelModal();
                               }}/>
    }

    onClick(e) {
        if (this.props.onClick) return this.props.onClick(e);
        const {modal, to, action, download} = this.props;
        if (modal) {
            if (typeof modal === 'string') {
                // 需要进行网络请求
                this.setState({loading: true});
                execFunction(modal)(this.props.data || this.props.rowData).then(r => {
                    if (!r.children) {
                        alert('ERROR ! 您的弹框数据格式不正确');
                    }
                    this.props.showModal({
                        ...r,
                        title: r.title === undefined ? this.props.children : r.title,
                        footer: r.footer || false,
                        children: this.createModal(r.children)
                    }, r.key);
                }).finally(_ => {
                    this.setState({loading: false});
                })
            } else {
                this.props.showModal({
                    ...modal,
                    title: modal.title === undefined ? this.props.children : modal.title,
                    footer: modal.footer || false,
                    children: this.createModal(modal.children)
                }, modal.key);
            }
        } else if (to) {
            this.props.history.push(to);
        } else if (action) {
            this.setState({loading: true});
            execFunction(action)(this.props.data || this.props.rowData).then(r => {
                Antd.message.success('success');
                this.props.onSubmitSuccess && this.props.onSubmitSuccess();
            }).finally(() => {
                this.setState({loading: false});
            });
        } else if (download) {
            const url = `/api/business/${download}`;
            const form = document.createElement('form');
            form.method = 'post';
            form.action = url;
            form.enctype = 'application/x-www-form-urlencoded';
            const data = this.props.data || this.props.rowData || {};
            const token = window.localStorage.getItem('admin-token');
            const mdata = {token, ...data, _export_: true}; // 固定 _export_ 加一个导出标识
            this.setState({loading: true})
            for (let k in mdata) {
                const ipt = document.createElement('input');
                ipt.name = k;
                if (!mdata[k]) {
                    continue;
                } else if(typeof mdata[k] === 'object'){
                    ipt.value = JSON.stringify(mdata[k]);
                }else {
                    ipt.value = mdata[k];
                }
                form.appendChild(ipt);
            }
            document.body.appendChild(form);
            form.submit();
            form.remove();
            setTimeout(()=>{
                this.setState({loading: false})
            }, 10000)
        }
    }

    render() {
        const {children, confirm} = this.props;
        const np = {};
        for (let k in this.props) {
            if (customPropsKey[k]) continue;
            if (k === 'onSubmitSuccess') continue;
            np[k] = this.props[k];
        }

        const em = <Antd.Button {...np} loading={this.state.loading || np.loading}
                                onClick={confirm ? null : this.onClick}>
            {
                children
            }
        </Antd.Button>;
        if (confirm) {
            return <Antd.Popconfirm title={confirm} okText='Yes' disabled={np.disabled} cancelText='No'
                                    onConfirm={this.onClick}>
                {em}
            </Antd.Popconfirm>
        }
        return em;
    }
}
