
'use strict'

module.exports = exports = (ginfo, pinfo,...args) => {
  // 新增的两个字段释义
  // vip vip战斗因子(目前只影响征战与远征(迷宫))
  // level level战斗因子(目前只影响征战)
  // floor 
  // stepfactor
  // stepnum 
  let [vip=0,level=0,floorfactor=1,stepfactor=0,stepnum=0] = args;
 
  let obj = {};
  if (!ginfo || !pinfo) return obj;
  for (const m in ginfo.PROPERTY) {
    obj[m.toLowerCase()] = ginfo.PROPERTY[m];
  }
  // hp

  obj.hp = (obj.hp + ginfo.GROWTH.HP * (pinfo.level - 1)) * (1 + (ginfo.SHP_ADD || 0) / 1000) * (1 + (pinfo.exhp || 0)) * (1 + (vip || 0) + (level || 0))
  obj.hp = Math.floor(obj.hp);
  if(pinfo.hpcover) obj.hp = pinfo.exhp;

  // atk
  obj.atk = (obj.atk + ginfo.GROWTH.ATK * (pinfo.level - 1)) * (1 + (ginfo.SATK_ADD || 0)/ 1000) * (1 + (pinfo.exatk || 0)) * (1 + (vip || 0) + (level || 0))
  obj.atk = Math.floor(obj.atk);

  // def
  obj.def += (ginfo.GROWTH.DEF * (pinfo.level - 1));
  obj.def = Math.floor(obj.def);

  // mdef
  obj.mdef += (ginfo.GROWTH.MDEF * (pinfo.level - 1));
  obj.mdef = Math.floor(obj.mdef);

  for (const key in obj) {
    if (obj[key] == 0) delete obj[key];
  }
  obj = {
    gsid: pinfo.gsid,
    class: pinfo.class,
    level: pinfo.level,
    star: ginfo.STAR,
    camp: ginfo.CAMP,
    occu: ginfo.OCCU,
    skill: ginfo.SKILL,
    property: obj
  }
  if(pinfo.hpcover) obj.hpcover = pinfo.hpcover;
  obj.power = 0;
  obj.power += (obj.property.hp || 0)    * 0.0625;
  obj.power += (obj.property.atk || 0)   * 1;
  obj.power += (obj.property.def || 0)   * 2.5;
  obj.power += (obj.property.mdef || 0)  * 2.5;
  obj.power += (obj.property.pasp || 0)  * 10;
  obj.power += (obj.property.ppthr || 0) * 10;
  obj.power += (obj.property.pmthr || 0) * 10;
  obj.power += ((obj.property.pcri || 0) - 50)  * 10;
  obj.power += ((obj.property.pcrid || 0) - 1500) * 2;
  obj.power += (obj.property.pdex || 0)  * 10;
  obj.power += (obj.property.pmdex || 0) * 10;
  obj.power = Math.floor(obj.power * 10);  
  return obj;
}