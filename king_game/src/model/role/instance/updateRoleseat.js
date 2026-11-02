module.exports = exports = async function (roleId, key, operationType, clientSeatIndex) {
    const ACTION_TYPE = {
        ADD: "add",
        DELETE: "delete",
        DELETE_LIST: "deletelist"
    };

    const role = await global.dao.role.findOne({ _id: roleId });
    let isModified = false;

    const handleSeatAssignment = (targetIndex) => {
        if (!role.seat[targetIndex] && operationType === ACTION_TYPE.ADD) {
            role.seat[targetIndex] = key.toString();
            return true;
        }
        return false;
    };

    const processListDeletion = () => {
        let isModified = false
        key.some(targetId => {
            Object.keys(role.seat).some(seatIndex => {
                if (targetId === role.seat[seatIndex]) {
                    role.seat[seatIndex] = false;
                    isModified = true;
                }
            });
        });
        return isModified
    };

    const findAndUpdateSeat = () => {
        for (const seatIndex in role.seat) {
            if (operationType === ACTION_TYPE.ADD && role.seat[seatIndex] === false) {
                role.seat[seatIndex] = key.toString();
                return true;
            }
            if (operationType === ACTION_TYPE.DELETE && role.seat[seatIndex] === key) {
                role.seat[seatIndex] = false;
                return true;
            }
        }
        return false;
    };

    // 主逻辑流程 
    if (clientSeatIndex) {
        isModified = handleSeatAssignment(clientSeatIndex);
    } else if (operationType === ACTION_TYPE.DELETE_LIST) {
        isModified = processListDeletion();
    } else {
        isModified = findAndUpdateSeat();
    }

    if (isModified) {
        await role.updateOne({ $set: { seat: role.seat } });
        return role.seat;
    }

    return isModified;
};