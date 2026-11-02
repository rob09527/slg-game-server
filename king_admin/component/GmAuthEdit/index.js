import React, {Component} from "react";
import * as Antd from 'antd';
import {execFunction, CustomComponent, i18n} from 'awko-admin/client';
import './index.less';

/**
 * gm 管理员权限编辑组件
 * @author awko
 * @version 0.0.1
 * @example
 *
 */
export default class GmAuthEdit extends Component {
    constructor(props) {
        super(props);
        this.onAllChange = this.onAllChange.bind(this);
        this.onChange = this.onChange.bind(this);
        this.submitChange = this.submitChange.bind(this);
        const {business = [], actions = []} = this.props;

        this.businessMap = {};
        const actionsMap = {}; // 选中的函数列表
        const tmp = {};
        actions.forEach(a => {
            tmp[a] = 1;
        });
        const allCheckMap = {};

        business.forEach(g => {
            this.businessMap[g.id] = g.types;
            for (const TYPE in g.types) {

                const PAGE_KEY = g.id + TYPE;
                actionsMap[PAGE_KEY] = actionsMap[PAGE_KEY] || [];
                allCheckMap[PAGE_KEY] = allCheckMap[PAGE_KEY] || {indeterminate: false, allChecked: false};
                const bus = g.types[TYPE];

                for (const b of bus) {
                    if (tmp[b.value]) {
                        actionsMap[g.id + TYPE].push(b.value);
                    }
                }
                Object.assign(allCheckMap[PAGE_KEY], this.checkIndeterminate(actionsMap[PAGE_KEY], this.businessMap[g.id][TYPE]));
            }

        });

        this.state = {
            actionsMap: actionsMap,
            allCheckMap: allCheckMap,
            action: this.props.action
        };
    }

    checkIndeterminate(actions, all) {
        console.log('actions.length', actions.length, 'all', all.length);
        const tmp = {};
        if (actions.length >= all.filter(o => !o.disabled).length) {
            tmp.indeterminate = false;
            tmp.allChecked = true;
        } else if (actions.length > 0) {
            tmp.indeterminate = true;
            tmp.allChecked = false;
        } else {
            tmp.indeterminate = false;
            tmp.allChecked = false;
        }
        return tmp;
    }

    onAllChange(gid, type, checked) {
        let actions = [];
        const KEY = gid + type;
        const oldActions = this.state.actionsMap[KEY] || [];


        const disabledActions = [];
        const list = this.businessMap[gid][type].filter(o => {
            if (o.disabled && oldActions.includes(o.value)) {
                disabledActions.push(o.value);
            }
            return !o.disabled;
        });
        if (checked) {
            actions = list.map(o => o.value);
        }
        actions.push(...disabledActions);
        this.state.actionsMap[KEY] = actions;
        this.submitChange(gid, type, oldActions);

        Object.assign(this.state.allCheckMap[KEY], this.checkIndeterminate(actions, this.businessMap[gid][type]));

        this.setState({});

    }

    onChange(gid, type, e) {
        const KEY = gid + type;
        const oldActions = this.state.actionsMap[gid] || [];
        this.state.actionsMap[KEY] = e;

        this.submitChange(gid, type, oldActions);

        Object.assign(this.state.allCheckMap[KEY], this.checkIndeterminate(e, this.businessMap[gid][type]));
        this.setState({});
    }

    submitChange(gid, type, oldActions) {
        const subActions = [];
        for (const t in this.businessMap[gid]) {
            const a = this.state.actionsMap[gid + t] || [];
            subActions.push(...a)
        }
        execFunction(this.props.action)({admin_id: this.props.admin_id, group: gid, actions: subActions}).catch(e => {
            const KEY = gid + type;
            this.state.actionsMap[KEY] = oldActions; // 还原 操作
            this.setState({})
        })
    }

    render() {
        const {className = "", business = []} = this.props;
        return <Antd.Tabs className={'gm-auth ' + className} type="card">
            {
                business.map(g => <Antd.Tabs.TabPane tab={i18n(g.name)} key={g.id}>
                    {Object.keys(this.businessMap[g.id]).map(KEY => <div className="gm-auth-tab-cli">
                        <div className="func-line">{i18n(KEY)}</div>
                        <div>
                            <Antd.Checkbox indeterminate={this.state.allCheckMap[g.id + KEY]['indeterminate']}
                                           checked={this.state.allCheckMap[g.id + KEY]['allChecked']}
                                           onChange={(e) => this.onAllChange(g.id, KEY, e.target.checked)}>
                                {i18n('SEL_ALL')}
                            </Antd.Checkbox>
                        </div>
                        <Antd.Checkbox.Group value={this.state.actionsMap[g.id + KEY]}
                                             options={this.businessMap[g.id][KEY].map(o => ({
                                                 ...o,
                                                 label: i18n(o.label)
                                             }))}
                                             onChange={(e) => this.onChange(g.id, KEY, e)}
                        >

                        </Antd.Checkbox.Group>
                        <div className="func-btm-line"></div>
                    </div>)}


                </Antd.Tabs.TabPane>)
            }
        </Antd.Tabs>
    }
}
