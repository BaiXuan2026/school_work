/**
 * 内置默认仿真数据集
 * 66组数据对应 6档车辆密度 × 11档车速 的全组合
 * 车辆密度: 50, 100, 150, 200, 250, 300 veh/km
 * 车速: 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120 km/h
 */

export const defaultSimulationData = [
  // 车辆密度 50 veh/km
  { speed: 20, density: 50, success50m: 99.8, success150m: 98.5, packetLoss150m: 0.2, adjacentVehicles: 1, channelBusy: 5.2, avgDelay: 12.3, throughput: 85.6, blindSpot: 2.1, avoidanceSuccess: 98.5, earlyWarning: 2.8 },
  { speed: 30, density: 50, success50m: 99.7, success150m: 98.2, packetLoss150m: 0.3, adjacentVehicles: 1, channelBusy: 5.8, avgDelay: 13.1, throughput: 88.2, blindSpot: 2.3, avoidanceSuccess: 97.8, earlyWarning: 2.6 },
  { speed: 40, density: 50, success50m: 99.6, success150m: 97.8, packetLoss150m: 0.4, adjacentVehicles: 1, channelBusy: 6.5, avgDelay: 14.2, throughput: 90.5, blindSpot: 2.6, avoidanceSuccess: 97.2, earlyWarning: 2.4 },
  { speed: 50, density: 50, success50m: 99.5, success150m: 97.5, packetLoss150m: 0.5, adjacentVehicles: 2, channelBusy: 7.2, avgDelay: 15.5, throughput: 92.3, blindSpot: 2.8, avoidanceSuccess: 96.5, earlyWarning: 2.2 },
  { speed: 60, density: 50, success50m: 99.4, success150m: 97.2, packetLoss150m: 0.6, adjacentVehicles: 2, channelBusy: 8.0, avgDelay: 16.8, throughput: 94.1, blindSpot: 3.1, avoidanceSuccess: 95.8, earlyWarning: 2.0 },
  { speed: 70, density: 50, success50m: 99.2, success150m: 96.8, packetLoss150m: 0.7, adjacentVehicles: 2, channelBusy: 8.8, avgDelay: 18.2, throughput: 95.5, blindSpot: 3.4, avoidanceSuccess: 95.2, earlyWarning: 1.8 },
  { speed: 80, density: 50, success50m: 99.0, success150m: 96.5, packetLoss150m: 0.8, adjacentVehicles: 2, channelBusy: 9.5, avgDelay: 19.5, throughput: 96.8, blindSpot: 3.7, avoidanceSuccess: 94.5, earlyWarning: 1.6 },
  { speed: 90, density: 50, success50m: 98.8, success150m: 96.1, packetLoss150m: 0.9, adjacentVehicles: 2, channelBusy: 10.2, avgDelay: 20.8, throughput: 97.5, blindSpot: 4.0, avoidanceSuccess: 93.8, earlyWarning: 1.5 },
  { speed: 100, density: 50, success50m: 98.5, success150m: 95.8, packetLoss150m: 1.0, adjacentVehicles: 2, channelBusy: 11.0, avgDelay: 22.2, throughput: 98.2, blindSpot: 4.3, avoidanceSuccess: 93.0, earlyWarning: 1.4 },
  { speed: 110, density: 50, success50m: 98.2, success150m: 95.4, packetLoss150m: 1.2, adjacentVehicles: 2, channelBusy: 11.8, avgDelay: 23.5, throughput: 98.5, blindSpot: 4.6, avoidanceSuccess: 92.2, earlyWarning: 1.3 },
  { speed: 120, density: 50, success50m: 98.0, success150m: 95.0, packetLoss150m: 1.4, adjacentVehicles: 2, channelBusy: 12.5, avgDelay: 25.0, throughput: 98.8, blindSpot: 5.0, avoidanceSuccess: 91.5, earlyWarning: 1.2 },

  // 车辆密度 100 veh/km
  { speed: 20, density: 100, success50m: 99.5, success150m: 97.8, packetLoss150m: 0.4, adjacentVehicles: 2, channelBusy: 8.5, avgDelay: 15.2, throughput: 82.3, blindSpot: 3.5, avoidanceSuccess: 97.2, earlyWarning: 2.5 },
  { speed: 30, density: 100, success50m: 99.3, success150m: 97.5, packetLoss150m: 0.5, adjacentVehicles: 2, channelBusy: 9.2, avgDelay: 16.5, throughput: 85.5, blindSpot: 3.8, avoidanceSuccess: 96.5, earlyWarning: 2.3 },
  { speed: 40, density: 100, success50m: 99.1, success150m: 97.1, packetLoss150m: 0.6, adjacentVehicles: 3, channelBusy: 10.0, avgDelay: 17.8, throughput: 88.2, blindSpot: 4.2, avoidanceSuccess: 95.8, earlyWarning: 2.1 },
  { speed: 50, density: 100, success50m: 98.9, success150m: 96.8, packetLoss150m: 0.7, adjacentVehicles: 3, channelBusy: 10.8, avgDelay: 19.2, throughput: 90.5, blindSpot: 4.5, avoidanceSuccess: 95.0, earlyWarning: 1.9 },
  { speed: 60, density: 100, success50m: 98.7, success150m: 96.4, packetLoss150m: 0.8, adjacentVehicles: 3, channelBusy: 11.5, avgDelay: 20.5, throughput: 92.3, blindSpot: 4.9, avoidanceSuccess: 94.2, earlyWarning: 1.8 },
  { speed: 70, density: 100, success50m: 98.4, success150m: 96.0, packetLoss150m: 0.9, adjacentVehicles: 3, channelBusy: 12.3, avgDelay: 22.0, throughput: 93.8, blindSpot: 5.3, avoidanceSuccess: 93.5, earlyWarning: 1.6 },
  { speed: 80, density: 100, success50m: 98.1, success150m: 95.5, packetLoss150m: 1.1, adjacentVehicles: 3, channelBusy: 13.0, avgDelay: 23.5, throughput: 95.0, blindSpot: 5.7, avoidanceSuccess: 92.8, earlyWarning: 1.5 },
  { speed: 90, density: 100, success50m: 97.8, success150m: 95.1, packetLoss150m: 1.3, adjacentVehicles: 3, channelBusy: 13.8, avgDelay: 25.0, throughput: 96.0, blindSpot: 6.1, avoidanceSuccess: 92.0, earlyWarning: 1.4 },
  { speed: 100, density: 100, success50m: 97.5, success150m: 94.6, packetLoss150m: 1.5, adjacentVehicles: 4, channelBusy: 14.5, avgDelay: 26.5, throughput: 96.8, blindSpot: 6.5, avoidanceSuccess: 91.2, earlyWarning: 1.3 },
  { speed: 110, density: 100, success50m: 97.1, success150m: 94.2, packetLoss150m: 1.7, adjacentVehicles: 4, channelBusy: 15.2, avgDelay: 28.0, throughput: 97.2, blindSpot: 6.9, avoidanceSuccess: 90.5, earlyWarning: 1.2 },
  { speed: 120, density: 100, success50m: 96.8, success150m: 93.8, packetLoss150m: 1.9, adjacentVehicles: 4, channelBusy: 16.0, avgDelay: 29.5, throughput: 97.5, blindSpot: 7.3, avoidanceSuccess: 89.8, earlyWarning: 1.1 },

  // 车辆密度 150 veh/km
  { speed: 20, density: 150, success50m: 99.2, success150m: 97.0, packetLoss150m: 0.6, adjacentVehicles: 3, channelBusy: 11.5, avgDelay: 18.2, throughput: 78.5, blindSpot: 4.8, avoidanceSuccess: 95.8, earlyWarning: 2.2 },
  { speed: 30, density: 150, success50m: 99.0, success150m: 96.6, packetLoss150m: 0.7, adjacentVehicles: 3, channelBusy: 12.3, avgDelay: 19.8, throughput: 81.8, blindSpot: 5.2, avoidanceSuccess: 95.0, earlyWarning: 2.0 },
  { speed: 40, density: 150, success50m: 98.7, success150m: 96.2, packetLoss150m: 0.8, adjacentVehicles: 4, channelBusy: 13.2, avgDelay: 21.5, throughput: 84.8, blindSpot: 5.6, avoidanceSuccess: 94.2, earlyWarning: 1.8 },
  { speed: 50, density: 150, success50m: 98.4, success150m: 95.8, packetLoss150m: 0.9, adjacentVehicles: 4, channelBusy: 14.0, avgDelay: 23.2, throughput: 87.2, blindSpot: 6.1, avoidanceSuccess: 93.5, earlyWarning: 1.7 },
  { speed: 60, density: 150, success50m: 98.1, success150m: 95.4, packetLoss150m: 1.0, adjacentVehicles: 4, channelBusy: 14.8, avgDelay: 25.0, throughput: 89.5, blindSpot: 6.5, avoidanceSuccess: 92.5, earlyWarning: 1.5 },
  { speed: 70, density: 150, success50m: 97.8, success150m: 94.9, packetLoss150m: 1.2, adjacentVehicles: 4, channelBusy: 15.6, avgDelay: 26.8, throughput: 91.2, blindSpot: 7.0, avoidanceSuccess: 91.5, earlyWarning: 1.4 },
  { speed: 80, density: 150, success50m: 97.4, success150m: 94.4, packetLoss150m: 1.4, adjacentVehicles: 5, channelBusy: 16.5, avgDelay: 28.5, throughput: 92.8, blindSpot: 7.5, avoidanceSuccess: 90.5, earlyWarning: 1.3 },
  { speed: 90, density: 150, success50m: 97.0, success150m: 93.9, packetLoss150m: 1.6, adjacentVehicles: 5, channelBusy: 17.3, avgDelay: 30.2, throughput: 94.0, blindSpot: 8.0, avoidanceSuccess: 89.5, earlyWarning: 1.2 },
  { speed: 100, density: 150, success50m: 96.6, success150m: 93.4, packetLoss150m: 1.8, adjacentVehicles: 5, channelBusy: 18.2, avgDelay: 32.0, throughput: 95.0, blindSpot: 8.5, avoidanceSuccess: 88.5, earlyWarning: 1.1 },
  { speed: 110, density: 150, success50m: 96.2, success150m: 92.9, packetLoss150m: 2.0, adjacentVehicles: 5, channelBusy: 19.0, avgDelay: 33.8, throughput: 95.8, blindSpot: 9.0, avoidanceSuccess: 87.5, earlyWarning: 1.0 },
  { speed: 120, density: 150, success50m: 95.8, success150m: 92.5, packetLoss150m: 2.2, adjacentVehicles: 5, channelBusy: 19.8, avgDelay: 35.5, throughput: 96.2, blindSpot: 9.5, avoidanceSuccess: 86.5, earlyWarning: 0.9 },

  // 车辆密度 200 veh/km
  { speed: 20, density: 200, success50m: 98.8, success150m: 96.2, packetLoss150m: 0.8, adjacentVehicles: 4, channelBusy: 14.5, avgDelay: 21.5, throughput: 74.2, blindSpot: 6.0, avoidanceSuccess: 94.2, earlyWarning: 1.9 },
  { speed: 30, density: 200, success50m: 98.5, success150m: 95.8, packetLoss150m: 0.9, adjacentVehicles: 4, channelBusy: 15.3, avgDelay: 23.2, throughput: 77.5, blindSpot: 6.5, avoidanceSuccess: 93.2, earlyWarning: 1.7 },
  { speed: 40, density: 200, success50m: 98.2, success150m: 95.3, packetLoss150m: 1.0, adjacentVehicles: 5, channelBusy: 16.2, avgDelay: 25.0, throughput: 80.5, blindSpot: 7.0, avoidanceSuccess: 92.2, earlyWarning: 1.5 },
  { speed: 50, density: 200, success50m: 97.8, success150m: 94.8, packetLoss150m: 1.1, adjacentVehicles: 5, channelBusy: 17.0, avgDelay: 26.8, throughput: 83.2, blindSpot: 7.5, avoidanceSuccess: 91.2, earlyWarning: 1.4 },
  { speed: 60, density: 200, success50m: 97.4, success150m: 94.3, packetLoss150m: 1.3, adjacentVehicles: 5, channelBusy: 17.8, avgDelay: 28.5, throughput: 85.5, blindSpot: 8.0, avoidanceSuccess: 90.0, earlyWarning: 1.2 },
  { speed: 70, density: 200, success50m: 97.0, success150m: 93.8, packetLoss150m: 1.5, adjacentVehicles: 5, channelBusy: 18.6, avgDelay: 30.5, throughput: 87.5, blindSpot: 8.5, avoidanceSuccess: 88.8, earlyWarning: 1.1 },
  { speed: 80, density: 200, success50m: 96.5, success150m: 93.2, packetLoss150m: 1.7, adjacentVehicles: 6, channelBusy: 19.5, avgDelay: 32.5, throughput: 89.2, blindSpot: 9.0, avoidanceSuccess: 87.5, earlyWarning: 1.0 },
  { speed: 90, density: 200, success50m: 96.0, success150m: 92.6, packetLoss150m: 1.9, adjacentVehicles: 6, channelBusy: 20.3, avgDelay: 34.5, throughput: 90.8, blindSpot: 9.5, avoidanceSuccess: 86.2, earlyWarning: 0.9 },
  { speed: 100, density: 200, success50m: 95.5, success150m: 92.0, packetLoss150m: 2.1, adjacentVehicles: 6, channelBusy: 21.2, avgDelay: 36.5, throughput: 92.0, blindSpot: 10.0, avoidanceSuccess: 85.0, earlyWarning: 0.8 },
  { speed: 110, density: 200, success50m: 95.0, success150m: 91.4, packetLoss150m: 2.4, adjacentVehicles: 6, channelBusy: 22.0, avgDelay: 38.5, throughput: 93.0, blindSpot: 10.5, avoidanceSuccess: 83.8, earlyWarning: 0.7 },
  { speed: 120, density: 200, success50m: 94.5, success150m: 90.8, packetLoss150m: 2.7, adjacentVehicles: 6, channelBusy: 22.8, avgDelay: 40.5, throughput: 93.8, blindSpot: 11.0, avoidanceSuccess: 82.5, earlyWarning: 0.6 },

  // 车辆密度 250 veh/km
  { speed: 20, density: 250, success50m: 98.4, success150m: 95.3, packetLoss150m: 1.0, adjacentVehicles: 5, channelBusy: 17.5, avgDelay: 24.8, throughput: 70.0, blindSpot: 7.2, avoidanceSuccess: 92.5, earlyWarning: 1.6 },
  { speed: 30, density: 250, success50m: 98.0, success150m: 94.8, packetLoss150m: 1.1, adjacentVehicles: 5, channelBusy: 18.3, avgDelay: 26.8, throughput: 73.2, blindSpot: 7.8, avoidanceSuccess: 91.2, earlyWarning: 1.4 },
  { speed: 40, density: 250, success50m: 97.6, success150m: 94.3, packetLoss150m: 1.2, adjacentVehicles: 6, channelBusy: 19.2, avgDelay: 28.8, throughput: 76.2, blindSpot: 8.4, avoidanceSuccess: 90.0, earlyWarning: 1.2 },
  { speed: 50, density: 250, success50m: 97.2, success150m: 93.8, packetLoss150m: 1.4, adjacentVehicles: 6, channelBusy: 20.0, avgDelay: 30.8, throughput: 78.8, blindSpot: 9.0, avoidanceSuccess: 88.5, earlyWarning: 1.1 },
  { speed: 60, density: 250, success50m: 96.7, success150m: 93.2, packetLoss150m: 1.6, adjacentVehicles: 6, channelBusy: 20.8, avgDelay: 33.0, throughput: 81.2, blindSpot: 9.6, avoidanceSuccess: 87.0, earlyWarning: 1.0 },
  { speed: 70, density: 250, success50m: 96.2, success150m: 92.6, packetLoss150m: 1.8, adjacentVehicles: 6, channelBusy: 21.6, avgDelay: 35.2, throughput: 83.5, blindSpot: 10.2, avoidanceSuccess: 85.5, earlyWarning: 0.9 },
  { speed: 80, density: 250, success50m: 95.6, success150m: 91.9, packetLoss150m: 2.0, adjacentVehicles: 7, channelBusy: 22.5, avgDelay: 37.5, throughput: 85.5, blindSpot: 10.8, avoidanceSuccess: 84.0, earlyWarning: 0.8 },
  { speed: 90, density: 250, success50m: 95.0, success150m: 91.2, packetLoss150m: 2.3, adjacentVehicles: 7, channelBusy: 23.3, avgDelay: 39.8, throughput: 87.2, blindSpot: 11.4, avoidanceSuccess: 82.5, earlyWarning: 0.7 },
  { speed: 100, density: 250, success50m: 94.4, success150m: 90.5, packetLoss150m: 2.6, adjacentVehicles: 7, channelBusy: 24.2, avgDelay: 42.0, throughput: 88.8, blindSpot: 12.0, avoidanceSuccess: 81.0, earlyWarning: 0.6 },
  { speed: 110, density: 250, success50m: 93.8, success150m: 89.8, packetLoss150m: 2.9, adjacentVehicles: 7, channelBusy: 25.0, avgDelay: 44.2, throughput: 90.0, blindSpot: 12.6, avoidanceSuccess: 79.5, earlyWarning: 0.5 },
  { speed: 120, density: 250, success50m: 93.2, success150m: 89.1, packetLoss150m: 3.2, adjacentVehicles: 7, channelBusy: 25.8, avgDelay: 46.5, throughput: 91.0, blindSpot: 13.2, avoidanceSuccess: 78.0, earlyWarning: 0.4 },

  // 车辆密度 300 veh/km
  { speed: 20, density: 300, success50m: 98.0, success150m: 94.5, packetLoss150m: 1.2, adjacentVehicles: 6, channelBusy: 20.5, avgDelay: 28.2, throughput: 65.5, blindSpot: 8.5, avoidanceSuccess: 90.5, earlyWarning: 1.3 },
  { speed: 30, density: 300, success50m: 97.5, success150m: 93.9, packetLoss150m: 1.3, adjacentVehicles: 6, channelBusy: 21.3, avgDelay: 30.5, throughput: 68.8, blindSpot: 9.2, avoidanceSuccess: 89.0, earlyWarning: 1.1 },
  { speed: 40, density: 300, success50m: 97.0, success150m: 93.3, packetLoss150m: 1.5, adjacentVehicles: 7, channelBusy: 22.2, avgDelay: 32.8, throughput: 71.8, blindSpot: 9.9, avoidanceSuccess: 87.5, earlyWarning: 1.0 },
  { speed: 50, density: 300, success50m: 96.5, success150m: 92.7, packetLoss150m: 1.7, adjacentVehicles: 7, channelBusy: 23.0, avgDelay: 35.2, throughput: 74.5, blindSpot: 10.6, avoidanceSuccess: 85.8, earlyWarning: 0.9 },
  { speed: 60, density: 300, success50m: 95.9, success150m: 92.0, packetLoss150m: 1.9, adjacentVehicles: 7, channelBusy: 23.8, avgDelay: 37.5, throughput: 77.0, blindSpot: 11.3, avoidanceSuccess: 84.0, earlyWarning: 0.8 },
  { speed: 70, density: 300, success50m: 95.3, success150m: 91.3, packetLoss150m: 2.1, adjacentVehicles: 7, channelBusy: 24.6, avgDelay: 40.0, throughput: 79.2, blindSpot: 12.0, avoidanceSuccess: 82.2, earlyWarning: 0.7 },
  { speed: 80, density: 300, success50m: 94.6, success150m: 90.5, packetLoss150m: 2.4, adjacentVehicles: 8, channelBusy: 25.5, avgDelay: 42.5, throughput: 81.5, blindSpot: 12.7, avoidanceSuccess: 80.5, earlyWarning: 0.6 },
  { speed: 90, density: 300, success50m: 93.9, success150m: 89.7, packetLoss150m: 2.7, adjacentVehicles: 8, channelBusy: 26.3, avgDelay: 45.0, throughput: 83.5, blindSpot: 13.4, avoidanceSuccess: 78.8, earlyWarning: 0.5 },
  { speed: 100, density: 300, success50m: 93.2, success150m: 88.9, packetLoss150m: 3.0, adjacentVehicles: 8, channelBusy: 27.2, avgDelay: 47.5, throughput: 85.2, blindSpot: 14.1, avoidanceSuccess: 77.0, earlyWarning: 0.4 },
  { speed: 110, density: 300, success50m: 92.5, success150m: 88.1, packetLoss150m: 3.3, adjacentVehicles: 8, channelBusy: 28.0, avgDelay: 50.0, throughput: 86.8, blindSpot: 14.8, avoidanceSuccess: 75.2, earlyWarning: 0.3 },
  { speed: 120, density: 300, success50m: 91.8, success150m: 87.3, packetLoss150m: 3.6, adjacentVehicles: 8, channelBusy: 28.8, avgDelay: 52.5, throughput: 88.0, blindSpot: 15.5, avoidanceSuccess: 73.5, earlyWarning: 0.2 }
]

// 场景配置数据
export const sceneConfigs = {
  urban: {
    name: '城市道路',
    description: '高密度车流，多路口交叉',
    icon: 'Location',
    speedRange: [20, 60],
    densityRange: [100, 300],
    roadLayout: 'crossroad',
    blindTypes: ['building', 'vehicle'],
    highlightMetrics: ['avoidanceSuccess', 'earlyWarning'],
    roadColor: '#3a4a5c',
    laneCount: 4
  },
  expressway: {
    name: '快速路',
    description: '中高速行驶，交通流稳定',
    icon: 'Location',
    speedRange: [60, 90],
    densityRange: [50, 200],
    roadLayout: 'straight',
    blindTypes: ['intersection', 'vehicle'],
    highlightMetrics: ['packetLoss150m', 'throughput'],
    roadColor: '#2d3a4a',
    laneCount: 3
  },
  highway: {
    name: '高速公路',
    description: '高速长距离行驶',
    icon: 'Location',
    speedRange: [90, 120],
    densityRange: [50, 150],
    roadLayout: 'longStraight',
    blindTypes: ['truck'],
    highlightMetrics: ['earlyWarning', 'blindSpot'],
    roadColor: '#1e2a3a',
    laneCount: 4
  },
  ramp: {
    name: '匝道',
    description: '弯道较多，车速较低',
    icon: 'Location',
    speedRange: [30, 50],
    densityRange: [50, 150],
    roadLayout: 'curve',
    blindTypes: ['curve', 'ramp'],
    highlightMetrics: ['avoidanceSuccess', 'avgDelay'],
    roadColor: '#35404a',
    laneCount: 2
  },
  tunnel: {
    name: '隧道',
    description: '封闭空间，通信受限',
    icon: 'Location',
    speedRange: [40, 80],
    densityRange: [50, 200],
    roadLayout: 'tunnel',
    blindTypes: ['tunnel', 'signal'],
    highlightMetrics: ['success150m', 'channelBusy'],
    roadColor: '#1a2530',
    laneCount: 3
  }
}

// 字段名称映射（中文到英文）
export const fieldMappings = {
  '车速': 'speed',
  '车辆密度': 'density',
  '50米消息接收成功率': 'success50m',
  '150米消息接收成功率': 'success150m',
  '150米丢包率': 'packetLoss150m',
  '相邻车辆数': 'adjacentVehicles',
  '信道忙碌率': 'channelBusy',
  '平均消息时延': 'avgDelay',
  '吞吐量': 'throughput',
  '无线盲区指标': 'blindSpot',
  '避让成功率': 'avoidanceSuccess',
  '提前预警时间': 'earlyWarning'
}

// 必填字段列表
export const requiredFields = [
  'speed', 'density', 'success50m', 'success150m', 'packetLoss150m',
  'adjacentVehicles', 'channelBusy', 'avgDelay', 'throughput',
  'blindSpot', 'avoidanceSuccess', 'earlyWarning'
]
