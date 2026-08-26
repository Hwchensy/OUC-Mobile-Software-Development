Page({

  data: {
    name: '傅歌',
    school: '中国海洋大学',
    major: '计算机科学与技术',
    email: '3592279877@qq.com',
    phone: '17701290859',
    address: '西海岸校区 · 听海苑6号楼'
  },

  copyEmail: function () {

    wx.setClipboardData({

      data: this.data.email,

      success: function () {

        wx.showToast({
          title: '邮箱已复制',
          icon: 'success',
          duration: 1500
        })

      },

      fail: function () {

        wx.showToast({
          title: '复制失败',
          icon: 'none'
        })

      }

    })

  }

})