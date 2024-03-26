// components/my-codes/my-codes.js
import {
    qryMyCodesViaUser
} from '../../db/index'

Component({
    /**
     * 组件的属性列表
     */
    properties: {},

    /**
     * 组件的初始数据
     */
    data: {},

    /**
     * 组件的方法列表
     */
    methods: {
        setClipBoard(evt) {
            const link = evt.currentTarget.dataset.link
            wx.setClipboardData({
                data: link
            }).then(() => {
                wx.showModal({
                    content: evt.currentTarget.dataset.code
                })
            })

        },
        init() {
            qryMyCodesViaUser().then(codes => {
                this.setData({codes})
            })
        },
        dateStr(str) {
            (new this.Date(str)).tolocaleString()
        }
    },
    created() {
        this.init()
    }
})
