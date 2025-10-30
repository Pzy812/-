<template>
  <div class="case1-phase-diagram">
    <el-card class="mb-4">
      <template #header>
        <div class="card-header">
          <span class="title-large">NiCoCr中熵合金亚稳相图计算</span>
          <el-button
            type="primary"
            size="default"
            @click="runCalculation"
            :loading="isCalculating"
            class="calculate-btn"
          >
            <el-icon><Play /></el-icon>
            开始计算
          </el-button>
        </div>
      </template>

      <!-- 参数设置区 -->
      <el-form :model="formData" label-width="140px" size="default" label-position="left">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="温度 (K)" prop="temperature">
              <el-input-number
                v-model="formData.temperature"
                :min="500"
                :max="1400"
                size="default"
                style="width: 100%"
                controls-position="right"
                placeholder="请输入温度值"

              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="压力 (Pa)" prop="pressure">
              <el-input-number
                v-model="formData.pressure"
                :min="10000"
                size="default"
                style="width: 100%"
                controls-position="right"
                placeholder="10000 Pa以上"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Cr元素摩尔分数" prop="crFraction">
              <el-input-number
                v-model="formData.crFraction"
                :min="0.001"
                :max="0.999"
                :precision="3"
                :step="0.01"
                size="default"
                style="width: 100%"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="X轴起始值" prop="xLow">
              <el-input-number
                v-model="formData.xLow"
                :min="0"
                :max="1"
                :precision="3"
                :step="0.01"
                size="default"
                style="width: 100%"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="X轴结束值" prop="xHigh">
              <el-input-number
                v-model="formData.xHigh"
                :min="0"
                :max="1"
                :precision="3"
                :step="0.01"
                size="default"
                style="width: 100%"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="X轴步长" prop="xStep">
              <el-input-number
                v-model="formData.xStep"
                :min="0"
                :max="0.1"
                :precision="3"
                :step="0.001"
                size="default"
                style="width: 100%"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 添加Y轴温度范围设置，与OCPhaseDiagram.vue保持一致 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Y轴最低温度 (K)">
              <el-input-number
                v-model="formData.yLow"
                :min="0"
                :max="3000"
                size="default"
                style="width: 100%"
                controls-position="right"
                placeholder="请输入最低温度值(0-3000K)"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Y轴最高温度 (K)">
              <el-input-number
                v-model="formData.yHigh"
                :min="0"
                :max="3000"
                size="default"
                style="width: 100%"
                controls-position="right"
                placeholder="请输入最高温度值(0-3000K)"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 温度范围设置结束 -->

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="输出格式">
              <div class="output-format-container">
                <el-checkbox
                  v-model="showLogOutput"
                  size="default"
                  class="output-checkbox"
                >
                  日志
                </el-checkbox>
                <el-checkbox
                  v-model="showPlotOutput"
                  size="default"
                  class="output-checkbox"
                >
                  图形
                </el-checkbox>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 计算过程显示 -->
    <el-card class="mb-4" v-if="isCalculating || (showLogOutput && calculationResult)">
      <template #header>
        <span class="title-large">计算过程</span>
      </template>
      <el-progress :percentage="progress" :status="progressStatus" />
      <div class="mt-2 text-medium text-gray-700">{{ currentStep }}</div>

      <!-- 实时日志 -->
      <el-collapse class="mt-4" v-if="showLogOutput">
        <el-collapse-item title="查看详细日志" name="log">
          <div class="log-container">
            <!-- 显示后端返回的日志信息 -->
            <div v-if="calculationResult && calculationResult.text" class="log-content">
              <pre>{{ calculationResult.text }}</pre>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-card>

    <!-- 结果展示 -->
    <el-card v-if="calculationResult && showPlotOutput">
      <template #header>
        <div class="card-header">
          <span class="title-large">计算结果</span>
          <div>
            <el-button size="default" @click="exportResult">
              <el-icon><Download /></el-icon>
              导出结果
            </el-button>
          </div>
        </div>
      </template>

      <div class="image-container">
        <el-skeleton v-if="isImageLoading" :rows="5" animated />
        <el-image
          v-show="!isImageLoading && !imageError && calculationResult.imageUrl"
          :src="calculationResult.imageUrl"
          fit="contain"
          @load="isImageLoading = false"
          @error="handleImageError"
          class="result-image"
        />
        <div v-if="imageError || !calculationResult.imageUrl" class="image-error">
          <el-icon size="40"><Picture /></el-icon>
          <p>图像加载失败</p>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref } from "vue";
import { ElMessage } from "element-plus";

export default {
  name: "Case1",
  emits: ['case1-results'], // 添加emits声明
  setup(props, { emit }) {
    // 响应式数据
    const formData = ref({
      temperature: 700.0,
      pressure: 100000.0,
      crFraction: 0.3,
      xLow: 0.0,
      xHigh: 1.0,
      xStep: 0.02,
      yLow: 0,
      yHigh: 3000
    });

    // 输出格式控制
    const showLogOutput = ref(true);
    const showPlotOutput = ref(true);

    const isCalculating = ref(false);
    const progress = ref(0);
    const progressStatus = ref("");
    const currentStep = ref("");
    const calculationResult = ref(null);
    const isImageLoading = ref(false);
    const imageError = ref(false);

    // 验证表单数据
    const validateForm = () => {
      // 验证Cr元素摩尔分数
      if (formData.value.crFraction <= 0 || formData.value.crFraction >= 1) {
        ElMessage.warning("Cr元素摩尔分数必须大于0且小于1");
        return false;
      }

      // 验证X轴范围
      if (formData.value.xLow < 0 || formData.value.xLow > 1) {
        ElMessage.warning("X轴起始值必须在0-1范围内");
        return false;
      }

      if (formData.value.xHigh < 0 || formData.value.xHigh > 1) {
        ElMessage.warning("X轴结束值必须在0-1范围内");
        return false;
      }

      if (formData.value.xLow >= formData.value.xHigh) {
        ElMessage.warning("X轴起始值必须小于结束值");
        return false;
      }

      // 验证Y轴范围
      if (formData.value.yLow < 0 || formData.value.yLow > 3000) {
        ElMessage.warning("Y轴最低温度必须在0-3000K范围内");
        return false;
      }

      if (formData.value.yHigh < 0 || formData.value.yHigh > 3000) {
        ElMessage.warning("Y轴最高温度必须在0-3000K范围内");
        return false;
      }

      if (formData.value.yLow >= formData.value.yHigh) {
        ElMessage.warning("Y轴最低温度必须小于最高温度");
        return false;
      }

      // 验证至少选择一种输出格式
      if (!showLogOutput.value && !showPlotOutput.value) {
        ElMessage.warning("请至少选择一种输出格式");
        return false;
      }

      return true;
    };

    // 处理图片加载错误
    const handleImageError = () => {
      imageError.value = true;
      isImageLoading.value = false;
    };

    // 导出结果
    const exportResult = () => {
      if (calculationResult.value) {
        // 如果有文本结果，导出为txt文件
        if (calculationResult.value.text) {
          const textContent = calculationResult.value.text;
          const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `NiCoCr中熵合金计算结果_${new Date().getTime()}.txt`;
          a.click();
          URL.revokeObjectURL(url);
          ElMessage.success("文本结果已导出为txt文件");
        }

        // 如果有图片结果，导出为png文件
        if (calculationResult.value.imageUrl) {
          const link = document.createElement('a');
          link.href = calculationResult.value.imageUrl;
          link.download = `NiCoCr中熵合金相图_${new Date().getTime()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          ElMessage.success("图片结果已导出为png文件");
        }
      }
    };

    // 运行计算 - 调用后端API并接收结果
    const runCalculation = async () => {
      // 验证表单
      if (!validateForm()) {
        return;
      }

      // 准备请求参数（移除数据库参数）
      const requestData = {
        calculationType: "case1",
        temperature: formData.value.temperature,
        pressure: formData.value.pressure,
        crFraction: formData.value.crFraction,
        xLow: formData.value.xLow,
        xHigh: formData.value.xHigh,
        xStep: formData.value.xStep,
        yLow: formData.value.yLow,
        yHigh: formData.value.yHigh,
        outputFormat: {
          log: showLogOutput.value,
          plot: showPlotOutput.value
        }
      };

      isCalculating.value = true;
      progress.value = 0;
      progressStatus.value = "";
      currentStep.value = "初始化计算...";
      calculationResult.value = null;
      imageError.value = false;

      try {
        // 发送POST请求到后端
        currentStep.value = "发送计算请求到后端服务器 58.199.161.154:8000";

        const response = await fetch('http://58.199.161.154:8000/case1_calculate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // 后端已返回，立即更新为完成状态，不再添加额外延时
        progress.value = 100;
        progressStatus.value = "success";
        currentStep.value = "计算完成，正在展示结果";

        // 使用后端返回的结果
        calculationResult.value = {
          text: result.text || "计算完成，但未返回文本结果",
          imageUrl: result.imageUrl || ""
        };

        isImageLoading.value = true;

        // 发送结果到父组件（App.vue），用于在ResultPanel中显示
        emit('case1-results', calculationResult.value);

      } catch (error) {
        progressStatus.value = "exception";
        currentStep.value = "计算失败";
        calculationResult.value = {
          text: `计算过程出错：${error.message || '未知错误'}`,
          imageUrl: ""
        };
        ElMessage.error(`计算失败：${error.message || '未知错误'}`);

        // 发送错误信息到父组件
        emit('case1-results', {
          error: true,
          message: error.message || '未知错误'
        });
      } finally {
        isCalculating.value = false;
      }
    };

    return {
      formData,
      isCalculating,
      progress,
      progressStatus,
      currentStep,
      calculationResult,
      isImageLoading,
      imageError,
      showLogOutput,
      showPlotOutput,
      runCalculation,
      handleImageError,
      exportResult
    };
  }
};
</script>

<style scoped>
.case1-phase-diagram {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-large {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.calculate-btn {
  font-size: 16px;
  padding: 12px 20px;
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

.text-medium {
  font-size: 16px;
}

.text-gray-700 {
  color: #374151;
}

.system-composition {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7f1 100%);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.output-format-container {
  display: flex;
  gap: 20px;
  padding: 10px 0;
}

.output-checkbox {
  font-size: 16px;
  font-weight: 500;
}

.output-checkbox :deep(.el-checkbox__label) {
  font-size: 16px;
  font-weight: 500;
  color: #374151;
}

.log-container {
  max-height: 300px;
  overflow-y: auto;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.log-content {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.4;
  color: #374151;
}

.image-container {
  text-align: center;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-image {
  max-width: 100%;
  max-height: 500px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.image-error {
  color: #9ca3af;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

/* 美化滚动条 */
.log-container::-webkit-scrollbar {
  width: 6px;
}

.log-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.log-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.log-container::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .output-format-container {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
