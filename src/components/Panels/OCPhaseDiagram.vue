<template>
  <div class="oc-phase-diagram">
    <el-card class="mb-4">
      <template #header>
        <div class="card-header">
          <span class="title-large">热力学相图计算</span>
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
            <el-form-item label="数据库">
              <el-select
                v-model="formData.database"
                placeholder="选择数据库"
                style="width: 100%"
                required
                size="default"
              >
                <el-option label="steel1" value="steel1" />
                <el-option label="steel7" value="steel7" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="温度 (K)" prop="temperature">
              <el-input-number
                v-model="formData.temperature"
                :min="501"
                :max="3000"
                size="default"
                style="width: 100%"
                controls-position="right"
                placeholder="请输入温度值(>500K)"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="系统组成">
              <div class="system-composition">
                <div class="composition-header">
                  <span class="header-text">合金体系组成设计</span>
                  <div class="header-controls">
                    <el-button type="primary" size="default" @click="addElement" plain>
                      <el-icon><Plus /></el-icon>
                      添加其他元素
                    </el-button>
                  </div>
                </div>
                <div class="elements-container">
                  <!-- 碳元素固定存在，不能删除 -->
                  <div class="element-item carbon-element">
                    <div class="element-selector">
                      <el-select
                        v-model="carbonElement.symbol"
                        size="default"
                        style="width: 120px;"
                        disabled
                      >
                        <el-option label="C" value="C" />
                      </el-select>
                    </div>
                    <div class="fraction-control">
                      <div class="fraction-label">
                        碳摩尔分数 <span class="required">*</span>
                      </div>
                      <div class="fraction-input-group">
                        <el-input-number
                          v-model="carbonElement.fraction"
                          :min="0.0001"
                          :max="0.9999"
                          :precision="4"
                          :step="0.001"
                          size="default"
                          style="width: 160px;"
                          @change="updateOtherElementsFraction"
                        />
                        <div class="fraction-slider">
                          <el-slider
                            v-model="carbonElement.fraction"
                            :min="0.0001"
                            :max="0.9999"
                            :step="0.001"
                            show-tooltip
                            :format-tooltip="formatFractionTooltip"
                            @change="updateOtherElementsFraction"
                          />
                        </div>
                      </div>
                    </div>
                    <div class="element-actions">
                      <el-tooltip content="碳元素为必需元素，不能删除" placement="top">
                        <el-button
                          type="danger"
                          size="default"
                          circle
                          plain
                          disabled
                        >
                          <el-icon><Delete /></el-icon>
                        </el-button>
                      </el-tooltip>
                    </div>
                  </div>

                  <!-- 其他元素列表 -->
                  <div
                    v-for="(element, index) in otherElements"
                    :key="index"
                    class="element-item"
                  >
                    <div class="element-selector">
                      <el-select
                        v-model="element.symbol"
                        placeholder="选择元素"
                        size="default"
                        style="width: 120px;"
                        required
                        @change="updateOtherElementsFraction"
                      >
                        <el-option-group label="常用元素">
                          <el-option label="Fe" value="Fe" />
                          <el-option label="Cr" value="Cr" />
                          <el-option label="Mo" value="Mo" />
                          <el-option label="Si" value="Si" />
                          <el-option label="V" value="V" />
                        </el-option-group>
                        <el-option-group label="其他元素">
                          <el-option label="Al" value="Al" />
                          <el-option label="Cu" value="Cu" />
                          <el-option label="Ni" value="Ni" />
                          <el-option label="Ti" value="Ti" />
                          <el-option label="Mn" value="Mn" />
                          <el-option label="Nb" value="Nb" />
                        </el-option-group>
                      </el-select>
                    </div>
                    <div class="fraction-control">
                      <div class="fraction-label">
                        摩尔分数
                      </div>
                      <div class="fraction-input-group">
                        <el-input-number
                          v-model="element.fraction"
                          :min="0"
                          :max="1 - carbonElement.fraction"
                          :precision="4"
                          :step="0.001"
                          size="default"
                          style="width: 160px;"
                          @change="updateOtherElementsFraction"
                        />
                        <div class="fraction-slider">
                          <el-slider
                            v-model="element.fraction"
                            :min="0"
                            :max="1 - carbonElement.fraction"
                            :step="0.001"
                            show-tooltip
                            :format-tooltip="formatFractionTooltip"
                            @change="updateOtherElementsFraction"
                          />
                        </div>
                      </div>
                    </div>
                    <div class="element-actions">
                      <el-button
                        type="danger"
                        size="default"
                        @click="removeElement(index)"
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
                    <div class="total-content">
                      <span class="label">总摩尔分数:</span>
                      <span class="value" :class="{ 'warning': totalFraction > 1.001 || totalFraction < 0.999 }">
                        {{ totalFraction.toFixed(4) }}
                      </span>
                      <span class="status-icon">
                        <el-icon v-if="totalFraction <= 1.001 && totalFraction >= 0.999" color="#67c23a"><Check /></el-icon>
                        <el-icon v-else color="#f56c6c"><Warning /></el-icon>
                      </span>
                    </div>
                  </div>
                  <div class="status-actions">
                    <el-button
                      type="success"
                      size="default"
                      @click="normalizeFraction"
                      v-if="totalFraction > 1.001 || totalFraction < 0.999"
                      plain
                    >
                      <el-icon><Refresh /></el-icon>
                      归一化
                    </el-button>
                  </div>
                </div>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="压强 (Pa)" prop="pressure">
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
          <el-col :span="12">
            <el-form-item label="摩尔质量 (kg/mol)" prop="molarMass">
              <el-input-number
                v-model="formData.molarMass"
                :min="0.001"
                :precision="6"
                :step="0.001"
                size="default"
                style="width: 100%"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 添加Y轴温度范围设置 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Y轴最低温度 (K)">
              <el-input-number
                v-model="formData.yLow"
                :min="500"
                :max="5000"
                size="default"
                style="width: 100%"
                controls-position="right"
                placeholder="请输入最低温度值(500-5000K)"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Y轴最高温度 (K)">
              <el-input-number
                v-model="formData.yHigh"
                :min="500"
                :max="5000"
                size="default"
                style="width: 100%"
                controls-position="right"
                placeholder="请输入最高温度值(500-5000K)"
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
                  @change="updateOutputFormat"
                  size="default"
                  class="output-checkbox"
                >
                  日志
                </el-checkbox>
                <el-checkbox
                  v-model="showPlotOutput"
                  @change="updateOutputFormat"
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
            <!-- 显示前端生成的日志信息 -->
            <div v-else>
              <div v-for="(log, index) in logs" :key="index" class="log-line">
                <span class="text-gray-600">[{{ log.time }}]</span>
                <span :class="getLogClass(log.level)">{{ log.message }}</span>
              </div>
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
            <el-button size="default" @click="shareResult">
              <el-icon><Share /></el-icon>
              分享结果
            </el-button>
          </div>
        </div>
      </template>

      <div class="image-container">
        <el-skeleton v-if="isImageLoading" :rows="5" animated />
        <el-image
          v-show="!isImageLoading && !imageError"
          :src="calculationResult.imageUrl"
          fit="contain"
          @load="isImageLoading = false"
          @error="handleImageError"
          class="result-image"
        />
        <div v-if="imageError" class="image-error">
          <el-icon size="40"><Picture /></el-icon>
          <p>图像加载失败</p>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted, nextTick, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { exportThermoResults } from "@/utils/excelExporter";

export default {
  name: "OCPhaseDiagram",
  emits: ['oc-results'], // 添加emits声明
  setup(props, { emit }) {
    // 响应式数据
    const carbonElement = ref({ symbol: "C", fraction: 0.02 });
    const otherElements = ref([{ symbol: "Fe", fraction: 0.98 }]);

    const formData = ref({
      database: "steel1",
      temperature: 1000,
      pressure: 10000,
      molarMass: 0.056,
      outputFormat: ["log", "plot"], // 默认选中日志和图形
      yLow: 900,
      yHigh: 4000
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

    // 计算总摩尔分数
    const totalFraction = computed(() => {
      const carbon = carbonElement.value.fraction || 0;
      const others = otherElements.value.reduce((sum, el) => sum + (el.fraction || 0), 0);
      return carbon + others;
    });

    // 获取所有元素数据
    const getAllElements = () => {
      const elements = [{ ...carbonElement.value }];
      otherElements.value.forEach(el => {
        if (el.symbol) {
          elements.push({ ...el });
        }
      });
      return elements;
    };

    // 格式化工具提示
    const formatFractionTooltip = (value) => {
      return value.toFixed(4);
    };

    // 添加其他元素
    const addElement = () => {
      if (otherElements.value.length < 7) {  // 最多7个其他元素（加上碳共8个）
        otherElements.value.push({ symbol: "", fraction: 0 });
        ElMessage.info(`已添加新元素，当前共 ${otherElements.value.length + 1} 个元素（含碳）`);
      } else {
        ElMessage.warning("最多支持8个元素（含碳）");
      }
    };

    // 移除其他元素
    const removeElement = (index) => {
      const removed = otherElements.value.splice(index, 1);
      ElMessage.info(`已移除元素 ${removed[0].symbol || '未知'}`);

      // 更新剩余元素的比例
      updateOtherElementsFraction();
    };

    // 当碳含量变化时，自动调整其他元素的比例
    const updateOtherElementsFraction = () => {
      // 确保碳含量在有效范围内
      if (carbonElement.value.fraction <= 0) {
        carbonElement.value.fraction = 0.0001;
      }
      if (carbonElement.value.fraction >= 1) {
        carbonElement.value.fraction = 0.9999;
      }

      // 计算剩余可分配比例
      const remaining = 1 - carbonElement.value.fraction;
      const elementCount = otherElements.value.length;

      // 如果没有其他元素，直接返回
      if (elementCount === 0) return;

      // 检查是否有未选择的元素，如果有则将其比例设为0
      otherElements.value.forEach(el => {
        if (!el.symbol) {
          el.fraction = 0;
        }
      });

      // 计算已分配的其他元素总比例
      const allocated = otherElements.value.reduce((sum, el) => sum + (el.fraction || 0), 0);

      // 如果总分配比例超过剩余比例或未分配任何比例，则平均分配
      if (allocated > remaining || allocated === 0) {
        const validElements = otherElements.value.filter(el => el.symbol);
        const invalidElements = otherElements.value.filter(el => !el.symbol);

        if (validElements.length > 0) {
          const perElement = remaining / validElements.length;
          validElements.forEach(el => {
            el.fraction = perElement;
          });
          invalidElements.forEach(el => {
            el.fraction = 0;
          });
        }
      }
    };

    // 归一化摩尔分数
    const normalizeFraction = () => {
      const total = totalFraction.value;
      if (total > 0) {
        // 保持碳元素比例不变，调整其他元素
        const carbon = carbonElement.value.fraction;
        const remaining = 1 - carbon;
        const otherTotal = total - carbon;

        if (otherTotal > 0) {
          otherElements.value.forEach(element => {
            element.fraction = (element.fraction / otherTotal) * remaining;
          });
        }

        ElMessage.success("摩尔分数已归一化");
      }
    };

    // 更新输出格式
    const updateOutputFormat = () => {
      const format = [];
      if (showLogOutput.value) format.push("log");
      if (showPlotOutput.value) format.push("plot");
      formData.value.outputFormat = format;
    };

    // 验证表单数据
    const validateForm = () => {
      // 验证温度
      if (formData.value.temperature <= 500) {
        ElMessage.warning("温度必须大于500K");
        return false;
      }

      // 验证碳元素含量
      if (carbonElement.value.fraction <= 0 || carbonElement.value.fraction >= 1) {
        ElMessage.warning("碳元素摩尔分数必须大于0且小于1");
        return false;
      }

      // 验证Y轴温度范围
      if (formData.value.yLow < 500 || formData.value.yLow > 5000) {
        ElMessage.warning("Y轴最低温度必须在500-5000K范围内");
        return false;
      }

      if (formData.value.yHigh < 500 || formData.value.yHigh > 5000) {
        ElMessage.warning("Y轴最高温度必须在500-5000K范围内");
        return false;
      }

      if (formData.value.yLow >= formData.value.yHigh) {
        ElMessage.warning("Y轴最低温度必须小于最高温度");
        return false;
      }

      // 验证其他元素
      const emptyElements = otherElements.value.filter(el => el.symbol && isNaN(el.fraction));
      if (emptyElements.length > 0) {
        ElMessage.warning("请为所有已选择的元素设置摩尔分数");
        return false;
      }

      // 验证压强
      if (formData.value.pressure < 10000) {
        ElMessage.warning("压强必须大于等于10000Pa");
        return false;
      }

      // 验证摩尔质量
      if (formData.value.molarMass <= 0) {
        ElMessage.warning("摩尔质量必须大于0");
        return false;
      }

      // 验证至少选择一种输出格式
      if (!showLogOutput.value && !showPlotOutput.value) {
        ElMessage.warning("请至少选择一种输出格式");
        return false;
      }

      return true;
    };

    // 获取日志样式类
    const getLogClass = (level) => {
      switch(level) {
        case 'INFO': return 'text-blue-600';
        case 'SUCCESS': return 'text-green-600';
        case 'WARNING': return 'text-yellow-600';
        case 'ERROR': return 'text-red-600';
        default: return '';
      }
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
          // 直接使用后端返回的文本内容
          const textContent = calculationResult.value.text;

          const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `OpenCalphad计算结果_${new Date().getTime()}.txt`;
          a.click();
          URL.revokeObjectURL(url);
          ElMessage.success("文本结果已导出为txt文件");
        }

        // 如果有图片结果，导出为png文件
        if (calculationResult.value.imageUrl) {
          // 创建下载链接
          const link = document.createElement('a');
          link.href = calculationResult.value.imageUrl;
          link.download = `OpenCalphad相图_${new Date().getTime()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          ElMessage.success("图片结果已导出为png文件");
        }
      }
    };

    // 分享结果
    const shareResult = () => {
      ElMessageBox.alert('分享功能暂未实现', '提示', {
        confirmButtonText: '确定',
      });
    };

    // 运行计算 - 调用后端API并接收结果
    const runCalculation = async () => {
      // 验证表单
      if (!validateForm()) {
        return;
      }

      // 准备所有元素数据
      const elements = getAllElements();

      // 准备请求参数
      const requestData = {
        database: formData.value.database,
        temperature: formData.value.temperature,
        pressure: formData.value.pressure,
        molarMass: formData.value.molarMass,
        outputFormat: formData.value.outputFormat,
        elements: elements,
        yLow: formData.value.yLow,     // 添加Y轴最低温度参数
        yHigh: formData.value.yHigh    // 添加Y轴最高温度参数
      };

      isCalculating.value = true;
      progress.value = 0;
      progressStatus.value = "";
      currentStep.value = "初始化计算...";
      calculationResult.value = null;

      try {
        // 发送POST请求到后端
        currentStep.value = "发送计算请求到后端服务器 58.199.161.154:8000";

        const response = await fetch('http://58.199.161.154:8000/OC_calculate', {
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
        imageError.value = false;

        // 发送结果到父组件
        emit('oc-results', result);

      } catch (error) {
        progressStatus.value = "exception";
        currentStep.value = "计算失败";
        // 显示错误信息在结果区域而不是日志区域
        calculationResult.value = {
          text: `计算过程出错：${error.message || '未知错误'}`,
          imageUrl: ""
        };

        // 发送错误信息到父组件
        emit('oc-results', {
          error: true,
          message: error.message || '未知错误'
        });
      } finally {
        isCalculating.value = false;
      }
    };

    // 初始化
    onMounted(() => {
      updateOtherElementsFraction();
      // 初始化输出格式
      showLogOutput.value = formData.value.outputFormat.includes("log");
      showPlotOutput.value = formData.value.outputFormat.includes("plot");
    });

    // 更新返回的对象，移除 logs 和 addLog
    return {
      carbonElement,
      otherElements,
      formData,
      isCalculating,
      progress,
      progressStatus,
      currentStep,
      calculationResult,
      isImageLoading,
      imageError,
      totalFraction,
      formatFractionTooltip,
      addElement,
      removeElement,
      updateOtherElementsFraction,
      normalizeFraction,
      runCalculation,
      getLogClass,
      handleImageError,
      exportResult,
      shareResult,
      showLogOutput,
      showPlotOutput,
      updateOutputFormat
    };
  }
};
</script>

<style scoped>
.oc-phase-diagram {
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

.text-gray-600 {
  color: #4b5563;
}

.text-blue-600 {
  color: #2563eb;
}

.text-green-600 {
  color: #16a34a;
}

.text-yellow-600 {
  color: #ca8a04;
}

.text-red-600 {
  color: #dc2626;
}

.system-composition {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7f1 100%);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.composition-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
}

.header-text {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.header-controls .el-button {
  background: linear-gradient(135deg, #409eff 0%, #1a73e8 100%);
  border: none;
  color: white;
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3);
  font-size: 14px;
  padding: 10px 16px;
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
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.element-item:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.carbon-element {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
}

.element-selector {
  flex: 0 0 120px;
}

.element-selector .el-select {
  width: 100%;
}

.fraction-control {
  flex: 1;
}

.fraction-label {
  font-size: 15px;
  color: #374151;
  margin-bottom: 8px;
  font-weight: 500;
}

.fraction-label .required {
  color: #f56c6c;
}

.fraction-input-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.fraction-input-group .el-input-number {
  flex: 0 0 160px;
}

.fraction-slider {
  flex: 1;
  min-width: 150px;
}

.element-actions {
  flex: 0 0 40px;
}

.composition-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.status-info .total-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-info .label {
  font-weight: 500;
  color: #374151;
  font-size: 15px;
}

.status-info .value {
  font-weight: 600;
  color: #10b981;
  font-size: 16px;
}

.status-info .value.warning {
  color: #f59e0b;
}

.status-icon {
  display: flex;
  align-items: center;
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
  max-height: 200px;
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

.log-line {
  margin-bottom: 6px;
  font-size: 14px;
  line-height: 1.4;
}

.log-line:last-child {
  margin-bottom: 0;
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

/* 其他元素字体颜色为白色 */
.element-item:not(.carbon-element) .el-select__wrapper {
  color: white;
}

.element-item:not(.carbon-element) .el-select__placeholder {
  color: white;
}

.element-item:not(.carbon-element) .el-select__selected-item {
  color: white;
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
  .element-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .element-selector,
  .fraction-input-group .el-input-number,
  .element-actions {
    width: 100%;
  }

  .fraction-input-group {
    width: 100%;
  }

  .fraction-slider {
    width: 100%;
    margin-top: 10px;
  }

  .output-format-container {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
