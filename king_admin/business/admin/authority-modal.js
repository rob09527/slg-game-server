exports.name = '权限查看';
exports.type = 'O';
exports.exec = async function (body, query, ctx) {
    // ctx.i18n(g.name)  后台功能函数也支持 i18n
    const groupnames = {};

    const adminId = body.id;
    const adminName = body.name;
    let actions = await this.service.admin.actions(adminId);
    const isOwner = adminName === ctx.adminName;
    const ownerInfo = await this.service.admin.findOneById(ctx.adminId);
    console.log('owner is', ownerInfo);
    const isSuperAdmin = ownerInfo.group === 'SUPER_MANAGER';
    let hasAuthorityFoyUpdate = ctx.actionSet.has('admin-authority-update');


    Object.values(businessMap).filter(b => b.type !== 'I' && b.type !== 'O').forEach(b => {
        const g = b.group || '__others';
        groupnames[g] = groupnames[g] || [];
        groupnames[g].push(b);
    });

    const businessChildren = Object.keys(groupnames).map(g => {
        const business = {
            PAGE: [],
            FUNC: []
        };
        if (groupnames[g]) {
            groupnames[g].forEach(o => {
                let disabled;
                if (adminName === 'admin') {
                    disabled = g === 'admin'; // 超管不能修改自己的超管权限权限
                    disabled = ctx.adminName === 'admin' ? false : disabled; // 普通管理员不能修改超管权限
                    if (!disabled) {
                        if (o.id === 'admin-manager' || o.id === 'admin-authority-update') { //
                            disabled = true;
                        }
                    }

                } else if (isOwner) {
                    disabled = !isSuperAdmin; // 自己的权限不能修改（ SUPER 组的管理员可以
                } else if (!isSuperAdmin) { // 非 SUPER 组管理员，不能给人赋予自己没有的权限
                    disabled = !ctx.actionSet.has(o.id);
                }
                const tmp = {label: o.name, value: o.id, v: o.view, disabled};
                if (o.id && o.id.startsWith('king-analyze')) { // 统计类业务函数单独一组
                    business.ANALYZE = business.ANALYZE || [];
                    business.ANALYZE.push(tmp);
                }else if (o.view) {
                    business.PAGE.push(tmp)
                } else {
                    business.FUNC.push(tmp)
                }


            })
        }
        return {
            name: g,
            id: g,
            types: business
        }
    });

    return {

        width: '80%',
        action: 'admin-authority?admin_id=${id}',
        children: {
            _type: 'GmAuthEdit',
            business: businessChildren,
            actions,
            action: 'admin-authority-update',
            admin_id: adminId
        }

    };
}
