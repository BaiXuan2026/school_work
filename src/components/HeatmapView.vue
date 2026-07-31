<template>
  <!-- 左侧控制区 -->
  <aside class="left-panel">
    <div class="scroll-container">
      <div class="control-card">
      <div class="card-header">
        <el-icon><Clock /></el-icon>
        <span>风险时段选择</span>
      </div>
      <div class="current-time-display">
        <el-icon><Calendar /></el-icon>
        <span>{{ formatCurrentTime }}</span>
      </div>
      <div class="period-buttons">
        <button
          v-for="(config, key) in timePeriods"
          :key="key"
          :class="['period-btn', { active: currentPeriod === key, 'current-period': isCurrentPeriod(key) }]"
          @click="handlePeriodChange(key)"
        >
          <span class="period-name">{{ config.name }}</span>
          <span class="period-time">{{ config.timeRange }}</span>
        </button>
      </div>
      <div class="return-current-btn" v-if="!isCurrentPeriod(currentPeriod)">
        <button class="return-btn" @click="returnToCurrentPeriod">
          <el-icon class="return-icon"><Refresh /></el-icon>
          <span class="return-text">返回当前时段</span>
        </button>
      </div>

      <div class="day-trend-card" v-if="dayTrendData.length > 0">
        <div class="card-header">
          <el-icon><DataAnalysis /></el-icon>
          <span>全天风险趋势</span>
        </div>
        <div class="day-trend-chart">
          <div ref="dayTrendChartRef" class="day-trend-line-chart"></div>
        </div>
        <div class="day-trend-legend">
          <div
            v-for="item in dayTrendData"
            :key="item.period"
            class="legend-item"
            :class="{ active: currentPeriod === item.period }"
            @click="handlePeriodChange(item.period)"
          >
            <span class="legend-dot" :style="{ background: item.color }"></span>
            <span class="legend-text">{{ item.name }}</span>
            <span class="legend-value">{{ item.avoidanceSuccess.toFixed(1) }}%</span>
          </div>
        </div>
      </div>
    </div>

    <div class="control-card">
      <div class="card-header">
        <el-icon><Warning /></el-icon>
        <span>风险等级阈值</span>
      </div>

      <div class="param-item">
        <div class="param-header">
          <span class="param-name low">低风险阈值</span>
          <span class="param-value low">≥ {{ riskThresholds.low }}%</span>
        </div>
        <el-slider v-model="riskThresholds.low" :min="50" :max="100" :step="1" />
      </div>

      <div class="param-item">
        <div class="param-header">
          <span class="param-name medium-low">较低风险阈值</span>
          <span class="param-value medium-low">≥ {{ riskThresholds.mediumLow }}%</span>
        </div>
        <el-slider v-model="riskThresholds.mediumLow" :min="50" :max="100" :step="1" />
      </div>

      <div class="param-item">
        <div class="param-header">
          <span class="param-name medium">中风险阈值</span>
          <span class="param-value medium">≥ {{ riskThresholds.medium }}%</span>
        </div>
        <el-slider v-model="riskThresholds.medium" :min="50" :max="100" :step="1" />
      </div>

      <div class="param-item">
        <div class="param-header">
          <span class="param-name medium-high">较高风险阈值</span>
          <span class="param-value medium-high">≥ {{ riskThresholds.mediumHigh }}%</span>
        </div>
        <el-slider v-model="riskThresholds.mediumHigh" :min="50" :max="100" :step="1" />
      </div>

      <div class="threshold-error" v-if="!isThresholdValid">
        <el-icon><CircleCloseFilled /></el-icon>
        阈值设置不符合规则
      </div>
    </div>

    <div class="control-card">
      <div class="card-header">
        <!-- 【注释】Layer图标暂时注释，后期再实现 -->
        <!-- <el-icon><Layer /></el-icon> -->
        <span>图层控制</span>
      </div>
      <div class="layer-controls">
        <!-- 【注释】路名显示开关已禁用 -->
        <!-- <el-switch v-model="layerSettings.showRoadNames" active-text="显示路名" /> -->
        <el-switch v-model="layerSettings.showLowRisk" active-text="显示低风险" />
        <el-switch v-model="layerSettings.showLegend" active-text="显示图例" />
      </div>
    </div>

    <div class="control-card">
      <div class="card-header">
        <el-icon><Upload /></el-icon>
        <span>风险数据上传</span>
      </div>
      <el-upload
        ref="uploadRef"
        class="data-upload"
        drag
        :auto-upload="false"
        :show-file-list="false"
        accept=".xls,.xlsx"
        :on-change="handleFileUpload"
      >
        <el-icon class="upload-icon"><UploadFilled /></el-icon>
        <div class="upload-text">点击或拖拽上传文件</div>
        <template #tip>
          <div class="upload-tip">仅支持 .xls/.xlsx 格式</div>
        </template>
      </el-upload>
    </div>
    </div> <!-- 关闭滚动容器 -->
  </aside>

  <!-- 主热力地图区 -->
  <section class="heatmap-section">
    <!-- 【修改】使用集成了 ECharts 的 MapView 组件，添加点击事件 -->
    <MapView
      ref="mapViewRef"
      :show-morning-overlay="showPeriodOverlay"
      :morning-image="currentPeriodImage"
      :image-position="{ lng: 113.362317, lat: 22.196373 }"
      :image-size="{ width: 570, height: 570 }"
      @map-loaded="handleMapLoaded"
      @chart-click="handleChartClick"
      @road-click="handleRoadClick"
      @map-move="handleMapMove"
    />
  </section>

  <!-- 右侧指标面板 -->
  <aside class="right-panel">
    <div class="scroll-container">
      <div class="indicator-card" v-if="!selectedRoad">
      <div class="prediction-card">
        <div class="card-header">
          <el-icon><DataLine /></el-icon>
          <span>风险趋势预测</span>
        </div>
        <div class="prediction-summary">
          <div class="prediction-main">
            <div class="prediction-label">当前风险</div>
            <div class="prediction-value" :style="{ color: getPredictionRiskLevel(globalPrediction.current).color }">
              {{ globalPrediction.current }}%
            </div>
            <div class="prediction-trend" :class="globalPrediction.trendDirection">
              {{ globalPrediction.trendDescription }}
            </div>
          </div>
        </div>
        <div class="prediction-details">
          <div class="prediction-item">
            <span class="pred-label">30分钟后</span>
            <span class="pred-value" :style="{ color: getPredictionRiskLevel(globalPrediction.prediction30min).color }">
              {{ globalPrediction.prediction30min }}%
            </span>
            <span class="pred-change" :class="{ negative: globalPrediction.riskChange30min < 0, positive: globalPrediction.riskChange30min > 0 }">
              {{ globalPrediction.riskChange30min > 0 ? '+' : '' }}{{ globalPrediction.riskChange30min }}%
            </span>
          </div>
          <div class="prediction-item">
            <span class="pred-label">1小时后</span>
            <span class="pred-value" :style="{ color: getPredictionRiskLevel(globalPrediction.prediction60min).color }">
              {{ globalPrediction.prediction60min }}%
            </span>
            <span class="pred-change" :class="{ negative: globalPrediction.riskChange60min < 0, positive: globalPrediction.riskChange60min > 0 }">
              {{ globalPrediction.riskChange60min > 0 ? '+' : '' }}{{ globalPrediction.riskChange60min }}%
            </span>
          </div>
        </div>
        <div class="prediction-chart">
          <div ref="predictionChartRef" class="prediction-line-chart"></div>
        </div>
      </div>

      <div class="card-header">
        <el-icon><DataAnalysis /></el-icon>
        <span>城市全局风险概览</span>
      </div>

      <div class="indicator-grid two-col">
        <div class="indicator-item main">
          <div class="ind-value primary">{{ globalStats.avgAvoidance?.toFixed(1) || '--' }}</div>
          <div class="ind-unit">%</div>
          <div class="ind-label">平均避让成功率</div>
        </div>
        <div class="indicator-item">
          <div class="ind-value danger">{{ globalStats.highRiskCount }}</div>
          <div class="ind-unit">条</div>
          <div class="ind-label">高风险路段</div>
        </div>
        <div class="indicator-item">
          <div class="ind-value warning">{{ globalStats.mediumRiskCount }}</div>
          <div class="ind-unit">条</div>
          <div class="ind-label">中风险路段</div>
        </div>
        <div class="indicator-item">
          <div class="ind-value success">{{ globalStats.lowRiskCount }}</div>
          <div class="ind-unit">条</div>
          <div class="ind-label">低风险路段</div>
        </div>
      </div>

      <div class="top-risk-section">
        <div class="section-title">风险最高的Top3路段</div>
        <div class="top-road-item" v-for="(road, index) in globalStats.topRiskRoads" :key="index">
          <span class="rank">{{ index + 1 }}</span>
          <span class="road-name">{{ road.name }}</span>
          <span class="road-risk" :style="{ color: getRiskColor(road.riskLevel) }">
            {{ road.avoidanceSuccess?.toFixed(1) }}%
          </span>
        </div>
      </div>

      <div class="chart-container">
        <div ref="pieChartRef" class="pie-chart"></div>
      </div>
    </div>

    <div class="indicator-card" v-else>
      <div class="card-header">
        <el-icon><Location /></el-icon>
        <span>路段详情</span>
      </div>

      <div class="indicator-grid">
        <div class="indicator-item">
          <div class="ind-value">{{ selectedRoad.roadName }}</div>
          <div class="ind-label">路段名称</div>
        </div>
        <div class="indicator-item">
          <div class="ind-value">{{ selectedRoad.roadLevel }}</div>
          <div class="ind-label">道路层级</div>
        </div>
        <div class="indicator-item">
          <div class="ind-value" :style="{ color: getRiskColor(selectedRoad.riskLevel) }">
            {{ getRiskLevelName(selectedRoad.riskLevel) }}
          </div>
          <div class="ind-label">风险等级</div>
        </div>
        <div class="indicator-item">
          <div class="ind-value">{{ selectedRoad.avoidanceSuccess?.toFixed(1) }}</div>
          <div class="ind-unit">%</div>
          <div class="ind-label">避让成功率</div>
        </div>
        <div class="indicator-item">
          <div class="ind-value">{{ selectedRoad.earlyWarning?.toFixed(1) }}</div>
          <div class="ind-unit">s</div>
          <div class="ind-label">提前预警时间</div>
        </div>
        <div class="indicator-item">
          <div class="ind-value">{{ selectedRoad.avgSpeed }}</div>
          <div class="ind-unit">km/h</div>
          <div class="ind-label">平均车速</div>
        </div>
      </div>

      <div class="risk-suggestion" :class="selectedRoad.riskLevel">
        <div class="suggestion-title">
          <el-icon><WarningFilled /></el-icon>
          风险建议
        </div>
        <div class="suggestion-content">
          {{ getRiskSuggestion(selectedRoad.riskLevel, selectedRoad.avoidanceSuccess) }}
        </div>
      </div>

      <div class="chart-container">
        <div class="section-title">过去24小时风险趋势</div>
        <div ref="lineChartRef" class="line-chart"></div>
      </div>

      <div class="prediction-card road-prediction" v-if="selectedRoadPrediction">
        <div class="card-header">
          <el-icon><DataLine /></el-icon>
          <span>路段风险预测</span>
        </div>
        <div class="prediction-summary">
          <div class="prediction-main">
            <div class="prediction-label">{{ selectedRoad.roadName }} 当前</div>
            <div class="prediction-value" :style="{ color: getPredictionRiskLevel(selectedRoadPrediction.current).color }">
              {{ selectedRoadPrediction.current }}%
            </div>
            <div class="prediction-trend" :class="selectedRoadPrediction.trend30min">
              {{ selectedRoadPrediction.trend30min === 'increasing' ? '风险上升' : selectedRoadPrediction.trend30min === 'decreasing' ? '风险下降' : '风险平稳' }}
            </div>
          </div>
        </div>
        <div class="prediction-details">
          <div class="prediction-item">
            <span class="pred-label">30分钟后</span>
            <span class="pred-value" :style="{ color: getPredictionRiskLevel(selectedRoadPrediction.prediction30min).color }">
              {{ selectedRoadPrediction.prediction30min }}%
            </span>
            <span class="pred-change" :class="{ negative: selectedRoadPrediction.trend30min === 'decreasing', positive: selectedRoadPrediction.trend30min === 'increasing' }">
              {{ selectedRoadPrediction.trend30min === 'decreasing' ? '↓' : selectedRoadPrediction.trend30min === 'increasing' ? '↑' : '-' }}
            </span>
          </div>
          <div class="prediction-item">
            <span class="pred-label">1小时后</span>
            <span class="pred-value" :style="{ color: getPredictionRiskLevel(selectedRoadPrediction.prediction60min).color }">
              {{ selectedRoadPrediction.prediction60min }}%
            </span>
            <span class="pred-change" :class="{ negative: selectedRoadPrediction.trend60min === 'decreasing', positive: selectedRoadPrediction.trend60min === 'increasing' }">
              {{ selectedRoadPrediction.trend60min === 'decreasing' ? '↓' : selectedRoadPrediction.trend60min === 'increasing' ? '↑' : '-' }}
            </span>
          </div>
        </div>
        <div class="confidence-bar">
          <span class="confidence-label">预测置信度</span>
          <div class="confidence-track">
            <div class="confidence-fill" :style="{ width: (selectedRoadPrediction.confidence * 100) + '%' }"></div>
          </div>
          <span class="confidence-value">{{ (selectedRoadPrediction.confidence * 100).toFixed(0) }}%</span>
        </div>
      </div>

      <el-button class="back-btn" @click="selectedRoad = null">
        <el-icon><Back /></el-icon>
        返回全局概览
      </el-button>
    </div>
    </div> <!-- 关闭滚动容器 -->
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import * as XLSX from 'xlsx'
// 【添加】导入地图组件
import MapView from './MapView.vue'
import {
  timePeriods,
  riskLevels,
  defaultHeatmapData,
  getRiskLevel,
  getRiskColor,
  heatmapFieldMappings,
  heatmapRequiredFields,
  generateHistoryData,
  roadSegments,
  roadTypeNames,
  getCurrentPeriod,
  getPeriodName,
  getPeriodTimeRange,
  parseTableData,
  groupByPeriod,
  calculateCompositeRisk,
  predictRiskTrend,
  predictGlobalRiskTrend,
  getPredictionRiskLevel
} from '../data/heatmapData.js'

// 各时段图片
import morningImage from '../images/001.png'
import normalImage from '../images/002.png'
import eveningImage from '../images/003.png'
import nightImage from '../images/004.png'

const props = defineProps({
  externalReset: { type: Boolean, default: false }
})

const emit = defineEmits(['reset-done', 'switch-to-scene'])

// 数据模式：'simulated'（模拟数据）或 'uploaded'（上传数据）
const dataMode = ref('simulated')
// 当前时段
const currentPeriod = ref(getCurrentPeriod())
// 风险阈值配置
const riskThresholds = ref({
  low: 90, mediumLow: 80, medium: 70, mediumHigh: 60
})
// 图层设置
const layerSettings = ref({
  showRoadNames: true, showLowRisk: true, showLegend: false  // 默认关闭图例
})
// 热力图数据
const heatmapData = ref({ ...defaultHeatmapData })
// 选中的道路
const selectedRoad = ref(null)
// 上传引用
const uploadRef = ref(null)
// 当前时间
const currentTime = ref(new Date())

const chartRef = ref(null)
const pieChartRef = ref(null)
const lineChartRef = ref(null)
const predictionChartRef = ref(null)
const dayTrendChartRef = ref(null)
const mapViewRef = ref(null)

let chartInstance = null
let pieChartInstance = null
let lineChartInstance = null
let predictionChartInstance = null
let dayTrendChartInstance = null

const currentPeriodData = computed(() => {
  return heatmapData.value[currentPeriod.value] || []
})

// 根据当前时段返回对应的图片
const currentPeriodImage = computed(() => {
  const imageMap = {
    morning: morningImage,
    normal: normalImage,
    evening: eveningImage,
    night: nightImage
  }
  return imageMap[currentPeriod.value] || null
})

// 是否显示时段图片（需要时段有对应图片且图例开启）
const showPeriodOverlay = computed(() => {
  return layerSettings.value.showLegend && currentPeriodImage.value !== null
})

const isThresholdValid = computed(() => {
  const t = riskThresholds.value
  return t.low > t.mediumLow && t.mediumLow > t.medium && t.medium > t.mediumHigh
})

const globalStats = computed(() => {
  const data = currentPeriodData.value
  const dataWithRisk = data.map(item => ({
    ...item,
    riskLevel: getRiskLevel(item.avoidanceSuccess, riskThresholds.value)
  }))

  const filteredData = layerSettings.value.showLowRisk
    ? dataWithRisk
    : dataWithRisk.filter(item => item.riskLevel !== 'low')

  const avgAvoidance = filteredData.length > 0
    ? filteredData.reduce((sum, item) => sum + item.avoidanceSuccess, 0) / filteredData.length
    : 0

  const highRiskCount = filteredData.filter(item => item.riskLevel === 'high').length
  const mediumRiskCount = filteredData.filter(item => item.riskLevel === 'medium').length
  const lowRiskCount = filteredData.filter(item => item.riskLevel === 'low').length

  const sortedByRisk = [...filteredData].sort((a, b) => a.avoidanceSuccess - b.avoidanceSuccess)
  const topRiskRoads = sortedByRisk.slice(0, 3).map(item => ({
    name: item.roadName, avoidanceSuccess: item.avoidanceSuccess, riskLevel: item.riskLevel
  }))

  const riskDistribution = {
    low: filteredData.filter(item => item.riskLevel === 'low').length,
    mediumLow: filteredData.filter(item => item.riskLevel === 'mediumLow').length,
    medium: filteredData.filter(item => item.riskLevel === 'medium').length,
    mediumHigh: filteredData.filter(item => item.riskLevel === 'mediumHigh').length,
    high: filteredData.filter(item => item.riskLevel === 'high').length
  }

  return { avgAvoidance, highRiskCount, mediumRiskCount, lowRiskCount, topRiskRoads, riskDistribution, dataWithRisk }
})

const globalPrediction = computed(() => {
  const allData = [
    ...(heatmapData.value.morning || []),
    ...(heatmapData.value.normal || []),
    ...(heatmapData.value.evening || []),
    ...(heatmapData.value.night || [])
  ]
  return predictGlobalRiskTrend(allData, 30)
})

const selectedRoadPrediction = computed(() => {
  if (!selectedRoad.value) return null
  const roadId = selectedRoad.value.roadId
  const historyData = generateHistoryData(roadId)
  return predictRiskTrend(historyData, 30)
})

const dayTrendData = computed(() => {
  const periods = ['morning', 'normal', 'evening', 'night']
  return periods.map(period => {
    const data = heatmapData.value[period] || []
    const avgAvoidance = data.length > 0
      ? data.reduce((sum, road) => sum + (road.avoidanceSuccess || 0), 0) / data.length
      : 80
    const riskLevel = getRiskLevel(100 - avgAvoidance, riskThresholds.value)
    return {
      period,
      name: getPeriodName(period),
      timeRange: getPeriodTimeRange(period),
      avoidanceSuccess: avgAvoidance,
      riskLevel,
      color: riskLevels[riskLevel]?.color || '#60a5fa'
    }
  })
})

function getRiskLevelName(level) {
  return riskLevels[level]?.name || '--'
}

function getRiskSuggestion(riskLevel, avoidanceSuccess) {
  const rate = parseFloat(avoidanceSuccess)
  const suggestions = {
    high: `【紧急改造建议】当前避让成功率仅${rate.toFixed(1)}%，存在严重安全隐患。建议：\n1. 立即增设V2X路侧通信单元(RSU)，部署密度建议≥2个/公里\n2. 优化交通信号配时，增加预警时间至少2秒以上\n3. 设置可变情报板，实时发布预警信息\n4. 考虑实施限速措施，降低路段最高限速20%`,
    mediumHigh: `【重点改造建议】当前避让成功率${rate.toFixed(1)}%，风险较高。建议：\n1. 加密V2X通信设备，部署间距建议控制在500米以内\n2. 增设提前预警设施，建议预警距离提升至150米以上\n3. 优化该路段的车道配置，增加合流辅助车道\n4. 定期检测通信质量，确保信道畅通率≥95%`,
    medium: `【一般改造建议】当前避让成功率${rate.toFixed(1)}%，有提升空间。建议：\n1. 适当增加V2X路侧设备，提高覆盖率\n2. 优化道路标线和大车让行标识\n3. 在关键路口设置绿波通行信号\n4. 定期组织交通安全宣传活动`,
    mediumLow: `【维护建议】当前避让成功率${rate.toFixed(1)}%，交通状况良好。建议：\n1. 保持现有V2X设备良好运行状态\n2. 定期巡检通信链路，确保延迟<50ms\n3. 持续监测交通流量变化，及时调整信号配时\n4. 继续保持文明驾驶宣传教育工作`,
    low: `【优秀水平】当前避让成功率${rate.toFixed(1)}%，交通安全状况优秀。建议：\n1. 当前方案运行良好，建议总结推广成功经验\n2. 可适当考虑扩大V2X覆盖范围，辐射周边道路\n3. 持续数据采集分析，为智慧交通优化提供支撑`
  }
  return suggestions[riskLevel] || '交通状况正常，建议保持常规维护。'
}

// 格式化当前时间显示
const formatCurrentTime = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
})

// 判断是否为当前时段
function isCurrentPeriod(period) {
  return period === getCurrentPeriod()
}

// 返回当前时段
function returnToCurrentPeriod() {
  currentPeriod.value = getCurrentPeriod()
  selectedRoad.value = null
  ElMessage.success(`已切换到当前时段: ${getPeriodName(currentPeriod.value)}`)
  nextTick(() => { updateCharts() })
}

// 更新数据模式显示
function updateDataModeDisplay() {
  // 可以在这里添加数据模式的UI提示
  console.log(`当前数据模式: ${dataMode.value}`)
}

function handlePeriodChange(period) {
  currentPeriod.value = period
  selectedRoad.value = null
  nextTick(() => { updateCharts() })
}

// 处理道路标记点点击事件 - 跳转到协同避让视图
function handleRoadClick(roadInfo) {
  emit('switch-to-scene', {
    roadId: roadInfo.roadId,
    roadName: roadInfo.roadName,
    roadType: roadInfo.roadType,
    coords: roadInfo.coords
  })
}

function updateCharts() {
  updateHeatmapChart()
  updatePieChart()
  updatePredictionChart()
  updateDayTrendChart()
}

// 【添加】地图加载完成后的回调
function handleMapLoaded(mapInstance) {
  nextTick(() => {
    updateHeatmapChart()
  })
}

// 【添加】地图移动时的回调 - 用于同步图片位置
function handleMapMove(data) {
  // 地图移动事件处理，可以在这里更新图片的transform
  // 由于图片使用绝对定位且与地图容器完全重合
  // 图片会自动跟随地图容器移动，无需额外处理
  console.log('Map moved to:', data.center, 'Zoom:', data.zoom)
}

// 【修改】通过 MapView 组件更新热力图
function updateHeatmapChart() {
  // 如果 MapView ref 存在，通过它更新热力图
  if (mapViewRef.value) {
    const option = buildHeatmapOption()
    mapViewRef.value.updateChartOption(option)
    return
  }

  // 否则使用原来的方式（兼容非地图模式）
  if (chartInstance) {
    const option = buildHeatmapOption()
    chartInstance.setOption(option, true)
  }
}

// 【添加】构建热力图配置的公共函数
function buildHeatmapOption() {
  const data = globalStats.value.dataWithRisk
  const categoryData = []
  const seriesData = []

  const mainRoads = data.filter(d => d.roadLevel === '主干道')
  mainRoads.forEach((road, index) => {
    const angle = (index / mainRoads.length) * Math.PI * 2
    const x = Math.cos(angle) * 40 + 50
    const y = Math.sin(angle) * 35 + 50
    categoryData.push({ name: road.roadName, roadId: road.roadId, level: road.roadLevel, riskLevel: road.riskLevel, avoidanceSuccess: road.avoidanceSuccess })
    seriesData.push({ name: road.roadName, value: [x, y, road.avoidanceSuccess, road.riskLevel], roadId: road.roadId, roadName: road.roadName, roadLevel: road.roadLevel, roadType: road.roadType, roadTypeName: roadTypeNames[road.roadType] || road.roadLevel, riskLevel: road.riskLevel, avoidanceSuccess: road.avoidanceSuccess, earlyWarning: road.earlyWarning, avgSpeed: road.avgSpeed, vehicleDensity: road.vehicleDensity })
  })

  const subRoads = data.filter(d => d.roadLevel === '次干道')
  subRoads.forEach((road, index) => {
    const angle = (index / subRoads.length) * Math.PI * 2
    const x = Math.cos(angle) * 25 + 50
    const y = Math.sin(angle) * 22 + 50
    categoryData.push({ name: road.roadName, roadId: road.roadId, level: road.roadLevel, riskLevel: road.riskLevel, avoidanceSuccess: road.avoidanceSuccess })
    seriesData.push({ name: road.roadName, value: [x, y, road.avoidanceSuccess, road.riskLevel], roadId: road.roadId, roadName: road.roadName, roadLevel: road.roadLevel, roadType: road.roadType, roadTypeName: roadTypeNames[road.roadType] || road.roadLevel, riskLevel: road.riskLevel, avoidanceSuccess: road.avoidanceSuccess, earlyWarning: road.earlyWarning, avgSpeed: road.avgSpeed, vehicleDensity: road.vehicleDensity })
  })

  const branchRoads = data.filter(d => d.roadLevel === '支路')
  branchRoads.forEach((road, index) => {
    const angle = (index / branchRoads.length) * Math.PI * 2
    const x = Math.cos(angle) * 12 + 50
    const y = Math.sin(angle) * 10 + 50
    categoryData.push({ name: road.roadName, roadId: road.roadId, level: road.roadLevel, riskLevel: road.riskLevel, avoidanceSuccess: road.avoidanceSuccess })
    seriesData.push({ name: road.roadName, value: [x, y, road.avoidanceSuccess, road.riskLevel], roadId: road.roadId, roadName: road.roadName, roadLevel: road.roadLevel, roadType: road.roadType, roadTypeName: roadTypeNames[road.roadType] || road.roadLevel, riskLevel: road.riskLevel, avoidanceSuccess: road.avoidanceSuccess, earlyWarning: road.earlyWarning, avgSpeed: road.avgSpeed, vehicleDensity: road.vehicleDensity })
  })

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: 'rgba(59, 130, 246, 0.3)',
      textStyle: { color: '#fff' },
      formatter: function(params) {
        const data = params.data
        if (!data) return ''
        return `<div style="font-weight: bold; margin-bottom: 5px;">${data.roadName}</div>
          <div>道路类型: ${data.roadTypeName || data.roadLevel}</div>
          <div>风险等级: <span style="color: ${getRiskColor(data.riskLevel)}">${getRiskLevelName(data.riskLevel)}</span></div>
          <div>避让成功率: ${data.avoidanceSuccess}%</div>
          <div style="margin-top: 5px; color: #3b82f6;">点击进入演示视图</div>`
      }
    },
    xAxis: { show: false, min: 0, max: 100 },
    yAxis: { show: false, min: 0, max: 100 },
    visualMap: {
      show: layerSettings.value.showLegend,
      min: 50, max: 100, calculable: false, orient: 'horizontal', left: 'center', bottom: 20,
      textStyle: { color: '#fff' },
      pieces: [
        { gt: 90, label: '低风险', color: '#10b981' },
        { gte: 80, lte: 90, label: '较低风险', color: '#84cc16' },
        { gte: 70, lt: 80, label: '中风险', color: '#eab308' },
        { gte: 60, lt: 70, label: '较高风险', color: '#f97316' },
        { lt: 60, label: '高风险', color: '#ef4444' }
      ]
    },
    series: [
      {
        type: 'scatter', symbol: 'circle',
        symbolSize: function(val) {
          if (val[3] === 'high') return 35
          if (val[3] === 'mediumHigh') return 30
          return 25
        },
        data: seriesData,
        itemStyle: {
          color: function(params) { return getRiskColor(params.data.riskLevel) },
          shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)'
        },
        emphasis: {
          itemStyle: { shadowBlur: 20, shadowColor: '#3b82f6' },
          scale: 1.3
        },
        // 【注释】隐藏路名标签
        // label: {
        //   show: layerSettings.value.showRoadNames,
        //   formatter: '{b}', position: 'top', color: '#cbd5e1', fontSize: 10
        // }
      },
      {
        type: 'effectScatter',
        symbol: 'circle',
        symbolSize: function(val, params) {
          if (params.data.roadLevel === '主干道') return 70
          if (params.data.roadLevel === '次干道') return 50
          return 35
        },
        data: seriesData.filter(d => d.roadLevel === '主干道' || d.roadLevel === '次干道'),
        itemStyle: {
          color: function(params) { return getRiskColor(params.data.riskLevel) },
          opacity: 0.15,
          shadowBlur: 0
        },
        tooltip: { show: false },
        z: -1
      },
      {
        type: 'lines', coordinateSystem: 'cartesian2d',
        lineStyle: { color: 'rgba(59, 130, 246, 0.2)', width: 1, type: 'dashed' },
        data: generateRoadConnections(seriesData)
      }
    ]
  }
}

function generateRoadConnections(data) {
  const connections = []
  const center = { x: 50, y: 50 }
  data.forEach(item => {
    if (item.roadLevel === '主干道') {
      connections.push({ coords: [[item.value[0], item.value[1]], [center.x, center.y]] })
    }
  })
  return connections
}

function updatePieChart() {
  if (!pieChartInstance) return
  const dist = globalStats.value.riskDistribution

  const option = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(59, 130, 246, 0.3)', textStyle: { color: '#fff' } },
    legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { color: '#cbd5e1' } },
    series: [{
      type: 'pie', radius: ['40%', '70%'], center: ['40%', '50%'], avoidLabelOverlap: false,
      itemStyle: { borderRadius: 5, borderColor: '#1e293b', borderWidth: 2 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#fff' } },
      data: [
        { value: dist.high, name: '高风险', itemStyle: { color: '#ef4444' } },
        { value: dist.mediumHigh, name: '较高风险', itemStyle: { color: '#f97316' } },
        { value: dist.medium, name: '中风险', itemStyle: { color: '#eab308' } },
        { value: dist.mediumLow, name: '较低风险', itemStyle: { color: '#84cc16' } },
        { value: dist.low, name: '低风险', itemStyle: { color: '#10b981' } }
      ].filter(item => item.value > 0)
    }]
  }

  pieChartInstance.setOption(option)
}

function updateLineChart() {
  if (!lineChartInstance || !selectedRoad.value) return
  const historyData = generateHistoryData(selectedRoad.value.roadId)

  const option = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(59, 130, 246, 0.3)', textStyle: { color: '#fff' } },
    grid: { left: '10%', right: '10%', top: '15%', bottom: '15%' },
    xAxis: { type: 'category', data: historyData.hours, axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } }, axisLabel: { color: '#cbd5e1', fontSize: 10 }, axisTick: { show: false } },
    yAxis: { type: 'value', name: '避让成功率(%)', min: 50, max: 100, axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } }, axisLabel: { color: '#cbd5e1' }, splitLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.1)' } } },
    visualMap: { show: false, pieces: [{ gt: 90, color: '#10b981' }, { gte: 80, lt: 90, color: '#84cc16' }, { gte: 70, lt: 80, color: '#eab308' }, { gte: 60, lt: 70, color: '#f97316' }, { lt: 60, color: '#ef4444' }] },
    series: [{ type: 'line', data: historyData.avoidanceData, smooth: true, symbol: 'circle', symbolSize: 6, lineStyle: { width: 2, color: '#3b82f6' }, itemStyle: { color: '#3b82f6' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(59, 130, 246, 0.3)' }, { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }]) } }]
  }

  lineChartInstance.setOption(option)
}

function updatePredictionChart() {
  if (!predictionChartInstance) {
    initPredictionChart()
    return
  }
  
  const pred = globalPrediction.value
  const currentHour = new Date().getHours()
  const labels = []
  const historicalData = []
  const predictionData = []
  
  for (let i = -2; i <= 0; i++) {
    const h = (currentHour + i + 24) % 24
    labels.push(h + ':00')
    historicalData.push(pred.current + (Math.random() * 4 - 2))
  }
  
  labels.push('当前')
  historicalData.push(pred.current)
  
  labels.push('+30min')
  predictionData.push(pred.prediction30min)
  
  labels.push('+1h')
  predictionData.push(pred.prediction60min)

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: 'rgba(59, 130, 246, 0.3)',
      textStyle: { color: '#fff' }
    },
    grid: { left: '15%', right: '10%', top: '10%', bottom: '15%' },
    xAxis: {
      type: 'category',
      data: labels,
      axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
      axisLabel: { color: '#cbd5e1', fontSize: 9 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      min: 50,
      max: 100,
      axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
      axisLabel: { color: '#cbd5e1' },
      splitLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.1)' } }
    },
    series: [
      {
        name: '历史',
        type: 'line',
        data: historicalData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        lineStyle: { width: 2, color: '#60a5fa' },
        itemStyle: { color: '#60a5fa' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(96, 165, 250, 0.3)' },
            { offset: 1, color: 'rgba(96, 165, 250, 0.05)' }
          ])
        }
      },
      {
        name: '预测',
        type: 'line',
        data: [null, null, null, pred.current, pred.prediction30min, pred.prediction60min],
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2, color: '#f97316', type: 'dashed' },
        itemStyle: { color: '#f97316' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(249, 115, 22, 0.2)' },
            { offset: 1, color: 'rgba(249, 115, 22, 0.02)' }
          ])
        },
        markPoint: {
          symbol: 'pin',
          symbolSize: 40,
          data: [
            { coord: [3, pred.current], label: { show: false } },
            { coord: [4, pred.prediction30min], label: { formatter: '+30m', color: '#fff', fontSize: 9 } },
            { coord: [5, pred.prediction60min], label: { formatter: '+1h', color: '#fff', fontSize: 9 } }
          ],
          itemStyle: { color: '#f97316' }
        }
      }
    ]
  }

  predictionChartInstance.setOption(option)
}

function updateDayTrendChart() {
  if (!dayTrendChartInstance || !dayTrendChartRef.value) return
  if (dayTrendChartRef.value.clientWidth === 0 || dayTrendChartRef.value.clientHeight === 0) return
  
  const data = dayTrendData.value
  const current = currentPeriod.value
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: 'rgba(59, 130, 246, 0.3)',
      textStyle: { color: '#fff' },
      confine: true,
      formatter: function(params) {
        const d = params[0]
        const item = data[d.dataIndex]
        return `
          <div style="padding: 4px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${item.name}</div>
            <div style="font-size: 11px;">${item.timeRange}</div>
            <div style="margin-top: 6px;">
              <span style="color: #60a5fa;">避让成功率:</span>
              <span style="font-weight: 600; margin-left: 4px;">${item.avoidanceSuccess.toFixed(1)}%</span>
            </div>
            <div style="font-size: 10px; color: ${item.color}; margin-top: 2px;">
              ${riskLevels[item.riskLevel]?.name || '中风险'}
            </div>
          </div>
        `
      }
    },
    grid: { left: '22%', right: '5%', top: '20%', bottom: '22%' },
    xAxis: {
      type: 'category',
      data: data.map(d => d.name),
      axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
      axisLabel: { color: '#cbd5e1', fontSize: 10 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      min: 50,
      max: 100,
      name: '避让成功率(%)',
      nameTextStyle: { color: '#cbd5e1', fontSize: 10 },
      axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
      axisLabel: { color: '#cbd5e1', fontSize: 10, formatter: '{value}%' },
      splitLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.1)' } }
    },
    series: [{
      type: 'line',
      data: data.map(d => ({
        value: d.avoidanceSuccess,
        itemStyle: { color: d.color },
        period: d.period
      })),
      smooth: true,
      symbol: 'circle',
      symbolSize: function(params) {
        const item = data[params.dataIndex]
        return item && item.period === current ? 12 : 8
      },
      lineStyle: { width: 3, color: '#60a5fa' },
      itemStyle: { 
        color: function(params) {
          const item = data[params.dataIndex]
          if (!item) return '#60a5fa'
          return item.period === current ? '#ffffff' : item.color
        },
        borderWidth: function(params) {
          const item = data[params.dataIndex]
          return item && item.period === current ? 3 : 0
        },
        borderColor: function(params) {
          const item = data[params.dataIndex]
          return item ? item.color : '#60a5fa'
        }
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(96, 165, 250, 0.3)' },
          { offset: 1, color: 'rgba(96, 165, 250, 0.02)' }
        ])
      },
      markLine: {
        silent: true,
        lineStyle: { color: 'rgba(255, 255, 255, 0.3)', type: 'dashed', width: 1 },
        data: [
          { xAxis: 0 }, { xAxis: 1 }, { xAxis: 2 }, { xAxis: 3 }
        ]
      }
    }]
  }

  dayTrendChartInstance.setOption(option)
  
  dayTrendChartInstance.off('click')
  dayTrendChartInstance.on('click', function(params) {
    if (params.data && params.data.period) {
      handlePeriodChange(params.data.period)
    }
  })
}

function handleChartClick(params) {
  if (params.data && params.data.roadId) {
    if (params.data.roadType) {
      emit('switch-to-scene', { roadId: params.data.roadId, scene: params.data.roadType, roadData: params.data })
    } else {
      selectedRoad.value = params.data
      nextTick(() => { updateLineChart(); updatePredictionChart() })
    }
  }
}

function initCharts() {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
    chartInstance.on('click', handleChartClick)
  }
  if (pieChartRef.value) {
    pieChartInstance = echarts.init(pieChartRef.value)
  }
  if (lineChartRef.value) {
    lineChartInstance = echarts.init(lineChartRef.value)
  }
  initPredictionChart()
  if (dayTrendChartRef.value) {
    dayTrendChartInstance = echarts.init(dayTrendChartRef.value)
  }
  nextTick(() => { updateCharts() })
}

function initPredictionChart() {
  if (!predictionChartRef.value) {
    setTimeout(initPredictionChart, 100)
    return
  }
  if (predictionChartRef.value.clientWidth === 0 || predictionChartRef.value.clientHeight === 0) {
    setTimeout(initPredictionChart, 100)
    return
  }
  predictionChartInstance = echarts.init(predictionChartRef.value)
}

function handleReset() {
  // 重置为当前时段
  currentPeriod.value = getCurrentPeriod()
  riskThresholds.value = { low: 90, mediumLow: 80, medium: 70, mediumHigh: 60 }
  layerSettings.value = { showRoadNames: true, showLowRisk: true, showLegend: true }
  heatmapData.value = { ...defaultHeatmapData }
  dataMode.value = 'simulated'
  selectedRoad.value = null
  nextTick(() => { updateCharts() })
  ElMessage.success('热力地图已重置为模拟数据')
}

defineExpose({ reset: handleReset })

// 支持的字段映射（包含用户提供的字段）
const extendedFieldMappings = {
  '路段ID': 'roadId', 'roadId': 'roadId',
  '路段名称': 'roadName', 'roadName': 'roadName',
  '道路层级': 'roadLevel', 'roadLevel': 'roadLevel',
  '所属区域': 'area', 'area': 'area',
  '时段': 'period', 'period': 'period',
  'Speed_kmh': 'Speed_kmh', '车速': 'Speed_kmh', '平均车速': 'Speed_kmh',
  'Density_veh_per_km': 'Density_veh_per_km', '车流密度': 'Density_veh_per_km', '车辆密度': 'Density_veh_per_km',
  'PRR_50m': 'PRR_50m',
  'PRR_150m': 'PRR_150m',
  'PacketLoss_150m': 'PacketLoss_150m', '丢包率': 'PacketLoss_150m',
  'Avg_Neighbors': 'Avg_Neighbors', '平均邻居数': 'Avg_Neighbors',
  'Avg_CBR': 'Avg_CBR', '信道忙碌率': 'Avg_CBR',
  'Avg_Delay_s': 'Avg_Delay_s', '平均延迟': 'Avg_Delay_s',
  'Throughput_kbps': 'Throughput_kbps', '吞吐量': 'Throughput_kbps',
  'Blind_Spot_Metric': 'Blind_Spot_Metric', '盲区指标': 'Blind_Spot_Metric',
  'Avoidance_Success_Prob': 'Avoidance_Success_Prob', '避让成功率': 'Avoidance_Success_Prob',
  'Warning_Time_s': 'Warning_Time_s', '预警时间': 'Warning_Time_s', '提前预警时间': 'Warning_Time_s',
  '避让成功率': 'avoidanceSuccess',
  '提前预警时间': 'earlyWarning',
  '平均车速': 'avgSpeed',
  '车辆密度': 'vehicleDensity'
}

function handleFileUpload(file) {
  const isExcel = file.name.endsWith('.xls') || file.name.endsWith('.xlsx')
  if (!isExcel) {
    ElMessage.error('仅支持 .xls/.xlsx 格式文件')
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })
      if (jsonData.length < 2) { ElMessage.error('文件格式不正确'); return }

      const headers = jsonData[0]
      const fieldMap = {}
      headers.forEach((header, index) => {
        const headerTrimmed = String(header).trim()
        const enField = extendedFieldMappings[headerTrimmed]
        if (enField) {
          fieldMap[index] = enField
        }
      })

      // 使用解析函数处理数据
      const rawData = []
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i]
        if (!row || row.length === 0) continue
        const item = {}
        Object.entries(fieldMap).forEach(([idx, field]) => {
          const value = row[idx]
          if (value !== undefined && value !== null && value !== '') {
            if (typeof value === 'number' || !isNaN(parseFloat(value))) {
              item[field] = parseFloat(value) || value
            } else {
              item[field] = value
            }
          }
        })
        if (Object.keys(item).length > 0) {
          rawData.push(item)
        }
      }

      // 解析数据
      const { data: parsedData, errors } = parseTableData(rawData)
      
      if (errors.length > 0) {
        console.warn('数据解析警告:', errors)
      }

      // 按时段分组
      const periodDataMap = groupByPeriod(parsedData)
      
      // 使用多指标加权计算风险值
      Object.keys(periodDataMap).forEach(period => {
        periodDataMap[period].forEach(item => {
          // 计算综合风险值
          const riskValue = calculateCompositeRisk(item)
          // 转换为避让成功率（用于兼容现有逻辑）
          // 风险值越低，避让成功率越高
          item.avoidanceSuccess = Math.max(50, 100 - riskValue * 5)
          item.earlyWarning = item.Warning_Time_s || item.earlyWarning || 2
          item.avgSpeed = item.Speed_kmh || item.avgSpeed || 40
          item.vehicleDensity = item.Density_veh_per_km || item.vehicleDensity || 100
        })
      })

      heatmapData.value = periodDataMap
      dataMode.value = 'uploaded'
      handlePeriodChange(currentPeriod.value)
      ElMessage.success(`数据文件加载成功！共 ${parsedData.length} 条记录，已应用多指标加权计算`)
    } catch (error) {
      console.error('解析错误:', error)
      ElMessage.error('文件解析失败')
    }
  }
  reader.readAsArrayBuffer(file.raw)
}

function handleResize() {
  chartInstance?.resize()
  pieChartInstance?.resize()
  lineChartInstance?.resize()
  predictionChartInstance?.resize()
  dayTrendChartInstance?.resize()
}

watch([currentPeriod, riskThresholds, layerSettings, () => heatmapData.value], () => {
  if (isThresholdValid.value) {
    nextTick(() => { updateCharts() })
  }
}, { deep: true })

watch(() => props.externalReset, (val) => {
  if (val) { handleReset(); emit('reset-done') }
})

onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
$primary-color: #3b82f6;
$success-color: #10b981;
$warning-color: #ef4444;
$bg-light: #1e293b;
$text-primary: #ffffff;
$text-secondary: #cbd5e1;
$text-muted: #94a3b8;
$border-color: rgba(59, 130, 246, 0.2);

// 左侧控制区
.left-panel {
  width: 25%;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  height: 100%; // 使用父容器高度
  flex-shrink: 0;
  border-right: 1px solid $border-color;
  background: rgba(15, 23, 42, 0.8);
  
  // 创建滚动容器
  .scroll-container {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    
    // 兼容所有浏览器的滚动条样式
    scrollbar-width: thin;
    scrollbar-color: rgba(59, 130, 246, 0.3) rgba(59, 130, 246, 0.05);

    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(59, 130, 246, 0.05);
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(59, 130, 246, 0.4);
      border-radius: 4px;
      border: 2px solid transparent;
      background-clip: content-box;

      &:hover {
        background: rgba(59, 130, 246, 0.6);
        background-clip: content-box;
      }

      &:active {
        background: rgba(59, 130, 246, 0.8);
        background-clip: content-box;
      }
    }

    &::-webkit-scrollbar-corner {
      background: transparent;
    }
  }
}

.control-card, .indicator-card {
  background: #1e293b;
  border: 1px solid $border-color;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: $primary-color;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(59, 130, 246, 0.1);

    .el-icon { font-size: 18px; }
  }
}

// 时段按钮
.period-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  justify-items: stretch;
  align-items: stretch;

  .period-btn {
    padding: 12px 8px;
    background: rgba(59, 130, 246, 0.08);
    border: 1px solid $border-color;
    color: $text-secondary;
    border-radius: 10px;
    transition: all 0.3s ease;
    cursor: pointer;
    width: 100% !important;
    min-width: 0;
    flex: 1;
    box-sizing: border-box;
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    position: relative;

    .period-name {
      font-size: 13px;
      font-weight: 500;
      color: inherit;
      line-height: 1.2;
    }

    .period-time {
      font-size: 9px;
      color: rgba(148, 163, 184, 0.8);
      line-height: 1.1;
    }

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
      background: rgba(59, 130, 246, 0.15);

      .period-time {
        color: rgba(59, 130, 246, 0.8);
      }
    }

    &.active {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(59, 130, 246, 0.2));
      border-color: $primary-color;
      color: $text-primary;
      box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);

      .period-time {
        color: rgba(255, 255, 255, 0.9);
      }
    }

    &.current-period {
      border-color: rgba(16, 185, 129, 0.6);
      background: rgba(16, 185, 129, 0.08);

      &::before {
        content: '';
        position: absolute;
        top: 4px;
        right: 4px;
        width: 8px;
        height: 8px;
        background: #10b981;
        border-radius: 50%;
        box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
      }
    }

    &.current-period.active {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(16, 185, 129, 0.15));
      border-color: #10b981;

      .period-time {
        color: rgba(16, 185, 129, 0.9);
      }
    }
  }

  .return-current-btn {
    margin-top: 12px;
    display: flex;
    justify-content: center;
  }

  .return-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.08));
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 8px;
    color: #10b981;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;

    .return-icon {
      font-size: 14px;
      animation: rotate-refresh 2s linear infinite;
      animation-play-state: paused;
    }

    &:hover {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(16, 185, 129, 0.15));
      border-color: rgba(16, 185, 129, 0.5);
      box-shadow: 0 0 12px rgba(16, 185, 129, 0.2);

      .return-icon {
        animation-play-state: running;
      }
    }
  }

  @keyframes rotate-refresh {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
}

// 参数项
.param-item {
  margin-bottom: 16px;

  &:last-child { margin-bottom: 0; }

  .param-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

    .param-name {
      font-size: 13px;
      color: $text-secondary;
      &.low { color: #10b981; }
      &.medium-low { color: #84cc16; }
      &.medium { color: #eab308; }
      &.medium-high { color: #f97316; }
    }

    .param-value {
      font-size: 14px;
      font-weight: 600;
      &.low { color: #10b981; }
      &.medium-low { color: #84cc16; }
      &.medium { color: #eab308; }
      &.medium-high { color: #f97316; }
    }
  }
}

.threshold-error {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 6px;
  font-size: 12px;
  color: $warning-color;
}

.layer-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;

  :deep(.el-switch) {
    --el-switch-on-color: rgba(59, 130, 246, 0.4);
    .el-switch__label { color: $text-secondary; }
  }
}

.data-upload {
  :deep(.el-upload-dragger) {
    background: rgba(59, 130, 246, 0.05);
    border: 1px dashed $border-color;
    border-radius: 8px;
    padding: 20px;
    transition: all 0.3s ease;

    &:hover {
      border-color: $primary-color;
      background: rgba(59, 130, 246, 0.1);
    }
  }

  .upload-icon { font-size: 32px; color: $primary-color; margin-bottom: 8px; }
  .upload-text { font-size: 13px; color: $text-secondary; }
  .upload-tip { font-size: 11px; color: $text-muted; margin-top: 8px; }
}

// 主热力地图区
.heatmap-section {
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
  background: rgba(15, 23, 42, 0.6);
  /* 【修改】设置为相对定位，使子元素可以绝对定位 */
  position: relative;
}

.heatmap-chart {
  width: 100%;
  height: 100%;
  max-width: 800px;
  max-height: 600px;
  /* 【修改】背景设置为透明，以便显示底层地图 */
  background: transparent;
  border: 1px solid $border-color;
  border-radius: 12px;
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.15), inset 0 0 50px rgba(0, 0, 0, 0.2);
  /* 【修改】绝对定位覆盖在地图上 */
  position: absolute;
  top: 15px;
  left: 15px;
  right: 15px;
  bottom: 15px;
}

// 右侧指标面板
.right-panel {
  width: 25%;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  height: 100%; // 使用父容器高度
  flex-shrink: 0;
  border-left: 1px solid $border-color;
  background: rgba(15, 23, 42, 0.8);
  
  // 创建滚动容器
  .scroll-container {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    
    // 兼容所有浏览器的滚动条样式
    scrollbar-width: thin;
    scrollbar-color: rgba(59, 130, 246, 0.3) rgba(59, 130, 246, 0.05);

    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(59, 130, 246, 0.05);
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(59, 130, 246, 0.4);
      border-radius: 4px;
      border: 2px solid transparent;
      background-clip: content-box;

      &:hover {
        background: rgba(59, 130, 246, 0.6);
        background-clip: content-box;
      }

      &:active {
        background: rgba(59, 130, 246, 0.8);
        background-clip: content-box;
      }
    }

    &::-webkit-scrollbar-corner {
      background: transparent;
    }
  }
}

.indicator-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  &.two-col { grid-template-columns: repeat(2, 1fr); }
}

.indicator-item {
  text-align: center;
  padding: 12px 8px;
  background: rgba(59, 130, 246, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.1);
  transition: all 0.3s ease;

  &.main .ind-value { font-size: 32px; color: $primary-color; }

  .ind-value {
    font-size: 20px;
    font-weight: 700;
    color: $text-primary;
    &.primary { color: $primary-color; }
    &.danger { color: $warning-color; }
    &.warning { color: #f97316; }
    &.success { color: $success-color; }
  }

  .ind-unit { font-size: 12px; color: $text-muted; margin-top: 2px; }
  .ind-label { font-size: 11px; color: $text-muted; margin-top: 4px; }
}

.top-risk-section {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid rgba(59, 130, 246, 0.1);

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: $primary-color;
    margin-bottom: 12px;
  }

  .top-road-item {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    background: rgba(59, 130, 246, 0.05);
    border-radius: 6px;
    margin-bottom: 8px;
    border: 1px solid rgba(59, 130, 246, 0.1);

    .rank {
      width: 24px; height: 24px;
      line-height: 24px; text-align: center;
      background: linear-gradient(135deg, $warning-color, #f87171);
      border-radius: 6px;
      font-size: 13px; font-weight: bold;
      margin-right: 10px;
    }

    .road-name { flex: 1; font-size: 14px; color: $text-primary; }
    .road-risk { font-size: 15px; font-weight: 700; }
  }
}

.chart-container {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid rgba(59, 130, 246, 0.1);

  .section-title { font-size: 13px; color: $text-muted; margin-bottom: 10px; }
}

.pie-chart, .line-chart { width: 100%; height: 180px; }

.risk-suggestion {
  margin-top: 16px;
  padding: 14px;
  border-radius: 8px;
  background: rgba(59, 130, 246, 0.05);
  border-left: 4px solid;

  &.high { border-color: #ef4444; }
  &.mediumHigh { border-color: #f97316; }
  &.medium { border-color: #eab308; }
  &.mediumLow { border-color: #84cc16; }
  &.low { border-color: #10b981; }

  .suggestion-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 10px;
  }

  .suggestion-content { font-size: 13px; color: $text-secondary; line-height: 1.6; }
}

.back-btn {
  width: 100%;
  margin-top: 16px;
  height: 40px;
  font-size: 14px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(59, 130, 246, 0.1));
  border: 1px solid $primary-color;
  border-radius: 8px;
  color: $text-primary;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.5), rgba(59, 130, 246, 0.3));
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
  }
}

:deep(.el-slider) {
  --el-slider-main-bg-color: #{$primary-color};
  --el-slider-runway-bg-color: rgba(59, 130, 246, 0.2);
  .el-slider__bar { background: linear-gradient(90deg, $primary-color, #60a5fa); }
  .el-slider__button { border-color: $primary-color; background: $primary-color; }
}

.prediction-card {
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  padding: 16px;

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #f97316;
    margin-bottom: 14px;

    .el-icon { font-size: 16px; }
  }

  .prediction-summary {
    display: flex;
    justify-content: center;
    margin-bottom: 14px;

    .prediction-main {
      text-align: center;
      padding: 12px 20px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 10px;
    }

    .prediction-label {
      font-size: 11px;
      color: $text-muted;
      margin-bottom: 4px;
    }

    .prediction-value {
      font-size: 28px;
      font-weight: 700;
      line-height: 1.2;
    }

    .prediction-trend {
      font-size: 11px;
      margin-top: 4px;
      padding: 2px 8px;
      border-radius: 10px;
      display: inline-block;

      &.increasing {
        color: #ef4444;
        background: rgba(239, 68, 68, 0.15);
      }
      &.decreasing {
        color: #10b981;
        background: rgba(16, 185, 129, 0.15);
      }
      &.stable {
        color: #eab308;
        background: rgba(234, 179, 8, 0.15);
      }
    }
  }

  .prediction-details {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 12px;

    .prediction-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px;
      background: rgba(0, 0, 0, 0.15);
      border-radius: 8px;
      gap: 2px;

      .pred-label {
        font-size: 10px;
        color: $text-muted;
      }

      .pred-value {
        font-size: 16px;
        font-weight: 600;
      }

      .pred-change {
        font-size: 10px;
        padding: 1px 5px;
        border-radius: 4px;

        &.negative {
          color: #10b981;
          background: rgba(16, 185, 129, 0.15);
        }
        &.positive {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.15);
        }
      }
    }
  }

  .prediction-chart {
    height: 100px;
    margin-top: 10px;

    .prediction-line-chart {
      width: 100%;
      height: 100%;
    }
  }

  &.road-prediction {
    background: rgba(249, 115, 22, 0.08);
    border-color: rgba(249, 115, 22, 0.2);

    .card-header { color: #f97316; }
  }

  .confidence-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 10px;
    padding: 8px;
    background: rgba(0, 0, 0, 0.15);
    border-radius: 8px;

    .confidence-label {
      font-size: 10px;
      color: $text-muted;
      white-space: nowrap;
    }

    .confidence-track {
      flex: 1;
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
      overflow: hidden;
    }

    .confidence-fill {
      height: 100%;
      background: linear-gradient(90deg, #60a5fa, #3b82f6);
      border-radius: 3px;
      transition: width 0.3s ease;
    }

    .confidence-value {
      font-size: 11px;
      font-weight: 600;
      color: #60a5fa;
      min-width: 32px;
      text-align: right;
    }
  }
}

.day-trend-card {
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  padding: 14px;
  margin-top: 14px;

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
    color: #60a5fa;
    margin-bottom: 12px;

    .el-icon { font-size: 15px; }
  }

  .day-trend-chart {
    height: 140px;
    margin-bottom: 10px;

    .day-trend-line-chart {
      width: 100%;
      height: 100%;
      cursor: pointer;
    }
  }

  .day-trend-legend {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 8px;
      background: rgba(0, 0, 0, 0.15);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid transparent;

      &:hover {
        background: rgba(59, 130, 246, 0.15);
      }

      &.active {
        background: rgba(59, 130, 246, 0.2);
        border-color: rgba(59, 130, 246, 0.4);
      }

      .legend-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .legend-text {
        font-size: 11px;
        color: $text-secondary;
        flex: 1;
      }

      .legend-value {
        font-size: 11px;
        font-weight: 600;
        color: $text-primary;
      }
    }
  }
}
</style>
