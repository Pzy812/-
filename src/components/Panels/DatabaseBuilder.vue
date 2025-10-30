<template>
  <div class="database-builder">
    <div class="panel-header">
      <h2>
        <el-icon><DataBoard /></el-icon>
        自动化数据库构建模块
      </h2>
      <p class="panel-description">DFT计算+自动优化→TDB文件生成</p>
    </div>

    <div class="content-container">
      <!-- DFT计算设置 -->
      <el-card class="section-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><Cpu /></el-icon>
            <span>DFT计算设置</span>
          </div>
        </template>
        
        <div class="dft-setup">
          <el-form :model="dftForm" label-width="140px" size="small">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="计算方法">
                  <el-select v-model="dftForm.method" placeholder="选择DFT方法">
                    <el-option label="PBE-GGA" value="PBE"></el-option>
                    <el-option label="LDA" value="LDA"></el-option>
                    <el-option label="HSE06" value="HSE06"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="基组">
                  <el-select v-model="dftForm.basis" placeholder="选择基组">
                    <el-option label="POTCAR-PAW" value="PAW"></el-option>
                    <el-option label="Ultrasoft" value="US"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="截断能 (eV)">
                  <el-input-number v-model="dftForm.cutoff" :min="200" :max="1000" :step="50" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="K点网格">
                  <el-input v-model="dftForm.kpoints" placeholder="如: 8x8x8" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="收敛精度">
                  <el-select v-model="dftForm.precision">
                    <el-option label="低 (1e-4)" value="low"></el-option>
                    <el-option label="中 (1e-6)" value="medium"></el-option>
                    <el-option label="高 (1e-8)" value="high"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-divider content-position="left">目标体系</el-divider>
            
            <div class="target-systems">
              <el-table :data="dftForm.systems" size="small" border>
                <el-table-column prop="name" label="体系名称">
                  <template #default="scope">
                    <el-input v-model="scope.row.name" size="small" />
                  </template>
                </el-table-column>
                <el-table-column prop="composition" label="成分">
                  <template #default="scope">
                    <el-input v-model="scope.row.composition" size="small" placeholder="如: Fe2C" />
                  </template>
                </el-table-column>
                <el-table-column prop="structure" label="晶体结构">
                  <template #default="scope">
                    <el-select v-model="scope.row.structure" size="small">
                      <el-option label="FCC" value="fcc"></el-option>
                      <el-option label="BCC" value="bcc"></el-option>
                      <el-option label="HCP" value="hcp"></el-option>
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="80">
                  <template #default="scope">
                    <el-button type="danger" size="small" icon="Delete" @click="removeSystem(scope.$index)" />
                  </template>
                </el-table-column>
              </el-table>
              
              <el-button type="dashed" @click="addSystem" style="width: 100%; margin-top: 12px;">
                <el-icon><Plus /></el-icon>
                添加计算体系
              </el-button>
            </div>
          </el-form>
        </div>
      </el-card>

      <!-- 计算进度监控 -->
      <el-card class="section-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><Monitor /></el-icon>
            <span>计算进度监控</span>
            <el-space>
              <el-button type="primary" @click="startDFTCalculation" :loading="isDFTRunning">
                <el-icon><VideoPlay /></el-icon>
                开始DFT计算
              </el-button>
            </el-space>
          </div>
        </template>
        
        <div class="calculation-monitor">
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="progress-info">
                <h4>整体进度</h4>
                <el-progress 
                  :percentage="calculationProgress.overall" 
                  :stroke-width="20"
                  :text-inside="true"
                  status="success"
                />
                
                <div class="progress-stats">
                  <el-row :gutter="12">
                    <el-col :span="6">
                      <el-statistic title="已完成" :value="calculationProgress.completed" suffix="个" />
                    </el-col>
                    <el-col :span="6">
                      <el-statistic title="进行中" :value="calculationProgress.running" suffix="个" />
                    </el-col>
                    <el-col :span="6">
                      <el-statistic title="队列中" :value="calculationProgress.queued" suffix="个" />
                    </el-col>
                    <el-col :span="6">
                      <el-statistic title="失败" :value="calculationProgress.failed" suffix="个" />
                    </el-col>
                  </el-row>
                </div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="resource-monitor">
                <h4>资源使用</h4>
                <div class="resource-item">
                  <span class="resource-label">CPU使用率:</span>
                  <el-progress :percentage="systemResources.cpu" :stroke-width="8" />
                </div>
                <div class="resource-item">
                  <span class="resource-label">内存使用:</span>
                  <el-progress :percentage="systemResources.memory" :stroke-width="8" status="success" />
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>

      <!-- 数据处理与优化 -->
      <el-card class="section-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><DataProcessor /></el-icon>
            <span>数据处理与优化</span>
          </div>
        </template>
        
        <div class="data-processing">
          <el-tabs v-model="activeProcessingTab" type="card">
            <el-tab-pane label="数据分析" name="analysis">
              <div class="data-analysis">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <div class="analysis-chart">
                      <h4>形成能分析</h4>
                      <div id="formation-energy-chart" class="chart-container"></div>
                    </div>
                  </el-col>
                  <el-col :span="12">
                    <div class="analysis-chart">
                      <h4>稳定性分析</h4>
                      <div id="stability-chart" class="chart-container"></div>
                    </div>
                  </el-col>
                </el-row>
                
                <div class="statistical-summary">
                  <h4>统计摘要</h4>
                  <el-descriptions :column="3" border>
                    <el-descriptions-item label="平均形成能">{{ statistics.avgFormationEnergy }} eV/atom</el-descriptions-item>
                    <el-descriptions-item label="最稳定相">{{ statistics.mostStablePhase }}</el-descriptions-item>
                    <el-descriptions-item label="计算精度">{{ statistics.accuracy }}%</el-descriptions-item>
                  </el-descriptions>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="参数优化" name="optimization">
              <div class="parameter-optimization">
                <el-form :model="optimizationConfig" label-width="140px" size="small">
                  <el-form-item label="优化目标">
                    <el-checkbox-group v-model="optimizationConfig.objectives">
                      <el-checkbox label="formation_energy">形成能准确性</el-checkbox>
                      <el-checkbox label="phase_stability">相稳定性</el-checkbox>
                    </el-checkbox-group>
                  </el-form-item>
                  
                  <el-button type="success" @click="startParameterOptimization" :loading="isOptimizing">
                    <el-icon><Setting /></el-icon>
                    开始参数优化
                  </el-button>
                </el-form>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-card>

      <!-- TDB文件生成 -->
      <el-card class="section-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><Document /></el-icon>
            <span>TDB文件生成</span>
          </div>
        </template>
        
        <div class="tdb-generation">
          <el-form :model="tdbConfig" label-width="140px" size="small">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="数据库名称">
                  <el-input v-model="tdbConfig.name" placeholder="输入数据库名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="版本信息">
                  <el-input v-model="tdbConfig.version" placeholder="如: v1.0" />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-form-item label="描述信息">
              <el-input 
                v-model="tdbConfig.description" 
                type="textarea" 
                :rows="3"
                placeholder="输入数据库描述信息..."
              />
            </el-form-item>
            
            <div class="generation-actions">
              <el-button type="primary" @click="generateTDB" :loading="isGenerating">
                <el-icon><Promotion /></el-icon>
                生成TDB文件
              </el-button>
              <el-button @click="downloadTDB" :disabled="!tdbGenerated">
                <el-icon><Download /></el-icon>
                下载TDB
              </el-button>
            </div>
          </el-form>
          
          <div v-if="tdbGenerated" class="tdb-preview">
            <h4>TDB文件预览</h4>
            <el-input 
              v-model="tdbContent" 
              type="textarea" 
              :rows="8"
              readonly
              class="tdb-content"
            />
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'

// 表单数据
const dftForm = reactive({
  method: 'PBE',
  basis: 'PAW',
  cutoff: 500,
  kpoints: '8x8x8',
  precision: 'medium',
  systems: [
    { name: 'Fe-BCC', composition: 'Fe', structure: 'bcc' },
    { name: 'Fe3C', composition: 'Fe3C', structure: 'other' }
  ]
})

const optimizationConfig = reactive({
  objectives: ['formation_energy', 'phase_stability']
})

const tdbConfig = reactive({
  name: 'Fe-C-Database',
  version: 'v1.0',
  description: '基于DFT计算的Fe-C二元合金热力学数据库'
})

// 状态管理
const isDFTRunning = ref(false)
const isOptimizing = ref(false)
const isGenerating = ref(false)
const tdbGenerated = ref(false)
const activeProcessingTab = ref('analysis')

// 计算进度
const calculationProgress = reactive({
  overall: 0,
  completed: 0,
  running: 0,
  queued: 2,
  failed: 0
})

// 系统资源
const systemResources = reactive({
  cpu: 45,
  memory: 62
})

// 统计数据
const statistics = reactive({
  avgFormationEnergy: '-0.125',
  mostStablePhase: 'Fe-BCC',
  accuracy: 95.2
})

// TDB内容
const tdbContent = ref('')

// 方法定义
const addSystem = () => {
  dftForm.systems.push({
    name: `System-${dftForm.systems.length + 1}`,
    composition: '',
    structure: 'fcc'
  })
}

const removeSystem = (index) => {
  dftForm.systems.splice(index, 1)
}

const startDFTCalculation = () => {
  isDFTRunning.value = true
  ElNotification({
    title: 'DFT计算开始',
    message: '已提交DFT计算任务到集群',
    type: 'success'
  })
  
  // 模拟计算进度
  const interval = setInterval(() => {
    calculationProgress.overall += 5
    if (calculationProgress.overall >= 100) {
      isDFTRunning.value = false
      clearInterval(interval)
      ElNotification({
        title: 'DFT计算完成',
        message: '所有计算任务已完成',
        type: 'success'
      })
    }
  }, 1000)
}

const startParameterOptimization = () => {
  isOptimizing.value = true
  ElMessage.info('开始参数优化...')
  
  setTimeout(() => {
    isOptimizing.value = false
    ElMessage.success('参数优化完成')
  }, 3000)
}

const generateTDB = () => {
  isGenerating.value = true
  ElMessage.info('正在生成TDB文件...')
  
  setTimeout(() => {
    tdbContent.value = `$ ${tdbConfig.name} ${tdbConfig.version}
$ ${tdbConfig.description}
$
ELEMENT FE   BCC_A2                    5.5845E+01  4.4890E+03  2.7280E+01!
ELEMENT C    GRAPHITE                  1.2011E+01  1.0540E+03  5.7423E+00!
$
PHASE LIQUID  %  1  1.0  !
CONSTITUENT LIQUID  : FE,C : !
$
PHASE BCC_A2  %  2 1   3 !
CONSTITUENT BCC_A2  : FE% : C,VA% : !
$
PARAMETER G(LIQUID,FE;0)  298.15 +12040.17-6.55843*T; 6000.00 N !
PARAMETER G(BCC_A2,FE:VA;0)  298.15 +1225.7+124.134*T; 6000.00 N !
$`
    
    tdbGenerated.value = true
    isGenerating.value = false
    ElMessage.success('TDB文件生成完成')
  }, 2000)
}

const downloadTDB = () => {
  ElMessage.success('TDB文件下载开始')
}
</script>

<style scoped>
.database-builder {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.panel-header {
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
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

.progress-stats {
  margin-top: 20px;
}

.resource-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.resource-label {
  width: 80px;
  font-size: 12px;
  color: #666;
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

.generation-actions {
  margin-bottom: 20px;
  display: flex;
  gap: 12px;
}

.tdb-content {
  font-family: 'Courier New', monospace;
  font-size: 12px;
}
</style>