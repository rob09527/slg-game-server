exports.name = '军团战补打';
exports.type = 'N';

exports.exec = async function (body, query, ctx) {
    const {legion, pvpDate} = body;


    await this.remote.agent_legionPvpBattle(pvpDate, legion[0]);
    return 'OK';
};

