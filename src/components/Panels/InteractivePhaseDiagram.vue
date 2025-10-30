<template>
  <div class="interactive-phase-diagram">
    <div class="panel-header">
      <h2>
        <el-icon><PieChart /></el-icon>
        交互式相图热力学计算
      </h2>
      <p class="panel-description">智能体驱动的相图计算与交互分析</p>
    </div>

    <div class="content-container">
      <!-- 合金成分条件设置 -->
      <el-card class="section-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><SetUp /></el-icon>
            <span>合金成分条件设置</span>
          </div>
        </template>
        
        <div class="alloy-composition">
          <el-form :model="compositionForm" label-width="120px" size="small">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="基元素">
                  <el-select v-model="compositionForm.baseElement" placeholder="选择基元素">
                    <el-option label="Fe" value="Fe"></el-option>
                    <el-option label="Al" value="Al"></el-option>
                    <el-option label="Ni" value="Ni"></el-option>
                    <el-option label="Ti" value="Ti"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="合金系统">
                  <el-select v-model="compositionForm.alloySystem" placeholder="选择合金系统">
                    <el-option label="Fe-C" value="Fe-C"></el-option>
                    <el-option label="Fe-Cr-Ni" value="Fe-Cr-Ni"></el-option>
                    <el-option label="Al-Cu-Mg" value="Al-Cu-Mg"></el-option>
                    <el-option label="Ni-Cr-Al" value="Ni-Cr-Al"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-divider content-position="left">成分范围设置</el-divider>
            
            <div class="composition-inputs">
              <div v-for="(element, index) in compositionForm.elements" :key="index" class="element-input">
                <el-form-item :label="element.name + ' (wt%)'">
                  <el-input-number 
                    v-model="element.min" 
                    :min="0" 
                    :max="100" 
                    :precision="2"
                    size="small"
                    placeholder="最小值"
                    style="width: 120px"
                  />
                  <span style="margin: 0 10px">-</span>
                  <el-input-number 
                    v-model="element.max" 
                    :min="0" 
                    :max="100" 
                    :precision="2"
                    size="small"
                    placeholder="最大值"
                    style="width: 120px"
                  />
                </el-form-item>
              </div>
            </div>
            
            <el-button type="primary" @click="generateComposition" :loading="isGenerating">
              <el-icon><MagicStick /></el-icon>
              智能生成成分
            </el-button>
          </el-form>
        </div>
      </el-card>

      <!-- 平衡计算结果 -->
      <el-card class="section-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><DataAnalysis /></el-icon>
            <span>平衡计算结果</span>
            <el-button type="primary" size="small" @click="startCalculation" :loading="isCalculating">
              <el-icon><VideoPlay /></el-icon>
              开始计算
            </el-button>
          </div>
        </template>
        
        <div class="calculation-results">
          <el-tabs v-model="activeTab" type="border-card">
            <el-tab-pane label="相图显示" name="phase-diagram">
              <div class="phase-diagram-container">
                <div id="phase-chart" class="chart-container"></div>
                <div class="chart-controls">
                  <el-space>
                    <el-button size="small" @click="zoomIn">
                      <el-icon><ZoomIn /></el-icon>
                      放大
                    </el-button>
                    <el-button size="small" @click="zoomOut">
                      <el-icon><ZoomOut /></el-icon>
                      缩小
                    </el-button>
                    <el-button size="small" @click="resetView">
                      <el-icon><Refresh /></el-icon>
                      重置视图
                    </el-button>
                  </el-space>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="数据表格" name="data-table">
              <el-table :data="calculationData" size="small" stripe>
                <el-table-column prop="temperature" label="温度 (°C)" width="120"></el-table-column>
                <el-table-column prop="phase" label="相" width="100"></el-table-column>
                <el-table-column prop="fraction" label="相分数" width="100"></el-table-column>
                <el-table-column prop="composition" label="成分 (wt%)" show-overflow-tooltip></el-table-column>
              </el-table>
            </el-tab-pane>
            
            <el-tab-pane label="详细分析" name="detailed-analysis">
              <div class="analysis-content">
                <el-descriptions title="相变信息" :column="2" border>
                  <el-descriptions-item label="液相线温度">{{ phaseInfo.liquidusTemp }}°C</el-descriptions-item>
                  <el-descriptions-item label="固相线温度">{{ phaseInfo.solidusTemp }}°C</el-descriptions-item>
                  <el-descriptions-item label="共晶温度">{{ phaseInfo.eutecticTemp }}°C</el-descriptions-item>
                  <el-descriptions-item label="主要相">{{ phaseInfo.mainPhases.join(', ') }}</el-descriptions-item>
                </el-descriptions>
                
                <el-divider content-position="left">热力学性质</el-divider>
                <div class="properties-grid">
                  <el-card v-for="property in thermoProperties" :key="property.name" class="property-card">
                    <div class="property-item">
                      <div class="property-name">{{ property.name }}</div>
                      <div class="property-value">{{ property.value }}</div>
                      <div class="property-unit">{{ property.unit }}</div>
                    </div>
                  </el-card>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-card>

      <!-- 高通量计算与筛选 -->
      <el-card class="section-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><Grid /></el-icon>
            <span>高通量计算与筛选</span>
          </div>
        </template>
        
        <div class="high-throughput">
          <el-form :model="screeningForm" label-width="140px" size="small">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="筛选目标">
                  <el-select v-model="screeningForm.target" placeholder="选择筛选目标">
                    <el-option label="高强度合金" value="strength"></el-option>
                    <el-option label="耐高温合金" value="temperature"></el-option>
                    <el-option label="耐腐蚀合金" value="corrosion"></el-option>
                    <el-option label="轻质合金" value="weight"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="性能阈值">
                  <el-input v-model="screeningForm.threshold" placeholder="输入阈值">
                    <template #append>{{ getThresholdUnit() }}</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="计算精度">
                  <el-select v-model="screeningForm.precision">
                    <el-option label="快速" value="fast"></el-option>
                    <el-option label="标准" value="standard"></el-option>
                    <el-option label="精确" value="precise"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-button type="success" @click="startScreening" :loading="isScreening">
              <el-icon><Search /></el-icon>
              开展高性能合金设计
            </el-button>
          </el-form>
          
          <div v-if="screeningResults.length > 0" class="screening-results">
            <h4>筛选结果</h4>
            <el-table :data="screeningResults" size="small" stripe>
              <el-table-column prop="composition" label="成分组合" width="200"></el-table-column>
              <el-table-column prop="performance" label="预测性能" width="120"></el-table-column>
              <el-table-column prop="confidence" label="置信度" width="100">
                <template #default="scope">
                  <el-progress :percentage="scope.row.confidence" :stroke-width="8" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120">
                <template #default="scope">
                  <el-button size="mini" @click="viewDetail(scope.row)">详情</el-button>
                  <el-button size="mini" type="primary" @click="addToDesign(scope.row)">采用</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-card>

      <!-- 知识库 -->
      <el-card class="section-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><Collection /></el-icon>
            <span>知识库</span>
          </div>
        </template>
        
        <div class="knowledge-base">
          <el-tabs v-model="knowledgeTab" type="card">
            <el-tab-pane label="相关手册" name="manual">
              <div class="manual-list">
                <el-card v-for="manual in manuals" :key="manual.id" class="manual-item" shadow="hover">
                  <div class="manual-content">
                    <div class="manual-icon">
                      <el-icon><Document /></el-icon>
                    </div>
                    <div class="manual-info">
                      <h4>{{ manual.title }}</h4>
                      <p>{{ manual.description }}</p>
                      <div class="manual-meta">
                        <el-tag size="small">{{ manual.category }}</el-tag>
                        <span class="manual-size">{{ manual.size }}</span>
                      </div>
                    </div>
                    <div class="manual-actions">
                      <el-button size="small" @click="downloadManual(manual)">
                        <el-icon><Download /></el-icon>
                        下载
                      </el-button>
                      <el-button size="small" type="primary" @click="viewManual(manual)">
                        <el-icon><View /></el-icon>
                        查看
                      </el-button>
                    </div>
                  </div>
                </el-card>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="文章库" name="articles">
              <div class="articles-search">
                <el-input 
                  v-model="articleSearch" 
                  placeholder="搜索相关文章..."
                  @keyup.enter="searchArticles"
                >
                  <template #append>
                    <el-button @click="searchArticles">
                      <el-icon><Search /></el-icon>
                    </el-button>
                  </template>
                </el-input>
              </div>
              
              <div class="articles-list">
                <el-card v-for="article in articles" :key="article.id" class="article-item" shadow="hover">
                  <div class="article-content">
                    <h4>{{ article.title }}</h4>
                    <p class="article-abstract">{{ article.abstract }}</p>
                    <div class="article-meta">
                      <span class="article-authors">作者: {{ article.authors.join(', ') }}</span>
                      <span class="article-journal">期刊: {{ article.journal }}</span>
                      <span class="article-year">年份: {{ article.year }}</span>
                    </div>
                  </div>
                </el-card>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="计算脚本" name="scripts">
              <div class="scripts-library">
                <el-row :gutter="20">
                  <el-col :span="12" v-for="script in scripts" :key="script.id">
                    <el-card class="script-card" shadow="hover">
                      <div class="script-header">
                        <el-icon><CopyDocument /></el-icon>
                        <span>{{ script.name }}</span>
                      </div>
                      <p class="script-description">{{ script.description }}</p>
                      <div class="script-actions">
                        <el-button size="small" @click="useScript(script)">
                          <el-icon><VideoPlay /></el-icon>
                          使用
                        </el-button>
                        <el-button size="small" @click="editScript(script)">
                          <el-icon><EditPen /></el-icon>
                          编辑
                        </el-button>
                      </div>
                    </el-card>
                  </el-col>
                </el-row>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'

// 表单数据
const compositionForm = reactive({
  baseElement: 'Fe',
  alloySystem: 'Fe-C',
  elements: [
    { name: 'C', min: 0.1, max: 2.0 },
    { name: 'Cr', min: 0, max: 20 },
    { name: 'Ni', min: 0, max: 15 }
  ]
})

const screeningForm = reactive({
  target: 'strength',
  threshold: '500',
  precision: 'standard'
})

// 状态管理
const isGenerating = ref(false)
const isCalculating = ref(false)
const isScreening = ref(false)
const activeTab = ref('phase-diagram')
const knowledgeTab = ref('manual')

// 计算结果数据
const calculationData = ref([
  { temperature: 1500, phase: 'Liquid', fraction: 1.0, composition: 'Fe: 98.5%, C: 1.5%' },
  { temperature: 1400, phase: 'Austenite', fraction: 0.8, composition: 'Fe: 98.2%, C: 1.8%' },
  { temperature: 1200, phase: 'Ferrite', fraction: 0.6, composition: 'Fe: 99.8%, C: 0.2%' }
])

const phaseInfo = reactive({
  liquidusTemp: 1538,
  solidusTemp: 1495,
  eutecticTemp: 1148,
  mainPhases: ['Austenite', 'Ferrite', 'Cementite']
})

const thermoProperties = ref([
  { name: '焓', value: '-15.2', unit: 'kJ/mol' },
  { name: '熵', value: '142.3', unit: 'J/(mol·K)' },
  { name: '吉布斯自由能', value: '-58.4', unit: 'kJ/mol' },
  { name: '热容', value: '25.1', unit: 'J/(mol·K)' }
])

const screeningResults = ref([])

// 知识库数据
const manuals = ref([
  {
    id: 1,
    title: 'Fe-C相图计算手册',
    description: '详细介绍铁碳合金相图计算方法和理论基础',
    category: '相图计算',
    size: '2.5MB'
  },
  {
    id: 2,
    title: '热力学数据库使用指南',
    description: '热力学数据库的选择、使用和验证方法',
    category: '数据库',
    size: '1.8MB'
  }
])

const articles = ref([
  {
    id: 1,
    title: 'CALPHAD方法在合金设计中的应用',
    abstract: '本文介绍了CALPHAD方法的基本原理和在高性能合金设计中的应用案例...',
    authors: ['张三', '李四'],
    journal: 'Materials Science and Engineering A',
    year: 2023
  }
])

const scripts = ref([
  {
    id: 1,
    name: '二元相图批量计算',
    description: '自动计算多个二元合金系的相图'
  },
  {
    id: 2,
    name: '成分优化脚本',
    description: '基于目标性能优化合金成分'
  }
])

const articleSearch = ref('')

// 方法定义
const generateComposition = async () => {
  isGenerating.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 2000)) // 模拟AI生成过程
    ElNotification({
      title: '智能生成完成',
      message: '已根据目标性能生成最优成分配比',
      type: 'success'
    })
  } finally {
    isGenerating.value = false
  }
}

const startCalculation = async () => {
  isCalculating.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 3000)) // 模拟计算过程
    ElMessage.success('平衡计算完成')
  } finally {
    isCalculating.value = false
  }
}

const startScreening = async () => {
  isScreening.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 5000)) // 模拟高通量计算
    screeningResults.value = [
      { composition: 'Fe-18Cr-8Ni-0.1C', performance: '650 MPa', confidence: 92 },
      { composition: 'Fe-16Cr-10Ni-0.08C', performance: '580 MPa', confidence: 88 },
      { composition: 'Fe-20Cr-6Ni-0.12C', performance: '720 MPa', confidence: 85 }
    ]
    ElMessage.success('高通量筛选完成')
  } finally {
    isScreening.value = false
  }
}

const getThresholdUnit = () => {
  const units = {
    strength: 'MPa',
    temperature: '°C',
    corrosion: 'mm/year',
    weight: 'g/cm³'
  }
  return units[screeningForm.target] || ''
}

const zoomIn = () => {
  ElMessage.info('放大相图')
}

const zoomOut = () => {
  ElMessage.info('缩小相图')
}

const resetView = () => {
  ElMessage.info('重置视图')
}

const viewDetail = (row) => {
  ElMessage.info(`查看 ${row.composition} 的详细信息`)
}

const addToDesign = (row) => {
  ElMessage.success(`已添加 ${row.composition} 到设计方案`)
}

const downloadManual = (manual) => {
  ElMessage.success(`正在下载 ${manual.title}`)
}

const viewManual = (manual) => {
  ElMessage.info(`打开 ${manual.title}`)
}

const searchArticles = () => {
  ElMessage.info(`搜索: ${articleSearch.value}`)
}

const useScript = (script) => {
  ElMessage.success(`正在应用脚本: ${script.name}`)
}

const editScript = (script) => {
  ElMessage.info(`编辑脚本: ${script.name}`)
}

onMounted(() => {
  // 初始化图表
  // 这里可以集成 ECharts 或其他图表库
})
</script>

<style scoped>
.interactive-phase-diagram {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.panel-header {
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
}

.panel-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.panel-description {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
}

.content-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-card {
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  color: #333;
}

.card-header > span {
  display: flex;
  align-items: center;
  gap: 8px;
}

.composition-inputs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.element-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-container {
  height: 400px;
  background: #f9f9f9;
  border: 1px dashed #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  margin-bottom: 16px;
}

.chart-controls {
  text-align: center;
}

.analysis-content {
  padding: 16px 0;
}

.properties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.property-card {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.property-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.property-item {
  padding: 16px;
}

.property-name {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.property-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 4px;
}

.property-unit {
  font-size: 12px;
  color: #999;
}

.screening-results {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.manual-list, .articles-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.manual-item, .article-item {
  cursor: pointer;
  transition: all 0.3s;
}

.manual-item:hover, .article-item:hover {
  transform: translateY(-2px);
}

.manual-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.manual-icon {
  font-size: 32px;
  color: #409EFF;
}

.manual-info {
  flex: 1;
}

.manual-info h4 {
  margin: 0 0 8px 0;
  color: #333;
}

.manual-info p {
  margin: 0 0 8px 0;
  color: #666;
  font-size: 14px;
}

.manual-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.manual-size {
  font-size: 12px;
  color: #999;
}

.manual-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.article-content h4 {
  margin: 0 0 12px 0;
  color: #333;
}

.article-abstract {
  margin: 0 0 16px 0;
  color: #666;
  line-height: 1.6;
}

.article-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #999;
}

.articles-search {
  margin-bottom: 20px;
}

.scripts-library {
  padding: 16px 0;
}

.script-card {
  height: 100%;
  cursor: pointer;
  transition: all 0.3s;
}

.script-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.script-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.script-description {
  color: #666;
  margin-bottom: 16px;
  line-height: 1.6;
}

.script-actions {
  display: flex;
  gap: 8px;
}

:deep(.el-card__header) {
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-tabs__header) {
  margin: 0 0 20px 0;
}

:deep(.el-descriptions__title) {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}
</style>