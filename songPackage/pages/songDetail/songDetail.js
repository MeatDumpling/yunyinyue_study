import PubSub from 'pubsub-js'

import request from "../../../utils/request";
const appInstance= getApp()
import moment from 'moment'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlay:false,  //音乐是否播放
    song:{},   //歌曲详情页面
    musicId:'', //音乐ID
    musicLink:'',   //音乐链接
    currentTime:'00:00',    //实时时间
    durationTime:'03:00',   //总时长
    currentWidth: 0,   //实时进度条的宽度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //options:接收路由跳转的参数
    //原生小程序中路由传参，对参数的长度有限制。如果参数长度过长会自动截取掉

    let musicId = options.musicId
    //获取音乐详情
    this.setData({
      musicId
    })
    this.getMusicInfo(musicId)

    /*
        问题：如果用户操作系统的控制音乐播放或暂停的按钮，页面不知道，导致页面显示是否播放的状态和真实的音乐播放状态不一致
        解决方案：
          1、通过控制音频的实例去监视音乐播放或暂停

    *
    * */
    //判断音乐是否在播放
    if(appInstance.globalData.isMusicPlay && appInstance.globalData.musicId === musicId){
      //修改当前页面的音乐播放状态
      this.setData({
        isPlay:true
      })
    }

    //创建控制音乐播放的实例对象
    this.backgroundAudioManager = wx.getBackgroundAudioManager()
    this.backgroundAudioManager.onPlay(() => {
      this.changePlayState(true)
      appInstance.globalData.musicId = musicId
    })

    this.backgroundAudioManager.onPause(() => {
      this.changePlayState(false)
    })

    this.backgroundAudioManager.onStop(() => {
      this.changePlayState(false)
    });

    //用来监听音乐自然播放结束
    this.backgroundAudioManager.onEnded(() => {
      //自动切换至下一首音乐,并且自动播放
        PubSub.publish('switchType','next')
        //将实时进度条的长度还原成0
        this.setData({
            currentWidth:0,
            currentTime:'00:00'
        })
    });


    //监听音乐实时播放的进度
      this.backgroundAudioManager.onTimeUpdate(() => {
          let currentTime = moment(this.backgroundAudioManager.currentTime * 1000).format('mm:ss')

          let currentWidth = this.backgroundAudioManager.currentTime / this.backgroundAudioManager.duration * 450

          this.setData({
              currentTime,
              currentWidth
          })

      })
  },

  //修改播放状态的功能函数
  changePlayState(isPlay){
    this.setData({
      isPlay
    })
    //修改全局音乐播放的状态
    appInstance.globalData.isMusicPlay = isPlay
  },

  //获取音乐详情的功能函数
  async getMusicInfo(musicId){
    let songData = await request('/song/detail',{ids:musicId});
    //单位ms
    let durationTime = moment(songData.songs[0].dt).format('mm:ss')
    this.setData({
      song:songData.songs[0],
      durationTime
    })

    //动态修改窗口的标题
    wx.setNavigationBarTitle({
      title:this.data.song.name
    })
  },

  //点击播放或者暂停的回调
  handleMusicPlay(){
    let isPlay = !this.data.isPlay

    let {musicId,musicLink} = this.data
    this.musicControl(isPlay,musicId,musicLink);

  },

  //控制音乐播放/暂停的功能函数
 async musicControl(isPlay,musicId,musicLink){

    if(isPlay){   //音乐播放
      if(!musicLink){
          //获取音乐的播放连接
          let musicLinkData = await request('/song/url',{id:musicId})
          musicLink = musicLinkData.data[0].url

          this.setData({
              musicLink
          })
      }

      this.backgroundAudioManager.src = musicLink
      this.backgroundAudioManager.title = this.data.song.name
    }else{  //暂停音乐
      this.backgroundAudioManager.pause()
    }
  },

  handleSwitch(event){
    //获取切换的类型
    let type = event.currentTarget.id
      //关闭当前播放的音乐
    this.backgroundAudioManager.stop()

    PubSub.subscribe('musicId',(msg,musicId) => {

        //获取音乐的详情信息
        this.getMusicInfo(musicId)
        //自动播放当前音乐
        this.musicControl(true,musicId)
        PubSub.unsubscribe('musicId')
    })

    //发布消息数据给recommendSong页面
    PubSub.publish('switchType',type)

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
