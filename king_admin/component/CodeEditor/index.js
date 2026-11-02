import React, {Component} from 'react';
import './index.less';
import MonacoEditor from 'react-monaco-editor';

/**
 * 一个基于 momaco 的代码编辑器组件
 *
 * @author awko
 * @version 0.0.1
 * @example
 *  {
 *      _type: 'CodeEditor',
 *      value: 'console.log(....)',
 *      language: 'javascrpit', // json | javascrpit
 *      readOnly: true,         //[可选] 只读,默认 X
 *      onChange: `(data)=>{ return true}`, // AkForm 自定义提交事件， return true 打断默认的提交行为
 *      defaultHeight: 300,     // [可选] 默认高度 默认 100
 *      minHeight: 100,         // [可选] 最小高度
 *      maxHeight: 100          // [可选] 最大高度 （如果 minHeight === maxHeight 则组件高度不可拖动
 *      theme: 'vs-dark'        // [可选] 主题 默认 vs-dark
 *  }
 *
 *
 *
 *
 */
class CodeEditor extends Component {
    constructor(props) {
        super(props);
        window.RESIZE_LISTENER = window.RESIZE_LISTENER || [];
        this.editorDidMount = this.editorDidMount.bind(this);
        this.onChange = this.onChange.bind(this);
        this.handleLineTouchStart = this.handleLineTouchStart.bind(this);
        this.handleLineMove = this.handleLineMove.bind(this);
        this.flushValue = this.flushValue.bind(this);
        const {defaultHeight = 100, minHeight = 0, maxHeight = 1000} = props;
        this.state = {
            height: defaultHeight,
            cantChangeHeight: minHeight === maxHeight
        }
    }

    editorDidMount(editor, monaco) {
        this.editor = editor;
        this.LIS_INDEX = window.RESIZE_LISTENER.push(() => {
            this.editor.layout()
        });
        this.props.onEditorDidMount &&  this.props.onEditorDidMount(editor, monaco);
    }

    onChange(newValue, e) {
        this.props.onChange && this.props.onChange(newValue);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.style !== prevProps.style) {
            this.editor.layout();
        } else if (this.props.autoflush && this.props.value !== prevProps.value) {
            this.flushValue();
        }
    }

    componentWillUnmount() {
        window.RESIZE_LISTENER.splice(this.LIS_INDEX, 1);
    }

    handleLineTouchStart(e) {
        const {minHeight = 0, maxHeight = 1000} = this.props;
        if (minHeight === maxHeight) { // 最大最小高度一致不能拖动
            return;
        }
        this.MOVE_START = e.clientY;
        this.BASE_HEIGHT = this.state.height;
        document.onmousemove = this.handleLineMove;
        document.onmouseup = () => {
            this.MOVE_START = null;
            if (this.state.height !== this.BASE_HEIGHT) {
                this.props.onSizeChange && this.props.onSizeChange();
            }
            this.BASE_HEIGHT = null;
            document.onmousemove = null;
            document.onmouseup = null;
        }

    }

    handleLineMove(e) {
        if (!this.MOVE_START) {
            return;
        }
        const {minHeight = 0, maxHeight = 1000} = this.props;
        this.state.height = Math.min(Math.max(this.BASE_HEIGHT + e.clientY - this.MOVE_START, minHeight), maxHeight);

        this.editorBox.getElementsByClassName('react-monaco-editor-container')[0].style.height = this.state.height + 'px';
        this.editor.layout();
    }

    flushValue() {
        this.editor.setValue(this.props.value);
    }

    render() {
        const {height, cantChangeHeight} = this.state;
        const {language, className, value, style, readOnly = false, id, theme} = this.props;
        const options = {
            minimap: {
                enabled: false
            },
            readOnly
        };
        const newStyle = Object.assign({}, style);
        const width = newStyle.width || "100%";
        newStyle.width = width;
        return (
            <div className='post-code-editor-box' style={newStyle} id={id} ref={ref => this.editorBox = ref}>
                <MonacoEditor
                    className={className}
                    width={width}
                    height={height}
                    style={newStyle}
                    language={language}
                    theme={theme || "vs-dark"}
                    value={value}
                    options={options}
                    onChange={this.onChange}
                    editorDidMount={this.editorDidMount}
                />

                <div className="post-editor-line" style={cantChangeHeight ? {cursor: 'default'} : null}
                     onMouseDown={this.handleLineTouchStart}>
                    <div className="post-editor-line-s">

                    </div>
                </div>
            </div>
        );
    }
}

export default CodeEditor;
