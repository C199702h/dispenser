// 将某条记录已使用的信息写进codes表, 并记录在user表用户下
// 写操作得放到云函数
const useCodeByRecord = (record,
                         userNo,
                         openid,
                         dbUser_id) => wx.cloud.callFunction({
    name: 'db',
    data: {
        action: 'useCodeByRecord',
        record,
        userNo,
        openid,
        dbUser_id
    }
})


export {
    useCodeByRecord
}