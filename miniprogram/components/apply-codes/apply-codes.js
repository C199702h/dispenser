// components/apply-codes/apply-codes.js
import {
    qryFreshCodeByName,
    useCodeByRecord
} from '../../db/index'

const app = getApp()

Component({
    /**
     * 组件的属性列表
     */
    properties: {},

    /**
     * 组件的初始数据
     */
    data: {
        apps: ["大堂经理助手", "移动营销", "业务审核", "随身宝", "农商银行大厦"],
        appIndex: 0,
    },

    /**
     * 组件的方法列表
     */
    methods: {
        bindAppChange: function (e) {
            console.log('picker country 发生选择改变，携带值为', e.detail.value);

            this.setData({
                appIndex: e.detail.value
            })
        },
        applyCode: async function () {
            const appName = this.data.apps[this.data.appIndex]
            const [record] = await qryFreshCodeByName(appName)
            console.log({
                record
            })
            if (!record) {
                console.log(3333)
                wx.showModal({
                    content: `${appName}的兑换码不足，请联系管理员添加`,
                })
                return
            }
            console.log(44)
            const {
                userNo,
                openid,
                dbUser_id
            } = app.globalData
            console.log(55)

            wx.showLoading({})
            useCodeByRecord(record, userNo, openid, dbUser_id).then(() => {
                wx.showModal({
                    content: '兑换成功',
                })
                this.triggerEvent('apply-success', {})
                wx.hideLoading({})
            }).catch(e => {
                wx.showModal({
                    content: '申请兑换码失败:' + e,
                })
                wx.hideLoading({})
            })
        }
    }
})