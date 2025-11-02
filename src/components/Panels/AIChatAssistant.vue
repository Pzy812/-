<template>
  <div class="dify-ai-assistant">
    <!-- 顶部导航栏 -->
    <div class="top-header">
      <div class="header-left">
        <div class="logo">
          <el-icon class="logo-icon"><Avatar /></el-icon>
          <span class="logo-text">热力学AI助手</span>
          </div>
        <el-button type="primary" size="small" class="upgrade-btn">升级</el-button>
            </div>

      <div class="header-center">
        <div class="nav-tabs">
          <div class="nav-item">探索</div>
          <div class="nav-item" :class="{ active: activeTab === 'arrangement' }" @click="activeTab = 'arrangement'">工作室</div>
          <div class="nav-item" :class="{ active: activeTab === 'knowledge' }" @click="activeTab = 'knowledge'">知识库</div>
          <div class="nav-item">工具</div>
          </div>
      </div>

      <div class="header-right">
        <el-button type="text" class="header-btn">插件</el-button>
        <div class="user-info">
          <el-icon class="user-avatar"><User /></el-icon>
          <span class="user-name">用户</span>
          <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
        </div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 左侧导航栏 -->
      <div class="left-sidebar">
        <div class="sidebar-header">
          <el-icon class="robot-icon"><Avatar /></el-icon>
          <div class="agent-info">
            <div class="agent-name">热力学计算助手</div>
            <div class="agent-type">AGENT</div>
          </div>
        </div>

        <div class="sidebar-nav">
          <div class="nav-item active" @click="activeTab = 'arrangement'">
            <el-icon><Edit /></el-icon>
            <span>编排</span>
          </div>
          <div class="nav-item" @click="activeTab = 'api'">
            <el-icon><Link /></el-icon>
            <span>访问API</span>
          </div>
          <div class="nav-item" @click="activeTab = 'logs'">
            <el-icon><Document /></el-icon>
            <span>日志与标注</span>
          </div>
          <div class="nav-item" @click="activeTab = 'monitoring'">
            <el-icon><Monitor /></el-icon>
            <span>监测</span>
          </div>
        </div>
      </div>

      <!-- 中央编排区域 -->
      <div class="center-panel">
        <div class="panel-header">
          <div class="header-left">
            <h2 class="panel-title">编排</h2>
          </div>
          <div class="header-right">
            <el-button type="text" class="header-btn" @click="toggleSettings">
              <el-icon><Setting /></el-icon>
              Agent 设置
            </el-button>
            <div class="model-selector">
              <el-select v-model="selectedModel" placeholder="选择AI模型" class="model-select">
                <el-option label="通义千问" value="qwen" />
                <el-option label="DeepSeek" value="deepseek" />
              </el-select>
          </div>
            <el-button type="primary" class="publish-btn">发布</el-button>
            <el-button type="text" class="refresh-btn" @click="refreshSession">
              <el-icon><Refresh /></el-icon>
            </el-button>
        </div>
        </div>

        <div class="panel-content">
          <!-- 知识库页面 -->
          <div v-if="activeTab === 'knowledge'" class="knowledge-page">
            <div class="knowledge-header">
              <h2 class="page-title">热力学知识库</h2>
              <p class="page-desc">专业的热力学计算知识和技巧，帮助您更好地进行相图计算和热力学分析</p>
        </div>

            <div class="knowledge-search">
              <el-input
                v-model="knowledgeSearch"
                placeholder="搜索知识库内容..."
                prefix-icon="Search"
                class="search-input"
                clearable
              />
              <el-select v-model="selectedCategory" placeholder="选择分类" class="category-select">
                <el-option label="全部分类" value="" />
                <el-option label="数据库" value="数据库" />
                <el-option label="计算技巧" value="计算技巧" />
                <el-option label="参数设置" value="参数设置" />
                <el-option label="性能优化" value="性能优化" />
                <el-option label="多元合金" value="多元合金" />
              </el-select>
            </div>

            <div class="knowledge-grid">
              <div
                v-for="item in filteredKnowledge"
                :key="item.id"
                class="knowledge-card"
                @click="selectKnowledge(item)"
              >
                <div class="card-header">
                  <div class="card-title">{{ item.title }}</div>
                  <el-tag :type="getCategoryType(item.category)" size="small" class="category-tag">
                    {{ item.category }}
                  </el-tag>
                </div>
                <div class="card-content">{{ item.content }}</div>
                <div class="card-tags">
                  <el-tag
                    v-for="tag in item.tags"
                    :key="tag"
            size="small"
                    class="tag-item"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>

          <!-- 提示词编辑区域 -->
          <div v-if="activeTab === 'arrangement'" class="prompt-section">
            <div class="section-header prompt-header">
              <div class="prompt-title-group">
                <el-icon class="prompt-icon"><Edit /></el-icon>
                <span class="section-title">提示词</span>
                <el-tag v-if="!isPromptSaved" type="warning" size="small" class="unsaved-tag">未保存</el-tag>
              </div>
              <el-button type="primary" size="small" class="save-btn" @click="savePrompt">
                <el-icon><Check /></el-icon>
                保存
          </el-button>
        </div>
            <div class="prompt-editor">
              <el-input
                v-model="promptText"
                type="textarea"
                :rows="12"
                :min-rows="8"
                :max-rows="20"
                placeholder="在这里写你的提示词，输入'{'插入变量、输入'/'插入提示内容块"
                class="prompt-textarea"
                @input="updatePrompt"
                resize="vertical"
                show-word-limit
                :maxlength="2000"
              />
              <div class="editor-footer">
                <div class="footer-left">
                  <el-icon class="footer-icon"><InfoFilled /></el-icon>
                  <span class="footer-hint">提示词会与用户问题一起发送给AI，格式：提示词|^^sep^^|用户问题</span>
                </div>
                <span class="char-count">{{ promptText.length }} / 2000</span>
              </div>
            </div>
          </div>

          <!-- 变量配置区域 -->
          <div class="variables-section">
            <div class="section-header">
              <div class="section-title">
                <el-icon><InfoFilled /></el-icon>
                变量
        </div>
              <el-button type="text" size="small" @click="addVariable">+ 添加</el-button>
            </div>
            <div class="section-content">
              <p class="section-desc">变量能使用户输入表单引入提示词或开场白,你可以试试在提示词中输入{{input}}</p>

              <!-- 变量列表 -->
              <div class="variables-list" v-if="variables.length > 0">
                <div v-for="(variable, index) in variables" :key="variable.id" class="variable-item">
                  <div class="variable-info">
                    <div class="variable-name">{{ variable.name }}</div>
                    <div class="variable-type">{{ variable.typeLabel }} ({{ variable.unit }})</div>
                    <div class="variable-desc">{{ variable.description }}</div>
                    <div class="variable-meta">
                      <el-tag v-if="variable.required" type="danger" size="small">必填</el-tag>
                      <el-tag v-else type="info" size="small">可选</el-tag>
                      <span v-if="variable.defaultValue" class="default-value">默认值: {{ variable.defaultValue }}</span>
                    </div>
                  </div>
                  <div class="variable-actions">
                    <el-button type="text" size="small" @click="deleteVariable(index)">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </div>
              </div>

              <!-- 变量添加表单 -->
              <el-dialog v-model="showVariableForm" title="添加热力学变量" width="700px" :close-on-click-modal="false" class="variable-form-dialog">
                <div class="form-header">
                  <div class="form-icon">
                    <el-icon><Setting /></el-icon>
                  </div>
                  <div class="form-title">
                    <h3>添加热力学变量</h3>
                    <p>配置用于热力学计算的变量参数</p>
                  </div>
                </div>

                <el-form :model="variableForm" label-width="120px" class="variable-form">
                  <div class="form-row">
                    <el-form-item label="变量名称" required class="form-item-half">
                      <el-input
                        v-model="variableForm.name"
                        placeholder="请输入变量名称，如：temperature"
                        prefix-icon="Edit"
                        class="form-input"
                      />
                    </el-form-item>

                    <el-form-item label="变量类型" required class="form-item-half">
                      <el-select
                        v-model="variableForm.type"
                        @change="updateVariableType"
                        placeholder="选择变量类型"
                        class="form-select"
                      >
                        <el-option
                          v-for="type in variableTypes"
                          :key="type.value"
                          :label="type.label"
                          :value="type.value"
                        >
                          <div class="option-content">
                            <span class="option-label">{{ type.label }}</span>
                            <span class="option-unit">{{ type.unit }}</span>
                          </div>
                        </el-option>
                      </el-select>
                    </el-form-item>
            </div>

                  <div class="form-row">
                    <el-form-item label="单位" class="form-item-half">
                      <el-input
                        v-model="variableForm.unit"
                        placeholder="变量单位"
                        prefix-icon="ScaleToOriginal"
                        class="form-input"
                      />
                    </el-form-item>

                    <el-form-item label="默认值" class="form-item-half">
                      <el-input
                        v-model="variableForm.defaultValue"
                        placeholder="默认值（可选）"
                        prefix-icon="Document"
                        class="form-input"
                      />
                    </el-form-item>
              </div>

                  <el-form-item label="变量描述">
                    <el-input
                      v-model="variableForm.description"
                      type="textarea"
                      :rows="3"
                      placeholder="请输入变量的详细描述，帮助用户理解其用途"
                      class="form-textarea"
                    />
                  </el-form-item>

                  <el-form-item label="是否必填">
                    <div class="switch-container">
                      <el-switch
                        v-model="variableForm.required"
                        active-text="必填"
                        inactive-text="可选"
                        class="form-switch"
                      />
                      <span class="switch-hint">设置为必填后，用户必须提供此变量的值</span>
              </div>
                  </el-form-item>
                </el-form>

                <template #footer>
                  <div class="dialog-footer">
                    <el-button @click="cancelVariableForm" class="cancel-btn">
                      <el-icon><Close /></el-icon>
                      取消
                  </el-button>
                    <el-button type="primary" @click="saveVariable" class="save-btn">
                      <el-icon><Check /></el-icon>
                      保存变量
                  </el-button>
                  </div>
                </template>
              </el-dialog>
                </div>
              </div>

          <!-- 知识库配置区域 -->
          <div class="knowledge-section">
            <div class="section-header">
              <div class="section-title">知识库</div>
              <el-button type="text" size="small" @click="addKnowledge">+ 添加</el-button>
                </div>
            <div class="section-content">
              <p class="section-desc">您可以导入知识库作为上下文</p>

              <!-- 知识库内容列表 -->
              <div class="knowledge-list">
                <div v-for="item in knowledgeBaseContent" :key="item.id" class="knowledge-item">
                  <div class="knowledge-header">
                    <div class="knowledge-title">{{ item.title }}</div>
                    <el-tag :type="getCategoryType(item.category)" size="small">{{ item.category }}</el-tag>
                  </div>
                  <div class="knowledge-content">{{ item.content }}</div>
                  <div class="knowledge-tags">
                    <el-tag v-for="tag in item.tags" :key="tag" size="small" class="tag-item">{{ tag }}</el-tag>
                  </div>
                </div>
              </div>
            </div>
              </div>

          <!-- 工具配置区域 -->
          <div class="tools-section">
            <div class="section-header">
              <div class="section-title">工具</div>
              <el-button type="text" size="small" @click="addTool">+ 添加</el-button>
                </div>
            <div class="section-content">
              <p class="section-desc">0/0 启用</p>
            </div>
          </div>
                </div>
              </div>

      <!-- 可拖动分隔条 -->
      <div class="vertical-resizer" @mousedown="startRightResize" title="拖动以调整调试与预览面板宽度"></div>

      <!-- 右侧调试预览区域 -->
      <div class="right-panel" :style="{ width: rightPanelWidth + 'px' }">
        <div class="panel-header">
          <h3 class="panel-title">调试与预览</h3>
              </div>

        <div class="preview-content">
          <!-- 聊天预览区域 -->
          <div class="chat-preview" v-if="activeTab === 'arrangement'">
            <!-- 左侧：对话区 -->
            <div class="preview-chat-column">
              <div class="chat-messages" ref="chatMessages">
              <div v-for="(message, index) in messages" :key="index" class="message-item" :class="message.type">
                <div class="message-avatar">
                  <el-icon v-if="message.type === 'user'"><User /></el-icon>
                  <el-icon v-else><Avatar /></el-icon>
                </div>
                <div class="message-content">
                  <div v-if="message.content" class="message-text">{{ message.content }}</div>
                  <img v-if="message.imageData" :src="message.imageData" alt="AI生成的图片" class="preview-image" />
                  <div class="message-time">{{ message.time }}</div>
            </div>
          </div>

          <!-- AI正在输入指示器 -->
          <div v-if="isTyping" class="typing-indicator">
              <div class="message-avatar">
                  <el-icon><Avatar /></el-icon>
              </div>
              <div class="message-content">
                <div class="typing-dots">
                  <span class="dot"></span>
                  <span class="dot"></span>
                  <span class="dot"></span>
                </div>
              </div>
            </div>
          </div>

              <div class="chat-input-area">
                <div class="input-header">
                  <div class="input-label">和机器人聊天</div>
                  <div class="quick-inline">
                    <el-tooltip
                      v-for="(q, i) in previewQuickQuestions"
                      :key="i"
                      :content="q"
                      placement="top"
                      effect="light"
                    >
                      <el-button class="quick-inline-btn" circle @click="sendQuickQuestion(q)">
                        <el-icon><Lightning /></el-icon>
                      </el-button>
                    </el-tooltip>
                  </div>
                </div>
                <div class="input-container">
          <el-input
            v-model="inputMessage"
                    placeholder="输入消息..."
                    @keydown.enter="sendMessage"
            :disabled="isTyping"
            class="message-input"
                  >
                    <template #append>
                      <el-button type="primary" @click="sendMessage" :disabled="!inputMessage.trim() || isTyping">
                        <el-icon><Promotion /></el-icon>
              </el-button>
                    </template>
                  </el-input>
                </div>
                <div class="input-footer">
                  <div class="status-indicator">
                    <el-icon class="status-icon"><SuccessFilled /></el-icon>
                    <span>功能已开启</span>
                  </div>
                  <div class="manage-link">管理 -></div>
                </div>
              </div>
            </div>
          </div>

          <!-- API访问区域 -->
          <div class="api-content" v-else-if="activeTab === 'api'">
            <div class="api-info">
              <h4>API访问信息</h4>
              <p>API地址: {{ settings.apiUrl }}</p>
              <p>会话ID: {{ sessionId }}</p>
              <el-button type="primary" @click="testConnection" :loading="testingConnection">
                测试连接
              </el-button>
            </div>
          </div>

          <!-- 日志区域 -->
          <div class="logs-content" v-else-if="activeTab === 'logs'">
            <div class="logs-info">
              <h4>对话日志</h4>
              <div class="log-list">
                <div v-for="(message, index) in messages" :key="index" class="log-item">
                  <span class="log-time">{{ message.time }}</span>
                  <span class="log-type">{{ message.type === 'user' ? '用户' : 'AI' }}</span>
                  <span class="log-content">{{ message.content.substring(0, 50) }}...</span>
        </div>
              </div>
            </div>
          </div>

          <!-- 监测区域 -->
          <div class="monitoring-content" v-else-if="activeTab === 'monitoring'">
            <div class="monitoring-info">
              <h4>系统监测</h4>
              <div class="status-cards">
                <div class="status-card">
                  <div class="status-title">连接状态</div>
                  <div class="status-value" :class="{ 'online': isOnline }">
                    {{ isOnline ? '在线' : '离线' }}
                  </div>
                </div>
                <div class="status-card">
                  <div class="status-title">消息数量</div>
                  <div class="status-value">{{ messages.length }}</div>
                </div>
                <div class="status-card">
                  <div class="status-title">当前模型</div>
                  <div class="status-value">{{ selectedModel }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      <!-- 设置对话框 -->
      <el-dialog v-model="showSettings" title="AI助手设置" width="600px" draggable>
        <el-form :model="settings" label-width="120px">
          <el-form-item label="API地址">
            <el-input
              v-model="settings.apiUrl"
              placeholder="输入AI服务器地址"
              style="width: 100%"
            />
            <div class="setting-desc">默认: http://58.199.161.154:8001/chat</div>
          </el-form-item>

          <el-form-item label="会话ID">
            <div style="display: flex; gap: 8px;">
              <el-input
                v-model="sessionId"
                placeholder="输入会话ID（为空时自动生成）"
                style="flex: 1;"
              />
              <el-button type="primary" size="small" @click="refreshSessionId">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
            <div class="setting-desc">当前会话ID: {{ sessionId }}</div>
          </el-form-item>

          <el-form-item label="请求超时">
            <el-input-number
              v-model="settings.timeout"
              :min="5000"
              :max="60000"
              :step="1000"
              style="width: 100%"
            />
            <div class="setting-desc">毫秒，建议5000-30000</div>
          </el-form-item>

          <el-form-item label="请求格式">
            <el-select v-model="settings.requestFormat" style="width: 100%">
              <el-option label="POST + 查询参数" value="post-query" />
            </el-select>
            <div class="setting-desc">使用POST请求带查询参数</div>
          </el-form-item>

          <el-form-item label="重试次数">
            <el-input-number
              v-model="settings.retryCount"
              :min="1"
              :max="5"
              style="width: 100%"
            />
            <div class="setting-desc">网络失败时的重试次数</div>
          </el-form-item>

          <el-divider>回复设置</el-divider>

          <el-form-item label="回复风格">
            <el-select v-model="settings.responseStyle" style="width: 100%">
              <el-option label="专业详细" value="professional" />
              <el-option label="简洁明了" value="concise" />
              <el-option label="通俗易懂" value="simple" />
            </el-select>
          </el-form-item>

          <el-form-item label="专业领域">
            <el-checkbox-group v-model="settings.domains">
              <el-checkbox label="相图计算">相图计算</el-checkbox>
              <el-checkbox label="热力学性质">热力学性质</el-checkbox>
              <el-checkbox label="材料科学">材料科学</el-checkbox>
              <el-checkbox label="计算方法">计算方法</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="调试模式">
            <el-switch v-model="settings.debugMode" />
            <span class="setting-desc">显示详细的请求和响应信息</span>
          </el-form-item>

          <el-form-item label="自动保存">
            <el-switch v-model="settings.autoSave" />
            <span class="setting-desc">自动保存对话历史</span>
          </el-form-item>

          <el-divider>连接测试</el-divider>

          <el-form-item>
            <el-button type="primary" @click="testConnection" :loading="testingConnection">
              <el-icon><Link /></el-icon>
              测试连接
            </el-button>
            <span v-if="connectionStatus" :class="['connection-status', connectionStatus.type]">
              {{ connectionStatus.message }}
            </span>
          </el-form-item>
        </el-form>

        <template #footer>
          <div class="dialog-footer">
            <el-button @click="showSettings = false">取消</el-button>
            <el-button type="primary" @click="saveSettings">保存设置</el-button>
          </div>
        </template>
      </el-dialog>
  </div>
</template>

<script>
import {
  Avatar, User, Delete, Setting, Lightning, ChatRound,
  Plus, Warning, Promotion, DocumentCopy, DataAnalysis,
  Star, SuccessFilled, Link, Refresh, Edit, Document,
  Monitor, ArrowDown, InfoFilled, Close, Check, Search,
  ScaleToOriginal
} from '@element-plus/icons-vue';
import { ref, nextTick, onMounted, watch, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

export default {
  name: 'AIChatAssistant',
  components: {
    Avatar, User, Delete, Setting, Lightning, ChatRound,
    Plus, Warning, Promotion, DocumentCopy, DataAnalysis,
    Star, SuccessFilled, Link, Refresh, Edit, Document,
    Monitor, ArrowDown, InfoFilled, Close, Check, Search,
    ScaleToOriginal
  },
  setup() {
    // 响应式数据
    const messages = ref([]);
    const inputMessage = ref('');
    const isTyping = ref(false);
    const isOnline = ref(true);
    const showSettings = ref(false);
    const messagesContainer = ref(null);
    // 右侧面板可调宽度
    const rightPanelWidth = ref(Number(localStorage.getItem('ai-right-panel-width')) || 360);
    const isResizingRight = ref(false);
    const startX = ref(0);
    const startWidth = ref(0);
    const testingConnection = ref(false);
    const connectionStatus = ref(null);
    const sessionId = ref(''); // 添加session_id管理

    // 新增的Dify风格界面数据
    const activeTab = ref('arrangement');
    const selectedModel = ref('qwen');
    const promptText = ref('你是一个专业的热力学计算助手，可以帮助用户解决相图计算、热力学分析等相关问题。请根据用户的问题提供准确、专业的回答。');
    const isPromptSaved = ref(true);
    const variables = ref([]);
    const knowledgeBases = ref([]);
    const tools = ref([]);

    // 变量表单相关数据
    const showVariableForm = ref(false);
    const variableForm = ref({
      name: '',
      type: 'temperature',
      description: '',
      unit: '',
      defaultValue: '',
      required: false
    });

    // 热力学变量类型选项
    const variableTypes = ref([
      { value: 'temperature', label: '温度', unit: 'K', description: '系统温度' },
      { value: 'pressure', label: '压强', unit: 'Pa', description: '系统压强' },
      { value: 'mole_fraction', label: '摩尔分数', unit: '-', description: '组分的摩尔分数' },
      { value: 'mass_fraction', label: '质量分数', unit: '-', description: '组分的质量分数' },
      { value: 'composition', label: '成分', unit: 'wt%', description: '元素成分含量' },
      { value: 'phase', label: '相', unit: '-', description: '相的名称或类型' },
      { value: 'enthalpy', label: '焓', unit: 'J/mol', description: '摩尔焓' },
      { value: 'entropy', label: '熵', unit: 'J/(mol·K)', description: '摩尔熵' },
      { value: 'gibbs_energy', label: '吉布斯自由能', unit: 'J/mol', description: '摩尔吉布斯自由能' },
      { value: 'activity', label: '活度', unit: '-', description: '组分的活度' },
      { value: 'fugacity', label: '逸度', unit: 'Pa', description: '组分的逸度' },
      { value: 'equilibrium_constant', label: '平衡常数', unit: '-', description: '反应平衡常数' }
    ]);

    // 知识库内容
    const knowledgeBaseContent = ref([
      {
        id: 1,
        title: '热力学数据库选择指南',
        content: '选择合适的热力学数据库是计算成功的关键。TCFE12适用于铁基合金，TCAL6适用于铝基系统，TCNI12适用于镍基高温合金，TCTI2适用于钛基航空航天材料。',
        category: '数据库',
        tags: ['数据库', '选择', '合金']
      },
      {
        id: 2,
        title: '相图计算收敛技巧',
        content: '相图计算收敛问题常见解决方案：1)调整初始猜测值，使用更合理的初始相组成；2)减小步长，降低温度或组分步长；3)提高精度要求，增加迭代次数；4)检查数据库，确认包含所需相；5)简化系统，先计算二元再扩展多元。',
        category: '计算技巧',
        tags: ['收敛', '相图', '计算']
      },
      {
        id: 3,
        title: 'Fe-C相图计算参数设置',
        content: 'Fe-C相图计算推荐参数：温度范围500-1800K，C含量范围0-6.67wt%，使用TCFE12数据库，计算精度等级5，步长建议温度10K，成分0.1wt%。',
        category: '参数设置',
        tags: ['Fe-C', '相图', '参数']
      },
      {
        id: 4,
        title: '热力学性质计算优化',
        content: '提高热力学性质计算效率的方法：1)合理选择计算网格密度；2)使用并行计算；3)优化数据库查询；4)采用自适应步长；5)预计算常用相图点。',
        category: '性能优化',
        tags: ['性能', '优化', '计算']
      },
      {
        id: 5,
        title: '多元合金相平衡计算',
        content: '多元合金相平衡计算要点：1)确定主要合金元素；2)选择合适的准二元截面；3)考虑元素间的相互作用；4)使用合适的相场模型；5)验证计算结果。',
        category: '多元合金',
        tags: ['多元合金', '相平衡', '计算']
      },
      {
        id: 6,
        title: 'CALPHAD方法基础',
        content: 'CALPHAD（CALculation of PHAse Diagrams）方法是一种基于热力学数据库的相图计算方法。它通过最小化系统的吉布斯自由能来确定平衡相组成，广泛应用于材料设计和工艺优化。',
        category: '计算技巧',
        tags: ['CALPHAD', '相图', '热力学']
      },
      {
        id: 7,
        title: '相变温度计算',
        content: '相变温度计算的关键参数：1)相变焓和熵；2)相变体积变化；3)压力影响；4)成分影响。常用的计算方法包括Clausius-Clapeyron方程和相场模型。',
        category: '参数设置',
        tags: ['相变', '温度', '计算']
      },
      {
        id: 8,
        title: '热力学数据验证',
        content: '热力学数据验证方法：1)与实验数据对比；2)检查热力学一致性；3)验证相图边界；4)测试极端条件；5)交叉验证不同数据库。',
        category: '数据库',
        tags: ['验证', '数据', '质量']
      }
    ]);

    // 知识库搜索和筛选
    const knowledgeSearch = ref('');
    const selectedCategory = ref('');
    const selectedKnowledgeItem = ref(null);

    // 右侧面板拖拽调整宽度
    const startRightResize = (e) => {
      isResizingRight.value = true;
      startX.value = e.clientX;
      startWidth.value = rightPanelWidth.value;
      document.body.classList.add('resizing-col');
    };

    const onMouseMove = (e) => {
      if (!isResizingRight.value) return;
      const dx = startX.value - e.clientX; // 左拉为正，右推为负
      let newWidth = startWidth.value + dx;
      const minW = 280;
      const maxW = 800;
      if (newWidth < minW) newWidth = minW;
      if (newWidth > maxW) newWidth = maxW;
      rightPanelWidth.value = newWidth;
    };

    const onMouseUp = () => {
      if (!isResizingRight.value) return;
      isResizingRight.value = false;
      localStorage.setItem('ai-right-panel-width', String(rightPanelWidth.value));
      document.body.classList.remove('resizing-col');
    };

    // AI助手设置
    const settings = ref({
      responseStyle: 'professional',
      domains: ['相图计算', '热力学性质'],
      autoSave: true,
      apiUrl: 'http://58.199.161.154:8001/chat2',
      timeout: 300000000,
      retryCount: 3,
      debugMode: false,
      requestFormat: 'post-json'  // 使用POST JSON请求体
    });

    // 快捷问题
    const quickQuestions = ref([
      '如何选择合适的热力学数据库？',
      'Fe-C相图计算的基本步骤',
      '相平衡计算出现收敛问题怎么办？',
      '如何优化计算精度和速度？'
    ]);

    // 预览侧边栏快捷问题
    const previewQuickQuestions = ref([
      '请帮我使用工具生成一个 Fe-C 二元相图。',
      '请计算高熵合金Ni、Co、Cr体系（ Cr1-2xCoxNix ）的垂直截面相图',
      '请计算高熵合金Al、Ni、Co、Cr、Fe体系下的等温截面相图。'
    ]);

    // 监听session_id变化，保存到localStorage
    watch(sessionId, (newSessionId) => {
      if (newSessionId) {
        localStorage.setItem('ai-chat-session-id', newSessionId);
      }
    });

    // 初始化session_id
    const initSessionId = () => {
      // 从localStorage获取或生成新的session_id
      let storedSessionId = localStorage.getItem('ai-chat-session-id');
      if (!storedSessionId) {
        storedSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('ai-chat-session-id', storedSessionId);
      }
      // 仅在sessionId为空时赋值，避免覆盖用户手动输入
      if (!sessionId.value) {
        sessionId.value = storedSessionId;
      }
      console.log('Session ID initialized:', sessionId.value);

      // 如果启用了调试模式，打印更多信息
      if (settings.value.debugMode) {
        console.log('Session ID initialized from storage:', storedSessionId);
      }
    };

    // 刷新会话ID
    const refreshSessionId = () => {
      const newSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionId.value = newSessionId;
      localStorage.setItem('ai-chat-session-id', newSessionId);
      ElMessage.success('已生成新会话ID');
    };

    // 新增的Dify风格界面方法
    const updatePrompt = () => {
      // 标记未保存
      isPromptSaved.value = false;
      console.log('Prompt updated:', promptText.value);
    };

    const savePrompt = () => {
      try {
        localStorage.setItem('ai-chat-promptText', promptText.value || '');
        // 同步到设置的持久化
        const toSave = { ...settings.value, promptText: promptText.value };
        localStorage.setItem('ai-chat-settings', JSON.stringify(toSave));
        isPromptSaved.value = true;
        ElMessage.success('提示词已保存');
      } catch (e) {
        ElMessage.error('保存失败，请稍后重试');
      }
    };

    const addVariable = () => {
      showVariableForm.value = true;
    };

    const saveVariable = () => {
      if (!variableForm.value.name.trim()) {
        ElMessage.error('请输入变量名称');
        return;
      }

      const selectedType = variableTypes.value.find(type => type.value === variableForm.value.type);
      const newVar = {
        id: Date.now(),
        name: variableForm.value.name,
        type: variableForm.value.type,
        typeLabel: selectedType.label,
        description: variableForm.value.description || selectedType.description,
        unit: variableForm.value.unit || selectedType.unit,
        defaultValue: variableForm.value.defaultValue,
        required: variableForm.value.required
      };

      variables.value.push(newVar);
      ElMessage.success('变量已添加');
      resetVariableForm();
      showVariableForm.value = false;
    };

    const resetVariableForm = () => {
      variableForm.value = {
        name: '',
        type: 'temperature',
        description: '',
        unit: '',
        defaultValue: '',
        required: false
      };
    };

    const cancelVariableForm = () => {
      resetVariableForm();
      showVariableForm.value = false;
    };

    const deleteVariable = (index) => {
      variables.value.splice(index, 1);
      ElMessage.success('变量已删除');
    };

    const updateVariableType = () => {
      const selectedType = variableTypes.value.find(type => type.value === variableForm.value.type);
      if (selectedType) {
        variableForm.value.unit = selectedType.unit;
        if (!variableForm.value.description) {
          variableForm.value.description = selectedType.description;
        }
      }
    };

    const addKnowledge = () => {
      ElMessage.info('知识库功能开发中...');
    };

    const getCategoryType = (category) => {
      const typeMap = {
        '数据库': 'primary',
        '计算技巧': 'success',
        '参数设置': 'warning',
        '性能优化': 'info',
        '多元合金': 'danger'
      };
      return typeMap[category] || 'info';
    };

    // 知识库筛选
    const filteredKnowledge = computed(() => {
      let filtered = knowledgeBaseContent.value;

      // 按分类筛选
      if (selectedCategory.value) {
        filtered = filtered.filter(item => item.category === selectedCategory.value);
      }

      // 按搜索关键词筛选
      if (knowledgeSearch.value) {
        const searchTerm = knowledgeSearch.value.toLowerCase();
        filtered = filtered.filter(item =>
          item.title.toLowerCase().includes(searchTerm) ||
          item.content.toLowerCase().includes(searchTerm) ||
          item.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }

      return filtered;
    });

    // 选择知识库条目
    const selectKnowledge = (item) => {
      selectedKnowledgeItem.value = item;
      ElMessage.success(`已选择：${item.title}`);
    };

    const addTool = () => {
      ElMessage.info('工具功能开发中...');
    };

    const refreshSession = () => {
      refreshSessionId();
      clearChat();
    };

    // 发送消息
    const sendMessage = async () => {
      // 发送前检查提示词是否未保存
      if (!isPromptSaved.value) {
        try {
          await ElMessageBox.confirm('提示词尚未保存，是否现在保存？', '提示', {
            confirmButtonText: '保存',
            cancelButtonText: '不保存',
            type: 'warning'
          });
          savePrompt();
        } catch (_) {
          // 用户选择不保存，继续发送
        }
      }
      if (!inputMessage.value.trim() || isTyping.value) return;

      const userMessage = {
        id: Date.now() + Math.random(),
        type: 'user',
        content: inputMessage.value.trim(),
        time: getCurrentTime()
      };

      console.log('Adding user message:', userMessage);
      messages.value.push(userMessage);
      console.log('Messages after adding user message:', messages.value);
      const question = inputMessage.value.trim();
      inputMessage.value = '';

      await scrollToBottom();
      await simulateAIResponse(question);
    };

    // AI响应
    const simulateAIResponse = async (question) => {
      isTyping.value = true;
      await scrollToBottom();

      let retryCount = 0;
      const maxRetries = settings.value.retryCount;
      let timeoutId;

      while (retryCount < maxRetries) {
        try {
          let requestConfig = buildRequestConfig(question);
          const controller = new AbortController();
          timeoutId = setTimeout(() => {
            controller.abort('请求超时，自动终止');
          }, settings.value.timeout || 3000000);

          if (settings.value.debugMode) {
            console.log('Making request:', requestConfig);
          }

          const response = await fetch(requestConfig.url, {
            ...requestConfig.options,
            signal: controller.signal,
            mode: 'cors',
            credentials: 'omit'
          });

          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }

          if (settings.value.debugMode) {
            console.log('Response status:', response.status);
            console.log('Response headers:', [...response.headers.entries()]);
          }

          // 特别处理422错误
          if (response.status === 422) {
            const errorText = await response.text();
            if (settings.value.debugMode) {
              console.log('422 Error response body:', errorText);
            }
            throw new Error(`HTTP 422: 请求无法处理 - ${errorText.substring(0, 200)}`);
          }

          if (!response.ok) {
            const errorText = await response.text();
            if (settings.value.debugMode) {
              console.log('Error response body:', errorText);
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText.substring(0, 200)}`);
          }

          const textResponse = await response.text();
          if (settings.value.debugMode) {
            console.log('Response body:', textResponse);
          }

          let data;
          try {
            data = JSON.parse(textResponse);
          } catch (parseError) {
            data = { response: textResponse };
          }

          let aiResponse = {
            id: Date.now() + Math.random(),
            type: 'ai',
            content: extractResponseContent(data),
            contentType: 'text',
            time: getCurrentTime(),
            liked: false
          };

          // 检查是否有图片数据
          const imageData = extractImageData(data);
          if (imageData) {
            aiResponse.imageData = imageData;
          }

          if (data.data && typeof data.data === 'object') {
            aiResponse.contentType = 'result';
            aiResponse.data = data.data;
          }

          console.log('Adding AI response:', aiResponse);
          messages.value.push(aiResponse);
          console.log('Messages after adding AI response:', messages.value);
          isOnline.value = true;
          ElMessage.success('AI响应成功');
          break;

        } catch (error) {
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }

          retryCount++;
          console.error(`API调用失败 (第${retryCount}次尝试):`, error);
          isOnline.value = false;

          if (retryCount >= maxRetries) {
            let fallbackResponse = generateFallbackResponse(question, error);

            const fallbackMessage = {
              id: Date.now() + Math.random(),
              type: 'ai',
              content: fallbackResponse.content,
              contentType: fallbackResponse.type,
              data: fallbackResponse.data,
              language: fallbackResponse.language,
              time: getCurrentTime(),
              liked: false
            };
            console.log('Adding fallback response:', fallbackMessage);
            messages.value.push(fallbackMessage);
            console.log('Messages after adding fallback response:', messages.value);

            if (error.name === 'AbortError') {
              ElMessage.error('请求超时，请检查网络连接或增加超时时间');
            } else if (error.message.includes('CORS')) {
              ElMessage.error('跨域请求被阻止，请检查服务器CORS设置');
            } else if (error.message.includes('Failed to fetch')) {
              ElMessage.error('无法连接到服务器，请检查网络或服务器状态');
            } else {
              ElMessage.error(`请求失败: ${error.message}`);
            }
          } else {
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
      }

      isTyping.value = false;
      await scrollToBottom();
    };

    // 构建请求配置 - 使用POST JSON请求体
    const buildRequestConfig = (question) => {
      const baseUrl = settings.value.apiUrl;
      const sessionIdValue = sessionId.value;
      const combinedQuery = `${promptText.value}|^^sep^^|${question}`;

      const body = {
        query: combinedQuery,
        session_id: sessionIdValue
      };

      if (settings.value.debugMode) {
        console.log('Sending POST JSON to:', baseUrl);
        console.log('Request body:', body);
      }

      return {
        url: baseUrl,
        options: {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        }
      };
    };

    // 提取响应内容 - 更新以适配新的响应格式
    const extractResponseContent = (data) => {
      // 新的响应格式在data.response.output中
      if (data && data.log && data.log.output) {
        return data.log.output;
      }

      // 常见的直接文本字段
      if (data && data.response) {
        return data.response;
      }

      // 兼容旧的响应格式
      return data.log || data.answer || data.message ||
             data.content || data.reply || data.text || data.response ||
             (typeof data === 'string' ? data : '抱歉，无法理解您的问题');
    };

    // 提取图片数据
    const extractImageData = (data) => {
      if (data && data.images && Array.isArray(data.images) && data.images.length > 0) {
        // 遍历images数组中的每个对象
        for (const imageObj of data.images) {
          // 获取对象中的第一个base64编码图片
          const keys = Object.keys(imageObj);
          if (keys.length > 0) {
            const base64Data = imageObj[keys[0]];
            if (base64Data) {
              // 检查是否已经是完整的data URL格式
              if (base64Data.startsWith('data:image')) {
                return base64Data;
              }
              // 根据文件扩展名或默认设置图片类型
              const key = keys[0];
              if (key.endsWith('.png') || key.includes('png')) {
                return `data:image/png;base64,${base64Data}`;
              } else if (key.endsWith('.jpg') || key.endsWith('.jpeg') || key.includes('jpg') || key.includes('jpeg')) {
                return `data:image/jpeg;base64,${base64Data}`;
              } else if (key.endsWith('.gif') || key.includes('gif')) {
                return `data:image/gif;base64,${base64Data}`;
              } else if (key.endsWith('.svg') || key.includes('svg')) {
                return `data:image/svg+xml;base64,${base64Data}`;
              }
              // 默认使用PNG格式
              return `data:image/png;base64,${base64Data}`;
            }
          }
        }
      }
      return null;
    };

    // 生成AI回复内容
    const generateAIResponse = (question) => {
      const lowerQ = question.toLowerCase();

      if (lowerQ.includes('数据库') || lowerQ.includes('database')) {
        return {
          type: 'result',
          content: '关于热力学数据库选择的建议',
          data: {
            '铁基合金': 'TCFE12 - 最新的铁基合金数据库',
            '铝基合金': 'TCAL6 - 适用于铝基系统',
            '镍基合金': 'TCNI12 - 高温合金专用',
            '钛基合金': 'TCTI2 - 航空航天材料',
            '选择原则': '根据主要合金元素和应用温度范围选择'
          }
        };
      }

      if (lowerQ.includes('fe-c') || lowerQ.includes('相图')) {
        return {
          type: 'code',
          content: `// Fe-C相图计算基本参数设置
const phaseDiagramParams = {
  system: "Fe-C",
  database: "TCFE12",
  tempRange: {
    min: 500,  // 最低温度 (K)
    max: 1800  // 最高温度 (K)
  },
  compRange: {
    min: 0,    // 最低C含量 (wt%)
    max: 6.67  // 最高C含量 (wt%)
  },
  precision: 5  // 计算精度等级
};`,
          language: 'javascript'
        };
      }

      if (lowerQ.includes('收敛') || lowerQ.includes('convergence')) {
        return {
          type: 'text',
          content: '相平衡计算收敛问题的解决方案：\n\n1. 调整初始猜测值 - 使用更合理的初始相组成\n2. 减小步长 - 降低温度或组分步长\n3. 提高精度要求 - 增加迭代次数限制\n4. 检查数据库 - 确认所选数据库包含所需相\n5. 简化系统 - 先计算二元系统再扩展到多元'
        };
      }

      // 默认回复
      return {
        type: 'text',
        content: `感谢您的提问！针对"${question}"，我建议：\n1. 确认计算参数设置是否合理\n2. 检查所选数据库是否适用\n3. 查看计算日志获取详细信息`
      };
    };

    // 降级响应生成器
    const generateFallbackResponse = (question, error) => {
      let isNetworkError = false;
      if (error && typeof error === 'object' && error.message) {
        isNetworkError = error.message.includes('fetch') || error.message.includes('network') || error.message.includes('CORS');
      }

      if (isNetworkError) {
        return {
          type: 'text',
          content: `网络连接错误，无法连接到AI服务器。\n错误信息：${error.message}\n请检查网络连接和服务器地址。`
        };
      }

      return generateAIResponse(question);
    };

    // 发送快捷问题
    const sendQuickQuestion = (question) => {
      inputMessage.value = question;
      sendMessage();
    };

    // 处理回车键
    const handleEnterKey = (event) => {
      if (event.ctrlKey) {
        sendMessage();
      }
    };

    // 插入模板
    const insertTemplate = (type) => {
      let template = '';
      if (type === 'calculation') {
        template = '我在使用[软件名称]计算[合金系统]时遇到问题：\n参数设置：\n- 温度范围：\n- 组分范围：\n- 数据库：\n具体问题：';
      } else if (type === 'error') {
        template = '计算过程中出现错误：\n错误信息：\n使用软件：\n计算参数：\n请帮助分析原因和解决方案。';
      }

      inputMessage.value = inputMessage.value.trim()
        ? inputMessage.value + '\n\n' + template
        : template;
    };

    // 滚动到底部
    const scrollToBottom = async () => {
      try {
        // 等待DOM更新
        await nextTick();

        if (messagesContainer.value) {
          // 强制滚动到底部
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;

          // 使用多种方法确保滚动生效
          console.log('Attempting to scroll to bottom');
          console.log('scrollHeight:', messagesContainer.value.scrollHeight);
          console.log('clientHeight:', messagesContainer.value.clientHeight);
          console.log('scrollTop before:', messagesContainer.value.scrollTop);

          // 多次尝试确保滚动到底部
          const forceScroll = () => {
            if (messagesContainer.value) {
              const targetScrollTop = messagesContainer.value.scrollHeight - messagesContainer.value.clientHeight;
              messagesContainer.value.scrollTop = Math.max(0, targetScrollTop);
              console.log('scrollTop after force:', messagesContainer.value.scrollTop);
            }
          };

          // 立即执行
          forceScroll();

          // 延迟执行确保生效
          setTimeout(forceScroll, 50);
          setTimeout(forceScroll, 100);
          setTimeout(() => {
            if (messagesContainer.value) {
              messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
              console.log('Final scroll position:', messagesContainer.value.scrollTop);
            }
          }, 150);
        } else {
          console.log('messagesContainer is not available');
        }
      } catch (error) {
        console.error('Error scrolling to bottom:', error);
      }
    };

    // 获取当前时间
    const getCurrentTime = () => {
      const now = new Date();
      return now.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // 清空聊天
    const clearChat = () => {
      console.log('Clearing chat, current messages:', messages.value);
      messages.value = [];
      console.log('Messages after clearing:', messages.value);
      ElMessage.success('聊天记录已清空');

      // 生成新的session_id以开始新的对话
      const newSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionId.value = newSessionId;
      localStorage.setItem('ai-chat-session-id', newSessionId);
      console.log('New session ID generated:', sessionId.value);

      // 如果启用了调试模式，打印更多信息
      if (settings.value.debugMode) {
        console.log('New session ID generated for new conversation:', newSessionId);
      }
    };

    // 点赞消息
    const likeMessage = (index) => {
      messages.value[index].liked = !messages.value[index].liked;
      ElMessage.success(messages.value[index].liked ? '已点赞' : '取消点赞');
    };

    // 复制消息
    const copyMessage = (content) => {
      navigator.clipboard.writeText(content).then(() => {
        ElMessage.success('已复制到剪贴板');
      }).catch(() => {
        ElMessage.error('复制失败');
      });
    };

    // 下载图片
    const downloadImage = (imageData, filename) => {
      try {
        const link = document.createElement('a');
        link.href = imageData;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        ElMessage.success('图片下载成功');
      } catch (error) {
        ElMessage.error('图片下载失败');
      }
    };

    // 复制图片到剪贴板
    const copyImage = async (imageData) => {
      try {
        // 将base64转换为Blob
        const response = await fetch(imageData);
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

    // 复制代码
    const copyCode = (code) => {
      navigator.clipboard.writeText(code).then(() => {
        ElMessage.success('代码已复制到剪贴板');
      }).catch(() => {
        ElMessage.error('复制失败');
      });
    };

    // 切换设置
    const toggleSettings = () => {
      showSettings.value = !showSettings.value;
    };

    // 测试连接 - 同步修改为URL查询参数
    const testConnection = async (showMessage = true) => {
      testingConnection.value = true;
      connectionStatus.value = null;

      try {
        const fullTestUrl = `http://58.199.161.154:8001/health/`;

        // 打印调试信息
        if (settings.value.debugMode) {
          console.log('Testing POST connection to:', fullTestUrl);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(fullTestUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal,
          mode: 'cors',
          credentials: 'omit'
        });

        clearTimeout(timeoutId);

        if (settings.value.debugMode) {
          console.log('Test response status:', response.status);
          console.log('Test response headers:', [...response.headers.entries()]);
        }
        // console.log('yh-Test response status:', response.status);
        if (response.status === 200) {

          isOnline.value = true;
          if (showMessage) {
            ElMessage.success('智能体连接成功');
          }
        } else {
          // 获取错误响应体
          const errorText = await response.text();
          if (settings.value.debugMode) {
            console.log('Error response body:', errorText);
          }

          connectionStatus.value = {
            type: 'error',
            message: `HTTP错误: ${response.status} ${response.statusText} - ${errorText.substring(0, 100)}`
          };
          isOnline.value = false;
        }
      } catch (error) {
        let errorMessage = '连接失败';

        if (error.name === 'AbortError') {
          errorMessage = '连接超时（超过10秒）';
        } else if (error.message.includes('CORS')) {
          errorMessage = '跨域请求被阻止，需要服务器支持CORS';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = '无法连接到服务器，请检查网络和服务器状态';
        }

        connectionStatus.value = {
          type: 'error',
          message: `${errorMessage}: ${error.message}`
        };
        isOnline.value = false;
      }

      testingConnection.value = false;
    };
    // 保存设置
    const saveSettings = () => {
      // 将提示词一并持久化到设置中
      const toSave = { ...settings.value, promptText: promptText.value };
      localStorage.setItem('ai-chat-settings', JSON.stringify(toSave));
      showSettings.value = false;
      connectionStatus.value = null;
      ElMessage.success('设置已保存');
    };

    // 加载设置
    const loadSettings = () => {
      const saved = localStorage.getItem('ai-chat-settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        settings.value = { ...settings.value, ...parsed };
        if (parsed.promptText) {
          promptText.value = parsed.promptText;
          isPromptSaved.value = true;
        }
      }
      // 单独的提示词存档优先生效
      const savedPrompt = localStorage.getItem('ai-chat-promptText');
      if (savedPrompt !== null) {
        promptText.value = savedPrompt;
        isPromptSaved.value = true;
      }
    };

    watch(activeTab, (newTab, oldTab) => {
      // 当新的标签页是 'monitoring' 时，执行连接测试
      if (newTab === 'monitoring') {
        console.log('切换到监测页，开始测试连接...');
        // 同样，我们推荐在自动检测时静默执行，避免打扰用户
        testConnection(false); 
      }
    });

    onMounted(() => {
      loadSettings();
      initSessionId(); // 初始化session_id
      testConnection(false); // 初始测试连接
      // 如果启用了调试模式，打印设置信息
      if (settings.value.debugMode) {
        console.log('Loaded settings:', settings.value);
        console.log('Initialized session ID:', sessionId.value);
      }

      // 添加欢迎消息
      setTimeout(() => {
        const welcomeMessage = {
          id: Date.now() + Math.random(),
          type: 'ai',
          content: '您好！我是热力学计算助手，可以帮助您解决相图计算、热力学分析等相关问题。请随时向我提问！',
          time: getCurrentTime(),
          liked: false
        };
        console.log('Adding welcome message:', welcomeMessage);
        messages.value.push(welcomeMessage);
        console.log('Messages after adding welcome message:', messages.value);
      }, 800);
      // 注册全局拖拽监听
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });

    return {
      messages,
      inputMessage,
      isTyping,
      isOnline,
      showSettings,
      messagesContainer,
      settings,
      quickQuestions,
      testingConnection,
      connectionStatus,
      sessionId,
      // 新增的Dify风格界面数据
      activeTab,
      selectedModel,
      promptText,
      variables,
      knowledgeBases,
      tools,
      // 变量表单相关数据
      showVariableForm,
      variableForm,
      variableTypes,
      knowledgeBaseContent,
      previewQuickQuestions,
      // 知识库相关数据
      knowledgeSearch,
      selectedCategory,
      selectedKnowledgeItem,
      filteredKnowledge,
      sendMessage,
      sendQuickQuestion,
      handleEnterKey,
      insertTemplate,
      clearChat,
      likeMessage,
      copyMessage,
      copyCode,
      toggleSettings,
      saveSettings,
      testConnection,
      buildRequestConfig,
      generateFallbackResponse,
      refreshSessionId,
      downloadImage,
      copyImage,
      // 新增的Dify风格界面方法
      updatePrompt,
      addVariable,
      addKnowledge,
      addTool,
      refreshSession,
      // 提示词相关
      isPromptSaved,
      savePrompt,
      // 变量表单方法
      saveVariable,
      cancelVariableForm,
      deleteVariable,
      updateVariableType,
      // 知识库方法
      getCategoryType,
      selectKnowledge,
      // 右侧面板拖拽
      rightPanelWidth,
      startRightResize
    };
  }
};
</script>

<style scoped>
.dify-ai-assistant {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 顶部导航栏 */
.top-header {
  height: 60px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  font-size: 24px;
  color: #3b82f6;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.upgrade-btn {
  background: #3b82f6;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 500;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-tabs {
  display: flex;
  gap: 32px;
}

.nav-item {
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s;
}

.nav-item:hover {
  color: #374151;
  background: #f9fafb;
}

.nav-item.active {
  color: #3b82f6;
  background: #eff6ff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-btn {
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.user-info:hover {
  background: #f9fafb;
}

.user-avatar {
  width: 24px;
  height: 24px;
  color: #6b7280;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.dropdown-icon {
  font-size: 12px;
  color: #9ca3af;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

/* 左侧导航栏 */
.left-sidebar {
  width: 240px;
  background: #f9fafb;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 12px;
}

.robot-icon {
  width: 32px;
  height: 32px;
  color: #3b82f6;
}

.agent-info {
  flex: 1;
}

.agent-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2px;
}

.agent-type {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.sidebar-nav {
  flex: 1;
  padding: 10px 0;
}

.sidebar-nav .nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  margin: 0 8px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s;
}

.sidebar-nav .nav-item:hover {
  color: #374151;
  background: #f3f4f6;
}

.sidebar-nav .nav-item.active {
  color: #3b82f6;
  background: #eff6ff;
}

.sidebar-nav .nav-item .el-icon {
  font-size: 16px;
}

/* 中央编排区域 */
.center-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.panel-header {
  height: 60px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.panel-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.model-selector {
  min-width: 200px;
}

.model-select {
  width: 100%;
}

.publish-btn {
  background: #10b981;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
}

.refresh-btn {
  color: #6b7280;
  padding: 8px;
}

.panel-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

/* 提示词编辑区域 */
.prompt-section {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 24px;
  overflow: hidden;
}

.section-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f9fafb;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
}

.prompt-header {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
}

.prompt-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.prompt-icon {
  font-size: 18px;
  color: #3b82f6;
}

.unsaved-tag {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.save-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
  transition: all 0.2s;
}

.save-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
}

.prompt-editor {
  position: relative;
  background: #ffffff;
}

.prompt-textarea {
  border: none;
  border-radius: 0;
  padding: 20px 24px;
  font-size: 14px;
  line-height: 1.8;
  resize: vertical;
  min-height: 300px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.prompt-textarea:deep(.el-textarea__inner) {
  border: none;
  border-radius: 0;
  padding: 20px 24px;
  font-size: 14px;
  line-height: 1.8;
  min-height: 300px;
  background: #ffffff;
  color: #1f2937;
  resize: vertical;
}

.prompt-textarea:deep(.el-textarea__inner):focus {
  outline: none;
  box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.editor-footer {
  padding: 14px 24px;
  border-top: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f9fafb 0%, #f5f7fa 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.footer-icon {
  font-size: 14px;
  color: #6b7280;
}

.footer-hint {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
}

.char-count {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

/* 配置区域 */
.variables-section,
.knowledge-section,
.tools-section {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;
}

.section-content {
  padding: 16px 20px;
}

.section-desc {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

/* 变量列表样式 */
.variables-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.variable-item {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: all 0.2s;
}

.variable-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.variable-info {
  flex: 1;
}

.variable-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.variable-type {
  font-size: 14px;
  color: #3b82f6;
  font-weight: 500;
  margin-bottom: 6px;
}

.variable-desc {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
  line-height: 1.4;
}

.variable-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.default-value {
  font-size: 12px;
  color: #9ca3af;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
}

.variable-actions {
  display: flex;
  gap: 8px;
}

/* 知识库内容样式 */
.knowledge-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.knowledge-item {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s;
}

.knowledge-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.knowledge-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.knowledge-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  flex: 1;
  margin-right: 12px;
}

.knowledge-content {
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
  margin-bottom: 12px;
}

.knowledge-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-item {
  font-size: 12px;
}

/* 变量表单对话框样式 */
.variable-form-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.variable-form-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0;
  border: none;
}

.variable-form-dialog :deep(.el-dialog__title) {
  display: none;
}

.variable-form-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.form-header {
  display: flex;
  align-items: center;
  padding: 24px;
  gap: 16px;
}

.form-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.form-title h3 {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 600;
  color: white;
}

.form-title p {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.variable-form {
  padding: 24px;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.form-item-half {
  flex: 1;
}

.variable-form :deep(.el-form-item__label) {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.variable-form :deep(.el-input__inner),
.variable-form :deep(.el-textarea__inner) {
  border-radius: 8px;
  border: 2px solid #e5e7eb;
  padding: 12px 16px;
  font-size: 14px;
  transition: all 0.2s;
}

.variable-form :deep(.el-input__inner:focus),
.variable-form :deep(.el-textarea__inner:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.variable-form :deep(.el-select .el-input__inner) {
  border-radius: 8px;
}

.option-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.option-label {
  font-weight: 500;
  color: #374151;
}

.option-unit {
  color: #6b7280;
  font-size: 12px;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
}

.switch-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.switch-hint {
  font-size: 12px;
  color: #6b7280;
}

.variable-form :deep(.el-switch__core) {
  border-radius: 12px;
  width: 40px;
  height: 20px;
}

.variable-form :deep(.el-switch.is-checked .el-switch__core) {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

/* 知识库页面样式 */
.knowledge-page {
  padding: 24px;
}

.knowledge-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.page-desc {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
  line-height: 1.6;
}

.knowledge-search {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  align-items: center;
}

.search-input {
  flex: 1;
  max-width: 400px;
}

.category-select {
  min-width: 150px;
}

.knowledge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.knowledge-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.knowledge-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  flex: 1;
  margin-right: 12px;
  line-height: 1.4;
}

.category-tag {
  flex-shrink: 0;
  font-weight: 500;
}

/* 确保分类标签文字为白色（包括列表与卡片两处） */
:deep(.category-tag) {
  color: #ffffff !important;
}

.knowledge-header :deep(.el-tag) {
  color: #ffffff !important;
}

/* 强化标签对比度与可读性（覆盖不同类型的浅色标签） */
:deep(.el-tag.is-light.el-tag--primary) {
  background-color: #3b82f6 !important; /* 蓝 */
  border-color: transparent !important;
  color: #ffffff !important;
  font-weight: 700;
}

:deep(.el-tag.is-light.el-tag--success) {
  background-color: #10b981 !important; /* 绿 */
  border-color: transparent !important;
  color: #ffffff !important;
  font-weight: 700;
}

:deep(.el-tag.is-light.el-tag--warning) {
  background-color: #f59e0b !important; /* 橙 */
  border-color: transparent !important;
  color: #ffffff !important;
  font-weight: 700;
}

:deep(.el-tag.is-light.el-tag--info) {
  background-color: #6366f1 !important; /* 靛蓝 */
  border-color: transparent !important;
  color: #ffffff !important;
  font-weight: 700;
}

:deep(.el-tag.is-light.el-tag--danger) {
  background-color: #ef4444 !important; /* 红 */
  border-color: transparent !important;
  color: #ffffff !important;
  font-weight: 700;
}

/* 进一步加强知识卡片右上角分类标签的可读性（提高优先级与阴影） */
.knowledge-card :deep(.el-tag),
.knowledge-item :deep(.el-tag) {
  font-weight: 700;
  color: #ffffff !important;
  padding: 2px 10px;
  border-radius: 999px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.18);
}

.knowledge-card :deep(.el-tag__content),
.knowledge-item :deep(.el-tag__content) {
  color: #ffffff !important;
  text-shadow: 0 1px 1px rgba(0,0,0,0.35);
}

/* 无论是否 is-light，都统一加深背景色（仅限知识库区域） */
.knowledge-card :deep(.el-tag--primary),
.knowledge-item :deep(.el-tag--primary) {
  background-color: #2563eb !important;
  border-color: #2563eb !important;
  color: #ffffff !important;
}

.knowledge-card :deep(.el-tag--success),
.knowledge-item :deep(.el-tag--success) {
  background-color: #059669 !important;
  border-color: #059669 !important;
  color: #ffffff !important;
}

.knowledge-card :deep(.el-tag--warning),
.knowledge-item :deep(.el-tag--warning) {
  background-color: #d97706 !important;
  border-color: #d97706 !important;
  color: #ffffff !important;
}

.knowledge-card :deep(.el-tag--info),
.knowledge-item :deep(.el-tag--info) {
  background-color: #4f46e5 !important;
  border-color: #4f46e5 !important;
  color: #ffffff !important;
}

.knowledge-card :deep(.el-tag--danger),
.knowledge-item :deep(.el-tag--danger) {
  background-color: #dc2626 !important;
  border-color: #dc2626 !important;
  color: #ffffff !important;
}

/* 提升知识库卡片内文字的对比度与大小 */
.knowledge-item .knowledge-content,
.knowledge-card .card-content {
  color: #1f2937; /* 更深的文字颜色 */
  font-size: 15px;
}

.knowledge-item .knowledge-title,
.knowledge-card .card-title {
  color: #0f172a; /* 标题更深色 */
  letter-spacing: 0.2px;
}

.card-content {
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-item {
  font-size: 12px;
  font-weight: 500;
  color: white !important;
}

/* 修复知识库标签颜色问题 */
.knowledge-item .tag-item {
  color: white !important;
}

.knowledge-card .tag-item {
  color: white !important;
}

/* 对话框底部 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
}

.cancel-btn {
  border: 1px solid #d1d5db;
  color: #6b7280;
  font-weight: 500;
  padding: 10px 20px;
  border-radius: 8px;
  transition: all 0.2s;
}

.cancel-btn:hover {
  border-color: #9ca3af;
  color: #374151;
  background: #f9fafb;
}

.save-btn {
  background: #3b82f6;
  border: none;
  color: white;
  font-weight: 600;
  padding: 10px 24px;
  border-radius: 8px;
  transition: all 0.2s;
}

.save-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

/* 设置描述样式 */
.setting-desc {
  margin-left: 8px;
    font-size: 12px;
  color: #6b7280;
  display: block;
  margin-top: 4px;
}

/* 右侧调试预览区域 */
.right-panel {
  width: 360px;
  background: #f9fafb;
  border-left: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

/* 垂直分隔条 */
.vertical-resizer {
  width: 6px;
  cursor: col-resize;
  background: linear-gradient(180deg, rgba(0,0,0,0.06), rgba(0,0,0,0.02));
  border-left: 1px solid #e5e7eb;
  border-right: 1px solid #e5e7eb;
}

.vertical-resizer:hover,
.resizing-col .vertical-resizer {
  background: rgba(64, 158, 255, 0.2);
}

.right-panel .panel-header {
  padding: 0 20px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.right-panel .panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.preview-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 聊天预览区域 */
.chat-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  margin: 16px 16px 0 16px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  padding: 12px;
  /* 关键：允许子元素正确计算高度 */
  min-height: 0;
}

.preview-chat-column { display: flex; flex-direction: column; min-height: 0; flex: 1; }

/* 输入框 + 右侧快捷问题 并排 */
.input-with-quick { display: flex; gap: 8px; align-items: center; }
.input-with-quick .el-input { flex: 1; }
.quick-inline { display: flex; gap: 6px; }
.quick-inline-btn {
  width: 36px; height: 36px; padding: 0;
  border: 1px solid #e5e7eb;
}
.quick-inline-btn:hover { border-color: #409eff; background: #ecf5ff; color: #409eff; }

.chat-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  /* 关键：防止在flex容器中无法滚动 */
  min-height: 0;
}

.message-item {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.message-item.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-item.user .message-avatar {
  background: #3b82f6;
  color: white;
}

.message-item:not(.user) .message-avatar {
  background: #f3f4f6;
  color: #6b7280;
}

.message-content {
  flex: 1;
  max-width: 80%;
}

.message-item.user .message-content {
  text-align: right;
}

.message-text {
  background: #f3f4f6;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
}

.message-item.user .message-text {
  background: #3b82f6;
  color: white;
}

/* 预览中的图片消息 */
.preview-image {
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}

.message-time {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 4px;
}

.typing-indicator {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.typing-dots {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 8px 12px;
  background: #f3f4f6;
  border-radius: 12px;
}

.dot {
  width: 6px;
  height: 6px;
  background: #9ca3af;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }
.dot:nth-child(3) { animation-delay: 0s; }

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

.chat-input-area {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  background: #ffffff;
  margin-top: auto;
}

.input-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.input-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0;
}

.input-container {
  margin-bottom: 12px;
}

.message-input {
  border-radius: 8px;
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #10b981;
}

.status-icon {
  font-size: 14px;
}

.manage-link {
  font-size: 12px;
  color: #3b82f6;
  cursor: pointer;
}

/* API、日志、监测内容区域 */
.api-content,
.logs-content,
.monitoring-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.api-info,
.logs-info,
.monitoring-info h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-item {
  display: flex;
  gap: 12px;
  padding: 8px 12px;
  background: #ffffff;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  font-size: 12px;
}

.log-time {
  color: #6b7280;
  min-width: 60px;
}

.log-type {
  color: #3b82f6;
  font-weight: 500;
  min-width: 40px;
}

.log-content {
  color: #374151;
  flex: 1;
}

.status-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.status-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
}

.status-title {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.status-value {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.status-value.online {
  color: #10b981;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .right-panel {
    width: 300px;
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }

  .left-sidebar {
    width: 100%;
  height: auto;
  }

  .right-panel {
    width: 100%;
    height: 300px;
  }
}


</style>
