<template>
  <div class="app-container">
    <!-- 装饰背景 -->
    <div class="bg-decoration">
      <div class="bg-grid"></div>
      <div class="bg-glow bg-glow-1"></div>
      <div class="bg-glow bg-glow-2"></div>
    </div>

    <!-- 顶部标题栏 -->
    <header class="header">
      <div class="header-left">
        <div class="logo-wrapper">
          <img src="/favicon.svg" alt="5G-V2X" class="header-logo">
          <div class="logo-glow"></div>
        </div>
        <h1 class="header-title">
          <span class="title-main">5G-V2X 智能车联网</span>
          <span class="title-sub">超视距协同避让可视化系统</span>
        </h1>
      </div>
      <div class="header-right">
        <el-button 
          class="action-btn simulation-btn" 
          @click="openSimulation"
        >
          <el-icon><Van /></el-icon>
          车辆模拟行驶训练
        </el-button>
        <el-button 
          v-if="currentModule === 'heatmap'" 
          class="action-btn heatmap-btn" 
          @click="switchModule('avoidance')"
        >
          <el-icon><Back /></el-icon>
          返回协同避让
        </el-button>
        <el-button 
          v-else 
          class="action-btn heatmap-btn" 
          @click="switchModule('heatmap')"
        >
          <el-icon><DataLine /></el-icon>
          交通风险热力地图
        </el-button>
        <el-button 
          class="action-btn reset-btn" 
          @click="handleReset" 
          :disabled="isCollided"
        >
          <el-icon><RefreshRight /></el-icon>
          重置模拟
        </el-button>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <Transition name="module-fade" mode="out-in">
        <!-- 协同避让模块 -->
        <div v-if="currentModule === 'avoidance'" class="module-wrapper" key="avoidance">
          <!-- 左侧控制区 -->
          <aside class="left-panel">
            <div class="scroll-container">
            <!-- 场景切换卡片 -->
            <div class="control-card scene-card">
              <div class="card-header">
                <div class="header-icon"><el-icon><Location /></el-icon></div>
                <span>场景切换</span>
                <div class="scroll-mode-indicator">
                  <el-icon><ArrowRight /></el-icon>
                  <span>可滚动切换</span>
                </div>
              </div>
              <div class="scene-selector">
                <div class="scene-preview">
                  <div class="scene-icon" :class="currentScene">
                    <el-icon><component :is="currentSceneConfig.icon || 'Location'" /></el-icon>
                  </div>
                  <div class="scene-info">
                    <div class="scene-name">{{ currentSceneConfig.name }}</div>
                    <div class="scene-desc">{{ currentSceneConfig.description }}</div>
                  </div>
                </div>
                <div class="scene-scroll-container">
                  <div class="scene-buttons-scroll">
                    <el-button
                      v-for="(config, key) in sceneConfigs"
                      :key="key"
                      :class="['scene-btn-scroll', { active: currentScene === key }]"
                      @click="handleSceneChange(key)"
                    >
                      <el-icon class="scene-btn-icon-scroll"><component :is="config.icon || 'Location'" /></el-icon>
                      <div class="scene-btn-content">
                        <div class="scene-btn-name">{{ config.name }}</div>
                        <div class="scene-btn-speed">{{ config.speedRange[0] }}-{{ config.speedRange[1] }}km/h</div>
                      </div>
                    </el-button>
                  </div>
                  <div class="scroll-hint">
                    <el-icon><CaretRight /></el-icon>
                    <span>左右滑动查看更多场景</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 参数调节卡片 -->
            <div class="control-card param-card">
              <div class="card-header">
                <div class="header-icon"><el-icon><Setting /></el-icon></div>
                <span>参数调节</span>
              </div>

              <!-- 行驶车速 -->
              <div class="param-item speed-param">
                <div class="param-header">
                  <div class="param-info">
                    <span class="param-name">行驶车速</span>
                    <span class="param-range">{{ currentSceneConfig.speedRange[0] }} - {{ currentSceneConfig.speedRange[1] }} km/h</span>
                  </div>
                  <span class="param-value">{{ speed }} <small>km/h</small></span>
                </div>
                <div class="slider-container">
                  <div class="slider-markers">
                    <span v-for="(marker, idx) in getSpeedMarkers()" :key="idx" class="marker" :class="{ active: marker <= speed }">
                      {{ marker }}
                    </span>
                  </div>
                  <el-slider
                    v-model="speed"
                    :min="currentSceneConfig.speedRange[0]"
                    :max="currentSceneConfig.speedRange[1]"
                    :step="10"
                    :disabled="isCollided"
                    @change="handleParamChange"
                    class="enhanced-slider"
                  />
                </div>
                <div class="speed-indicator" :class="getSpeedLevel(speed)">
                  {{ getSpeedLevelText(speed) }}
                </div>
              </div>

              <!-- 车辆密度 -->
              <div class="param-item density-param">
                <div class="param-header">
                  <div class="param-info">
                    <span class="param-name">车辆密度</span>
                    <span class="param-range">{{ currentSceneConfig.densityRange[0] }} - {{ currentSceneConfig.densityRange[1] }} veh/km</span>
                  </div>
                  <span class="param-value">{{ density }} <small>veh/km</small></span>
                </div>
                <div class="slider-container">
                  <div class="slider-markers">
                    <span v-for="(marker, idx) in getDensityMarkers()" :key="idx" class="marker" :class="{ active: marker <= density }">
                      {{ marker }}
                    </span>
                  </div>
                  <el-slider
                    v-model="density"
                    :min="currentSceneConfig.densityRange[0]"
                    :max="currentSceneConfig.densityRange[1]"
                    :step="50"
                    :disabled="isCollided"
                    @change="handleParamChange"
                    class="enhanced-slider"
                  />
                </div>
                <div class="density-indicator" :class="getDensityLevel(density)">
                  {{ getDensityLevelText(density) }}
                </div>
              </div>
            </div>

            <!-- 预警阈值卡片 -->
            <div class="control-card threshold-card">
              <div class="card-header">
                <div class="header-icon warning"><el-icon><Warning /></el-icon></div>
                <span>预警阈值设置</span>
              </div>

              <!-- 阈值说明 -->
              <div class="threshold-help">
                <el-icon><InfoFilled /></el-icon>
                <span>一级预警：注意警戒，二级预警：危险警报</span>
              </div>

              <!-- 一级预警阈值 -->
              <div class="param-item threshold-l1">
                <div class="param-header">
                  <div class="param-info">
                    <div class="threshold-title">
                      <span class="param-name warning-l1">一级预警阈值</span>
                      <span class="threshold-badge warning-l1">注意警戒</span>
                    </div>
                    <div class="threshold-desc">当避让成功率低于此阈值时，触发一级预警</div>
                  </div>
                  <span class="param-value warning-l1">{{ level1Threshold }}%</span>
                </div>
                <div class="slider-container">
                  <div class="slider-markers">
                    <span v-for="marker in [20, 40, 60, 80, 100]" :key="marker" class="marker" :class="{ active: marker <= level1Threshold }">
                      {{ marker }}
                    </span>
                  </div>
                  <el-slider
                    v-model="level1Threshold"
                    :min="20"
                    :max="100"
                    :step="5"
                    :disabled="isCollided"
                    @change="handleThresholdChange('level1')"
                    class="threshold-slider warning-l1"
                  />
                </div>
                <div class="threshold-indicator warning-l1">
                  {{ getLevel1Status(level1Threshold) }}
                </div>
              </div>

              <!-- 二级预警阈值 -->
              <div class="param-item threshold-l2">
                <div class="param-header">
                  <div class="param-info">
                    <div class="threshold-title">
                      <span class="param-name warning-l2">二级预警阈值</span>
                      <span class="threshold-badge warning-l2">危险警报</span>
                    </div>
                    <div class="threshold-desc">当避让成功率低于此阈值时，触发二级预警</div>
                  </div>
                  <span class="param-value warning-l2">{{ level2Threshold }}%</span>
                </div>
                <div class="slider-container">
                  <div class="slider-markers">
                    <span v-for="marker in [0, 20, 40, 60, 80]" :key="marker" class="marker" :class="{ active: marker <= level2Threshold }">
                      {{ marker }}
                    </span>
                  </div>
                  <el-slider
                    v-model="level2Threshold"
                    :min="0"
                    :max="80"
                    :step="5"
                    :disabled="isCollided"
                    @change="handleThresholdChange('level2')"
                    class="threshold-slider warning-l2"
                  />
                </div>
                <div class="threshold-indicator warning-l2">
                  {{ getLevel2Status(level2Threshold) }}
                </div>
              </div>

              <!-- 阈值验证 -->
              <div class="threshold-validation" :class="{ error: level1Threshold <= level2Threshold }">
                <div class="validation-icon">
                  <el-icon v-if="level1Threshold > level2Threshold"><CircleCheck /></el-icon>
                  <el-icon v-else><CircleCloseFilled /></el-icon>
                </div>
                <div class="validation-content">
                  <div class="validation-title">
                    {{ level1Threshold > level2Threshold ? '阈值设置有效' : '阈值设置无效' }}
                  </div>
                  <div class="validation-desc">
                    {{ level1Threshold > level2Threshold 
                      ? `一级预警阈值(${level1Threshold}%) > 二级预警阈值(${level2Threshold}%)` 
                      : '一级阈值必须大于二级阈值' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 数据上传卡片 -->
            <div class="control-card data-upload-card">
              <div class="card-header">
                <div class="header-icon"><el-icon><Upload /></el-icon></div>
                <span>仿真数据上传</span>
              </div>
              
              <!-- 上传功能区域 -->
              <div class="upload-function-area">
                <el-upload
                  ref="uploadRef"
                  class="data-upload-enhanced"
                  drag
                  :auto-upload="false"
                  :show-file-list="false"
                  accept=".xls,.xlsx"
                  :on-change="handleFileUpload"
                >
                  <div class="upload-dropzone">
                    <div class="upload-icon-wrapper">
                      <el-icon class="upload-icon-large"><UploadFilled /></el-icon>
                    </div>
                    <div class="upload-main-text">上传仿真数据文件</div>
                    <div class="upload-sub-text">点击或拖拽 Excel 文件到此处</div>
                    <div class="upload-format-info">支持格式：.xls, .xlsx</div>
                  </div>
                </el-upload>
                
                <div class="upload-actions">
                  <el-button 
                    class="upload-action-btn" 
                    @click="triggerFileUpload"
                    :disabled="isCollided"
                  >
                    <el-icon><FolderOpened /></el-icon>
                    选择文件
                  </el-button>
                  <el-button 
                    class="upload-action-btn reset-btn"
                    @click="resetUploadData"
                    :disabled="simulationData.length === defaultSimulationData.length"
                  >
                    <el-icon><Delete /></el-icon>
                    清空数据
                  </el-button>
                </div>
              </div>
              
              <!-- 数据状态展示 -->
              <div class="data-status-area">
                <div class="data-status-header">
                  <el-icon class="status-icon"><DataLine /></el-icon>
                  <span class="status-title">数据状态</span>
                </div>
                
                <div class="data-status-info">
                  <div class="status-item">
                    <div class="status-label">数据源</div>
                    <div class="status-value">
                      <span class="status-badge" :class="getDataSourceBadgeClass()">
                        {{ getDataSourceText() }}
                      </span>
                    </div>
                  </div>
                  
                  <div class="status-item">
                    <div class="status-label">数据记录</div>
                    <div class="status-value">{{ simulationData.length }} 条</div>
                  </div>
                  
                  <div class="status-item">
                    <div class="status-label">数据覆盖</div>
                    <div class="status-value">
                      <div class="coverage-bar">
                        <div class="coverage-fill" :style="{ width: getDataCoverage() + '%' }"></div>
                        <div class="coverage-text">{{ getDataCoverage().toFixed(1) }}%</div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="status-item">
                    <div class="status-label">更新时间</div>
                    <div class="status-value">{{ getLastUpdateTime() }}</div>
                  </div>
                </div>
              </div>
              
              <!-- 数据预览 -->
              <div class="data-preview-area" v-if="simulationData.length > 0">
                <div class="preview-header">
                  <el-icon><View /></el-icon>
                  <span>数据预览</span>
                  <el-button 
                    size="small" 
                    class="preview-toggle"
                    @click="toggleDataPreview"
                  >
                    {{ showDataPreview ? '收起' : '展开' }}
                    <el-icon><ArrowDown v-if="!showDataPreview" /><ArrowUp v-else /></el-icon>
                  </el-button>
                </div>
                
                <div class="preview-content" v-if="showDataPreview">
                  <div class="preview-table-container">
                    <table class="preview-table">
                      <thead>
                        <tr>
                          <th>车速 (km/h)</th>
                          <th>密度 (veh/km)</th>
                          <th>避让成功率 (%)</th>
                          <th>提前预警 (s)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(item, index) in getPreviewData()" :key="index">
                          <td>{{ item.speed }}</td>
                          <td>{{ item.density }}</td>
                          <td :class="getSuccessClass(item.avoidanceSuccess)">
                            {{ item.avoidanceSuccess?.toFixed(2) }}
                          </td>
                          <td>{{ item.earlyWarning?.toFixed(2) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div class="preview-summary">
                    <span>显示 {{ getPreviewData().length }} 条记录</span>
                    <el-button 
                      size="small" 
                      type="primary" 
                      @click="exportData"
                      v-if="simulationData.length > defaultSimulationData.length"
                    >
                      <el-icon><Download /></el-icon>
                      导出数据
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
            </div> <!-- 关闭滚动容器 -->
          </aside>

          <!-- 主可视化画布区 -->
          <section class="canvas-section">
            <div class="canvas-wrapper">
              <div class="canvas-border"></div>
              <VisualizationCanvas
                ref="canvasRef"
                :scene="currentScene"
                :sceneConfig="currentSceneConfig"
                :speed="speed"
                :density="density"
                :warningLevel="warningLevel"
                :isCollided="isCollided"
                @collision-triggered="handleCollision"
              />
            </div>
          </section>

          <!-- 右侧指标面板 -->
          <aside class="right-panel">
            <div class="scroll-container">
              <!-- 性能指标对比 -->
              <div class="indicator-card">
                <div class="card-header">
                  <div class="header-icon"><el-icon><DataLine /></el-icon></div>
                  <span>性能指标对比</span>
                </div>
                <div class="chart-container">
                  <div ref="barChartRef" class="bar-chart"></div>
                </div>
                <div class="legend-row">
                  <div class="legend-item">
                    <span class="legend-color real"></span>
                    <span>真实值</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-color adjusted"></span>
                    <span>调整后</span>
                  </div>
                </div>

                <!-- 参数调整 -->
                <div class="param-section">
                  <div class="param-title">参数调整</div>
                  
                  <div class="slider-group">
                    <div class="slider-label">
                      <span>刹车反应时间</span>
                      <span class="slider-value">{{ brakeReactionTime.toFixed(2) }} 秒</span>
                    </div>
                    <input 
                      type="range" 
                      v-model.number="brakeReactionTime" 
                      min="0.1" 
                      max="1.5" 
                      step="0.05"
                      class="custom-slider"
                    />
                    <div class="slider-hint">
                      <span>更快 ←</span>
                      <span>→ 更慢</span>
                    </div>
                  </div>

                  <div class="slider-group">
                    <div class="slider-label">
                      <span>V2X通信延迟</span>
                      <span class="slider-value">{{ v2xDelay.toFixed(0) }} ms</span>
                    </div>
                    <input 
                      type="range" 
                      v-model.number="v2xDelay" 
                      min="0" 
                      max="200" 
                      step="5"
                      class="custom-slider"
                    />
                    <div class="slider-hint">
                      <span>更快 ←</span>
                      <span>→ 更慢</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 基础工况指标 -->
              <div class="indicator-card">
              <div class="card-header">
                <div class="header-icon"><el-icon><Monitor /></el-icon></div>
                <span>基础工况指标</span>
              </div>
              <div class="indicator-grid two-col">
                <div class="indicator-item main">
                  <div class="ind-value">{{ speed }}</div>
                  <div class="ind-unit">km/h</div>
                  <div class="ind-label">行驶车速</div>
                </div>
                <div class="indicator-item main">
                  <div class="ind-value">{{ density }}</div>
                  <div class="ind-unit">veh/km</div>
                  <div class="ind-label">车辆密度</div>
                </div>
              </div>
            </div>

            <!-- 通信性能指标 -->
            <div class="indicator-card">
              <div class="card-header">
                <div class="header-icon"><el-icon><Connection /></el-icon></div>
                <span>通信性能指标</span>
              </div>
              <div class="indicator-grid">
                <div class="indicator-item" :class="{ highlight: currentSceneConfig.highlightMetrics.includes('success50m') }">
                  <div class="ind-value">{{ currentData?.success50m?.toFixed(2) || '--' }}</div>
                  <div class="ind-unit">%</div>
                  <div class="ind-label">50米接收成功率</div>
                </div>
                <div class="indicator-item" :class="{ highlight: currentSceneConfig.highlightMetrics.includes('success150m') }">
                  <div class="ind-value">{{ currentData?.success150m?.toFixed(2) || '--' }}</div>
                  <div class="ind-unit">%</div>
                  <div class="ind-label">150米接收成功率</div>
                </div>
                <div class="indicator-item" :class="{ highlight: currentSceneConfig.highlightMetrics.includes('packetLoss150m') }">
                  <div class="ind-value">{{ currentData?.packetLoss150m?.toFixed(2) || '--' }}</div>
                  <div class="ind-unit">%</div>
                  <div class="ind-label">150米丢包率</div>
                </div>
                <div class="indicator-item" :class="{ highlight: currentSceneConfig.highlightMetrics.includes('avgDelay') }">
                  <div class="ind-value">{{ currentData?.avgDelay?.toFixed(2) || '--' }}</div>
                  <div class="ind-unit">ms</div>
                  <div class="ind-label">平均消息时延</div>
                </div>
                <div class="indicator-item" :class="{ highlight: currentSceneConfig.highlightMetrics.includes('throughput') }">
                  <div class="ind-value">{{ currentData?.throughput?.toFixed(2) || '--' }}</div>
                  <div class="ind-unit">Mbps</div>
                  <div class="ind-label">吞吐量</div>
                </div>
                <div class="indicator-item" :class="{ highlight: currentSceneConfig.highlightMetrics.includes('channelBusy') }">
                  <div class="ind-value">{{ currentData?.channelBusy?.toFixed(2) || '--' }}</div>
                  <div class="ind-unit">%</div>
                  <div class="ind-label">信道忙碌率</div>
                </div>
              </div>
            </div>

            <!-- 安全性能指标 -->
            <div class="indicator-card">
              <div class="card-header">
                <div class="header-icon"><el-icon><User /></el-icon></div>
                <span>安全性能指标</span>
              </div>
              <div class="indicator-grid">
                <div class="indicator-item">
                  <div class="ind-value">{{ currentData?.adjacentVehicles ?? '--' }}</div>
                  <div class="ind-unit">辆</div>
                  <div class="ind-label">相邻车辆数</div>
                </div>
                <div class="indicator-item">
                  <div class="ind-value">{{ currentData?.blindSpot?.toFixed(2) || '--' }}</div>
                  <div class="ind-unit">%</div>
                  <div class="ind-label">无线盲区指标</div>
                </div>
                <div class="indicator-item" :class="{ 'warning-highlight': warningLevel === 'level1', 'danger-highlight': warningLevel === 'level2' }">
                  <div class="ind-value">{{ currentData?.avoidanceSuccess?.toFixed(2) || '--' }}</div>
                  <div class="ind-unit">%</div>
                  <div class="ind-label">避让成功率</div>
                </div>
                <div class="indicator-item">
                  <div class="ind-value">{{ currentData?.earlyWarning?.toFixed(2) || '--' }}</div>
                  <div class="ind-unit">s</div>
                  <div class="ind-label">提前预警时间</div>
                </div>
              </div>
            </div>

            <!-- 预警状态展示区域 -->
            <div class="warning-status-container">
              <!-- 一级预警状态 -->
              <div class="warning-status-card" :class="{ active: warningLevel === 'level1' || warningLevel === 'level2' }">
                <div class="warning-status-header">
                  <div class="warning-status-icon warning-l1">
                    <el-icon><WarningFilled /></el-icon>
                  </div>
                  <div class="warning-status-info">
                    <div class="warning-status-title">一级预警状态</div>
                    <div class="warning-status-subtitle">注意警戒</div>
                  </div>
                </div>
                <div class="warning-status-content">
                  <div class="warning-status-text">
                    {{ warningLevel === 'level1' || warningLevel === 'level2' 
                      ? '当前避让成功率低于安全阈值，存在碰撞风险' 
                      : '当前安全状态良好' }}
                  </div>
                  <div class="warning-status-data">
                    <div class="warning-threshold" data-label="阈值">{{ level1Threshold }}%</div>
                    <div class="warning-current" data-label="当前">{{ currentData?.avoidanceSuccess?.toFixed(2) || '--' }}%</div>
                  </div>
                </div>
                <div class="warning-status-indicator" :class="{ active: warningLevel === 'level1' || warningLevel === 'level2' }">
                  <div class="indicator-bar">
                    <div class="indicator-fill" :style="{ width: `${Math.min(100, Math.max(0, currentData?.avoidanceSuccess || 0))}%` }"></div>
                  </div>
                  <div class="threshold-marker" :style="{ left: `${level1Threshold}%` }">
                    <div class="marker-line"></div>
                    <div class="marker-label">一级阈值</div>
                  </div>
                </div>
              </div>

              <!-- 二级预警状态 -->
              <div class="warning-status-card" :class="{ active: warningLevel === 'level2' }">
                <div class="warning-status-header">
                  <div class="warning-status-icon warning-l2">
                    <el-icon><CircleCloseFilled /></el-icon>
                  </div>
                  <div class="warning-status-info">
                    <div class="warning-status-title">二级预警状态</div>
                    <div class="warning-status-subtitle">危险警报</div>
                  </div>
                </div>
                <div class="warning-status-content">
                  <div class="warning-status-text">
                    {{ warningLevel === 'level2' 
                      ? '碰撞事故已触发，V2X超视距预警可有效避免该类事故' 
                      : '当前未触发二级预警' }}
                  </div>
                  <div class="warning-status-data">
                    <div class="warning-threshold" data-label="阈值">{{ level2Threshold }}%</div>
                    <div class="warning-current" data-label="当前">{{ currentData?.avoidanceSuccess?.toFixed(2) || '--' }}%</div>
                  </div>
                </div>
                <div class="warning-status-indicator" :class="{ active: warningLevel === 'level2' }">
                  <div class="indicator-bar">
                    <div class="indicator-fill" :style="{ width: `${Math.min(100, Math.max(0, currentData?.avoidanceSuccess || 0))}%` }"></div>
                  </div>
                  <div class="threshold-marker" :style="{ left: `${level2Threshold}%` }">
                    <div class="marker-line"></div>
                    <div class="marker-label">二级阈值</div>
                  </div>
                </div>
              </div>
            </div>
            </div> <!-- 关闭滚动容器 -->
          </aside>
        </div>

        <!-- 热力地图模块 -->
        <div v-else-if="currentModule === 'heatmap'" class="module-wrapper heatmap-module" key="heatmap">
          <HeatmapView
            ref="heatmapRef"
            :externalReset="heatmapResetTrigger"
            @reset-done="onHeatmapResetDone"
            @switch-to-scene="onSwitchToScene"
          />
        </div>
      </Transition>
    </main>

    <!-- 底部说明栏 -->
    <footer class="footer">
      <div class="footer-decoration"></div>
      <div class="footer-content">
        <span class="footer-label">{{ currentModule === 'avoidance' ? '核心价值' : '模块价值' }}</span>
        <span class="footer-value">
          {{ currentModule === 'avoidance' 
            ? '5G-V2X 车联网技术打破单车雷达感知局限，让车辆被遮挡的盲区路况变得可见，实现超视距协同避让，有效降低交通事故发生率' 
            : '城市全局交通风险可视化，为交警风险监控、智慧城市交通规划、市民出行指导提供数据支撑' }}
        </span>
      </div>
    </footer>

    <!-- 碰撞弹窗 -->
    <el-dialog
      v-model="showCollisionDialog"
      title="碰撞事故提醒"
      width="480px"
      :close-on-click-modal="false"
      center
      class="collision-dialog"
    >
      <div class="collision-content">
        <el-icon class="collision-icon"><WarningFilled /></el-icon>
        <p>碰撞事故已触发</p>
        <p class="sub-text">V2X 超视距预警可有效避免该类事故</p>
      </div>
      <template #footer>
        <el-button type="primary" @click="handleReset">重置模拟</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'
import * as echarts from 'echarts'
import { sceneConfigs, defaultSimulationData, fieldMappings, requiredFields } from './data/simulationData.js'
import VisualizationCanvas from './components/VisualizationCanvas.vue'
import HeatmapView from './components/HeatmapView.vue'
// 导入图标
import { 
  Location, Setting, Warning, Upload, Monitor, Connection, User, 
  WarningFilled, CircleCloseFilled, Back, DataLine, RefreshRight,
  UploadFilled, InfoFilled, CircleCheck, ArrowRight, CaretRight,
  Van
} from '@element-plus/icons-vue'

// 响应式状态
const currentModule = ref('heatmap')
const currentScene = ref('urban')
const speed = ref(40)
const density = ref(200)
const level1Threshold = ref(80)
const level2Threshold = ref(50)
const warningLevel = ref('normal')
const isCollided = ref(false)
const showCollisionDialog = ref(false)
const simulationData = ref([...defaultSimulationData])
const uploadRef = ref(null)
const canvasRef = ref(null)

// 热力地图相关
const heatmapRef = ref(null)
const heatmapResetTrigger = ref(false)

const showDataPreview = ref(false) // 数据预览展开/收起
const lastUpdateTime = ref(new Date().toLocaleString()) // 数据更新时间

// 性能指标对比相关
const barChartRef = ref(null)
let barChartInstance = null
const brakeReactionTime = ref(0.5)  // 刹车反应时间（秒）
const v2xDelay = ref(50)            // V2X通信延迟（毫秒）

// 计算调整后的成功率
const adjustedAvoidanceRate = computed(() => {
  const realRate = currentData.value?.avoidanceSuccess || 85
  const reactionFactor = 1 - (brakeReactionTime.value - 0.1) / 1.4 * 0.2
  const delayFactor = 1 - v2xDelay.value / 200 * 0.15
  return Math.min(99, Math.max(50, realRate * reactionFactor * delayFactor))
})

const adjustedReceiveRate = computed(() => {
  const realRate = currentData.value?.success50m || 92
  return Math.min(99, Math.max(70, realRate * (1 - v2xDelay.value / 200 * 0.2)))
})


// 计算当前场景配置
const currentSceneConfig = computed(() => sceneConfigs[currentScene.value])

// 根据车速和密度获取当前数据
const currentData = computed(() => {
  const data = simulationData.value.find(
    item => item.speed === speed.value && item.density === density.value
  )
  return data || simulationData.value[0]
})

// 监听数据变化
watch([currentData, level1Threshold, level2Threshold], () => {
  updateWarningLevel()
}, { immediate: true })

// 更新预警级别
function updateWarningLevel() {
  if (isCollided.value) return
  const avoidanceSuccess = currentData.value?.avoidanceSuccess || 0
  if (avoidanceSuccess < level2Threshold.value) {
    warningLevel.value = 'level2'
  } else if (avoidanceSuccess < level1Threshold.value) {
    warningLevel.value = 'level1'
  } else {
    warningLevel.value = 'normal'
  }
}

// 场景切换
function handleSceneChange(sceneKey) {
  if (isCollided.value) return
  currentScene.value = sceneKey
  const config = sceneConfigs[sceneKey]
  speed.value = Math.round((config.speedRange[0] + config.speedRange[1]) / 20) * 10
  density.value = Math.round((config.densityRange[0] + config.densityRange[1]) / 100) * 50
  updateWarningLevel()
}

// 参数变化
function handleParamChange() {
  speed.value = Math.round(speed.value / 10) * 10
  density.value = Math.round(density.value / 50) * 50
  const config = currentSceneConfig.value
  if (speed.value < config.speedRange[0]) speed.value = config.speedRange[0]
  if (speed.value > config.speedRange[1]) speed.value = config.speedRange[1]
  if (density.value < config.densityRange[0]) density.value = config.densityRange[0]
  if (density.value > config.densityRange[1]) density.value = config.densityRange[1]
  updateWarningLevel()
}

// 阈值变化
function handleThresholdChange(type) {
  if (type === 'level1' && level1Threshold.value <= level2Threshold.value) {
    level1Threshold.value = level2Threshold.value + 1
  } else if (type === 'level2' && level2Threshold.value >= level1Threshold.value) {
    level2Threshold.value = level1Threshold.value - 1
  }
  updateWarningLevel()
}

// 碰撞处理
function handleCollision() {
  isCollided.value = true
  warningLevel.value = 'level2'
  showCollisionDialog.value = true
}

// 文件上传
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
      if (jsonData.length < 2) {
        ElMessage.error('文件格式不正确')
        return
      }
      const headers = jsonData[0]
      const fieldMap = {}
      headers.forEach((header, index) => {
        const enField = fieldMappings[header]
        if (enField) fieldMap[index] = enField
      })
      const missingFields = requiredFields.filter(field => !Object.values(fieldMap).includes(field))
      if (missingFields.length > 0) {
        ElMessage.error(`缺少必填字段: ${missingFields.join(', ')}`)
        return
      }
      const parsedData = []
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i]
        if (!row || row.length === 0) continue
        const item = {}
        let hasValidData = false
        Object.entries(fieldMap).forEach(([idx, field]) => {
          const value = parseFloat(row[idx])
          if (!isNaN(value)) {
            item[field] = value
            hasValidData = true
          }
        })
        if (hasValidData && item.speed && item.density) {
          parsedData.push(item)
        }
      }
      if (parsedData.length === 0) {
        ElMessage.error('未解析到有效数据')
        return
      }
      simulationData.value = parsedData
      handleParamChange()
      ElMessage.success(`成功加载 ${parsedData.length} 条数据`)
    } catch (error) {
      console.error('解析错误:', error)
      ElMessage.error('文件解析失败')
    }
  }
  reader.readAsArrayBuffer(file.raw)
}

// 模块切换
function switchModule(module) {
  currentModule.value = module
}

// 重置
function handleReset() {
  if (currentModule.value === 'heatmap') {
    heatmapResetTrigger.value = !heatmapResetTrigger.value
  } else {
    resetAvoidanceModule()
  }
}

function onHeatmapResetDone() {
  ElMessage.success('热力地图已重置')
}

function onSwitchToScene(payload) {
  const { roadId, roadName, roadType } = payload
  // 根据道路类型映射到对应的场景
  const roadTypeToScene = {
    highway: 'highway',
    expressway: 'expressway',
    urban: 'urban',
    ramp: 'ramp',
    tunnel: 'tunnel'
  }
  const scene = roadTypeToScene[roadType] || 'urban'
  currentScene.value = scene
  currentModule.value = 'avoidance'
  
  const config = sceneConfigs[scene]
  if (config) {
    speed.value = Math.round((config.speedRange[0] + config.speedRange[1]) / 20) * 10
    density.value = Math.round((config.densityRange[0] + config.densityRange[1]) / 100) * 50
  }
  
  ElMessage({
    message: `已切换到「${roadName}」的${config?.name || '道路'}场景演示`,
    type: 'success',
    duration: 3000
  })
}

function resetAvoidanceModule() {
  const config = currentSceneConfig.value
  speed.value = Math.round((config.speedRange[0] + config.speedRange[1]) / 20) * 10
  density.value = Math.round((config.densityRange[0] + config.densityRange[1]) / 100) * 50
  isCollided.value = false
  warningLevel.value = 'normal'
  showCollisionDialog.value = false
  if (canvasRef.value) {
    canvasRef.value.resetAnimation()
  }
  ElMessage.success('模拟已重置')
}

function openSimulation() {
  window.open('./模拟驾驶/web-desktop/index.html', '_blank')
}

// 获取车速刻度标记
function getSpeedMarkers() {
  const range = currentSceneConfig.value.speedRange
  const step = Math.round((range[1] - range[0]) / 4)
  const markers = []
  for (let i = range[0]; i <= range[1]; i += step) {
    markers.push(i)
  }
  return markers
}

// 获取密度刻度标记
function getDensityMarkers() {
  const range = currentSceneConfig.value.densityRange
  const step = Math.round((range[1] - range[0]) / 4)
  const markers = []
  for (let i = range[0]; i <= range[1]; i += step) {
    markers.push(i)
  }
  return markers
}

// 获取车速等级
function getSpeedLevel(speed) {
  const range = currentSceneConfig.value.speedRange
  const percent = (speed - range[0]) / (range[1] - range[0])
  if (percent < 0.3) return 'level-low'
  if (percent < 0.7) return 'level-medium'
  return 'level-high'
}

// 获取车速等级文本
function getSpeedLevelText(speed) {
  const level = getSpeedLevel(speed)
  switch (level) {
    case 'level-low': return '低速'
    case 'level-medium': return '中速'
    case 'level-high': return '高速'
    default: return '标准'
  }
}

// 获取密度等级
function getDensityLevel(density) {
  const range = currentSceneConfig.value.densityRange
  const percent = (density - range[0]) / (range[1] - range[0])
  if (percent < 0.3) return 'level-low'
  if (percent < 0.7) return 'level-medium'
  return 'level-high'
}

// 获取密度等级文本
function getDensityLevelText(density) {
  const level = getDensityLevel(density)
  switch (level) {
    case 'level-low': return '稀疏'
    case 'level-medium': return '适中'
    case 'level-high': return '密集'
    default: return '标准'
  }
}

// 获取一级预警状态
function getLevel1Status(threshold) {
  if (threshold > 90) return '高安全标准'
  if (threshold > 75) return '标准警戒'
  if (threshold > 60) return '低警戒'
  return '宽松标准'
}

// 获取二级预警状态
function getLevel2Status(threshold) {
  if (threshold > 60) return '极低容错'
  if (threshold > 40) return '低容错'
  if (threshold > 20) return '中容错'
  return '高容错'
}

onMounted(() => {
  handleParamChange()
  
  // 初始化柱状图
  nextTick(() => {
    initBarChart()
  })
})

// 初始化柱状图
function initBarChart() {
  if (!barChartRef.value) {
    setTimeout(initBarChart, 100)
    return
  }
  if (barChartRef.value.clientWidth === 0) {
    setTimeout(initBarChart, 100)
    return
  }
  
  barChartInstance = echarts.init(barChartRef.value)
  updateBarChart()
}

// 更新柱状图
function updateBarChart() {
  if (!barChartInstance) return
  
  const realAvoidanceRate = currentData.value?.avoidanceSuccess || 85
  const realReceiveRate = currentData.value?.success50m || 92
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: 'rgba(59, 130, 246, 0.3)',
      textStyle: { color: '#fff' }
    },
    grid: {
      left: '5%',
      right: '5%',
      top: '10%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['避让成功率', '接收成功率'],
      axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
      axisLabel: { color: '#cbd5e1', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.3)' } },
      axisLabel: { 
        color: '#cbd5e1', 
        fontSize: 10,
        formatter: '{value}%'
      },
      splitLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.1)' } }
    },
    series: [
      {
        name: '真实值',
        type: 'bar',
        data: [realAvoidanceRate, realReceiveRate],
        itemStyle: {
          color: '#3b82f6',
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '30%'
      },
      {
        name: '调整后',
        type: 'bar',
        data: [adjustedAvoidanceRate.value, adjustedReceiveRate.value],
        itemStyle: {
          color: '#f97316',
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '30%'
      }
    ]
  }
  
  barChartInstance.setOption(option)
}

// 监听参数变化更新柱状图
watch([brakeReactionTime, v2xDelay, currentData], () => {
  updateBarChart()
})

// 👇 新增：缺失的核心函数（仅接口，无真实计算）
// 触发文件上传
function triggerFileUpload() {
  uploadRef.value?.handleClick()
}

// 清空上传数据
function resetUploadData() {
  simulationData.value = [...defaultSimulationData]
  lastUpdateTime.value = new Date().toLocaleString()
  ElMessage.success('数据已重置为默认')
}

// 数据源样式类
function getDataSourceBadgeClass() {
  return 'default-data'
}

// 数据源文本
function getDataSourceText() {
  return '默认仿真数据'
}

// 数据覆盖率（固定返回100%）
function getDataCoverage() {
  return 100
}

// 获取最后更新时间
function getLastUpdateTime() {
  return lastUpdateTime.value
}

// 切换数据预览展开/收起
function toggleDataPreview() {
  showDataPreview.value = !showDataPreview.value
}

// 导出数据（空接口）
function exportData() {
  ElMessage.info('导出功能暂未实现')
}

// 成功率样式判断（固定返回默认）
function getSuccessClass(success) {
  return 'success-normal'
}

// 获取预览数据（直接返回前5条）
function getPreviewData() {
  return simulationData.value.slice(0, 5)
}
</script>

<style lang="scss">
// 全局色彩变量
$primary-color: #3b82f6;
$primary-light: #60a5fa;
$success-color: #10b981;
$warning-color: #ef4444;
$warning-orange: #f97316;
$bg-dark: #0f172a;
$bg-light: #1e293b;
$text-primary: #ffffff;
$text-secondary: #cbd5e1;
$text-muted: #94a3b8;
$border-color: rgba(59, 130, 246, 0.2);
$border-light: rgba(59, 130, 246, 0.1);

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: $bg-dark;
  color: $text-primary;
  overflow: hidden;
  // 确保滚动条在所有浏览器中可见
  scrollbar-width: thin;
  scrollbar-color: rgba(59, 130, 246, 0.3) rgba(59, 130, 246, 0.05);
}

// 全局滚动条样式
html {
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(15, 23, 42, 0.5);
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.4);
    border-radius: 4px;

    &:hover {
      background: rgba(59, 130, 246, 0.6);
    }
  }
}

.app-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, $bg-dark 0%, #0c1222 50%, $bg-dark 100%);
  position: relative;
  overflow: hidden;
}

// 装饰背景
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;

  .bg-grid {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px);
    background-size: 50px 50px;
  }

  .bg-glow {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    opacity: 0.15;

    &.bg-glow-1 {
      width: 600px;
      height: 600px;
      background: $primary-color;
      top: -200px;
      left: -200px;
      animation: floatGlow 15s ease-in-out infinite;
    }

    &.bg-glow-2 {
      width: 500px;
      height: 500px;
      background: $success-color;
      bottom: -150px;
      right: -150px;
      animation: floatGlow 12s ease-in-out infinite reverse;
    }
  }
}

@keyframes floatGlow {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(30px, 20px); }
}

// 顶部标题栏
.header {
  height: 80px;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.85));
  border-bottom: 1px solid $border-color;
  position: relative;
  z-index: 100;
  backdrop-filter: blur(12px);

  // 添加底部光效
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, $primary-color, transparent);
    opacity: 0.6;
  }

  // 添加顶部微弱光晕
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 20px;

    .logo-wrapper {
      position: relative;
      width: 50px;
      height: 50px;

      .header-logo {
        width: 50px;
        height: 50px;
        position: relative;
        z-index: 2;
      }

      .logo-glow {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 60px;
        height: 60px;
        background: $primary-color;
        border-radius: 50%;
        filter: blur(20px);
        opacity: 0.4;
        animation: logoPulse 3s ease-in-out infinite;
      }
    }

    .header-title {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .title-main {
        font-size: 22px;
        font-weight: 700;
        background: linear-gradient(135deg, $primary-light, $primary-color);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .title-sub {
        font-size: 13px;
        color: $text-muted;
        letter-spacing: 2px;
      }
    }
  }

  .header-right {
    display: flex;
    gap: 12px;

    .action-btn {
      width: 120px;
      height: 40px;
      font-size: 13px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.3s ease;
      border: none;
      font-weight: 500;

      &.simulation-btn {
        background: linear-gradient(135deg, #7c3aed, #4f46e5);
        color: white;

        &:hover {
          background: linear-gradient(135deg, #6d28d9, #4338ca);
        }
      }

      &.heatmap-btn {
        background: $success-color;
        color: white;

        &:hover {
          background: #059669;
        }
      }

      &.reset-btn {
        background: $primary-color;
        color: white;

        &:hover {
          background: #2563eb;
        }

        &:disabled {
          background: #475569;
          cursor: not-allowed;
        }
      }
    }
  }
}

@keyframes logoPulse {
  0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.1); }
}

// 主内容区
.main-content {
  flex: 1;
  display: flex;
  overflow: hidden; // 父容器隐藏滚动，子容器负责滚动
  padding: 0;
  position: relative;
  z-index: 1;
  height: calc(100vh - 130px); // 减去头部和底部高度
}

// 模块包装器
.module-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  gap: 0;
  min-height: 600px; // 确保有足够的最小高度
}

// 左侧控制区
.left-panel {
  width: 25%;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  height: 100%;
  flex-shrink: 0;
  border-right: 1px solid $border-color;
  background: rgba(15, 23, 42, 0.8);
  
  .scroll-container {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}

// 卡片通用样式
.control-card, .indicator-card {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid $border-color;
  border-radius: 12px;
  padding: 16px;

  .card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(59, 130, 246, 0.1);

    .header-icon {
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(59, 130, 246, 0.2);
      border-radius: 6px;
      color: $primary-color;

      &.warning {
        background: rgba(239, 68, 68, 0.2);
        color: $warning-color;
      }

      .el-icon {
        font-size: 16px;
      }
    }
  }
}

// 场景切换卡片
.scene-card {
  .card-header {
    position: relative;
    
    .scroll-mode-indicator {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: $text-muted;
      background: rgba(59, 130, 246, 0.08);
      padding: 4px 10px;
      border-radius: 20px;
      border: 1px solid rgba(59, 130, 246, 0.2);
      
      .el-icon {
        font-size: 12px;
        color: $primary-color;
        animation: arrowPulse 2s ease-in-out infinite;
      }
    }
  }

  .scene-selector {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .scene-preview {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.03));
    border: 1px solid $border-light;
    border-radius: 12px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 1px;
      height: 100%;
      background: linear-gradient(180deg, transparent, rgba(59, 130, 246, 0.5), transparent);
    }

    .scene-icon {
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1));
      border-radius: 10px;
      color: $primary-color;
      flex-shrink: 0;
      transition: all 0.3s ease;

      .el-icon {
        font-size: 24px;
      }

      &.urban { color: #3b82f6; background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1)); }
      &.expressway { color: #10b981; background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1)); }
      &.highway { color: #8b5cf6; background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.1)); }
      &.ramp { color: #f59e0b; background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1)); }
      &.tunnel { color: #6b7280; background: linear-gradient(135deg, rgba(107, 114, 128, 0.2), rgba(107, 114, 128, 0.1)); }
    }

    .scene-info {
      flex: 1;
      .scene-name {
        font-size: 16px;
        font-weight: 700;
        color: $text-primary;
        margin-bottom: 4px;
      }
      .scene-desc {
        font-size: 12px;
        color: $text-muted;
        line-height: 1.4;
      }
    }
  }

  .scene-scroll-container {
    position: relative;
    
    .scene-buttons-scroll {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      padding: 10px 0;
      scrollbar-width: thin;
      scrollbar-color: rgba(59, 130, 246, 0.3) rgba(59, 130, 246, 0.05);
      
      &::-webkit-scrollbar {
        height: 6px;
      }
      
      &::-webkit-scrollbar-track {
        background: rgba(59, 130, 246, 0.05);
        border-radius: 3px;
      }
      
      &::-webkit-scrollbar-thumb {
        background: rgba(59, 130, 246, 0.3);
        border-radius: 3px;
        
        &:hover {
          background: rgba(59, 130, 246, 0.5);
        }
      }
      
      .scene-btn-scroll {
        min-width: 120px;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 12px;
        background: rgba(59, 130, 246, 0.1);
        border: 1px solid $border-color;
        border-radius: 10px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        gap: 8px;
        
        .scene-btn-icon-scroll {
          font-size: 24px;
          color: $text-secondary;
          transition: all 0.3s ease;
        }
        
        .scene-btn-content {
          text-align: center;
          .scene-btn-name {
            font-size: 12px;
            font-weight: 600;
            color: $text-secondary;
            margin-bottom: 4px;
            transition: all 0.3s ease;
          }
          .scene-btn-speed {
            font-size: 10px;
            color: $text-muted;
            transition: all 0.3s ease;
          }
        }
        
        &:hover {
          border-color: $primary-color;
          background: rgba(59, 130, 246, 0.15);
          transform: translateY(-2px);
          
          .scene-btn-icon-scroll {
            color: $primary-light;
          }
          .scene-btn-name {
            color: $primary-light;
          }
        }
        
        &.active {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(59, 130, 246, 0.2));
          border-color: $primary-color;
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
          
          .scene-btn-icon-scroll {
            color: $text-primary;
            animation: sceneIconPulse 1.5s ease-in-out infinite;
          }
          .scene-btn-name {
            color: $text-primary;
            font-weight: 700;
          }
          .scene-btn-speed {
            color: $primary-light;
          }
        }
        
        &.urban.active { 
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(59, 130, 246, 0.2));
          border-color: #3b82f6;
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
        }
        &.expressway.active { 
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.4), rgba(16, 185, 129, 0.2));
          border-color: #10b981;
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
        }
        &.highway.active { 
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(139, 92, 246, 0.2));
          border-color: #8b5cf6;
          box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
        }
        &.ramp.active { 
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.4), rgba(245, 158, 11, 0.2));
          border-color: #f59e0b;
          box-shadow: 0 4px 20px rgba(245, 158, 11, 0.3);
        }
        &.tunnel.active { 
          background: linear-gradient(135deg, rgba(107, 114, 128, 0.4), rgba(107, 114, 128, 0.2));
          border-color: #6b7280;
          box-shadow: 0 4px 20px rgba(107, 114, 128, 0.3);
        }
      }
    }
    
    .scroll-hint {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin-top: 8px;
      font-size: 11px;
      color: $text-muted;
      opacity: 0.8;
      transition: opacity 0.3s ease;
      
      .el-icon {
        font-size: 12px;
        animation: arrowPulse 2s ease-in-out infinite;
      }
    }
  }
}

@keyframes sceneIconPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

@keyframes arrowPulse {
  0%, 100% { transform: translateX(0); opacity: 0.7; }
  50% { transform: translateX(3px); opacity: 1; }
}

// 参数调节卡片
.param-card {
  .param-item {
    margin-bottom: 24px;
    padding-bottom: 18px;
    border-bottom: 1px solid rgba(59, 130, 246, 0.1);

    &:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }

    &.speed-param {
      .param-value {
        color: #60a5fa;
      }
      .speed-indicator {
        &.level-low { color: #10b981; }
        &.level-medium { color: #f59e0b; }
        &.level-high { color: #ef4444; }
      }
    }

    &.density-param {
      .param-value {
        color: #8b5cf6;
      }
      .density-indicator {
        &.level-low { color: #10b981; }
        &.level-medium { color: #f59e0b; }
        &.level-high { color: #ef4444; }
      }
    }

    .param-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 14px;

      .param-info {
        flex: 1;
        .param-name {
          font-size: 14px;
          color: $text-primary;
          font-weight: 600;
          display: block;
          margin-bottom: 4px;
        }
        .param-range {
          font-size: 11px;
          color: $text-muted;
        }
      }

      .param-value {
        font-size: 20px;
        font-weight: 800;
        font-family: 'SF Mono', Monaco, monospace;

        small {
          font-size: 12px;
          color: $text-muted;
          font-weight: 500;
          margin-left: 2px;
        }
      }
    }

    .slider-container {
      position: relative;
      margin-bottom: 10px;

      .slider-markers {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 12px 5px 12px;

        .marker {
          font-size: 10px;
          color: $text-muted;
          opacity: 0.6;
          transition: all 0.3s ease;
          position: relative;
          width: 24px;
          text-align: center;

          &.active {
            color: $primary-color;
            opacity: 1;
            font-weight: 600;
          }

          &::before {
            content: '';
            position: absolute;
            top: -6px;
            left: 50%;
            transform: translateX(-50%);
            width: 1px;
            height: 4px;
            background: $text-muted;
            opacity: 0.4;
          }

          &.active::before {
            background: $primary-color;
            opacity: 1;
          }
        }
      }
    }

    .speed-indicator,
    .density-indicator {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: rgba(59, 130, 246, 0.1);
      margin-top: 8px;
      transition: all 0.3s ease;
    }
  }
}

// 预警阈值卡片
.threshold-card {
  .threshold-help {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    padding: 10px 14px;
    background: rgba(59, 130, 246, 0.08);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 8px;
    font-size: 12px;
    color: $text-secondary;

    .el-icon {
      color: $primary-color;
      font-size: 14px;
    }
  }

  .param-item {
    &.threshold-l1, &.threshold-l2 {
      margin-bottom: 24px;
      padding-bottom: 18px;
      border-bottom: 1px solid rgba(239, 68, 68, 0.1);

      &:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
      }

      .param-header {
        .param-info {
          .threshold-title {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 6px;

            .param-name {
              font-size: 14px;
              font-weight: 700;

              &.warning-l1 { color: #f87171; }
              &.warning-l2 { color: #fb923c; }
            }

            .threshold-badge {
              font-size: 10px;
              font-weight: 700;
              padding: 2px 8px;
              border-radius: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;

              &.warning-l1 { 
                background: rgba(248, 113, 113, 0.15); 
                color: #f87171; 
                border: 1px solid rgba(248, 113, 113, 0.3);
              }
              &.warning-l2 { 
                background: rgba(251, 146, 60, 0.15); 
                color: #fb923c; 
                border: 1px solid rgba(251, 146, 60, 0.3);
              }
            }
          }

          .threshold-desc {
            font-size: 11px;
            color: $text-muted;
            line-height: 1.4;
          }
        }

        .param-value {
          font-size: 20px;
          font-weight: 800;

          &.warning-l1 { color: #f87171; }
          &.warning-l2 { color: #fb923c; }
        }
      }
    }
  }

  .threshold-indicator {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 10px;

    &.warning-l1 {
      background: rgba(248, 113, 113, 0.15);
      color: #f87171;
      border: 1px solid rgba(248, 113, 113, 0.3);
    }

    &.warning-l2 {
      background: rgba(251, 146, 60, 0.15);
      color: #fb923c;
      border: 1px solid rgba(251, 146, 60, 0.3);
    }
  }

  .threshold-validation {
    margin-top: 20px;
    padding: 14px;
    border-radius: 10px;
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.2);
    display: flex;
    align-items: center;
    gap: 12px;
    transition: all 0.3s ease;

    &.error {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      animation: validationShake 0.5s ease-in-out;
    }

    .validation-icon {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      flex-shrink: 0;

      .el-icon {
        font-size: 18px;

        &:not(.error) {
          color: #10b981;
        }

        &.error {
          color: #ef4444;
        }
      }
    }

    .validation-content {
      flex: 1;
      .validation-title {
        font-size: 13px;
        font-weight: 700;
        color: $text-primary;
        margin-bottom: 2px;
      }
      .validation-desc {
        font-size: 11px;
        color: $text-muted;
        line-height: 1.4;
      }
    }
  }
}

// 预警阈值滑动条
.threshold-l1 {
  ::deep(.threshold-slider) {
    &.warning-l1 {
      --el-slider-main-bg-color: #f87171;
      .el-slider__bar {
        background: linear-gradient(90deg, #f87171, #dc2626);
      }
      .el-slider__button {
        border-color: #f87171;
      }
    }
  }
}

.threshold-l2 {
  ::deep(.threshold-slider) {
    &.warning-l2 {
      --el-slider-main-bg-color: #fb923c;
      .el-slider__bar {
        background: linear-gradient(90deg, #fb923c, #ea580c);
      }
      .el-slider__button {
        border-color: #fb923c;
      }
    }
  }
}

@keyframes validationShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  75% { transform: translateX(3px); }
}

// 数据上传
.data-upload {
  :deep(.el-upload-dragger) {
    background: rgba(59, 130, 246, 0.05);
    border: 2px dashed $border-light;
    border-radius: 12px;
    padding: 24px;
    transition: all 0.3s ease;

    &:hover {
      border-color: $primary-color;
      background: rgba(59, 130, 246, 0.1);
      transform: scale(1.01);
    }
  }

  .upload-icon {
    font-size: 36px;
    color: $primary-color;
    margin-bottom: 10px;
    opacity: 0.9;
  }

  .upload-text {
    font-size: 13px;
    color: $text-secondary;
    font-weight: 500;
  }

  .upload-tip {
    font-size: 11px;
    color: $text-muted;
    margin-top: 10px;
  }
}

// 主可视化画布区
.canvas-section {
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
  background: rgba(15, 23, 42, 0.6);
}

.canvas-wrapper {
  width: 100%;
  height: 100%;
  max-width: 800px;
  max-height: 600px;
  background: linear-gradient(180deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9));
  border: 1px solid $border-color;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.15), inset 0 0 50px rgba(0, 0, 0, 0.2);

  .canvas-border {
    position: absolute;
    top: -1px;
    left: -1px;
    right: -1px;
    bottom: -1px;
    border-radius: 12px;
    padding: 1px;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.4), transparent, rgba(59, 130, 246, 0.2));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }
}

// 右侧指标面板
.right-panel {
  width: 25%;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  height: 100%;
  flex-shrink: 0;
  border-left: 1px solid $border-color;
  background: rgba(15, 23, 42, 0.8);
  
  .scroll-container {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}

// 指标网格
.indicator-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;

  &.two-col {
    grid-template-columns: repeat(2, 1fr);
  }
}

.indicator-item {
  text-align: center;
  padding: 14px 10px;
  background: rgba(59, 130, 246, 0.08);
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.1);

  &.main {
    .ind-value {
      font-size: 32px;
      color: $primary-color;
    }
  }

  &.highlight {
    border-color: rgba(59, 130, 246, 0.4);
    background: rgba(59, 130, 246, 0.12);

    .ind-value {
      font-size: 22px;
      color: $primary-light;
    }
  }

  &.warning-highlight {
    border-color: rgba(248, 113, 113, 0.4);
    background: rgba(248, 113, 113, 0.1);

    .ind-value { color: #f87171; }
  }

  &.danger-highlight {
    border-color: rgba(239, 68, 68, 0.5);
    background: rgba(239, 68, 68, 0.15);

    .ind-value { color: $warning-color; }
  }

  .ind-value {
    font-size: 22px;
    font-weight: 700;
    color: $text-primary;
    line-height: 1.2;
    font-family: 'SF Mono', Monaco, monospace;
  }

  .ind-unit {
    font-size: 12px;
    color: $text-muted;
    margin-top: 2px;
    font-weight: 500;
  }

  .ind-label {
    font-size: 11px;
    color: $text-muted;
    margin-top: 4px;
    opacity: 0.9;
  }
}

@keyframes dangerPulse {
  0%, 100% { 
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.2);
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 0 30px rgba(239, 68, 68, 0.35);
    transform: scale(1.02);
  }
}

// 预警状态展示区域
.warning-status-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.warning-status-card {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.9));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 14px;
  padding: 18px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  // 添加顶部光泽
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  }
  
  &:hover {
    border-color: rgba(59, 130, 246, 0.3);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
  
  &.active {
    animation: warningCardPulse 2s ease-in-out infinite;
    
    &.warning-l1 {
      border-color: rgba(248, 113, 113, 0.4);
      background: linear-gradient(135deg, rgba(248, 113, 113, 0.05), rgba(248, 113, 113, 0.02));
    }
    
    &.warning-l2 {
      border-color: rgba(239, 68, 68, 0.5);
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(239, 68, 68, 0.04));
    }
  }
  
  .warning-status-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
    
    .warning-status-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      flex-shrink: 0;
      
      .el-icon {
        font-size: 20px;
      }
      
      &.warning-l1 {
        background: rgba(248, 113, 113, 0.15);
        color: #f87171;
        border: 1px solid rgba(248, 113, 113, 0.3);
      }
      
      &.warning-l2 {
        background: rgba(239, 68, 68, 0.15);
        color: #ef4444;
        border: 1px solid rgba(239, 68, 68, 0.3);
      }
    }
    
    .warning-status-info {
      flex: 1;
      .warning-status-title {
        font-size: 14px;
        font-weight: 700;
        color: $text-primary;
        margin-bottom: 2px;
      }
      .warning-status-subtitle {
        font-size: 11px;
        color: $text-muted;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }
  }
  
  .warning-status-content {
    margin-bottom: 14px;
    
    .warning-status-text {
      font-size: 12px;
      color: $text-secondary;
      line-height: 1.5;
      margin-bottom: 10px;
    }
    
    .warning-status-data {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      
      .warning-threshold, .warning-current {
        display: flex;
        flex-direction: column;
        align-items: center;
        
        &:before {
          content: attr(data-label);
          font-size: 10px;
          color: $text-muted;
          margin-bottom: 2px;
        }
      }
      
      .warning-threshold {
        color: $text-secondary;
      }
      
      .warning-current {
        color: $primary-color;
        font-weight: 600;
      }
    }
  }
  
  .warning-status-indicator {
    position: relative;
    height: 24px;
    
    .indicator-bar {
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      transform: translateY(-50%);
      height: 8px;
      background: rgba(59, 130, 246, 0.1);
      border-radius: 4px;
      overflow: hidden;
      
      .indicator-fill {
        height: 100%;
        background: linear-gradient(90deg, #10b981, #3b82f6);
        border-radius: 4px;
        transition: width 0.5s ease;
      }
    }
    
    .threshold-marker {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 2px;
      transform: translateX(-50%);
      
      .marker-line {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 2px;
        background: rgba(255, 255, 255, 0.6);
      }
      
      .marker-label {
        position: absolute;
        top: -20px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 10px;
        color: $text-muted;
        white-space: nowrap;
      }
    }
  }
}

// 为激活状态添加特殊样式
.warning-status-card.active.warning-l1 {
  .warning-status-indicator {
    .threshold-marker {
      .marker-line {
        background: #f87171;
        box-shadow: 0 0 8px rgba(248, 113, 113, 0.5);
      }
      .marker-label {
        color: #f87171;
        font-weight: 600;
      }
    }
  }
}

.warning-status-card.active.warning-l2 {
  .warning-status-indicator {
    .threshold-marker {
      .marker-line {
        background: #ef4444;
        box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
      }
      .marker-label {
        color: #ef4444;
        font-weight: 600;
      }
    }
  }
}

@keyframes warningCardPulse {
  0%, 100% { 
    box-shadow: 0 0 10px rgba(239, 68, 68, 0.1); 
  }
  50% { 
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.2); 
  }
}

// 底部说明栏
.footer {
  height: 50px;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.85));
  position: relative;
  z-index: 100;
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(59, 130, 246, 0.15);

  // 添加发光效果
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent);
  }

  .footer-decoration {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 100px;
    background: linear-gradient(90deg, rgba(59, 130, 246, 0.1), transparent);
    pointer-events: none;
  }

  .footer-content {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    max-width: 1200px;
    width: 100%;

    .footer-label {
      color: $primary-color;
      font-weight: 600;
      padding: 4px 12px;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1));
      border-radius: 8px;
      white-space: nowrap;
      border: 1px solid rgba(59, 130, 246, 0.2);
    }

    .footer-value {
      color: $text-secondary;
      line-height: 1.4;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 13px;
    }
  }
}

// 碰撞弹窗
.collision-dialog {
  :deep(.el-dialog) {
    background: linear-gradient(180deg, $bg-light, $bg-dark);
    border: 1px solid $border-color;
    border-radius: 16px;
    overflow: hidden;

    .el-dialog__header {
      background: rgba(239, 68, 68, 0.1);
      border-bottom: 1px solid rgba(239, 68, 68, 0.2);
      padding: 20px;

      .el-dialog__title {
        color: $text-primary;
        font-weight: 600;
      }
    }

    .el-dialog__body {
      padding: 30px 20px;
    }

    .el-dialog__footer {
      border-top: 1px solid $border-light;
      padding: 16px 20px;
    }
  }
}

.collision-content {
  text-align: center;

  .collision-icon {
    font-size: 72px;
    color: $warning-color;
    margin-bottom: 20px;
    animation: collisionShake 0.5s ease-in-out infinite;
  }

  p {
    font-size: 20px;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 10px;

    &.sub-text {
      font-size: 14px;
      color: $text-secondary;
      font-weight: 400;
    }
  }
}

@keyframes collisionShake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}

// 过渡动画
.module-fade-enter-active,
.module-fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.module-fade-enter-from {
  opacity: 0;
  transform: scale(0.98);
}

.module-fade-leave-to {
  opacity: 0;
  transform: scale(1.02);
}

// 滑动条样式覆盖
::deep(.el-slider) {
  --el-slider-main-bg-color: #{$primary-color};
  --el-slider-runway-bg-color: rgba(59, 130, 246, 0.15);

  &.enhanced-slider {
    .el-slider__runway {
      height: 8px;
      border-radius: 4px;
      background: rgba(59, 130, 246, 0.08);
    }

    .el-slider__bar {
      background: linear-gradient(90deg, $primary-color, $primary-light);
      border-radius: 4px;
      height: 8px;
    }

    .el-slider__button-wrapper {
      width: 24px;
      height: 24px;
      top: -8px;
    }

    .el-slider__button {
      width: 18px;
      height: 18px;
      border: 3px solid $primary-color;
      background: $text-primary;
      box-shadow: 0 2px 10px rgba(59, 130, 246, 0.6);
      transition: all 0.2s ease;

      &:hover {
        transform: scale(1.3);
        box-shadow: 0 4px 15px rgba(59, 130, 246, 0.8);
      }
    }
  }
}

// 特殊参数的滑动条
.speed-param {
  ::deep(.el-slider) {
    --el-slider-main-bg-color: #60a5fa;
    .el-slider__bar {
      background: linear-gradient(90deg, #60a5fa, #3b82f6);
    }
    .el-slider__button {
      border-color: #60a5fa;
    }
  }
}

.density-param {
  ::deep(.el-slider) {
    --el-slider-main-bg-color: #8b5cf6;
    .el-slider__bar {
      background: linear-gradient(90deg, #8b5cf6, #7c3aed);
    }
    .el-slider__button {
      border-color: #8b5cf6;
    }
  }
}

// 热力地图模块包装
.heatmap-module {
  width: 100%;
  height: 100%;
}

// 性能指标对比卡片样式
.indicator-card {
  .chart-container {
    height: 140px;
    margin-bottom: 12px;
  }

  .bar-chart {
    width: 100%;
    height: 100%;
  }

  .legend-row {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(59, 130, 246, 0.1);

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: $text-muted;

      .legend-color {
        width: 12px;
        height: 12px;
        border-radius: 2px;

        &.real {
          background: #3b82f6;
        }

        &.adjusted {
          background: #f97316;
        }
      }
    }
  }

  .param-section {
    padding-top: 12px;

    .param-title {
      font-size: 12px;
      font-weight: 500;
      color: $text-muted;
      margin-bottom: 12px;
    }
  }

  .slider-group {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .slider-label {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 12px;
    color: $text-secondary;

    .slider-value {
      color: $warning-orange;
      font-weight: 600;
    }
  }

  .custom-slider {
    width: 100%;
    height: 6px;
    -webkit-appearance: none;
    appearance: none;
    background: rgba(59, 130, 246, 0.2);
    border-radius: 3px;
    outline: none;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      background: $primary-color;
      border-radius: 50%;
      cursor: pointer;
      border: 2px solid #1e40af;
      transition: all 0.2s ease;

      &:hover {
        transform: scale(1.1);
        background: $primary-light;
      }
    }

    &::-moz-range-thumb {
      width: 18px;
      height: 18px;
      background: $primary-color;
      border-radius: 50%;
      cursor: pointer;
      border: 2px solid #1e40af;
    }
  }

  .slider-hint {
    display: flex;
    justify-content: space-between;
    margin-top: 6px;
    font-size: 10px;
    color: $text-muted;
  }
}
</style>
