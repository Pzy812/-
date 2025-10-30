<template>
  <div class="top-nav">
    <div class="nav-left">
      <div class="logo-section">
        <el-icon class="logo-icon"><DataAnalysis /></el-icon>
        <span class="title">热力学智能体计算平台</span>
      </div>
    </div>

    <div class="nav-center">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>{{ currentModule }}</el-breadcrumb-item>
        <el-breadcrumb-item v-if="currentSubModule">{{
          currentSubModule
        }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="nav-right">
      <div class="status-indicator">
        <el-badge :value="runningTasks" :max="99" class="mr-3">
          <el-button type="text" @click="showTaskManager">
            <el-icon><Monitor /></el-icon>
            运行状态
          </el-button>
        </el-badge>
      </div>

      <el-dropdown trigger="hover" class="user-dropdown">
        <span class="user-info">
          <el-avatar :size="32" class="mr-2">
            <el-icon><User /></el-icon>
          </el-avatar>
          <span>{{ userName }}</span>
          <el-icon class="ml-1"><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="showProfile">
              <el-icon><User /></el-icon>
              个人中心
            </el-dropdown-item>
            <el-dropdown-item @click="showSettings">
              <el-icon><Setting /></el-icon>
              系统设置
            </el-dropdown-item>
            <el-dropdown-item divided @click="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <el-tooltip content="使用帮助" placement="bottom">
        <el-button type="text" @click="showHelp = true" class="ml-2">
          <el-icon><QuestionFilled /></el-icon>
        </el-button>
      </el-tooltip>

      <!-- 主题切换按钮 -->
      <el-dropdown @command="handleThemeCommand" trigger="hover" class="ml-2">
        <el-button type="text" class="theme-switch-btn">
          <el-icon><Brush /></el-icon>
          <span class="theme-text">主题</span>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="theme in availableThemes"
              :key="theme.name"
              :command="theme.name"
              :class="{ 'is-active': currentTheme === theme.name }"
            >
              <div class="theme-option">
                <div
                  class="theme-color-preview"
                  :style="{ background: theme.primary }"
                ></div>
                <span>{{ theme.label }}</span>
                <el-icon v-if="currentTheme === theme.name" class="theme-check">
                  <Check />
                </el-icon>
              </div>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 使用帮助对话框 -->
    <el-dialog v-model="showHelp" title="使用帮助" width="60%" draggable>
      <el-tabs type="border-card">
        <el-tab-pane label="快速入门">
          <div class="help-content">
            <h4>1. 选择计算软件</h4>
            <p>
              在左侧菜单中选择您要使用的热力学计算软件：OpenCalphad、Thermo-Calc、Pandat
              或 PhaseLab。
            </p>

            <h4>2. 配置计算参数</h4>
            <p>在中间区域设置合金系统、温度范围、组分范围等计算参数。</p>

            <h4>3. 开始计算</h4>
            <p>点击“开始计算”按钮，系统将自动调用相应的计算软件进行计算。</p>

            <h4>4. 查看结果</h4>
            <p>计算完成后，在右侧结果面板查看相图、数据表格和热力学性质。</p>
          </div>
        </el-tab-pane>

        <el-tab-pane label="常见问题">
          <div class="help-content">
            <h4>Q: 计算失败怎么办？</h4>
            <p>
              A: 请检查输入参数是否正确，确保温度范围和组分范围在合理范围内。
            </p>

            <h4>Q: 如何导出计算结果？</h4>
            <p>
              A: 在结果面板点击“导出结果”按钮，可以将结果保存为 Excel 或 PDF
              格式。
            </p>

            <h4>Q: 支持哪些数据库？</h4>
            <p>A: 系统支持 TCFE、TCAL、TCNI、TCTI 等主流热力学数据库。</p>
          </div>
        </el-tab-pane>

        <el-tab-pane label="联系我们">
          <div class="help-content">
            <p><strong>技术支持：</strong>support@thermoplatform.com</p>
            <p><strong>用户手册：</strong><a href="#">下载 PDF</a></p>
            <p><strong>视频教程：</strong><a href="#">观看在线教程</a></p>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

    <!-- 任务管理器对话框 -->
    <el-dialog
      v-model="showTaskDialog"
      title="运行任务管理器"
      width="70%"
      draggable
    >
      <el-table :data="taskList" border size="small">
        <el-table-column prop="id" label="任务ID" width="80" />
        <el-table-column prop="name" label="任务名称" width="200" />
        <el-table-column prop="software" label="计算软件" width="120" />
        <el-table-column prop="progress" label="进度" width="120">
          <template #default="scope">
            <el-progress
              :percentage="scope.row.progress"
              :status="scope.row.status"
            />
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="150" />
        <el-table-column prop="estimatedTime" label="预估剩余" width="100" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button type="text" size="small" @click="pauseTask(scope.row)"
              >暂停</el-button
            >
            <el-button type="text" size="small" @click="stopTask(scope.row)"
              >停止</el-button
            >
            <el-button
              type="text"
              size="small"
              @click="viewTaskDetails(scope.row)"
              >详情</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, watch, inject } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";

export default {
  name: "TopNav",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const showHelp = ref(false);
    const showTaskDialog = ref(false);
    const userName = ref("研究生");
    const runningTasks = ref(2);

    // 从父组件注入主题相关状态和方法
    const currentTheme = inject('currentTheme', ref('default'));
    const changeTheme = inject('changeTheme', () => {});

    // 可用主题列表
    const availableThemes = [
      { name: 'default', label: '默认蓝', primary: '#409EFF' },
      { name: 'green', label: '科研绿', primary: '#67C23A' },
      { name: 'orange', label: '活力橙', primary: '#E6A23C' },
      { name: 'red', label: '热力红', primary: '#F56C6C' },
      { name: 'purple', label: '高端紫', primary: '#909399' },
      { name: 'dark', label: '深色模式', primary: '#2c3e50' }
    ];

    // 模拟任务列表
    const taskList = ref([
      {
        id: 1,
        name: "Fe-C相图计算",
        software: "OpenCalphad",
        progress: 75,
        status: "",
        startTime: "2024-01-20 14:30:25",
        estimatedTime: "2分30秒",
      },
      {
        id: 2,
        name: "Al-Cu热力学分析",
        software: "Thermo-Calc",
        progress: 45,
        status: "",
        startTime: "2024-01-20 14:35:10",
        estimatedTime: "5分15秒",
      },
    ]);

    // 当前模块和子模块
    const currentModule = computed(() => {
      const path = route.path;
      if (path.includes("/oc")) return "OpenCalphad";
      if (path.includes("/tc")) return "Thermo-Calc";
      if (path.includes("/pandat")) return "Pandat";
      if (path.includes("/phaselab")) return "PhaseLab";
      if (path.includes("/ai")) return "AI助手";
      if (path.includes("/simulation")) return "模拟计算";
      if (path.includes("/user")) return "个人中心";
      return "首页";
    });

    const currentSubModule = computed(() => {
      const path = route.path;
      if (path.includes("/phase")) return "相图计算";
      if (path.includes("/analysis")) return "热力学分析";
      if (path.includes("/modeling")) return "相图建模";
      if (path.includes("/property")) return "性质计算";
      if (path.includes("/chat")) return "智能对话";
      if (path.includes("/calculation")) return "模拟计算中心";
      if (path.includes("/profile")) return "个人资料";
      return "";
    });

    // 显示任务管理器
    const showTaskManager = () => {
      showTaskDialog.value = true;
    };

    // 显示个人中心
    const showProfile = () => {
      router.push("/user/profile");
    };

    // 显示设置
    const showSettings = () => {
      ElMessage.info("系统设置功能开发中...");
    };

    // 退出登录
    const logout = () => {
      ElMessageBox.confirm("确定要退出登录吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          ElMessage.success("已退出登录");
          // 这里实现退出逻辑
        })
        .catch(() => {
          // 取消退出
        });
    };

    // 主题切换处理
    const handleThemeCommand = (themeName) => {
      if (changeTheme && typeof changeTheme === 'function') {
        changeTheme(themeName);
      } else {
        // 如果没有注入的方法，就直接处理
        currentTheme.value = themeName;
        document.documentElement.setAttribute('data-theme', themeName);

        // 更新CSS变量
        const theme = availableThemes.find(t => t.name === themeName);
        if (theme) {
          document.documentElement.style.setProperty('--el-color-primary', theme.primary);
        }

        ElMessage.success(`已切换到${availableThemes.find(t => t.name === themeName)?.label}主题`);
      }
    };

    // 任务操作
    const pauseTask = (task) => {
      ElMessage.info(`已暂停任务: ${task.name}`);
    };

    const stopTask = (task) => {
      ElMessage.warning(`已停止任务: ${task.name}`);
      const index = taskList.value.findIndex((t) => t.id === task.id);
      if (index > -1) {
        taskList.value.splice(index, 1);
        runningTasks.value = taskList.value.length;
      }
    };

    const viewTaskDetails = (task) => {
      ElMessage.info(`查看任务详情: ${task.name}`);
    };

    return {
      showHelp,
      showTaskDialog,
      userName,
      runningTasks,
      taskList,
      currentModule,
      currentSubModule,
      currentTheme,
      availableThemes,
      showTaskManager,
      showProfile,
      showSettings,
      logout,
      handleThemeCommand,
      pauseTask,
      stopTask,
      viewTaskDetails,
    };
  },
};
</script>

<style scoped>
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.nav-left {
  flex: 0 0 auto;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 24px;
  color: #fff;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.nav-center {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.nav-right {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-indicator {
  display: flex;
  align-items: center;
}

.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  color: #fff;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.help-content {
  padding: 0 16px;
}

.help-content h4 {
  color: #333;
  margin: 16px 0 8px 0;
  font-size: 16px;
}

.help-content p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 12px;
}

.help-content a {
  color: #409eff;
  text-decoration: none;
}

.help-content a:hover {
  text-decoration: underline;
}

.mr-2 {
  margin-right: 8px;
}

.mr-3 {
  margin-right: 12px;
}

.ml-1 {
  margin-left: 4px;
}

.ml-2 {
  margin-left: 8px;
}

.ml-3 {
  margin-left: 12px;
}

/* 主题切换按钮样式 */
.theme-switch-btn {
  color: rgba(255, 255, 255, 0.9) !important;
  display: flex !important;
  align-items: center !important;
  gap: 4px !important;
  padding: 8px 12px !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
}

.theme-switch-btn:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: #fff !important;
}

.theme-text {
  font-size: 14px;
  font-weight: 500;
}

/* 主题选项样式 */
.theme-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  width: 100%;
}

.theme-color-preview {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}

.theme-check {
  margin-left: auto;
  color: #67c23a;
  font-weight: bold;
}

/* 激活的主题选项 */
:deep(.el-dropdown-menu__item.is-active) {
  background-color: #f0f9ff;
  color: #409eff;
  font-weight: 600;
}

:deep(.el-dropdown-menu__item:hover) {
  background-color: #f0f9ff;
}

:deep(.el-breadcrumb) {
  color: #ffffff;
}

:deep(.el-breadcrumb__item) {
  color: #ffffff;
  font-weight: 500;
}

:deep(.el-breadcrumb__inner) {
  color: #ffffff !important;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

:deep(.el-breadcrumb__inner:hover) {
  color: #fff !important;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

:deep(.el-breadcrumb__separator) {
  color: #ffffff !important;
  font-weight: 600;
}

:deep(.el-button--text) {
  color: rgba(255, 255, 255, 0.9);
}

:deep(.el-button--text:hover) {
  color: #fff;
}
</style>
