import React, {Component} from "react";
import * as Antd from 'antd';
import * as moment from "moment";
import {execFunction, paramReplace, ComponentParse, CustomComponent, i18n} from 'awko-admin/client';
import './index.less';

const FORMAT = 'YYYY-MM-DD HH:mm:ss';
/**
 *  title: i18n(item.title),    // 动态语言可以根据自己需要自行在组件中添加
 * @example
 *      {
 *          _type: 'AkTable',
 *          limit: 10,          // [可选] 1页展示的条数
 *          buttons: [          // [可选] 表格右上角的操作按钮
 *              {               // 按钮的设置参照 AkButton 文档
 *                  children: '添加'
 *              }
 *          ],
 *          rowKey: "uid",      // [可选] 数据主键
 *          selection: [        // [可选] 开启多选批量效果，传递 AkButton  ，该组件的默认 data为 {keys: [], rows: []} keys 为选中数据的 key数组，Table需指定rowKey, rows：则为选中的数据对象数组
 *              {
 *                  children: '批量执行'
 *              }
 *          ],
 *          timezone: '+08:00', // [可选] 指定时间格式的时区，默认按客户端本地时区格式化
 *          show: false, // [可选] 是否显示 默认否
 *          download: false,    // [可选] 默认 false, 设置为 true时，左下角会出现导出按钮， 可指定 string 类型 或 {url: "downloadurl", body: {...下载拓展参数}}}
 *          filter_history: true,  // [可选] 搜索记录， false 则不记录搜索记录，默认 true
 *          handleData: (data)=> data [可选]  处理数据返回的自定义钩子函数
 *          filter: [           // [可选] 过滤器，配合设置action使用, 所有过滤器的默认值可以通过 hash设置,例如 https://yourhost/admin-manager#name=abc&type=tc
 *              {
 *                  name: '姓名',
 *                  key:  'name',
 *                  repel: true| ['type'],  [可选] 处理过滤器的互斥逻辑， true 是表示互斥其他所有， ['key1','key2'] 互斥指定的 key2
 *                  // 参照 AkInput 文档 不设置 type 为 input 输入框，根据业务，筛选使用较多的类型有 select text date-RangePicker
 *              },
 *              {
 *                  name: '类别',     // 筛选名
 *                  key : 'type',    // 对应的筛选字段
 *                  type: 'select',  // 参照 AkInput 文档
 *                  option: [        // 参照 AkInput 文档
 *                       {name: '锦鲤', value: 'jl'}, // select的 默认值 会以select的第一个选项作为默认值
 *                       {name: '天窗', value: 'tc'}
 *                  ]
 *              }
 *          ],
 *          columns:[ // 表头设置
 *              {
 *                  title: '姓名',        // 表头名
 *                  dataIndex: 'name',   // 数据字段名
 *                  width: 80,           // [可选] 单元格宽度
 *                  sorter: true,        // [可选] 默认 false, 开启排序交互按钮
 *                  type: 'text',        // [可选] 默认 text, 单元格渲染类型, 可设置 image为图片展示，html 为渲染 html 标签字符串， text-date 为渲染时间，
 *                                       //  当然你想高度自定义，可以设置 Antd组件，如 Switch,等，也可以定义的组件如 AkInput,该组件内 this.props.rowData 可以拿到对应行数据
 *                  props: {},           //  type 类型为组件时，对应的组件属性
 *              },
 *              {
 *                  title: '联系方式',
 *                  children: [         // [可选] 合并拆分类型的表头设置
 *                      {
 *                          title: '手机号',
 *                          dataIndex: 'mobile'
 *                      },
 *                      {
 *                          title: '座机',
 *                          dataIndex: 'tel'
 *                      }
 *                  ]
 *              },
 *              {
                    title: '状态',
                    type: 'AkInput',  // 可支持单元格渲染自定义组件
                    dataIndex: 'status',
                    _valueKey: 'value',     // [可选] 这个字段的 值渲染到自定义组件的什么属性上，默认 value
                    action: 'admin-update', // [可选] 如果需要绑定提交事件
                    _actionKey: 'onChange', // [可选] 触发这个action的事件属性key，默认 onChange
                    props: {            // 自定义组件的属性设置
                        type: 'switch',
                        options: [
                            "正常",
                            "禁用"
                        ],
                        _: {    // this.props.rowData 可以拿到行数据
                            value: `this.props.rowData.status`, // 也可以使用这种方式赋值属性
                            onChange: `(v)=> execFunction('admin-update')({value: v, id: this.props.rowData.id})`,
                        }
                    }
                },
 {
                    title: '操作',        // 一个单元格渲染一个组件数组
                    type: 'components',
                    dataIndex: 'action',
                    components: [
                        {
                            _type: 'AkButton'
                        }
                    ]
                }
 *          ],
 *          _keySpan: false,            // [可选] 多样表格开启，默认 false
 *          action: 'admin-list',       // [可选] 数据查询函数，设置了这个可以做查询翻页，和 filter查询 ,该函数的返回格式为 { items: [], total: 20} , 或者 [{},{}],最好前者,方便翻页
 *          dataSource: [               // [可选] 设置了 dataSource 则 action 设置会无效, 该设置直接展示的数据
 *               {
 *                   name: '张三',
 *                   tel: '0755-0000',
 *                   mobile: '13888***888',
 *                   _to: 'admin-detail?name=${name}'  // 设置单元格跳转事件, 通过${key} 来指定行参数， 注意是 字符串的'${}'
 *               },
 *               {
 *                   name: '张三',
 *                   tel: '0722-00000000',  // mobile 没设置，若 _keySpan 为 true，则 mobile 这一格将不会被渲染，_keySpan为false的情况会有一格留空
 *                   colSpan: {      // 开启了 _keySpan 过后， colSpan 表示单元格向右占据格数
 *                       tel: 2,     // tel:2 表示 tel字段所在的这一格 向右占 2 格
 *                   },
 *                   rowSpan: {      // 开启了 _keySpan 过后， colSpan 表示单元格向下占据格数
 *                       tel: 2,     // tel:2 表示 tel字段所在的这一格 向下占 2 格
 *                   }
 *                   // 通过上诉方案来实现 单元格合并的效果，被合并的单元格本来所在值 设置为 undefined 或 不设置即可
 *               }
 *          ]
 *      }
 *
 *      // 数据查询函数的格式示例:
 *      const {_page_, _sort_, ...filter} = body;
 *      const {limit, current} = _page_; // current 为当前页数
 *      const offset = (current - 1) * limit;
 *      const opt = {}; // 查询条件封装
 *      if (filter.name){ // 简单演示条件
 *          opt.name = filter.name;
 *      }
 *      if (filter.type){ // 简单演示条件
 *          opt.type = filter.type;
 *      }
 *      if (_sort_.field === 'name'){ // 开启了对应的排序字段的情况
 *          _sort_.order === -1 ? '降序逻辑': '升序逻辑'
 *      }
 *      // ...执行自己的查询逻辑 const items = await this.db.mysql.main.query('....');
 *
 *      return { // 返回格式需注意， 当然可以直接返回 数据数组(不过这样不利于翻页)
 *          items: [],
 *          total: 0
 *      }
 * @author awko
 * @version 0.0.1
 */
export default class AkTable extends Component {
    constructor(props) {
        super(props);
        this.parseColumns = this.parseColumns.bind(this);
        this.loadActionDataSource = this.loadActionDataSource.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
        this.handleFilterRepel = this.handleFilterRepel.bind(this);
        this.initFilterValue = this.initFilterValue.bind(this);
        this.initHistory = this.initHistory.bind(this);
        this.handleSelectHistory = this.handleSelectHistory.bind(this);
        this.handleTableChange = this.handleTableChange.bind(this);
        this.renderHeader = this.renderHeader.bind(this);
        this.renderFooter = this.renderFooter.bind(this);
        this.refresh = this.refresh.bind(this);
        this.state = {
            dataSource: [],
            filterValue: {}, // 过滤条件
            sortValue: {}, // 排序数据
            pageValue: {current: 1, limit: props.limit}, // 翻页数据
            columns: this.parseColumns(props.columns || []),
            searchHistory: [],
            selectRows: [],
            selectRowData: []
        };
        if (props.filter && props.filter.length) { // 如果 有设置 过滤，对 filter 的初始值进行处理
            this.initFilterValue();
            if (props.filter_history === undefined || props.filter_history) {
                this.initHistory(); // 初始化搜索历史
            }
        }
        if (props.action) {
            this.loadActionDataSource(true);
        }

    }

    initFilterValue() {
        const filterMap = {};
        this.filterMap = filterMap;
        const defaultFilterValue = {};
        for (let f of this.props.filter) {
            filterMap[f.key] = f;
            if ( f.type === 'select' || f.type === 'radio') { // 下拉筛选组件 默认值取第一个
                f.value = f.options && f.options[0] ? (f.options[0].value || f.options[0]) : '';
                if (f.mode !== 'multiple') { // 多选框不选第一个
                    defaultFilterValue[f.key] = f.value;
                }
            }
        }
        let param = window.location.hash; // 支持 hash 的方式给 filter 添加初始值,例如：#name=abc&six=man
        if (param) {
            param = param.substring(1, param.length);//去掉第一个警号
            param = decodeURIComponent(param);
            const params = param.split("&");
            params.forEach(item => {
                let prm = item.split("=");
                if (prm.length === 2) {//确保格式为 k=v格式
                    if (prm[1].indexOf(',') > 0) {
                        defaultFilterValue[prm[0]] = prm[1].split(',');
                    } else {
                        defaultFilterValue[prm[0]] = prm[1];
                    }
                    this.DEF_FILTER_PARAM = true; // 标记有 默认 hash 搜索值
                    filterMap[prm[0]] && (filterMap[prm[0]].value = prm[1]); // 赋值到 控件上面去
                    this.handleFilterRepel(prm[0], filterMap[prm[0]].value, filterMap[prm[0]].repel);
                }
            });
        }
        this.state.filterValue = defaultFilterValue; // 默认值赋值给 state.filter ,网络请求会取该值
    }

    initHistory() {

        const KEY = (this.props.key || window.location.pathname) + '-' + Object.keys(this.filterMap).join('-');

        this.HIS_KEY = KEY;

        const historyContent = window.localStorage.getItem(this.HIS_KEY);
        if (historyContent) {
            try {
                const d = JSON.parse(historyContent);
                this.state.searchHistory = d;
            } catch (e) {
            }
        }

        if (this.DEF_FILTER_PARAM) { // 有默认的搜索内容
            this.state.searchHistory.unshift({
                filter: {...this.state.filterValue},
                date: moment().format(FORMAT)
            });
            this.state.searchHistory.splice(50, 10); // 删除超过50的
            window.localStorage.setItem(this.HIS_KEY, JSON.stringify(this.state.searchHistory));
        } else if (this.state.searchHistory.length > 0) {
            this.state.filterValue = this.state.searchHistory[0].filter;
            for (const key in this.filterMap) {
                this.handleFilterRepel(key, this.state.filterValue[key], this.filterMap[key].repel);
            }
        }
    }

    /**
     * 通过远程函数加载 数据
     */
    loadActionDataSource(isInit) {

        isInit ? (this.state.loading = true) : this.setState({loading: true});
        execFunction(paramReplace(this.props.action, this.props.data))({
            ...this.state.filterValue,
            _sort_: this.state.sortValue,
            _page_: this.state.pageValue
        }).then(data => {
            if (this.props.handleData) {
                data = this.props.handleData(data);
            }
            if (Array.isArray(data)) { // 后台直接返回的 数组数据
                this.setState({dataSource: data, loading: false});
            } else {
                const {items = [], time, total = 0, expendColumns, totalExpend} = data; // 带有翻页的数据格式
                this.setState({
                    loading: false,
                    time,
                    dataSource: items,
                    expendColumns: expendColumns,
                    total: total === undefined ? this.state.total : total,
                    totalExpend: totalExpend
                })
            }
        }).catch((e) => {
            this.setState({loading: false});
        });
    }

    /**
     * 刷新表
     */
    refresh() {
        if (!this.props.action) { // 没有 action 不处理访问逻辑
            this.setState({});
            return;
        }
        this.loadActionDataSource();
    }

    /**
     * 解析表头
     * @param columns
     * @returns
     */
    parseColumns(columns) {
        return columns.filter(item => item.show !== false).map(item => {
            const dataIndex = item.dataIndex;
            item = {
                ...item,
                title: i18n(item.title)  // 动态语言可以根据自己需要自行在组件中添加
            };
            if (item.children) {
                item.children = this.parseColumns(item.children);
            } else {
                item.render = (value, rowData, index) => { // 处理单元格的渲染逻辑
                    const cell = {
                        children: this.cellRender(item, value, rowData, index, dataIndex),
                        props: {}
                    };
                    if (this.props._keySpan) { // 开启了单元格拓展
                        // 处理单元格拓展逻辑
                        if (rowData.colSpan) {
                            cell.props.colSpan = rowData.colSpan[dataIndex] || 1;
                        }
                        if (rowData.rowSpan) {
                            cell.props.rowSpan = rowData.rowSpan[dataIndex] || 1;
                        }
                        // 该单元格没有数据则不展示该单元格
                        if (value === undefined) {
                            cell.props.colSpan = 0;
                            cell.props.rowSpan = 0;
                        }
                    }
                    return cell;
                }
            }
            return item;
        });
    }

    /**
     * 单元格渲染
     * @param column {object}对应单元格表头
     * @param value {any} 对应单元格数据
     * @param rowData {object} 对应行数据
     * @param index {number}
     * @param dataIndex {string} 字段 key
     */
    cellRender(column, value, rowData, index, dataIndex) {
        const type = column.type || 'text';
        let linkClick = undefined; // 处理调整点击事件
        if (column._to) { // 网页跳转
            console.log('this.props.history', this.props.history)
            linkClick = () => this.props.history.push(paramReplace(column._to, rowData));
        }
        switch (type) {
            case 'html':
                return <span onClick={linkClick} dangerouslySetInnerHTML={{__html: value}}/>
            case 'image':
                const style = column.props && column.props.style ? {...column.props.style} : {};
                style.width = column.width || '68px';
                return <CustomComponent.Img onClick={linkClick} src={value} {...(column.props || {})} style={style}/>;
            case 'text-date':
                let _D = moment(new Date(isNaN(value) ? value : +value));
                if (this.props.timezone) {
                    _D = _D.utcOffset(this.props.timezone);
                }
                value = value ? _D.format(FORMAT) : '';
            case 'text':
                return linkClick ? <a onClick={linkClick}>{value}</a> : value;
            default:
                const key = column._valueKey || 'value'; // 获取展示 value 字段的 key

                const addProps = column._valueKey ? {[key]: value} : {[key]: value, children: value}; // 默认 children

                if (Array.isArray(column.components)) { // 如果指定的事组件数组则
                    return column.components.map((one, index) => <ComponentParse onSubmitSuccess={this.refresh}
                                                                                 key={index} rowData={rowData}
                                                                                 loading={rowData._loading_}
                                                                                 onClick={linkClick} {...addProps} {...one}
                                                                                 style={one.style || {marginRight: 4}}/>);
                }


                if (column.action) { // 有设置提交 action, 则绑定提交事件
                    const actionKey = column._actionKey || 'onChange';
                    addProps[actionKey] = (v) => (rowData._loading_ = true) | this.setState({}) | execFunction(column.action)({
                        rowData: rowData,
                        [dataIndex]: v
                    })
                        .then(r => rowData[dataIndex] = v).finally(() => (rowData._loading_ = false) | this.setState({}));
                }
                return <ComponentParse onSubmitSuccess={this.refresh} _type={type} rowData={rowData}
                                       loading={rowData._loading_}
                                       onClick={linkClick} {...addProps} {...(column.props || {})}/>
        }
    }

    /**
     * 过滤条件改变
     *
     * @param key
     * @param value
     */
    handleFilterChange(key, value) {
        this.state.filterValue[key] = value;
        this.state.pageValue.current = 1;
        if (this.HIS_KEY) {
            this.state.searchHistory.unshift({
                filter: {...this.state.filterValue},
                date: moment().format(FORMAT)
            });
            this.state.searchHistory.splice(50, 10); // 删除超过50的
            window.localStorage.setItem(this.HIS_KEY, JSON.stringify(this.state.searchHistory));
        }

        this.loadActionDataSource();
    }

    /**
     * 处理过滤器的互斥逻辑
     * @param key
     * @param value
     * @param repel
     */
    handleFilterRepel(key, value, repel) {
        if (!repel) {
            return;
        } else if (repel === true) { // 互斥其他所有
            for (let k in this.filterMap) {
                if (k !== key) {
                    this.filterMap[k].disabled = !!value;
                }
            }
        } else if (Array.isArray(repel)) {
            for (let k in this.filterMap) {
                if (repel.includes(k)) {
                    this.filterMap[k].disabled = !!value;
                }
            }
        }
    }

    handleSelectHistory(index) {
        const item = this.state.searchHistory.splice(index, 1)[0];
        this.state.pageValue.current = 1;
        this.state.filterValue = item.filter;
        item.date = moment().format(FORMAT);
        this.state.searchHistory.unshift(item);
        window.localStorage.setItem(this.HIS_KEY, JSON.stringify(this.state.searchHistory));
        this.loadActionDataSource();
    }

    handleTableChange(page, filter, sort) {
        let change = false;
        if (sort) {
            const newSort = sort.order === undefined ? {} : {
                field: sort.field,
                order: sort.order === 'ascend' ? 1 : -1 // ascend升序，1表示升序
            };

            if (!this.state.sortValue.field && !newSort.field) {
                change = false;
            } else {
                change = this.state.sortValue.field !== newSort.field || this.state.sortValue.order !== newSort.order;
            }
            this.state.sortValue = newSort;
        }
        if (page) {
            this.state.pageValue.current = page.current;
            this.state.pageValue.limit = page.pageSize;
            if (this.props.dataSource) { // 固定数据无需网络请求
                this.setState({});
                return;
            } else if (this.state.dataSource && this.state.dataSource.length === this.state.total) {
                // 内容已经展示完也无需进行网络请求翻页
                this.setState({});
            } else {
                change = true;
            }
        }
        change && this.loadActionDataSource();
    }

    /**
     * 渲染头部布局
     */
    renderHeader() {
        const {header} = this.props;
        if (!header) {
            return '';
        }
        const headers = Array.isArray(header) ? header : [header];

        return <div style={{display: 'flex'}}>
            {
                headers.map(item => <ComponentParse {...item}/>)
            }
        </div>;
    }

    renderFooter() {
        const totalExpend = [].concat(this.props.totalExpend || this.state.totalExpend || []);

        totalExpend.unshift({
            title: i18n('total'),
            value: this.state.total
        });
        const {footer = !!this.props.action, download} = this.props;
        const tbodyChildren = [];
        let tr = null;
        let trChildren = [];
        for (let i = 0; i < totalExpend.length; i++) {
            const item = totalExpend[i];
            if (tr === null) {
                tr = <tr>{trChildren}</tr>;
                tbodyChildren.push(tr);
            }
            trChildren.push(<td className='footer-table-header'>{item.title}</td>, <td>{item.value}</td>)
            if (i % 5 === 4) {
                tr = null;
                trChildren = [];
            }
        }
        const footerTable = <table className='footer-table'>
            <tbody>
            {tbodyChildren}
            </tbody>
        </table>

        if (download) { // 开启了下载功能
            const url = download === true ? ('download?action=' + window.location.pathname.split('/').pop()) : typeof download === 'object' ? download.url : download;
            return <div style={{maxWidth: '75%'}}>
                <span>
                    {footerTable}
                </span>
                <CustomComponent.AkButton
                    style={{padding: 0}}
                    type="link"
                    _tooltip='超出50万,默认导出50万条'
                    data={Object.assign(this.state.filterValue, download.body)}
                    download={url}>
                    {`${i18n('export-excel')}`}
                </CustomComponent.AkButton>
            </div>
        }

        return footer === true ? footerTable :
            footer ? footer : false;
    }

    render() {
        const {
            dataSource,
            bordered,
            size,
            rowKey,
            className,
            filter,
            buttons,
            selection,
            footer = !!this.props.action,
            filter_history = true
        } = this.props;
        const expendColumns = this.props.expendColumns || this.state.expendColumns;

        const time = this.state.time;
        let header = '';
        if (time) {
            header = <span className="header-time">{i18n('数据更新时间')}:{moment(time).format('YYYY-MM-DD HH:mm:ss')}</span>;
        }
        // 优先展示 this.props传递的dataSource,没有则展示state.dataSource
        // PS:state.dataSource 是通过远程函数查询来，this.props是 组件自带的
        return <div className={"ak-table " + className}>

            <div className='ak-table-buttons' style={{
                display: (buttons && buttons.length) || (selection && selection.length) ? 'flex' : 'none',
                marginBottom: 4,
                flexDirection: 'row-reverse',
                right: 4
            }}>
                {
                    buttons && buttons.map((btn, index) => {

                        return <CustomComponent.AkButton className="header-btn" data={Object.assign({},this.state.filterValue)} onSubmitSuccess={this.refresh} {...btn}
                                                         key={index}>
                        </CustomComponent.AkButton>
                    })
                }
                {
                    selection && selection.map((btn, index) => {
                        return <Antd.Badge count={this.state.selectRows && this.state.selectRows.length}>
                            <CustomComponent.AkButton className="header-btn" onSubmitSuccess={this.refresh} disabled={!this.state.selectRows.length}
                                                      {...btn}
                                                      data={Object.assign( {keys: this.state.selectRows, rows: this.state.selectRowData}, btn.data)}
                                                      key={index}>
                            </CustomComponent.AkButton>
                        </Antd.Badge>
                    })
                }
                {header}
            </div>
            <div className='ak-table-filter'
                 style={{display: filter && filter.length ? 'flex' : 'none', flexWrap: 'wrap', marginBottom: 8}}>
                {
                    filter && filter_history &&
                    <Antd.Popover content={<Antd.Timeline>
                        {this.state.searchHistory.map((item, index) => {
                            return <Antd.Timeline.Item className="history-item" key={index}
                                                       onClick={() => this.handleSelectHistory(index)}>
                                {
                                    Object.keys(item.filter).map(key => `${this.filterMap[key] ? i18n(this.filterMap[key].name) : key}:${item.filter[key]}`).join(',') + ' [' + item.date + ']'
                                }
                            </Antd.Timeline.Item>
                        })}
                    </Antd.Timeline>} placement="bottomLeft" title={i18n('search-history')}
                    >
                        <Antd.Icon className="filter-history"
                                   type="history"/>
                    </Antd.Popover>
                }
                {
                    filter && filter.length && filter.map(item => {
                        return <div className='filter-line'
                                    key={item.key}>
                            <span>
                                {
                                    item._tooltip ? <Antd.Tooltip title={item._tooltip}>
                                            {i18n(item.name)}
                                        </Antd.Tooltip> :
                                        i18n(item.name)
                                }
                            </span>
                            <CustomComponent.AkInput  {...item}
                                                      value={this.state.filterValue[item.key] || null}
                                                      type={item.type && item.type !== 'text' ? item.type : 'search'}
                                                      className="filter-item"
                                                      onChangeOnly={(value) => {/*search没有搜索时的内容改变*/
                                                          this.state.filterValue[item.key] = value;
                                                          this.handleFilterRepel(item.key, value, item.repel);
                                                          this.setState({})
                                                      }
                                                      }
                                                      onChange={(value) => (item.value = value) | this.handleFilterRepel(item.key, value, item.repel) | this.handleFilterChange(item.key, value)}/>
                        </div>
                    })
                }
            </div>
            {
                this.renderHeader()
            }
            <Antd.Table bordered={bordered} columns={expendColumns ? [...this.state.columns.map(_ => ({
                ..._,
                width: _.width || 100,
                fixed: 'left'
            })), ...expendColumns] : this.state.columns}
                        dataSource={dataSource || this.state.dataSource}
                        footer={footer && this.renderFooter}
                        rowKey={rowKey}
                        size={size}
                        loading={this.state.loading}
                        rowSelection={selection && selection.length ? {
                            selectedRowKeys: this.state.selectRows,
                            onChange: (selectedRowKeys, selectedRows) => {
                                console.log('this select key', selectedRows);
                                this.setState({
                                    selectRows: selectedRowKeys,
                                    selectRowData: selectedRows
                                })
                            }
                        } : undefined}
                        scroll={expendColumns ? {x: 800} : undefined}
                        pagination={this.props.limit === undefined ? false : {
                            pageSize: this.props.limit,
                            total: this.state.total,
                            current: this.state.pageValue.current,
                        }}
                        onChange={this.handleTableChange}>
            </Antd.Table>
        </div>
    }
}

