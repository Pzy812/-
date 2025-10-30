<template>
  <div class="simulation-calculation">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-row :gutter="20" align="middle">
        <el-col :span="18">
          <h2 class="page-title">
            <el-icon class="title-icon"><DataAnalysis /></el-icon>
            模拟计算中心
          </h2>
          <p class="page-description">基于热力学数据库进行高精度材料性能模拟计算</p>
        </el-col>
        <el-col :span="6" class="text-right">
          <el-button type="primary" icon="Plus" @click="createNewSimulation">新建模拟</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 模拟计算卡片区域 -->
    <div class="simulation-cards">
      <el-row :gutter="20">
        <!-- 相变动力学模拟 -->
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-card class="simulation-card" shadow="hover" @click="openSimulation('phase-transformation')">
            <div class="card-header">
              <div class="card-icon phase-icon">
                <el-icon><TrendCharts /></el-icon>
              </div>
            </div>
            <div class="card-content">
              <h3 class="card-title">相变动力学模拟</h3>
              <p class="card-description">模拟材料在不同温度和时间条件下的相变过程</p>
              <div class="card-stats">
                <div class="stat-item">
                  <span class="stat-label">精度</span>
                  <span class="stat-value">99.2%</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">用时</span>
                  <span class="stat-value">~15min</span>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <el-tag size="small" type="success">稳定版本</el-tag>
              <span class="usage-count">使用: 1,234次</span>
            </div>
          </el-card>
        </el-col>

        <!-- 扩散模拟 -->
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-card class="simulation-card" shadow="hover" @click="openSimulation('diffusion')">
            <div class="card-header">
              <div class="card-icon diffusion-icon">
                <el-icon><Connection /></el-icon>
              </div>
            </div>
            <div class="card-content">
              <h3 class="card-title">扩散模拟</h3>
              <p class="card-description">计算元素在合金中的扩散行为和浓度分布</p>
              <div class="card-stats">
                <div class="stat-item">
                  <span class="stat-label">精度</span>
                  <span class="stat-value">98.8%</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">用时</span>
                  <span class="stat-value">~8min</span>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <el-tag size="small" type="success">稳定版本</el-tag>
              <span class="usage-count">使用: 856次</span>
            </div>
          </el-card>
        </el-col>

        <!-- 微观组织演化 -->
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-card class="simulation-card" shadow="hover" @click="openSimulation('microstructure')">
            <div class="card-header">
              <div class="card-icon micro-icon">
                <el-icon><Grid /></el-icon>
              </div>
            </div>
            <div class="card-content">
              <h3 class="card-title">微观组织演化</h3>
              <p class="card-description">预测材料微观组织在热处理过程中的演化</p>
              <div class="card-stats">
                <div class="stat-item">
                  <span class="stat-label">精度</span>
                  <span class="stat-value">97.5%</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">用时</span>
                  <span class="stat-value">~25min</span>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <el-tag size="small" type="warning">测试版本</el-tag>
              <span class="usage-count">使用: 423次</span>
            </div>
          </el-card>
        </el-col>

        <!-- 力学性能预测 -->
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-card class="simulation-card" shadow="hover" @click="openSimulation('mechanical')">
            <div class="card-header">
              <div class="card-icon mechanical-icon">
                <el-icon><ScaleToOriginal /></el-icon>
              </div>
            </div>
            <div class="card-content">
              <h3 class="card-title">力学性能预测</h3>
              <p class="card-description">基于成分和组织预测材料的力学性能参数</p>
              <div class="card-stats">
                <div class="stat-item">
                  <span class="stat-label">精度</span>
                  <span class="stat-value">96.3%</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">用时</span>
                  <span class="stat-value">~12min</span>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <el-tag size="small" type="success">稳定版本</el-tag>
              <span class="usage-count">使用: 672次</span>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 模拟详情对话框 -->
    <el-dialog v-model="simulationDialogVisible" :title="currentSimulation.title" width="70%" center>
      <div class="simulation-content">
        <el-row :gutter="20">
          <el-col :span="16">
            <div class="simulation-form">
              <h4>模拟参数设置</h4>
              <el-form :model="simulationParams" label-width="120px">
                <el-form-item label="材料体系:">
                  <el-select v-model="simulationParams.material" placeholder="请选择材料体系">
                    <el-option label="Fe-C 体系" value="Fe-C" />
                    <el-option label="Al-Cu 体系" value="Al-Cu" />
                    <el-option label="Ni-Cr 体系" value="Ni-Cr" />
                  </el-select>
                </el-form-item>
                <el-form-item label="温度范围:">
                  <el-row :gutter="10">
                    <el-col :span="11">
                      <el-input-number v-model="simulationParams.tempMin" :min="0" :max="2000" style="width: 100%" />
                    </el-col>
                    <el-col :span="2" class="text-center">-</el-col>
                    <el-col :span="11">
                      <el-input-number v-model="simulationParams.tempMax" :min="0" :max="2000" style="width: 100%" />
                    </el-col>
                  </el-row>
                </el-form-item>
                <el-form-item label="精度要求:">
                  <el-radio-group v-model="simulationParams.precision">
                    <el-radio label="low">标准精度</el-radio>
                    <el-radio label="medium">高精度</el-radio>
                    <el-radio label="high">超高精度</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-form>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="simulation-preview">
              <h4>预估结果</h4>
              <div class="preview-card">
                <div class="preview-item">
                  <span class="preview-label">计算时间:</span>
                  <span class="preview-value">{{ estimatedTime }}</span>
                </div>
                <div class="preview-item">
                  <span class="preview-label">预期精度:</span>
                  <span class="preview-value">{{ expectedAccuracy }}</span>
                </div>
              </div>
              <div class="simulation-progress" v-if="isSimulating">
                <h5>模拟进度</h5>
                <el-progress :percentage="simulationProgress" :stroke-width="12">
                  <template #default="{ percentage }">{{ percentage }}%</template>
                </el-progress>
                <p class="progress-info">{{ progressInfo }}</p>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
      <template #footer>
        <el-button @click="simulationDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="startSimulation" :loading="isSimulating">
          {{ isSimulating ? '模拟中...' : '开始模拟' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router';

export default {
  name: 'SimulationCalculation',
  setup() {
    const route = useRoute();
    const simulationDialogVisible = ref(false);
    const currentSimulation = ref({});
    const isSimulating = ref(false);
    const simulationProgress = ref(0);
    const progressInfo = ref('');

    const simulationParams = ref({
      material: '',
      tempMin: 300,
      tempMax: 1200,
      precision: 'medium'
    });

    const estimatedTime = computed(() => {
      const base = simulationParams.value.precision === 'low' ? 5 : 15;
      return `${base} 分钟`;
    });

    const expectedAccuracy = computed(() => {
      return simulationParams.value.precision === 'low' ? '95%' : '98%';
    });

    const simulationTypes = {
      'phase-transformation': { title: '相变动力学模拟' },
      'diffusion': { title: '扩散模拟' },
      'microstructure': { title: '微观组织演化' },
      'mechanical': { title: '力学性能预测' }
    };

    const openSimulation = (type) => {
      currentSimulation.value = simulationTypes[type];
      simulationDialogVisible.value = true;
      simulationProgress.value = 0;
      isSimulating.value = false;
    };

    // 检查URL查询参数，自动打开对应的模拟类型
    onMounted(() => {
      const tab = route.query.tab;
      if (tab && simulationTypes[tab]) {
        openSimulation(tab);
      }
    });

    const startSimulation = () => {
      if (!simulationParams.value.material) {
        ElMessage.warning('请选择材料体系');
        return;
      }
      
      isSimulating.value = true;
      simulationProgress.value = 0;
      progressInfo.value = '正在初始化...';
      
      const progressSteps = [
        { progress: 25, info: '加载数据库...' },
        { progress: 50, info: '构建网格...' },
        { progress: 75, info: '求解方程...' },
        { progress: 100, info: '计算完成！' }
      ];
      
      let stepIndex = 0;
      const updateProgress = () => {
        if (stepIndex < progressSteps.length) {
          const step = progressSteps[stepIndex];
          simulationProgress.value = step.progress;
          progressInfo.value = step.info;
          stepIndex++;
          
          if (step.progress === 100) {
            setTimeout(() => {
              isSimulating.value = false;
              ElMessage.success('模拟计算完成！');
              simulationDialogVisible.value = false;
            }, 1000);
          } else {
            setTimeout(updateProgress, 2000);
          }
        }
      };
      
      setTimeout(updateProgress, 1000);
    };

    const createNewSimulation = () => {
      ElMessage.info('打开自定义模拟向导...');
    };

    return {
      simulationDialogVisible,
      currentSimulation,
      isSimulating,
      simulationProgress,
      progressInfo,
      simulationParams,
      estimatedTime,
      expectedAccuracy,
      openSimulation,
      startSimulation,
      createNewSimulation
    };
  }
};
</script>

<style scoped>
.simulation-calculation {
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.page-header {
  margin-bottom: 32px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.page-title {
  margin: 0;
  color: #2c3e50;
  font-size: 28px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  font-size: 32px;
  color: #3498db;
}

.page-description {
  margin: 8px 0 0 0;
  color: #7f8c8d;
  font-size: 16px;
}

.simulation-card {
  height: 280px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
}

.simulation-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.card-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
}

.card-icon .el-icon {
  font-size: 24px;
}

.phase-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.diffusion-icon { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.micro-icon { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.mechanical-icon { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }

.card-content {
  padding: 20px;
  flex: 1;
}

.card-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.card-description {
  margin: 0 0 16px 0;
  color: #7f8c8d;
  font-size: 14px;
  line-height: 1.5;
}

.card-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #95a5a6;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.card-footer {
  padding: 16px 20px;
  background: #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.usage-count {
  font-size: 12px;
  color: #95a5a6;
}

.simulation-form h4,
.simulation-preview h4 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
}

.preview-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.preview-label {
  color: #7f8c8d;
  font-size: 14px;
}

.preview-value {
  color: #2c3e50;
  font-weight: 600;
  font-size: 14px;
}

.simulation-progress h5 {
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-size: 16px;
}

.progress-info {
  margin: 8px 0 0 0;
  color: #7f8c8d;
  font-size: 14px;
  text-align: center;
}
</style>