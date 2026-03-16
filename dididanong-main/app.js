// app.js
App({
  onLaunch() {
    // 初始化本地存储的位置信息
    const locationInfo = wx.getStorageSync('locationInfo');
    if (!locationInfo) {
      wx.setStorageSync('locationInfo', null);
    }
  },

  globalData: {
    userInfo: null,
    locationInfo: null
  }
});
