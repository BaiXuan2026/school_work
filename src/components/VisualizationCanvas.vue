<template>
  <div class="canvas-container" ref="containerRef">
    <canvas ref="canvasRef"></canvas>

    <!-- 场景标签 -->
    <div class="scene-label">
      <span>{{ sceneConfig.name }}</span>
    </div>

    <!-- 图例 -->
    <div class="legend">
      <div class="legend-item">
        <span class="legend-color ego"></span>
        <span>主车 (V2X)</span>
      </div>
      <div class="legend-item">
        <span class="legend-color other"></span>
        <span>周边车辆</span>
      </div>
      <div class="legend-item">
        <span class="legend-color blind"></span>
        <span>盲区 (雷达不可见)</span>
      </div>
      <div class="legend-item">
        <span class="legend-color v2x"></span>
        <span>V2X 超视距</span>
      </div>
    </div>

    <!-- 碰撞动画覆盖层 -->
    <div class="collision-overlay" v-if="isCollided">
      <div class="collision-effect">
        <div class="crash-icon">💥</div>
        <div class="crash-text">碰撞已发生</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps({
  scene: {
    type: String,
    required: true
  },
  sceneConfig: {
    type: Object,
    required: true
  },
  speed: {
    type: Number,
    required: true
  },
  density: {
    type: Number,
    required: true
  },
  warningLevel: {
    type: String,
    default: 'normal'
  },
  isCollided: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['collision-triggered'])

const containerRef = ref(null)
const canvasRef = ref(null)
let ctx = null
let animationId = null
let lastTime = 0

// 车辆状态
const vehicles = ref([])
const egoVehicle = ref({ x: 0, y: 0, angle: 0 })
const blindSpots = ref([])

// 画布尺寸
let canvasWidth = 0
let canvasHeight = 0

// 初始化画布
function initCanvas() {
  const container = containerRef.value
  const canvas = canvasRef.value

  if (!container || !canvas) return

  canvasWidth = container.clientWidth
  canvasHeight = container.clientHeight
  canvas.width = canvasWidth
  canvas.height = canvasHeight
  ctx = canvas.getContext('2d')

  // 初始化车辆
  initVehicles()
}

// 初始化车辆
function initVehicles() {
  vehicles.value = []

  const vehicleCount = Math.floor(props.density / 30)

  if (props.scene === 'ramp') {
    const centerX = canvasWidth / 2 + 150
    const centerY = canvasHeight * 0.7 + 200
    const egoRadius = 290 // 主车半径（外圈）
    const vehicleRadius = 220  // 周围车辆半径（内圈）
    const startAngle = -Math.PI * 0.8
    const endAngle = -Math.PI * 0.2

    // 计算主车在圆弧上的角度位置
    const egoDx = canvasWidth / 2 - centerX
    const egoDy = canvasHeight * 0.6 - centerY
    const egoArcAngle = Math.atan2(egoDy, egoDx)

    egoVehicle.value = {
      x: canvasWidth / 2,
      y: canvasHeight * 0.6,
      angle: egoArcAngle + Math.PI,
      width: 40,
      height: 70,
      radius: egoRadius,
      arcAngle: egoArcAngle
    }

    // 匝道初始生成最多2辆车
    const initialCount = Math.min(Math.floor(vehicleCount / 2), 2)
    const angleStep = (endAngle - startAngle) / (initialCount + 1)
    
    for (let i = 0; i < initialCount; i++) {
      const angle = startAngle + angleStep * (i + 1)
      vehicles.value.push({
        x: centerX + Math.cos(angle) * vehicleRadius,
        y: centerY + Math.sin(angle) * vehicleRadius,
        angle: angle + Math.PI,
        arcAngle: angle,
        width: 35 + Math.random() * 10,
        height: 60 + Math.random() * 15,
        speed: 0.5 + Math.random() * 1.5,
        type: Math.random() > 0.7 ? 'truck' : 'car',
        isInBlindSpot: false,
        radius: vehicleRadius,
        needsRespawn: false,
        respawnTimer: 0
      })
    }
  } else {
    // 【修改】非匝道场景保持主车角度为0
    egoVehicle.value = {
      x: canvasWidth / 2,
      y: canvasHeight * 0.6,
      angle: 0,
      width: 40,
      height: 70
    }
    
    // 初始生成最多3辆车
    const initialCount = Math.min(Math.floor(vehicleCount / 2), 3)
    // 可用的x轴位置（排除0即主车位置）
    const lanePositions = [-2, -1, 1, 2, 3]
    
    for (let i = 0; i < initialCount; i++) {
      const laneIndex = lanePositions[Math.floor(Math.random() * lanePositions.length)]
      const laneOffset = laneIndex * (40 + Math.random() * 40)
      const distance = 150 + Math.random() * 250

      vehicles.value.push({
        x: canvasWidth / 2 + laneOffset,
        y: canvasHeight * 0.6 - distance,
        angle: 0,
        width: 35 + Math.random() * 10,
        height: 60 + Math.random() * 15,
        speed: 0.5 + Math.random() * 1.5,
        type: Math.random() > 0.7 ? 'truck' : 'car',
        isInBlindSpot: false,
        lastSpawnY: canvasHeight * 0.6 - distance
      })
    }
  }

  updateBlindSpots()
}

// 更新盲区
function updateBlindSpots() {
  blindSpots.value = []

  const scene = props.scene
  const egoX = egoVehicle.value.x
  const egoY = egoVehicle.value.y

  // 根据场景生成不同的盲区
  if (scene === 'urban') {
    // 城市道路 - 建筑物遮挡和前车遮挡
    blindSpots.value.push({
      x: egoX - 150,
      y: egoY - 250,
      width: 120,
      height: 150,
      type: 'building',
      label: '建筑物盲区'
    })

    // 前车遮挡
    if (vehicles.value.length > 0) {
      const frontVehicle = vehicles.value.find(v => v.y < egoY - 80)
      if (frontVehicle) {
        blindSpots.value.push({
          x: frontVehicle.x - 30,
          y: frontVehicle.y - 100,
          width: 60,
          height: 80,
          type: 'vehicle',
          label: '前车遮挡'
        })
      }
    }
  } else if (scene === 'expressway' || scene === 'highway') {
    // 快速路/高速 - 大货车遮挡
    blindSpots.value.push({
      x: egoX - 80,
      y: egoY - 200,
      width: 100,
      height: 120,
      type: 'truck',
      label: '大货车盲区'
    })
  } else if (scene === 'ramp') {
    // 匝道 - 弯道遮挡
    blindSpots.value.push({
      x: egoX + 50,
      y: egoY - 180,
      width: 80,
      height: 100,
      type: 'curve',
      label: '弯道盲区'
    })
  } else if (scene === 'tunnel') {
    // 隧道 - 信号衰减盲区
    blindSpots.value.push({
      x: egoX - 100,
      y: egoY - 220,
      width: 200,
      height: 180,
      type: 'tunnel',
      label: '隧道信号盲区'
    })
  }
}

// 动画循环
function animate(currentTime) {
  if (!ctx) return

  // 计算时间差
  const deltaTime = currentTime - lastTime
  lastTime = currentTime

  // 清空画布
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  // 绘制背景
  drawBackground()

  // 绘制道路
  drawRoad()

  // 绘制盲区
  drawBlindSpots()

  // 绘制V2X超视距可见区域
  drawV2XRange()

  // 更新车辆位置（如果未碰撞）
  if (!props.isCollided) {
    updateVehicles()
  }

  // 绘制周边车辆
  drawVehicles()

  // 绘制主车
  drawEgoVehicle()

  // 绘制单车雷达感知范围
  drawRadarRange()

  // 碰撞检测
  if (!props.isCollided) {
    checkCollision()
  }

  // 继续动画
  animationId = requestAnimationFrame(animate)
}

// 绘制背景
function drawBackground() {
  // 渐变背景
  const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight)
  gradient.addColorStop(0, '#0a1628')
  gradient.addColorStop(0.5, '#071018')
  gradient.addColorStop(1, '#030810')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  // 网格线
  ctx.strokeStyle = 'rgba(0, 212, 255, 0.05)'
  ctx.lineWidth = 1
  const gridSize = 50

  for (let x = 0; x < canvasWidth; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, canvasHeight)
    ctx.stroke()
  }

  for (let y = 0; y < canvasHeight; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(canvasWidth, y)
    ctx.stroke()
  }
}

// 绘制道路
function drawRoad() {
  const scene = props.scene
  const roadColor = props.sceneConfig.roadColor || '#2d3a4a'

  ctx.fillStyle = roadColor
  ctx.strokeStyle = 'rgba(0, 212, 255, 0.5)'
  ctx.lineWidth = 2

  if (scene === 'urban') {
    // 十字路口
    const roadWidth = 180
    const centerX = canvasWidth / 2
    const centerY = canvasHeight / 2

    // 横向道路
    ctx.fillRect(0, centerY - roadWidth / 2, canvasWidth, roadWidth)
    ctx.strokeRect(0, centerY - roadWidth / 2, canvasWidth, roadWidth)

    // 纵向道路
    ctx.fillRect(centerX - roadWidth / 2, 0, roadWidth, canvasHeight)
    ctx.strokeRect(centerX - roadWidth / 2, 0, roadWidth, canvasHeight)

    // 车道线
    ctx.setLineDash([20, 15])
    ctx.beginPath()
    ctx.moveTo(0, centerY)
    ctx.lineTo(canvasWidth, centerY)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(centerX, 0)
    ctx.lineTo(centerX, canvasHeight)
    ctx.stroke()
    ctx.setLineDash([])

    // 绘制红绿灯
    drawTrafficLights(centerX, centerY, roadWidth)
  } else if (scene === 'ramp') {
    // 弯道
    const centerX = canvasWidth / 2
    const centerY = canvasHeight * 0.7

    ctx.beginPath()
    ctx.arc(centerX + 150, centerY + 200, 280, -Math.PI * 0.8, -Math.PI * 0.2)
    ctx.lineWidth = 160
    ctx.strokeStyle = roadColor
    ctx.stroke()

    ctx.lineWidth = 2
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.5)'
    ctx.setLineDash([20, 15])
    ctx.beginPath()
    ctx.arc(centerX + 150, centerY + 200, 250, -Math.PI * 0.8, -Math.PI * 0.2)
    ctx.stroke()
    ctx.setLineDash([])
  } else if (scene === 'tunnel') {
    // 隧道
    const roadWidth = 200
    const centerX = canvasWidth / 2

    ctx.fillRect(centerX - roadWidth / 2, 0, roadWidth, canvasHeight)
    ctx.strokeRect(centerX - roadWidth / 2, 0, roadWidth, canvasHeight)

    // 隧道灯光效果
    const gradient = ctx.createLinearGradient(centerX - roadWidth / 2, 0, centerX + roadWidth / 2, 0)
    gradient.addColorStop(0, 'rgba(255, 200, 100, 0.1)')
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)')
    gradient.addColorStop(1, 'rgba(255, 200, 100, 0.1)')
    ctx.fillStyle = gradient
    ctx.fillRect(centerX - roadWidth / 2, 0, roadWidth, canvasHeight)

    // 车道线
    ctx.setLineDash([20, 15])
    ctx.beginPath()
    ctx.moveTo(centerX, 0)
    ctx.lineTo(centerX, canvasHeight)
    ctx.stroke()
    ctx.setLineDash([])
  } else {
    // 直线路
    const roadWidth = props.sceneConfig.laneCount * 45
    const centerX = canvasWidth / 2

    ctx.fillRect(centerX - roadWidth / 2, 0, roadWidth, canvasHeight)
    ctx.strokeRect(centerX - roadWidth / 2, 0, roadWidth, canvasHeight)

    // 车道线
    ctx.setLineDash([20, 15])
    for (let i = 1; i < props.sceneConfig.laneCount; i++) {
      const x = centerX - roadWidth / 2 + (roadWidth / props.sceneConfig.laneCount) * i
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvasHeight)
      ctx.stroke()
    }
    ctx.setLineDash([])
  }
}

// 绘制红绿灯
function drawTrafficLights(centerX, centerY, roadWidth) {
  const lightWidth = 12
  const lightHeight = 12
  const poleWidth = 4
  const poleHeight = 60
  
  // 红绿灯状态：上下绿灯，左右红灯（模拟主车流方向通行）
  const verticalGreen = true  // 上下方向绿灯
  const horizontalRed = true  // 左右方向红灯
  
  // 左上角红绿灯（控制右行）
  drawSingleTrafficLight(centerX - roadWidth / 2 - 15, centerY - roadWidth / 2 - 35, !horizontalRed, horizontalRed, false)
  
  // 右上角红绿灯（控制左行）
  drawSingleTrafficLight(centerX + roadWidth / 2 + 15, centerY - roadWidth / 2 - 35, !horizontalRed, horizontalRed, false)
  
  // 左下角红绿灯（控制上行）
  drawSingleTrafficLight(centerX - roadWidth / 2 - 15, centerY + roadWidth / 2 + 35, verticalGreen, false, !verticalGreen)
  
  // 右下角红绿灯（控制下行）
  drawSingleTrafficLight(centerX + roadWidth / 2 + 15, centerY + roadWidth / 2 + 35, verticalGreen, false, !verticalGreen)
}

// 绘制单个红绿灯
function drawSingleTrafficLight(x, y, greenOn, yellowOn, redOn) {
  // 灯杆
  ctx.fillStyle = '#4a5568'
  ctx.fillRect(x - 2, y + 35, 4, 30)
  
  // 灯箱外壳
  ctx.fillStyle = '#2d3748'
  ctx.fillRect(x - 18, y, 36, 48)
  
  // 红色灯
  ctx.beginPath()
  ctx.arc(x, y + 12, 10, 0, Math.PI * 2)
  ctx.fillStyle = redOn ? '#ef4444' : '#4a5568'
  ctx.fill()
  
  // 黄色灯
  ctx.beginPath()
  ctx.arc(x, y + 24, 10, 0, Math.PI * 2)
  ctx.fillStyle = yellowOn ? '#eab308' : '#4a5568'
  ctx.fill()
  
  // 绿色灯
  ctx.beginPath()
  ctx.arc(x, y + 36, 10, 0, Math.PI * 2)
  ctx.fillStyle = greenOn ? '#22c55e' : '#4a5568'
  ctx.fill()
  
  // 灯光效果
  if (greenOn) {
    ctx.beginPath()
    ctx.arc(x, y + 36, 16, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(34, 197, 94, 0.3)'
    ctx.fill()
  }
  if (redOn) {
    ctx.beginPath()
    ctx.arc(x, y + 12, 16, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(239, 68, 68, 0.3)'
    ctx.fill()
  }
}

// 绘制盲区
function drawBlindSpots() {
  blindSpots.value.forEach(spot => {
    // 盲区闪烁效果
    const alpha = props.warningLevel === 'level1' || props.warningLevel === 'level2'
      ? 0.3 + Math.sin(Date.now() / 200) * 0.2
      : 0.2

    ctx.fillStyle = `rgba(255, 68, 68, ${alpha})`
    ctx.fillRect(spot.x, spot.y, spot.width, spot.height)

    // 边框
    ctx.strokeStyle = props.warningLevel === 'level2'
      ? `rgba(255, 68, 68, ${0.8 + Math.sin(Date.now() / 100) * 0.2})`
      : 'rgba(255, 68, 68, 0.5)'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.strokeRect(spot.x, spot.y, spot.width, spot.height)
    ctx.setLineDash([])

    // 盲区标签
    ctx.fillStyle = 'rgba(255, 68, 68, 0.8)'
    ctx.font = '12px Microsoft YaHei'
    ctx.fillText(spot.label || '盲区', spot.x + 5, spot.y + 20)
  })
}

// 绘制V2X超视距可见范围
function drawV2XRange() {
  const egoX = egoVehicle.value.x
  const egoY = egoVehicle.value.y

  // V2X通信范围（远距离）
  const v2xRadius = 250

  // V2X范围
  const gradient = ctx.createRadialGradient(egoX, egoY, 0, egoX, egoY, v2xRadius)
  gradient.addColorStop(0, 'rgba(0, 212, 255, 0.05)')
  gradient.addColorStop(1, 'rgba(0, 212, 255, 0.1)')

  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(egoX, egoY, v2xRadius, 0, Math.PI * 2)
  ctx.fill()

  // V2X范围边界
  ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)'
  ctx.lineWidth = 1.5
  ctx.setLineDash([15, 8])
  ctx.beginPath()
  ctx.arc(egoX, egoY, v2xRadius, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])

  // V2X标签
  ctx.fillStyle = 'rgba(0, 212, 255, 0.9)'
  ctx.font = 'bold 13px Microsoft YaHei, sans-serif'
  ctx.fillText('V2X 超视距范围', egoX + v2xRadius - 110, egoY - v2xRadius + 20)
}

// 绘制单车雷达感知范围
function drawRadarRange() {
  const egoX = egoVehicle.value.x
  const egoY = egoVehicle.value.y

  // 雷达感知范围（近距离）
  const radarRadius = 80

  // 雷达范围
  const gradient = ctx.createRadialGradient(egoX, egoY, 0, egoX, egoY, radarRadius)
  gradient.addColorStop(0, 'rgba(100, 200, 100, 0.2)')
  gradient.addColorStop(1, 'rgba(100, 200, 100, 0.05)')

  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(egoX, egoY, radarRadius, 0, Math.PI * 2)
  ctx.fill()

  // 雷达范围边界
  ctx.strokeStyle = 'rgba(100, 200, 100, 0.5)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(egoX, egoY, radarRadius, 0, Math.PI * 2)
  ctx.stroke()

  // 雷达标签
  ctx.fillStyle = 'rgba(100, 200, 100, 0.9)'
  ctx.font = '12px Microsoft YaHei, sans-serif'
  ctx.fillText('单车雷达', egoX + radarRadius + 10, egoY)
}

// 更新车辆位置
function updateVehicles() {
  const speedFactor = props.speed / 60

  if (props.scene === 'ramp') {
    const centerX = canvasWidth / 2 + 150
    const centerY = canvasHeight * 0.7 + 200
    const startAngle = -Math.PI * 0.8
    const endAngle = -Math.PI * 0.2
    const vehicleRadius = 220

    vehicles.value.forEach(vehicle => {
      // 保存旧位置用于碰撞检测
      const oldArcAngle = vehicle.arcAngle
      
      // 匝道车辆角度更新逻辑
      vehicle.arcAngle += vehicle.speed * speedFactor / vehicle.radius
      if (vehicle.arcAngle > endAngle) {
        vehicle.arcAngle = startAngle
        vehicle.needsRespawn = true
        vehicle.respawnTimer = (vehicle.respawnTimer || 0) + 1
      } else if (vehicle.arcAngle < startAngle) {
        vehicle.arcAngle = startAngle
      } else {
        vehicle.needsRespawn = false
        vehicle.respawnTimer = 0
      }
      
      // 位置根据圆弧角度计算
      vehicle.x = centerX + Math.cos(vehicle.arcAngle) * vehicle.radius
      vehicle.y = centerY + Math.sin(vehicle.arcAngle) * vehicle.radius
      // 朝向角度 = 圆弧角度 + 180°
      vehicle.angle = vehicle.arcAngle + Math.PI
    })
    
    // ========== 匝道防撞逻辑 ==========
    // 按半径分组（同半径 = 同车道）
    const radiusGroups = {}
    vehicles.value.forEach(v => {
      const key = Math.round(v.radius / 10) // 按半径分组
      if (!radiusGroups[key]) radiusGroups[key] = []
      radiusGroups[key].push(v)
    })
    
    Object.values(radiusGroups).forEach(groupVehicles => {
      if (groupVehicles.length >= 2) {
        // 按arcAngle排序，angle大的在前面（更接近endAngle）
        groupVehicles.sort((a, b) => b.arcAngle - a.arcAngle)
        
        for (let i = 0; i < groupVehicles.length - 1; i++) {
          const frontVehicle = groupVehicles[i]
          const rearVehicle = groupVehicles[i + 1]
          
          // 计算沿弧线的距离（转换为像素）
          const angleDist = frontVehicle.arcAngle - rearVehicle.arcAngle
          const arcDistance = Math.abs(angleDist) * vehicleRadius
          
          if (arcDistance < 20) {
            // 距离小于20px，直接刹车
            rearVehicle.speed = 0
          } else if (arcDistance < 50) {
            // 距离小于50px，大幅减速
            rearVehicle.speed = Math.max(0.1, rearVehicle.speed * 0.3)
          } else if (arcDistance < 100) {
            // 距离小于100px，适度减速
            rearVehicle.speed = Math.max(0.3, rearVehicle.speed * 0.6)
          }
        }
      }
    })
    // ========== 防撞逻辑结束 ==========
    
    // ========== 匝道重生逻辑 ==========
    const vehiclesNeedingRespawn = vehicles.value.filter(v => v.needsRespawn).length
    
    if (vehiclesNeedingRespawn > 0 && vehicles.value.length < 3) {
      const respawnCount = Math.min(vehiclesNeedingRespawn, 3 - vehicles.value.length)
      let respawned = 0
      
      vehicles.value.forEach(vehicle => {
        if (vehicle.needsRespawn && respawned < respawnCount && vehicles.value.length < 3) {
          // 检查前方250px内是否有其他车辆
          const sameRadiusVehicles = vehicles.value.filter(v => 
            Math.abs(v.radius - vehicle.radius) < 20 && 
            v.arcAngle > vehicle.arcAngle
          )
          
          // 计算与前车的弧线距离
          let canSpawn = true
          for (const frontV of sameRadiusVehicles) {
            const angleDist = frontV.arcAngle - startAngle
            const arcDistance = angleDist * vehicleRadius
            if (arcDistance < 175) {
              canSpawn = false
              break
            }
          }
          
          // 检查与主车的距离
          if (canSpawn) {
            const egoArcAngle = egoVehicle.value.arcAngle
            const egoAngleDist = startAngle - egoArcAngle
            const egoArcDist = Math.abs(egoAngleDist) * vehicleRadius
            if (egoArcDist < 175) {
              canSpawn = false
            }
          }
          
          if (canSpawn) {
            vehicle.arcAngle = startAngle
            vehicle.x = centerX + Math.cos(vehicle.arcAngle) * vehicle.radius
            vehicle.y = centerY + Math.sin(vehicle.arcAngle) * vehicle.radius
            vehicle.speed = 0.5 + Math.random() * 1.5
            vehicle.type = Math.random() > 0.7 ? 'truck' : 'car'
            vehicle.needsRespawn = false
            vehicle.respawnTimer = 0
            respawned++
          }
        }
      })
    }
    // ========== 重生逻辑结束 ==========
  } else {
    const lanePositions = [-2, -1, 1, 2, 3]
    const egoY = egoVehicle.value.y
    
    vehicles.value.forEach(vehicle => {
      vehicle.y += vehicle.speed * speedFactor

      if (vehicle.y > canvasHeight + 100) {
        // 车辆移出画布后标记为需要重生
        vehicle.needsRespawn = true
        vehicle.respawnTimer = (vehicle.respawnTimer || 0) + 1
      } else {
        vehicle.needsRespawn = false
        vehicle.respawnTimer = 0
      }
    })
    
    // ========== 防撞逻辑：同一车道后车减速/刹车 ==========
    // 按x坐标分组（同一车道）
    const laneGroups = {}
    vehicles.value.forEach(v => {
      const laneKey = Math.round(v.x / 50) // 按车道大致分组
      if (!laneGroups[laneKey]) laneGroups[laneKey] = []
      laneGroups[laneKey].push(v)
    })
    
    // 对每个车道进行处理
    Object.values(laneGroups).forEach(laneVehicles => {
      if (laneVehicles.length >= 2) {
        // 按y坐标排序，y越大越靠前（越靠近画布底部）
        laneVehicles.sort((a, b) => b.y - a.y)
        
        // 从前往后检查，后面的车不能超过前面的车
        for (let i = 0; i < laneVehicles.length - 1; i++) {
          const frontVehicle = laneVehicles[i]   // 前车
          const rearVehicle = laneVehicles[i + 1] // 后车
          
          const distance = frontVehicle.y - rearVehicle.y
          
          if (distance < 20) {
            // 距离小于20px，直接刹车（速度为0）
            rearVehicle.speed = 0
          } else if (distance < 100) {
            // 距离小于100px，大幅减速
            rearVehicle.speed = Math.max(0.1, rearVehicle.speed * 0.3)
          } else if (distance < 200) {
            // 距离小于200px，适度减速
            rearVehicle.speed = Math.max(0.3, rearVehicle.speed * 0.6)
          }
        }
      }
    })
    // ========== 防撞逻辑结束 ==========
    
    // 检查需要重生的车辆数量
    const vehiclesNeedingRespawn = vehicles.value.filter(v => v.needsRespawn).length
    
    // 如果有车辆需要重生且总数不超过5辆，且最多一次重生3辆
    if (vehiclesNeedingRespawn > 0 && vehicles.value.length < 5) {
      const respawnCount = Math.min(vehiclesNeedingRespawn, 3, 5 - vehicles.value.length)
      let respawned = 0
      
      vehicles.value.forEach(vehicle => {
        if (vehicle.needsRespawn && respawned < respawnCount && vehicles.value.length < 5) {
          // 检查该车道前方250px内是否有其他车辆
          const sameLaneVehicles = vehicles.value.filter(v => 
            Math.abs(v.x - vehicle.x) < 30 && v.y < egoY && v.y > vehicle.y
          )
          
          const canSpawn = sameLaneVehicles.every(v => {
            const distanceToFront = Math.abs(v.y - vehicle.y)
            const distanceToEgo = Math.abs(egoY - v.y)
            return distanceToFront >= 250 && distanceToEgo >= 250
          })
          
          if (canSpawn) {
            const laneIndex = lanePositions[Math.floor(Math.random() * lanePositions.length)]
            const laneOffset = laneIndex * (40 + Math.random() * 40)
            vehicle.x = canvasWidth / 2 + laneOffset
            vehicle.y = -100
            vehicle.speed = 0.5 + Math.random() * 1.5
            vehicle.type = Math.random() > 0.7 ? 'truck' : 'car'
            vehicle.needsRespawn = false
            vehicle.lastSpawnY = -100
            respawned++
          }
        }
      })
    }
  }

  updateBlindSpots()
}

// 绘制周边车辆
function drawVehicles() {
  vehicles.value.forEach(vehicle => {
    drawCar(vehicle.x, vehicle.y, vehicle.angle, vehicle.width, vehicle.height, vehicle.type, false)
  })
}

// 绘制主车
function drawEgoVehicle(x, y) {
  const pos = x !== undefined ? { x, y } : egoVehicle.value
  drawCar(pos.x, pos.y, pos.angle, pos.width, pos.height, 'ego', true)
}

// 绘制汽车
function drawCar(x, y, angle, width, height, type, isEgo) {
  ctx.save()
  ctx.translate(x, y)
  // 【修改】使用传入的angle参数旋转车辆，使其朝向正确的方向
  ctx.rotate(angle)

  if (isEgo) {
    // 主车 - 科技蓝
    ctx.fillStyle = '#00aaff'
  } else if (type === 'truck') {
    // 货车 - 深灰色
    ctx.fillStyle = '#4a5568'
  } else {
    // 普通车辆
    ctx.fillStyle = '#7a8a9a'
  }

  // 车身
  ctx.beginPath()
  ctx.roundRect(-width / 2, -height / 2, width, height, 10)
  ctx.fill()

  // 车身轮廓
  ctx.strokeStyle = isEgo ? '#00aaff' : '#cccccc'
  ctx.lineWidth = isEgo ? 2 : 1
  ctx.stroke()

  // 车窗
  ctx.fillStyle = 'rgba(150, 200, 255, 0.6)'
  ctx.beginPath()
  ctx.roundRect(-width / 2 + 5, -height / 2 + 6, width - 10, height * 0.22, 4)
  ctx.fill()

  // V2X天线（仅主车）
  if (isEgo) {
    ctx.fillStyle = '#00ff88'
    ctx.beginPath()
    ctx.arc(0, -height / 2 - 5, 4, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

// 碰撞检测
function checkCollision() {
  if (props.warningLevel === 'level2') {
    const avoidanceSuccess = 0 // 假设在二级预警时
    if (avoidanceSuccess < props.density * 0.3) {
      emit('collision-triggered')
    }
  }
}

// 重置动画
function resetAnimation() {
  initVehicles()
}

// 监听参数变化
watch([() => props.speed, () => props.density], () => {
  initVehicles()
})

watch(() => props.scene, () => {
  nextTick(() => {
    initVehicles()
  })
})

watch(() => props.isCollided, (newVal) => {
  if (!newVal) {
    initVehicles()
  }
})

// 生命周期
onMounted(() => {
  nextTick(() => {
    initCanvas()
    animationId = requestAnimationFrame(animate)
  })

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', handleResize)
})

function handleResize() {
  initCanvas()
}

defineExpose({
  resetAnimation
})
</script>

<style lang="scss" scoped>
$primary-color: #00d4ff;
$warning-color: #ff4444;

.canvas-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;

  canvas {
    width: 100%;
    height: 100%;
    display: block;
  }
}

.scene-label {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 20, 40, 0.9);
  padding: 10px 24px;
  border-radius: 8px;
  border: 1px solid rgba($primary-color, 0.4);
  color: $primary-color;
  font-size: 16px;
  font-weight: 600;
}

.legend {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 20, 40, 0.9);
  padding: 14px 18px;
  border-radius: 8px;
  border: 1px solid rgba($primary-color, 0.25);

  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 12px;
    color: #a0c4e8;

    &:last-child {
      margin-bottom: 0;
    }

    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 4px;

      &.ego {
        background: #00d4ff;
      }

      &.other {
        background: #7a8a9a;
      }

      &.blind {
        background: rgba(255, 68, 68, 0.5);
        border: 1px solid #ff4444;
      }

      &.v2x {
        background: rgba(0, 212, 255, 0.2);
        border: 1px solid $primary-color;
      }
    }
  }
}

.collision-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;

  .collision-effect {
    text-align: center;
    padding: 40px 60px;
    background: rgba(0, 10, 20, 0.9);
    border-radius: 12px;
    border: 2px solid rgba(255, 68, 68, 0.5);

    .crash-icon {
      font-size: 80px;
    }

    .crash-text {
      font-size: 24px;
      font-weight: bold;
      color: #ff4444;
      margin-top: 16px;
    }
  }
}
</style>
