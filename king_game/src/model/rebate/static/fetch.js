"use strict"

const rebate_excpet_pid = [
    "specialzk", //周卡
	"specialgz", //普通月卡
    "specialzz", //超级月卡
    "specialbw", //特权30
    "specialqz", //特权68
    "specialfd", //特权98
    "specialcz", //成长基金1阶
    "specialcz1", //成长基金2阶
    "specialcz2", //成长基金3阶
    "specialtower", //试炼基金1阶
    "specialtower1", //试炼基金2阶
    "specialtower2", //试炼基金3阶
]

module.exports = async function (pid) {
	return rebate_excpet_pid.indexOf(pid) >= 0;
}