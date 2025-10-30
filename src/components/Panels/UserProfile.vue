<template>
  <div class="user-profile">
    <!-- 页面头部 -->
    <div class="profile-header">
      <el-row :gutter="20" align="middle">
        <el-col :span="18">
          <h2 class="page-title">
            <el-icon class="title-icon"><User /></el-icon>
            个人中心
          </h2>
          <p class="page-description">
            管理您的个人信息、偏好设置和系统权限
          </p>
        </el-col>
        <el-col :span="6" class="text-right">
          <el-button type="primary" @click="editProfile" icon="Edit">
            编辑资料
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 个人信息卡片 -->
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="profile-card" shadow="hover">
          <div class="profile-avatar-section">
            <el-avatar :size="120" class="profile-avatar">
              <el-icon><User /></el-icon>
            </el-avatar>
            <div class="avatar-actions">
              <el-button type="text" @click="changeAvatar" icon="Camera">
                更换头像
              </el-button>
            </div>
          </div>
          <div class="profile-basic-info">
            <h3 class="user-name">{{ userInfo.name }}</h3>
            <p class="user-title">{{ userInfo.title }}</p>
            <div class="user-status">
              <el-tag :type="userInfo.status === '在线' ? 'success' : 'info'" size="small">
                {{ userInfo.status }}
              </el-tag>
            </div>
          </div>
          <div class="profile-stats">
            <div class="stat-item">
              <div class="stat-number">{{ userInfo.totalCalculations }}</div>
              <div class="stat-label">总计算次数</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ userInfo.successRate }}%</div>
              <div class="stat-label">成功率</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ userInfo.onlineHours }}</div>
              <div class="stat-label">在线时长(h)</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card class="profile-details" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>详细信息</span>
              <el-button type="text" @click="editDetails" icon="Edit">
                编辑
              </el-button>
            </div>
          </template>
          
          <el-tabs v-model="activeTab" type="border-card">
            <!-- 基本信息 -->
            <el-tab-pane label="基本信息" name="basic">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="用户名">
                  {{ userInfo.username }}
                </el-descriptions-item>
                <el-descriptions-item label="邮箱">
                  {{ userInfo.email }}
                </el-descriptions-item>
                <el-descriptions-item label="手机号">
                  {{ userInfo.phone }}
                </el-descriptions-item>
                <el-descriptions-item label="部门">
                  {{ userInfo.department }}
                </el-descriptions-item>
                <el-descriptions-item label="职位">
                  {{ userInfo.position }}
                </el-descriptions-item>
                <el-descriptions-item label="工号">
                  {{ userInfo.employeeId }}
                </el-descriptions-item>
                <el-descriptions-item label="注册时间">
                  {{ userInfo.registerTime }}
                </el-descriptions-item>
                <el-descriptions-item label="最后登录">
                  {{ userInfo.lastLogin }}
                </el-descriptions-item>
              </el-descriptions>
            </el-tab-pane>

            <!-- 系统偏好 -->
            <el-tab-pane label="系统偏好" name="preferences">
              <el-form :model="preferences" label-width="120px">
                <el-form-item label="界面语言">
                  <el-select v-model="preferences.language" style="width: 200px">
                    <el-option label="中文" value="zh" />
                    <el-option label="English" value="en" />
                  </el-select>
                </el-form-item>
                <el-form-item label="主题模式">
                  <el-radio-group v-model="preferences.theme">
                    <el-radio label="light">浅色主题</el-radio>
                    <el-radio label="dark">深色主题</el-radio>
                    <el-radio label="auto">跟随系统</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="默认软件">
                  <el-select v-model="preferences.defaultSoftware" style="width: 200px">
                    <el-option label="OpenCalphad" value="OC" />
                    <el-option label="Thermo-Calc" value="TC" />
                    <el-option label="Pandat" value="Pandat" />
                    <el-option label="PhaseLab" value="PhaseLab" />
                  </el-select>
                </el-form-item>
                <el-form-item label="自动保存">
                  <el-switch v-model="preferences.autoSave" />
                  <span class="setting-description">计算结果自动保存到数据库</span>
                </el-form-item>
                <el-form-item label="邮件通知">
                  <el-switch v-model="preferences.emailNotification" />
                  <span class="setting-description">计算完成后发送邮件通知</span>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="savePreferences">
                    保存设置
                  </el-button>
                  <el-button @click="resetPreferences">
                    重置
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <!-- 安全设置 -->
            <el-tab-pane label="安全设置" name="security">
              <div class="security-section">
                <h4>密码安全</h4>
                <el-form :model="passwordForm" label-width="120px">
                  <el-form-item label="当前密码">
                    <el-input 
                      v-model="passwordForm.currentPassword" 
                      type="password" 
                      placeholder="请输入当前密码"
                      style="width: 300px"
                    />
                  </el-form-item>
                  <el-form-item label="新密码">
                    <el-input 
                      v-model="passwordForm.newPassword" 
                      type="password" 
                      placeholder="请输入新密码"
                      style="width: 300px"
                    />
                  </el-form-item>
                  <el-form-item label="确认密码">
                    <el-input 
                      v-model="passwordForm.confirmPassword" 
                      type="password" 
                      placeholder="请再次输入新密码"
                      style="width: 300px"
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="changePassword">
                      修改密码
                    </el-button>
                  </el-form-item>
                </el-form>

                <el-divider />

                <h4>登录安全</h4>
                <div class="security-items">
                  <div class="security-item">
                    <div class="security-info">
                      <strong>双因素认证</strong>
                      <p>启用双因素认证以提高账户安全性</p>
                    </div>
                    <el-switch v-model="securitySettings.twoFactorAuth" />
                  </div>
                  <div class="security-item">
                    <div class="security-info">
                      <strong>登录提醒</strong>
                      <p>有新设备登录时发送邮件提醒</p>
                    </div>
                    <el-switch v-model="securitySettings.loginAlert" />
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <!-- 计算历史 -->
            <el-tab-pane label="计算历史" name="history">
              <div class="history-section">
                <div class="history-filters">
                  <el-date-picker
                    v-model="historyDateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    format="YYYY/MM/DD"
                    value-format="YYYY-MM-DD"
                  />
                  <el-select v-model="historyFilter" placeholder="筛选软件" style="width: 150px; margin-left: 10px">
                    <el-option label="全部" value="" />
                    <el-option label="OpenCalphad" value="OC" />
                    <el-option label="Thermo-Calc" value="TC" />
                    <el-option label="Pandat" value="Pandat" />
                  </el-select>
                </div>
                
                <el-table :data="calculationHistory" stripe style="margin-top: 20px">
                  <el-table-column prop="name" label="计算名称" />
                  <el-table-column prop="software" label="软件" width="120" />
                  <el-table-column prop="startTime" label="开始时间" width="180" />
                  <el-table-column prop="duration" label="耗时" width="100" />
                  <el-table-column prop="status" label="状态" width="100">
                    <template #default="scope">
                      <el-tag :type="scope.row.status === '成功' ? 'success' : 'danger'">
                        {{ scope.row.status }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="150">
                    <template #default="scope">
                      <el-button type="text" size="small" @click="viewResult(scope.row)">
                        查看结果
                      </el-button>
                      <el-button type="text" size="small" @click="rerun(scope.row)">
                        重新运行
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>

                <el-pagination
                  :current-page="currentPage"
                  @current-change="handlePageChange"
                  :page-size="pageSize"
                  :total="totalHistory"
                  layout="total, prev, pager, next"
                  style="margin-top: 20px; text-align: center"
                />
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>

    <!-- 编辑资料对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑个人资料" width="50%">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="姓名">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="职位">
          <el-input v-model="editForm.title" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="editForm.email" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="editForm.phone" />
        </el-form-item>
        <el-form-item label="部门">
          <el-input v-model="editForm.department" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveProfile">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';

export default {
  name: 'UserProfile',
  setup() {
    const activeTab = ref('basic');
    const editDialogVisible = ref(false);
    const currentPage = ref(1);
    const pageSize = ref(10);
    const totalHistory = ref(50);
    const historyDateRange = ref([]);
    const historyFilter = ref('');

    // 用户信息
    const userInfo = reactive({
      name: '张三',
      title: '热力学工程师',
      username: 'zhangsan',
      email: 'zhangsan@example.com',
      phone: '13800138000',
      department: '材料科学与工程学院',
      position: '研究生',
      employeeId: 'E20240001',
      registerTime: '2024-01-15 09:30:00',
      lastLogin: '2024-01-20 14:25:00',
      status: '在线',
      totalCalculations: 156,
      successRate: 94.5,
      onlineHours: 89.5
    });

    // 系统偏好设置
    const preferences = reactive({
      language: 'zh',
      theme: 'light',
      defaultSoftware: 'OC',
      autoSave: true,
      emailNotification: false
    });

    // 密码表单
    const passwordForm = reactive({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    // 安全设置
    const securitySettings = reactive({
      twoFactorAuth: false,
      loginAlert: true
    });

    // 编辑表单
    const editForm = reactive({
      name: userInfo.name,
      title: userInfo.title,
      email: userInfo.email,
      phone: userInfo.phone,
      department: userInfo.department
    });

    // 计算历史
    const calculationHistory = ref([
      {
        id: 1,
        name: 'Fe-C相图计算',
        software: 'OpenCalphad',
        startTime: '2024-01-20 14:30:00',
        duration: '3分25秒',
        status: '成功'
      },
      {
        id: 2,
        name: 'Al-Cu热力学分析',
        software: 'Thermo-Calc',
        startTime: '2024-01-20 13:15:00',
        duration: '5分12秒',
        status: '成功'
      },
      {
        id: 3,
        name: 'Ti-Al相图建模',
        software: 'PhaseLab',
        startTime: '2024-01-20 10:45:00',
        duration: '8分30秒',
        status: '失败'
      }
    ]);

    // 方法
    const editProfile = () => {
      editDialogVisible.value = true;
    };

    const changeAvatar = () => {
      ElMessage.info('头像上传功能开发中...');
    };

    const editDetails = () => {
      ElMessage.info('详细信息编辑功能开发中...');
    };

    const saveProfile = () => {
      Object.assign(userInfo, editForm);
      editDialogVisible.value = false;
      ElMessage.success('个人资料已更新');
    };

    const savePreferences = () => {
      ElMessage.success('偏好设置已保存');
    };

    const resetPreferences = () => {
      preferences.language = 'zh';
      preferences.theme = 'light';
      preferences.defaultSoftware = 'OC';
      preferences.autoSave = true;
      preferences.emailNotification = false;
      ElMessage.info('偏好设置已重置');
    };

    const changePassword = () => {
      if (!passwordForm.currentPassword) {
        ElMessage.warning('请输入当前密码');
        return;
      }
      if (!passwordForm.newPassword) {
        ElMessage.warning('请输入新密码');
        return;
      }
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        ElMessage.error('两次输入的密码不一致');
        return;
      }
      ElMessage.success('密码修改成功');
      passwordForm.currentPassword = '';
      passwordForm.newPassword = '';
      passwordForm.confirmPassword = '';
    };

    const viewResult = (row) => {
      ElMessage.info(`查看计算结果: ${row.name}`);
    };

    const rerun = (row) => {
      ElMessage.info(`重新运行计算: ${row.name}`);
    };

    const handlePageChange = (page) => {
      currentPage.value = page;
    };

    return {
      activeTab,
      editDialogVisible,
      currentPage,
      pageSize,
      totalHistory,
      historyDateRange,
      historyFilter,
      userInfo,
      preferences,
      passwordForm,
      securitySettings,
      editForm,
      calculationHistory,
      editProfile,
      changeAvatar,
      editDetails,
      saveProfile,
      savePreferences,
      resetPreferences,
      changePassword,
      viewResult,
      rerun,
      handlePageChange
    };
  }
};
</script>

<style scoped>
.user-profile {
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.profile-header {
  margin-bottom: 32px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.page-title {
  margin: 0;
  color: #2c3e50;
  font-size: 28px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  font-size: 32px;
  color: #3498db;
}

.page-description {
  margin: 8px 0 0 0;
  color: #7f8c8d;
  font-size: 16px;
}

.text-right {
  text-align: right;
}

.profile-card {
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.profile-avatar-section {
  margin-bottom: 20px;
}

.profile-avatar {
  background: rgba(255, 255, 255, 0.2);
  border: 4px solid rgba(255, 255, 255, 0.3);
  margin-bottom: 16px;
}

.avatar-actions .el-button {
  color: white;
}

.profile-basic-info {
  margin-bottom: 24px;
}

.user-name {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.user-title {
  margin: 0 0 12px 0;
  font-size: 16px;
  opacity: 0.9;
}

.user-status {
  margin-bottom: 16px;
}

.profile-stats {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
}

.profile-details {
  height: fit-content;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.setting-description {
  margin-left: 12px;
  font-size: 12px;
  color: #666;
}

.security-section h4 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 16px;
}

.security-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.security-info strong {
  display: block;
  margin-bottom: 4px;
  color: #333;
}

.security-info p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.history-filters {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

/* 卡片样式优化 */
:deep(.el-card) {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.el-card__header) {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px 12px 0 0;
}

/* 标签页样式 */
:deep(.el-tabs--border-card > .el-tabs__header .el-tabs__item.is-active) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
}

/* 表格样式 */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

/* 头像样式 */
:deep(.el-avatar) {
  font-size: 48px;
}
</style>