<template>
  <div class="thermo-optimization">
    <el-card class="mb-4">
      <template #header>
        <div class="card-header">
          <span>热力学参数优化模块</span>
          <div>
            <el-button
              type="primary"
              size="small"
              @click="startOptimization"
              :loading="isOptimizing"
            >
              <el-icon><TrendCharts /></el-icon>
              开始优化
            </el-button>
            <el-button
              type="success"
              size="small"
              @click="importExperimentalData"
            >
              <el-icon><Upload /></el-icon>
              导入实验数据
            </el-button>
          </div>
        </div>
      </template>

      <!-- 优化设置区 -->
      <el-form :model="optimizationForm" label-width="140px" size="small">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="优化算法">
              <el-select
                v-model="optimizationForm.algorithm"
                placeholder="选择优化算法"
                style="width: 100%"
              >
                <el-option label="遗传算法 (GA)" value="genetic" />
                <el-option label="粒子群优化 (PSO)" value="pso" />
                <el-option label="模拟退火 (SA)" value="simulated_annealing" />
                <el-option label="Levenberg-Marquardt" value="lm" />
                <el-option label="BFGS拟牛顿法" value="bfgs" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="目标函数">
              <el-select
                v-model="optimizationForm.objective"
                placeholder="选择目标函数"
                style="width: 100%"
              >
                <el-option label="最小二乘法" value="least_squares" />
                <el-option label="加权最小二乘" value="weighted_least_squares" />
                <el-option label="最大似然估计" value="maximum_likelihood" />
                <el-option label="贝叶斯优化" value="bayesian" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 待优化参数 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="优化参数">
              <div class="parameter-optimization">
                <div class="param-header">
                  <span class="header-text">CALPHAD参数优化</span>
                  <el-button type="primary" size="small" @click="addParameter" plain>
                    <el-icon><Plus /></el-icon>
                    添加参数
                  </el-button>
                </div>
                <div class="parameters-container">
                  <div 
                    v-for="(param, index) in optimizationForm.parameters" 
                    :key="index"
                    class="parameter-item"
                  >
                    <div class="param-type">
                      <el-select v-model="param.type" placeholder="参数类型" style="width: 120px;">
                        <el-option label="L0" value="L0" />
                        <el-option label="L1" value="L1" />
                        <el-option label="L2" value="L2" />
                        <el-option label="G参数" value="G" />
                        <el-option label="TC参数" value="TC" />
                      </el-select>
                    </div>
                    <div class="param-elements">
                      <el-input
                        v-model="param.elements"
                        placeholder="如: Fe,C"
                        style="width: 100px;"
                      />
                    </div>
                    <div class="param-bounds">
                      <span class="bounds-label">参数范围:</span>
                      <el-input-number
                        v-model="param.minValue"
                        :precision="2"
                        :step="100"
                        placeholder="最小值"
                        style="width: 100px;"
                      />
                      <span class="range-separator">~</span>
                      <el-input-number
                        v-model="param.maxValue"
                        :precision="2"
                        :step="100"
                        placeholder="最大值"
                        style="width: 100px;"
                      />
                    </div>
                    <div class="param-weight">
                      <span class="weight-label">权重:</span>
                      <el-input-number
                        v-model="param.weight"
                        :min="0"
                        :max="10"
                        :precision="1"
                        :step="0.1"
                        style="width: 80px;"
                      />
                    </div>
                    <div class="param-actions">
                      <el-button 
                        type="danger" 
                        size="small" 
                        @click="removeParameter(index)"
                        circle
                        plain
                      >
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 实验数据设置 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="实验数据权重">
              <div class="experimental-data-config">
                <el-table :data="experimentalDataTypes" size="small">
                  <el-table-column prop="type" label="数据类型" width="150" />
                  <el-table-column prop="description" label="描述" />
                  <el-table-column label="权重" width="120">
                    <template #default="scope">
                      <el-input-number
                        v-model="scope.row.weight"
                        :min="0"
                        :max="10"
                        :precision="1"
                        :step="0.1"
                        size="small"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column label="状态" width="100">
                    <template #default="scope">
                      <el-switch v-model="scope.row.enabled" size="small" />
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 算法参数 -->
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="最大迭代次数">
              <el-input-number
                v-model="optimizationForm.maxIterations"
                :min="10"
                :max="10000"
                :step="10"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="收敛精度">
              <el-input-number
                v-model="optimizationForm.convergenceTolerance"
                :min="1e-8"
                :max="1e-2"
                :precision="8"
                :step="1e-6"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="种群大小">
              <el-input-number
                v-model="optimizationForm.populationSize"
                :min="10"
                :max="1000"
                :step="10"
                style="width: 100%"
                v-if="optimizationForm.algorithm === 'genetic' || optimizationForm.algorithm === 'pso'"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 优化进度显示 -->
    <el-card class="mb-4" v-if="isOptimizing">
      <template #header>
        <span>优化进度</span>
      </template>
      <div class="optimization-progress">
        <el-progress :percentage="optimizationProgress" :status="progressStatus" />
        <div class="progress-info">
          <div class="progress-text">{{ currentTask }}</div>
          <div class="progress-metrics">
            <span>当前迭代: {{ currentIteration }}/{{ optimizationForm.maxIterations }}</span>
            <span>目标函数值: {{ currentObjectiveValue }}</span>
            <span>最佳适应度: {{ bestFitness }}</span>
          </div>
        </div>
        
        <!-- 实时优化图表 -->
        <div class="optimization-charts">
          <el-row :gutter="20">
            <el-col :span="12">
              <div ref="convergenceChart" style="width: 100%; height: 300px;"></div>
            </el-col>
            <el-col :span="12">
              <div ref="parameterChart" style="width: 100%; height: 300px;"></div>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-card>

    <!-- 优化结果 -->
    <el-card v-if="optimizationResults">
      <template #header>
        <div class="card-header">
          <span>优化结果</span>
          <div>
            <el-button size="small" @click="exportOptimizationResults">
              <el-icon><Download /></el-icon>
              导出结果
            </el-button>
            <el-button size="small" @click="applyOptimizedParameters">
              <el-icon><Check /></el-icon>
              应用参数
            </el-button>
          </div>
        </div>
      </template>

      <el-tabs v-model="resultTab" type="card">
        <!-- 优化参数结果 -->
        <el-tab-pane label="优化参数" name="parameters">
          <div class="optimized-parameters">
            <h4>优化后的CALPHAD参数</h4>
            <el-table :data="optimizationResults.parameters" border>
              <el-table-column prop="type" label="参数类型" width="100" />
              <el-table-column prop="elements" label="元素对" width="120" />
              <el-table-column prop="originalValue" label="原始值" width="120" />
              <el-table-column prop="optimizedValue" label="优化值" width="120" />
              <el-table-column prop="improvement" label="改进程度" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.improvement > 0 ? 'success' : 'danger'">
                    {{ scope.row.improvement > 0 ? '+' : '' }}{{ scope.row.improvement }}%
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="uncertainty" label="不确定度" />
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 拟合质量 -->
        <el-tab-pane label="拟合质量" name="fitting_quality">
          <div class="fitting-quality">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-card class="quality-card">
                  <h4>统计指标</h4>
                  <el-descriptions :column="1" size="small">
                    <el-descriptions-item label="R² 决定系数">
                      {{ optimizationResults.statistics.rSquared }}
                    </el-descriptions-item>
                    <el-descriptions-item label="均方根误差">
                      {{ optimizationResults.statistics.rmse }}
                    </el-descriptions-item>
                    <el-descriptions-item label="平均绝对误差">
                      {{ optimizationResults.statistics.mae }}
                    </el-descriptions-item>
                    <el-descriptions-item label="最大误差">
                      {{ optimizationResults.statistics.maxError }}
                    </el-descriptions-item>
                  </el-descriptions>
                </el-card>
              </el-col>
              <el-col :span="12">
                <el-card class="quality-card">
                  <h4>置信度分析</h4>
                  <el-descriptions :column="1" size="small">
                    <el-descriptions-item label="95%置信区间">
                      {{ optimizationResults.confidence.interval95 }}
                    </el-descriptions-item>
                    <el-descriptions-item label="参数相关性">
                      {{ optimizationResults.confidence.correlation }}
                    </el-descriptions-item>
                    <el-descriptions-item label="显著性水平">
                      {{ optimizationResults.confidence.significance }}
                    </el-descriptions-item>
                  </el-descriptions>
                </el-card>
              </el-col>
            </el-row>
            
            <!-- 拟合对比图 -->
            <div class="fitting-comparison mt-4">
              <h4>实验数据与计算值对比</h4>
              <div ref="fittingChart" style="width: 100%; height: 400px;"></div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 验证结果 -->
        <el-tab-pane label="验证结果" name="validation">
          <div class="validation-results">
            <h4>交叉验证结果</h4>
            <el-table :data="optimizationResults.validation" border>
              <el-table-column prop="dataSet" label="数据集" />
              <el-table-column prop="predictedValue" label="预测值" />
              <el-table-column prop="experimentalValue" label="实验值" />
              <el-table-column prop="error" label="误差" />
              <el-table-column prop="errorPercentage" label="相对误差(%)" />
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from "vue";
import * as echarts from "echarts";
import { ElMessage } from "element-plus";

export default {
  name: "ThermoOptimization",
  setup() {
    // 响应式数据
    const optimizationForm = ref({
      algorithm: "genetic",
      objective: "least_squares",
      parameters: [
        {
          type: "L0",
          elements: "Fe,C",
          minValue: -50000,
          maxValue: 0,
          weight: 1.0
        }
      ],
      maxIterations: 1000,
      convergenceTolerance: 1e-6,
      populationSize: 50
    });

    const isOptimizing = ref(false);
    const optimizationProgress = ref(0);
    const progressStatus = ref("");
    const currentTask = ref("");
    const currentIteration = ref(0);
    const currentObjectiveValue = ref(0);
    const bestFitness = ref(0);

    const optimizationResults = ref(null);
    const resultTab = ref("parameters");

    // 实验数据类型配置
    const experimentalDataTypes = ref([
      { type: "形成焓", description: "合金形成焓实验数据", weight: 2.0, enabled: true },
      { type: "相变温度", description: "相变点温度测量", weight: 1.5, enabled: true },
      { type: "活度", description: "组元活度系数", weight: 1.0, enabled: true },
      { type: "相图", description: "相图边界实验点", weight: 1.8, enabled: true },
      { type: "热容", description: "热容量温度依赖性", weight: 0.8, enabled: false }
    ]);

    // 图表引用
    const convergenceChart = ref(null);
    const parameterChart = ref(null);
    const fittingChart = ref(null);

    // 方法
    const addParameter = () => {
      optimizationForm.value.parameters.push({
        type: "L0",
        elements: "",
        minValue: -50000,
        maxValue: 50000,
        weight: 1.0
      });
    };

    const removeParameter = (index) => {
      optimizationForm.value.parameters.splice(index, 1);
    };

    const importExperimentalData = () => {
      ElMessage.info("导入实验数据功能开发中...");
    };

    const startOptimization = async () => {
      if (optimizationForm.value.parameters.length === 0) {
        ElMessage.warning("请至少添加一个待优化参数");
        return;
      }

      isOptimizing.value = true;
      optimizationProgress.value = 0;
      progressStatus.value = "";
      currentTask.value = "初始化优化算法...";
      currentIteration.value = 0;

      // 模拟优化过程
      const totalIterations = optimizationForm.value.maxIterations;
      for (let i = 0; i <= totalIterations; i += 10) {
        currentIteration.value = i;
        currentTask.value = `第 ${i} 次迭代 - ${optimizationForm.value.algorithm.toUpperCase()} 算法`;
        currentObjectiveValue.value = (Math.random() * 1000).toFixed(4);
        bestFitness.value = (1 - i / totalIterations + Math.random() * 0.1).toFixed(6);
        
        optimizationProgress.value = Math.round((i / totalIterations) * 100);
        
        if (convergenceChart.value) {
          updateConvergenceChart();
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // 优化完成
      progressStatus.value = "success";
      currentTask.value = "优化完成！";
      optimizationProgress.value = 100;

      // 生成模拟结果
      optimizationResults.value = {
        parameters: optimizationForm.value.parameters.map((param, index) => ({
          type: param.type,
          elements: param.elements,
          originalValue: (param.minValue + Math.random() * (param.maxValue - param.minValue)).toFixed(2),
          optimizedValue: (param.minValue + Math.random() * (param.maxValue - param.minValue)).toFixed(2),
          improvement: (Math.random() * 20 - 5).toFixed(1),
          uncertainty: `±${(Math.random() * 100).toFixed(1)}`
        })),
        statistics: {
          rSquared: (0.85 + Math.random() * 0.14).toFixed(4),
          rmse: (Math.random() * 50).toFixed(2),
          mae: (Math.random() * 30).toFixed(2),
          maxError: (Math.random() * 100).toFixed(2)
        },
        confidence: {
          interval95: "±15.6 J/mol",
          correlation: "0.89",
          significance: "< 0.01"
        },
        validation: [
          { dataSet: "训练集", predictedValue: "125.6", experimentalValue: "128.2", error: "-2.6", errorPercentage: "2.0" },
          { dataSet: "验证集", predictedValue: "89.3", experimentalValue: "91.1", error: "-1.8", errorPercentage: "2.0" },
          { dataSet: "测试集", predictedValue: "156.8", experimentalValue: "154.9", error: "1.9", errorPercentage: "1.2" }
        ]
      };

      setTimeout(() => {
        isOptimizing.value = false;
        ElMessage.success("参数优化完成！");
        nextTick(() => {
          drawFittingChart();
        });
      }, 1000);
    };

    const updateConvergenceChart = () => {
      if (!convergenceChart.value) return;

      const chart = echarts.init(convergenceChart.value);
      const option = {
        title: { text: "收敛曲线", left: "center", textStyle: { fontSize: 14 } },
        tooltip: { trigger: "axis" },
        xAxis: { type: "value", name: "迭代次数" },
        yAxis: { type: "value", name: "目标函数值", scale: true },
        series: [{
          name: "目标函数值",
          type: "line",
          data: [[currentIteration.value, parseFloat(currentObjectiveValue.value)]],
          lineStyle: { color: "#409EFF", width: 2 },
          symbol: "circle",
          symbolSize: 4
        }]
      };
      chart.setOption(option);
    };

    const drawFittingChart = () => {
      if (!fittingChart.value) return;

      const chart = echarts.init(fittingChart.value);
      const experimentalData = [];
      const calculatedData = [];
      
      // 生成模拟数据
      for (let i = 0; i < 50; i++) {
        const x = 300 + i * 30;
        const expValue = -15 + Math.sin(i * 0.2) * 3 + Math.random() * 2;
        const calcValue = expValue + (Math.random() - 0.5) * 1;
        experimentalData.push([x, expValue]);
        calculatedData.push([x, calcValue]);
      }

      const option = {
        title: { text: "实验值 vs 计算值对比", left: "center" },
        tooltip: { trigger: "axis" },
        legend: { data: ["实验数据", "计算数据"], top: 30 },
        xAxis: { type: "value", name: "温度 (K)" },
        yAxis: { type: "value", name: "形成焓 (kJ/mol)" },
        series: [
          {
            name: "实验数据",
            type: "scatter",
            data: experimentalData,
            itemStyle: { color: "#E6A23C" },
            symbolSize: 6
          },
          {
            name: "计算数据",
            type: "line",
            data: calculatedData,
            lineStyle: { color: "#67C23A", width: 2 },
            symbol: "none"
          }
        ]
      };
      chart.setOption(option);
    };

    const exportOptimizationResults = () => {
      ElMessage.success("优化结果已导出");
    };

    const applyOptimizedParameters = () => {
      ElMessage.success("优化参数已应用到模型中");
    };

    return {
      optimizationForm,
      isOptimizing,
      optimizationProgress,
      progressStatus,
      currentTask,
      currentIteration,
      currentObjectiveValue,
      bestFitness,
      optimizationResults,
      resultTab,
      experimentalDataTypes,
      convergenceChart,
      parameterChart,
      fittingChart,
      addParameter,
      removeParameter,
      importExperimentalData,
      startOptimization,
      exportOptimizationResults,
      applyOptimizedParameters
    };
  }
};
</script>

<style scoped>
.thermo-optimization {
  padding: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.parameter-optimization {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 16px;
}

.param-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-text {
  font-weight: 600;
  color: #333;
}

.parameters-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.parameter-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  background: #fafafa;
}

.param-bounds {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bounds-label,
.weight-label {
  font-size: 12px;
  color: #666;
}

.range-separator {
  color: #999;
}

.experimental-data-config {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
}

.optimization-progress {
  padding: 16px 0;
}

.progress-info {
  margin: 16px 0;
}

.progress-text {
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
}

.progress-metrics {
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: #666;
}

.optimization-charts {
  margin-top: 20px;
}

.optimized-parameters h4,
.fitting-quality h4,
.validation-results h4 {
  margin: 0 0 16px 0;
  color: #333;
}

.quality-card {
  height: 100%;
}

.fitting-comparison {
  border-top: 1px solid #e4e7ed;
  padding-top: 16px;
}

/* 添加参数按钮文字颜色设置 */
.param-header .el-button.el-button--primary.is-plain {
  color: white !important;
}

.param-header .el-button.el-button--primary.is-plain:hover {
  color: white !important;
}
</style>