<template>
  <!-- 地图容器 -->
  <div ref="mapContainerRef" class="map-container">
    <!-- 早高峰覆盖图片 - 精确定位到指定经纬度 -->
    <img 
      v-if="showMorningOverlay && morningImage" 
      ref="imageRef"
      :src="morningImage" 
      alt="早高峰提示" 
      :style="imageStyle"
    />
    <!-- 【添加】ECharts 热力图层，使用地图的 Canvas 样式 -->
    <div ref="echartsRef" class="echarts-layer"></div>
    <!-- 降级方案：当地图无法加载时显示静态背景 -->
    <div v-if="!mapLoaded" class="map-placeholder">
      <div class="map-grid"></div>
      <div class="map-marker">
        <div class="marker-pin"></div>
        <span class="marker-label">广东科学技术职业学院（珠海校区）</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, onUnmounted, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import { roadSegments, roadTypeNames } from '../data/heatmapData'

const props = defineProps({
  // 地图中心点坐标
  center: {
    type: Array,
    default: () => [113.362817,22.194973]
  },
  // 地图缩放级别
  zoom: {
    type: Number,
    // 调小缩放级别，显示更大范围
    default: 14
  },
  // ECharts 热力图配置
  chartOption: {
    type: Object,
    default: null
  },
  // 是否显示早高峰覆盖图片
  showMorningOverlay: {
    type: Boolean,
    default: false
  },
  // 早高峰图片路径
  morningImage: {
    type: String,
    default: ''
  },
  // 图片目标经纬度坐标
  imagePosition: {
    type: Object,
    default: () => ({ lng: 113.362817, lat: 22.194973 })
  },
  // 图片大小配置（单位：像素）
  imageSize: {
    type: Object,
    default: () => ({ width: 300, height: 200 })
  }
})

const emit = defineEmits(['chart-click', 'map-loaded', 'road-click', 'map-move'])

const mapContainerRef = ref(null)
const echartsRef = ref(null)
const imageRef = ref(null)
let mapInstance = null
let chartInstance = null
const mapLoaded = ref(false)
const imageStyle = ref({
  position: 'absolute',
  left: '0px',
  top: '0px',
  width: '300px',
  height: '200px',
  pointerEvents: 'none',
  zIndex: 10
})

// 更新图片位置：根据经纬度计算屏幕像素坐标
function updateImagePosition() {
  if (!props.showMorningOverlay || !props.imagePosition) return
  if (!mapInstance) return
  
  const container = mapContainerRef.value
  if (!container) return

  // 获取目标经纬度
  const targetLngLat = new AMap.LngLat(props.imagePosition.lng, props.imagePosition.lat)
  
  // 转换为像素坐标
  const pixel = mapInstance.lngLatToContainer(targetLngLat)
  
  // 计算图片左上角位置（居中显示）
  const imgWidth = props.imageSize?.width || 300
  const imgHeight = props.imageSize?.height || 200
  
  const left = pixel.getX() - imgWidth / 2
  const top = pixel.getY() - imgHeight / 2

  imageStyle.value = {
    ...imageStyle.value,
    left: `${left}px`,
    top: `${top}px`,
    width: `${imgWidth}px`,
    height: `${imgHeight}px`
  }
}

onMounted(() => {
  initMap()
})

function initMap() {
  // 检查高德地图 SDK 是否加载成功
  if (typeof AMap === 'undefined') {
    console.error('高德地图 SDK 未加载，请检查 key 是否正确')
    return
  }

  // 创建地图实例
  mapInstance = new AMap.Map(mapContainerRef.value, {
    zoom: props.zoom,
    center: props.center,
    mapStyle: 'amap://styles/normal',
    // 【修改】禁用所有默认控件（包括搜索框）
    features: ['bg', 'road', 'building', 'point'],
    defaultCursor: 'pointer',
    // 【添加】明确禁用默认控件
    zoomControl: false,
    scale: false,
    rotateEnable: false,
    pitchEnable: false
  })

  // 监听地图加载完成事件
  mapInstance.on('complete', () => {
    mapLoaded.value = true
    emit('map-loaded', mapInstance)

    // 添加道路名称标注
    addRoadMarkers()

    // 添加地图控件
    if (AMap.ScaleControl) {
      mapInstance.addControl(new AMap.ScaleControl())
    }
    if (AMap.ZoomControl) {
      mapInstance.addControl(new AMap.ZoomControl())
    }

    // 初始化 ECharts 热力图
    nextTick(() => {
      initECharts()
    })

    // 地图加载完成后，初始化图片位置（如果此时需要显示）
    nextTick(() => {
      updateImagePosition()
    })
  })

  // 监听地图拖动和缩放事件，实时同步图片位置
  mapInstance.on('mapmove', () => {
    updateImagePosition()
    emit('map-move', {
      center: mapInstance.getCenter(),
      zoom: mapInstance.getZoom()
    })
  })

  // 监听缩放事件
  mapInstance.on('zoomchange', () => {
    updateImagePosition()
  })

  // 添加道路标记点和名称气泡
  function addRoadMarkers() {
    roadSegments.forEach(road => {
      if (!road.coords) return

      const colors = {
        highway: '#ef4444',
        expressway: '#f97316',
        urban: '#3b82f6',
        ramp: '#8b5cf6',
        tunnel: '#64748b'
      }
      const color = colors[road.roadType] || '#3b82f6'

      const typeLabels = {
        highway: '高',
        expressway: '快',
        urban: '城',
        ramp: '匝',
        tunnel: '隧'
      }
      const labelText = typeLabels[road.roadType] || '路'

      // 使用纯CSS创建图标样式，避免Canvas问题
      const iconContent = `
        <div style="
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">${labelText}</div>
      `

      // 创建自定义标记点
      const marker = new AMap.Marker({
        position: road.coords,
        title: `${road.name} (${roadTypeNames[road.roadType]})`,
        content: iconContent,
        offset: new AMap.Pixel(-16, -16)
      })

      // 创建带文字的气泡标签 - 使用内联样式确保透明生效
      const bubbleContent = `
        <div style="
          background: rgba(59, 130, 246, 0.25);
          border-radius: 6px;
          padding: 4px 10px;
          border: 1px solid rgba(255, 255, 255, 0.4);
          cursor: pointer;
          white-space: nowrap;
        ">
          <div style="
            color: rgba(255, 255, 255, 1);
            font-size: 13px;
            font-weight: 700;
            line-height: 1.3;
            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
          ">${road.name}</div>
          <div style="
            color: rgba(255, 255, 255, 1);
            font-size: 11px;
            line-height: 1.2;
          ">${roadTypeNames[road.roadType]}</div>
        </div>
      `

      marker.setLabel({
        content: bubbleContent,
        offset: new AMap.Pixel(0, -45),
        direction: 'top',
        distance: 10
      })

      // 点击事件 - 跳转到协同避让详情页
      marker.on('click', () => {
        emit('road-click', {
          roadId: road.id,
          roadName: road.name,
          roadType: road.roadType,
          coords: road.coords
        })
      })

      mapInstance.add(marker)
    })
  }

  // 监听地图移动/缩放，同步 ECharts
  mapInstance.on('mapmove', () => {
    syncEChartsPosition()
  })
  mapInstance.on('zoomchange', () => {
    syncEChartsPosition()
  })
}

function initECharts() {
  if (!echartsRef.value) return
  if (echartsRef.value.clientWidth === 0 || echartsRef.value.clientHeight === 0) {
    setTimeout(initECharts, 100)
    return
  }

  chartInstance = echarts.init(echartsRef.value)

  if (props.chartOption) {
    chartInstance.setOption(props.chartOption)
  }

  // 【添加】绑定 ECharts 点击事件
  chartInstance.on('click', (params) => {
    emit('chart-click', params)
  })

  // 同步位置
  syncEChartsPosition()
}

function syncEChartsPosition() {
  if (!mapInstance || !echartsRef.value) return

  const container = mapContainerRef.value
  const size = mapInstance.getSize()
  echartsRef.value.style.width = size.width + 'px'
  echartsRef.value.style.height = size.height + 'px'

  if (chartInstance) {
    chartInstance.resize()
  }
}

// 更新 ECharts 配置
function updateChartOption(option) {
  if (chartInstance) {
    chartInstance.setOption(option, true)
  }
}

// 获取地图实例
function getMapInstance() {
  return mapInstance
}

// 暴露方法给父组件
defineExpose({
  updateChartOption,
  getMapInstance,
  syncEChartsPosition
})

// 监听 showMorningOverlay 变化：当图片需要显示时，立即更新位置
watch(() => props.showMorningOverlay, (newVal) => {
  if (newVal && mapInstance) {
    nextTick(() => {
      updateImagePosition()
    })
  }
})

// 监听图片位置或大小变化，实时更新
watch(() => [props.imagePosition, props.imageSize], () => {
  if (props.showMorningOverlay && mapInstance) {
    nextTick(() => {
      updateImagePosition()
    })
  }
}, { deep: true })

// 监听图片源变化
watch(() => props.morningImage, () => {
  if (props.showMorningOverlay && mapInstance) {
    nextTick(() => {
      updateImagePosition()
    })
  }
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  if (mapInstance) {
    mapInstance.destroy()
    mapInstance = null
  }
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.map-container :deep(.amap-sug-result),
.map-container :deep(.amap-autocomplete),
.map-container :deep(.amap-toolbar),
.map-container :deep(.amap-search-box),
.map-container :deep(.amap-lib-search),
.map-container :deep(.amap-locate) {
  display: none !important;
}

/* 道路气泡样式 - 25%透明背景，文字不透明 */
.map-container :deep(.road-bubble) {
  background: rgba(59, 130, 246, 0.25) !important;
  border-radius: 6px;
  padding: 4px 10px;
  box-shadow: none;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.map-container :deep(.road-bubble:hover) {
  background: rgba(59, 130, 246, 0.4) !important;
}

.map-container :deep(.road-bubble-name) {
  color: rgba(255, 255, 255, 1) !important;
  font-size: 13px !important;
  font-weight: 700 !important;
  line-height: 1.3 !important;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  opacity: 1 !important;
}

.map-container :deep(.road-bubble-type) {
  color: rgba(255, 255, 255, 1) !important;
  font-size: 11px !important;
  line-height: 1.2 !important;
  opacity: 1 !important;
}

.echarts-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

.map-placeholder {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: linear-gradient(180deg, #e8f4fc 0%, #d0e8f5 100%);
  overflow: hidden;
}

.map-grid {
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
  background-size: 40px 40px;
}

.map-marker {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.marker-pin {
  width: 30px;
  height: 30px;
  background: #ef4444;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
  position: relative;
}

.marker-pin::after {
  content: '';
  width: 10px;
  height: 10px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 8px;
  left: 8px;
}

.marker-label {
  margin-top: 8px;
  padding: 4px 12px;
  background: rgba(59, 130, 246, 0.9);
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  white-space: nowrap;
}
</style>