import React, {Component} from "react";
import * as Antd from 'antd';
import wangEditor from 'wangeditor';
import {execFunction, CustomComponent, getUploadAuthInfo} from 'awko-admin/client';
import './index.less';

/**
 *
 * 公告内容编辑组件
 * @author awko
 * @version 0.0.1
 * @example
 *  {
 *      _type: 'AkEditor',
 *  }
 *
 *
 *
 *
 */
export default class AkEditor extends Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.state = {};
    }

    componentDidMount() {

        const editor = new wangEditor(this.ref);
        this.editor = editor;
        editor.config.uploadImgShowBase64 = true;
        editor.config.showLinkImg = false;
        editor.config.menus = this.props.menus || [
            'head',  // 标题
            'bold',  // 粗体
            'fontSize',  // 字号
            'fontName',  // 字体
            'italic',  // 斜体
            'underline',  // 下划线
            'strikeThrough',  // 删除线
            'foreColor',  // 文字颜色
            'backColor',  // 背景颜色
            'link',  // 插入链接
            'list',  // 列表
            'justify',  // 对齐方式
            'quote',  // 引用
            'emoticon',  // 表情
            'image',  // 插入图片
            'table',  // 表格
            'undo',  // 撤销
            'redo'  // 重复
        ];

        editor.config.onchange = (html) => {
            // html 即变化之后的内容
            this.preview.innerHTML = html;
        }

        if (this.props.fontSizes) {
            editor.config.fontSizes = this.props.fontSizes;
        }
        editor.create();
        this.props.content && editor.txt.html(this.props.content);
        this.preview.innerHTML = this.props.content || '';
    }

    handleSubmit() {
        this.setState({loading: true})
        execFunction(this.props.action)({content: this.editor.txt.html()})
            .then(r => {
                Antd.message.success('修改成功');
                this.setState({loading: false});
            }).catch(e => {
            this.setState({loading: false})
        });
    }

    render() {
        const {className = ""} = this.props;

        return <div className={"notice" + className}>
            <div className="notice-editor">
                <div ref={ref => this.ref = ref}>

                </div>
                <div className="submit">
                    <Antd.Button type="primary" loading={this.state.loading} onClick={this.handleSubmit}>
                        保存
                    </Antd.Button>
                </div>

            </div>
            <div className={"notice-preview"}>
                <div className="title">
                    <span>
                          <img src="/title.png"/>
                    </span>
                </div>
                <div className="preview-content" ref={ref => this.preview = ref}>

                </div>
            </div>
        </div>
    }
}
