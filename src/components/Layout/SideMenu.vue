<template>
  <div class="side-menu">
    <!-- 软件选择 -->
    <div class="software-selector">
      <div class="section-title">选择计算软件</div>
      <el-radio-group
        v-model="selectedSoftware"
        @change="switchSoftware"
        direction="vertical"
        size="small"
      >
        <el-radio-button label="OC">
          <div class="software-item">
            <el-icon class="software-icon"><Cpu /></el-icon>
            <span>OpenCalphad</span>
          </div>
        </el-radio-button>
        <el-radio-button label="TC">
          <div class="software-item">
            <el-icon class="software-icon"><DataAnalysis /></el-icon>
            <span>Thermo-Calc</span>
          </div>
        </el-radio-button>
        <el-radio-button label="Pandat">
          <div class="software-item">
            <el-icon class="software-icon"><TrendCharts /></el-icon>
            <span>Pandat</span>
          </div>
        </el-radio-button>
        <el-radio-button label="PhaseLab">
          <div class="software-item">
            <el-icon class="software-icon"><Histogram /></el-icon>
            <span>PhaseLab</span>
          </div>
        </el-radio-button>
      </el-radio-group>
    </div>

    <!-- 功能菜单 -->
    <div class="function-menu">
      <el-menu
        :default-active="activeMenu"
        @select="handleMenuSelect"
        class="menu-container"
        background-color="#fafafa"
        text-color="#333"
        active-text-color="#409EFF"
      >
        <el-sub-menu index="1">
          <template #title>
            <svg class="custom-icon" viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-1 2v14H6V5h12zM8 7v2h2V7H8zm4 0v2h4V7h-4zM8 11v2h2v-2H8zm4 0v2h4v-2h-4zM8 15v2h2v-2H8zm4 0v2h4v-2h-4z"/>
              <circle fill="currentColor" cx="9" cy="8" r="0.8"/>
              <circle fill="currentColor" cx="9" cy="12" r="0.8"/>
              <circle fill="currentColor" cx="9" cy="16" r="0.8"/>
            </svg>
            <span>基础计算</span>
          </template>
          <el-menu-item index="1-1">
            <el-icon><PieChart /></el-icon>
            <span>相图计算</span>
          </el-menu-item>
          <el-menu-item index="1-2">
            <el-icon><DataLine /></el-icon>
            <span>热力学属性分析</span>
          </el-menu-item>
          <el-menu-item index="1-3">
            <el-icon><ScaleToOriginal /></el-icon>
            <span>平衡计算</span>
          </el-menu-item>
          <el-menu-item index="1-4">
            <el-icon><PieChart /></el-icon>
            <span>NiCoCr中熵合金计算</span>
          </el-menu-item>
          <el-menu-item index="1-5">
            <el-icon><DataLine /></el-icon>
            <span>五元高熵合金计算</span>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="2">
          <template #title>
            <el-icon><DataAnalysis /></el-icon>
            <span>模拟计算</span>
          </template>
          <el-menu-item index="2-1">
            <el-icon><TrendCharts /></el-icon>
            <span>相变动力学模拟</span>
          </el-menu-item>
          <el-menu-item index="2-2">
            <el-icon><Connection /></el-icon>
            <span>扩散模拟</span>
          </el-menu-item>
          <el-menu-item index="2-3">
            <el-icon><Grid /></el-icon>
            <span>微观组织演化</span>
          </el-menu-item>
          <el-menu-item index="2-4">
            <el-icon><ScaleToOriginal /></el-icon>
            <span>力学性能预测</span>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="8">
          <template #title>
            <el-icon><Tools /></el-icon>
            <span>高级功能模块</span>
          </template>
          <el-menu-item index="8-1">
            <el-icon><TrendCharts /></el-icon>
            <span>热力学参数优化</span>
          </el-menu-item>
<!--          <el-menu-item index="8-2">-->
<!--            <el-icon><Connection /></el-icon>-->
<!--            <span>扩散模拟</span>-->
<!--          </el-menu-item>-->
          <el-menu-item index="8-3">
            <el-icon><DataBoard /></el-icon>
            <span>实验数据拟合</span>
          </el-menu-item>
          <el-menu-item index="8-4">
            <el-icon><Histogram /></el-icon>
            <span>相图预测算法</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- 新增优化计算模块 -->
        <el-sub-menu index="10">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>优化计算</span>
          </template>
          <el-menu-item index="10-1">
            <el-icon><DataLine /></el-icon>
            <span>OC优化</span>
          </el-menu-item>
          <el-menu-item index="10-2">
            <el-icon><MagicStick /></el-icon>
            <span>自动优化</span>
          </el-menu-item>
          <el-menu-item index="10-3">
            <el-icon><Grid /></el-icon>
            <span>高通量计算</span>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="3">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>高级功能</span>
          </template>
          <el-menu-item index="3-1">
            <el-icon><Grid /></el-icon>
            <span>批量任务调度</span>
          </el-menu-item>
          <el-menu-item index="3-2">
            <el-icon><DataBoard /></el-icon>
            <span>实验数据对比</span>
          </el-menu-item>
          <el-menu-item index="3-3">
            <el-icon><Connection /></el-icon>
            <span>多软件联合计算</span>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="4">
          <template #title>
            <el-icon><Clock /></el-icon>
            <span>历史记录</span>
          </template>
          <el-menu-item
            index="4-1"
            v-for="(record, index) in recentTasks"
            :key="index"
          >
            <el-icon><Document /></el-icon>
            <span>{{ record.name }}</span>
            <el-tag
              size="small"
              :type="record.status === 'success' ? 'success' : 'warning'"
              class="record-tag"
            >
              {{ record.status === "success" ? "成功" : "运行中" }}
            </el-tag>
          </el-menu-item>
          <el-menu-item index="4-more" v-if="recentTasks.length === 0">
            <el-icon><InfoFilled /></el-icon>
            <span class="empty-text">暂无历史记录</span>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="5">
          <template #title>
            <el-icon><Collection /></el-icon>
            <span>模板库</span>
          </template>
          <el-menu-item index="5-1">
            <el-icon><Star /></el-icon>
            <span>常用模板</span>
          </el-menu-item>
          <el-menu-item index="5-2">
            <el-icon><FolderOpened /></el-icon>
            <span>自定义模板</span>
          </el-menu-item>
          <el-menu-item index="5-3">
            <el-icon><Share /></el-icon>
            <span>共享模板</span>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="6">
          <template #title>
            <el-icon><MagicStick /></el-icon>
            <span>智能体功能</span>
          </template>
          <el-menu-item index="6-1">
            <el-icon><PieChart /></el-icon>
            <span>交互式相图热力学计算</span>
          </el-menu-item>
          <el-menu-item index="6-2">
            <el-icon><Setting /></el-icon>
            <span>自动优化模块</span>
          </el-menu-item>
          <el-menu-item index="6-3">
            <el-icon><DataBoard /></el-icon>
            <span>自动化数据库构建</span>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="7">
          <template #title>
            <el-icon><View /></el-icon>
            <span>界面功能演示</span>
          </template>
          <el-menu-item index="7-1">
            <el-icon><Grid /></el-icon>
            <span>视图模式演示</span>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="9">
          <template #title>
            <el-icon><ChatRound /></el-icon>
            <span>AI助手</span>
          </template>
          <el-menu-item index="9-1">
            <el-icon><ChatDotRound /></el-icon>
            <span>智能对话</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </div>

    <!-- 数据库选择 -->
    <div class="database-selector" v-if="selectedSoftware">
      <div class="section-title">数据库</div>
      <el-select
        v-model="selectedDatabase"
        placeholder="选择数据库"
        size="small"
        style="width: 100%"
      >
        <el-option
          v-for="db in availableDatabases"
          :key="db.value"
          :label="db.label"
          :value="db.value"
        />
      </el-select>
    </div>

    <!-- 快捷操作 -->
    <div class="quick-actions">
      <div class="section-title">快捷操作</div>
      <div class="action-buttons">
        <!-- AI对话快捷入口 -->
        <el-button
          type="primary"
          size="small"
          @click="openAIChat"
          class="ai-chat-btn"
        >
          <el-icon class="ai-icon"><ChatDotRound /></el-icon>
          AI智能助手
        </el-button>

        <el-button
          type="primary"
          size="small"
          @click="newCalculation"
          icon="Plus"
        >
          新建计算
        </el-button>
        <el-button
          type="success"
          size="small"
          @click="importData"
          icon="Upload"
        >
          导入数据
        </el-button>
        <el-button
          type="info"
          size="small"
          @click="exportResults"
          icon="Download"
        >
          导出结果
        </el-button>
      </div>
    </div>

    <!-- 系统状态 -->
    <div class="system-status">
      <div class="section-title">系统状态</div>
      <div class="status-item">
        <span class="status-label">CPU 使用率:</span>
        <el-progress :percentage="systemStatus.cpu" :stroke-width="6" />
      </div>
      <div class="status-item">
        <span class="status-label">内存使用率:</span>
        <el-progress
          :percentage="systemStatus.memory"
          :stroke-width="6"
          status="success"
        />
      </div>
      <div class="status-item">
        <span class="status-label">运行任务:</span>
        <span class="status-value">{{ systemStatus.runningTasks }} 个</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";

export default {
  name: "SideMenu",
  setup() {
    const router = useRouter();
    const selectedSoftware = ref("OC");
    const activeMenu = ref("1-1");

    // 模拟最近任务数据
    const recentTasks = ref([
      { name: "Fe-C 相图", status: "success", time: "2024-01-20 14:30" },
      { name: "Al-Cu 分析", status: "running", time: "2024-01-20 15:15" },
    ]);

    // 模拟系统状态数据
    const systemStatus = ref({
      cpu: 45,
      memory: 62,
      runningTasks: 2,
    });

    // 数据库相关
    const selectedDatabase = ref("");
    const availableDatabases = ref([
      { label: "TCFE12 (铁基合金)", value: "TCFE12" },
      { label: "TCAL6 (铝基合金)", value: "TCAL6" },
      { label: "TCNI12 (镍基合金)", value: "TCNI12" },
      { label: "TCTI2 (钛基合金)", value: "TCTI2" },
    ]);

    // 切换软件
    const switchSoftware = (val) => {
      ElMessage.info(`已切换至 ${getSoftwareName(val)}`);
      // 切换软件时重置路由
      if (val === "OC") router.push("/oc/phase");
      if (val === "TC") router.push("/tc/analysis");
      if (val === "Pandat") router.push("/pandat/analysis");
      if (val === "PhaseLab") router.push("/phaselab/modeling");
    };

    // 菜单选择处理
    const handleMenuSelect = (key) => {
      activeMenu.value = key;

      // 根据菜单项跳转到相应页面
      switch (key) {
        case "1-1":
          if (selectedSoftware.value === "OC") router.push("/oc/phase");
          else if (selectedSoftware.value === "TC") router.push("/tc/analysis");
          else if (selectedSoftware.value === "Pandat")
            router.push("/pandat/analysis");
          else if (selectedSoftware.value === "PhaseLab")
            router.push("/phaselab/modeling");
          break;
        case "1-2":
          if (selectedSoftware.value === "OC") router.push("/oc/analysis");
          else if (selectedSoftware.value === "TC") router.push("/tc/analysis");
          else if (selectedSoftware.value === "Pandat")
            router.push("/pandat/analysis");
          else if (selectedSoftware.value === "PhaseLab")
            router.push("/phaselab/modeling");
          break;
        case "1-3":
          ElMessage.info("平衡计算功能开发中...");
          break;
        case "1-4":
          router.push("/case1/calculation");
          break;
        case "1-5":
          router.push("/case2/calculation");
          break;
        case "2-1":
        case "2-3":
        case "2-4":
          router.push("/simulation/calculation");
          break;
        case "2-2":
          // 跳转到模拟计算中心并指定显示扩散模拟
          router.push("/simulation/calculation?tab=diffusion");
          break;
        case "3-1":
          ElMessage.info("批量任务调度功能开发中...");
          break;
        case "3-2":
          ElMessage.info("实验数据对比功能开发中...");
          break;
        case "3-3":
          ElMessage.info("多软件联合计算功能开发中...");
          break;
        case "5-1":
          ElMessage.info("常用模板功能开发中...");
          break;
        case "5-2":
          ElMessage.info("自定义模板功能开发中...");
          break;
        case "5-3":
          ElMessage.info("共享模板功能开发中...");
          break;
        case "6-1":
          router.push("/intelligent/interactive-phase");
          break;
        case "6-2":
          router.push("/intelligent/auto-optimization");
          break;
        case "6-3":
          router.push("/intelligent/database-builder");
          break;
        case "7-1":
          router.push("/demo/view-modes");
          break;
        case "8-1":
          router.push("/optimization/thermo");
          break;
        case "8-2":
          router.push("/simulation/calculation?tab=diffusion");
          break;
        case "8-3":
          ElMessage.info("实验数据拟合功能开发中...");
          break;
        case "8-4":
          ElMessage.info("相图预测算法功能开发中...");
          break;
        case "9-1":
          router.push("/ai/chat");
          break;
        default:
          if (key.startsWith("4-") && key !== "4-more") {
            ElMessage.info("加载历史记录...");
          }
          break;
      }
    };

    // 获取软件名称
    const getSoftwareName = (code) => {
      const names = {
        OC: "OpenCalphad",
        TC: "Thermo-Calc",
        Pandat: "Pandat",
        PhaseLab: "PhaseLab",
      };
      return names[code] || code;
    };

    // 快捷操作
    const newCalculation = () => {
      ElMessage.success("正在创建新的计算任务...");
    };

    const importData = () => {
      ElMessage.info("打开数据导入对话框...");
    };

    const exportResults = () => {
      ElMessage.info("打开结果导出对话框...");
    };

    // AI对话快捷入口
    const openAIChat = () => {
      router.push("/ai/chat");
      ElMessage.success("欢迎使用AI智能助手！");
    };

    // 定时更新系统状态
    const updateSystemStatus = () => {
      // 模拟系统状态变化
      systemStatus.value.cpu = Math.floor(Math.random() * 30) + 30; // 30-60%
      systemStatus.value.memory = Math.floor(Math.random() * 20) + 50; // 50-70%
    };

    onMounted(() => {
      // 每10秒更新一次系统状态
      setInterval(updateSystemStatus, 10000);
    });

    return {
      selectedSoftware,
      activeMenu,
      recentTasks,
      systemStatus,
      selectedDatabase,
      availableDatabases,
      switchSoftware,
      handleMenuSelect,
      getSoftwareName,
      newCalculation,
      importData,
      exportResults,
      openAIChat,
    };
  },
};
</script>

<style scoped>
.side-menu {
  height: 100%;
  padding: 20px 16px;
  overflow-y: auto;
  overflow-x: hidden;
  /* 优化滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 transparent;
}

/* Webkit浏览器滚动条样式 */
.side-menu::-webkit-scrollbar {
  width: 6px;
}

.side-menu::-webkit-scrollbar-track {
  background: transparent;
}

.side-menu::-webkit-scrollbar-thumb {
  background-color: #c1c1c1;
  border-radius: 3px;
  transition: background-color 0.3s ease;
}

.side-menu::-webkit-scrollbar-thumb:hover {
  background-color: #909399;
}

.software-selector {
  margin-bottom: 20px;
}

.database-selector {
  margin-bottom: 24px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  padding-left: 4px;
}

.software-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  width: 100%;
}

.software-icon {
  font-size: 16px;
  color: #666;
}

.function-menu {
  margin-bottom: 24px;
}

.menu-container {
  border: none;
}

.record-tag {
  margin-left: auto;
  font-size: 10px;
}

.empty-text {
  color: #999;
  font-style: italic;
}

.quick-actions {
  margin-bottom: 24px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-buttons .el-button {
  width: 100% !important;
  justify-content: flex-start;
}

.system-status {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}

.status-item {
  margin-bottom: 12px;
}

.status-label {
  display: block;
  font-size: 12px;
  color: white !important; /* 修改为白色 */
  margin-bottom: 4px;
}

.status-value {
  font-size: 14px;
  font-weight: 600;
  color: white !important; /* 修改为白色 */
}

:deep(.el-radio-group) {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

:deep(.el-radio-button) {
  width: 100%;
}

:deep(.el-radio-button__inner) {
  width: 100%;
  border-radius: 6px;
  border: 1px solid #dcdfe6;
  background: #fff;
  color: #333;
  padding: 8px;
  text-align: left;
  transition: all 0.3s;
}

:deep(.el-radio-button__inner:hover) {
  border-color: #409eff;
  color: #409eff;
}

:deep(.el-radio-button.is-active .el-radio-button__inner) {
  background: #409eff;
  border-color: #409eff;
  color: #fff;
}

:deep(.el-radio-button.is-active .software-icon) {
  color: #fff;
}

/* 自定义SVG图标样式 */
.custom-icon {
  display: inline-block;
  vertical-align: middle;
  color: #909399;
  margin-right: 8px;
  transition: color 0.3s ease;
}

/* 当父菜单被激活时的样式 */
:deep(.el-sub-menu.is-active) .custom-icon {
  color: #409eff;
}

:deep(.el-sub-menu__title) {
  padding: 0 20px;
  height: 48px;
  line-height: 48px;
  font-weight: 500;
}

:deep(.el-menu-item) {
  padding: 0 20px 0 40px;
  height: 40px;
  line-height: 40px;
}

:deep(.el-menu-item.is-active) {
  background-color: #ecf5ff;
  border-right: 3px solid #409eff;
}

:deep(.el-progress) {
  margin-top: 4px;
}

:deep(.el-progress__text) {
  font-size: 10px;
}

/* 快捷操作按钮对齐优化 */
:deep(.action-buttons .el-button) {
  width: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  text-align: left !important;
  padding: 8px 12px !important;
  margin: 0 !important; /* 确保所有按钮都没有额外margin */
}

:deep(.action-buttons .el-button .el-icon) {
  margin-right: 6px !important;
}

:deep(.action-buttons .el-button span) {
  flex: 1;
  text-align: left;
}

/* AI对话按钮特殊样式 */
.ai-chat-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border: none !important;
  color: white !important;
  font-weight: 600 !important;
  position: relative;
  overflow: hidden;
  margin: 0 !important; /* 移除额外的margin，使用容器的gap统一间距 */
}

.ai-chat-btn:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4) !important;
}

.ai-chat-btn .ai-icon {
  font-size: 16px;
  margin-right: 8px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.ai-chat-btn::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: rotate(45deg);
  transition: all 0.6s;
  opacity: 0;
}

.ai-chat-btn:hover::before {
  animation: shimmer 0.6s ease-in-out;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
    opacity: 0;
  }
}</style>