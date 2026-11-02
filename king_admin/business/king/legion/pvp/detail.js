exports.name = '军团参与名单查询';
exports.type = 'I';
exports.inherit = 'legion-pvp-view';
exports.exec = async function (body, query, ctx) {
    const {legion, pvpDate} = body;

    const lpvp = await this.service.game.collection('legionpvpteams');
    const dataSource = [];
    const aLockTeam = await lpvp.findOne({legion: legion[0], pvpDate});
    const bLockTeam = await lpvp.findOne({legion: legion[1], pvpDate});

    let aRoles = {};
    let bRoles = {};
    if (aLockTeam) {

        for (const k in aLockTeam.team) { // top mid down 三路整容
            const tmd = aLockTeam.team[k];
            if (!Array.isArray(tmd)) continue;
            for (const team of tmd) { // 取每一路的上阵用户
                aRoles[team._role.rid] = team._role.rname;
            }
        }
    }

    if (bLockTeam) {

        for (const k in bLockTeam.team) { // top mid down 三路整容
            const tmd = bLockTeam.team[k];
            if (!Array.isArray(tmd)) continue;
            for (const team of tmd) { // 取每一路的上阵用户
                bRoles[team._role.rid] = team._role.rname;
            }
        }
    }
    // 转为 数组
    aRoles = Object.values(aRoles);
    bRoles = Object.values(bRoles);
    const max = Math.max(aRoles.length, bRoles.length);

    for (let i = 0; i < max; i++) {
        dataSource[i] = {
            a: aRoles[i] || '',
            b: bRoles[i] || ''
        }
    }

    const columns = [
        {

            title: '军团A',
            dataIndex: 'a'
        },
        {

            title: '军团B',
            dataIndex: 'b'
        }
    ]

    return {
        width: '65%',
        children: {
            _type: 'AkTable',
            columns,
            dataSource
        }
    }

};

