<template>
  <div class="pandat-analysis">
    <el-card class="mb-4">
      <template #header>
        <div class="card-header">
          <span>Pandat 多组分相图计算</span>
          <el-button
            type="primary"
            size="small"
            @click="startCalculation"
            :loading="isCalculating"
          >
            <el-icon><Cpu /></el-icon>
            开始计算
          </el-button>
        </div>
      </template>

      <!-- 参数设置区 -->
      <el-form :model="calculationForm" label-width="140px" size="small">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="合金系统">
              <el-select
                v-model="calculationForm.alloySystem"
                placeholder="选择合金系统"
                style="width: 100%"
              >
                <el-option label="Fe-Cr-Ni" value="Fe-Cr-Ni" />
                <el-option label="Al-Cu-Mg" value="Al-Cu-Mg" />
                <el-option label="Ti-Al-V" value="Ti-Al-V" />
                <el-option label="Ni-Cr-Al" value="Ni-Cr-Al" />
                <el-option label="自定义系统" value="custom" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数据库">
              <el-select
                v-model="calculationForm.database"
                placeholder="选择数据库"
                style="width: 100%"
              >
                <el-option label="PanIron (铁基)" value="PanIron" />
                <el-option label="PanAluminum (铝基)" value="PanAluminum" />
                <el-option label="PanNickel (镍基)" value="PanNickel" />
                <el-option label="PanTitanium (钛基)" value="PanTitanium" />
                <el-option label="PanStainless (不锈钢)" value="PanStainless" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="组分设置">
              <div class="system-composition">
                <div class="composition-header">
                  <span class="header-text">多元体系组成设计</span>
                  <div class="header-controls">
                    <el-radio-group v-model="compositionMode" size="small">
                      <el-radio-button label="weight">质量分数</el-radio-button>
                      <el-radio-button label="molar">摩尔分数</el-radio-button>
                    </el-radio-group>
                    <el-button type="primary" size="small" @click="addComponent" plain>
                      <el-icon><Plus /></el-icon>
                      添加组分
                    </el-button>
                  </div>
                </div>
                <div class="elements-container">
                  <div 
                    v-for="(component, index) in calculationForm.components" 
                    :key="index"
                    class="element-item"
                  >
                    <div class="element-selector">
                      <el-select 
                        v-model="component.element" 
                        placeholder="选择元素"
                        size="default"
                        style="width: 100px;"
                      >
                        <el-option-group label="常用元素">
                          <el-option label="Fe" value="Fe" />
                          <el-option label="C" value="C" />
                          <el-option label="Cr" value="Cr" />
                          <el-option label="Ni" value="Ni" />
                          <el-option label="Al" value="Al" />
                          <el-option label="Cu" value="Cu" />
                        </el-option-group>
                        <el-option-group label="其他元素">
                          <el-option label="Mg" value="Mg" />
                          <el-option label="Mn" value="Mn" />
                          <el-option label="Si" value="Si" />
                          <el-option label="Ti" value="Ti" />
                          <el-option label="V" value="V" />
                          <el-option label="Mo" value="Mo" />
                        </el-option-group>
                      </el-select>
                    </div>
                    <div class="fraction-control">
                      <div class="fraction-label">
                        {{ compositionMode === 'molar' ? '摩尔分数' : '质量分数' }}
                      </div>
                      <div class="fraction-input-group">
                        <el-input-number
                          v-model="component.fraction"
                          :min="0"
                          :max="1"
                          :precision="4"
                          :step="0.001"
                          size="default"
                          style="width: 140px;"
                        />
                        <div class="fraction-slider">
                          <el-slider
                            v-model="component.fraction"
                            :min="0"
                            :max="1"
                            :step="0.001"
                            show-tooltip
                            :format-tooltip="formatTooltip"
                          />
                        </div>
                      </div>
                    </div>
                    <div class="element-actions">
                      <el-button 
                        type="danger" 
                        size="small" 
                        @click="removeComponent(index)"
                        v-if="calculationForm.components.length > 2"
                        circle
                        plain
                      >
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                  </div>
                </div>
                <div class="composition-status">
                  <div class="status-info">
                    <div class="total-fraction">
                      <span class="label">总计:</span>
                      <span class="value" :class="{ 'warning': Math.abs(totalFraction - 1) > 0.001 }">
                        {{ totalFraction.toFixed(4) }}
                      </span>
                      <span class="status-icon">
                        <el-icon v-if="Math.abs(totalFraction - 1) <= 0.001" color="#67c23a"><Check /></el-icon>
                        <el-icon v-else color="#f56c6c"><Warning /></el-icon>
                      </span>
                    </div>
                  </div>
                  <div class="status-actions">
                    <el-button 
                      type="success" 
                      size="small" 
                      @click="normalizeFractions"
                      v-if="Math.abs(totalFraction - 1) > 0.001 && totalFraction > 0"
                      plain
                    >
                      <el-icon><Refresh /></el-icon>
                      归一化
                    </el-button>
                    <el-button 
                      type="info" 
                      size="small" 
                      @click="resetComposition"
                      plain
                    >
                      <el-icon><RefreshLeft /></el-icon>
                      重置
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
                <el-input-number
                  v-model="calculationForm.tempMin"
                  :min="200"
                  :max="3000"
                  placeholder="最低温度(K)"
                  style="width: 48%"
                />
                <span class="range-separator">-</span>
                <el-input-number
                  v-model="calculationForm.tempMax"
                  :min="200"
                  :max="3000"
                  placeholder="最高温度(K)"
                  style="width: 48%"
                />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="压力 (atm)">
              <el-input-number
                v-model="calculationForm.pressure"
                :min="0.1"
                :max="1000"
                :precision="2"
                placeholder="压力"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="计算类型">
              <el-checkbox-group v-model="calculationForm.calculationTypes">
                <el-checkbox label="phase_diagram" border size="small"
                  >相图</el-checkbox
                >
                <el-checkbox label="solidification" border size="small"
                  >凝固模拟</el-checkbox
                >
                <el-checkbox label="phase_fraction" border size="small"
                  >相分数</el-checkbox
                >
                <el-checkbox label="scheil" border size="small"
                  >Scheil模拟</el-checkbox
                >
              </el-checkbox-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="网格精度">
              <el-slider
                v-model="calculationForm.gridAccuracy"
                :min="1"
                :max="10"
                show-stops
                :marks="{ 1: '粗糙', 5: '标准', 10: '精细' }"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 计算进度显示区 -->
    <el-card class="mb-4" v-if="isCalculating">
      <template #header>
        <span>计算进度</span>
      </template>
      <el-progress :percentage="calculationProgress" :status="progressStatus" />
      <div class="mt-2 text-sm text-gray-600">{{ currentStep }}</div>

      <!-- 实时日志 -->
      <el-collapse class="mt-4">
        <el-collapse-item title="计算日志" name="logs">
          <div class="log-container">
            <div
              v-for="(log, index) in calculationLogs"
              :key="index"
              class="log-item"
              :class="getLogClass(log.level)"
            >
              <span class="log-time">[{{ log.time }}]</span>
              <span class="log-level">[{{ log.level }}]</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-card>

    <!-- 结果展示区 -->
    <el-card v-if="calculationResults">
      <template #header>
        <div class="card-header">
          <span>计算结果</span>
          <div>
            <el-button size="small" @click="exportResults">
              <el-icon><Download /></el-icon>
              导出结果
            </el-button>
            <el-button size="small" @click="saveToProject">
              <el-icon><FolderOpened /></el-icon>
              保存项目
            </el-button>
          </div>
        </div>
      </template>

      <el-tabs v-model="resultTab" type="card">
        <!-- 相图展示 -->
        <el-tab-pane label="相图" name="phase_diagram">
          <div ref="phaseDiagramChart" style="width: 100%; height: 450px"></div>
        </el-tab-pane>

        <!-- 相平衡数据 -->
        <el-tab-pane label="相平衡" name="phase_equilibrium">
          <el-table
            :data="phaseEquilibriumData"
            border
            size="small"
            max-height="400"
          >
            <el-table-column prop="temperature" label="温度(K)" width="100" />
            <el-table-column prop="phases" label="稳定相" width="150" />
            <el-table-column prop="composition" label="组分(wt%)" />
            <el-table-column prop="fraction" label="相分数" width="100" />
            <el-table-column label="操作" width="80">
              <template #default="scope">
                <el-button
                  type="text"
                  size="small"
                  @click="viewPhaseDetails(scope.row)"
                >
                  详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 凝固模拟 -->
        <el-tab-pane
          label="凝固分析"
          name="solidification"
          v-if="calculationForm.calculationTypes.includes('solidification')"
        >
          <div
            ref="solidificationChart"
            style="width: 100%; height: 400px"
          ></div>
        </el-tab-pane>

        <!-- 详细数据 -->
        <el-tab-pane label="数据表格" name="data_table">
          <el-table
            :data="detailedData"
            border
            size="small"
            max-height="400"
            stripe
          >
            <el-table-column prop="temp" label="温度(K)" width="90" sortable />
            <el-table-column
              prop="phase1"
              label="相1分数"
              width="100"
              sortable
            />
            <el-table-column
              prop="phase2"
              label="相2分数"
              width="100"
              sortable
            />
            <el-table-column
              prop="phase3"
              label="相3分数"
              width="100"
              sortable
            />
            <el-table-column
              prop="enthalpy"
              label="总焓(J/mol)"
              width="120"
              sortable
            />
            <el-table-column
              prop="volume"
              label="摩尔体积"
              width="100"
              sortable
            />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 相详情对话框 -->
    <el-dialog v-model="phaseDetailVisible" title="相详细信息" width="60%">
      <el-descriptions :column="2" size="small" border v-if="selectedPhase">
        <el-descriptions-item label="温度"
          >{{ selectedPhase.temperature }} K</el-descriptions-item
        >
        <el-descriptions-item label="相名称">{{
          selectedPhase.phases
        }}</el-descriptions-item>
        <el-descriptions-item label="相分数">{{
          selectedPhase.fraction
        }}</el-descriptions-item>
        <el-descriptions-item label="组分">{{
          selectedPhase.composition
        }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, nextTick, computed } from "vue";
import * as echarts from "echarts";
import { ElMessage, ElMessageBox } from "element-plus";
import { exportThermoResults } from "@/utils/excelExporter";

export default {
  name: "PandatAnalysis",
  setup() {
    // 新增响应式数据
    const compositionMode = ref('weight');
    
    // 响应式数据
    const calculationForm = ref({
      alloySystem: "Fe-Cr-Ni",
      database: "PanIron",
      components: [
        { element: "Fe", fraction: 0.6 },
        { element: "Cr", fraction: 0.25 },
        { element: "Ni", fraction: 0.15 },
      ],
      tempMin: 800,
      tempMax: 1600,
      pressure: 1.0,
      calculationTypes: ["phase_diagram", "phase_fraction"],
      gridAccuracy: 5,
    });

    const isCalculating = ref(false);
    const calculationProgress = ref(0);
    const progressStatus = ref("");
    const currentStep = ref("");
    const calculationLogs = ref([]);

    const calculationResults = ref(null);
    const resultTab = ref("phase_diagram");
    const phaseDiagramChart = ref(null);
    const solidificationChart = ref(null);

    const phaseDetailVisible = ref(false);
    const selectedPhase = ref(null);

    // 模拟数据
    const phaseEquilibriumData = ref([
      {
        temperature: 1400,
        phases: "LIQUID",
        composition: "Fe:70%, Cr:20%, Ni:10%",
        fraction: 1.0,
      },
      {
        temperature: 1200,
        phases: "LIQUID+FCC_A1",
        composition: "Fe:65%, Cr:22%, Ni:13%",
        fraction: "0.7+0.3",
      },
      {
        temperature: 1000,
        phases: "FCC_A1+BCC_A2",
        composition: "Fe:68%, Cr:18%, Ni:14%",
        fraction: "0.8+0.2",
      },
      {
        temperature: 800,
        phases: "FCC_A1+SIGMA",
        composition: "Fe:70%, Cr:16%, Ni:14%",
        fraction: "0.9+0.1",
      },
    ]);

    const detailedData = ref([
      {
        temp: 1400,
        phase1: 1.0,
        phase2: 0.0,
        phase3: 0.0,
        enthalpy: -45230,
        volume: 7.2,
      },
      {
        temp: 1200,
        phase1: 0.7,
        phase2: 0.3,
        phase3: 0.0,
        enthalpy: -52180,
        volume: 7.1,
      },
      {
        temp: 1000,
        phase1: 0.8,
        phase2: 0.2,
        phase3: 0.0,
        enthalpy: -58940,
        volume: 7.0,
      },
      {
        temp: 800,
        phase1: 0.9,
        phase2: 0.0,
        phase3: 0.1,
        enthalpy: -63520,
        volume: 6.9,
      },
    ]);

    // 开始计算
    const startCalculation = async () => {
      if (
        !calculationForm.value.alloySystem ||
        !calculationForm.value.database
      ) {
        ElMessage.warning("请选择合金系统和数据库");
        return;
      }

      isCalculating.value = true;
      calculationProgress.value = 0;
      progressStatus.value = "";
      currentStep.value = "初始化Pandat计算引擎...";
      calculationLogs.value = [];

      // 模拟计算过程
      const steps = [
        { step: "初始化Pandat计算引擎...", duration: 1000 },
        { step: "加载热力学数据库...", duration: 1500 },
        { step: "设置计算条件...", duration: 800 },
        { step: "生成相图网格...", duration: 2000 },
        { step: "计算相平衡...", duration: 3000 },
        { step: "优化相图边界...", duration: 1500 },
        { step: "生成结果报告...", duration: 500 },
      ];

      for (let i = 0; i < steps.length; i++) {
        currentStep.value = steps[i].step;

        // 添加日志
        addLog("INFO", steps[i].step);

        await new Promise((resolve) => setTimeout(resolve, steps[i].duration));
        calculationProgress.value = Math.round(((i + 1) / steps.length) * 100);
      }

      // 计算完成
      progressStatus.value = "success";
      currentStep.value = "计算完成！";
      addLog("SUCCESS", "Pandat相图计算成功完成");

      // 设置结果数据
      calculationResults.value = {
        phaseDiagram: true,
        phaseEquilibrium: true,
        solidification:
          calculationForm.value.calculationTypes.includes("solidification"),
      };

      // 绘制图表
      await nextTick();
      drawPhaseDiagram();
      if (calculationResults.value.solidification) {
        drawSolidificationChart();
      }

      setTimeout(() => {
        isCalculating.value = false;
        ElMessage.success("Pandat计算完成!");
      }, 1000);
    };

    // 添加日志
    const addLog = (level, message) => {
      calculationLogs.value.push({
        time: new Date().toLocaleTimeString(),
        level,
        message,
      });
    };

    // 获取日志样式
    const getLogClass = (level) => {
      return {
        "log-info": level === "INFO",
        "log-success": level === "SUCCESS",
        "log-warning": level === "WARNING",
        "log-error": level === "ERROR",
      };
    };

    // 添加组分
    const addComponent = () => {
      if (calculationForm.value.components.length < 6) {
        calculationForm.value.components.push({
          element: "",
          fraction: 0,
        });
      } else {
        ElMessage.warning("最多添加6个组分");
      }
    };

    // 移除组分
    const removeComponent = (index) => {
      if (calculationForm.value.components.length > 2) {
        calculationForm.value.components.splice(index, 1);
      } else {
        ElMessage.warning("至少需要保留两个元素");
      }
    };

    // 计算总分数
    const totalFraction = computed(() => {
      return calculationForm.value.components.reduce((total, component) => {
        return total + (component.fraction || 0);
      }, 0);
    });

    // 格式化工具提示
    const formatTooltip = (value) => {
      return `${(value * 100).toFixed(2)}%`;
    };

    // 归一化分数
    const normalizeFractions = () => {
      const total = totalFraction.value;
      if (total > 0) {
        calculationForm.value.components.forEach(component => {
          component.fraction = component.fraction / total;
        });
        ElMessage.success("分数已归一化到1.0");
      }
    };

    // 重置组成
    const resetComposition = () => {
      const componentCount = calculationForm.value.components.length;
      const averageFraction = 1.0 / componentCount;
      calculationForm.value.components.forEach(component => {
        component.fraction = averageFraction;
      });
      ElMessage.info("组成已重置为平均分配");
    };

    // 绘制相图
    const drawPhaseDiagram = () => {
      if (!phaseDiagramChart.value) return;

      const chart = echarts.init(phaseDiagramChart.value);
      const option = {
        title: {
          text: "Fe-Cr-Ni 三元相图",
          left: "center",
        },
        tooltip: {
          trigger: "item",
          formatter: function (params) {
            return `温度: ${params.value[1]}K<br/>组分: ${params.value[0]}%<br/>相: ${params.name}`;
          },
        },
        legend: {
          data: ["液相区", "奥氏体", "铁素体", "σ相"],
          top: 30,
        },
        xAxis: {
          type: "value",
          name: "Cr含量 (wt%)",
          min: 0,
          max: 30,
        },
        yAxis: {
          type: "value",
          name: "温度 (K)",
          min: 800,
          max: 1600,
        },
        series: [
          {
            name: "液相区",
            type: "scatter",
            data: [
              [15, 1400],
              [18, 1350],
              [20, 1300],
              [22, 1250],
            ],
            symbolSize: 8,
            itemStyle: { color: "#ff6b6b" },
          },
          {
            name: "奥氏体",
            type: "scatter",
            data: [
              [16, 1200],
              [18, 1150],
              [20, 1100],
              [22, 1050],
            ],
            symbolSize: 8,
            itemStyle: { color: "#4ecdc4" },
          },
          {
            name: "铁素体",
            type: "scatter",
            data: [
              [20, 1000],
              [22, 950],
              [24, 900],
              [26, 850],
            ],
            symbolSize: 8,
            itemStyle: { color: "#45b7d1" },
          },
          {
            name: "σ相",
            type: "scatter",
            data: [
              [22, 800],
              [24, 820],
              [26, 840],
              [28, 860],
            ],
            symbolSize: 8,
            itemStyle: { color: "#f7dc6f" },
          },
        ],
      };
      chart.setOption(option);
    };

    // 绘制凝固分析图
    const drawSolidificationChart = () => {
      if (!solidificationChart.value) return;

      const chart = echarts.init(solidificationChart.value);
      const option = {
        title: {
          text: "凝固过程相分数变化",
          left: "center",
        },
        tooltip: {
          trigger: "axis",
        },
        legend: {
          data: ["液相", "奥氏体", "铁素体"],
          top: 30,
        },
        xAxis: {
          type: "value",
          name: "温度 (K)",
          inverse: true,
        },
        yAxis: {
          type: "value",
          name: "相分数",
          min: 0,
          max: 1,
        },
        series: [
          {
            name: "液相",
            type: "line",
            data: [
              [1400, 1.0],
              [1300, 0.8],
              [1200, 0.5],
              [1100, 0.2],
              [1000, 0.0],
            ],
            lineStyle: { color: "#ff6b6b", width: 3 },
          },
          {
            name: "奥氏体",
            type: "line",
            data: [
              [1300, 0.2],
              [1200, 0.5],
              [1100, 0.8],
              [1000, 0.85],
              [900, 0.9],
            ],
            lineStyle: { color: "#4ecdc4", width: 3 },
          },
          {
            name: "铁素体",
            type: "line",
            data: [
              [1100, 0.0],
              [1000, 0.15],
              [900, 0.1],
              [800, 0.1],
            ],
            lineStyle: { color: "#45b7d1", width: 3 },
          },
        ],
      };
      chart.setOption(option);
    };

    // 查看相详情
    const viewPhaseDetails = (row) => {
      selectedPhase.value = row;
      phaseDetailVisible.value = true;
    };

    // 导出结果
    const exportResults = () => {
      if (!calculationResults.value) {
        ElMessage.warning("请先完成计算");
        return;
      }

      // 准备导出数据
      const exportData = {
        parameters: {
          合金系统: calculationForm.value.alloySystem,
          数据库: calculationForm.value.database,
          组分设置: calculationForm.value.components
            .map((c) => `${c.element}: ${c.min}-${c.max}%`)
            .join(", "),
          温度范围: `${calculationForm.value.tempMin} - ${calculationForm.value.tempMax} K`,
          压力: `${calculationForm.value.pressure} atm`,
          计算类型: calculationForm.value.calculationTypes.join(", "),
          网格精度: calculationForm.value.gridAccuracy,
        },
        tableData: phaseEquilibriumData.value.map((item) => ({
          "温度(K)": item.temperature,
          稳定相: item.phases,
          "组分(wt%)": item.composition,
          相分数: item.fraction,
        })),
        tableHeaders: [
          { prop: "温度(K)", label: "温度(K)", width: 12 },
          { prop: "稳定相", label: "稳定相", width: 20 },
          { prop: "组分(wt%)", label: "组分(wt%)", width: 25 },
          { prop: "相分数", label: "相分数", width: 12 },
        ],
        detailedTableData: detailedData.value.map((item) => ({
          "温度(K)": item.temp,
          相一分数: item.phase1,
          相二分数: item.phase2,
          相三分数: item.phase3,
          "焓(J/mol)": item.enthalpy,
          "体积(cm³/mol)": item.volume,
        })),
        chartData: {
          series: [
            {
              name: "奥氏体",
              type: "scatter",
              data: [
                [18, 1200],
                [20, 1150],
                [22, 1100],
              ],
            },
            {
              name: "铁素体",
              type: "scatter",
              data: [
                [15, 900],
                [17, 850],
                [19, 800],
              ],
            },
          ],
        },
        logs: calculationLogs.value,
      };

      try {
        exportThermoResults("Pandat计算结果", exportData);
        ElMessage.success("结果已导出Excel文件");
      } catch (error) {
        console.error("导出失败:", error);
        ElMessage.error("导出失败，请重试");
      }
    };

    // 保存项目
    const saveToProject = () => {
      ElMessage.success("项目已保存");
    };

    onMounted(() => {
      // 组件挂载时的初始化
    });

    return {
      compositionMode,
      calculationForm,
      isCalculating,
      calculationProgress,
      progressStatus,
      currentStep,
      calculationLogs,
      calculationResults,
      resultTab,
      phaseDiagramChart,
      solidificationChart,
      phaseDetailVisible,
      selectedPhase,
      phaseEquilibriumData,
      detailedData,
      totalFraction,
      startCalculation,
      addComponent,
      removeComponent,
      formatTooltip,
      normalizeFractions,
      resetComposition,
      getLogClass,
      viewPhaseDetails,
      exportResults,
      saveToProject,
    };
  },
};
</script>

<style scoped>
.pandat-analysis {
  padding: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.temp-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.range-separator {
  color: #666;
  font-weight: bold;
}

.log-container {
  max-height: 200px;
  overflow-y: auto;
  background: #f8f9fa;
  border-radius: 6px;
  padding: 8px;
}

.log-item {
  font-family: "Courier New", monospace;
  font-size: 11px;
  line-height: 1.4;
  margin-bottom: 4px;
  padding: 2px 4px;
  border-radius: 3px;
}

.log-time {
  color: #999;
  margin-right: 8px;
}

.log-level {
  font-weight: 600;
  margin-right: 8px;
}

.log-message {
  color: #333;
}

.log-info {
  background: rgba(64, 158, 255, 0.1);
}

.log-info .log-level {
  color: #409eff;
}

.log-success {
  background: rgba(103, 194, 58, 0.1);
}

.log-success .log-level {
  color: #67c23a;
}

.log-warning {
  background: rgba(230, 162, 60, 0.1);
}

.log-warning .log-level {
  color: #e6a23c;
}

.log-error {
  background: rgba(245, 108, 108, 0.1);
}

.log-error .log-level {
  color: #f56c6c;
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

.text-sm {
  font-size: 14px;
}

.text-gray-600 {
  color: #4b5563;
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

/* 系统组成样式 */
.system-composition {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  background: #fafafa;
}

.composition-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;
}

.header-text {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.elements-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.element-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.element-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.element-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.fraction-control {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fraction-label {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.fraction-input-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.fraction-slider {
  flex: 1;
  padding: 0 8px;
}

.element-actions {
  display: flex;
  align-items: center;
}

.composition-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
}

.status-info {
  display: flex;
  align-items: center;
}

.total-fraction {
  display: flex;
  align-items: center;
  gap: 8px;
}

.total-fraction .label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.total-fraction .value {
  font-size: 16px;
  font-weight: 600;
  color: #67c23a;
}

.total-fraction .value.warning {
  color: #f56c6c;
}

.status-icon {
  display: flex;
  align-items: center;
}

.status-actions {
  display: flex;
  gap: 8px;
}

/* 添加组分按钮文字颜色设置 */
.header-controls .el-button.el-button--primary.is-plain {
  color: white !important;
}

.header-controls .el-button.el-button--primary.is-plain:hover {
  color: white !important;
}
</style>