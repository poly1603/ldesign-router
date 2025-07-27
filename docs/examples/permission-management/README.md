# 权限管理示例

这个示例展示了 `@ldesign/router` 的完整权限管理功能，包括基于角色和权限的访问控制、动态权限更新和权限指令。

## 功能特性

- ✅ 基于角色的访问控制 (RBAC)
- ✅ 基于权限的访问控制
- ✅ 动态权限更新
- ✅ 权限指令 (`v-permission`, `v-role`)
- ✅ 路由级权限控制
- ✅ 组件级权限控制
- ✅ 权限缓存和性能优化
- ✅ 权限继承和层级管理

## 项目结构

```
permission-management/
├── src/
│   ├── components/
│   │   ├── Layout.vue         # 布局组件
│   │   ├── Navigation.vue     # 导航组件
│   │   ├── UserMenu.vue       # 用户菜单
│   │   └── PermissionDemo.vue # 权限演示组件
│   ├── views/
│   │   ├── Login.vue          # 登录页面
│   │   ├── Dashboard.vue      # 仪表板
│   │   ├── UserManagement.vue # 用户管理
│   │   ├── RoleManagement.vue # 角色管理
│   │   ├── AdminPanel.vue     # 管理面板
│   │   ├── Profile.vue        # 个人资料
│   │   └── Unauthorized.vue   # 无权限页面
│   ├── directives/
│   │   └── permission.ts      # 权限指令
│   ├── stores/
│   │   └── auth.ts            # 认证状态管理
│   ├── utils/
│   │   └── permissions.ts     # 权限工具函数
│   ├── router/
│   │   └── index.ts           # 路由配置
│   ├── App.vue
│   └── main.ts
├── package.json
├── vite.config.ts
└── README.md
```

## 快速开始

### 安装依赖

```bash
cd permission-management
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

## 代码示例

### 路由配置

```typescript
// src/router/index.ts
import { createLDesignRouter } from '@ldesign/router'
import Layout from '@/components/Layout.vue'
import Login from '@/views/Login.vue'
import Dashboard from '@/views/Dashboard.vue'
import UserManagement from '@/views/UserManagement.vue'
import RoleManagement from '@/views/RoleManagement.vue'
import AdminPanel from '@/views/AdminPanel.vue'
import Profile from '@/views/Profile.vue'
import Unauthorized from '@/views/Unauthorized.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: {
          title: '仪表板',
          icon: 'dashboard',
          roles: ['admin', 'user', 'guest']
        }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: Profile,
        meta: {
          title: '个人资料',
          icon: 'user',
          roles: ['admin', 'user']
        }
      },
      {
        path: 'users',
        name: 'UserManagement',
        component: UserManagement,
        meta: {
          title: '用户管理',
          icon: 'users',
          roles: ['admin'],
          permissions: ['user:read', 'user:write']
        }
      },
      {
        path: 'roles',
        name: 'RoleManagement',
        component: RoleManagement,
        meta: {
          title: '角色管理',
          icon: 'shield',
          roles: ['admin'],
          permissions: ['role:read', 'role:write']
        }
      },
      {
        path: 'admin',
        name: 'AdminPanel',
        component: AdminPanel,
        meta: {
          title: '管理面板',
          icon: 'settings',
          roles: ['admin'],
          permissions: ['admin:read']
        }
      }
    ]
  },
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: Unauthorized,
    meta: {
      title: '无权限访问'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createLDesignRouter({
  history: 'web',
  routes,

  // 权限配置
  permission: {
    enabled: true,
    mode: 'both', // 同时支持角色和权限检查
    storage: 'localStorage',
    unauthorizedRedirect: '/unauthorized',
    loginRedirect: '/login',

    // 权限检查函数
    checkPermission: (route, user) => {
      // 自定义权限检查逻辑
      if (!route.meta?.requiresAuth)
return true
      if (!user)
return false

      // 检查角色
      if (route.meta.roles) {
        const hasRole = route.meta.roles.some(role =>
          user.roles?.includes(role)
        )
        if (!hasRole)
return false
      }

      // 检查权限
      if (route.meta.permissions) {
        const hasPermission = route.meta.permissions.some(permission =>
          user.permissions?.includes(permission)
        )
        if (!hasPermission)
return false
      }

      return true
    }
  }
})

export default router
```

### 认证状态管理

```typescript
// src/stores/auth.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { usePermissions } from '@ldesign/router'

export interface User {
  id: string
  username: string
  email: string
  roles: string[]
  permissions: string[]
  avatar?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))

  const { setUser, clearUser, hasRole, hasPermission } = usePermissions()

  // 计算属性
  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const isAdmin = computed(() => hasRole('admin'))
  const userRoles = computed(() => user.value?.roles || [])
  const userPermissions = computed(() => user.value?.permissions || [])

  // 登录
  const login = async (credentials: { username: string, password: string }) => {
    try {
      // 模拟 API 调用
      const response = await mockLogin(credentials)

      user.value = response.user
      token.value = response.token

      // 存储到本地存储
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))

      // 设置路由权限
      setUser(response.user)

      return response
    }
 catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  // 登出
  const logout = () => {
    user.value = null
    token.value = null

    // 清除本地存储
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    // 清除路由权限
    clearUser()
  }

  // 更新用户信息
  const updateUser = (userData: Partial<User>) => {
    if (user.value) {
      user.value = { ...user.value, ...userData }
      localStorage.setItem('user', JSON.stringify(user.value))
      setUser(user.value)
    }
  }

  // 初始化用户信息
  const initUser = () => {
    const storedUser = localStorage.getItem('user')
    if (storedUser && token.value) {
      try {
        user.value = JSON.parse(storedUser)
        setUser(user.value!)
      }
 catch (error) {
        console.error('解析用户信息失败:', error)
        logout()
      }
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    userRoles,
    userPermissions,
    login,
    logout,
    updateUser,
    initUser,
    hasRole,
    hasPermission
  }
})

// 模拟登录 API
async function mockLogin(credentials: { username: string, password: string }) {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000))

  // 模拟用户数据
  const users = {
    admin: {
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      roles: ['admin'],
      permissions: [
        'user:read',
'user:write',
'user:delete',
        'role:read',
'role:write',
'role:delete',
        'admin:read',
'admin:write'
      ],
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
    },
    user: {
      id: '2',
      username: 'user',
      email: 'user@example.com',
      roles: ['user'],
      permissions: ['user:read', 'profile:write'],
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'
    },
    guest: {
      id: '3',
      username: 'guest',
      email: 'guest@example.com',
      roles: ['guest'],
      permissions: ['dashboard:read'],
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest'
    }
  }

  const user = users[credentials.username as keyof typeof users]

  if (!user || credentials.password !== '123456') {
    throw new Error('用户名或密码错误')
  }

  return {
    user,
    token: `token_${user.id}_${Date.now()}`
  }
}
```

### 权限指令

```typescript
// src/directives/permission.ts
import type { Directive, DirectiveBinding } from 'vue'
import { usePermissions } from '@ldesign/router'

// 权限指令
export const vPermission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { hasPermission } = usePermissions()
    const permission = binding.value

    if (!hasPermission(permission)) {
      el.style.display = 'none'
    }
  },

  updated(el: HTMLElement, binding: DirectiveBinding) {
    const { hasPermission } = usePermissions()
    const permission = binding.value

    if (hasPermission(permission)) {
      el.style.display = ''
    }
 else {
      el.style.display = 'none'
    }
  }
}

// 角色指令
export const vRole: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { hasRole } = usePermissions()
    const role = binding.value

    if (!hasRole(role)) {
      el.style.display = 'none'
    }
  },

  updated(el: HTMLElement, binding: DirectiveBinding) {
    const { hasRole } = usePermissions()
    const role = binding.value

    if (hasRole(role)) {
      el.style.display = ''
    }
 else {
      el.style.display = 'none'
    }
  }
}

// 多权限指令（需要所有权限）
export const vPermissionAll: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { hasPermission } = usePermissions()
    const permissions = Array.isArray(binding.value) ? binding.value : [binding.value]

    const hasAllPermissions = permissions.every(permission => hasPermission(permission))

    if (!hasAllPermissions) {
      el.style.display = 'none'
    }
  },

  updated(el: HTMLElement, binding: DirectiveBinding) {
    const { hasPermission } = usePermissions()
    const permissions = Array.isArray(binding.value) ? binding.value : [binding.value]

    const hasAllPermissions = permissions.every(permission => hasPermission(permission))

    if (hasAllPermissions) {
      el.style.display = ''
    }
 else {
      el.style.display = 'none'
    }
  }
}

// 多权限指令（需要任一权限）
export const vPermissionAny: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { hasPermission } = usePermissions()
    const permissions = Array.isArray(binding.value) ? binding.value : [binding.value]

    const hasAnyPermission = permissions.some(permission => hasPermission(permission))

    if (!hasAnyPermission) {
      el.style.display = 'none'
    }
  },

  updated(el: HTMLElement, binding: DirectiveBinding) {
    const { hasPermission } = usePermissions()
    const permissions = Array.isArray(binding.value) ? binding.value : [binding.value]

    const hasAnyPermission = permissions.some(permission => hasPermission(permission))

    if (hasAnyPermission) {
      el.style.display = ''
    }
 else {
      el.style.display = 'none'
    }
  }
}
```

### 登录页面

```vue
<!-- src/views/Login.vue -->
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from '@ldesign/router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')

const form = reactive({
  username: '',
  password: '123456'
})

async function handleLogin() {
  if (!form.username || !form.password) {
    error.value = '请填写完整信息'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await authStore.login(form)

    // 登录成功，跳转到仪表板
    router.push('/dashboard')
  }
 catch (err: any) {
    error.value = err.message || '登录失败'
  }
 finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <h1>权限管理示例</h1>
      <p class="subtitle">
        请选择用户类型登录
      </p>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">用户名</label>
          <select
            id="username"
            v-model="form.username"
            class="form-control"
            required
          >
            <option value="">
              请选择用户
            </option>
            <option value="admin">
              管理员 (admin)
            </option>
            <option value="user">
              普通用户 (user)
            </option>
            <option value="guest">
              访客 (guest)
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="form-control"
            placeholder="请输入密码 (123456)"
            required
          >
        </div>

        <button
          type="submit"
          class="btn btn-primary"
          :disabled="loading"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <div class="user-info">
        <h3>测试账号信息</h3>
        <div class="user-card">
          <h4>管理员 (admin)</h4>
          <p>角色: admin</p>
          <p>权限: 所有权限</p>
        </div>
        <div class="user-card">
          <h4>普通用户 (user)</h4>
          <p>角色: user</p>
          <p>权限: 基础权限</p>
        </div>
        <div class="user-card">
          <h4>访客 (guest)</h4>
          <p>角色: guest</p>
          <p>权限: 只读权限</p>
        </div>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.login-card {
  background: white;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

.login-card h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.subtitle {
  text-align: center;
  color: #7f8c8d;
  margin-bottom: 2rem;
}

.login-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ecf0f1;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: #3498db;
}

.btn {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.user-info {
  border-top: 1px solid #ecf0f1;
  padding-top: 2rem;
}

.user-info h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.user-card {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.user-card h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.user-card p {
  margin: 0.25rem 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.error-message {
  background: #e74c3c;
  color: white;
  padding: 1rem;
  border-radius: 6px;
  margin-top: 1rem;
  text-align: center;
}
</style>
```

### 权限演示组件

```vue
<!-- src/components/PermissionDemo.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { usePermissions } from '@ldesign/router'
import { useAuthStore } from '@/stores/auth'

const { hasRole, hasPermission, refreshPermissions } = usePermissions()
const authStore = useAuthStore()

// 计算属性
const isAdmin = computed(() => authStore.isAdmin)
const userRoles = computed(() => authStore.userRoles)
const userPermissions = computed(() => authStore.userPermissions)

// 权限检查函数
function hasAllPermissions(permissions: string[]) {
  return permissions.every(permission => hasPermission(permission))
}

function hasAnyPermission(permissions: string[]) {
  return permissions.some(permission => hasPermission(permission))
}

// 动态权限操作
function addPermission() {
  const currentUser = authStore.user
  if (currentUser) {
    const newPermissions = [...currentUser.permissions, 'temp:permission']
    authStore.updateUser({ permissions: newPermissions })
  }
}

function removePermission() {
  const currentUser = authStore.user
  if (currentUser) {
    const newPermissions = currentUser.permissions.filter(
      permission => permission !== 'temp:permission'
    )
    authStore.updateUser({ permissions: newPermissions })
  }
}
</script>

<template>
  <div class="permission-demo">
    <h2>权限控制演示</h2>

    <div class="demo-section">
      <h3>基于角色的控制</h3>

      <div class="demo-item">
        <span>管理员可见:</span>
        <button v-role="'admin'" class="btn btn-danger">
          删除用户
        </button>
        <span v-if="!hasRole('admin')" class="no-permission">
          (您没有管理员权限)
        </span>
      </div>

      <div class="demo-item">
        <span>用户可见:</span>
        <button v-role="'user'" class="btn btn-primary">
          编辑资料
        </button>
        <span v-if="!hasRole('user')" class="no-permission">
          (您没有用户权限)
        </span>
      </div>
    </div>

    <div class="demo-section">
      <h3>基于权限的控制</h3>

      <div class="demo-item">
        <span>需要用户读取权限:</span>
        <button v-permission="'user:read'" class="btn btn-info">
          查看用户列表
        </button>
        <span v-if="!hasPermission('user:read')" class="no-permission">
          (您没有用户读取权限)
        </span>
      </div>

      <div class="demo-item">
        <span>需要用户写入权限:</span>
        <button v-permission="'user:write'" class="btn btn-warning">
          创建用户
        </button>
        <span v-if="!hasPermission('user:write')" class="no-permission">
          (您没有用户写入权限)
        </span>
      </div>
    </div>

    <div class="demo-section">
      <h3>多权限控制</h3>

      <div class="demo-item">
        <span>需要所有权限:</span>
        <button v-permission-all="['user:read', 'user:write']" class="btn btn-success">
          用户管理
        </button>
        <span v-if="!hasAllPermissions(['user:read', 'user:write'])" class="no-permission">
          (您缺少必要权限)
        </span>
      </div>

      <div class="demo-item">
        <span>需要任一权限:</span>
        <button v-permission-any="['admin:read', 'user:read']" class="btn btn-secondary">
          查看数据
        </button>
        <span v-if="!hasAnyPermission(['admin:read', 'user:read'])" class="no-permission">
          (您没有查看权限)
        </span>
      </div>
    </div>

    <div class="demo-section">
      <h3>编程式权限检查</h3>

      <div class="permission-status">
        <div class="status-item">
          <span class="label">是否为管理员:</span>
          <span class="status" :class="[isAdmin ? 'yes' : 'no']">
            {{ isAdmin ? '是' : '否' }}
          </span>
        </div>

        <div class="status-item">
          <span class="label">用户角色:</span>
          <span class="roles">
            {{ userRoles.join(', ') || '无' }}
          </span>
        </div>

        <div class="status-item">
          <span class="label">用户权限:</span>
          <div class="permissions">
            <span
              v-for="permission in userPermissions"
              :key="permission"
              class="permission-tag"
            >
              {{ permission }}
            </span>
            <span v-if="userPermissions.length === 0" class="no-permissions">
              无权限
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h3>动态权限更新</h3>

      <div class="permission-controls">
        <button class="btn btn-primary" @click="addPermission">
          添加临时权限
        </button>

        <button class="btn btn-danger" @click="removePermission">
          移除权限
        </button>

        <button class="btn btn-info" @click="refreshPermissions">
          刷新权限
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.permission-demo {
  max-width: 800px;
  margin: 0 auto;
}

.permission-demo h2 {
  color: #2c3e50;
  margin-bottom: 2rem;
}

.demo-section {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.demo-section h3 {
  color: #34495e;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #ecf0f1;
  padding-bottom: 0.5rem;
}

.demo-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.demo-item span:first-child {
  min-width: 150px;
  font-weight: 500;
  color: #2c3e50;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.btn-primary { background: #3498db; color: white; }
.btn-danger { background: #e74c3c; color: white; }
.btn-warning { background: #f39c12; color: white; }
.btn-info { background: #17a2b8; color: white; }
.btn-success { background: #27ae60; color: white; }
.btn-secondary { background: #95a5a6; color: white; }

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.no-permission {
  color: #e74c3c;
  font-style: italic;
  font-size: 0.9rem;
}

.permission-status {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 6px;
}

.status-item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.status-item:last-child {
  margin-bottom: 0;
}

.label {
  min-width: 120px;
  font-weight: 500;
  color: #2c3e50;
}

.status.yes {
  color: #27ae60;
  font-weight: bold;
}

.status.no {
  color: #e74c3c;
  font-weight: bold;
}

.roles {
  color: #3498db;
  font-weight: 500;
}

.permissions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.permission-tag {
  background: #3498db;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.no-permissions {
  color: #7f8c8d;
  font-style: italic;
}

.permission-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
</style>
```

## 学习要点

### 1. 权限配置

- 启用权限管理功能
- 配置权限检查模式 (`role`, `permission`, `both`)
- 设置未授权重定向路径
- 自定义权限检查函数

### 2. 路由级权限控制

- 在路由元信息中配置角色和权限
- 使用 `requiresAuth` 控制是否需要认证
- 支持多角色和多权限配置

### 3. 组件级权限控制

- 使用权限指令控制元素显示
- 编程式权限检查
- 动态权限更新

### 4. 权限指令

- `v-role`: 基于角色控制
- `v-permission`: 基于权限控制
- `v-permission-all`: 需要所有权限
- `v-permission-any`: 需要任一权限

### 5. 状态管理

- 集中管理用户认证状态
- 权限信息的持久化存储
- 权限变更的响应式更新

## 扩展练习

1. **实现权限继承机制**
2. **添加权限审计日志**
3. **实现动态菜单生成**
4. **添加权限申请流程**
5. **实现细粒度权限控制**

## 相关文档

- [权限管理详细文档](../../features/permissions.md)
- [路由守卫](../../guide/core-concepts.md#navigation-guards)
- [组合式 API](../../api/composables.md)
- [最佳实践](../../guide/best-practices.md)
