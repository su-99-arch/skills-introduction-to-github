// pages/lbs/lbs.js
const lbsUtil = require('../../utils/lbs');

// 腾讯地图 WebServiceAPI 密钥（请在 https://lbs.qq.com 申请并替换，勿将真实密钥提交到版本控制）
const MAP_KEY = 'YOUR_TENCENT_MAP_KEY';

// 默认坐标（北京）
const DEFAULT_LATITUDE = 39.9042;
const DEFAULT_LONGITUDE = 116.4074;

Page({
  data: {
    latitude: DEFAULT_LATITUDE,
    longitude: DEFAULT_LONGITUDE,
    accuracy: null,
    address: '',
    mapScale: 15,
    markers: [],
    loading: false,
    errorMsg: '',
    nearbyLoading: false,
    nearbyList: [],
    keywords: ['农资店', '农贸市场', '农业银行', '农机维修'],
    activeKeyword: '农资店'
  },

  onLoad() {
    this.onGetLocation();
  },

  /**
   * 获取当前位置
   */
  onGetLocation() {
    this.setData({ loading: true, errorMsg: '' });

    lbsUtil.checkAndRequestLocationAuth()
      .then(() => lbsUtil.getLocation())
      .then(res => {
        const { latitude, longitude, accuracy } = res;
        this.setData({
          latitude,
          longitude,
          accuracy,
          loading: false,
          markers: [{
            id: 1,
            latitude,
            longitude,
            title: '我的位置',
            iconPath: '/images/location-marker.png',
            width: 32,
            height: 32
          }]
        });
        this.fetchAddress(latitude, longitude);
        this.fetchNearby(latitude, longitude, this.data.activeKeyword);
      })
      .catch(err => {
        console.error('获取位置失败', err);
        this.setData({
          loading: false,
          errorMsg: '获取位置失败，请检查位置权限设置'
        });
      });
  },

  /**
   * 获取地址信息（逆地理编码）
   */
  fetchAddress(latitude, longitude) {
    if (!MAP_KEY || MAP_KEY === 'YOUR_TENCENT_MAP_KEY') {
      this.setData({ address: `纬度: ${latitude.toFixed(5)}, 经度: ${longitude.toFixed(5)}` });
      return;
    }
    lbsUtil.reverseGeocode(latitude, longitude, MAP_KEY)
      .then(result => {
        const address = result.address || result.formatted_addresses && result.formatted_addresses.recommend || '';
        this.setData({ address });
      })
      .catch(err => {
        console.error('逆地理编码失败', err);
        this.setData({ address: `纬度: ${latitude.toFixed(5)}, 经度: ${longitude.toFixed(5)}` });
      });
  },

  /**
   * 搜索附近农业服务
   */
  fetchNearby(latitude, longitude, keyword) {
    if (!MAP_KEY || MAP_KEY === 'YOUR_TENCENT_MAP_KEY') {
      this.setData({ nearbyList: [] });
      return;
    }
    this.setData({ nearbyLoading: true, nearbyList: [] });
    lbsUtil.searchNearby(latitude, longitude, keyword, MAP_KEY, 5000)
      .then(list => {
        const nearbyList = list.map(item => ({
          id: item.id,
          title: item.title,
          address: item.address,
          latitude: item.location.lat,
          longitude: item.location.lng,
          distanceStr: lbsUtil.formatDistance(
            lbsUtil.calcDistance(latitude, longitude, item.location.lat, item.location.lng)
          )
        }));
        this.setData({ nearbyList, nearbyLoading: false });
      })
      .catch(err => {
        console.error('搜索附近失败', err);
        this.setData({ nearbyLoading: false });
      });
  },

  /**
   * 切换附近搜索关键词
   */
  onKeywordTap(e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({ activeKeyword: keyword });
    const { latitude, longitude } = this.data;
    if (latitude !== DEFAULT_LATITUDE || longitude !== DEFAULT_LONGITUDE) {
      this.fetchNearby(latitude, longitude, keyword);
    }
  },

  /**
   * 使用微信内置地图选择位置
   */
  onChooseLocation() {
    lbsUtil.chooseLocation()
      .then(res => {
        const { latitude, longitude, name, address } = res;
        this.setData({
          latitude,
          longitude,
          address: address || name,
          markers: [{
            id: 1,
            latitude,
            longitude,
            title: name || '选中位置',
            iconPath: '/images/location-marker.png',
            width: 32,
            height: 32
          }]
        });
        this.fetchNearby(latitude, longitude, this.data.activeKeyword);
      })
      .catch(err => {
        if (err && err.errMsg && err.errMsg.indexOf('cancel') === -1) {
          console.error('选择位置失败', err);
        }
      });
  },

  /**
   * 点击附近地点列表项
   */
  onNearbyItemTap(e) {
    const item = e.currentTarget.dataset.item;
    this.setData({
      latitude: item.latitude,
      longitude: item.longitude,
      mapScale: 17
    });
  },

  /**
   * 导航到选中地点
   */
  onNavigate(e) {
    const item = e.currentTarget.dataset.item;
    wx.openLocation({
      latitude: item.latitude,
      longitude: item.longitude,
      name: item.title,
      address: item.address,
      scale: 17
    });
  }
});
