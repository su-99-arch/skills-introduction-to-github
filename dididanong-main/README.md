# 嘀嘀哒农 (dididanong-main)

智慧农业服务微信小程序，集成 LBS 位置服务功能。

## LBS 功能说明

本项目新增了 **LBS（位置服务）** 模块，提供以下能力：

### 功能清单

| 功能 | 描述 |
|------|------|
| 获取当前位置 | 调用 `wx.getLocation` 获取用户 GPS 坐标 |
| 地图展示 | 在 `<map>` 组件中显示当前位置和标注 |
| 逆地理编码 | 将坐标转换为可读地址（依赖腾讯地图 API） |
| 附近农业服务搜索 | 搜索周边农资店、农贸市场等 POI（依赖腾讯地图 API） |
| 选择位置 | 调用 `wx.chooseLocation` 让用户手动选择位置 |
| 地图导航 | 调用 `wx.openLocation` 打开微信内置导航 |
| 距离计算 | 使用 Haversine 公式计算两点间距离 |

### 文件结构

```
dididanong-main/
├── app.js                    # 全局应用初始化
├── app.json                  # 全局配置（含位置权限声明）
├── app.wxss                  # 全局样式
├── project.config.json       # 项目配置
├── sitemap.json
├── images/
│   └── location-marker.png   # 地图标注图标（需替换为实际图片）
├── pages/
│   ├── index/                # 首页
│   │   ├── index.js
│   │   ├── index.json
│   │   ├── index.wxml
│   │   └── index.wxss
│   └── lbs/                  # LBS 位置服务页
│       ├── lbs.js
│       ├── lbs.json
│       ├── lbs.wxml
│       └── lbs.wxss
└── utils/
    └── lbs.js                # LBS 工具函数库
```

### 配置说明

#### 1. 微信小程序后台配置

在 [微信公众平台](https://mp.weixin.qq.com) → 开发管理 → 接口设置 中开启：
- **位置信息**（`getLocation`）
- **模糊地理位置**（可选）

#### 2. 腾讯地图 API 密钥

在 `pages/lbs/lbs.js` 中将 `MAP_KEY` 替换为您在 [腾讯位置服务](https://lbs.qq.com) 申请的 WebServiceAPI 密钥：

```js
const MAP_KEY = 'YOUR_TENCENT_MAP_KEY'; // 替换此处
```

同时在腾讯位置服务控制台中，将小程序 AppID 加入密钥的域名白名单。

#### 3. request 合法域名

在微信公众平台 → 开发管理 → 开发设置 → 服务器域名 中添加：
```
https://apis.map.qq.com
```

### 依赖说明

本项目仅依赖微信小程序原生 API 及腾讯地图 WebService API，无需额外 npm 包。

### 权限声明

`app.json` 中已声明位置权限：

```json
"permission": {
  "scope.userLocation": {
    "desc": "您的位置信息将用于为您提供附近农业服务和精准农事建议"
  }
},
"requiredPrivateInfos": ["getLocation", "chooseLocation"]
```
