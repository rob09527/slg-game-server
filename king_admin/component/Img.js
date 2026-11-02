import React, {Component} from "react";

/**
 *
 * @description 带点击 大图的 图片组件 ，表格单元格 image 类型也就是用的这组件
 * @author awko
 * @version 0.0.1
 */
export default class Img extends Component {

    constructor(props) {
        super(props);
        this.handleShowModal = this.handleShowModal.bind(this);
    }

    handleShowModal(src) {
        this.props.showModal({
            footer: null,
            children: <img src={this.props.src} style={{width: '100%'}}/>
        }, 'IMG');
    }

    render() {
        return <img className={this.props.className} style={this.props.style} id={this.props.id} src={this.props.src}
                    alt={this.props.alt}
                    onClick={this.props.onClick || this.handleShowModal}/>
    }
}
