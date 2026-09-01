// pages/index/index.js

var common = require('../../utils/common.js')

Page({

  data: {

    // =========================
    // 轮播图片
    // =========================

    swiperImg: [

      {
        src: 'https://gaopursuit.oss-cn-beijing.aliyuncs.com/2022/newsimage1.jpg'
      },

      {
        src: 'https://gaopursuit.oss-cn-beijing.aliyuncs.com/2022/newsimage2.jpg'
      },

      {
        src: 'https://gaopursuit.oss-cn-beijing.aliyuncs.com/2022/newsimage3.jpg'
      }

    ],


    // =========================
    // 所有新闻
    // =========================

    allNews: [],


    // 当前显示的新闻
    newsList: [],


    // 搜索关键词
    keyword: '',


    // 当前分类
    currentCategory: '全部'

  },


  // =========================
  // 页面加载
  // =========================

  onLoad: function () {

    console.log('首页加载')

    let list = common.getNewsList()

    this.setData({

      allNews: list,

      newsList: list

    })

  },


  // =========================
  // 输入搜索内容
  // =========================

  onSearchInput: function (e) {

    this.setData({

      keyword: e.detail.value

    })

  },


  // =========================
  // 搜索新闻
  // =========================

  searchNews: function () {

    let keyword = this.data.keyword.trim()

    let list = this.data.allNews


    // 没有输入关键词
    if (keyword === '') {

      this.setData({

        newsList: list

      })

      return

    }


    let result = []


    for (let i = 0; i < list.length; i++) {

      let title = list[i].title


      if (title.indexOf(keyword) !== -1) {

        result.push(list[i])

      }

    }


    this.setData({

      newsList: result

    })

  },


  // =========================
  // 切换新闻分类
  // =========================

  changeCategory: function (e) {

    let category = e.currentTarget.dataset.category


    this.setData({

      currentCategory: category

    })


    /*
     * 目前 common.js 中的新闻数据
     * 没有 category 字段。
     *
     * 所以“推荐”显示全部新闻。
     *
     * 如果以后给新闻增加 category，
     * 可以继续完善分类筛选。
     */

    if (category === '全部') {

      this.setData({

        newsList: this.data.allNews

      })

    }

  },


  // =========================
  // 点击新闻
  // =========================

  goToDetail: function (e) {

    let id = e.currentTarget.dataset.id

    console.log('点击新闻，id = ', id)


    if (!id) {

      wx.showToast({

        title: '新闻ID不存在',

        icon: 'none'

      })

      return

    }


    wx.navigateTo({

      url: '../detail/detail?id=' + id

    })

  }

})