const { ObjectID } = require("mongodb");
exports.name = '高级角色';
exports.type = 'N';

exports.exec = async function (body, query, ctx) {

    let { rid, servid, type, value, uid } = body;
    let r;
    const roleModel = await this.service.game.collection('roles');
    const obid = ObjectID(rid);

    if (type === "qwj") {
        r = await this.remote.agent_prop_more({ uid: uid, servid: +servid }, [{ gsid: 90158, count: 200 }], 'GM_SEND');
        // 全武将
        let items = [
            { gsid: 10001, count: 1 },
            { gsid: 12001, count: 1 },
            { gsid: 14001, count: 1 },
            { gsid: 16001, count: 1 },
            { gsid: 10021, count: 1 },
            { gsid: 12021, count: 1 },
            { gsid: 14021, count: 1 },
            { gsid: 16021, count: 1 },
            { gsid: 10041, count: 1 },
            { gsid: 10061, count: 1 },
            { gsid: 12041, count: 1 },
            { gsid: 12061, count: 1 },
            { gsid: 14041, count: 1 },
            { gsid: 14061, count: 1 },
            { gsid: 16041, count: 1 },
            { gsid: 16061, count: 1 },
            { gsid: 17001, count: 1 },
            { gsid: 18001, count: 1 },
            { gsid: 10081, count: 1 },
            { gsid: 10101, count: 1 },
            { gsid: 10121, count: 1 },
            { gsid: 10141, count: 1 },
            { gsid: 12081, count: 1 },
            { gsid: 12101, count: 1 },
            { gsid: 12121, count: 1 },
            { gsid: 12141, count: 1 },
            { gsid: 14081, count: 1 },
            { gsid: 14101, count: 1 },
            { gsid: 14121, count: 1 },
            { gsid: 14141, count: 1 },
            { gsid: 16081, count: 1 },
            { gsid: 16101, count: 1 },
            { gsid: 16121, count: 1 },
            { gsid: 16141, count: 1 },
            { gsid: 17021, count: 1 },
            { gsid: 17041, count: 1 },
            { gsid: 18021, count: 1 },
            { gsid: 18041, count: 1 },
            { gsid: 10161, count: 1 },
            { gsid: 10181, count: 1 },
            { gsid: 10201, count: 1 },
            { gsid: 10221, count: 1 },
            { gsid: 12161, count: 1 },
            { gsid: 12181, count: 1 },
            { gsid: 12201, count: 1 },
            { gsid: 12221, count: 1 },
            { gsid: 12241, count: 1 },
            { gsid: 14161, count: 1 },
            { gsid: 14181, count: 1 },
            { gsid: 14201, count: 1 },
            { gsid: 14221, count: 1 },
            { gsid: 14241, count: 1 },
            { gsid: 16161, count: 1 },
            { gsid: 16181, count: 1 },
            { gsid: 16201, count: 1 },
            { gsid: 16221, count: 1 },
            { gsid: 16241, count: 1 },
            { gsid: 10241, count: 1 },
            { gsid: 10261, count: 1 },
            { gsid: 10281, count: 1 },
            { gsid: 10301, count: 1 },
            { gsid: 10321, count: 1 },
            { gsid: 12261, count: 1 },
            { gsid: 12281, count: 1 },
            { gsid: 12301, count: 1 },
            { gsid: 12321, count: 1 },
            { gsid: 14261, count: 1 },
            { gsid: 14281, count: 1 },
            { gsid: 14301, count: 1 },
            { gsid: 14321, count: 1 },
            { gsid: 16261, count: 1 },
            { gsid: 16281, count: 1 },
            { gsid: 16301, count: 1 },
            { gsid: 16321, count: 1 },
            { gsid: 10341, count: 1 },
            { gsid: 10361, count: 1 },
            { gsid: 10381, count: 1 },
            { gsid: 12341, count: 1 },
            { gsid: 12361, count: 1 },
            { gsid: 12381, count: 1 },
            { gsid: 14341, count: 1 },
            { gsid: 14361, count: 1 },
            { gsid: 14381, count: 1 },
            { gsid: 16341, count: 1 },
            { gsid: 16361, count: 1 },
            { gsid: 16381, count: 1 },
            { gsid: 17061, count: 1 },
            { gsid: 18061, count: 1 },
            { gsid: 17081, count: 1 },
            { gsid: 18081, count: 1 },
            { gsid: 17101, count: 1 },
            { gsid: 17121, count: 1 },
            { gsid: 18121, count: 1 },
            { gsid: 17141, count: 1 },
            { gsid: 18141, count: 1 },
            { gsid: 12401, count: 1 },
            { gsid: 18101, count: 1 },

            { gsid: 14401, count: 1 },
            { gsid: 14402, count: 1 },
            { gsid: 14410, count: 1 },
            { gsid: 10401, count: 1 },
            { gsid: 10402, count: 1 },
            { gsid: 10410, count: 1 },
            { gsid: 16401, count: 1 },
            { gsid: 16402, count: 1 },
            { gsid: 16410, count: 1 },
            { gsid: 12421, count: 1 },
            { gsid: 12422, count: 1 },
            { gsid: 12430, count: 1 },
        ];
        r = await this.remote.agent_prop_more({ uid: uid, servid: +servid }, items, 'GM_SEND');
    }
    else if (type === "fjtx") {
        r = await this.remote.agent_prop_more({ uid: uid, servid: +servid }, [{ gsid: 90158, count: 200 }], 'GM_SEND');
        // 富甲天下
        let items = [
            { gsid: 38005, count: 990000 },
            { gsid: 38006, count: 990000 },
            { gsid: 38008, count: 990000 },
            { gsid: 38009, count: 990000 },
            { gsid: 38010, count: 990000 },
            { gsid: 38013, count: 990000 },
            { gsid: 38014, count: 990000 },
            { gsid: 38015, count: 990000 },
            { gsid: 38016, count: 990000 },
            { gsid: 38017, count: 990000 },
            { gsid: 38018, count: 990000 },
        ];
        for (let i = 30001; i <= 30035; i++) {
            items.push({ gsid: i, count: 990000 });
        }
        items.push({ gsid: 30039, count: 990000 });
        items.push({ gsid: 30047, count: 990000 });
        items.push({ gsid: 30048, count: 990000 });
        items.push({ gsid: 30049, count: 990000 });
        items.push({ gsid: 30052, count: 990000 });
        for (let i = 30064; i <= 30072; i++) {
            items.push({ gsid: i, count: 990000 });
        }
        items.push({ gsid: 30077, count: 990000 });
        items.push({ gsid: 30083, count: 990000 });
        items.push({ gsid: 30084, count: 990000 });
        items.push({ gsid: 30086, count: 990000 });
        items.push({ gsid: 30087, count: 990000 });
        items.push({ gsid: 30090, count: 990000 });
        items.push({ gsid: 30092, count: 990000 });
        items.push({ gsid: 30093, count: 990000 });
        items.push({ gsid: 30094, count: 990000 });
        items.push({ gsid: 30095, count: 990000 });
        items.push({ gsid: 30096, count: 990000 });
        items.push({ gsid: 30099, count: 990000 });
        items.push({ gsid: 30100, count: 990000 });
        items.push({ gsid: 30101, count: 990000 });
        items.push({ gsid: 30103, count: 990000 });
        items.push({ gsid: 30104, count: 990000 });
        for (let i = 30107; i <= 30141; i++) {
            items.push({ gsid: i, count: 990000 });
        }
        r = await this.remote.agent_prop_more({ uid: uid, servid: +servid }, items, 'GM_SEND');
    }
    else if (type === "gnjs") {
        // 功能解锁
        let level = 200; //200等级
        let exp = this.service.game.config.roleexp.slice(0, level).reduce((sum, cur) => sum + cur, 0);
        let chapter = 15101; // 31-1
        let idx = Object.keys(this.service.game.config.chapter).indexOf('' + chapter);
        r = await roleModel.updateOne({ _id: obid }, { $set: { 'hide.38001.count': exp, _maxmapid: idx } });
    }
    else if (type === "ycqk") {
        r = await this.remote.agent_prop_more({ uid: uid, servid: +servid }, [{ gsid: 90158, count: 200 }], 'GM_SEND');
        // 养成全开
        const zhenbaoModel = await this.service.game.collection('zhenbaos');
        let zbidList = [
            57000,
            57001,
            57002,
            57003,
            57004,
            57005,
            57006,
            57007,
            57008,
            57009,
            57010,
            57011,
            57012,
            57013,
            57014,
            57015,
            57016,
            57017,
            57018,
            57019,
            57020,
            57021,
            57022,
            57023,
            57024,
            57025,
            57026,
            57027,
            57028,
            57029,
            57030,
            57031,
            57032,
            57033,
            57034,
            57035,
            57036,
            57037,
            57038,
            57039,
            57040,
            57060,
            57080,
            57100,
            57120,
            57140,
            57160,
            57180,
            57200,
            57220,
            57240,
            57260,
            57280,
            57300,
            57320,
            57340,
            57360,
            57380,
            57400,
            57420,
            57440,
            57441,
            57442,
            57443,
            57444,
        ];
        // 查找已有珍宝
        let exist_zblist = await zhenbaoModel.find({ zbId: { $in: zbidList } }, { zbId: 1 });
        exist_zblist = await exist_zblist.toArray();
        // 排除已有珍宝并构建新珍宝数据
        zbidList = zbidList.filter(zbid => {
            // const _zb = exist_zblist.deepQueryOne('zbId', zbid);
            const _zb = exist_zblist.some(d => d.zbId == zbid);
            return !_zb;
        }).map(zbid => ({ zbId: zbid, rid: rid }));
        if (zbidList.length > 0) {
            await zhenbaoModel.insertMany(zbidList);
        }
        let items = [
            // 魂石
            { gsid: 56000, count: 10 },
            { gsid: 56001, count: 10 },
            { gsid: 56002, count: 10 },
            { gsid: 56003, count: 10 },
            { gsid: 56004, count: 10 },
            { gsid: 56010, count: 10 },
            { gsid: 56011, count: 10 },
            { gsid: 56012, count: 10 },
            { gsid: 56013, count: 10 },
            { gsid: 56014, count: 10 },
            { gsid: 56020, count: 10 },
            { gsid: 56021, count: 10 },
            { gsid: 56022, count: 10 },
            { gsid: 56023, count: 10 },
            { gsid: 56024, count: 10 },
            { gsid: 56030, count: 10 },
            { gsid: 56031, count: 10 },
            { gsid: 56032, count: 10 },
            { gsid: 56033, count: 10 },
            { gsid: 56034, count: 10 },
            { gsid: 56040, count: 10 },
            { gsid: 56041, count: 10 },
            { gsid: 56042, count: 10 },
            { gsid: 56043, count: 10 },
            { gsid: 56044, count: 10 },
            { gsid: 56300, count: 10 },
            { gsid: 56301, count: 10 },
            { gsid: 56302, count: 10 },
            { gsid: 56303, count: 10 },
            { gsid: 56304, count: 10 },
            { gsid: 56310, count: 10 },
            { gsid: 56311, count: 10 },
            { gsid: 56312, count: 10 },
            { gsid: 56313, count: 10 },
            { gsid: 56314, count: 10 },
            { gsid: 56320, count: 10 },
            { gsid: 56321, count: 10 },
            { gsid: 56322, count: 10 },
            { gsid: 56323, count: 10 },
            { gsid: 56324, count: 10 },
            { gsid: 56330, count: 10 },
            { gsid: 56331, count: 10 },
            { gsid: 56332, count: 10 },
            { gsid: 56333, count: 10 },
            { gsid: 56334, count: 10 },
            { gsid: 56340, count: 10 },
            { gsid: 56341, count: 10 },
            { gsid: 56342, count: 10 },
            { gsid: 56343, count: 10 },
            { gsid: 56344, count: 10 },
            { gsid: 56600, count: 10 },
            { gsid: 56601, count: 10 },
            { gsid: 56602, count: 10 },
            { gsid: 56603, count: 10 },
            { gsid: 56604, count: 10 },
            { gsid: 56610, count: 10 },
            { gsid: 56611, count: 10 },
            { gsid: 56612, count: 10 },
            { gsid: 56613, count: 10 },
            { gsid: 56614, count: 10 },
            { gsid: 56620, count: 10 },
            { gsid: 56621, count: 10 },
            { gsid: 56622, count: 10 },
            { gsid: 56623, count: 10 },
            { gsid: 56624, count: 10 },
            { gsid: 56630, count: 10 },
            { gsid: 56631, count: 10 },
            { gsid: 56632, count: 10 },
            { gsid: 56633, count: 10 },
            { gsid: 56634, count: 10 },
            { gsid: 56640, count: 10 },
            { gsid: 56641, count: 10 },
            { gsid: 56642, count: 10 },
            { gsid: 56643, count: 10 },
            { gsid: 56644, count: 10 },
            // 奇书
            { gsid: 54001, count: 10 },
            { gsid: 54002, count: 10 },
            { gsid: 54003, count: 10 },
            { gsid: 54004, count: 10 },
            { gsid: 54011, count: 10 },
            { gsid: 54012, count: 10 },
            { gsid: 54013, count: 10 },
            { gsid: 54014, count: 10 },
            { gsid: 54021, count: 10 },
            { gsid: 54022, count: 10 },
            { gsid: 54023, count: 10 },
            { gsid: 54024, count: 10 },
            { gsid: 54031, count: 10 },
            { gsid: 54032, count: 10 },
            { gsid: 54033, count: 10 },
            { gsid: 54034, count: 10 },
            { gsid: 54041, count: 10 },
            { gsid: 54042, count: 10 },
            { gsid: 54043, count: 10 },
            { gsid: 54044, count: 10 },
            { gsid: 54051, count: 10 },
            { gsid: 54052, count: 10 },
            { gsid: 54053, count: 10 },
            { gsid: 54054, count: 10 },
            { gsid: 54101, count: 10 },
            { gsid: 54102, count: 10 },
            { gsid: 54103, count: 10 },
            { gsid: 54104, count: 10 },
            { gsid: 54111, count: 10 },
            { gsid: 54112, count: 10 },
            { gsid: 54113, count: 10 },
            { gsid: 54114, count: 10 },
            { gsid: 54121, count: 10 },
            { gsid: 54122, count: 10 },
            { gsid: 54123, count: 10 },
            { gsid: 54124, count: 10 },
            { gsid: 54131, count: 10 },
            { gsid: 54132, count: 10 },
            { gsid: 54133, count: 10 },
            { gsid: 54134, count: 10 },
            { gsid: 54141, count: 10 },
            { gsid: 54142, count: 10 },
            { gsid: 54143, count: 10 },
            { gsid: 54144, count: 10 },
            { gsid: 54151, count: 10 },
            { gsid: 54152, count: 10 },
            { gsid: 54153, count: 10 },
            { gsid: 54154, count: 10 },
            { gsid: 54201, count: 10 },
            { gsid: 54202, count: 10 },
            { gsid: 54203, count: 10 },
            { gsid: 54204, count: 10 },
            { gsid: 54211, count: 10 },
            { gsid: 54212, count: 10 },
            { gsid: 54213, count: 10 },
            { gsid: 54214, count: 10 },
            { gsid: 54221, count: 10 },
            { gsid: 54222, count: 10 },
            { gsid: 54223, count: 10 },
            { gsid: 54224, count: 10 },
            { gsid: 54231, count: 10 },
            { gsid: 54232, count: 10 },
            { gsid: 54233, count: 10 },
            { gsid: 54234, count: 10 },
            { gsid: 54241, count: 10 },
            { gsid: 54242, count: 10 },
            { gsid: 54243, count: 10 },
            { gsid: 54244, count: 10 },
            { gsid: 54251, count: 10 },
            { gsid: 54252, count: 10 },
            { gsid: 54253, count: 10 },
            { gsid: 54254, count: 10 },
            { gsid: 54301, count: 10 },
            { gsid: 54302, count: 10 },
            { gsid: 54303, count: 10 },
            { gsid: 54304, count: 10 },
            { gsid: 54311, count: 10 },
            { gsid: 54312, count: 10 },
            { gsid: 54313, count: 10 },
            { gsid: 54314, count: 10 },
            { gsid: 54321, count: 10 },
            { gsid: 54322, count: 10 },
            { gsid: 54323, count: 10 },
            { gsid: 54324, count: 10 },
            { gsid: 54331, count: 10 },
            { gsid: 54332, count: 10 },
            { gsid: 54333, count: 10 },
            { gsid: 54334, count: 10 },
            { gsid: 54341, count: 10 },
            { gsid: 54342, count: 10 },
            { gsid: 54343, count: 10 },
            { gsid: 54344, count: 10 },
            { gsid: 54351, count: 10 },
            { gsid: 54352, count: 10 },
            { gsid: 54353, count: 10 },
            { gsid: 54354, count: 10 },
            { gsid: 54401, count: 10 },
            { gsid: 54402, count: 10 },
            { gsid: 54403, count: 10 },
            { gsid: 54404, count: 10 },
            { gsid: 54411, count: 10 },
            { gsid: 54412, count: 10 },
            { gsid: 54413, count: 10 },
            { gsid: 54414, count: 10 },
            { gsid: 54421, count: 10 },
            { gsid: 54422, count: 10 },
            { gsid: 54423, count: 10 },
            { gsid: 54424, count: 10 },
            { gsid: 54431, count: 10 },
            { gsid: 54432, count: 10 },
            { gsid: 54433, count: 10 },
            { gsid: 54434, count: 10 },
            { gsid: 54441, count: 10 },
            { gsid: 54442, count: 10 },
            { gsid: 54443, count: 10 },
            { gsid: 54444, count: 10 },
            { gsid: 54451, count: 10 },
            { gsid: 54452, count: 10 },
            { gsid: 54453, count: 10 },
            { gsid: 54454, count: 10 },
            { gsid: 54501, count: 10 },
            { gsid: 54502, count: 10 },
            { gsid: 54503, count: 10 },
            { gsid: 54504, count: 10 },
            { gsid: 54511, count: 10 },
            { gsid: 54512, count: 10 },
            { gsid: 54513, count: 10 },
            { gsid: 54514, count: 10 },
            { gsid: 54521, count: 10 },
            { gsid: 54522, count: 10 },
            { gsid: 54523, count: 10 },
            { gsid: 54524, count: 10 },
            { gsid: 54531, count: 10 },
            { gsid: 54532, count: 10 },
            { gsid: 54533, count: 10 },
            { gsid: 54534, count: 10 },
            { gsid: 54541, count: 10 },
            { gsid: 54542, count: 10 },
            { gsid: 54543, count: 10 },
            { gsid: 54544, count: 10 },
            { gsid: 54551, count: 10 },
            { gsid: 54552, count: 10 },
            { gsid: 54553, count: 10 },
            { gsid: 54554, count: 10 },
            { gsid: 54601, count: 10 },
            { gsid: 54602, count: 10 },
            { gsid: 54603, count: 10 },
            { gsid: 54604, count: 10 },
            { gsid: 54611, count: 10 },
            { gsid: 54612, count: 10 },
            { gsid: 54613, count: 10 },
            { gsid: 54614, count: 10 },
            { gsid: 54621, count: 10 },
            { gsid: 54622, count: 10 },
            { gsid: 54623, count: 10 },
            { gsid: 54624, count: 10 },
            { gsid: 54631, count: 10 },
            { gsid: 54632, count: 10 },
            { gsid: 54633, count: 10 },
            { gsid: 54634, count: 10 },
            { gsid: 54641, count: 10 },
            { gsid: 54642, count: 10 },
            { gsid: 54643, count: 10 },
            { gsid: 54644, count: 10 },
            { gsid: 54651, count: 10 },
            { gsid: 54652, count: 10 },
            { gsid: 54653, count: 10 },
            { gsid: 54654, count: 10 },
            // 装备
            { gsid: 33990, count: 100 },
            { gsid: 33991, count: 100 },
            { gsid: 33001, count: 100 },
            { gsid: 33002, count: 100 },
            { gsid: 33003, count: 100 },
            { gsid: 33004, count: 100 },
            { gsid: 33005, count: 100 },
            { gsid: 33006, count: 100 },
            { gsid: 33007, count: 100 },
            { gsid: 33008, count: 100 },
            { gsid: 33009, count: 100 },
            { gsid: 33010, count: 100 },
            { gsid: 33011, count: 100 },
            { gsid: 33012, count: 100 },
            { gsid: 33013, count: 100 },
            { gsid: 33014, count: 100 },
            { gsid: 33015, count: 100 },
            { gsid: 33016, count: 100 },
            { gsid: 33017, count: 100 },
            { gsid: 33101, count: 100 },
            { gsid: 33102, count: 100 },
            { gsid: 33103, count: 100 },
            { gsid: 33104, count: 100 },
            { gsid: 33105, count: 100 },
            { gsid: 33106, count: 100 },
            { gsid: 33107, count: 100 },
            { gsid: 33108, count: 100 },
            { gsid: 33109, count: 100 },
            { gsid: 33110, count: 100 },
            { gsid: 33111, count: 100 },
            { gsid: 33112, count: 100 },
            { gsid: 33113, count: 100 },
            { gsid: 33114, count: 100 },
            { gsid: 33115, count: 100 },
            { gsid: 33116, count: 100 },
            { gsid: 33117, count: 100 },
            { gsid: 33201, count: 100 },
            { gsid: 33202, count: 100 },
            { gsid: 33203, count: 100 },
            { gsid: 33204, count: 100 },
            { gsid: 33205, count: 100 },
            { gsid: 33206, count: 100 },
            { gsid: 33207, count: 100 },
            { gsid: 33208, count: 100 },
            { gsid: 33209, count: 100 },
            { gsid: 33210, count: 100 },
            { gsid: 33211, count: 100 },
            { gsid: 33212, count: 100 },
            { gsid: 33213, count: 100 },
            { gsid: 33214, count: 100 },
            { gsid: 33215, count: 100 },
            { gsid: 33216, count: 100 },
            { gsid: 33217, count: 100 },
            { gsid: 33301, count: 100 },
            { gsid: 33302, count: 100 },
            { gsid: 33303, count: 100 },
            { gsid: 33304, count: 100 },
            { gsid: 33305, count: 100 },
            { gsid: 33306, count: 100 },
            { gsid: 33307, count: 100 },
            { gsid: 33308, count: 100 },
            { gsid: 33309, count: 100 },
            { gsid: 33310, count: 100 },
            { gsid: 33311, count: 100 },
            { gsid: 33312, count: 100 },
            { gsid: 33313, count: 100 },
            { gsid: 33314, count: 100 },
            { gsid: 33315, count: 100 },
            { gsid: 33316, count: 100 },
            { gsid: 33317, count: 100 },
            { gsid: 33501, count: 100 },
            { gsid: 33502, count: 100 },
            { gsid: 33503, count: 100 },
            { gsid: 33504, count: 100 },
            { gsid: 33505, count: 100 },
            { gsid: 33506, count: 100 },
            { gsid: 33601, count: 100 },
            { gsid: 33602, count: 100 },
            { gsid: 33603, count: 100 },
            { gsid: 33604, count: 100 },
            { gsid: 33605, count: 100 },
            { gsid: 33606, count: 100 },
            { gsid: 33701, count: 100 },
            { gsid: 33702, count: 100 },
            { gsid: 33703, count: 100 },
            { gsid: 33704, count: 100 },
            { gsid: 33705, count: 100 },
            { gsid: 33706, count: 100 },
            { gsid: 33801, count: 100 },
            { gsid: 33802, count: 100 },
            { gsid: 33803, count: 100 },
            { gsid: 33804, count: 100 },
            { gsid: 33805, count: 100 },
            { gsid: 33806, count: 100 },
            // 宝物
            { gsid: 34001, count: 100 },
            { gsid: 34011, count: 100 },
            { gsid: 34021, count: 100 },
            { gsid: 34031, count: 100 },
            { gsid: 34041, count: 100 },
            { gsid: 34051, count: 100 },
            { gsid: 34061, count: 100 },
            { gsid: 34071, count: 100 },
            { gsid: 34081, count: 100 },
            { gsid: 34091, count: 100 },
            { gsid: 34101, count: 100 },
            { gsid: 34111, count: 100 },
            { gsid: 34121, count: 100 },
            { gsid: 34131, count: 100 },
            { gsid: 34141, count: 100 },
            { gsid: 34151, count: 100 },
            { gsid: 34161, count: 100 },
            { gsid: 34171, count: 100 },
            { gsid: 34181, count: 100 },
            { gsid: 34191, count: 100 },
            { gsid: 34201, count: 100 },
            { gsid: 34211, count: 100 },
            { gsid: 34221, count: 100 },
            { gsid: 34231, count: 100 },
            { gsid: 34241, count: 100 },
            { gsid: 34301, count: 100 },
            { gsid: 34311, count: 100 },
            { gsid: 34321, count: 100 },
            { gsid: 34331, count: 100 },
            { gsid: 34341, count: 100 },
            { gsid: 34351, count: 100 },
            { gsid: 34251, count: 100 },
            { gsid: 34261, count: 100 },
            { gsid: 34271, count: 100 },
            { gsid: 34281, count: 100 },
            { gsid: 34291, count: 100 },
            { gsid: 34441, count: 100 },
            { gsid: 34451, count: 100 },
            { gsid: 34461, count: 100 },
            { gsid: 34471, count: 100 },
            { gsid: 34481, count: 100 },
            { gsid: 34371, count: 100 },
            { gsid: 34571, count: 100 },
            { gsid: 34381, count: 100 },
            { gsid: 34391, count: 100 },
            { gsid: 34501, count: 100 },
            { gsid: 34511, count: 100 },
            { gsid: 34521, count: 100 },
            { gsid: 34541, count: 100 },
            { gsid: 34551, count: 100 },
            { gsid: 34581, count: 100 },
            { gsid: 34371, count: 100 },
            { gsid: 34571, count: 100 },
            { gsid: 34381, count: 100 },
            { gsid: 34391, count: 100 },
            { gsid: 34501, count: 100 },
            { gsid: 34511, count: 100 },
            { gsid: 34521, count: 100 },
            { gsid: 34541, count: 100 },
            { gsid: 34551, count: 100 },
            { gsid: 34581, count: 100 },
            { gsid: 34611, count: 100 },
            { gsid: 34621, count: 100 },
            { gsid: 34631, count: 100 },
            { gsid: 34641, count: 100 },
            { gsid: 34651, count: 100 },
        ];
        r = await this.remote.agent_prop_more({ uid: uid, servid: +servid }, items, 'GM_SEND');
        // 神兵(神兽)
        let mythical = {}
        mythical["101"] = { level: 120, class: 4, pskill: [30, 30, 30, 30], talent: [], talentskill: [60000, 60001, 60002, 60003] };
        mythical["102"] = { level: 120, class: 4, pskill: [30, 30, 30, 30], talent: [], talentskill: [60050, 60051, 60052, 60053] };
        mythical["103"] = { level: 120, class: 4, pskill: [30, 30, 30, 30], talent: [], talentskill: [60100, 60101, 60102, 60103] };
        mythical["104"] = { level: 120, class: 4, pskill: [30, 30, 30, 30], talent: [], talentskill: [60150, 60151, 60152, 60153] };
        mythical["105"] = { level: 120, class: 4, pskill: [30, 30, 30, 30], talent: [], talentskill: [60200, 60201, 60202, 60203] };
        mythical["106"] = { level: 120, class: 4, pskill: [30, 30, 30, 30], talent: [], talentskill: [60250, 60251, 60252, 60253] };
        r = await roleModel.updateOne({ _id: obid }, { $set: { mythical: mythical } }, { upsert: true });
        // 阵法
        const zhenfaModel = await this.service.game.collection('zhenfas');
        let base = [];
        for (let i = 0; i < 3; i++) {
            base.push({
                blv: 9,
                lv: 50,
            })
        }
        for (let i = 101; i <= 105; i++) {
            r = await zhenfaModel.updateOne({ rid: rid, zid: i }, { $set: { level: 50, base: base, rid: rid, zid: i, __v: 0 } }, { upsert: true });
        }
        // 封地
        const newmanorModel = await this.service.game.collection('newmanors');
        let building = {}
        building["2"] = { lv: 19, lastgain: Date.now(), id: 2 };
        building["3"] = { lv: 6, lastgain: Date.now(), id: 3 };
        building["4"] = { lv: 9, lastgain: Date.now(), id: 4 };
        building["5"] = { lv: 19, lastgain: Date.now(), id: 5 };
        building["6"] = { lv: 19, lastgain: Date.now(), id: 6 };
        building["7"] = { lv: 19, lastgain: Date.now(), id: 7 };
        building["8"] = { lv: 19, lastgain: Date.now(), id: 8 };
        building["10"] = { lv: 19, lastgain: Date.now(), id: 10 };
        r = await newmanorModel.updateOne({ rid: rid }, { $set: { mlevel: 20, monsterlv: 15, building: building } }, { upsert: true });
    }
    else if (type === "wjpj") {
        // 武将品阶到N, 0-6
        value = parseInt(value || 0);
        if (value < 0) value = 0;
        if (value > 6) value = 6;
        const generalModel = await this.service.game.collection('generals');
        r = await generalModel.update({ rid: rid }, { $set: { class: value } }, { multi: true });
    }
    else if (type === "wjdj") {
        // 武将等级到N, 1-140
        value = parseInt(value || 0);
        if (value < 1) value = 1;
        if (value > 140) value = 140;
        const generalModel = await this.service.game.collection('generals');
        r = await generalModel.update({ rid: rid }, { $set: { level: value } }, { multi: true });
    }
    else if (type === "xiufu") {

    } else if (type == 'mjrw') {
        const generalModel = await this.service.game.collection('secretrealmroles');
        let insert = {}
        insert[`task.taskid`] = Number(value)
        r = await generalModel.update({ rid: rid }, { $set: insert }, { multi: true });
    }
    return r;
};

