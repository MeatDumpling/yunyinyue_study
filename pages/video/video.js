import request from "../../utils/request";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoGroupList:[],  //导航标签数据
    navId:'',//导航的标识
    videoList:[], //视频的列表数据
    videoId: '', // 视频id标识
    videoUpdateTime: [], //记录video播放的时长
    isTriggered:false  //标识下拉刷新是否被触发
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    /*获取导航数据*/
    this.getVideoGroupListData()
  },

  //获取导航数据
  async getVideoGroupListData(){
    let videoGroupListData = await request('/video/group/list')
    this.setData({
      videoGroupList:videoGroupListData.data.slice(0,14),
      navId:videoGroupListData.data[0].id
    })

    this.getVideoList(this.data.navId)
  },

  //获取视频列表数据
  async getVideoList(navId){
    let videoListData = await request('/video/group',{id:navId})
    //关闭消息提示框
    wx.hideLoading()

    let index = 0
    let videoList = videoListData.datas.map(item => {
      item.id = index++;
      return item;
    })

    this.setData({
      videoList:videoList,
      isTriggered:false//关闭下拉刷新
    })
  },

  //点击切换导航的回调
  changeNav(event){
    let navId = event.currentTarget.id;   //通过id向event传参的时候如果传的是number会自动转换成String
    this.setData({
      navId: navId >>> 0,
      videoList:[]
    })
    //显示正在加载
    wx.showLoading({
      title:'正在加载...',
    })
    //动态获取当前导航对应的视频数据
    this.getVideoList(this.data.navId)

  },

  //点击播放(继续播放)的回调
  handlePlay(event){
    /*
        1、点击播放的时间中需要找到上一个播放的视频
        2、在播放下一个视频之前关闭上一个正在播放的视频
        关键：
          1、如何找到上一个视频的实例
          2如何确认点击播放的视频和正在播放的视频不是同一个视频

        js的单例模式
          1、需要创建多个对象的场景下，通过一个变量模块，始终保持只有一个对象
          2、节省内存空间
    *
    * */

  //  创建控制Video标签实例对象
    let vid = event.currentTarget.id
    this.vid !== vid && this.videoContext && this.videoContext.stop()
    this.vid = vid
    //更新data中的videoId状态数据
    this.setData({
      videoId:vid
    })
    this.videoContext = wx.createVideoContext(vid)
    //判断当前的视频之前是否播放过，是否有播放记录，如果有，就跳转到指定的播放位置
    let {videoUpdateTime} = this.data
    let videoItem = videoUpdateTime.find(item => item.vid === vid)
    if(videoItem){
      this.videoContext.seek(videoItem.currentTime)
    }
    this.videoContext.play()

  },

  //监听视频播放进度的回调
  handleTimeUpdate(event){
    let videoTimeObj = {vid:event.currentTarget.id,currentTime:event.detail.currentTime}
    //判断记录播放时长的videoUpdateTime数组中是否有当前视频的播放记录
    let {videoUpdateTime} = this.data
    /*
   * 思路： 判断记录播放时长的videoUpdateTime数组中是否有当前视频的播放记录
   *   1. 如果有，在原有的播放记录中修改播放时间为当前的播放时间
   *   2. 如果没有，需要在数组中添加当前视频的播放对象
   *
   * */
    let videoItem = videoUpdateTime.find(item => item.vid === videoTimeObj.vid)
    if(videoItem){
      //之前有
      videoItem.currentTime = event.detail.currentTime
    }else{
      //更新videoUpdate的状态
      videoUpdateTime.push(videoTimeObj)
    }
    this.setData({
      videoUpdateTime
    })
  },

  //视频播放结束调用
  handleEnded(event){
    //移除记录播放时长数组中当前视频的对象
    let {videoUpdateTime} = this.data
    videoUpdateTime.splice(videoUpdateTime.findIndex(item => item.vid === event.currentTarget.id),1)
    this.setData({
      videoUpdateTime
    })
  },

  //自定义上拉触底的回调
  handleRefresher(){
    this.getVideoList(this.data.navId)
  },
  //
  /*自定义下拉刷新的回调：scroll-view*/
  handleToLower(){
    //数据分页  1、前端分页  2、后端分页
    let newVideoList =  [
        {
          "type": 1,
          "displayed": false,
          "alg": "onlineHotGroup",
          "extAlg": null,
          "data": {
            "alg": "onlineHotGroup",
            "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
            "threadId": "R_VI_62_62CA39CCE0A91E44154281E3E64BCE52",
            "coverUrl": "https://p1.music.126.net/eunJtcg8C2mLOtjgk3IpSA==/109951165118136104.jpg",
            "height": 720,
            "width": 1280,
            "title": "华晨宇暖心演唱《好想爱这个世界啊》",
            "description": null,
            "commentCount": 618,
            "shareCount": 2365,
            "resolutions": [
              {
                "resolution": 240,
                "size": 22964468
              },
              {
                "resolution": 480,
                "size": 37839406
              },
              {
                "resolution": 720,
                "size": 48172831
              }
            ],
            "creator": {
              "defaultAvatar": false,
              "province": 110000,
              "authStatus": 0,
              "followed": false,
              "avatarUrl": "http://p1.music.126.net/9gFwnq_vOpFz1Ct7dJiQDA==/109951165189537660.jpg",
              "accountStatus": 0,
              "gender": 2,
              "city": 110101,
              "birthday": -2209017600000,
              "userId": 556757640,
              "userType": 0,
              "nickname": "卡卡西_yu",
              "signature": "",
              "description": "",
              "detailDescription": "",
              "avatarImgId": 109951165189537660,
              "backgroundImgId": 109951165226825680,
              "backgroundUrl": "http://p1.music.126.net/S1jyw8LTCZzu0qMhaZRgFA==/109951165226825682.jpg",
              "authority": 0,
              "mutual": false,
              "expertTags": null,
              "experts": null,
              "djStatus": 0,
              "vipType": 0,
              "remarkName": null,
              "avatarImgIdStr": "109951165189537660",
              "backgroundImgIdStr": "109951165226825682"
            },
            "urlInfo": {
              "id": "62CA39CCE0A91E44154281E3E64BCE52",
              "url": "http://vodkgeyttp9.vod.126.net/cloudmusic/r4oSOrl2_3051530133_shd.mp4?ts=1632359409&rid=5D81C711E6338E3432FFB01850BD957C&rl=3&rs=DHXUAcyeqemgkQIOWKWSmGexYvuhNmeP&sign=7dc65448f05eb19be50083299455a8da&ext=6H9v2fQ6jguqt%2Fq7aRmsh1KtRNm5m3zo%2Bo3o69n8CN49ecVJp2B6MfWGSB6V9Q2X5suWWOY81mttBtTpEFCaVEcMHm5cwdEWhECdLBKKSBBGZE8ETVKfGTA%2Bsw3myjyk1w2Co57FlXE9CQmsDfWDxSa53Krj8ZyfGNpqBAkK%2Fn24KfgA8AVn8wRHbM%2BbPjtY6W1vZZpVI3470Z3De26N%2B6emRgHDoua0OxYHSWvqJDJ0k56Z%2F9hg7mXvKYy0H%2Bkn",
              "size": 48172831,
              "validityTime": 1200,
              "needPay": false,
              "payInfo": null,
              "r": 720
            },
            "videoGroup": [
              {
                "id": 58100,
                "name": "现场",
                "alg": null
              },
              {
                "id": 59101,
                "name": "华语现场",
                "alg": null
              },
              {
                "id": 57108,
                "name": "流行现场",
                "alg": null
              },
              {
                "id": 59108,
                "name": "巡演现场",
                "alg": null
              },
              {
                "id": 1100,
                "name": "音乐现场",
                "alg": null
              },
              {
                "id": 5100,
                "name": "音乐",
                "alg": null
              },
              {
                "id": 23118,
                "name": "华晨宇",
                "alg": null
              }
            ],
            "previewUrl": null,
            "previewDurationms": 0,
            "hasRelatedGameAd": false,
            "markTypes": null,
            "relateSong": [
              {
                "name": "好想爱这个世界啊 (Live)",
                "id": 1436910205,
                "pst": 0,
                "t": 0,
                "ar": [
                  {
                    "id": 861777,
                    "name": "华晨宇",
                    "tns": [],
                    "alias": []
                  }
                ],
                "alia": [],
                "pop": 100,
                "st": 0,
                "rt": "",
                "fee": 8,
                "v": 72,
                "crbt": null,
                "cf": "",
                "al": {
                  "id": 87498640,
                  "name": "歌手·当打之年 第9期",
                  "picUrl": "http://p3.music.126.net/p7n_zp4eoxY3a1XPzIomHQ==/109951164863688864.jpg",
                  "tns": [],
                  "pic_str": "109951164863688864",
                  "pic": 109951164863688860
                },
                "dt": 262700,
                "h": {
                  "br": 320000,
                  "fid": 0,
                  "size": 10510125,
                  "vd": -24479
                },
                "m": {
                  "br": 192000,
                  "fid": 0,
                  "size": 6306093,
                  "vd": -21889
                },
                "l": {
                  "br": 128000,
                  "fid": 0,
                  "size": 4204077,
                  "vd": -20181
                },
                "a": null,
                "cd": "01",
                "no": 6,
                "rtUrl": null,
                "ftype": 0,
                "rtUrls": [],
                "djId": 0,
                "copyright": 0,
                "s_id": 0,
                "mst": 9,
                "cp": 1416682,
                "mv": 0,
                "rtype": 0,
                "rurl": null,
                "publishTime": 0,
                "privilege": {
                  "id": 1436910205,
                  "fee": 0,
                  "payed": 0,
                  "st": 0,
                  "pl": 999000,
                  "dl": 0,
                  "sp": 7,
                  "cp": 1,
                  "subp": 1,
                  "cs": false,
                  "maxbr": 999000,
                  "fl": 128000,
                  "toast": false,
                  "flag": 0,
                  "preSell": false
                }
              }
            ],
            "relatedInfo": null,
            "videoUserLiveInfo": null,
            "vid": "62CA39CCE0A91E44154281E3E64BCE52",
            "durationms": 271650,
            "playTime": 1304360,
            "praisedCount": 21402,
            "praised": false,
            "subscribed": false
          }
        },
        {
          "type": 1,
          "displayed": false,
          "alg": "onlineHotGroup",
          "extAlg": null,
          "data": {
            "alg": "onlineHotGroup",
            "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
            "threadId": "R_VI_62_4BBC3556A3FFE18C9C44ED741AE34F1E",
            "coverUrl": "https://p1.music.126.net/15ZbhG8a_NLvUt25COTkhA==/109951164427264034.jpg",
            "height": 540,
            "width": 960,
            "title": "【Live】谭维维翻唱《晚婚》，着迷的让人想哭！",
            "description": "头披婚纱，我从来不想独身，却有预感晚婚，我在等，世上唯一契合灵魂。",
            "commentCount": 604,
            "shareCount": 8636,
            "resolutions": [
              {
                "resolution": 240,
                "size": 24624377
              },
              {
                "resolution": 480,
                "size": 38987747
              }
            ],
            "creator": {
              "defaultAvatar": false,
              "province": 610000,
              "authStatus": 0,
              "followed": false,
              "avatarUrl": "http://p1.music.126.net/u_NVy9HkeS16yZEyOs5k7w==/2945591652922899.jpg",
              "accountStatus": 0,
              "gender": 2,
              "city": 610100,
              "birthday": 749720327000,
              "userId": 18419219,
              "userType": 0,
              "nickname": "流浪的玉米粒儿",
              "signature": "我蹲在这里不走 等你找到我好不好",
              "description": "",
              "detailDescription": "",
              "avatarImgId": 2945591652922899,
              "backgroundImgId": 109951164366672020,
              "backgroundUrl": "http://p1.music.126.net/YM4gmqBkefadBaQjrjzGzg==/109951164366672019.jpg",
              "authority": 0,
              "mutual": false,
              "expertTags": null,
              "experts": null,
              "djStatus": 0,
              "vipType": 0,
              "remarkName": null,
              "avatarImgIdStr": "2945591652922899",
              "backgroundImgIdStr": "109951164366672019"
            },
            "urlInfo": {
              "id": "4BBC3556A3FFE18C9C44ED741AE34F1E",
              "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/iI9A0cuh_2617143896_hd.mp4?ts=1632359409&rid=5D81C711E6338E3432FFB01850BD957C&rl=3&rs=UqbQKlDMhRqCfKkuxbtzdSDhUMIMfzRd&sign=7a8c1255e01b2f33c88e748d7c131a05&ext=6H9v2fQ6jguqt%2Fq7aRmsh1KtRNm5m3zo%2Bo3o69n8CN49ecVJp2B6MfWGSB6V9Q2X5suWWOY81mttBtTpEFCaVEcMHm5cwdEWhECdLBKKSBBGZE8ETVKfGTA%2Bsw3myjyk1w2Co57FlXE9CQmsDfWDxSa53Krj8ZyfGNpqBAkK%2Fn24KfgA8AVn8wRHbM%2BbPjtY6W1vZZpVI3470Z3De26N%2B6emRgHDoua0OxYHSWvqJDJ0k56Z%2F9hg7mXvKYy0H%2Bkn",
              "size": 38987747,
              "validityTime": 1200,
              "needPay": false,
              "payInfo": null,
              "r": 480
            },
            "videoGroup": [
              {
                "id": 58100,
                "name": "现场",
                "alg": null
              },
              {
                "id": 1100,
                "name": "音乐现场",
                "alg": null
              },
              {
                "id": 5100,
                "name": "音乐",
                "alg": null
              },
              {
                "id": 4101,
                "name": "娱乐",
                "alg": null
              },
              {
                "id": 3101,
                "name": "综艺",
                "alg": null
              }
            ],
            "previewUrl": null,
            "previewDurationms": 0,
            "hasRelatedGameAd": false,
            "markTypes": null,
            "relateSong": [],
            "relatedInfo": null,
            "videoUserLiveInfo": null,
            "vid": "4BBC3556A3FFE18C9C44ED741AE34F1E",
            "durationms": 291562,
            "playTime": 1758603,
            "praisedCount": 10873,
            "praised": false,
            "subscribed": false
          }
        },
        {
          "type": 1,
          "displayed": false,
          "alg": "onlineHotGroup",
          "extAlg": null,
          "data": {
            "alg": "onlineHotGroup",
            "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
            "threadId": "R_VI_62_58B86BACB5C36E17BC161CC5A77D3C56",
            "coverUrl": "https://p2.music.126.net/jB5HFd-aJFDaIbBV_QuEvA==/109951163725782163.jpg",
            "height": 1080,
            "width": 1920,
            "title": "杨宗纬《空白格》 歌声阳刚而细腻 ，观众被其感动哭了",
            "description": "",
            "commentCount": 498,
            "shareCount": 2069,
            "resolutions": [
              {
                "resolution": 240,
                "size": 24893811
              },
              {
                "resolution": 480,
                "size": 41526096
              },
              {
                "resolution": 720,
                "size": 60983904
              },
              {
                "resolution": 1080,
                "size": 103380591
              }
            ],
            "creator": {
              "defaultAvatar": false,
              "province": 230000,
              "authStatus": 0,
              "followed": false,
              "avatarUrl": "http://p1.music.126.net/YaziwMop753r1ZlCaYFdkw==/109951163710128957.jpg",
              "accountStatus": 0,
              "gender": 0,
              "city": 230100,
              "birthday": -2209017600000,
              "userId": 1683743264,
              "userType": 0,
              "nickname": "好歌曲goodmusic",
              "signature": "",
              "description": "",
              "detailDescription": "",
              "avatarImgId": 109951163710128960,
              "backgroundImgId": 109951162868126480,
              "backgroundUrl": "http://p1.music.126.net/_f8R60U9mZ42sSNvdPn2sQ==/109951162868126486.jpg",
              "authority": 0,
              "mutual": false,
              "expertTags": null,
              "experts": {
                "1": "视频达人(华语、音乐现场)"
              },
              "djStatus": 0,
              "vipType": 0,
              "remarkName": null,
              "avatarImgIdStr": "109951163710128957",
              "backgroundImgIdStr": "109951162868126486"
            },
            "urlInfo": {
              "id": "58B86BACB5C36E17BC161CC5A77D3C56",
              "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/HHVJDMWn_2188771691_uhd.mp4?ts=1632359409&rid=5D81C711E6338E3432FFB01850BD957C&rl=3&rs=UBWKpQkXwxVaWOgTjMKELETetfeMRBLv&sign=1915812ff454cece71847fbf2f354d8a&ext=6H9v2fQ6jguqt%2Fq7aRmsh1KtRNm5m3zo%2Bo3o69n8CN49ecVJp2B6MfWGSB6V9Q2X5suWWOY81mttBtTpEFCaVEcMHm5cwdEWhECdLBKKSBBGZE8ETVKfGTA%2Bsw3myjyk1w2Co57FlXE9CQmsDfWDxSa53Krj8ZyfGNpqBAkK%2Fn24KfgA8AVn8wRHbM%2BbPjtY6W1vZZpVI3470Z3De26N%2B6emRgHDoua0OxYHSWvqJDLFGXQJ8csbmgkOxxIBZv2L",
              "size": 103380591,
              "validityTime": 1200,
              "needPay": false,
              "payInfo": null,
              "r": 1080
            },
            "videoGroup": [
              {
                "id": 58100,
                "name": "现场",
                "alg": null
              },
              {
                "id": 59101,
                "name": "华语现场",
                "alg": null
              },
              {
                "id": 57108,
                "name": "流行现场",
                "alg": null
              },
              {
                "id": 1100,
                "name": "音乐现场",
                "alg": null
              },
              {
                "id": 5100,
                "name": "音乐",
                "alg": null
              },
              {
                "id": 24122,
                "name": "杨宗纬",
                "alg": null
              }
            ],
            "previewUrl": null,
            "previewDurationms": 0,
            "hasRelatedGameAd": false,
            "markTypes": null,
            "relateSong": [],
            "relatedInfo": null,
            "videoUserLiveInfo": null,
            "vid": "58B86BACB5C36E17BC161CC5A77D3C56",
            "durationms": 328656,
            "playTime": 1079716,
            "praisedCount": 9948,
            "praised": false,
            "subscribed": false
          }
        },
        {
          "type": 1,
          "displayed": false,
          "alg": "onlineHotGroup",
          "extAlg": null,
          "data": {
            "alg": "onlineHotGroup",
            "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
            "threadId": "R_VI_62_822BD9D8A2FBDD2658F1902A4E51E9CD",
            "coverUrl": "https://p1.music.126.net/98zSboYDllFP64FNelZoSw==/109951164503286000.jpg",
            "height": 720,
            "width": 1280,
            "title": "王俊凯、蔡依林 - 心引力(Live)",
            "description": "王俊凯、蔡依林 - 心引力(Live)",
            "commentCount": 952,
            "shareCount": 6679,
            "resolutions": [
              {
                "resolution": 240,
                "size": 34271698
              },
              {
                "resolution": 480,
                "size": 58950734
              },
              {
                "resolution": 720,
                "size": 98024538
              }
            ],
            "creator": {
              "defaultAvatar": false,
              "province": 350000,
              "authStatus": 0,
              "followed": false,
              "avatarUrl": "http://p1.music.126.net/jZkIVDxOOKdNQe45G-H-ng==/109951163063703622.jpg",
              "accountStatus": 0,
              "gender": 2,
              "city": 350100,
              "birthday": -1546934400000,
              "userId": 439384079,
              "userType": 204,
              "nickname": "肥嘟嘟卓卫门",
              "signature": "还有三千人没会，还有三千事不会",
              "description": "",
              "detailDescription": "",
              "avatarImgId": 109951163063703620,
              "backgroundImgId": 109951164114830290,
              "backgroundUrl": "http://p1.music.126.net/f2MYjLsqTvwTXOXg-dRl-g==/109951164114830287.jpg",
              "authority": 0,
              "mutual": false,
              "expertTags": null,
              "experts": {
                "1": "音乐视频达人"
              },
              "djStatus": 0,
              "vipType": 11,
              "remarkName": null,
              "avatarImgIdStr": "109951163063703622",
              "backgroundImgIdStr": "109951164114830287"
            },
            "urlInfo": {
              "id": "822BD9D8A2FBDD2658F1902A4E51E9CD",
              "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/6aud3f84_2791240749_shd.mp4?ts=1632359409&rid=5D81C711E6338E3432FFB01850BD957C&rl=3&rs=iaHGZPyHiJhUNpBowzRWpTAueYsWQGCe&sign=b0423d89c13866c6dfda4c2372ed61cf&ext=6H9v2fQ6jguqt%2Fq7aRmsh1KtRNm5m3zo%2Bo3o69n8CN49ecVJp2B6MfWGSB6V9Q2X5suWWOY81mttBtTpEFCaVEcMHm5cwdEWhECdLBKKSBBGZE8ETVKfGTA%2Bsw3myjyk1w2Co57FlXE9CQmsDfWDxSa53Krj8ZyfGNpqBAkK%2Fn24KfgA8AVn8wRHbM%2BbPjtY6W1vZZpVI3470Z3De26N%2B6emRgHDoua0OxYHSWvqJDJ0k56Z%2F9hg7mXvKYy0H%2Bkn",
              "size": 98024538,
              "validityTime": 1200,
              "needPay": false,
              "payInfo": null,
              "r": 720
            },
            "videoGroup": [
              {
                "id": 58100,
                "name": "现场",
                "alg": null
              },
              {
                "id": 11137,
                "name": "TFBOYS",
                "alg": null
              },
              {
                "id": 1100,
                "name": "音乐现场",
                "alg": null
              },
              {
                "id": 5100,
                "name": "音乐",
                "alg": null
              },
              {
                "id": 23120,
                "name": "蔡依林",
                "alg": null
              },
              {
                "id": 25108,
                "name": "王俊凯",
                "alg": null
              }
            ],
            "previewUrl": null,
            "previewDurationms": 0,
            "hasRelatedGameAd": false,
            "markTypes": null,
            "relateSong": [],
            "relatedInfo": null,
            "videoUserLiveInfo": null,
            "vid": "822BD9D8A2FBDD2658F1902A4E51E9CD",
            "durationms": 245440,
            "playTime": 3368573,
            "praisedCount": 43223,
            "praised": false,
            "subscribed": false
          }
        },
        {
          "type": 1,
          "displayed": false,
          "alg": "onlineHotGroup",
          "extAlg": null,
          "data": {
            "alg": "onlineHotGroup",
            "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
            "threadId": "R_VI_62_B2BEB414FE0D611BC249AD66E5954D68",
            "coverUrl": "https://p1.music.126.net/lnaiaTpTrOqewacfYfjqGw==/109951164226955610.jpg",
            "height": 1080,
            "width": 1920,
            "title": "【BLACKPINK】澳大利亚悉尼演唱会——LISA 个人舞台",
            "description": "【#BLACKPINK#】澳大利亚悉尼演唱会——#LISA# 个人舞台",
            "commentCount": 212,
            "shareCount": 1191,
            "resolutions": [
              {
                "resolution": 240,
                "size": 36294186
              },
              {
                "resolution": 480,
                "size": 70944502
              },
              {
                "resolution": 720,
                "size": 112477327
              },
              {
                "resolution": 1080,
                "size": 214018248
              }
            ],
            "creator": {
              "defaultAvatar": false,
              "province": 220000,
              "authStatus": 0,
              "followed": false,
              "avatarUrl": "http://p1.music.126.net/APWYDnUtYlOjy9MmO9wgww==/109951165716293571.jpg",
              "accountStatus": 0,
              "gender": 2,
              "city": 222400,
              "birthday": 845654400000,
              "userId": 87819969,
              "userType": 0,
              "nickname": "Yeonvely22",
              "signature": "2021你好~",
              "description": "",
              "detailDescription": "",
              "avatarImgId": 109951165716293570,
              "backgroundImgId": 109951165395722990,
              "backgroundUrl": "http://p1.music.126.net/LulOmlCSpzNQKI9xmJYIcg==/109951165395722990.jpg",
              "authority": 0,
              "mutual": false,
              "expertTags": null,
              "experts": {
                "1": "音乐视频达人"
              },
              "djStatus": 10,
              "vipType": 0,
              "remarkName": null,
              "avatarImgIdStr": "109951165716293571",
              "backgroundImgIdStr": "109951165395722990"
            },
            "urlInfo": {
              "id": "B2BEB414FE0D611BC249AD66E5954D68",
              "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/mraVd9v1_2552153923_uhd.mp4?ts=1632359409&rid=5D81C711E6338E3432FFB01850BD957C&rl=3&rs=wFcSuabSxLtcSHAVtVPpQwytCbaQcgpm&sign=58380b8dec8715042eb059143b6c8bd5&ext=6H9v2fQ6jguqt%2Fq7aRmsh1KtRNm5m3zo%2Bo3o69n8CN49ecVJp2B6MfWGSB6V9Q2X5suWWOY81mttBtTpEFCaVEcMHm5cwdEWhECdLBKKSBBGZE8ETVKfGTA%2Bsw3myjyk1w2Co57FlXE9CQmsDfWDxSa53Krj8ZyfGNpqBAkK%2Fn24KfgA8AVn8wRHbM%2BbPjtY6W1vZZpVI3470Z3De26N%2B6emRgHDoua0OxYHSWvqJDJ0k56Z%2F9hg7mXvKYy0H%2Bkn",
              "size": 214018248,
              "validityTime": 1200,
              "needPay": false,
              "payInfo": null,
              "r": 1080
            },
            "videoGroup": [
              {
                "id": 58100,
                "name": "现场",
                "alg": null
              },
              {
                "id": 1101,
                "name": "舞蹈",
                "alg": null
              },
              {
                "id": 1100,
                "name": "音乐现场",
                "alg": null
              },
              {
                "id": 5100,
                "name": "音乐",
                "alg": null
              },
              {
                "id": 92105,
                "name": "BLACKPINK",
                "alg": null
              }
            ],
            "previewUrl": null,
            "previewDurationms": 0,
            "hasRelatedGameAd": false,
            "markTypes": null,
            "relateSong": [],
            "relatedInfo": null,
            "videoUserLiveInfo": null,
            "vid": "B2BEB414FE0D611BC249AD66E5954D68",
            "durationms": 229065,
            "playTime": 1077869,
            "praisedCount": 15312,
            "praised": false,
            "subscribed": false
          }
        },
        {
          "type": 1,
          "displayed": false,
          "alg": "onlineHotGroup",
          "extAlg": null,
          "data": {
            "alg": "onlineHotGroup",
            "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
            "threadId": "R_VI_62_FF87FBB8BEF0EF2C6DAC587967E43744",
            "coverUrl": "https://p1.music.126.net/oQkMcjREh8XNADmxGRrAVQ==/109951163437798419.jpg",
            "height": 720,
            "width": 1280,
            "title": "TFBOYS - 快乐环岛（170813ALIVEFOUR四周年南京演唱会）",
            "description": "雨后的彩虹会变得更加美好",
            "commentCount": 39,
            "shareCount": 43,
            "resolutions": [
              {
                "resolution": 240,
                "size": 41270081
              },
              {
                "resolution": 480,
                "size": 67890317
              },
              {
                "resolution": 720,
                "size": 93370226
              }
            ],
            "creator": {
              "defaultAvatar": false,
              "province": 110000,
              "authStatus": 0,
              "followed": false,
              "avatarUrl": "http://p1.music.126.net/5rK5EE48oekIjNHyR3GIYg==/109951163424583352.jpg",
              "accountStatus": 0,
              "gender": 0,
              "city": 110101,
              "birthday": -2209017600000,
              "userId": 1345020800,
              "userType": 0,
              "nickname": "拾號播放器",
              "signature": "让我们一起泡在音乐水里面",
              "description": "",
              "detailDescription": "",
              "avatarImgId": 109951163424583360,
              "backgroundImgId": 109951162868128400,
              "backgroundUrl": "http://p1.music.126.net/2zSNIqTcpHL2jIvU6hG0EA==/109951162868128395.jpg",
              "authority": 0,
              "mutual": false,
              "expertTags": null,
              "experts": {
                "1": "音乐视频达人"
              },
              "djStatus": 0,
              "vipType": 0,
              "remarkName": null,
              "avatarImgIdStr": "109951163424583352",
              "backgroundImgIdStr": "109951162868128395"
            },
            "urlInfo": {
              "id": "FF87FBB8BEF0EF2C6DAC587967E43744",
              "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/zn38lKzu_1837824579_shd.mp4?ts=1632359409&rid=5D81C711E6338E3432FFB01850BD957C&rl=3&rs=tXSyurhGqOnlQrVZdRXRyQYLHQPXPSOg&sign=e453c57cc97f1cba15f67b23c98f8d96&ext=6H9v2fQ6jguqt%2Fq7aRmsh1KtRNm5m3zo%2Bo3o69n8CN49ecVJp2B6MfWGSB6V9Q2X5suWWOY81mttBtTpEFCaVEcMHm5cwdEWhECdLBKKSBBGZE8ETVKfGTA%2Bsw3myjyk1w2Co57FlXE9CQmsDfWDxSa53Krj8ZyfGNpqBAkK%2Fn24KfgA8AVn8wRHbM%2BbPjtY6W1vZZpVI3470Z3De26N%2B6emRgHDoua0OxYHSWvqJDJ0k56Z%2F9hg7mXvKYy0H%2Bkn",
              "size": 93370226,
              "validityTime": 1200,
              "needPay": false,
              "payInfo": null,
              "r": 720
            },
            "videoGroup": [
              {
                "id": 58100,
                "name": "现场",
                "alg": null
              },
              {
                "id": 59101,
                "name": "华语现场",
                "alg": null
              },
              {
                "id": 57108,
                "name": "流行现场",
                "alg": null
              },
              {
                "id": 59108,
                "name": "巡演现场",
                "alg": null
              },
              {
                "id": 11137,
                "name": "TFBOYS",
                "alg": null
              },
              {
                "id": 1100,
                "name": "音乐现场",
                "alg": null
              },
              {
                "id": 5100,
                "name": "音乐",
                "alg": null
              }
            ],
            "previewUrl": null,
            "previewDurationms": 0,
            "hasRelatedGameAd": false,
            "markTypes": null,
            "relateSong": [
              {
                "name": "快乐环岛 (live)",
                "id": 29932449,
                "pst": 0,
                "t": 0,
                "ar": [
                  {
                    "id": 827728,
                    "name": "TFBOYS",
                    "tns": [],
                    "alias": []
                  }
                ],
                "alia": [],
                "pop": 100,
                "st": 0,
                "rt": null,
                "fee": 0,
                "v": 668,
                "crbt": null,
                "cf": "",
                "al": {
                  "id": 3087145,
                  "name": "2015江苏卫视新年演唱会",
                  "picUrl": "http://p4.music.126.net/RJoUUM_dSGSwwPzWaE041g==/3245758328218726.jpg",
                  "tns": [],
                  "pic": 3245758328218726
                },
                "dt": 232000,
                "h": null,
                "m": null,
                "l": {
                  "br": 128000,
                  "fid": 0,
                  "size": 3722082,
                  "vd": 6853
                },
                "a": null,
                "cd": "1",
                "no": 13,
                "rtUrl": null,
                "ftype": 0,
                "rtUrls": [],
                "djId": 0,
                "copyright": 2,
                "s_id": 0,
                "mst": 9,
                "cp": 0,
                "mv": 0,
                "rtype": 0,
                "rurl": null,
                "publishTime": 1420041600007,
                "privilege": {
                  "id": 29932449,
                  "fee": 0,
                  "payed": 0,
                  "st": 0,
                  "pl": 128000,
                  "dl": 128000,
                  "sp": 7,
                  "cp": 1,
                  "subp": 1,
                  "cs": false,
                  "maxbr": 128000,
                  "fl": 128000,
                  "toast": false,
                  "flag": 128,
                  "preSell": false
                }
              }
            ],
            "relatedInfo": null,
            "videoUserLiveInfo": null,
            "vid": "FF87FBB8BEF0EF2C6DAC587967E43744",
            "durationms": 250560,
            "playTime": 79669,
            "praisedCount": 972,
            "praised": false,
            "subscribed": false
          }
        },
        {
          "type": 1,
          "displayed": false,
          "alg": "onlineHotGroup",
          "extAlg": null,
          "data": {
            "alg": "onlineHotGroup",
            "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
            "threadId": "R_VI_62_20353CADC0C4EC0F33FEE2167D0063D5",
            "coverUrl": "https://p2.music.126.net/f6cJMbbC71eudug2xWe0Nw==/109951163573388939.jpg",
            "height": 360,
            "width": 642,
            "title": "王俊凯 深情演唱《水星记》 ，其实你才是最耀眼的那颗星",
            "description": "王俊凯 深情演唱《水星记》 ，其实你才是最耀眼的那颗星！",
            "commentCount": 3824,
            "shareCount": 6632,
            "resolutions": [
              {
                "resolution": 240,
                "size": 33115083
              }
            ],
            "creator": {
              "defaultAvatar": false,
              "province": 110000,
              "authStatus": 0,
              "followed": false,
              "avatarUrl": "http://p1.music.126.net/7De0VT_qkryGCIcgRZsVAA==/109951163250181909.jpg",
              "accountStatus": 0,
              "gender": 2,
              "city": 110101,
              "birthday": 783360000000,
              "userId": 469299550,
              "userType": 0,
              "nickname": "盛夏de星空",
              "signature": "啊对，不要吐槽我的表情包| ू•ૅω•́)ᵎᵎᵎ",
              "description": "",
              "detailDescription": "",
              "avatarImgId": 109951163250181900,
              "backgroundImgId": 109951163700421520,
              "backgroundUrl": "http://p1.music.126.net/43wVe-zokYiImlGdRonRSw==/109951163700421523.jpg",
              "authority": 0,
              "mutual": false,
              "expertTags": null,
              "experts": null,
              "djStatus": 0,
              "vipType": 11,
              "remarkName": null,
              "avatarImgIdStr": "109951163250181909",
              "backgroundImgIdStr": "109951163700421523"
            },
            "urlInfo": {
              "id": "20353CADC0C4EC0F33FEE2167D0063D5",
              "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/2QeSIa8L_1528902906_sd.mp4?ts=1632359409&rid=5D81C711E6338E3432FFB01850BD957C&rl=3&rs=taGWwEUPfkzSktvLkSXQmiryKOHMwzDv&sign=19df8704189a5375b4b1c3feca67f248&ext=6H9v2fQ6jguqt%2Fq7aRmsh1KtRNm5m3zo%2Bo3o69n8CN49ecVJp2B6MfWGSB6V9Q2X5suWWOY81mttBtTpEFCaVEcMHm5cwdEWhECdLBKKSBBGZE8ETVKfGTA%2Bsw3myjyk1w2Co57FlXE9CQmsDfWDxSa53Krj8ZyfGNpqBAkK%2Fn24KfgA8AVn8wRHbM%2BbPjtY6W1vZZpVI3470Z3De26N%2B6emRgHDoua0OxYHSWvqJDLFGXQJ8csbmgkOxxIBZv2L",
              "size": 33115083,
              "validityTime": 1200,
              "needPay": false,
              "payInfo": null,
              "r": 240
            },
            "videoGroup": [
              {
                "id": 58100,
                "name": "现场",
                "alg": null
              },
              {
                "id": 59101,
                "name": "华语现场",
                "alg": null
              },
              {
                "id": 57108,
                "name": "流行现场",
                "alg": null
              },
              {
                "id": 59108,
                "name": "巡演现场",
                "alg": null
              },
              {
                "id": 11137,
                "name": "TFBOYS",
                "alg": null
              },
              {
                "id": 1100,
                "name": "音乐现场",
                "alg": null
              },
              {
                "id": 5100,
                "name": "音乐",
                "alg": null
              },
              {
                "id": 14242,
                "name": "伤感",
                "alg": null
              },
              {
                "id": 25108,
                "name": "王俊凯",
                "alg": null
              }
            ],
            "previewUrl": null,
            "previewDurationms": 0,
            "hasRelatedGameAd": false,
            "markTypes": [
              109
            ],
            "relateSong": [],
            "relatedInfo": null,
            "videoUserLiveInfo": null,
            "vid": "20353CADC0C4EC0F33FEE2167D0063D5",
            "durationms": 368853,
            "playTime": 4900215,
            "praisedCount": 46254,
            "praised": false,
            "subscribed": false
          }
        },
        {
          "type": 1,
          "displayed": false,
          "alg": "onlineHotGroup",
          "extAlg": null,
          "data": {
            "alg": "onlineHotGroup",
            "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
            "threadId": "R_VI_62_9A30B8CB172323816B4E74EF4D123FD5",
            "coverUrl": "https://p1.music.126.net/80kKkTHCB7LhUCFGu6fFtQ==/109951163574082217.jpg",
            "height": 720,
            "width": 1280,
            "title": "TFBOYS - 是你（2160806三周年北京演唱会）",
            "description": "一直相信着\n在世界某个角落\n会有专属于我的 小小宇宙",
            "commentCount": 33,
            "shareCount": 52,
            "resolutions": [
              {
                "resolution": 240,
                "size": 37554155
              },
              {
                "resolution": 480,
                "size": 63714445
              },
              {
                "resolution": 720,
                "size": 120600036
              }
            ],
            "creator": {
              "defaultAvatar": false,
              "province": 110000,
              "authStatus": 0,
              "followed": false,
              "avatarUrl": "http://p1.music.126.net/5rK5EE48oekIjNHyR3GIYg==/109951163424583352.jpg",
              "accountStatus": 0,
              "gender": 0,
              "city": 110101,
              "birthday": -2209017600000,
              "userId": 1345020800,
              "userType": 0,
              "nickname": "拾號播放器",
              "signature": "让我们一起泡在音乐水里面",
              "description": "",
              "detailDescription": "",
              "avatarImgId": 109951163424583360,
              "backgroundImgId": 109951162868128400,
              "backgroundUrl": "http://p1.music.126.net/2zSNIqTcpHL2jIvU6hG0EA==/109951162868128395.jpg",
              "authority": 0,
              "mutual": false,
              "expertTags": null,
              "experts": {
                "1": "音乐视频达人"
              },
              "djStatus": 0,
              "vipType": 0,
              "remarkName": null,
              "avatarImgIdStr": "109951163424583352",
              "backgroundImgIdStr": "109951162868128395"
            },
            "urlInfo": {
              "id": "9A30B8CB172323816B4E74EF4D123FD5",
              "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/NpjroVqI_1837846238_shd.mp4?ts=1632359409&rid=5D81C711E6338E3432FFB01850BD957C&rl=3&rs=aBdkzEfyooUfdHRoGUbHfiOZXJTznQnE&sign=6d7b157957df73e46f6e69ad349a678c&ext=6H9v2fQ6jguqt%2Fq7aRmsh1KtRNm5m3zo%2Bo3o69n8CN49ecVJp2B6MfWGSB6V9Q2X5suWWOY81mttBtTpEFCaVEcMHm5cwdEWhECdLBKKSBBGZE8ETVKfGTA%2Bsw3myjyk1w2Co57FlXE9CQmsDfWDxSa53Krj8ZyfGNpqBAkK%2Fn24KfgA8AVn8wRHbM%2BbPjtY6W1vZZpVI3470Z3De26N%2B6emRgHDoua0OxYHSWvqJDJ0k56Z%2F9hg7mXvKYy0H%2Bkn",
              "size": 120600036,
              "validityTime": 1200,
              "needPay": false,
              "payInfo": null,
              "r": 720
            },
            "videoGroup": [
              {
                "id": 58100,
                "name": "现场",
                "alg": null
              },
              {
                "id": 59101,
                "name": "华语现场",
                "alg": null
              },
              {
                "id": 57108,
                "name": "流行现场",
                "alg": null
              },
              {
                "id": 59108,
                "name": "巡演现场",
                "alg": null
              },
              {
                "id": 11137,
                "name": "TFBOYS",
                "alg": null
              },
              {
                "id": 1100,
                "name": "音乐现场",
                "alg": null
              },
              {
                "id": 5100,
                "name": "音乐",
                "alg": null
              }
            ],
            "previewUrl": null,
            "previewDurationms": 0,
            "hasRelatedGameAd": false,
            "markTypes": null,
            "relateSong": [],
            "relatedInfo": null,
            "videoUserLiveInfo": null,
            "vid": "9A30B8CB172323816B4E74EF4D123FD5",
            "durationms": 232085,
            "playTime": 57212,
            "praisedCount": 513,
            "praised": false,
            "subscribed": false
          }
        }
      ]
    let videoList = this.data.videoList
    videoList.push(...newVideoList)
    //将视频最新的数据更新到原有的列表中
    this.setData({
      videoList
    })

  },
/*跳转到搜索界面*/
  toSearch(){
    wx.navigateTo({
      url:'/pages/search/search'
    })
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
  onShareAppMessage: function ({from}) {
    if(from === 'button'){}else{}
  }
})
