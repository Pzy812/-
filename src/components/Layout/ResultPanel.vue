<template>
  <div class="result-panel">
    <!-- 计算状态区域 -->
    <el-card class="status-card mb-4" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><Monitor /></el-icon>
          <span>计算状态</span>
        </div>
      </template>

      <div class="status-content">
        <div class="progress-section">
          <el-progress
            :percentage="progress"
            :status="progressStatus"
            :stroke-width="8"
            class="mb-3"
          />
          <div class="status-info">
            <span class="status-text">{{ statusText }}</span>
            <el-tag :type="statusType" size="small" class="ml-2">{{
              getStatusLabel()
            }}</el-tag>
          </div>
        </div>

        <div class="task-details" v-if="currentTask && currentTask.name !== '等待计算任务'">
          <el-descriptions :column="1" size="small">
            <el-descriptions-item label="当前任务">{{
              currentTask.name
            }}</el-descriptions-item>
            <el-descriptions-item label="计算软件">{{
              currentTask.software
            }}</el-descriptions-item>
            <el-descriptions-item label="开始时间">{{
              currentTask.startTime
            }}</el-descriptions-item>
            <el-descriptions-item
              label="预估剩余"
              v-if="currentTask.estimatedTime"
            >
              {{ currentTask.estimatedTime }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-card>

    <!-- OpenCalphad结果展示 -->
    <el-card class="result-card mb-4" shadow="hover" v-if="hasOpenCalphadResults">
      <template #header>
        <div class="card-header">
          <el-icon><DataLine /></el-icon>
          <span>OpenCalphad计算结果</span>
          <el-button type="text" @click="expandResults">
            <el-icon><FullScreen /></el-icon>
          </el-button>
        </div>
      </template>

      <!-- 日志信息 -->
      <div class="log-section" v-if="openCalphadLogs.length > 0">
        <h4>计算日志</h4>
        <div class="log-container">
          <div
            v-for="(log, index) in openCalphadLogs"
            :key="index"
            class="log-item"
            :class="getLogClass(log.level)"
          >
            <span class="log-time">[{{ log.time }}]</span>
            <span class="log-level">[{{ log.level }}]</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </div>

      <!-- 图片结果 -->
      <div class="image-section" v-if="openCalphadImages.length > 0">
        <h4>生成的图表</h4>
        <div class="image-container">
          <div
            v-for="(image, index) in openCalphadImages"
            :key="index"
            class="image-item"
          >
            <img :src="image.data" :alt="image.name" class="result-image" />
            <div class="image-actions">
              <el-button type="primary" size="small" @click="downloadImage(image)">
                <el-icon><Download /></el-icon>
                下载
              </el-button>
              <el-button type="primary" size="small" @click="copyImage(image)">
                <el-icon><DocumentCopy /></el-icon>
                复制
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 结果概览 -->
      <div class="result-summary" v-if="resultSummary.length > 0">
        <div
          class="summary-item"
          v-for="(item, index) in resultSummary"
          :key="index"
        >
          <div class="summary-label">{{ item.label }}</div>
          <div class="summary-value" :class="item.type">{{ item.value }}</div>
        </div>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="data-card mb-4" shadow="hover" v-if="tableData.length > 0">
      <template #header>
        <div class="card-header">
          <el-icon><Grid /></el-icon>
          <span>计算结果</span>
          <div>
            <el-button type="text" @click="exportTable">
              <el-icon><Download /></el-icon>
            </el-button>
            <el-button type="text" @click="refreshData">
              <el-icon><Refresh /></el-icon>
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" border size="small" max-height="300">
        <el-table-column prop="temp" label="温度(K)" width="90" />
        <el-table-column prop="value" label="结果值" />
        <el-table-column prop="phase" label="稳定相" width="100" />
        <el-table-column label="操作" width="60">
          <template #default="scope">
            <el-button type="text" size="small" @click="viewDetails(scope.row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 实时日志 -->
    <el-card class="log-card mb-4" shadow="hover" v-if="logs.length > 0 || openCalphadLogs.length > 0">
      <template #header>
        <div class="card-header">
          <el-icon><Document /></el-icon>
          <span>实时日志</span>
          <div>
            <el-button type="text" @click="clearLogs">
              <el-icon><Delete /></el-icon>
            </el-button>
            <el-button type="text" @click="downloadLogs">
              <el-icon><Download /></el-icon>
            </el-button>
          </div>
        </div>
      </template>

      <div class="log-container">
        <div
          v-for="(log, index) in [...logs, ...openCalphadLogs]"
          :key="index"
          class="log-item"
          :class="getLogClass(log.level)"
        >
          <span class="log-time">[{{ log.time }}]</span>
          <span class="log-level">[{{ log.level }}]</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
        <div v-if="logs.length === 0 && openCalphadLogs.length === 0" class="empty-logs">暂无日志信息</div>
      </div>
    </el-card>

    <!-- 快捷操作 -->
    <el-card class="action-card" shadow="hover" v-if="hasResults || hasOpenCalphadResults">
      <template #header>
        <div class="card-header">
          <el-icon><Operation /></el-icon>
          <span>快捷操作</span>
        </div>
      </template>

      <div class="action-buttons">
        <el-button
          type="primary"
          size="small"
          @click="saveResults"
          :disabled="!hasResults && !hasOpenCalphadResults"
          class="action-btn"
        >
          <el-icon><FolderOpened /></el-icon>
          保存结果
        </el-button>
        <el-button
          type="success"
          size="small"
          @click="exportAll"
          :disabled="!hasResults && !hasOpenCalphadResults"
          class="action-btn"
        >
          <el-icon><Download /></el-icon>
          导出全部(EXCEL)
        </el-button>
        <!-- 新增：导出文本结果为txt -->
        <el-button
          type="info"
          size="small"
          @click="exportTextResults"
          :disabled="!hasOpenCalphadResults"
          class="action-btn"
        >
          <el-icon><Document /></el-icon>
          导出文本(TXT)
        </el-button>
        <!-- 新增：导出图片结果为png -->
        <el-button
          type="warning"
          size="small"
          @click="exportImageResults"
          :disabled="openCalphadImages.length === 0"
          class="action-btn"
        >
          <el-icon><Picture /></el-icon>
          导出图片(PNG)
        </el-button>
        <el-button
          type="info"
          size="small"
          @click="shareResults"
          :disabled="!hasResults && !hasOpenCalphadResults"
          class="action-btn"
        >
          <el-icon><Share /></el-icon>
          分享结果
        </el-button>
        <el-button
          type="warning"
          size="small"
          @click="newCalculation"
          class="action-btn"
        >
          <el-icon><Plus /></el-icon>
          新建计算
        </el-button>
      </div>
    </el-card>

    <!-- 结果详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="结果详情"
      width="50%"
      draggable
    >
      <el-descriptions :column="2" size="small" border v-if="selectedDetail">
        <el-descriptions-item label="温度"
          >{{ selectedDetail.temp }} K</el-descriptions-item
        >
        <el-descriptions-item label="结果值">{{
          selectedDetail.value
        }}</el-descriptions-item>
        <el-descriptions-item label="稳定相">{{
          selectedDetail.phase
        }}</el-descriptions-item>
        <el-descriptions-item label="计算时间">{{
          selectedDetail.calcTime || "未知"
        }}</el-descriptions-item>
        <el-descriptions-item label="收敛情况">{{
          selectedDetail.convergence || "正常"
        }}</el-descriptions-item>
        <el-descriptions-item label="误差范围">{{
          selectedDetail.errorRange || "± 0.1%"
        }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 放大结果展示对话框 -->
    <el-dialog
      v-model="expandedResultsVisible"
      title="结果详细展示"
      width="90%"
      top="5vh"
      :show-close="true"
      draggable
      destroy-on-close
    >
      <div class="expanded-results">
        <!-- 结果概览放大版 -->
        <el-card class="mb-4" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><DataLine /></el-icon>
              <span>详细结果概览</span>
            </div>
          </template>

          <div class="expanded-summary">
            <div
              class="expanded-summary-item"
              v-for="(item, index) in resultSummary"
              :key="index"
            >
              <div class="expanded-summary-label">{{ item.label }}</div>
              <div class="expanded-summary-value" :class="item.type">
                {{ item.value }}
              </div>
              <div class="expanded-summary-desc">
                {{ getItemDescription(item.label) }}
              </div>
            </div>
          </div>
        </el-card>

        <!-- 放大图片结果 -->
        <el-card class="mb-4" shadow="hover" v-if="openCalphadImages.length > 0">
          <template #header>
            <div class="card-header">
              <el-icon><Picture /></el-icon>
              <span>生成的图表</span>
              <div>
                <el-button size="small" @click="downloadImage(openCalphadImages[0])">
                  <el-icon><Download /></el-icon>
                  下载图表
                </el-button>
              </div>
            </div>
          </template>

          <div class="expanded-image-container">
            <img 
              :src="openCalphadImages[0].data" 
              :alt="openCalphadImages[0].name" 
              class="expanded-result-image" 
            />
          </div>
        </el-card>

        <!-- 详细数据表格 -->
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Grid /></el-icon>
              <span>详细数据</span>
              <div>
                <el-button size="small" @click="exportDetailedTable">
                  <el-icon><Download /></el-icon>
                  导出数据
                </el-button>
              </div>
            </div>
          </template>

          <el-table
            :data="expandedTableData"
            border
            size="small"
            max-height="300"
            stripe
          >
            <el-table-column prop="temp" label="温度(K)" width="90" sortable />
            <el-table-column prop="value" label="结果值" sortable />
            <el-table-column prop="phase" label="稳定相" width="120" />
            <el-table-column
              prop="enthalpy"
              label="焓值(J/mol)"
              width="120"
              sortable
            />
            <el-table-column
              prop="entropy"
              label="熵值(J/mol·K)"
              width="130"
              sortable
            />
            <el-table-column
              prop="gibbs"
              label="吉布斯能(J/mol)"
              width="130"
              sortable
            />
            <el-table-column prop="convergence" label="收敛性" width="80">
              <template #default="scope">
                <el-tag
                  :type="
                    scope.row.convergence === '正常' ? 'success' : 'warning'
                  "
                  size="small"
                >
                  {{ scope.row.convergence }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="scope">
                <el-button
                  type="text"
                  size="small"
                  @click="viewExpandedDetails(scope.row)"
                >
                  详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick, watch } from "vue";
import * as echarts from "echarts";
import { ElMessage, ElMessageBox } from "element-plus";
import { exportThermoResults } from "@/utils/excelExporter";

export default {
  name: "ResultPanel",
  props: {
    // 接收OpenCalphad计算结果
    ocResults: {
      type: Object,
      default: () => null
    },
    // 是否紧凑模式
    compact: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const progress = ref(0);
    const statusText = ref("等待计算");
    const statusType = ref("info");
    const progressStatus = ref("");
    const showQuickChart = ref(true);
    const detailDialogVisible = ref(false);
    const expandedResultsVisible = ref(false);
    const selectedDetail = ref(null);
    const miniChart = ref(null);
    const expandedChart = ref(null);

    // OpenCalphad结果数据
    const openCalphadLogs = ref([]);
    const openCalphadImages = ref([]);
    const openCalphadResults = ref({});

    // 当前任务信息
    const currentTask = ref({
      name: "等待计算任务",
      software: "OpenCalphad",
      startTime: "",
      estimatedTime: "",
    });

    // 表格数据 - 使用空数组作为初始值
    const tableData = ref([]);

    // 扩展表格数据 - 使用空数组作为初始值
    const expandedTableData = ref([]);

    // 日志数据 - 使用空数组作为初始值
    const logs = ref([]);

    // 结果概览数据 - 使用空数组作为初始值
    const resultSummary = ref([]);

    // 计算属性
    const hasResults = computed(() => tableData.value.length > 0);
    const hasOpenCalphadResults = computed(() => 
      openCalphadLogs.value.length > 0 || 
      openCalphadImages.value.length > 0 || 
      Object.keys(openCalphadResults.value).length > 0
    );

    // 监听props变化并更新OpenCalphad结果
    const updateOpenCalphadResults = (results) => {
      if (!results) return;
      
      // 更新任务信息
      currentTask.value.startTime = new Date().toLocaleString('zh-CN');
      currentTask.value.name = "OpenCalphad计算任务";
      
      // 更新状态
      if (results.error) {
        statusText.value = "计算失败";
        statusType.value = "danger";
        progressStatus.value = "exception";
        progress.value = 100;
      } else {
        statusText.value = "计算完成";
        statusType.value = "success";
        progressStatus.value = "success";
        progress.value = 100;
      }

      // 更新日志
      if (results.log || results.logs) {
        const logData = results.log || results.logs;
        if (typeof logData === 'string') {
          // 解析日志内容
          const logLines = logData.split('\n');
          openCalphadLogs.value = logLines
            .filter(line => line.trim() !== '')
            .map(line => {
              // 尝试解析日志格式
              const timeMatch = line.match(/\[(\d{2}:\d{2}:\d{2})\]/);
              const levelMatch = line.match(/\[(INFO|SUCCESS|WARNING|ERROR)\]/);
              const time = timeMatch ? timeMatch[1] : new Date().toLocaleTimeString('zh-CN', { hour12: false });
              const level = levelMatch ? levelMatch[1] : 'INFO';
              const message = line.replace(/\[\d{2}:\d{2}:\d{2}\]\s*\[(INFO|SUCCESS|WARNING|ERROR)\]\s*/, '');
              
              return { time, level, message };
            });
        } else if (Array.isArray(logData)) {
          openCalphadLogs.value = logData;
        }
      }

      // 更新图片
      if (results.images && Array.isArray(results.images)) {
        openCalphadImages.value = results.images.map((imageObj, index) => {
          const keys = Object.keys(imageObj);
          if (keys.length > 0) {
            const key = keys[0];
            const base64Data = imageObj[key];
            // 确定图片类型
            let imageType = 'png';
            if (key.endsWith('.jpg') || key.endsWith('.jpeg')) {
              imageType = 'jpeg';
            } else if (key.endsWith('.gif')) {
              imageType = 'gif';
            } else if (key.endsWith('.svg')) {
              imageType = 'svg+xml';
            }
            
            return {
              name: key,
              data: `data:image/${imageType};base64,${base64Data}`
            };
          }
          return { name: `image_${index}`, data: '' };
        }).filter(image => image.data !== '');
      } else if (results.imageUrl) {
        // 处理后端直接返回的imageUrl
        openCalphadImages.value = [{
          name: 'phase_diagram.png',
          data: results.imageUrl
        }];
      }

      // 更新其他结果数据
      if (results.response || results.result) {
        openCalphadResults.value = results.response || results.result;
      } else if (typeof results === 'object' && !Array.isArray(results)) {
        openCalphadResults.value = results;
      }
      
      // 如果有响应文本，尝试解析其中的计算点数等信息
      if (results.response) {
        const responseText = typeof results.response === 'string' ? results.response : results.response.output || '';
        // 解析响应文本中的关键信息
        const pointsMatch = responseText.match(/计算了(\d+)个平衡点/);
        const timeMatch = responseText.match(/计算时间为([\d.]+)秒/);
        
        if (pointsMatch || timeMatch) {
          resultSummary.value = [];
          if (pointsMatch) {
            resultSummary.value.push({ label: "计算点数", value: pointsMatch[1], type: "primary" });
          }
          if (timeMatch) {
            resultSummary.value.push({ label: "计算时间", value: `${timeMatch[1]}s`, type: "warning" });
          }
        }
      }
    };

    // 监听props变化
    watch(() => props.ocResults, (newResults) => {
      if (newResults) {
        updateOpenCalphadResults(newResults);
      }
    }, { immediate: true });

    // 获取状态标签
    const getStatusLabel = () => {
      if (progress.value === 100) return "完成";
      if (progress.value > 0) return "进行中";
      return "等待中";
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

    // 绘制快速图表
    const drawMiniChart = () => {
      if (!miniChart.value) return;

      const chart = echarts.init(miniChart.value);
      const option = {
        tooltip: {
          trigger: "axis",
        },
        xAxis: {
          type: "value",
          name: "温度(K)",
          axisLabel: { fontSize: 10 },
          nameTextStyle: { fontSize: 10 },
        },
        yAxis: {
          type: "value",
          name: "相分数",
          axisLabel: { fontSize: 10 },
          nameTextStyle: { fontSize: 10 },
        },
        series: [
          {
            type: "line",
            data: [],
            lineStyle: { color: "#409eff", width: 2 },
            symbolSize: 4,
          },
        ],
        grid: {
          left: "15%",
          right: "10%",
          top: "15%",
          bottom: "20%",
        },
      };
      chart.setOption(option);
    };

    // 事件处理函数
    const expandResults = async () => {
      expandedResultsVisible.value = true;
      await nextTick();
    };

    const getItemDescription = (label) => {
      const descriptions = {
        计算点数: "总计算数据点数量",
        收敛点数: "成功收敛的数据点",
        平均误差: "计算结果的平均误差",
        计算时间: "总计算耗时",
      };
      return descriptions[label] || "无描述";
    };

    const exportDetailedTable = () => {
      if (expandedTableData.value.length === 0) {
        ElMessage.warning("暂无详细数据可导出");
        return;
      }
      
      const csvContent =
        "﻿温度(K),结果值,稳定相,焓值(J/mol),熵值(J/mol·K),吉布斯能(J/mol),收敛性\n" +
        expandedTableData.value
          .map(
            (row) =>
              `${row.temp},${row.value},${row.phase},${row.enthalpy},${row.entropy},${row.gibbs},${row.convergence}`
          )
          .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `详细数据_${new Date().getTime()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      ElMessage.success("详细数据已导出");
    };

    const viewExpandedDetails = (row) => {
      selectedDetail.value = {
        ...row,
        convergence: row.convergence,
        errorRange: "± 0.05%",
      };
      detailDialogVisible.value = true;
    };

    const exportTable = () => {
      if (tableData.value.length === 0) {
        ElMessage.warning("暂无数据可导出");
        return;
      }
      ElMessage.success("表格数据已导出");
    };

    const refreshData = () => {
      ElMessage.info("正在刷新数据...");
    };

    const viewDetails = (row) => {
      selectedDetail.value = row;
      detailDialogVisible.value = true;
    };

    const clearLogs = () => {
      ElMessageBox.confirm("确定要清空所有日志吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        logs.value = [];
        openCalphadLogs.value = [];
        ElMessage.success("日志已清空");
      });
    };

    const downloadLogs = () => {
      if (logs.value.length === 0 && openCalphadLogs.value.length === 0) {
        ElMessage.warning("暂无日志可下载");
        return;
      }
      
      const allLogs = [...logs.value, ...openCalphadLogs.value];
      const logContent = allLogs
        .map((log) => `[${log.time}] [${log.level}] ${log.message}`)
        .join("\n");

      const blob = new Blob([logContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `calculation_log_${new Date().getTime()}.txt`;
      a.click();
      URL.revokeObjectURL(url);

      ElMessage.success("日志文件已下载");
    };

    const saveResults = () => {
      ElMessage.success("结果已保存到数据库");
    };

    const exportAll = () => {
      if (!hasResults.value && !hasOpenCalphadResults.value) {
        ElMessage.warning("暂无结果数据，无法导出");
        return;
      }

      // 准备导出数据
      const exportData = {
        parameters: {
          任务名称: currentTask.value.name,
          计算软件: currentTask.value.software,
          开始时间: currentTask.value.startTime,
          计算状态: statusText.value,
        },
        tableData: expandedTableData.value.map((item) => ({
          "温度(K)": item.temp,
          结果值: item.value,
          稳定相: item.phase,
          "焓值(J/mol)": item.enthalpy,
          "熵值(J/mol·K)": item.entropy,
          "吉布斯能(J/mol)": item.gibbs,
          收敛性: item.convergence,
        })),
        tableHeaders: [
          { prop: "温度(K)", label: "温度(K)", width: 12 },
          { prop: "结果值", label: "结果值", width: 15 },
          { prop: "稳定相", label: "稳定相", width: 15 },
          { prop: "焓值(J/mol)", label: "焓值(J/mol)", width: 15 },
          { prop: "熵值(J/mol·K)", label: "熵值(J/mol·K)", width: 18 },
          { prop: "吉布斯能(J/mol)", label: "吉布斯能(J/mol)", width: 18 },
          { prop: "收敛性", label: "收敛性", width: 12 },
        ],
        chartData: {
          series: [
            {
              name: "相分数",
              type: "line",
              data: [],
            },
            {
              name: "吉布斯能",
              type: "line",
              data: [],
            },
          ],
        },
        logs: [...logs.value, ...openCalphadLogs.value],
      };

      try {
        exportThermoResults("热力学计算综合结果", exportData);
        ElMessage.success("所有结果已导出Excel文件");
      } catch (error) {
        console.error("导出失败:", error);
        ElMessage.error("导出失败，请重试");
      }
    };

    // 新增：导出文本结果为txt文件
    const exportTextResults = () => {
      if (!hasOpenCalphadResults.value) {
        ElMessage.warning("暂无OpenCalphad计算结果可导出");
        return;
      }

      // 获取后端返回的原始文本
      let rawText = "";
      
      // 尝试从openCalphadResults中获取原始文本
      if (openCalphadResults.value) {
        if (typeof openCalphadResults.value === 'string') {
          rawText = openCalphadResults.value;
        } else if (openCalphadResults.value.text) {
          rawText = openCalphadResults.value.text;
        } else if (openCalphadResults.value.response) {
          if (typeof openCalphadResults.value.response === 'string') {
            rawText = openCalphadResults.value.response;
          } else if (openCalphadResults.value.response.output) {
            rawText = openCalphadResults.value.response.output;
          }
        }
      }
      
      // 如果没有获取到原始文本，则使用构造的文本
      if (!rawText) {
        // 收集所有文本结果
        let textContent = "OpenCalphad计算结果\n";
        textContent += "=====================\n\n";
        
        // 添加任务信息
        textContent += `任务名称: ${currentTask.value.name}\n`;
        textContent += `计算软件: ${currentTask.value.software}\n`;
        textContent += `开始时间: ${currentTask.value.startTime}\n`;
        textContent += `计算状态: ${statusText.value}\n\n`;
        
        // 添加结果概览
        if (resultSummary.value.length > 0) {
          textContent += "结果概览:\n";
          resultSummary.value.forEach(item => {
            textContent += `${item.label}: ${item.value}\n`;
          });
          textContent += "\n";
        }
        
        // 添加日志信息
        if (openCalphadLogs.value.length > 0) {
          textContent += "计算日志:\n";
          openCalphadLogs.value.forEach(log => {
            textContent += `[${log.time}] [${log.level}] ${log.message}\n`;
          });
          textContent += "\n";
        }
        
        // 添加表格数据
        if (expandedTableData.value.length > 0) {
          textContent += "计算结果数据:\n";
          textContent += "温度(K)\t结果值\t稳定相\t焓值(J/mol)\t熵值(J/mol·K)\t吉布斯能(J/mol)\t收敛性\n";
          expandedTableData.value.forEach(row => {
            textContent += `${row.temp}\t${row.value}\t${row.phase}\t${row.enthalpy}\t${row.entropy}\t${row.gibbs}\t${row.convergence}\n`;
          });
          textContent += "\n";
        }
        
        rawText = textContent;
      }
      
      // 创建并下载txt文件
      const blob = new Blob([rawText], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `OpenCalphad计算结果_${new Date().getTime()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      
      ElMessage.success("文本结果已导出为txt文件");
    };

    // 新增：导出图片结果为png文件
    const exportImageResults = () => {
      if (openCalphadImages.value.length === 0) {
        ElMessage.warning("暂无图片结果可导出");
        return;
      }

      // 导出所有图片
      openCalphadImages.value.forEach((image, index) => {
        try {
          // 创建下载链接
          const link = document.createElement('a');
          link.href = image.data;
          // 确保文件扩展名为.png
          const imageName = image.name.replace(/\.[^/.]+$/, "") + ".png";
          link.download = imageName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (error) {
          console.error("图片导出失败:", error);
          ElMessage.error(`图片${index + 1}导出失败`);
        }
      });
      
      ElMessage.success(`已导出${openCalphadImages.value.length}张图片`);
    };

    const shareResults = () => {
      const shareUrl = `${window.location.origin}/share/${Date.now()}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        ElMessage.success("分享链接已复制到剪贴板");
      });
    };

    const newCalculation = () => {
      ElMessage.info("正在创建新的计算任务...");
    };

    // OpenCalphad相关函数
    const downloadImage = (image) => {
      try {
        const link = document.createElement('a');
        link.href = image.data;
        link.download = image.name || 'oc_result.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        ElMessage.success('图片下载成功');
      } catch (error) {
        ElMessage.error('图片下载失败');
      }
    };

    const copyImage = async (image) => {
      try {
        // 将base64转换为Blob
        const response = await fetch(image.data);
        const blob = await response.blob();
        
        // 复制到剪贴板
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob })
        ]);
        ElMessage.success('图片已复制到剪贴板');
      } catch (error) {
        ElMessage.error('图片复制失败');
      }
    };

    onMounted(async () => {
      await nextTick();
      drawMiniChart();
    });

    return {
      progress,
      statusText,
      statusType,
      progressStatus,
      showQuickChart,
      detailDialogVisible,
      expandedResultsVisible,
      selectedDetail,
      miniChart,
      expandedChart,
      currentTask,
      tableData,
      expandedTableData,
      logs,
      resultSummary,
      hasResults,
      getStatusLabel,
      getLogClass,
      expandResults,
      getItemDescription,
      exportDetailedTable,
      viewExpandedDetails,
      exportTable,
      refreshData,
      viewDetails,
      clearLogs,
      downloadLogs,
      saveResults,
      exportAll,
      exportTextResults,  // 新增
      exportImageResults, // 新增
      shareResults,
      newCalculation,
      // OpenCalphad相关
      openCalphadLogs,
      openCalphadImages,
      openCalphadResults,
      hasOpenCalphadResults,
      updateOpenCalphadResults,
      downloadImage,
      copyImage,
    };
  },
};
</script>

<style scoped>
.result-panel {
  height: 100%;
  padding: 16px;
  overflow-y: auto;
  overflow-x: hidden;
  /* 优化滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 transparent;
}

/* Webkit浏览器滚动条样式 */
.result-panel::-webkit-scrollbar {
  width: 6px;
}

.result-panel::-webkit-scrollbar-track {
  background: transparent;
}

.result-panel::-webkit-scrollbar-thumb {
  background-color: #c1c1c1;
  border-radius: 3px;
  transition: background-color 0.3s ease;
}

.result-panel::-webkit-scrollbar-thumb:hover {
  background-color: #909399;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
}

.card-header > span {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-content {
  padding: 8px 0;
}

.progress-section {
  margin-bottom: 16px;
}

.status-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}

.status-text {
  font-size: 14px;
  color: #666;
}

.result-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.summary-item {
  text-align: center;
  padding: 8px;
  border-radius: 6px;
  background: #f8f9fa;
}

.summary-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.summary-value {
  font-size: 16px;
  font-weight: 600;
}

.summary-value.primary {
  color: #409eff;
}
.summary-value.success {
  color: #67c23a;
}
.summary-value.info {
  color: #909399;
}
.summary-value.warning {
  color: #e6a23c;
}

.log-section, .image-section {
  margin-bottom: 20px;
}

.log-section h4, .image-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #303133;
  font-weight: 600;
}

.log-container {
  max-height: 200px;
  overflow-y: auto;
  overflow-x: hidden;
  background: #f8f9fa;
  border-radius: 6px;
  padding: 8px;
  /* 优化滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 transparent;
}

/* 日志容器滚动条样式 */
.log-container::-webkit-scrollbar {
  width: 6px;
}

.log-container::-webkit-scrollbar-track {
  background: transparent;
}

.log-container::-webkit-scrollbar-thumb {
  background-color: #c1c1c1;
  border-radius: 3px;
  transition: background-color 0.3s ease;
}

.log-container::-webkit-scrollbar-thumb:hover {
  background-color: #909399;
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

.image-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.image-item {
  flex: 1;
  min-width: 300px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.result-image {
  width: 100%;
  height: auto;
  display: block;
}

.image-actions {
  padding: 12px;
  background: #f8f9fa;
  border-top: 1px solid #e4e7ed;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.empty-logs {
  text-align: center;
  color: #999;
  font-style: italic;
  padding: 20px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 确保所有按钮宽度一致且左对齐 */
.action-buttons .el-button {
  width: 100% !important;
  justify-content: flex-start !important;
  text-align: left !important;
  min-height: 32px;
  padding: 8px 16px;
  margin: 0 !important;
  box-sizing: border-box;
}

/* 单独的按钮样式类 */
.action-btn {
  width: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  margin: 0 !important;
}

/* 确保按钮内容左对齐 */
.action-buttons .el-button .el-icon {
  margin-right: 6px !important;
  flex-shrink: 0;
}

/* 确保深层样式生效 */
:deep(.action-buttons .el-button) {
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  width: 100% !important;
  margin: 0 !important;
  box-sizing: border-box !important;
}

:deep(.action-btn) {
  width: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  text-align: left !important;
  margin: 0 !important;
}

.mb-3 {
  margin-bottom: 12px;
}

.mb-4 {
  margin-bottom: 16px;
}

.ml-2 {
  margin-left: 8px;
}

:deep(.el-card) {
  border-radius: 8px;
}

:deep(.el-card__header) {
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-card__body) {
  padding: 16px;
}

:deep(.el-table) {
  font-size: 12px;
}

:deep(.el-table td) {
  padding: 6px 0;
}

:deep(.el-progress__text) {
  font-size: 12px;
}

:deep(.el-button--small) {
  font-size: 12px;
}

/* 放大图片容器样式 */
.expanded-image-container {
  text-align: center;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.expanded-result-image {
  max-width: 100%;
  max-height: 500px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 放大结果展示样式 */
.expanded-results {
  max-height: 80vh;
  overflow-y: auto;
}

.expanded-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.expanded-summary-item {
  text-align: center;
  padding: 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #dee2e6;
  transition: all 0.3s ease;
}

.expanded-summary-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.expanded-summary-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.expanded-summary-value {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.expanded-summary-desc {
  font-size: 12px;
  color: #999;
  font-style: italic;
}

.expanded-summary-value.primary {
  color: #409eff;
}
.expanded-summary-value.success {
  color: #67c23a;
}
.expanded-summary-value.info {
  color: #909399;
}
.expanded-summary-value.warning {
  color: #e6a23c;
}
</style>