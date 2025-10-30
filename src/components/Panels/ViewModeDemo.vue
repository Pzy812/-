<template>
  <div class="view-mode-demo">
    <el-card class="demo-card">
      <template #header>
        <div class="card-header">
          <el-icon><DataAnalysis /></el-icon>
          <span>视图模式演示</span>
          <el-tag :type="getViewModeType()" size="small">
            {{ getViewModeLabel() }}
          </el-tag>
        </div>
      </template>

      <div class="demo-content">
        <el-alert
          :title="`当前视图模式: ${getViewModeLabel()}`"
          :type="getViewModeType()"
          :description="getViewModeDescription()"
          show-icon
          :closable="false"
          class="mb-4"
        />

        <div v-if="viewMode === 'split'" class="split-demo">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-card shadow="hover">
                <h3>左侧面板</h3>
                <p>这是分屏视图的左侧内容区域，可以显示参数设置、输入表单等。</p>
                <el-button type="primary" size="small">示例操作</el-button>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card shadow="hover">
                <h3>右侧面板</h3>
                <p>这是分屏视图的右侧内容区域，可以显示计算结果、图表等。</p>
                <el-button type="success" size="small">查看结果</el-button>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <div v-else-if="viewMode === 'fullscreen'" class="fullscreen-demo">
          <el-card shadow="hover" class="fullscreen-card">
            <h2>全屏视图模式</h2>
            <p>在全屏模式下，内容会占满整个屏幕空间，提供最大的显示区域。</p>
            <div class="fullscreen-content">
              <el-row :gutter="20">
                <el-col :span="8" v-for="i in 6" :key="i">
                  <el-card shadow="never" class="demo-item">
                    <h4>示例内容 {{ i }}</h4>
                    <p>这里可以显示详细的计算结果、大型图表或数据表格。</p>
                  </el-card>
                </el-col>
              </el-row>
            </div>
            <div class="fullscreen-actions">
              <el-button type="primary">保存结果</el-button>
              <el-button type="success">导出数据</el-button>
              <el-button @click="exitFullscreen">退出全屏</el-button>
            </div>
          </el-card>
        </div>

        <div v-else-if="viewMode === 'tabbed'" class="tabbed-demo">
          <el-tabs v-model="activeTab" type="border-card">
            <el-tab-pane label="计算设置" name="settings">
              <div class="tab-content">
                <h3>计算参数设置</h3>
                <el-form label-width="120px">
                  <el-form-item label="温度范围">
                    <el-input placeholder="请输入温度范围" />
                  </el-form-item>
                  <el-form-item label="压力条件">
                    <el-input placeholder="请输入压力条件" />
                  </el-form-item>
                  <el-form-item label="组分配比">
                    <el-input placeholder="请输入组分配比" />
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="计算结果" name="results">
              <div class="tab-content">
                <h3>计算结果展示</h3>
                <el-table :data="demoTableData" border>
                  <el-table-column prop="temp" label="温度(K)" />
                  <el-table-column prop="pressure" label="压力(Pa)" />
                  <el-table-column prop="phase" label="稳定相" />
                  <el-table-column prop="value" label="结果值" />
                </el-table>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="图表分析" name="charts">
              <div class="tab-content">
                <h3>图表分析</h3>
                <div class="chart-placeholder">
                  <el-empty description="图表将在这里显示" />
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="数据导出" name="export">
              <div class="tab-content">
                <h3>数据导出</h3>
                <div class="export-options">
                  <el-button type="primary">导出Excel</el-button>
                  <el-button type="success">导出PDF</el-button>
                  <el-button type="info">导出图片</el-button>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>

        <div class="demo-tips">
          <h4>使用提示:</h4>
          <ul>
            <li><strong>分屏视图</strong>: 适合需要同时查看输入参数和计算结果的场景</li>
            <li><strong>全屏视图</strong>: 适合查看大型图表、复杂数据表格或需要专注工作的场景</li>
            <li><strong>标签视图</strong>: 适合有多个相关功能模块，需要分类管理的场景</li>
          </ul>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  viewMode: {
    type: String,
    default: 'split'
  },
  compact: {
    type: Boolean,
    default: false
  }
})

const activeTab = ref('settings')

// 示例表格数据
const demoTableData = ref([
  { temp: 1000, pressure: 101325, phase: 'α-Fe', value: 0.85 },
  { temp: 1100, pressure: 101325, phase: 'γ-Fe', value: 0.92 },
  { temp: 1200, pressure: 101325, phase: 'γ-Fe', value: 0.88 },
  { temp: 1300, pressure: 101325, phase: 'δ-Fe', value: 0.76 }
])

const getViewModeLabel = () => {
  const labels = {
    split: '分屏视图',
    fullscreen: '全屏视图', 
    tabbed: '标签视图'
  }
  return labels[props.viewMode] || '未知模式'
}

const getViewModeType = () => {
  const types = {
    split: 'primary',
    fullscreen: 'success',
    tabbed: 'warning'
  }
  return types[props.viewMode] || 'info'
}

const getViewModeDescription = () => {
  const descriptions = {
    split: '将界面分为左右两部分，方便同时查看参数设置和计算结果。',
    fullscreen: '占据整个屏幕空间，提供最大的显示区域，适合查看复杂内容。',
    tabbed: '将不同功能模块组织在标签页中，便于分类管理和快速切换。'
  }
  return descriptions[props.viewMode] || '当前视图模式的详细说明。'
}

const exitFullscreen = () => {
  // 发出事件通知父组件退出全屏
  ElMessage.info('退出全屏模式 - 实际中应该由App.vue的exitFullscreen方法处理')
  // 在实际应用中，这里可以通过事件或状态管理来触发父组件的退出全屏方法
}
</script>

<style scoped>
.view-mode-demo {
  height: 100%;
  padding: 16px;
}

.demo-card {
  height: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-header span {
  flex: 1;
}

.demo-content {
  height: calc(100vh - 200px);
  overflow-y: auto;
}

.mb-4 {
  margin-bottom: 16px;
}

.split-demo .el-card {
  height: 300px;
}

.fullscreen-demo {
  height: 100%;
}

.fullscreen-card {
  height: 100%;
  border: none;
}

.fullscreen-content {
  margin: 20px 0;
}

.demo-item {
  margin-bottom: 16px;
  height: 120px;
}

.fullscreen-actions {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.tabbed-demo {
  height: 100%;
}

.tab-content {
  padding: 20px;
  min-height: 400px;
}

.chart-placeholder {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #e4e7ed;
  border-radius: 8px;
}

.export-options {
  text-align: center;
  padding: 40px 0;
}

.export-options .el-button {
  margin: 0 8px;
}

.demo-tips {
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.demo-tips h4 {
  margin-bottom: 8px;
  color: #333;
}

.demo-tips ul {
  margin: 0;
  padding-left: 20px;
}

.demo-tips li {
  margin-bottom: 8px;
  line-height: 1.6;
}

:deep(.el-tabs__content) {
  height: calc(100% - 60px);
  overflow-y: auto;
}

:deep(.el-tab-pane) {
  height: 100%;
}
</style>