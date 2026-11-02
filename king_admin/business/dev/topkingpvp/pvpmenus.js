exports.name = '巅峰战';
exports.type = 'N';
exports.view = true;
exports.open = true;

exports.exec = async function (body, query, ctx) {


    const menus = [
        ctx.actionSet.has('dev-topkingpvp-warzone-view') ? {
            name: '战区',
            id: `dev-topkingpvp-warzone-view`
        }: null,
        
    ];


    return menus.filter(Boolean);
};

