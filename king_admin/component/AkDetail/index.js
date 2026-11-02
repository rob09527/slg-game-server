import React, {Component} from "react";
import * as Antd from 'antd';
import {execFunction, CustomComponent} from 'awko-admin/client';
import './index.less';

/**
 *
 * @author awko
 * @version 0.0.1
 * @example
 *
 */
export default class AkDetail extends Component {
    constructor(props) {
        super(props);
        this.createTableCol = this.createTableCol.bind(this);

        this.state = {

        };
    }

    /**
     * 渲染详情表格的单元格
     *
     * */
    createTableCol(item, data){
        return item.value;
    }

    render() {
        const {className = "", data = []} = this.props;
        return <div className={'admin-detail '+ className}>
            <table className='detail-table'>
                <tbody>
                {data.map((item, index) => {
                    let valueCol = this.createTableCol(item,data);
                    let style = item.style;
                    return <tr key={index} style={style}>
                        <td className='tdTitle'>{item.title}</td>
                        <td>{valueCol}</td>
                    </tr>;
                })}
                </tbody>
            </table>
        </div>
    }
}
