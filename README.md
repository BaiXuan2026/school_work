# 5G-V2X 智能车联网超视距协同避让可视化系统

## 项目介绍

基于 5G-V2X 的智能车联网超视距协同避让可视化系统，通过可视化技术还原车联网核心价值——打破单车雷达感知局限，让车辆被遮挡的盲区路况变得可见，直观展示超视距协同避让的安全能力。

## 技术栈

- **前端框架**: Vue 3 + Element Plus
- **可视化**: Canvas (车辆动画) + ECharts (指标面板)
- **数据处理**: SheetJS (xlsx 库)
- **样式**: SCSS
- **构建工具**: Vite

## 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0
- 推荐使用 Chrome、Edge、Firefox 最新版本浏览器

## 安装步骤

1. 进入项目目录

```bash
cd 5g-v2x-visualization-system
```

2. 安装依赖

```bash
npm install
```

3. 启动开发服务器

```bash
npm run dev
```

4. 浏览器访问 http://localhost:3000

## 功能操作说明

### 1. 场景切换

系统提供 5 种场景一键切换：
- **城市道路**: 车速 20-60km/h，密度 100-300veh/km
- **快速路**: 车速 60-90km/h，密度 50-200veh/km
- **高速公路**: 车速 90-120km/h，密度 50-150veh/km
- **匝道**: 车速 30-50km/h，密度 50-150veh/km
- **隧道**: 车速 40-80km/h，密度 50-200veh/km

点击左侧控制区的场景按钮即可切换，页面会自动更新道路布局、车辆模型、盲区样式和指标数据。

### 2. 参数调节

#### 行驶车速
- 滑动调节或手动输入
- 步长: 10km/h
- 范围跟随当前场景自动适配
- 调节时车辆动画速度实时联动

#### 车辆密度
- 滑动调节或手动输入
- 步长: 50veh/km
- 范围跟随当前场景自动适配
- 调节时周边车辆数量实时联动

### 3. 预警阈值设置

- **一级预警阈值**: 范围 0-100%，默认 80%
- **二级预警阈值**: 范围 0-100%，默认 50%
- 一级阈值必须大于二级阈值

### 4. 数据上传

支持上传本地 .xls/.xlsx 格式的仿真数据文件：

**文件格式要求：**
- 第一行为表头，必须包含以下字段：
  - 车速
  - 车辆密度
  - 50米消息接收成功率
  - 150米消息接收成功率
  - 150米丢包率
  - 相邻车辆数
  - 信道忙碌率
  - 平均消息时延
  - 吞吐量
  - 无线盲区指标
  - 避让成功率
  - 提前预警时间

- 示例表头：
  ```
  车速|车辆密度|50米消息接收成功率|150米消息接收成功率|150米丢包率|相邻车辆数|信道忙碌率|平均消息时延|吞吐量|无线盲区指标|避让成功率|提前预警时间
  ```

### 5. 重置模拟

点击顶部「重置模拟」按钮可恢复：
- 当前场景的车速、车辆密度默认值
- 解除所有预警与碰撞状态
- 恢复初始正常行驶动画

### 6. 预警状态说明

- **正常状态**: 避让成功率 >= 一级阈值，无预警提示
- **一级预警**: 二级阈值 <= 避让成功率 < 一级阈值，红色警告
- **二级预警**: 避让成功率 < 二级阈值，触发碰撞动画

## 项目结构

```
5g-v2x-visualization-system/
├── public/
│   └── favicon.svg           # 网站图标
├── src/
│   ├── assets/
│   │   └── styles/
│   │       └── main.scss     # 全局样式
│   ├── components/
│   │   └── VisualizationCanvas.vue  # 可视化画布组件
│   ├── data/
│   │   └── simulationData.js # 默认仿真数据集
│   ├── App.vue               # 主组件
│   └── main.js               # 入口文件
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 后续迭代说明

### 对接实时地图数据

如需对接实时地图数据（如高德/百度地图），可按以下步骤修改：

1. **在 index.html 中引入地图 SDK**

```html
<script src="https://webapi.amap.com/maps?v=2.0&key=YOUR_KEY"></script>
```

2. **创建地图组件** `src/components/MapView.vue`

```vue
<template>
  <div id="map-container" ref="mapRef"></div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const mapRef = ref(null)

onMounted(() => {
  const map = new AMap.Map(mapRef.value, {
    zoom: 15,
    center: [116.397428, 39.90923]
  })
})
</script>
```

3. **在 App.vue 中集成地图组件**

在可视化画布区域添加地图叠加层或替换 Canvas

### 新增场景扩展

1. 在 `src/data/simulationData.js` 的 `sceneConfigs` 中添加新场景配置
2. 在 `VisualizationCanvas.vue` 的 `drawRoad()` 方法中添加对应的道路渲染逻辑
3. 在 `updateBlindSpots()` 方法中添加对应的盲区生成逻辑

## 性能优化建议

- 车辆动画使用 requestAnimationFrame 保证 60fps
- 数据变化使用计算属性缓存，避免重复计算
- 大数据量场景考虑使用虚拟列表或分页
- 图片资源使用 CDN 加速加载

## 许可证

MIT License
