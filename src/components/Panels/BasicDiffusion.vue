<template>
  <div class="basic-diffusion">
    <el-card class="mb-4">
      <template #header>
        <div class="card-header">
          <span>扩散模拟</span>
          <el-button type="primary" size="small" @click="startSimulation" :loading="isSimulating">
            <el-icon><VideoPlay /></el-icon>
            开始模拟
          </el-button>
        </div>
      </template>

      <!-- 基础参数设置 -->
      <el-form :model="diffusionForm" label-width="120px" size="small">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="材料体系">
              <el-select v-model="diffusionForm.materialSystem" style="width: 100%">
                <el-option label="Fe-C" value="Fe-C" />
                <el-option label="Al-Cu" value="Al-Cu" />
                <el-option label="Ni-Cr" value="Ni-Cr" />
                <el-option label="Ti-Al" value="Ti-Al" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="扩散类型">
              <el-radio-group v-model="diffusionForm.diffusionType">
                <el-radio-button label="bulk">体扩散</el-radio-button>
                <el-radio-button label="surface">表面扩散</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="温度(K)">
              <el-input-number 
                v-model="diffusionForm.temperature" 
                :min="273" 
                :max="2000" 
                style="width: 100%" 
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="时间(小时)">
              <el-input-number 
                v-model="diffusionForm.time" 
                :min="0.1" 
                :max="1000" 
                :precision="1"
                style="width: 100%" 
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="初始浓度(%)">
              <el-input-number 
                v-model="diffusionForm.initialConcentration" 
                :min="0" 
                :max="100" 
                :precision="2"
                style="width: 100%" 
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="边界浓度(%)">
              <el-input-number 
                v-model="diffusionForm.boundaryConcentration" 
                :min="0" 
                :max="100" 
                :precision="2"
                style="width: 100%" 
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 计算进度 -->
    <el-card class="mb-4" v-if="isSimulating">
      <template #header>
        <span>计算进度</span>
      </template>
      <div class="progress-content">
        <el-progress :percentage="progress" :status="progressStatus" />
        <div class="progress-text">{{ progressText }}</div>
      </div>
    </el-card>

    <!-- 计算结果 -->
    <el-card v-if="showResults">
      <template #header>
        <div class="card-header">
          <span>扩散计算结果</span>
          <div>
            <el-button size="small" @click="exportData" type="success">
              <el-icon><Download /></el-icon>
              导出数据
            </el-button>
            <el-button size="small" @click="plotProfile" type="info">
              <el-icon><TrendCharts /></el-icon>
              绘制曲线
            </el-button>
          </div>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-descriptions title="扩散参数" :column="1" border>
            <el-descriptions-item label="扩散系数">
              {{ calculationResults.diffusionCoefficient }} cm²/s
            </el-descriptions-item>
            <el-descriptions-item label="扩散长度">
              {{ calculationResults.diffusionLength }} μm
            </el-descriptions-item>
            <el-descriptions-item label="平均浓度梯度">
              {{ calculationResults.concentrationGradient }} %/μm
            </el-descriptions-item>
            <el-descriptions-item label="扩散通量">
              {{ calculationResults.diffusionFlux }} mol/(cm²·s)
            </el-descriptions-item>
          </el-descriptions>
        </el-col>
        <el-col :span="12">
          <div class="result-chart">
            <div ref="chartContainer" style="width: 100%; height: 300px;"></div>
          </div>
        </el-col>
      </el-row>

      <!-- 数据表格 -->
      <div class="data-table mt-4">
        <el-table :data="tableData" border size="small" max-height="250">
          <el-table-column prop="position" label="位置(μm)" width="100" />
          <el-table-column prop="concentration" label="浓度(%)" width="100" />
          <el-table-column prop="flux" label="通量" width="120" />
          <el-table-column prop="time" label="时间(h)" width="100" />
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from "vue";
import * as echarts from "echarts";
import { ElMessage } from "element-plus";

export default {
  name: "BasicDiffusion",
  setup() {
    const diffusionForm = ref({
      materialSystem: "Fe-C",
      diffusionType: "bulk",
      temperature: 1173,
      time: 10,
      initialConcentration: 0.5,
      boundaryConcentration: 1.5
    });

    const isSimulating = ref(false);
    const progress = ref(0);
    const progressStatus = ref("");
    const progressText = ref("");
    const showResults = ref(false);
    const chartContainer = ref(null);

    // 模拟计算结果
    const calculationResults = ref({
      diffusionCoefficient: "2.35e-11",
      diffusionLength: "15.6",
      concentrationGradient: "0.064",
      diffusionFlux: "1.25e-8"
    });

    // 表格数据
    const tableData = ref([
      { position: 0, concentration: 0.5, flux: "1.25e-8", time: 0 },
      { position: 5, concentration: 0.8, flux: "1.12e-8", time: 2.5 },
      { position: 10, concentration: 1.1, flux: "9.8e-9", time: 5.0 },
      { position: 15, concentration: 1.3, flux: "7.2e-9", time: 7.5 },
      { position: 20, concentration: 1.5, flux: "5.1e-9", time: 10.0 }
    ]);

    const startSimulation = async () => {
      isSimulating.value = true;
      progress.value = 0;
      showResults.value = false;

      const steps = [
        "准备计算参数...",
        "读取热力学数据库...",
        "计算扩散系数...",
        "求解扩散方程...",
        "生成结果数据..."
      ];

      for (let i = 0; i < steps.length; i++) {
        progressText.value = steps[i];
        await new Promise(resolve => setTimeout(resolve, 1000));
        progress.value = Math.round(((i + 1) / steps.length) * 100);
      }

      progressStatus.value = "success";
      progressText.value = "计算完成！";
      
      setTimeout(() => {
        isSimulating.value = false;
        showResults.value = true;
        ElMessage.success("扩散模拟计算完成！");
        nextTick(() => drawChart());
      }, 500);
    };

    const drawChart = () => {
      if (chartContainer.value) {
        const chart = echarts.init(chartContainer.value);
        const option = {
          title: {
            text: "浓度分布曲线",
            left: "center",
            textStyle: { fontSize: 14 }
          },
          tooltip: {
            trigger: "axis"
          },
          xAxis: {
            type: "value",
            name: "位置 (μm)",
            nameLocation: "middle",
            nameGap: 25
          },
          yAxis: {
            type: "value",
            name: "浓度 (%)",
            nameLocation: "middle",
            nameGap: 35
          },
          series: [{
            name: "浓度",
            type: "line",
            data: [
              [0, 0.5], [5, 0.8], [10, 1.1], [15, 1.3], [20, 1.5]
            ],
            lineStyle: {
              color: "#409EFF",
              width: 3
            },
            symbol: "circle",
            symbolSize: 6,
            smooth: true
          }]
        };
        chart.setOption(option);
      }
    };

    const exportData = () => {
      ElMessage.success("数据导出功能开发中...");
    };

    const plotProfile = () => {
      ElMessage.info("高级绘图功能开发中...");
    };

    return {
      diffusionForm,
      isSimulating,
      progress,
      progressStatus,
      progressText,
      showResults,
      calculationResults,
      tableData,
      chartContainer,
      startSimulation,
      exportData,
      plotProfile
    };
  }
};
</script>

<style scoped>
.basic-diffusion {
  padding: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.progress-content {
  text-align: center;
  padding: 20px;
}

.progress-text {
  margin-top: 10px;
  color: #666;
  font-size: 14px;
}

.result-chart {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 10px;
}

.data-table {
  border-top: 1px solid #e4e7ed;
  padding-top: 16px;
}

.mb-4 {
  margin-bottom: 16px;
}

.mt-4 {
  margin-top: 16px;
}

:deep(.el-descriptions__title) {
  font-weight: 600;
  margin-bottom: 16px;
}

:deep(.el-card__header) {
  background-color: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
}
</style>