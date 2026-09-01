// pages/detail/detail.js

var common = require('../../utils/common.js')

Page({

  data: {

    // 当前新闻
    article: {},

    // 是否已经收藏
    isAdd: false

  },


  // =========================
  // 页面加载
  // =========================
  onLoad: function (options) {

    console.log('detail页面收到id：', options.id)

    let id = options.id

    if (!id) {

      wx.showToast({
        title: '新闻ID不存在',
        icon: 'none'
      })

      return
    }


    // =========================
    // 先检查收藏
    // =========================

    let favoriteKey = 'favorite_' + id

    let article = wx.getStorageSync(favoriteKey)


    if (article) {

      this.setData({

        article: article,

        isAdd: true

      })

      // 记录最近浏览
      this.saveHistory(article)

      return
    }


    // =========================
    // 从 common.js 获取新闻
    // =========================

    let result = common.getNewsDetail(id)


    if (result.code == '200') {

      this.setData({

        article: result.news,

        isAdd: false

      })

      // 记录最近浏览
      this.saveHistory(result.news)

    } else {

      wx.showToast({

        title: '新闻不存在',

        icon: 'none'

      })

    }

  },


  // =========================
  // 保存最近浏览
  // =========================
  saveHistory: function (article) {

    if (!article || !article.id) {
      return
    }

    let key = 'history_' + article.id

    let historyArticle = {

      id: article.id,

      title: article.title,

      poster: article.poster,

      content: article.content,

      add_date: article.add_date,

      viewedAt: Date.now()

    }

    wx.setStorageSync(key, historyArticle)


    // =========================
    // 最多保存10条浏览记录
    // =========================

    let info = wx.getStorageInfoSync()

    let keys = info.keys

    let historyList = []

    for (let i = 0; i < keys.length; i++) {

      if (keys[i].indexOf('history_') === 0) {

        let obj = wx.getStorageSync(keys[i])

        if (obj) {
          historyList.push(obj)
        }

      }

    }


    // 按浏览时间从新到旧排序

    historyList.sort(function (a, b) {

      return b.viewedAt - a.viewedAt

    })


    // 超过10条，删除最旧的

    if (historyList.length > 10) {

      for (let i = 10; i < historyList.length; i++) {

        wx.removeStorageSync(
          'history_' + historyList[i].id
        )

      }

    }

  },


  // =========================
  // 添加收藏
  // =========================
  addFavorites: function () {

    // 必须登录才能收藏

    let userInfo = wx.getStorageSync('userInfo')


    if (!userInfo) {

      wx.showModal({

        title: '提示',

        content: '登录后才能收藏新闻，是否立即登录？',

        confirmText: '去登录',

        cancelText: '取消',

        success: function (res) {

          if (res.confirm) {

            wx.switchTab({

              url: '../my/my'

            })

          }

        }

      })

      return

    }


    let article = this.data.article


    if (!article.id) {

      return

    }


    let key = 'favorite_' + article.id


    wx.setStorageSync(

      key,

      article

    )


    this.setData({

      isAdd: true

    })


    wx.showToast({

      title: '收藏成功',

      icon: 'success'

    })

  },


  // =========================
  // 取消收藏
  // =========================
  cancelFavorites: function () {

    let article = this.data.article

    let key = 'favorite_' + article.id


    wx.removeStorageSync(key)


    this.setData({

      isAdd: false

    })


    wx.showToast({

      title: '已取消收藏',

      icon: 'success'

    })

  },


  // =========================
  // 微信分享
  // =========================
  onShareAppMessage: function () {

    let article = this.data.article

    return {

      title: article.title || '中国海洋大学新闻网',

      path: '/pages/detail/detail?id=' + article.id,

      imageUrl: article.poster || ''

    }

  }

})