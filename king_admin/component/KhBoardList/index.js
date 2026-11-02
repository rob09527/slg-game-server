import React, {Component} from "react";
import * as Antd from 'antd';
import {execFunction, CustomComponent, getUploadAuthInfo, i18n} from 'awko-admin/client';
import './index.less';
import AkInput from "../AkInput";

/**
 *
 * 公告内容编辑组件
 * @author awko
 * @version 0.0.1
 * @example
 *  {
 *      _type: 'KhBoardList',
 *      show_auto: false , 是否展示 自动刷新
 *  }
 *
 *
 *
 *
 */
export default class KhBoard extends Component {
    constructor(props) {
        super(props);
        this.filterChange = this.filterChange.bind(this);
        this.loadData = this.loadData.bind(this);
        this.handleFlushTimer = this.handleFlushTimer.bind(this);
        this.handleChangeCoupon = this.handleChangeCoupon.bind(this);
        this.state = {
            loading: false,
            coupon: false,
            filterValue: {
                servid: [],
                channel: "ALL",
                platform: 'ALL'
            },
            data: {},
            groupData: {}
        };
    }

    componentDidMount() {
        this.loadData();
    }

    filterChange(key, value) {
        this.state.filterValue [key] = value;
        this.loadData();
    }

    handleFlushTimer(v) {
        if (v) {
            this.loadData(false);
            this.TIMER = setInterval(() => {
                this.loadData(false);
            }, 10000);
        } else {
            if (this.TIMER) {
                clearInterval(this.TIMER);
            }
        }
    }

    handleChangeCoupon(v){
        console.log('this v', v);
        this.state.coupon = v;
        this.loadData(true);
    }

    /**
     *
     * @param loading {boolean} 需要开启 loading 么，默认 开启
     */
    loadData(loading = true) {
        const servers = this.state.filterValue.servid && this.state.filterValue.servid.length > 0 ?
            this.state.filterValue.servid : null;

        this.setState({btn_loading: true});
        execFunction(this.props.action)({...this.state.filterValue, servid: servers, coupon: this.state.coupon}).catch(e => {
            return {loading: loading, error: e}
        }).then(res => {
            this.state.data = res;
            if (  Array.isArray(this.props.serversGroup)){
               const arr = this.props.serversGroup.map(({name, servers})=> {
                    return execFunction(this.props.action)({...this.state.filterValue, servid: servers, coupon: this.state.coupon}).then(res => {
                        this.state.groupData[name] = res;
                    }).catch(e => {
                        return {loading: loading, error: e}
                    })
                });
               return  Promise.all(arr);
            }
            return res;
        }).then(r => {
            this.setState({btn_loading: false});
        })
    }

    componentWillUnmount() {
        if (this.TIMER) {
            clearInterval(this.TIMER);
        }
    }

    render() {
        const {
            monetary_unit,
            show_auto,
            download,
            show_coupon,
            serversGroup
        } = this.props;
        const hasSelect = this.state.filterValue.servid && this.state.filterValue.servid.length > 0;


        return <div className="kh-board-list">
            <div className="filter">
                <span className="f-label">服务器</span>
                <CustomComponent.AkInput
                    type='select'
                    mode="multiple"
                    value={this.state.filterValue.servid}
                    options={this.props.servers}
                    style={{minWidth: 180}}
                    onChange={(v) => this.filterChange('servid', v)}
                />
                <span className="f-label">包名</span>
                <CustomComponent.AkInput
                    type='select'
                    value={this.state.filterValue.channel}
                    options={['ALL', ...this.props.channels]}
                    showSearch={true}
                    style={{minWidth: 150}}
                    onChange={(v) => this.filterChange('channel', v)}
                />
                <span className="f-label">设备</span>
                <CustomComponent.AkInput
                    type='select'
                    value={this.state.filterValue.platform}
                    options={['ALL', 'android', 'ios', 'h5', 'wechatgame']}
                    style={{minWidth: 100}}
                    onChange={(v) => this.filterChange('platform', v)}
                />
                <CustomComponent.AkInput
                    type='switch'
                    onChange={this.handleFlushTimer}
                    style={
                        {
                            maxWidth: "90px",
                            position: "absolute",
                            right: "24px",
                            top: "21px",
                            display: show_auto ? "block" : "none"
                        }
                    }
                    _tooltip={i18n('每10秒刷新一次')}
                    options={[
                        i18n('自动刷新'),
                        i18n('自动刷新')
                    ]}
                />
                {
                    show_coupon && <CustomComponent.AkInput
                        type='switch'
                        onChange={this.handleChangeCoupon}
                        value={this.state.coupon}
                        style={
                            {
                                maxWidth: "90px",
                                position: "absolute",
                                right: download? "280px":"120px",
                                top: "21px",
                            }
                        }
                        _tooltip={i18n('默认代金券算单不算金额')}
                        options={[
                            i18n('忽略代金券'),
                            i18n('忽略代金券')
                        ]}
                    />
                }
                <Antd.Button style={
                    {
                        maxWidth: "90px",
                        position: "absolute",
                        right: "24px",
                        top: "18px",
                        display: show_auto ? "none" : "block"
                    }
                } loading={this.state.btn_loading} onClick={() => this.loadData(false)}>
                    刷新
                </Antd.Button>
                <CustomComponent.AkButton
                    style={
                        {
                            position: "absolute",
                            top: " 18px",
                            right: "148px",
                            display: download ? "block" : "none"
                        }
                    }
                    loading={this.state.btn_loading}
                    data={{
                        coupon: this.state.coupon
                    }}
                    download={download}
                >分渠道导出</CustomComponent.AkButton>
            </div>
            <CustomComponent.KhBoard
                title={hasSelect ? `选服看板`: `全服看板`}
                monetary_unit={monetary_unit}
                {
                    ...(this.state.data || {loading: false})
                }
            />
            {
                this.state.data && this.state.data.each && this.state.data.each.map (data => <CustomComponent.KhBoard
                    title={data.name}
                    monetary_unit={monetary_unit}
                    key={data.name}
                    {
                        ...data || {loading: false}
                    }
                />)
            }
            {
                serversGroup && serversGroup.map(({name}) => <CustomComponent.KhBoard
                    title={name}
                    monetary_unit={monetary_unit}
                    key={name}
                    {
                        ...(this.state.groupData[name] || {loading: false})
                    }
                />)
            }
        </div>

    }
}

