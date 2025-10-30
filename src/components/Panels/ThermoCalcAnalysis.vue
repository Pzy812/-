<template>
  <div class="thermocalc-analysis">
    <el-card class="mb-4">
      <template #header>
        <div class="card-header">
          <span>Thermo-Calc 热力学分析</span>
          <el-button
            type="primary"
            size="small"
            @click="startAnalysis"
            :loading="isAnalyzing"
          >
            <el-icon><Cpu /></el-icon>
            开始分析
          </el-button>
        </div>
      </template>

      <!-- 分析设置 -->
      <el-form :model="analysisForm" label-width="140px" size="small">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分析类型">
              <el-select
                v-model="analysisForm.analysisType"
                placeholder="选择分析类型"
                style="width: 100%"
              >
                <el-option label="单点平衡计算" value="equilibrium" />
                <el-option label="阶跃计算" value="step" />
                <el-option label="性质图计算" value="property" />
                <el-option label="相图计算" value="phase_map" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工作空间">
              <el-select
                v-model="analysisForm.workspace"
                placeholder="选择工作空间"
                style="width: 100%"
              >
                <el-option label="TCFE (钢铁系)" value="TCFE" />
                <el-option label="TCAL (铝合金系)" value="TCAL" />
                <el-option label="TCNI (镍基系)" value="TCNI" />
                <el-option label="TTTI (钛合金系)" value="TTTI" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="元素组成">
              <div class="element-composition">
                <div class="composition-header">
                  <span class="header-text">合金体系组成设计</span>
                  <el-button type="primary" size="small" @click="addElement" plain>
                    <el-icon><Plus /></el-icon>
                    添加元素
                  </el-button>
                </div>
                <div class="elements-grid">
                  <div 
                    v-for="(element, index) in analysisForm.elements" 
                    :key="index"
                    class="element-card"
                  >
                    <div class="element-header">
                      <el-select 
                        v-model="element.symbol" 
                        placeholder="选择元素"
                        size="small"
                        style="width: 80px;"
                      >
                        <el-option label="Fe" value="Fe" />
                        <el-option label="C" value="C" />
                        <el-option label="Cr" value="Cr" />
                        <el-option label="Ni" value="Ni" />
                        <el-option label="Al" value="Al" />
                        <el-option label="Cu" value="Cu" />
                        <el-option label="Mn" value="Mn" />
                        <el-option label="Si" value="Si" />
                        <el-option label="Mo" value="Mo" />
                        <el-option label="Ti" value="Ti" />
                      </el-select>
                      <el-button 
                        type="danger" 
                        size="small" 
                        @click="removeElement(index)"
                        v-if="analysisForm.elements.length > 2"
                        circle
                        plain
                      >
                        <el-icon><Close /></el-icon>
                      </el-button>
                    </div>
                    <div class="element-content">
                      <div class="content-label">含量 (wt%)</div>
                      <el-slider
                        v-model="element.content"
                        :min="0"
                        :max="100"
                        :step="0.1"
                        show-input
                        :input-size="'small'"
                        class="content-slider"
                      />
                    </div>
                    <div class="element-info">
                      <div class="percentage-display">{{ element.content?.toFixed(2) }}%</div>
                    </div>
                  </div>
                </div>
                <div class="composition-summary">
                  <div class="summary-item">
                    <span class="summary-label">总计:</span>
                    <span class="summary-value" :class="{ 'error': totalComposition !== 100 }">
                      {{ totalComposition.toFixed(2) }}%
                    </span>
                  </div>
                  <el-button 
                    type="success" 
                    size="small" 
                    @click="normalizeComposition"
                    v-if="Math.abs(totalComposition - 100) > 0.01"
                    plain
                  >
                    <el-icon><Check /></el-icon>
                    归一化
                  </el-button>
                </div>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="温度条件">
              <el-radio-group v-model="analysisForm.tempType">
                <el-radio label="fixed">固定温度</el-radio>
                <el-radio label="range">温度范围</el-radio>
              </el-radio-group>
              <div class="mt-2" v-if="analysisForm.tempType === 'fixed'">
                <el-input-number
                  v-model="analysisForm.temperature"
                  :min="200"
                  :max="3000"
                  placeholder="温度 (K)"
                  style="width: 100%"
                />
              </div>
              <div class="mt-2" v-else>
                <el-row :gutter="8">
                  <el-col :span="11">
                    <el-input-number
                      v-model="analysisForm.tempStart"
                      :min="200"
                      :max="3000"
                      placeholder="起始温度"
                      style="width: 100%"
                    />
                  </el-col>
                  <el-col :span="2" class="text-center">-</el-col>
                  <el-col :span="11">
                    <el-input-number
                      v-model="analysisForm.tempEnd"
                      :min="200"
                      :max="3000"
                      placeholder="结束温度"
                      style="width: 100%"
                    />
                  </el-col>
                </el-row>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="压力 (Pa)">
              <el-input-number
                v-model="analysisForm.pressure"
                :min="1"
                :max="1e9"
                :precision="0"
                placeholder="压力"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="计算选项">
              <el-checkbox-group v-model="analysisForm.options">
                <el-checkbox label="phase_fraction" border size="small"
                  >相分数</el-checkbox
                >
                <el-checkbox label="activity" border size="small"
                  >活度</el-checkbox
                >
                <el-checkbox label="chemical_potential" border size="small"
                  >化学势</el-checkbox
                >
                <el-checkbox label="driving_force" border size="small"
                  >驱动力</el-checkbox
                >
              </el-checkbox-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计算精度">
              <el-slider
                v-model="analysisForm.accuracy"
                :min="1"
                :max="10"
                show-stops
                :marks="{ 1: '快速', 5: '标准', 10: '精确' }"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 计算状态 -->
    <el-card class="mb-4" v-if="isAnalyzing">
      <template #header>
        <span>分析进度</span>
      </template>
      <el-progress :percentage="analysisProgress" :status="analysisStatus" />
      <div class="mt-2 text-sm text-gray-600">{{ currentTask }}</div>

      <!-- 计算详情 -->
      <el-collapse class="mt-4">
        <el-collapse-item title="计算详情" name="details">
          <el-descriptions :column="2" size="small" border>
            <el-descriptions-item label="当前迭代">{{
              currentIteration
            }}</el-descriptions-item>
            <el-descriptions-item label="收敛精度">{{
              convergence
            }}</el-descriptions-item>
            <el-descriptions-item label="已用时间"
              >{{ elapsedTime }}s</el-descriptions-item
            >
            <el-descriptions-item label="预估剩余"
              >{{ estimatedTime }}s</el-descriptions-item
            >
          </el-descriptions>
        </el-collapse-item>
      </el-collapse>
    </el-card>

    <!-- 分析结果 -->
    <el-card v-if="analysisResults">
      <template #header>
        <div class="card-header">
          <span>分析结果</span>
          <div>
            <el-button size="small" @click="exportAnalysis">
              <el-icon><Download /></el-icon>
              导出分析
            </el-button>
            <el-button size="small" @click="saveToDatabase">
              <el-icon><FolderOpened /></el-icon>
              保存至数据库
            </el-button>
          </div>
        </div>
      </template>

      <el-tabs v-model="resultTab" type="card">
        <!-- 平衡相信息 -->
        <el-tab-pane label="平衡相" name="phases">
          <el-table :data="phaseData" border size="small" max-height="350">
            <el-table-column prop="name" label="相名称" width="120" />
            <el-table-column prop="fraction" label="摩尔分数" width="120">
              <template #default="scope">
                {{ (scope.row.fraction * 100).toFixed(3) }}%
              </template>
            </el-table-column>
            <el-table-column prop="mass_fraction" label="质量分数" width="120">
              <template #default="scope">
                {{ (scope.row.mass_fraction * 100).toFixed(3) }}%
              </template>
            </el-table-column>
            <el-table-column prop="composition" label="主要组成" />
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button
                  type="text"
                  size="small"
                  @click="showPhaseDetails(scope.row)"
                >
                  详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 热力学性质 -->
        <el-tab-pane label="热力学性质" name="properties">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-card class="property-card">
                <h4>基本性质</h4>
                <el-descriptions :column="1" size="small">
                  <el-descriptions-item label="总焓 (J/mol)">{{
                    analysisResults.enthalpy
                  }}</el-descriptions-item>
                  <el-descriptions-item label="总熵 (J/mol·K)">{{
                    analysisResults.entropy
                  }}</el-descriptions-item>
                  <el-descriptions-item label="吉布斯自由能 (J/mol)">{{
                    analysisResults.gibbs
                  }}</el-descriptions-item>
                  <el-descriptions-item label="比热容 (J/mol·K)">{{
                    analysisResults.cp
                  }}</el-descriptions-item>
                </el-descriptions>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card class="property-card">
                <h4>相变信息</h4>
                <el-descriptions :column="1" size="small">
                  <el-descriptions-item label="液相线温度 (K)">{{
                    analysisResults.liquidus
                  }}</el-descriptions-item>
                  <el-descriptions-item label="固相线温度 (K)">{{
                    analysisResults.solidus
                  }}</el-descriptions-item>
                  <el-descriptions-item label="相变焓 (J/mol)">{{
                    analysisResults.transformationEnthalpy
                  }}</el-descriptions-item>
                  <el-descriptions-item label="相变熵 (J/mol·K)">{{
                    analysisResults.transformationEntropy
                  }}</el-descriptions-item>
                </el-descriptions>
              </el-card>
            </el-col>
          </el-row>
        </el-tab-pane>

        <!-- 活度和化学势 -->
        <el-tab-pane label="活度分析" name="activity">
          <div ref="activityChart" style="width: 100%; height: 400px"></div>
        </el-tab-pane>

        <!-- 相图 -->
        <el-tab-pane
          label="相分数变化"
          name="fraction_change"
          v-if="analysisForm.tempType === 'range'"
        >
          <div ref="fractionChart" style="width: 100%; height: 400px"></div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 相详情对话框 -->
    <el-dialog v-model="phaseDetailVisible" title="相详细信息" width="60%">
      <el-descriptions :column="2" size="small" border v-if="selectedPhase">
        <el-descriptions-item label="相名称">{{
          selectedPhase.name
        }}</el-descriptions-item>
        <el-descriptions-item label="晶体结构">{{
          selectedPhase.structure
        }}</el-descriptions-item>
        <el-descriptions-item label="摩尔分数"
          >{{
            (selectedPhase.fraction * 100).toFixed(3)
          }}%</el-descriptions-item
        >
        <el-descriptions-item label="质量分数"
          >{{
            (selectedPhase.mass_fraction * 100).toFixed(3)
          }}%</el-descriptions-item
        >
        <el-descriptions-item label="密度 (g/cm³)">{{
          selectedPhase.density
        }}</el-descriptions-item>
        <el-descriptions-item label="体积分数"
          >{{
            (selectedPhase.volume_fraction * 100).toFixed(3)
          }}%</el-descriptions-item
        >
      </el-descriptions>

      <h4 class="mt-4">元素组成详情</h4>
      <el-table :data="selectedPhase?.elementComposition" border size="small">
        <el-table-column prop="element" label="元素" width="80" />
        <el-table-column prop="content" label="含量 (at%)" width="120" />
        <el-table-column prop="activity" label="活度" width="120" />
        <el-table-column prop="chemicalPotential" label="化学势 (J/mol)" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, nextTick, computed } from "vue";
import * as echarts from "echarts";
import { ElMessage, ElMessageBox } from "element-plus";
import { exportThermoResults } from "@/utils/excelExporter";

export default {
  name: "ThermoCalcAnalysis",
  setup() {
    // 响应式数据
    const analysisForm = ref({
      analysisType: "equilibrium",
      workspace: "TCFE",
      elements: [
        { symbol: "Fe", content: 97.5 },
        { symbol: "C", content: 2.5 },
      ],
      tempType: "fixed",
      temperature: 1000,
      tempStart: 600,
      tempEnd: 1200,
      pressure: 101325,
      options: ["phase_fraction", "activity"],
      accuracy: 5,
    });

    const isAnalyzing = ref(false);
    const analysisProgress = ref(0);
    const analysisStatus = ref("");
    const currentTask = ref("");
    const currentIteration = ref(0);
    const convergence = ref(0);
    const elapsedTime = ref(0);
    const estimatedTime = ref(0);

    const analysisResults = ref(null);
    const resultTab = ref("phases");
    const activityChart = ref(null);
    const fractionChart = ref(null);

    const phaseDetailVisible = ref(false);
    const selectedPhase = ref(null);

    // 模拟数据
    const phaseData = ref([
      {
        name: "FCC_A1",
        fraction: 0.85,
        mass_fraction: 0.88,
        composition: "Fe: 96.8%, C: 3.2%",
        structure: "面心立方",
        density: 7.85,
        volume_fraction: 0.86,
        elementComposition: [
          {
            element: "Fe",
            content: 96.8,
            activity: 0.92,
            chemicalPotential: -98500,
          },
          {
            element: "C",
            content: 3.2,
            activity: 0.15,
            chemicalPotential: -156780,
          },
        ],
      },
      {
        name: "CEMENTITE",
        fraction: 0.15,
        mass_fraction: 0.12,
        composition: "Fe: 75%, C: 25%",
        structure: "正交晶系",
        density: 7.65,
        volume_fraction: 0.14,
        elementComposition: [
          {
            element: "Fe",
            content: 75.0,
            activity: 0.85,
            chemicalPotential: -102300,
          },
          {
            element: "C",
            content: 25.0,
            activity: 1.0,
            chemicalPotential: -145600,
          },
        ],
      },
    ]);

    // 开始分析
    const startAnalysis = async () => {
      if (!analysisForm.value.analysisType || !analysisForm.value.workspace) {
        ElMessage.warning("请选择分析类型和工作空间");
        return;
      }

      isAnalyzing.value = true;
      analysisProgress.value = 0;
      analysisStatus.value = "";
      currentTask.value = "初始化分析...";
      currentIteration.value = 0;
      convergence.value = 0;
      elapsedTime.value = 0;
      estimatedTime.value = 30;

      // 模拟分析过程
      const tasks = [
        { task: "加载热力学数据库...", duration: 1500 },
        { task: "设置计算条件...", duration: 800 },
        { task: "初始化平衡计算...", duration: 1000 },
        { task: "迭代求解...", duration: 3000 },
        { task: "计算热力学性质...", duration: 1200 },
        { task: "生成分析报告...", duration: 500 },
      ];

      for (let i = 0; i < tasks.length; i++) {
        currentTask.value = tasks[i].task;

        // 模拟迭代过程
        if (i === 3) {
          for (let iter = 1; iter <= 50; iter++) {
            currentIteration.value = iter;
            convergence.value = Math.max(1e-8, 1e-3 * Math.exp(-iter / 10));
            await new Promise((resolve) => setTimeout(resolve, 50));
          }
        } else {
          await new Promise((resolve) =>
            setTimeout(resolve, tasks[i].duration)
          );
        }

        analysisProgress.value = Math.round(((i + 1) / tasks.length) * 100);
        elapsedTime.value += tasks[i].duration / 1000;
        estimatedTime.value = Math.max(
          0,
          estimatedTime.value - tasks[i].duration / 1000
        );
      }

      // 模拟分析完成
      analysisStatus.value = "success";
      currentTask.value = "分析完成！";

      // 设置结果数据
      analysisResults.value = {
        enthalpy: -125430.5,
        entropy: 145.8,
        gibbs: -170256.3,
        cp: 25.4,
        liquidus: 1493,
        solidus: 1147,
        transformationEnthalpy: -15800,
        transformationEntropy: -12.5,
      };

      // 绘制图表
      await nextTick();
      drawActivityChart();
      if (analysisForm.value.tempType === "range") {
        drawFractionChart();
      }

      setTimeout(() => {
        isAnalyzing.value = false;
        ElMessage.success("热力学分析完成!");
      }, 1000);
    };

    // 计算总组成
    const totalComposition = computed(() => {
      return analysisForm.value.elements.reduce((total, element) => {
        return total + (element.content || 0);
      }, 0);
    });

    // 添加元素
    const addElement = () => {
      if (analysisForm.value.elements.length < 8) {
        analysisForm.value.elements.push({ symbol: "", content: 0 });
      } else {
        ElMessage.warning("最多添加8个元素");
      }
    };

    // 移除元素
    const removeElement = (index) => {
      if (analysisForm.value.elements.length > 2) {
        analysisForm.value.elements.splice(index, 1);
      } else {
        ElMessage.warning("至少需要保留两个元素");
      }
    };

    // 归一化组成
    const normalizeComposition = () => {
      const total = totalComposition.value;
      if (total > 0) {
        analysisForm.value.elements.forEach(element => {
          element.content = (element.content / total) * 100;
        });
        ElMessage.success("组成已归一化到100%");
      }
    };

    // 绘制活度图表
    const drawActivityChart = () => {
      if (!activityChart.value) return;

      const chart = echarts.init(activityChart.value);
      const option = {
        title: {
          text: "元素活度随温度变化",
          left: "center",
        },
        tooltip: {
          trigger: "axis",
        },
        legend: {
          data: ["Fe活度", "C活度"],
          top: 30,
        },
        xAxis: {
          type: "value",
          name: "温度 (K)",
        },
        yAxis: {
          type: "value",
          name: "活度",
        },
        series: [
          {
            name: "Fe活度",
            type: "line",
            data: [
              [600, 0.95],
              [800, 0.92],
              [1000, 0.88],
              [1200, 0.85],
            ],
            lineStyle: { color: "#ff6b6b" },
          },
          {
            name: "C活度",
            type: "line",
            data: [
              [600, 0.08],
              [800, 0.12],
              [1000, 0.15],
              [1200, 0.18],
            ],
            lineStyle: { color: "#4ecdc4" },
          },
        ],
      };
      chart.setOption(option);
    };

    // 绘制相分数图表
    const drawFractionChart = () => {
      if (!fractionChart.value) return;

      const chart = echarts.init(fractionChart.value);
      const option = {
        title: {
          text: "相分数随温度变化",
          left: "center",
        },
        tooltip: {
          trigger: "axis",
        },
        legend: {
          data: ["FCC_A1", "CEMENTITE"],
          top: 30,
        },
        xAxis: {
          type: "value",
          name: "温度 (K)",
        },
        yAxis: {
          type: "value",
          name: "相分数",
        },
        series: [
          {
            name: "FCC_A1",
            type: "line",
            data: [
              [600, 0.75],
              [800, 0.8],
              [1000, 0.85],
              [1200, 0.95],
            ],
            lineStyle: { color: "#74b9ff" },
          },
          {
            name: "CEMENTITE",
            type: "line",
            data: [
              [600, 0.25],
              [800, 0.2],
              [1000, 0.15],
              [1200, 0.05],
            ],
            lineStyle: { color: "#fd79a8" },
          },
        ],
      };
      chart.setOption(option);
    };

    // 显示相详情
    const showPhaseDetails = (phase) => {
      selectedPhase.value = phase;
      phaseDetailVisible.value = true;
    };

    // 导出分析
    const exportAnalysis = () => {
      if (!analysisResults.value) {
        ElMessage.warning("请先完成分析计算");
        return;
      }

      // 准备导出数据
      const exportData = {
        parameters: {
          分析类型: analysisForm.value.analysisType,
          工作空间: analysisForm.value.workspace,
          体系组成: analysisForm.value.elements
            .map((e) => `${e.symbol}: ${e.content}%`)
            .join(", "),
          温度: `${analysisForm.value.temperature} K`,
          压力: `${analysisForm.value.pressure} atm`,
          计算条件: analysisForm.value.condition,
        },
        properties: {
          活度系数: analysisResults.value.activityCoeff,
          焦耳: analysisResults.value.enthalpy,
          熄: analysisResults.value.entropy,
          吉布斯自由能: analysisResults.value.gibbsEnergy,
          平衡常数: analysisResults.value.equilibriumConstant,
        },
        tableData: phaseData.value.map((phase) => ({
          相名称: phase.name,
          组成: phase.composition,
          摩尔分数: phase.fraction,
          "密度(g/cm³)": phase.density,
          活度: phase.activity,
        })),
        tableHeaders: [
          { prop: "相名称", label: "相名称", width: 15 },
          { prop: "组成", label: "组成", width: 20 },
          { prop: "摩尔分数", label: "摩尔分数", width: 12 },
          { prop: "密度(g/cm³)", label: "密度(g/cm³)", width: 15 },
          { prop: "活度", label: "活度", width: 12 },
        ],
        chartData: {
          series: [
            {
              name: "活度系数",
              type: "line",
              data: [
                [800, 0.85],
                [900, 0.78],
                [1000, 0.72],
                [1100, 0.68],
                [1200, 0.65],
              ],
            },
            {
              name: "相分数",
              type: "line",
              data: [
                [800, 0.95],
                [900, 0.88],
                [1000, 0.82],
                [1100, 0.75],
                [1200, 0.7],
              ],
            },
          ],
        },
      };

      try {
        exportThermoResults("ThermoCalc分析结果", exportData);
        ElMessage.success("分析结果已导出Excel文件");
      } catch (error) {
        console.error("导出失败:", error);
        ElMessage.error("导出失败，请重试");
      }
    };

    // 保存到数据库
    const saveToDatabase = () => {
      ElMessage.success("分析结果已保存至数据库");
    };

    onMounted(() => {
      // 组件挂载时的初始化
    });

    return {
      analysisForm,
      isAnalyzing,
      analysisProgress,
      analysisStatus,
      currentTask,
      currentIteration,
      convergence,
      elapsedTime,
      estimatedTime,
      analysisResults,
      resultTab,
      activityChart,
      fractionChart,
      phaseDetailVisible,
      selectedPhase,
      phaseData,
      totalComposition,
      startAnalysis,
      addElement,
      removeElement,
      normalizeComposition,
      drawActivityChart,
      drawFractionChart,
      showPhaseDetails,
      exportAnalysis,
      saveToDatabase,
    };
  },
};
</script>

<style scoped>
.thermocalc-analysis {
  padding: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.property-card {
  height: 100%;
}

.property-card h4 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 16px;
}

.mb-4 {
  margin-bottom: 16px;
}

.mt-2 {
  margin-top: 8px;
}

.mt-4 {
  margin-top: 16px;
}

.text-center {
  text-align: center;
}

.text-gray-600 {
  color: #4b5563;
}

.text-sm {
  font-size: 14px;
}

:deep(.el-form-item) {
  margin-bottom: 16px;
}

:deep(.el-card) {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

:deep(.el-input-group) {
  display: flex;
}

:deep(.el-input-group .el-select) {
  border-radius: 4px 0 0 4px;
}

:deep(.el-input-group .el-input-number) {
  border-radius: 0 4px 4px 0;
}

/* 元素组成样式 */
.element-composition {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e9ecef;
}

.composition-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e9ecef;
}

.header-text {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.elements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.element-card {
  background: white;
  border-radius: 10px;
  padding: 16px;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
  position: relative;
}

.element-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.element-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.element-content {
  margin: 12px 0;
}

.content-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.content-slider {
  margin-bottom: 8px;
}

.element-info {
  text-align: center;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.percentage-display {
  font-size: 18px;
  font-weight: bold;
  color: #409eff;
  background: linear-gradient(135deg, #409eff, #67c23a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.composition-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.summary-value {
  font-size: 16px;
  font-weight: bold;
  color: #67c23a;
}

.summary-value.error {
  color: #f56c6c;
}

:deep(.el-slider__input) {
  width: 80px !important;
}

:deep(.el-slider__runway) {
  background-color: #e9ecef;
}

:deep(.el-slider__bar) {
  background: linear-gradient(90deg, #409eff, #67c23a);
}

:deep(.el-slider__button) {
  border: 2px solid #409eff;
  background: white;
}

:deep(.el-slider__button:hover) {
  transform: scale(1.2);
}

/* 添加元素按钮文字颜色设置 */
.composition-header .el-button.el-button--primary.is-plain {
  color: white !important;
}

.composition-header .el-button.el-button--primary.is-plain:hover {
  color: white !important;
}</style>