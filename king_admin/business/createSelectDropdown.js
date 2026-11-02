exports.name = '下拉框拓展';
exports.type = 'I';
exports.exec = function ({placeholder, btn}) {
    //  这段代码是构建下拉框的拓展输入框
    return ` menu => {
       return React.createElement('div',{ className: 'ak-admin-group'}, [
            React.createElement('span',{key:1},menu),
            React.createElement(Antd.Divider, {key: 2,style: { margin: '4px 0'} }),
            React.createElement('div', {key: 3, style:{display: 'flex',margin: '2px 4px'}}, [
                React.createElement(Antd.Input, {
                    key: '31',
                    placeholder: "${placeholder}",
                    size: 'small',
                    style: { display: 'inline-block', flex:1, marginRight: 2 },
                    onBlur:()=>{
                        this._m_.style.animation = '';
                        this._m_.style.display = '';
                    },
                    onMouseDown: (e)=> {
                        this._m_ = e.target.parentNode.parentNode.parentNode; // 拿到下拉框的dom
                        this._m_.style.display = 'block'; // 组织默认的不展示效果
                        this._m_.style.animation = 'none'; // 去掉动画效果
                        this._target_ = e.target;
                        e.preventDefault();
                        this._target_.focus()
                    },
                    onChange: (e)=> {
                        this._addValue_ = e.target.value;
                    }
                }),
                React.createElement(Antd.Button,{
                    key: 32, 
                    size: 'small',
                    onMouseDown: e => e.preventDefault(),
                    onClick: (e)=>{
                        if(!this._addValue_){
                            return;
                        }
                        this.target.props.options.push(this._addValue_);
                        this.target.props.onChange(this._addValue_);
                        this._target_.value = '';
                        this._m_.style.animation = '';
                        this._m_.style.display = '';
                    }
                },'${btn }')
            ])
            
       ])
    }`;

}
