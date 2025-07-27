<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import {
  useI18n,
  usePermissions,
  useRoute,
  useRouter,
  useTheme,
} from '../../src'

const route = useRoute()
const router = useRouter()
const { t, setLocale, formatDate, formatRelativeTime } = useI18n()
const { setTheme } = useTheme()
const { hasPermission } = usePermissions()

const loading = ref(false)

// 获取用户ID
const userId = computed(() => route.value?.params.id as string)

// 用户数据
const userData = reactive({
  name: '',
  title: '',
  email: '',
  phone: '',
  department: '',
  location: '',
  status: 'active',
  joinDate: new Date('2023-01-15'),
  lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2小时前
})

// 用户头像
const userAvatar = computed(() => {
  return `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20portrait%20of%20${encodeURIComponent(userData.name || 'user')}&image_size=square`
})

// 状态样式
const statusClass = computed(() => {
  return {
    'status-active': userData.status === 'active',
    'status-inactive': userData.status === 'inactive',
    'status-pending': userData.status === 'pending',
  }
})

// 用户权限
const userPermissions = ref([
  {
    name: 'system',
    permissions: ['read', 'write', 'admin'],
  },
  {
    name: 'content',
    permissions: ['create', 'edit', 'delete', 'publish'],
  },
  {
    name: 'user',
    permissions: ['view', 'manage', 'invite'],
  },
])

// 用户活动
const userActivity = ref([
  {
    id: 1,
    type: 'login',
    icon: '🔐',
    description: '登录系统',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 2,
    type: 'edit',
    icon: '✏️',
    description: '编辑了项目配置',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    id: 3,
    type: 'create',
    icon: '➕',
    description: '创建了新任务',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    id: 4,
    type: 'comment',
    icon: '💬',
    description: '添加了评论',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
  },
])

// 用户统计
const userStats = reactive({
  loginCount: 0,
  projectCount: 0,
  taskCount: 0,
  score: 0,
})

// 用户偏好设置
const userPreferences = reactive({
  theme: 'light',
  language: 'zh-CN',
  emailNotifications: true,
  pushNotifications: false,
})

// 加载用户数据
async function loadUserData() {
  loading.value = true

  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 生成模拟数据
    const names = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十']
    const titles = ['前端工程师', '后端工程师', '产品经理', '设计师', '测试工程师']
    const departments = ['技术部', '产品部', '设计部', '运营部', '市场部']
    const locations = ['北京', '上海', '深圳', '杭州', '成都']

    const userIndex = Number.parseInt(userId.value) % names.length

    userData.name = names[userIndex]
    userData.title = titles[userIndex % titles.length]
    userData.email = `user${userId.value}@ldesign.com`
    userData.phone = `138${userId.value.padStart(8, '0')}`
    userData.department = departments[userIndex % departments.length]
    userData.location = locations[userIndex % locations.length]

    // 生成统计数据
    userStats.loginCount = Math.floor(Math.random() * 100) + 50
    userStats.projectCount = Math.floor(Math.random() * 20) + 5
    userStats.taskCount = Math.floor(Math.random() * 50) + 10
    userStats.score = Math.floor(Math.random() * 100) + 80
  }
 catch (error) {
    console.error('Failed to load user data:', error)
  }
 finally {
    loading.value = false
  }
}

// 刷新用户数据
function refreshUser() {
  loadUserData()
}

// 编辑用户
function editUser() {
  console.log('Edit user:', userId.value)
  alert(t('user.editComingSoon'))
}

// 更新主题
function updateTheme() {
  setTheme(userPreferences.theme)
}

// 更新语言
function updateLanguage() {
  setLocale(userPreferences.language)
}

// 更新偏好设置
function updatePreferences() {
  console.log('Preferences updated:', userPreferences)
}

// 监听路由参数变化
watch(
  () => route.value?.params.id,
  (newId) => {
    if (newId) {
      loadUserData()
    }
  },
  { immediate: true },
)

// 组件挂载时加载数据
onMounted(() => {
  loadUserData()
})
</script>

<template>
  <div class="user-page">
    <div class="page-header">
      <div class="user-avatar">
        <img :src="userAvatar" :alt="userData.name">
      </div>
      <div class="user-info">
        <h1 class="user-name">
          {{ userData.name }}
        </h1>
        <p class="user-title">
          {{ userData.title }}
        </p>
        <div class="user-meta">
          <span class="user-id">ID: {{ userId }}</span>
          <span class="user-status" :class="statusClass">{{ userData.status }}</span>
        </div>
      </div>
      <div class="user-actions">
        <button class="btn btn-outline" :disabled="loading" @click="refreshUser">
          {{ loading ? t('user.refreshing') : t('user.refresh') }}
        </button>
        <button class="btn btn-primary" @click="editUser">
          {{ t('user.edit') }}
        </button>
      </div>
    </div>

    <div class="user-content">
      <div class="user-details">
        <div class="details-card">
          <h2>{{ t('user.details.title') }}</h2>
          <div class="details-grid">
            <div class="detail-item">
              <label>{{ t('user.details.email') }}</label>
              <span>{{ userData.email }}</span>
            </div>
            <div class="detail-item">
              <label>{{ t('user.details.phone') }}</label>
              <span>{{ userData.phone }}</span>
            </div>
            <div class="detail-item">
              <label>{{ t('user.details.department') }}</label>
              <span>{{ userData.department }}</span>
            </div>
            <div class="detail-item">
              <label>{{ t('user.details.location') }}</label>
              <span>{{ userData.location }}</span>
            </div>
            <div class="detail-item">
              <label>{{ t('user.details.joinDate') }}</label>
              <span>{{ formatDate(userData.joinDate) }}</span>
            </div>
            <div class="detail-item">
              <label>{{ t('user.details.lastLogin') }}</label>
              <span>{{ formatRelativeTime(userData.lastLogin) }}</span>
            </div>
          </div>
        </div>

        <div class="permissions-card">
          <h2>{{ t('user.permissions.title') }}</h2>
          <div class="permissions-list">
            <div v-for="group in userPermissions" :key="group.name" class="permission-group">
              <h3>{{ t(`user.permissions.groups.${group.name}`) }}</h3>
              <div class="permission-items">
                <span
                  v-for="permission in group.permissions"
                  :key="permission"
                  class="permission-item"
                  :class="{ granted: hasPermission(permission) }"
                >
                  {{ t(`user.permissions.items.${permission}`) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="user-activity">
        <div class="activity-card">
          <h2>{{ t('user.activity.title') }}</h2>
          <div class="activity-list">
            <div v-for="activity in userActivity" :key="activity.id" class="activity-item">
              <div class="activity-icon">
                {{ activity.icon }}
              </div>
              <div class="activity-content">
                <div class="activity-title">
                  {{ t(`user.activity.types.${activity.type}`) }}
                </div>
                <div class="activity-description">
                  {{ activity.description }}
                </div>
                <div class="activity-time">
                  {{ formatRelativeTime(activity.timestamp) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="stats-card">
          <h2>{{ t('user.stats.title') }}</h2>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">
                {{ userStats.loginCount }}
              </div>
              <div class="stat-label">
                {{ t('user.stats.logins') }}
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-value">
                {{ userStats.projectCount }}
              </div>
              <div class="stat-label">
                {{ t('user.stats.projects') }}
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-value">
                {{ userStats.taskCount }}
              </div>
              <div class="stat-label">
                {{ t('user.stats.tasks') }}
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-value">
                {{ userStats.score }}
              </div>
              <div class="stat-label">
                {{ t('user.stats.score') }}
              </div>
            </div>
          </div>
        </div>

        <div class="preferences-card">
          <h2>{{ t('user.preferences.title') }}</h2>
          <div class="preferences-list">
            <div class="preference-item">
              <label>{{ t('user.preferences.theme') }}</label>
              <select v-model="userPreferences.theme" @change="updateTheme">
                <option value="light">
                  {{ t('user.preferences.themes.light') }}
                </option>
                <option value="dark">
                  {{ t('user.preferences.themes.dark') }}
                </option>
                <option value="auto">
                  {{ t('user.preferences.themes.auto') }}
                </option>
              </select>
            </div>
            <div class="preference-item">
              <label>{{ t('user.preferences.language') }}</label>
              <select v-model="userPreferences.language" @change="updateLanguage">
                <option value="zh-CN">
                  中文
                </option>
                <option value="en-US">
                  English
                </option>
              </select>
            </div>
            <div class="preference-item">
              <label>{{ t('user.preferences.notifications') }}</label>
              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input
                    v-model="userPreferences.emailNotifications"
                    type="checkbox"
                    @change="updatePreferences"
                  >
                  {{ t('user.preferences.emailNotifications') }}
                </label>
                <label class="checkbox-label">
                  <input
                    v-model="userPreferences.pushNotifications"
                    type="checkbox"
                    @change="updatePreferences"
                  >
                  {{ t('user.preferences.pushNotifications') }}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 3rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.user-avatar {
  flex-shrink: 0;
}

.user-avatar img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #1890ff;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: #333;
}

.user-title {
  font-size: 1.125rem;
  color: #666;
  margin: 0 0 1rem 0;
}

.user-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.user-id {
  font-size: 0.875rem;
  color: #999;
  font-family: monospace;
}

.user-status {
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status-active {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.status-inactive {
  background: #fff2e8;
  color: #fa8c16;
  border: 1px solid #ffd591;
}

.status-pending {
  background: #f0f0f0;
  color: #666;
  border: 1px solid #d9d9d9;
}

.user-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #1890ff;
  color: white;
}

.btn-primary:hover {
  background: #40a9ff;
}

.btn-outline {
  background: transparent;
  color: #1890ff;
  border: 1px solid #1890ff;
}

.btn-outline:hover {
  background: #1890ff;
  color: white;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.user-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.details-card,
.permissions-card,
.activity-card,
.stats-card,
.preferences-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.details-card h2,
.permissions-card h2,
.activity-card h2,
.stats-card h2,
.preferences-card h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  color: #333;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item label {
  font-weight: 500;
  color: #666;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-item span {
  color: #333;
  font-size: 1rem;
}

.permissions-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.permission-group h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  color: #333;
}

.permission-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.permission-item {
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 500;
  background: #f0f0f0;
  color: #666;
}

.permission-item.granted {
  background: #e6f7ff;
  color: #1890ff;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.activity-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 500;
  color: #333;
  margin-bottom: 0.25rem;
}

.activity-description {
  color: #666;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.activity-time {
  color: #999;
  font-size: 0.75rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1890ff;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #666;
  font-size: 0.875rem;
  font-weight: 500;
}

.preferences-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.preference-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preference-item label {
  font-weight: 500;
  color: #333;
}

.preference-item select {
  padding: 0.5rem;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 1rem;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: normal !important;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    text-align: center;
  }

  .user-content {
    grid-template-columns: 1fr;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .user-actions {
    flex-direction: column;
    width: 100%;
  }
}

/* 暗色主题适配 */
:global(.theme-dark) .page-header,
:global(.theme-dark) .details-card,
:global(.theme-dark) .permissions-card,
:global(.theme-dark) .activity-card,
:global(.theme-dark) .stats-card,
:global(.theme-dark) .preferences-card {
  background: #2d2d2d;
  color: white;
}

:global(.theme-dark) .user-name,
:global(.theme-dark) .details-card h2,
:global(.theme-dark) .permissions-card h2,
:global(.theme-dark) .activity-card h2,
:global(.theme-dark) .stats-card h2,
:global(.theme-dark) .preferences-card h2,
:global(.theme-dark) .permission-group h3,
:global(.theme-dark) .activity-title,
:global(.theme-dark) .detail-item span,
:global(.theme-dark) .preference-item label {
  color: white;
}

:global(.theme-dark) .user-title,
:global(.theme-dark) .detail-item label,
:global(.theme-dark) .activity-description,
:global(.theme-dark) .stat-label {
  color: #ccc;
}

:global(.theme-dark) .activity-time,
:global(.theme-dark) .user-id {
  color: #999;
}

:global(.theme-dark) .permission-item {
  background: #404040;
  color: #ccc;
}

:global(.theme-dark) .stat-item {
  background: #404040;
}

:global(.theme-dark) .preference-item select {
  background: #404040;
  border-color: #555;
  color: white;
}
</style>
