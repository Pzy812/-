<template>
  <div class="auto-optimization">
    <div class="panel-header">
      <h2>
        <el-icon><Setting /></el-icon>
        自动优化模块
      </h2>
      <p class="panel-description">用户交互+调用开源软件优化模块，实现自动优化</p>
    </div>

    <div class="content-container">
      <!-- 优化目标设定 -->
      <el-card class="section-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><Target /></el-icon>
            <span>优化目标设定</span>
          </div>
        </template>
        
        <div class="optimization-setup">
          <el-form :model="optimizationForm" label-width="140px" size="small">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="优化类型">
                  <el-select v-model="optimizationForm.type" placeholder="选择优化类型">
                    <el-option label="成分优化" value="composition"></el-option>
                    <el-option label="工艺参数优化" value="process"></el-option>
                    <el-option label="多目标优化" value="multi-objective"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="优化算法">
                  <el-select v-model="optimizationForm.algorithm" placeholder="选择优化算法">
                    <el-option label="遗传算法 (GA)" value="GA"></el-option>
                    <el-option label="粒子群优化 (PSO)" value="PSO"></el-option>
                    <el-option label="贝叶斯优化 (BO)" value="BO"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-divider content-position="left">目标函数定义</el-divider>
            
            <div class="objective-functions">
              <div v-for="(objective, index) in optimizationForm.objectives" :key="index" class="objective-item">
                <el-row :gutter="12" align="middle">
                  <el-col :span="6">
                    <el-select v-model="objective.property" placeholder="选择性能">
                      <el-option label="强度" value="strength"></el-option>
                      <el-option label="延展性" value="ductility"></el-option>
                      <el-option label="耐腐蚀性" value="corrosion"></el-option>
                    </el-select>
                  </el-col>
                  <el-col :span="4">
                    <el-select v-model="objective.direction" placeholder="优化方向">
                      <el-option label="最大化" value="maximize"></el-option>
                      <el-option label="最小化" value="minimize"></el-option>
                    </el-select>
                  </el-col>
                  <el-col :span="4">
                    <el-input-number 
                      v-model="objective.weight" 
                      :min="0" 
                      :max="1" 
                      :step="0.1"
                      placeholder="权重"
                      size="small"
                    />
                  </el-col>
                  <el-col :span="4">
                    <el-button 
                      type="danger" 
                      size="small" 
                      icon="Delete" 
                      @click="removeObjective(index)"
                    />
                  </el-col>
                </el-row>
              </div>
              
              <el-button type="dashed" @click="addObjective" style="width: 100%; margin-top: 12px;">
                <el-icon><Plus /></el-icon>
                添加目标函数
              </el-button>
            </div>
          </el-form>
        </div>
      </el-card>

      <!-- 开源软件集成 -->
      <el-card class="section-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><Connection /></el-icon>
            <span>开源软件集成</span>
          </div>
        </template>
        
        <div class="software-integration">
          <div class="software-grid">
            <el-card 
              v-for="software in availableSoftware" 
              :key="software.id" 
              class="software-card"
              :class="{ 'selected': selectedSoftware.includes(software.id) }"
              @click="toggleSoftware(software.id)"
              shadow="hover"
            >
              <div class="software-content">
                <div class="software-icon">
                  <el-icon><Cpu /></el-icon>
                </div>
                <div class="software-info">
                  <h4>{{ software.name }}</h4>
                  <p>{{ software.description }}</p>
                  <el-tag :type="software.status === 'available' ? 'success' : 'warning'" size="small">
                    {{ software.status === 'available' ? '可用' : '不可用' }}
                  </el-tag>
                </div>
                <el-checkbox 
                  :model-value="selectedSoftware.includes(software.id)"
                  @change="toggleSoftware(software.id)"
                />
              </div>
            </el-card>
          </div>
        </div>
      </el-card>

      <!-- 优化执行与监控 -->
      <el-card class="section-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><Monitor /></el-icon>
            <span>优化执行与监控</span>
            <el-space>
              <el-button 
                type="primary" 
                @click="startOptimization" 
                :loading="isOptimizing"
              >
                <el-icon><VideoPlay /></el-icon>
                开始优化
              </el-button>
              <el-button 
                type="danger" 
                @click="stopOptimization" 
                :disabled="!isOptimizing"
              >
                <el-icon><VideoPlay /></el-icon>
                停止
              </el-button>
            </el-space>
          </div>
        </template>
        
        <div class="optimization-monitor">
          <el-tabs v-model="activeMonitorTab" type="card">
            <el-tab-pane label="实时进度" name="progress">
              <div class="progress-monitor">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <div class="progress-info">
                      <h4>优化进度</h4>
                      <el-progress 
                        :percentage="optimizationProgress.overall" 
                        :stroke-width="20"
                        :text-inside="true"
                        status="success"
                      />
                      <div class="progress-details">
                        <div class="detail-item">
                          <span class="label">当前代数:</span>
                          <span class="value">{{ optimizationProgress.generation }} / {{ optimizationProgress.maxGeneration }}</span>
                        </div>
                        <div class="detail-item">
                          <span class="label">最优适应度:</span>
                          <span class="value">{{ optimizationProgress.bestFitness }}</span>
                        </div>
                      </div>
                    </div>
                  </el-col>
                  <el-col :span="12">
                    <div class="convergence-chart">
                      <h4>收敛曲线</h4>
                      <div id="convergence-chart" class="chart-container"></div>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="最优解" name="best-solution">
              <div class="best-solution">
                <el-descriptions title="最优解信息" :column="2" border>
                  <el-descriptions-item label="目标函数值">{{ bestSolution.objectiveValue }}</el-descriptions-item>
                  <el-descriptions-item label="适应度">{{ bestSolution.fitness }}</el-descriptions-item>
                </el-descriptions>
                
                <div class="solution-actions">
                  <el-button type="primary" @click="applySolution">
                    <el-icon><Check /></el-icon>
                    应用此解
                  </el-button>
                  <el-button @click="saveSolution">
                    <el-icon><Download /></el-icon>
                    保存解
                  </el-button>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'

// 表单数据
const optimizationForm = reactive({
  type: 'composition',
  algorithm: 'GA',
  objectives: [
    { property: 'strength', direction: 'maximize', weight: 0.6 }
  ]
})

// 状态管理
const activeMonitorTab = ref('progress')
const isOptimizing = ref(false)
const selectedSoftware = ref(['opencalphad'])

// 可用软件
const availableSoftware = ref([
  {
    id: 'opencalphad',
    name: 'OpenCalphad',
    description: '开源热力学计算软件',
    status: 'available'
  },
  {
    id: 'thermocalc',
    name: 'Thermo-Calc',
    description: '商业热力学计算软件',
    status: 'available'
  },
  {
    id: 'deap',
    name: 'DEAP',
    description: '分布式进化算法框架',
    status: 'available'
  }
])

// 优化进度
const optimizationProgress = reactive({
  overall: 0,
  generation: 0,
  maxGeneration: 100,
  bestFitness: 0
})

// 最优解
const bestSolution = reactive({
  objectiveValue: '-',
  fitness: '-'
})

// 方法定义
const addObjective = () => {
  optimizationForm.objectives.push({
    property: 'strength',
    direction: 'maximize',
    weight: 0.5
  })
}

const removeObjective = (index) => {
  optimizationForm.objectives.splice(index, 1)
}

const toggleSoftware = (softwareId) => {
  const index = selectedSoftware.value.indexOf(softwareId)
  if (index > -1) {
    selectedSoftware.value.splice(index, 1)
  } else {
    selectedSoftware.value.push(softwareId)
  }
}

const startOptimization = () => {
  isOptimizing.value = true
  ElNotification({
    title: '优化开始',
    message: '优化任务已启动',
    type: 'success'
  })
  
  // 模拟优化过程
  const interval = setInterval(() => {
    optimizationProgress.generation += 1
    optimizationProgress.overall = Math.min(100, (optimizationProgress.generation / optimizationProgress.maxGeneration) * 100)
    optimizationProgress.bestFitness = (0.5 + Math.random() * 0.5).toFixed(4)
    
    if (optimizationProgress.generation >= optimizationProgress.maxGeneration) {
      isOptimizing.value = false
      clearInterval(interval)
      ElNotification({
        title: '优化完成',
        message: '优化任务已完成',
        type: 'success'
      })
    }
  }, 1000)
}

const stopOptimization = () => {
  isOptimizing.value = false
  ElMessage.warning('优化已停止')
}

const applySolution = () => {
  ElMessage.success('最优解已应用')
}

const saveSolution = () => {
  ElMessage.success('解已保存')
}
</script>

<style scoped>
.auto-optimization {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.panel-header {
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #fd746c 0%, #ff9068 100%);
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

.objective-item {
  margin-bottom: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
}

.software-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.software-card {
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.software-card:hover {
  transform: translateY(-2px);
}

.software-card.selected {
  border-color: #409EFF;
}

.software-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.software-icon {
  font-size: 24px;
  color: #409EFF;
}

.software-info {
  flex: 1;
}

.software-info h4 {
  margin: 0 0 8px 0;
}

.software-info p {
  margin: 0 0 8px 0;
  color: #666;
  font-size: 12px;
}

.progress-details {
  margin-top: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.label {
  color: #666;
}

.value {
  font-weight: 600;
  color: #333;
}

.chart-container {
  height: 200px;
  background: #f9f9f9;
  border: 1px dashed #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.solution-actions {
  margin-top: 20px;
  display: flex;
  gap: 12px;
}
</style>