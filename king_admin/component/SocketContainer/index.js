import React, {Component} from "react";
import * as Antd from 'antd';
import './index.less';

/**
 *
 * websocket websocket 链接 容器
 * @author awko
 * @version 0.0.1
 * @example
 *  {
 *      _type: 'SocketContainer',
 *      host: '', // ws://127.0.0.1:8004
 *      children: [], // 子组件可以通过 window._socket 拿到 ws 链接对象 _socket.emit(action, data), _socket.on(action, ()=>{})
 *  }
 *
 *
 *
 *
 */
export default class SocketContainer extends Component {

    constructor(props) {

        super(props);
        const token = window.localStorage.getItem('admin-token');
        let adminId = "";
        try {
            const admininfo = JSON.parse(window.localStorage.getItem('admin'));
            adminId = admininfo.id;
        } catch (e) {
            console.warn(e);
        }


        const url = props.host;
        this.ws = new WebSocket(url + '?admin=' + token + "&adminid=" + adminId);
        this.emit = this.emit.bind(this);
        this.on = this.on.bind(this);
        this.state = {
            link_status: false,
        };
        this.listeners = {};
        this.ws.onopen = () => {
            console.log('链接成功');
            this.setState({
                link_status: true
            })
        };
        this.ws.onclose = (event) => {
            console.log('链接断开', event.code, event.reason);
            if (event.code !== 4001) {
                this.setState({
                    link_status: false
                })
            }
        };

        this.ws.onmessage = (event) => {
            console.log('message', event.data);
            const messageObj = JSON.parse(event.data);
            this.listeners[messageObj.action] && this.listeners[messageObj.action](messageObj.data);
            this.props.onAction && this.props.onAction(messageObj.action, messageObj.data);
        };
        this.socket = {
            client: this.ws,
            emit: this.emit,
            on: this.on,
            close: (code = 4002, reason = "") => {
                this.ws.close(code, reason);
            }
        }
        if (window._socket) {
            window._socket.close();
        }
        window._socket = this.socket;
    }

    componentWillUnmount() {
        this.ws && this.ws.close(4001);
        this.ws = null;
        window._socket = null;
    }

    emit(action, data) {
        this.ws.send(JSON.stringify({action, data}));
    }

    on(action, cb) {
        this.listeners[action] = cb;
    }

    render() {
        const {children} = this.props;
        return <div>
            {this.state.link_status ? <Antd.Icon className="link-icon conn" type="link"/> :
                <Antd.Icon className="link-icon disconn" type="disconnect"/>}
            {children}
        </div>
    }
}
