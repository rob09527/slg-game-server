import React, {Component} from "react";
import * as Antd from 'antd';
import {execFunction, CustomComponent, getUploadAuthInfo, ComponentParse} from 'awko-admin/client';
import './index.less';
import AkInput from "../AkInput";

const Card = Antd.Card;
const Statistic = Antd.Statistic;

/**
 *
 * 公告内容编辑组件
 * @author awko
 * @version 0.0.1
 * @example
 *  {
 *      _type: 'KhBoard',
 *      orderTotalPrice : 112893, // 订单总金额
 *      monetary_unit : 'CNY',  // 金额单位
 *      orderCount : 1231,      // 订单总数
 *      activeCount : 2000,     // 活跃总数
 *      registerCount : 1112,   // 注册总数
 *      payCount : 1000,        // 付费总数
 *      addPayTotal : 3000,     // 注册人付费总金额
 *      addPayCount : 52        // 注册人付费总数
 *
 *  }
 *
 *
 *
 *
 */
export default class KhBoard extends Component {
    constructor(props) {
        super(props);

        this.state = {loading: false};
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
        const {
            title = '1001服',
            className = "", orderTotalPrice = 0, monetary_unit = 'CNY', orderCount = 0,
            activeCount = 0, registerCount = 0, payCount = 0, addPayTotal = 0, addPayCount = 0,
            loading
        } = this.props;

        const ORDER = `订单总额 (${monetary_unit})`;
        const addRate = addPayCount / registerCount; // 新增付费率
        const arppu = addPayTotal / addPayCount; // 新增付费 arppu
        const arpu = addPayTotal / registerCount; // 新增活跃 arpu
        const aArppu = orderTotalPrice / payCount; // 付费 arppu
        const aArpu = orderTotalPrice / activeCount; // 活跃 arpu

        return <div className={"kh-board " + className}>
            <h3 className="title">{title}</h3>
            <MCard loading={loading} title={ORDER} tooltip={'今日总订单金额(代金劵订单统计金额为0)'} value={orderTotalPrice} precision={2}
                   footer={
                       {
                           title: '总订单数',
                           value: orderCount,
                           tooltip: '今日确认订单总数'
                       }
                   }/>
            <MCard loading={loading} title={'注册数'} tooltip={'今日注册数'} value={registerCount} footer={
                {
                    title: '注册付费率',
                    tooltip: `注册付费数(${addPayCount}) / 注册数(${registerCount})`,
                    value: addRate * 100,
                    precision: 2,
                    suffix: '%'
                }
            }/>
            <MCard loading={loading} title={'累计活跃'} tooltip={'今日登录过的用户统计'} value={activeCount} footer={
                {
                    title: '活跃ARPU',
                    value: aArpu,
                    precision: 2,
                    tooltip: `订单总额(${orderTotalPrice})/活跃数(${activeCount})`
                }
            }/>
            <MCard loading={loading} title={'付费角色数'} value={payCount} tooltip={'今日付费角色总数'}  footer={
                {
                    title: '付费率',
                    value: 100 * payCount / activeCount,
                    precision: 2,
                    suffix: '%',
                    tooltip: `付费角色数(${payCount})/活跃数(${activeCount})`
                }
            }/>


            <MCard loading={loading} title={'注册付费金额'} value={addPayTotal} tooltip={'今日注册用户付费总金额'} footer={
                {
                    title: '注册付费ARPPU',
                    value: arppu,
                    precision: 2,
                    tooltip: `注册付费金额(${addPayTotal})/注册付费数(${addPayCount})`
                }
            }/>

            <MCard loading={loading} title={'付费ARPU'} value={aArppu} tooltip={ `订单总额(${orderTotalPrice})/付费角色数(${payCount})`} precision={2} footer={
                {
                    title: '注册活跃ARPU',
                    value: arpu,
                    precision: 2,
                    tooltip: `注册付费金额(${addPayTotal})/注册数(${registerCount})`
                }
            }/>
        </div>
    }
}
const makeTooltip = (title, tooltip)=>{
    if (tooltip){
        tooltip = tooltip.replace(/\(/g, '<span class="num">(').replace(/\)/g, ')</span>')
    }
    const titleSpin = <span >
        <ComponentParse _type='Icon' className={'tooltip-icon'} type="info-circle" _tooltip={<span className="kh-board-tooltip" dangerouslySetInnerHTML={{__html: tooltip}} ></span>}/>
        {title}
    </span>
    return titleSpin;
}
const MCard = (props) => {
    const {title, tooltip, value, footer, precision = 0, loading = false} = props;


    return <Card loading={loading}>


        <Statistic title={makeTooltip(title, tooltip)} value={value || 0} precision={precision}/>
        {
            footer && <div className="space-line"></div>
        }
        {
            footer && <Statistic className="card-footer" value={footer.value || 0} prefix={makeTooltip(footer.title, footer.tooltip)}
                                 precision={footer.precision || 0} suffix={footer.suffix}/>
        }

    </Card>
}
