import React, {Component} from "react";
import moment from 'moment';
import * as Antd from 'antd';
import * as XLSX from 'xlsx';
import './index.less';
import {getUploadAuthInfo, customPropsKey, CustomComponent, i18n} from 'awko-admin/client';
import {del} from "awko-admin/client/src/common/http";

const dateFormat = 'YYYY-MM-DD';
const monthFormat = 'YYYY-MM';
const weekFormat = 'YYYY-WW';
const timeFormat = 'HH:mm:ss';
const uploadInfo = {onInitOk: []}; // 记录上传需要的数据,onInitOk为 初始化过后的监听列表


/**
 *
 * @description AkInput 组件一般不会单独使用，通常会被 AkForm （表单输入框）,AkTable （表格条件搜索 filter ）组件搭载(被搭载使用，会被省区 _type
 *
 * @example
 *      // 所有输入框通用属性
 *      {
 *          _type: 'AkInput',
 *          style: {},
 *          value: 'your value',// [可选] 绑定的值,一般不需要关心，因为一般不会单独使用该组件，当然你封装自己的组件用到AkInput时，可能会用到
 *          disabled: true,     // [可选] 是否不可编辑
 *          placeholder: '',    // [可选] 提示语
 *          onChange: (v)=>{},  // [可选] 设置事件，当然后端渲染时不可直接传递函数，可利用 "_" 变量
 *          _:{                 // 利用后端属性渲染方式，可自定义onChange事件
 *              onChange: `(v)=>{}`
 *          }
 *      }
 *      // 普通带搜索按钮的输入框
 *      {
 *          _type: 'AkInput',
 *          type: 'search',
 *          onChange: (v) => {}  // 只有点击搜索按钮时才触发
 *      }
 *
 *      // 普通文本输入框
 *      {
 *          _type: 'AkInput',
 *          type: 'number',     // [可选] 默认是 text, 普通输入框一般可设置 password|number|text|url|email|tel ...
 *          maxLength: 8,       // [可选] 可选设置最大输入字数
 *          readonly: true,     // [可选] 只读
 *      }
 *      // 长文本输入框   详细文档，可参照： https://www.w3school.com.cn/tags/tag_textarea.asp
 *      {
 *          _type: 'AkInput',
 *          type: 'textarea'
 *      }
 *      // 下拉选择框类型  详细文档，可参照:  https://3x.ant.design/components/select-cn/#Select-props
 *      {
 *          _type: 'AkInput',
 *          type: 'select',
 *          options: [          // 选项
 *              {name: 'ALL', value: 'all'},      // ALL 为预设字段，该字段会自动切换语言
 *              {name: '选项1', value: 'option1'}, // name 为展示的选项名， value 为选择改选项对应的值
 *              'option2'                         //  若 选项名和选项值一致，可以简写
 *          ]
 *      }
 *      // 单选框     详细文档，可参照: https://3x.ant.design/components/radio-cn/#RadioGroup
 *      {
 *          _type: 'AkInput',
 *          type: 'radio',
 *          options: [
 *              {name: '选项1', value: 'option1'}, // name 为展示的选项名， value 为选择改选项对应的值
 *              'option2'                         //  若 选项名和选项值一致，可以简写
 *          ]
 *      }
 *      // 多选框    详细文档，可参照: https://3x.ant.design/components/checkbox-cn/#Checkbox-Group
 *      {
 *          _type: 'AkInput',
 *          type: 'checkbox',
 *          options: [
 *              {name: '选项1', value: 'option1'}, // name 为展示的选项名， value 为选择改选项对应的值
 *              'option2'                         //  若 选项名和选项值一致，可以简写
 *          ]
 *      }
 *      // switch开关  详细文档，可参照: https://3x.ant.design/components/switch-cn/#API
 *      {
 *          _type: 'AkInput',
 *          type: 'switch',
 *          options: [ // 不同上面几类，该 options 只能是 string[],
 *              '开',
 *              '关'
 *          ]
 *      }
 *      // 时间选择   详细文档，可参照: https://3x.ant.design/components/time-picker-cn/#API
 *      {
 *          _type: 'AkInput',
 *          type:  'time',
 *          value:  '18:20:59'          // 值的设置格式,注意24小时值
 *      }
 *      // 日期选择   详细文档，可参照: https://3x.ant.design/components/date-picker-cn/#API
 *      {
 *          _type: 'AkInput',
 *          type:  'date',
 *          pickerType: 'DatePicker',   // [可选] 日期选择框类型，默认:DatePicker,其他类型有：MonthPicker, WeekPicker，RangePicker, 其中RangePicker为时间段选择
 *          showTime:  true             // [可选] DatePicker,RangePicker 两种类型可以设置 showTime, 是的设置日期的精确度可以精确到 时分秒,
 *          value: '2018-20-12'         // 注意 RangePicker 的value需设置为 ['2018-20-12','2018-20-12'], showTime=true时需带上时间 '2018-20-12 18:20:20'
 *      }
 *      // 文件上传或图片上传
 *      {
 *          _type: 'AkInput',
 *          type: 'file|image',         // 文件上传设置 file,图片则为 image
 *          limit: 9,                   // [可选] 图片上传可设置，表示可设置多少张图片，默认1
 *          accept: '.csv, application/vnd.ms-excel' // [可选] 文件上传可设置，指定上传文件的类型，用于选择文件时的过滤,多个逗号 https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/Input/file#accept
 *      }
 *      // excel 数据解析提交
 *      {                               // excel 表格数据的解析后提交， 表格格式第一栏为KEY,该控件不支持默认值设置
 *          _type: 'AkInput',
 *          type: 'excel',
 *      }
 *      // josn json文件格式导入提交
 *      {                               // excel 表格数据的解析后提交， 表格格式第一栏为KEY,该控件不支持默认值设置
 *          _type: 'AkInput',
 *          type: 'json',
 *      }
 *
 *      // code 编辑输入框
 *
 *      {
 *          _type: 'AkInput',           // 参数详细请看 CodeEditor
 *          type: 'code',
 *          theme: 'vs-dark',
 *      }
 *
 * @author awko
 * @version 0.0.1
 */
export default class AkInput extends Component {
    constructor(props) {
        super(props);
        this.datePickerFormat = this.datePickerFormat.bind(this);
        this.handleUploadChange = this.handleUploadChange.bind(this);
        this.initUploadInfo = this.initUploadInfo.bind(this);
        this.filterProps = this.filterProps.bind(this);
        this.readExcelFile = this.readExcelFile.bind(this);
        this.readJSONFile = this.readJSONFile.bind(this);
        this.state = {
            value: props.value || '',
        };

        if (this.props.type === 'image' || this.props.type === 'file') {
            this.initUploadInfo();
        }
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        if (nextProps.value !== undefined && nextProps.value !== nextState.value) {
            nextState.value = nextProps.value;
        }
        return true;
    }

    // 初始化上传需要的 token, host 等数据
    initUploadInfo() {
        this.state.uploadInfo = uploadInfo; // 标记 uploadInfo 数据
        // 下面是避免重复初始化 uploadInfo 的做法
        if (!uploadInfo.onInitOk) {  // 如果初始化监听列表不存在证明已经初始化完毕
            return;
        }
        // 如果初始化监听列表还存在证明还在初始化中
        if (uploadInfo.onInitOk.length === 0) { // 第一个进入队列的，需开启网络请求
            getUploadAuthInfo().then(r => {
                uploadInfo.host = r.host;
                uploadInfo.token = r.token;

                for (let onInitFinish of uploadInfo.onInitOk) {
                    onInitFinish();
                }
                uploadInfo.onInitOk = null;
                console.log('上传控件初始化成功');
            }).catch(e => {
                // 出错
                uploadInfo.onInitOk = null;
                Antd.message.error('upload init error');
            })
        }
        uploadInfo.onInitOk.push(() => this.setState({}));
    }

    datePickerFormat(value) {
        const pickerType = this.props.pickerType || 'DatePicker';
        if (!value) {
            return undefined;
        }
        let addTimeFormat = '';
        if (this.props.showTime) { // 日期选择时，需要精确到时间
            addTimeFormat = ' ' + timeFormat;
        }
        switch (pickerType) {
            case 'RangePicker':
                if (!Array.isArray(value)) { // 避免脏数据导致控件出错
                    return [null, null];
                }
                return [
                    value[0] ? moment(value[0], dateFormat + addTimeFormat) : null,
                    value[1] ? moment(value[1], dateFormat + addTimeFormat) : null
                ];
            case 'MonthPicker':
                return moment(value, monthFormat);
            case 'WeekPicker':
                return moment(value, weekFormat);
            case "DatePicker":
            default:
                return moment(value, dateFormat + addTimeFormat);
        }
    }

    handleUploadChange({fileList, file}) {
        const limit = this.props.limit || 1;
        // console.log("file.status === done",file.status === "done");
        this.state.imageInit = true;

        //原始列表 this.state.fileList;
        this.setState({fileList});
        //错误列表
        let errorList = fileList.filter(f => f.status === 'error');

        //过滤已经完成列表
        fileList = fileList.filter(f => {
            f.url = (f.response && f.response.url) || f.url;
            return f.status === 'done'
        });//过滤出成功上传的

        if (this.state.fileList.length === (errorList.length + fileList.length)) {
            //如果所有的导出都完成才执行 onChange
            let v = limit > 1 ?
                fileList.map(f => f.url) : //length 大于1时，该字段用 数组接受, 否则用字符串接
                (fileList[0] && fileList[0].url);
            this.props.onChange && this.props.onChange(v);
        }

    }

    /**
     * 过滤不必要的 props 往Antd组件内部
     */
    filterProps() {
        const newProps = {};
        for (let k of Object.keys(this.props)) {
            if (k[0] === '_' || k === 'className') {
                //   '_element_' ,  '_type' ,  '_' ,  '_custom' 这些是 没用的属性，不必往内部传递
                continue;
            } else if (customPropsKey[k]) {
                //去掉一些不需要的 prop,避免不必要的 warn
                continue;
            }
            newProps[k] = this.props[k]
        }
        this.newProps = newProps;
    }

    static readExcelData(wb) {
        let data = [];
        for (let k in wb.Sheets) {
            data.push({sheet: k, data: XLSX.utils.sheet_to_json(wb.Sheets[k])})
        }
        return data;
    }

    /**
     * 解析 excel
     * @param file
     * @param onChange
     * @returns {*}
     */
    readExcelFile(file, onChange) {
        if (!file) {
            this.setState({value: ''});
            return onChange(null);
        }
        let reader = new FileReader();
        reader.onload = (e) => {
            let wb = XLSX.read(e.target.result, {type: "binary"});
            let data = AkInput.readExcelData(wb);
            this.setState({value: 'abc'});
            return onChange(data);
        };
        reader.readAsBinaryString(file);
    }

    /**
     * 解析 jsonfile
     * @param file
     * @param onChange
     * @returns {*}
     */
    readJSONFile(file, onChange) {
        if (!file) {
            this.setState({value: ''});
            return onChange(null);
        }
        let reader = new FileReader();
        reader.onload = (e) => {

            console.log('jsonStr', e.target.result);
            this.setState({value: 'abc'});
            return onChange(e.target.result);
        };
        reader.readAsText(file, 'utf-8');
    }
    render() {
        const {
            type, disabled, onChange = () => {
            },
            placeholder, options = [], style, maxLength, onPressEnter
        } = this.props;
        this.filterProps();
        if (options[0] && (options[0] === 'ALL' || options[0].name === 'ALL')) {
            options[0] = {name: i18n('ALL'), value: 'ALL'}; // 预设全部
        }
        const className = `ak-input ${this.props.className || ''}`;
        let value = this.state.value;

        let em;
        switch (type) {
            case 'select': // 下拉选择
                em = <Antd.Select {...this.newProps} className={className} type={type} onPressEnter={onPressEnter}
                                  disabled={disabled}
                                  style={{minWidth: options[0] && ((options[0].name || options[0]).length * 20), ...(style || {})}}
                                  value={this.newProps.mode === "multiple" && !value ? [] : value}
                                  placeholder={placeholder} onChange={(v) => {
                    if (this.select_item_down_true) { // 长按 批量选择时，忽略单选
                        this.select_item_down_true = 0;
                        return;
                    }
                    onChange(v);
                    this.setState({value: v});
                }}>
                    {
                        options.map(item => <Antd.Select.Option type="option"
                                                                disabled={item.disabled}
                                                                key={item.value || item}
                                                                onMouseDown={(e) => {

                                                                    if (this.newProps.mode !== "multiple") {
                                                                        return;
                                                                    }
                                                                    this.select_item_down = Date.now();
                                                                    this.select_item_down_timer = setTimeout(() => {
                                                                        if (!this.select_item_down) {
                                                                            return;
                                                                        }
                                                                        // 长按选择所有同组
                                                                        const currentValue = Array.isArray(value) ? value : [];
                                                                        const tz = {};
                                                                        options.filter((it) => it.group === item.group).forEach(it => tz[it.value] = 1); // 同组

                                                                        const vObj = {};
                                                                        currentValue.forEach(a => {
                                                                            vObj[a] = 1;
                                                                        })
                                                                        if (currentValue.includes(item.value)) {
                                                                            // 取消同组
                                                                            for (const k in tz) {
                                                                                delete vObj[k];
                                                                            }
                                                                        } else {
                                                                            for (const k in tz) {
                                                                                vObj[k] = 1;
                                                                            }
                                                                        }
                                                                        const v = Object.keys(vObj);
                                                                        this.setState({value: v});
                                                                        onChange(v);
                                                                        this.select_item_down_true = '1';
                                                                    }, 1200)
                                                                }}
                                                                onMouseUp={(e) => {
                                                                    this.select_item_down = 0;
                                                                    if (this.select_item_down_timer) {
                                                                        clearTimeout(this.select_item_down_timer);
                                                                        this.select_item_down_timer = 0;
                                                                    }
                                                                }}
                                                                value={item.value || item}>{item.name || item}</Antd.Select.Option>)
                    }
                </Antd.Select>;
                break;
            case 'radio': // 单选框
                em = <Antd.Radio.Group {...this.newProps} className={className} disabled={disabled} name="radiogroup"
                                       value={value}
                                       style={style}
                                       onChange={(e) => {
                                           onChange(e.target.value);
                                           this.setState({value: e.target.value});
                                       }}>{
                    options.map(item => <Antd.Radio.Button key={item.value || item}
                                                           value={item.value || item}>{item.name || item}</Antd.Radio.Button>)
                }</Antd.Radio.Group>
                break;
            case 'checkbox': // 多选框
                em = <Antd.Checkbox.Group {...this.newProps} className={className} disabled={disabled}
                                          options={options[0] && options[0].value ? options.map(item => ({
                                              label: item.name,
                                              value: item.value,
                                              disabled: item.disabled
                                          })) : options}
                                          value={value || []} style={style}
                                          onChange={(checkedList) => {
                                              onChange(checkedList);
                                              this.setState({value: checkedList})
                                          }}/>;
                break;
            case 'switch': // switch 开关

                em = <Antd.Switch  {...this.newProps} className={className} disabled={disabled}
                                   checkedChildren={options && options[0]}
                                   unCheckedChildren={options && options[1]} checked={!!value} style={{
                    ...style,
                    maxWidth: (options && options[0]) ? options && (options[0].length * 15 + 30) : 60
                }} onChange={this.newProps.confirm ? null : (checked) => {
                    onChange(checked);
                    this.setState({value: checked})
                }}/>;

                if (this.newProps.confirm) { // 有设置误操作弹框

                    em = <Antd.Popconfirm title={this.newProps.confirm} disabled={this.newProps.disabled} okText='Yes'
                                          cancelText='No' onConfirm={() => {
                        let checked = !value;
                        onChange(checked);
                        this.setState({value: checked});
                    }}>
                        {em}
                    </Antd.Popconfirm>
                }
                break;
            case 'time': // 时间选择
                em = <Antd.TimePicker {...this.newProps}
                                      className={className}
                                      disabled={disabled}
                                      placeholder={placeholder}
                                      style={style}
                                      onChange={(time, timeString) => {
                                          onChange(timeString);
                                          this.setState({value: timeString})
                                      }} value={value ? moment(value, 'HH:mm:ss') : null}/>;
                break;
            case 'date': // 日期选择
                const Picker = !this.props.pickerType || this.props.pickerType === 'DatePicker' ? Antd.DatePicker : Antd.DatePicker[this.props.pickerType];
                if (!Picker) {
                    em = 'Error pickerType:' + this.props.pickerType;
                    break;
                }
                let showTime;
                let format;
                if (this.props.showTime && this.props.pickerType !== 'MonthPicker' && this.props.pickerType !== 'WeekPicker') { // 支持日期选择器精确至时间单位
                    format = dateFormat + ' ' + timeFormat;
                    if (this.props.pickerType === 'RangePicker') { // 区间选择
                        showTime = {
                            hideDisabledOptions: true,
                            defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('11:59:59', 'HH:mm:ss')],

                        }
                    } else {
                        showTime = {defaultValue: moment('00:00:00', 'HH:mm:ss')};
                    }
                }
                em = <Picker
                    {...this.newProps}
                    className={className}
                    format={format}
                    showTime={showTime}
                    disabled={disabled}
                    style={style}
                    placeholder={placeholder} value={this.datePickerFormat(value)}
                    onChange={(time, timeString) => {
                        onChange(timeString);
                        this.setState({value: timeString})
                    }}/>;
                break;
            case 'file':
            case 'image': // 图片文件选择
                const limit = this.props.limit || 1;
                const token = this.state.uploadInfo.token;
                em = <div className={className} style={style}>

                    <Antd.Upload
                        {...this.newProps}
                        disabled={disabled}
                        action={this.state.uploadInfo.host}
                        listType="picture-card"
                        fileList={this.state.fileList}
                        accept={type === 'image' ? "image/*" : "*/*"}
                        name={this.state.uploadInfo.name || 'file'}
                        data={{token}}
                        onPreview={(file) => this.setState({previewImage: file.url || file.thumbUrl})}
                        onRemove={(e) => (!disabled)}
                        onChange={this.handleUploadChange}
                    >
                        {(this.state.fileList ? this.state.fileList.length : 0) >= limit ? null : <div>
                            <Antd.Icon type="plus"/>
                            <div className="ant-upload-text">Upload</div>
                        </div>}
                    </Antd.Upload>
                    <Antd.Modal visible={Boolean(this.state.previewImage)} footer={null} onCancel={(e) => {
                        this.setState({previewImage: ""});
                        e.stopPropagation()
                    }}>
                        <img alt="example" style={{width: '100%'}} src={this.state.previewImage}/>
                    </Antd.Modal>
                </div>
                break;
            case 'excel': //导入 excel 格式表单
                const {value: _v, ...p} = this.newProps;
                em = <input  {...p} type='file' className={className} style={style}
                             onChange={e => {
                                 const f = e.target.files;
                                 this.readExcelFile(f[0], onChange)
                             }}
                             accept=".csv,.xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"/>;
                break;
            case 'json': //导入 json文件
                const {  value: __v, ...op} = this.newProps;
                em = <input  {...op} type='file' className={className} style={style}
                             onChange={e => {
                                 const f = e.target.files;
                                 this.readJSONFile(f[0], onChange)
                             }}
                             accept=".json"/>;
                break;
            case 'textarea': // 长文本输入
                em = <Antd.Input.TextArea {...this.newProps} className={className} style={style} maxLength={maxLength}
                                          onPressEnter={onPressEnter}
                                          disabled={disabled}
                                          value={value} autoSize={true} placeholder={placeholder} onChange={(e) => {
                    onChange(e.currentTarget.value);
                    this.setState({value: e.currentTarget.value})
                }}/>;
                break;
            case 'search': // 带搜索图标的输入框
                em = <Antd.Input.Search
                    enterButton={this.newProps.enterButton}
                    loading={this.newProps.loading}
                    className={className}
                    maxLength={maxLength}
                    disabled={disabled}
                    defaultValue={value}
                    value={value}
                    onChange={(e) => this.setState({_value: e.currentTarget.value}) | (this.props.onChangeOnly && this.props.onChangeOnly(e.currentTarget.value))}
                    placeholder={placeholder}
                    onSearch={value => onChange(value) | this.setState({value: value})}
                    style={style}
                />;
                break;
            case 'code':

                em = <CustomComponent.CodeEditor
                    className={className}
                    data={value}
                    value={typeof value === 'string' ? value : ''}
                    onChange={onChange}
                    readOnly={disabled}
                    style={Object.assign({border: '1px #dfdfdf solid', borderRadius: 4}, style)}
                    theme={this.props.theme}
                    language={this.props.language}
                />
                break;
            default: // 普通文本
                em = <Antd.Input {...this.newProps} className={className} type={type} onPressEnter={onPressEnter}
                                 disabled={disabled}
                                 style={style} value={value}
                                 maxLength={maxLength} placeholder={placeholder} onChange={(e) => {
                    onChange(e.currentTarget.value);
                    this.setState({value: e.currentTarget.value});
                }}/>;
                break;


        }
        return em;
    }
}
