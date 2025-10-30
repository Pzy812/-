<template>
  <div class="phaselab-analysis">
    <el-card class="mb-4">
      <template #header>
        <div class="card-header">
          <span>PhaseLab 相图建模与分析</span>
          <el-button
            type="primary"
            size="small"
            @click="startModeling"
            :loading="isModeling"
          >
            <el-icon><Cpu /></el-icon>
            开始建模
          </el-button>
        </div>
      </template>

      <!-- 参数设置区 -->
      <el-form :model="modelingForm" label-width="140px" size="small">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="建模类型">
              <el-select v-model="modelingForm.modelType" placeholder="选择建模类型" style="width: 100%">
                <el-option label="二元相图" value="binary" />
                <el-option label="三元相图" value="ternary" />
                <el-option label="多元相图" value="multicomponent" />
                <el-option label="相变动力学" value="kinetics" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计算方法">
              <el-select v-model="modelingForm.method" placeholder="选择计算方法" style="width: 100%">
                <el-option label="CALPHAD方法" value="calphad" />
                <el-option label="第一性原理" value="dft" />
                <el-option label="分子动力学" value="md" />
                <el-option label="相场方法" value="phase_field" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="数据库选择">
              <div class="database-selection">
                <div class="database-header">
                  <span class="header-text">热力学数据库配置</span>
                  <el-button type="info" size="small" @click="showDatabaseInfo = true" plain>
                    <el-icon><InfoFilled /></el-icon>
                    数据库详情
                  </el-button>
                </div>
                
                <el-select v-model="modelingForm.database" placeholder="选择热力学数据库" style="width: 100%; margin-top: 10px;">
                  <el-option-group label="商业数据库">
                    <el-option v-for="db in commercialDatabases" :key="db.value" :label="db.label" :value="db.value" />
                  </el-option-group>
                  <el-option-group label="开源数据库">
                    <el-option v-for="db in openDatabases" :key="db.value" :label="db.label" :value="db.value" />
                  </el-option-group>
                </el-select>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="体系组成">
              <div class="system-composition">
                <div class="composition-header">
                  <span class="header-text">多元体系组成设计</span>
                  <el-button type="primary" size="small" @click="addElement" plain>
                    <el-icon><Plus /></el-icon>
                    添加元素
                  </el-button>
                </div>
                <div class="elements-container">
                  <div v-for="(element, index) in modelingForm.elements" :key="index" class="element-item">
                    <el-select v-model="element.symbol" placeholder="选择元素" style="width: 100px;">
                      <el-option label="Fe" value="Fe" />
                      <el-option label="C" value="C" />
                      <el-option label="Al" value="Al" />
                      <el-option label="Cu" value="Cu" />
                      <el-option label="Ni" value="Ni" />
                      <el-option label="Cr" value="Cr" />
                    </el-select>
                    <el-input-number
                      v-model="element.fraction"
                      :min="0"
                      :max="1"
                      :precision="4"
                      :step="0.001"
                      style="width: 140px; margin-left: 10px;"
                    />
                    <el-button 
                      type="danger" 
                      size="small" 
                      @click="removeElement(index)"
                      v-if="modelingForm.elements.length > 2"
                      style="margin-left: 10px;"
                    >
                      删除
                    </el-button>
                  </div>
                </div>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="温度范围">
              <div class="temp-range">
                <el-input-number v-model="modelingForm.tempMin" :min="0" :max="5000" style="width: 48%" />
                <span style="margin: 0 8px;">-</span>
                <el-input-number v-model="modelingForm.tempMax" :min="0" :max="5000" style="width: 48%" />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计算精度">
              <el-slider
                v-model="modelingForm.accuracy"
                :min="1"
                :max="10"
                show-stops
                :marks="{ 1: '快速', 5: '平衡', 10: '高精度' }"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 计算进度显示区 -->
    <el-card class="mb-4" v-if="isModeling">
      <template #header>
        <span>建模进度</span>
      </template>
      <el-progress :percentage="modelingProgress" :status="progressStatus" />
      <div class="mt-2">{{ currentTask }}</div>
    </el-card>

    <!-- 结果展示区 -->
    <el-card v-if="modelingResults">
      <template #header>
        <div class="card-header">
          <span>建模结果</span>
          <el-button size="small" @click="exportData">
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
        </div>
      </template>

      <el-tabs v-model="resultTab" type="card">
        <el-tab-pane label="相图" name="phase_diagram">
          <div ref="phaseDiagramChart" style="width: 100%; height: 450px"></div>
        </el-tab-pane>
        <el-tab-pane label="热力学性质" name="thermodynamics">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="形成焓">{{ modelingResults.formationEnthalpy }} kJ/mol</el-descriptions-item>
            <el-descriptions-item label="结合能">{{ modelingResults.bindingEnergy }} eV/atom</el-descriptions-item>
            <el-descriptions-item label="体积模量">{{ modelingResults.bulkModulus }} GPa</el-descriptions-item>
            <el-descriptions-item label="相变温度">{{ modelingResults.transitionTemp }} K</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 数据库信息对话框 -->
    <el-dialog v-model="showDatabaseInfo" title="热力学数据库技术文档" width="80%">
      <el-tabs v-model="activeDbTab" type="card">
        <el-tab-pane label="数据库概览" name="overview">
          <div class="database-overview">
            <p>数据库技术文档内容，包含详细的数据来源说明、可靠性评估和参考文献信息。</p>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script>
import { ref } from "vue";
import * as echarts from "echarts";
import { ElMessage } from "element-plus";

export default {
  name: "PhaseLabAnalysis",
  setup() {
    const showDatabaseInfo = ref(false);
    const activeDbTab = ref('overview');
    
    const commercialDatabases = ref([
      { value: 'TCFE12', label: 'TCFE12 (铁基合金)' },
      { value: 'TCAL6', label: 'TCAL6 (铝基合金)' }
    ]);
    
    const openDatabases = ref([
      { value: 'NIST-JANAF', label: 'NIST-JANAF 热力学表' },
      { value: 'Open-Calphad', label: 'Open-Calphad 数据库' }
    ]);

    const modelingForm = ref({
      modelType: "binary",
      method: "calphad",
      database: 'TCFE12',
      elements: [
        { symbol: "Fe", fraction: 0.7 },
        { symbol: "C", fraction: 0.3 },
      ],
      tempMin: 300,
      tempMax: 2000,
      accuracy: 5,
    });

    const isModeling = ref(false);
    const modelingProgress = ref(0);
    const progressStatus = ref("");
    const currentTask = ref("");
    const modelingResults = ref(null);
    const resultTab = ref("phase_diagram");
    const phaseDiagramChart = ref(null);

    const addElement = () => {
      if (modelingForm.value.elements.length < 6) {
        modelingForm.value.elements.push({ symbol: "", fraction: 0 });
      } else {
        ElMessage.warning("最多添加6个元素");
      }
    };

    const removeElement = (index) => {
      if (modelingForm.value.elements.length > 2) {
        modelingForm.value.elements.splice(index, 1);
      }
    };

    const startModeling = async () => {
      isModeling.value = true;
      modelingProgress.value = 0;
      currentTask.value = "初始化PhaseLab建模引擎...";

      const steps = ["构建原子结构模型", "第一性原理计算", "热力学积分", "相图构建"];
      for (let i = 0; i < steps.length; i++) {
        currentTask.value = steps[i];
        await new Promise(resolve => setTimeout(resolve, 2000));
        modelingProgress.value = Math.round(((i + 1) / steps.length) * 100);
      }

      progressStatus.value = "success";
      modelingResults.value = {
        formationEnthalpy: -15.6,
        bindingEnergy: -4.2,
        bulkModulus: 180,
        transitionTemp: 1184,
      };

      setTimeout(() => {
        isModeling.value = false;
        ElMessage.success("PhaseLab建模完成!");
      }, 1000);
    };

    const exportData = () => {
      ElMessage.success("数据已导出");
    };

    return {
      showDatabaseInfo,
      activeDbTab,
      commercialDatabases,
      openDatabases,
      modelingForm,
      isModeling,
      modelingProgress,
      progressStatus,
      currentTask,
      modelingResults,
      resultTab,
      phaseDiagramChart,
      addElement,
      removeElement,
      startModeling,
      exportData
    };
  }
};
</script>

<style scoped>
.phaselab-analysis {
  padding: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.database-selection {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 16px;
}

.database-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-text {
  font-weight: 600;
  color: #333;
}

.system-composition {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 16px;
}

.composition-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.elements-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.element-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  background: #fafafa;
}

.temp-range {
  display: flex;
  align-items: center;
}

.mt-2 {
  margin-top: 8px;
}

.mb-4 {
  margin-bottom: 16px;
}

/* 添加元素按钮文字颜色设置 */
.composition-header .el-button.el-button--primary.is-plain {
  color: white !important;
}

.composition-header .el-button.el-button--primary.is-plain:hover {
  color: white !important;
}
</style>