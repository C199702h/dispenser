// 将某条记录已使用的信息写进codes表, 并记录在user表用户下
const cloud = require('wx-server-sdk')

function useCodeByRecord({
                             record,
                             userNo,
                             openid,
                             dbUser_id
                         }) { // todo 云操作
    console.log(arguments)
    if (!userNo || !openid || !dbUser_id) return Promise.reject('请检查参数 db:useCodeByRecord(userNo, openid, dbUser_id)')

    const {
        _id,
        code,
        app_name
    } = record
    const db = cloud.database()
    const _ = db.command
    const newRecord = {
        ...record,
        used: userNo,
        used_time: (new Date).toISOString(),
        used_openid: openid
    }
    // 在codes表标记使用
    return db.collection('codes').doc(_id).update({
        data: {
            used: newRecord.used,
            used_time: newRecord.used_time,
            used_openid: newRecord.used_openid
        }
    }).then(function () {
        console.log()
        // 在user表记录
        return db.collection('user').doc(dbUser_id)
            .update({
                data: {
                    codes: _.push({
                        ...newRecord
                    })
                }
            })
    })

}

module.exports = useCodeByRecord