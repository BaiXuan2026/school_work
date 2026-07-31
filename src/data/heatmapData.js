/**
 * 城市风险热力地图模拟数据
 * 包含路段基础信息、时段风险数据、历史趋势数据
 */

// 路段基础信息 - 珠海市金湾区典型道路（坐标附近）
export const roadSegments = [
  // 高速公路
  { id: 'R001', name: '珠海大道', level: '主干道', roadType: 'highway', area: '金湾区', coords: [113.362992, 22.201864] },
  // 快速路
  { id: 'R002', name: '金湾大道', level: '主干道', roadType: 'expressway', area: '金湾区', coords: [113.354767, 22.184789] },
  // 匝道
  { id: 'R003', name: '机场北互通', level: '支路', roadType: 'ramp', area: '金湾区', coords: [113.36422, 22.198202] }
]

// 道路类型映射到场景
export const roadTypeToScene = {
  'urban': 'urban',
  'expressway': 'expressway',
  'highway': 'highway',
  'ramp': 'ramp',
  'tunnel': 'tunnel'
}

// 道路类型名称
export const roadTypeNames = {
  'urban': '城市道路',
  'expressway': '快速路',
  'highway': '高速公路',
  'ramp': '匝道',
  'tunnel': '隧道'
}

// 时段配置 - 按用户要求调整
export const timePeriods = {
  morning: { 
    name: '早高峰', 
    timeRange: '07:00-09:00', 
    hours: [7, 8, 9],
    duration: 2
  },
  normal: { 
    name: '平峰', 
    timeRange: '09:00-17:30', 
    hours: [10, 11, 12, 13, 14, 15, 16, 17],
    duration: 8.5
  },
  evening: { 
    name: '晚高峰', 
    timeRange: '17:30-19:30', 
    hours: [17, 18, 19],
    duration: 2
  },
  night: { 
    name: '夜间低峰', 
    timeRange: '19:30-次日07:00', 
    hours: [20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6],
    duration: 11.5
  }
}

// 根据当前时间获取时段
export function getCurrentPeriod() {
  const hour = new Date().getHours()
  const minute = new Date().getMinutes()
  const totalMinutes = hour * 60 + minute
  
  // 早高峰：07:00 - 09:00 (420 - 540分钟)
  if (totalMinutes >= 420 && totalMinutes < 540) {
    return 'morning'
  } 
  // 平峰：09:00 - 17:30 (540 - 1050分钟)
  else if (totalMinutes >= 540 && totalMinutes < 1050) {
    return 'normal'
  } 
  // 晚高峰：17:30 - 19:30 (1050 - 1170分钟)
  else if (totalMinutes >= 1050 && totalMinutes < 1170) {
    return 'evening'
  } 
  // 夜间低峰：19:30 - 次日07:00
  else {
    return 'night'
  }
}

// 获取时段名称
export function getPeriodName(period) {
  return timePeriods[period]?.name || '未知时段'
}

// 获取时段时间范围
export function getPeriodTimeRange(period) {
  return timePeriods[period]?.timeRange || ''
}

// 风险等级配置
export const riskLevels = {
  low: { name: '低风险', min: 90, color: '#00ff88' },
  mediumLow: { name: '较低风险', min: 80, color: '#7fff00' },
  medium: { name: '中风险', min: 70, color: '#ffff00' },
  mediumHigh: { name: '较高风险', min: 60, color: '#ffaa00' },
  high: { name: '高风险', min: 0, color: '#ff4444' }
}

// 生成时段风险数据
function generatePeriodData(period) {
  const periodMultipliers = {
    morning: { avoidance: 0.75, speed: 0.6, density: 1.4 },
    evening: { avoidance: 0.7, speed: 0.5, density: 1.5 },
    normal: { avoidance: 0.88, speed: 0.85, density: 0.9 },
    night: { avoidance: 0.95, speed: 1.0, density: 0.4 }
  }

  const multiplier = periodMultipliers[period]
  const data = []

  roadSegments.forEach(road => {
    // 根据道路层级和区域生成基础数据
    let baseAvoidance = 85
    let baseSpeed = 40
    let baseDensity = 100

    if (road.level === '主干道') {
      baseAvoidance = 88
      baseSpeed = 50
      baseDensity = 150
    } else if (road.level === '次干道') {
      baseAvoidance = 82
      baseSpeed = 35
      baseDensity = 100
    } else {
      baseAvoidance = 78
      baseSpeed = 25
      baseDensity = 60
    }

    // 区域差异
    if (road.area === '市中心区') {
      baseAvoidance -= 5
      baseSpeed *= 0.7
      baseDensity *= 1.3
    }

    // 应用时段乘数
    const avoidanceSuccess = Math.min(98, Math.max(55, baseAvoidance * multiplier.avoidance + (Math.random() * 6 - 3)))
    const avgSpeed = Math.round(baseSpeed * multiplier.speed * (0.9 + Math.random() * 0.2))
    const vehicleDensity = Math.round(baseDensity * multiplier.density * (0.9 + Math.random() * 0.2))
    const earlyWarning = Math.round((3 - (avoidanceSuccess - 60) / 40) * 10) / 10

    data.push({
      roadId: road.id,
      roadName: road.name,
      roadLevel: road.level,
      roadType: road.roadType,
      area: road.area,
      period,
      avoidanceSuccess: Math.round(avoidanceSuccess * 10) / 10,
      earlyWarning: Math.max(0.5, earlyWarning),
      avgSpeed,
      vehicleDensity
    })
  })

  return data
}

// 生成历史趋势数据（过去24小时）
export function generateHistoryData(roadId) {
  const hours = []
  const avoidanceData = []
  const riskLevelData = []

  for (let i = 23; i >= 0; i--) {
    const hour = new Date()
    hour.setHours(hour.getHours() - i)
    hours.push(hour.getHours() + ':00')

    // 生成模拟的历史数据
    let baseAvoidance = 82
    const currentHour = hour.getHours()

    // 时段影响
    if (currentHour >= 7 && currentHour <= 9) {
      baseAvoidance = 72 // 早高峰
    } else if (currentHour >= 17 && currentHour <= 19) {
      baseAvoidance = 68 // 晚高峰
    } else if (currentHour >= 20 || currentHour <= 6) {
      baseAvoidance = 92 // 夜间
    } else {
      baseAvoidance = 85 // 平峰
    }

    // 随机波动
    const avoidance = Math.round((baseAvoidance + (Math.random() * 8 - 4)) * 10) / 10
    avoidanceData.push(Math.min(98, Math.max(55, avoidance)))

    // 风险等级
    let riskLevel = 'low'
    if (avoidance >= 90) riskLevel = 'low'
    else if (avoidance >= 80) riskLevel = 'mediumLow'
    else if (avoidance >= 70) riskLevel = 'medium'
    else if (avoidance >= 60) riskLevel = 'mediumHigh'
    else riskLevel = 'high'

    riskLevelData.push(riskLevel)
  }

  return { hours, avoidanceData, riskLevelData }
}

// 默认模拟数据
export const defaultHeatmapData = {
  morning: generatePeriodData('morning'),
  evening: generatePeriodData('evening'),
  normal: generatePeriodData('normal'),
  night: generatePeriodData('night')
}

// 获取风险等级
export function getRiskLevel(avoidanceSuccess, thresholds) {
  if (avoidanceSuccess >= thresholds.low) return 'low'
  if (avoidanceSuccess >= thresholds.mediumLow) return 'mediumLow'
  if (avoidanceSuccess >= thresholds.medium) return 'medium'
  if (avoidanceSuccess >= thresholds.mediumHigh) return 'mediumHigh'
  return 'high'
}

// 获取风险等级颜色
export function getRiskColor(level) {
  return riskLevels[level]?.color || '#ff4444'
}

// 字段映射（Excel解析用）
export const heatmapFieldMappings = {
  '路段ID': 'roadId',
  '路段名称': 'roadName',
  '道路层级': 'roadLevel',
  '所属区域': 'area',
  '时段': 'period',
  '避让成功率': 'avoidanceSuccess',
  '提前预警时间': 'earlyWarning',
  '平均车速': 'avgSpeed',
  '车辆密度': 'vehicleDensity'
}

// 热力地图必填字段
export const heatmapRequiredFields = [
  'roadId', 'roadName', 'roadLevel', 'area', 'period',
  'avoidanceSuccess', 'earlyWarning', 'avgSpeed', 'vehicleDensity'
]

// ==================== 多指标加权计算函数 ====================

/**
 * 多指标加权计算综合风险值
 * @param {Object} data - 包含各指标的对象
 * @returns {number} - 综合风险值（0-10）
 */
export function calculateCompositeRisk(data) {
  // 默认权重配置
  const weights = {
    density: 0.25,      // 车流密度权重
    successProb: 0.25,  // 避让成功率权重
    blindSpot: 0.20,    // 盲区指标权重
    delay: 0.15,        // 平均延迟权重
    packetLoss: 0.15    // 丢包率权重
  }

  // 提取数据（支持不同字段名）
  const Speed_kmh = data.Speed_kmh || data.avgSpeed || 40
  const Density_veh_per_km = data.Density_veh_per_km || data.vehicleDensity || 100
  const Avoidance_Success_Prob = (data.Avoidance_Success_Prob || data.avoidanceSuccess || 85) / 100
  const Blind_Spot_Metric = data.Blind_Spot_Metric || 0
  const Avg_Delay_s = data.Avg_Delay_s || data.earlyWarning || 2
  const PacketLoss_150m = data.PacketLoss_150m || 0

  // 计算各指标得分（归一化到0-1）
  const densityScore = Math.min(1, Density_veh_per_km / 200)  // 假设最大密度200
  const successScore = 1 - Avoidance_Success_Prob             // 成功率越低风险越高
  const blindSpotScore = Math.min(1, Blind_Spot_Metric / 10)  // 假设最大盲区指标10
  const delayScore = Math.min(1, Avg_Delay_s / 5)             // 假设最大延迟5秒
  const packetLossScore = Math.min(1, PacketLoss_150m / 0.5)  // 假设最大丢包率50%

  // 加权求和
  const risk = 
    densityScore * weights.density +
    successScore * weights.successProb +
    blindSpotScore * weights.blindSpot +
    delayScore * weights.delay +
    packetLossScore * weights.packetLoss

  // 转换为0-10范围
  return Math.round(risk * 100) / 10
}

/**
 * 将路段数据转换为热力图格式 [经度, 纬度, 风险值]
 * @param {Array} roadData - 路段数据数组
 * @returns {Array} - 热力图格式数据
 */
export function convertToHeatmapFormat(roadData) {
  const result = []
  
  roadData.forEach(road => {
    // 查找对应的路段基础信息获取坐标
    const baseRoad = roadSegments.find(r => r.id === road.roadId || r.name === road.roadName)
    
    if (baseRoad && baseRoad.coords) {
      // 计算综合风险值
      const riskValue = calculateCompositeRisk(road)
      
      result.push([
        baseRoad.coords[0],  // 经度
        baseRoad.coords[1],  // 纬度
        riskValue            // 风险值
      ])
    }
  })
  
  return result
}

/**
 * 获取模拟热力图数据（按时段）
 * @param {string} period - 时段标识
 * @returns {Array} - 热力图格式数据
 */
export function getSimulatedHeatmapData(period) {
  const periodData = defaultHeatmapData[period] || []
  return convertToHeatmapFormat(periodData)
}

/**
 * 从表格数据生成热力图数据
 * @param {Array} tableData - 表格数据数组
 * @returns {Array} - 热力图格式数据
 */
export function generateHeatmapFromTable(tableData) {
  return convertToHeatmapFormat(tableData)
}

// 时段名称映射（支持多种输入格式）
const periodNameMap = {
  '早高峰': 'morning',
  '早': 'morning',
  'morning': 'morning',
  'Morning': 'morning',
  '07:00-09:00': 'morning',
  '上午': 'morning',
  '平峰': 'normal',
  '平': 'normal',
  'normal': 'normal',
  'Normal': 'normal',
  '09:00-17:30': 'normal',
  '日间': 'normal',
  '下午': 'normal',
  '晚高峰': 'evening',
  '晚': 'evening',
  'evening': 'evening',
  'Evening': 'evening',
  '17:30-19:30': 'evening',
  '夜间低峰': 'night',
  '夜间': 'night',
  '夜': 'night',
  'night': 'night',
  'Night': 'night',
  '19:30-07:00': 'night',
  '凌晨': 'night'
}

/**
 * 解析上传的表格数据
 * @param {Array} rawData - 原始表格数据（数组格式）
 * @returns {Object} - 包含解析后数据和错误信息
 */
export function parseTableData(rawData) {
  const parsedData = []
  const errors = []
  
  rawData.forEach((row, index) => {
    try {
      // 获取时段值（支持多种字段名）
      const periodValue = row['时段'] || row['period'] || row['时间段'] || row['时间'] || ''
      // 映射时段名称
      const mappedPeriod = periodNameMap[periodValue] || null
      
      const parsedRow = {
        roadId: row['路段ID'] || row['roadId'] || `R${String(index + 1).padStart(3, '0')}`,
        roadName: row['路段名称'] || row['roadName'] || `路段${index + 1}`,
        roadLevel: row['道路层级'] || row['roadLevel'] || '主干道',
        area: row['所属区域'] || row['area'] || '金湾区',
        period: mappedPeriod,  // 不设置默认值，让后续处理决定
        Speed_kmh: parseFloat(row['Speed_kmh'] || row['平均车速'] || 40),
        Density_veh_per_km: parseFloat(row['Density_veh_per_km'] || row['车辆密度'] || 100),
        PRR_50m: parseFloat(row['PRR_50m'] || 0),
        PRR_150m: parseFloat(row['PRR_150m'] || 0),
        PacketLoss_150m: parseFloat(row['PacketLoss_150m'] || 0),
        Avg_Neighbors: parseFloat(row['Avg_Neighbors'] || 0),
        Avg_CBR: parseFloat(row['Avg_CBR'] || 0),
        Avg_Delay_s: parseFloat(row['Avg_Delay_s'] || row['提前预警时间'] || 2),
        Throughput_kbps: parseFloat(row['Throughput_kbps'] || 0),
        Blind_Spot_Metric: parseFloat(row['Blind_Spot_Metric'] || 0),
        Avoidance_Success_Prob: parseFloat(row['Avoidance_Success_Prob'] || row['避让成功率'] || 85),
        Warning_Time_s: parseFloat(row['Warning_Time_s'] || row['提前预警时间'] || 2)
      }
      
      parsedData.push(parsedRow)
    } catch (e) {
      errors.push(`第${index + 1}行解析错误: ${e.message}`)
    }
  })
  
  return { data: parsedData, errors }
}

/**
 * 按时段分组数据
 * @param {Array} data - 解析后的数据
 * @returns {Object} - 按时段分组的数据
 */
export function groupByPeriod(data) {
  const grouped = {
    morning: [],
    normal: [],
    evening: [],
    night: []
  }
  
  // 分离有指定时段和未指定时段的数据
  const specifiedPeriodData = data.filter(row => row.period && grouped[row.period])
  const unspecifiedPeriodData = data.filter(row => !row.period || !grouped[row.period])
  
  // 处理已指定时段的数据
  specifiedPeriodData.forEach(row => {
    if (grouped[row.period]) {
      grouped[row.period].push(row)
    }
  })
  
  // 处理未指定时段的数据 - 均匀分配到四个时段
  if (unspecifiedPeriodData.length > 0) {
    const periodKeys = ['morning', 'normal', 'evening', 'night']
    unspecifiedPeriodData.forEach((row, index) => {
      const targetPeriod = periodKeys[index % 4]
      const rowWithPeriod = { ...row, period: targetPeriod }
      grouped[targetPeriod].push(rowWithPeriod)
    })
  }
  
  return grouped
}

// ==================== 风险趋势预测函数 ====================

/**
 * 简单移动平均预测
 * @param {Array} data - 历史数据数组
 * @param {number} windowSize - 窗口大小
 * @returns {number} - 预测值
 */
function simpleMovingAverage(data, windowSize = 5) {
  if (data.length === 0) return 80
  const recent = data.slice(-windowSize)
  return recent.reduce((sum, val) => sum + val, 0) / recent.length
}

/**
 * 加权移动平均预测（近期数据权重更高）
 * @param {Array} data - 历史数据数组
 * @param {number} windowSize - 窗口大小
 * @returns {number} - 预测值
 */
function weightedMovingAverage(data, windowSize = 5) {
  if (data.length === 0) return 80
  const recent = data.slice(-windowSize)
  const weights = [1, 2, 3, 4, 5]
  const weightSum = weights.slice(-recent.length).reduce((a, b) => a + b, 0)
  return recent.reduce((sum, val, idx) => sum + val * weights[idx], 0) / weightSum
}

/**
 * 计算趋势方向（基于最近几组数据的变化）
 * @param {Array} data - 历史数据数组
 * @returns {string} - 'increasing', 'decreasing', 'stable'
 */
function calculateTrendDirection(data) {
  if (data.length < 3) return 'stable'
  
  const recent = data.slice(-5)
  const firstHalf = recent.slice(0, Math.floor(recent.length / 2))
  const secondHalf = recent.slice(Math.floor(recent.length / 2))
  
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
  
  const diff = secondAvg - firstAvg
  if (diff > 1.5) return 'increasing'
  if (diff < -1.5) return 'decreasing'
  return 'stable'
}

/**
 * 基于历史数据预测未来风险趋势
 * @param {Object} historyData - 历史数据（由generateHistoryData生成）
 * @param {number} minutes - 预测时长（分钟），支持30或60
 * @returns {Object} - 预测结果
 */
export function predictRiskTrend(historyData, minutes = 30) {
  if (!historyData || !historyData.avoidanceData || historyData.avoidanceData.length === 0) {
    return {
      current: 82,
      prediction30min: 82,
      prediction60min: 82,
      trend30min: 'stable',
      trend60min: 'stable',
      confidence: 0.6
    }
  }
  
  const avoidanceData = historyData.avoidanceData
  const currentValue = avoidanceData[avoidanceData.length - 1]
  
  const sma5 = simpleMovingAverage(avoidanceData, 5)
  const wma5 = weightedMovingAverage(avoidanceData, 5)
  
  const trend = calculateTrendDirection(avoidanceData)
  
  const trendFactor = trend === 'increasing' ? -1.5 : trend === 'decreasing' ? 1.5 : 0
  const smoothingFactor = 0.7
  
  const prediction30min = Math.min(98, Math.max(55, 
    wma5 + trendFactor * 0.5 + (currentValue - wma5) * smoothingFactor * 0.3
  ))
  
  const prediction60min = Math.min(98, Math.max(55,
    wma5 + trendFactor * 1.0 + (currentValue - wma5) * smoothingFactor * 0.5
  ))
  
  const variance = calculateVariance(avoidanceData.slice(-10))
  const confidence = Math.max(0.3, Math.min(0.9, 0.8 - variance * 0.05))
  
  return {
    current: Math.round(currentValue * 10) / 10,
    prediction30min: Math.round(prediction30min * 10) / 10,
    prediction60min: Math.round(prediction60min * 10) / 10,
    trend30min: prediction30min > currentValue + 1 ? 'decreasing' : 
                prediction30min < currentValue - 1 ? 'increasing' : 'stable',
    trend60min: prediction60min > currentValue + 1 ? 'decreasing' : 
                prediction60min < currentValue - 1 ? 'increasing' : 'stable',
    confidence: Math.round(confidence * 100) / 100
  }
}

function calculateVariance(data) {
  if (data.length === 0) return 0
  const mean = data.reduce((a, b) => a + b, 0) / data.length
  return data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
}

/**
 * 预测全局风险趋势
 * @param {Array} roadDataArray - 所有时段的路段数据
 * @param {number} minutes - 预测时长
 * @returns {Object} - 预测结果
 */
export function predictGlobalRiskTrend(roadDataArray, minutes = 30) {
  if (!roadDataArray || roadDataArray.length === 0) {
    return {
      current: 82,
      prediction30min: 82,
      prediction60min: 82,
      trendDirection: 'stable',
      trendDescription: '风险趋势平稳',
      riskChange30min: 0,
      riskChange60min: 0,
      confidence: 0.6
    }
  }
  
  const current = roadDataArray.reduce((sum, road) => sum + road.avoidanceSuccess, 0) / roadDataArray.length
  
  const currentPeriod = getCurrentPeriod()
  const periodMultipliers = {
    morning: { trend: 'increasing', factor: -2 },
    evening: { trend: 'increasing', factor: -2.5 },
    normal: { trend: 'stable', factor: 0 },
    night: { trend: 'decreasing', factor: 1.5 }
  }
  
  const periodTrend = periodMultipliers[currentPeriod] || { trend: 'stable', factor: 0 }
  
  let periodTransitionFactor = 0
  const currentHour = new Date().getHours()
  if ((currentHour >= 7 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 19)) {
    periodTransitionFactor = -1.5
  }
  
  const basePrediction = current + periodTrend.factor + periodTransitionFactor
  const prediction30min = Math.min(98, Math.max(55, basePrediction))
  const prediction60min = Math.min(98, Math.max(55, basePrediction + periodTrend.factor * 0.5))
  
  const riskChange30min = prediction30min - current
  const riskChange60min = prediction60min - current
  
  let trendDescription = '风险趋势平稳'
  if (riskChange30min < -3) trendDescription = '风险显著下降'
  else if (riskChange30min < 0) trendDescription = '风险略有下降'
  else if (riskChange30min > 3) trendDescription = '风险显著上升'
  else if (riskChange30min > 0) trendDescription = '风险略有上升'
  
  return {
    current: Math.round(current * 10) / 10,
    prediction30min: Math.round(prediction30min * 10) / 10,
    prediction60min: Math.round(prediction60min * 10) / 10,
    trendDirection: periodTrend.trend,
    trendDescription,
    riskChange30min: Math.round(riskChange30min * 10) / 10,
    riskChange60min: Math.round(riskChange60min * 10) / 10,
    confidence: 0.75
  }
}

/**
 * 获取预测风险等级
 * @param {number} avoidanceSuccess - 避让成功率
 * @returns {Object} - 风险等级信息
 */
export function getPredictionRiskLevel(avoidanceSuccess) {
  if (avoidanceSuccess >= 90) return { level: 'low', name: '低风险', color: '#00ff88' }
  if (avoidanceSuccess >= 80) return { level: 'mediumLow', name: '较低风险', color: '#7fff00' }
  if (avoidanceSuccess >= 70) return { level: 'medium', name: '中风险', color: '#ffff00' }
  if (avoidanceSuccess >= 60) return { level: 'mediumHigh', name: '较高风险', color: '#ffaa00' }
  return { level: 'high', name: '高风险', color: '#ff4444' }
}
