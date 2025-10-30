<template>
  <div class="thermodynamics-app">
    <!-- 界面自定义设置按钮 -->
    <el-button 
      class="layout-config-btn" 
      type="primary" 
      circle 
      @click="showLayoutConfig = true"
      v-if="!showLayoutConfig"
    >
      <el-icon><Setting /></el-icon>
    </el-button>

    <!-- 快速主题切换按钮 -->
    <div class="quick-theme-switcher" v-if="!showLayoutConfig">
      <el-tooltip content="快速切换主题" placement="left">
        <el-button 
          class="theme-quick-btn" 
          circle 
          size="small"
          @click="quickSwitchTheme"
        >
          <el-icon><Brush /></el-icon>
        </el-button>
      </el-tooltip>
      
      <!-- 主题预览小球 -->
      <div class="theme-preview-dots">
        <div 
          v-for="theme in themes" 
          :key="theme.name"
          class="theme-dot"
          :class="{ active: currentTheme === theme.name }"
          :style="{ background: theme.primary }"
          @click="changeTheme(theme.name)"
          :title="theme.label"
        ></div>
      </div>
    </div>

    <!-- 布局配置面板 -->
    <el-drawer
      v-model="showLayoutConfig"
      title="界面布局配置"
      direction="rtl"
      size="350px"
    >
      <div class="layout-config">
        <el-card class="config-card" shadow="never">
          <template #header>
            <span class="config-title">布局模式</span>
          </template>
          <el-radio-group v-model="layoutMode" @change="changeLayoutMode">
            <el-radio label="standard">标准三栏布局</el-radio>
            <el-radio label="focus">专注模式（隐藏侧边栏）</el-radio>
            <el-radio label="wide">宽屏模式（隐藏右侧栏）</el-radio>
            <el-radio label="minimal">极简模式（全屏显示）</el-radio>
          </el-radio-group>
        </el-card>

        <el-card class="config-card" shadow="never">
          <template #header>
            <span class="config-title">面板宽度调节</span>
          </template>
          <div class="width-config">
            <div class="config-item">
              <span class="config-label">左侧菜单宽度</span>
              <el-slider v-model="panelWidths.left" :min="200" :max="400" :step="20" show-input />
            </div>
            <div class="config-item">
              <span class="config-label">右侧结果面板宽度</span>
              <el-slider v-model="panelWidths.right" :min="300" :max="600" :step="20" show-input />
            </div>
          </div>
        </el-card>

        <el-card class="config-card" shadow="never">
          <template #header>
            <span class="config-title">主题配色</span>
          </template>
          <div class="theme-selector">
            <div 
              v-for="theme in themes" 
              :key="theme.name"
              class="theme-item"
              :class="{ active: currentTheme === theme.name }"
              @click="changeTheme(theme.name)"
            >
              <div class="theme-preview" :style="{ background: theme.primary }"></div>
              <span class="theme-name">{{ theme.label }}</span>
            </div>
          </div>
        </el-card>

        <el-card class="config-card" shadow="never">
          <template #header>
            <span class="config-title">显示选项</span>
          </template>
          <div class="display-options">
            <el-switch v-model="showHeader" active-text="显示顶部导航" />
            <el-switch v-model="showSystemStatus" active-text="显示系统状态" />
            <el-switch v-model="enableAnimation" active-text="启用动画效果" />
            <el-switch v-model="compactMode" active-text="紧凑模式" />
          </div>
        </el-card>

        <div class="config-actions">
          <el-button type="primary" @click="saveLayoutConfig">保存配置</el-button>
          <el-button @click="resetLayoutConfig">重置默认</el-button>
        </div>
      </div>
    </el-drawer>

    <el-container style="height: 100vh" :class="layoutClasses">
      <!-- 顶部导航 -->
      <el-header
        v-if="showHeader"
        height="60px"
        style="border-bottom: 1px solid #e4e7ed; background: #fff"
        :class="{ 'compact-header': compactMode }"
      >
        <TopNav />
      </el-header>

      <el-container>
        <!-- 左侧功能区 -->
        <el-aside
          v-if="showLeftPanel"
          :width="panelWidths.left + 'px'"
          :style="{
            borderRight: '1px solid #e4e7ed',
            background: '#fafafa',
            height: sidebarHeight,
            overflowY: 'auto',
            overflowX: 'hidden'
          }"
          class="resizable-panel left-panel"
        >
          <SideMenu :compact="compactMode" />
        </el-aside>

        <!-- 中间主操作区 -->
        <el-main 
          :style="mainStyle" 
          :class="{ 'compact-main': compactMode, 'focus-main': layoutMode === 'focus' }"
        >
          <div class="main-content">
            <!-- 快捷视图切换 -->
            <div class="view-controls" v-if="layoutMode !== 'minimal'">
              <el-button-group size="small">
                <el-button 
                  :type="viewMode === 'split' ? 'primary' : ''"
                  @click="switchViewMode('split')"
                >
                  <el-icon><Grid /></el-icon>
                  分屏视图
                </el-button>
                <el-button 
                  :type="viewMode === 'fullscreen' ? 'primary' : ''"
                  @click="switchViewMode('fullscreen')"
                >
                  <el-icon><FullScreen /></el-icon>
                  全屏视图
                </el-button>
                <el-button 
                  :type="viewMode === 'tabbed' ? 'primary' : ''"
                  @click="switchViewMode('tabbed')"
                >
                  <el-icon><Folder /></el-icon>
                  标签视图
                </el-button>
              </el-button-group>
            </div>
            
            <div class="router-view-container" :class="`view-mode-${viewMode}`">
              <!-- 全屏退出按钮 -->
              <el-button 
                v-if="viewMode === 'fullscreen'"
                class="fullscreen-exit-btn"
                @click="exitFullscreen"
                circle
                title="退出全屏 (ESC)"
              >
                <el-icon><Close /></el-icon>
              </el-button>
              
              <!-- 全屏提示 -->
              <div v-if="viewMode === 'fullscreen'" class="fullscreen-hint">
                按 ESC 键或点击 X 退出全屏
              </div>
              
              <router-view 
                :view-mode="viewMode" 
                :compact="compactMode" 
                @oc-results="handleOCResults"
                @case1-results="handleCase1Results"
                @case2-results="handleCase2Results"
              />
            </div>
          </div>
        </el-main>

        <!-- 右侧结果展示区 -->
        <el-aside
          v-if="showRightPanel"
          :width="panelWidths.right + 'px'"
          :style="{
            borderLeft: '1px solid #e4e7ed',
            background: '#fff',
            height: sidebarHeight,
            overflowY: 'auto',
            overflowX: 'hidden'
          }"
          class="resizable-panel right-panel"
        >
          <ResultPanel 
            :compact="compactMode" 
            :oc-results="ocResults"
          />
        </el-aside>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, provide } from "vue";
import TopNav from "./components/Layout/TopNav.vue";
import SideMenu from "./components/Layout/SideMenu.vue";
import ResultPanel from "./components/Layout/ResultPanel.vue";
import { ElMessage } from "element-plus";

// OpenCalphad结果数据
const ocResults = ref(null);
// Case1结果数据
const case1Results = ref(null);
// Case2结果数据
const case2Results = ref(null);

// 布局配置
const showLayoutConfig = ref(false);
const layoutMode = ref('standard');
const viewMode = ref('tabbed');
const currentTheme = ref('default');
const showHeader = ref(true);
const showSystemStatus = ref(true);
const enableAnimation = ref(true);
const compactMode = ref(false);

// 面板宽度配置
const panelWidths = ref({
  left: 280,
  right: 400
});

// 主题配置
const themes = [
  { name: 'default', label: '默认蓝', primary: '#409EFF' },
  { name: 'green', label: '科研绿', primary: '#67C23A' },
  { name: 'orange', label: '活力橙', primary: '#E6A23C' },
  { name: 'red', label: '热力红', primary: '#F56C6C' },
  { name: 'purple', label: '高端紫', primary: '#909399' },
  { name: 'dark', label: '深色模式', primary: '#2c3e50' }
];

// 计算属性
const showLeftPanel = computed(() => {
  return layoutMode.value !== 'focus' && layoutMode.value !== 'minimal';
});

const showRightPanel = computed(() => {
  return layoutMode.value !== 'wide' && layoutMode.value !== 'minimal';
});

const layoutClasses = computed(() => {
  return {
    'layout-standard': layoutMode.value === 'standard',
    'layout-focus': layoutMode.value === 'focus',
    'layout-wide': layoutMode.value === 'wide',
    'layout-minimal': layoutMode.value === 'minimal',
    'enable-animation': enableAnimation.value,
    'compact-layout': compactMode.value
  };
});

const sidebarHeight = computed(() => {
  return showHeader.value ? 'calc(100vh - 60px)' : '100vh';
});

const mainStyle = computed(() => {
  let padding = compactMode.value ? '10px' : '20px';
  let background = '#f5f5f5';
  
  if (layoutMode.value === 'minimal') {
    padding = '0';
    background = '#fff';
  }
  
  return {
    background,
    padding,
    height: sidebarHeight.value,
    overflowY: 'auto'
  };
});

// 处理OpenCalphad结果
const handleOCResults = (results) => {
  ocResults.value = results;
};

// 处理Case1结果
const handleCase1Results = (results) => {
  case1Results.value = results;
  // 同时更新ocResults，因为ResultPanel监听的是ocResults
  ocResults.value = results;
};

// 处理Case2结果
const handleCase2Results = (results) => {
  case2Results.value = results;
  // 同时更新ocResults，因为ResultPanel监听的是ocResults
  ocResults.value = results;
};

// 视图模式切换方法
const switchViewMode = (mode) => {
  viewMode.value = mode;
  
  switch(mode) {
    case 'split':
      ElMessage.success('已切换到分屏视图模式');
      // 实现分屏视图逻辑
      break;
    case 'fullscreen':
      ElMessage.success('已切换到全屏视图模式，按ESC键或点击退出按钮可退出全屏');
      // 实现全屏视图逻辑
      break;
    case 'tabbed':
      ElMessage.success('已切换到标签视图模式');
      // 实现标签视图逻辑
      break;
    default:
      ElMessage.info('未知的视图模式');
  }
};

// 退出全屏视图
const exitFullscreen = () => {
  viewMode.value = 'tabbed'; // 默认回到标签视图
  ElMessage.success('已退出全屏视图');
};

// 监听ESC键退出全屏
const handleKeydown = (event) => {
  if (event.key === 'Escape' && viewMode.value === 'fullscreen') {
    exitFullscreen();
  }
};

// 方法
const changeLayoutMode = (mode) => {
  layoutMode.value = mode;
  ElMessage.success(`已切换到${getLayoutModeName(mode)}`);
};

const getLayoutModeName = (mode) => {
  const names = {
    standard: '标准三栏布局',
    focus: '专注模式',
    wide: '宽屏模式',
    minimal: '极简模式'
  };
  return names[mode] || mode;
};

const changeTheme = (themeName) => {
  currentTheme.value = themeName;
  document.documentElement.setAttribute('data-theme', themeName);
  
  // 更新Element Plus主题颜色
  const theme = themes.find(t => t.name === themeName);
  if (theme) {
    document.documentElement.style.setProperty('--el-color-primary', theme.primary);
    document.documentElement.style.setProperty('--el-color-primary-light-3', theme.primary + '33');
    document.documentElement.style.setProperty('--el-color-primary-light-5', theme.primary + '66');
    document.documentElement.style.setProperty('--el-color-primary-light-7', theme.primary + '99');
    document.documentElement.style.setProperty('--el-color-primary-light-8', theme.primary + 'bb');
    document.documentElement.style.setProperty('--el-color-primary-light-9', theme.primary + 'dd');
    document.documentElement.style.setProperty('--el-color-primary-dark-2', theme.primary + 'cc');
    
    // 为进度条添加主题颜色支持
    document.documentElement.style.setProperty('--el-color-success', theme.primary);
    document.documentElement.style.setProperty('--progress-bg-color', theme.primary + 'dd');
    document.documentElement.style.setProperty('--progress-color', theme.primary);
    document.documentElement.style.setProperty('--el-progress-bg-color', theme.primary + 'dd');
    document.documentElement.style.setProperty('--el-progress-color', theme.primary);
    document.documentElement.style.setProperty('--el-progress-text-color', theme.primary);
  }
  
  ElMessage.success(`已切换到${themes.find(t => t.name === themeName)?.label}主题`);
};

// 快速切换主题（循环切换）
const quickSwitchTheme = () => {
  const currentIndex = themes.findIndex(t => t.name === currentTheme.value);
  const nextIndex = (currentIndex + 1) % themes.length;
  const nextTheme = themes[nextIndex];
  changeTheme(nextTheme.name);
};

const saveLayoutConfig = () => {
  const config = {
    layoutMode: layoutMode.value,
    panelWidths: panelWidths.value,
    currentTheme: currentTheme.value,
    showHeader: showHeader.value,
    showSystemStatus: showSystemStatus.value,
    enableAnimation: enableAnimation.value,
    compactMode: compactMode.value,
    viewMode: viewMode.value
  };
  
  localStorage.setItem('thermodynamics-layout-config', JSON.stringify(config));
  ElMessage.success('布局配置已保存');
  showLayoutConfig.value = false;
};

const resetLayoutConfig = () => {
  layoutMode.value = 'standard';
  panelWidths.value = { left: 280, right: 400 };
  currentTheme.value = 'default';
  showHeader.value = true;
  showSystemStatus.value = true;
  enableAnimation.value = true;
  compactMode.value = false;
  viewMode.value = 'tabbed'; // 默认为标签视图
  
  changeTheme('default');
  ElMessage.success('已重置为默认配置');
};

const loadLayoutConfig = () => {
  const saved = localStorage.getItem('thermodynamics-layout-config');
  if (saved) {
    try {
      const config = JSON.parse(saved);
      layoutMode.value = config.layoutMode || 'standard';
      panelWidths.value = config.panelWidths || { left: 280, right: 400 };
      currentTheme.value = config.currentTheme || 'default';
      showHeader.value = config.showHeader !== undefined ? config.showHeader : true;
      showSystemStatus.value = config.showSystemStatus !== undefined ? config.showSystemStatus : true;
      enableAnimation.value = config.enableAnimation !== undefined ? config.enableAnimation : true;
      compactMode.value = config.compactMode || false;
      viewMode.value = config.viewMode || 'tabbed'; // 默认为标签视图
      
      changeTheme(currentTheme.value);
    } catch (e) {
      console.warn('加载布局配置失败，使用默认配置');
    }
  }
};

// 生命周期
onMounted(() => {
  loadLayoutConfig();
  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeydown);
});

// 组件卸载时移除事件监听
onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown);
});

// 向子组件提供视图模式相关的方法
provide('viewMode', viewMode);
provide('switchViewMode', switchViewMode);
provide('exitFullscreen', exitFullscreen);
// 提供主题相关的状态和方法
provide('currentTheme', currentTheme);
provide('changeTheme', changeTheme);

// 监听面板宽度变化
watch(
  () => panelWidths.value,
  (newWidths) => {
    // 动态调整CSS变量
    document.documentElement.style.setProperty('--left-panel-width', newWidths.left + 'px');
    document.documentElement.style.setProperty('--right-panel-width', newWidths.right + 'px');
  },
  { deep: true }
);
</script>

<style scoped>
/* 主应用容器 */
.thermodynamics-app {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

/* 布局配置按钮 */
.layout-config-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
}

.layout-config-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
}

/* 快速主题切换器 */
.quick-theme-switcher {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.theme-quick-btn {
  background: rgba(255, 255, 255, 0.9) !important;
  border: 1px solid #e4e7ed !important;
  color: #606266 !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.theme-quick-btn:hover {
  background: #409eff !important;
  border-color: #409eff !important;
  color: white !important;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}

/* 主题预览小球 */
.theme-preview-dots {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.theme-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
}

.theme-dot:hover {
  transform: scale(1.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.theme-dot.active {
  border-color: #333;
  transform: scale(1.3);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8), 0 2px 8px rgba(0, 0, 0, 0.3);
}

.theme-dot.active::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 8px;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* 布局配置面板 */
.layout-config {
  padding: 0;
}

.config-card {
  margin-bottom: 16px;
  border: 1px solid #e4e7ed;
}

.config-card:last-of-type {
  margin-bottom: 0;
}

.config-title {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.width-config .config-item {
  margin-bottom: 20px;
}

.width-config .config-item:last-child {
  margin-bottom: 0;
}

.config-label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  color: #666;
}

/* 主题选择器 */
.theme-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.theme-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border: 2px solid #e4e7ed;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.theme-item:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.theme-item.active {
  border-color: #409eff;
  background: #e7f3ff;
}

.theme-preview {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 8px;
}

.theme-name {
  font-size: 12px;
  color: #333;
}

/* 显示选项 */
.display-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 配置操作按钮 */
.config-actions {
  margin-top: 24px;
  display: flex;
  gap: 8px;
}

.config-actions .el-button {
  flex: 1;
}

/* 布局模式样式 */
.layout-standard {
  /* 标准三栏布局 */
}

.layout-focus {
  /* 专注模式 - 隐藏左侧栏 */
}

.layout-wide {
  /* 宽屏模式 - 隐藏右侧栏 */
}

.layout-minimal {
  /* 极简模式 - 全屏显示 */
}

.layout-minimal .el-main {
  padding: 0 !important;
}

/* 动画效果 */
.enable-animation .el-aside,
.enable-animation .el-main {
  transition: all 0.3s ease;
}

.enable-animation .resizable-panel {
  transition: width 0.3s ease;
}

/* 紧凑模式 */
.compact-layout .compact-header {
  height: 45px !important;
  line-height: 45px;
}

.compact-layout .compact-main {
  padding: 10px !important;
}

/* 主内容区域 */
.main-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.view-controls {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e4e7ed;
}

/* 视图模式样式 */
.router-view-container {
  flex: 1;
  transition: all 0.3s ease;
}

/* 分屏视图 */
.view-mode-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  height: 100%;
}

/* 全屏视图 */
.view-mode-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background: #fff;
  padding: 20px;
  overflow-y: auto;
}

/* 全屏退出按钮 */
.fullscreen-exit-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.7) !important;
  color: white !important;
  border: none !important;
  border-radius: 50% !important;
  width: 50px !important;
  height: 50px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 20px !important;
  transition: all 0.3s ease !important;
  cursor: pointer !important;
}

.fullscreen-exit-btn:hover {
  background: rgba(0, 0, 0, 0.9) !important;
  transform: scale(1.1) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
}

/* 全屏提示信息 */
.fullscreen-hint {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 10000;
  background: rgba(64, 158, 255, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  pointer-events: none;
}

.view-mode-fullscreen:hover .fullscreen-hint {
  opacity: 1;
  transform: translateY(0);
}

/* 全屏模式下隐藏原有的控制按钮 */
.view-mode-fullscreen .view-controls {
  display: none;
}

/* 组件级别的全屏退出按钮 */
:deep(.component-fullscreen-exit-btn) {
  position: fixed !important;
  top: 80px !important;
  right: 20px !important;
  z-index: 10001 !important;
  background: #f56c6c !important;
  border-color: #f56c6c !important;
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.3) !important;
}

:deep(.component-fullscreen-exit-btn:hover) {
  background: #f14545 !important;
  border-color: #f14545 !important;
  transform: scale(1.05) !important;
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.5) !important;
}

/* 标签视图 */
.view-mode-tabbed {
  height: 100%;
}

.view-mode-tabbed .el-tabs {
  height: 100%;
}

.view-mode-tabbed .el-tab-pane {
  height: calc(100vh - 200px);
  overflow-y: auto;
}

.focus-main {
  max-width: none;
  margin: 0 auto;
}

/* 可调整大小的面板 */
.resizable-panel {
  position: relative;
  min-width: 200px;
  max-width: 600px;
  /* 确保面板内容不会超出边界 */
  box-sizing: border-box;
}

/* 左侧面板优化 */
.left-panel {
  /* 确保左侧菜单滚动流畅 */
  position: relative;
}

/* 右侧面板优化 */
.right-panel {
  /* 确保右侧结果面板滚动流畅 */
  position: relative;
}

/* 全局滚动条样式优化 */
.el-aside::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.el-aside::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.el-aside::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.el-aside::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* 火狐浏览器滚动条样式 */
.el-aside {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.05);
}

/* 主题变量定义 */
:root {
  --left-panel-width: 280px;
  --right-panel-width: 400px;
  --el-color-primary: #409EFF;
}

/* 全局进度条主题样式 */
/* 基础进度条样式 */
:deep(.el-progress-bar__outer) {
  background-color: var(--el-color-primary-light-9, #ecf5ff) !important;
}

:deep(.el-progress-bar__inner) {
  background-color: var(--el-color-primary, #409EFF) !important;
}

:deep(.el-progress__text) {
  color: var(--el-color-primary, #409EFF) !important;
}

/* 不同状态的进度条都使用主题颜色 */
:deep(.el-progress--success .el-progress-bar__inner) {
  background-color: var(--el-color-primary, #409EFF) !important;
}

:deep(.el-progress--success .el-progress__text) {
  color: var(--el-color-primary, #409EFF) !important;
}

:deep(.el-progress--warning .el-progress-bar__inner) {
  background-color: var(--el-color-primary, #409EFF) !important;
}

:deep(.el-progress--warning .el-progress__text) {
  color: var(--el-color-primary, #409EFF) !important;
}

:deep(.el-progress--exception .el-progress-bar__inner) {
  background-color: var(--el-color-primary, #409EFF) !important;
}

:deep(.el-progress--exception .el-progress__text) {
  color: var(--el-color-primary, #409EFF) !important;
}

/* 圈形进度条 */
:deep(.el-progress--circle .el-progress__text) {
  color: var(--el-color-primary, #409EFF) !important;
}

:deep(.el-progress--circle path) {
  stroke: var(--el-color-primary, #409EFF) !important;
}

/* 全局覆盖所有进度条组件 */
.el-progress {
  --el-progress-bg-color: var(--el-color-primary-light-9, #ecf5ff);
  --el-progress-color: var(--el-color-primary, #409EFF);
  --el-progress-text-color: var(--el-color-primary, #409EFF);
}

/* 默认主题 */
[data-theme="default"] {
  --el-color-primary: #409EFF;
  --el-color-primary-light-9: #ecf5ff;
}

/* 绿色主题 */
[data-theme="green"] {
  --el-color-primary: #67C23A;
  --el-color-primary-light-9: #f0f9ff;
}

/* 橙色主题 */
[data-theme="orange"] {
  --el-color-primary: #E6A23C;
  --el-color-primary-light-9: #fdf6ec;
}

/* 红色主题 */
[data-theme="red"] {
  --el-color-primary: #F56C6C;
  --el-color-primary-light-9: #fef0f0;
}

/* 紫色主题 */
[data-theme="purple"] {
  --el-color-primary: #909399;
  --el-color-primary-light-9: #f4f4f5;
}

/* 深色主题 */
[data-theme="dark"] {
  --el-color-primary: #2c3e50;
  --el-bg-color: #1a1a1a;
  --el-text-color-primary: #e4e7ed;
  --el-border-color: #4c4d4f;
}

[data-theme="dark"] .thermodynamics-app {
  background: #1a1a1a;
  color: #e4e7ed;
}

[data-theme="dark"] .el-container {
  background: #1a1a1a;
}

[data-theme="dark"] .el-aside {
  background: #262727 !important;
  border-color: #4c4d4f !important;
}

[data-theme="dark"] .el-header {
  background: #262727 !important;
  border-color: #4c4d4f !important;
}

[data-theme="dark"] .el-main {
  background: #1a1a1a !important;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .layout-config-btn {
    top: 10px;
    right: 10px;
  }
  
  .theme-selector {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .view-controls {
    margin-bottom: 8px;
  }
  
  .view-controls .el-button-group {
    width: 100%;
  }
  
  .view-controls .el-button {
    flex: 1;
    font-size: 12px;
    padding: 6px 8px;
  }
}
</style>
