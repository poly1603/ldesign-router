# @ldesign/router-angular

Angular 路由库，提供增强的路由功能，基于 @angular/router 和 @ldesign/router-core。

## 📦 安装

```bash
pnpm add @ldesign/router-angular
```

## 🚀 快速开始

### 1. 配置路由

```typescript
// app.routes.ts
import { Routes } from '@angular/router'
import { HomeComponent } from './components/home/home.component'
import { AboutComponent } from './components/about/about.component'
import { UserComponent } from './components/user/user.component'
import { authGuard } from '@ldesign/router-angular'

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: { title: '首页' },
  },
  {
    path: 'about',
    component: AboutComponent,
    data: { title: '关于' },
  },
  {
    path: 'user/:id',
    component: UserComponent,
    data: { title: '用户详情' },
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component'),
    canActivate: [authGuard(() => isAuthenticated())],
    data: { title: '仪表盘', requiresAuth: true },
  },
]
```

### 2. 在应用中使用

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core'
import { provideRouter } from '@ldesign/router-angular'
import { routes } from './app.routes'

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
  ],
}
```

```typescript
// main.ts
import { bootstrapApplication } from '@angular/platform-browser'
import { AppComponent } from './app/app.component'
import { appConfig } from './app/app.config'

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err))
```

### 3. 在组件中使用

```typescript
// app.component.ts
import { Component } from '@angular/core'
import { RouterOutlet, RouterLink } from '@ldesign/router-angular'
import { LdRouterLinkDirective } from '@ldesign/router-angular'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, LdRouterLinkDirective],
  template: `
    <nav>
      <a routerLink="/" routerLinkActive="active">首页</a>
      <a routerLink="/about" routerLinkActive="active">关于</a>
      <a ldRouterLink="/user/123">用户</a>
    </nav>
    <router-outlet />
  `,
})
export class AppComponent {}
```

### 4. 使用路由服务

```typescript
// user.component.ts
import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { LdRouterService } from '@ldesign/router-angular'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h1>用户详情</h1>
      <p>用户 ID: {{ userId }}</p>
      <p>页码: {{ page }}</p>
      <button (click)="goHome()">返回首页</button>
    </div>
  `,
})
export class UserComponent implements OnInit {
  userId: string | null = null
  page: string | null = null

  constructor(
    private route: ActivatedRoute,
    private ldRouter: LdRouterService
  ) {}

  ngOnInit() {
    // 获取路由参数
    this.route.params.subscribe(params => {
      this.userId = params['id']
    })

    // 获取查询参数
    this.route.queryParams.subscribe(query => {
      this.page = query['page'] || '1'
    })

    // 或使用 LdRouterService
    this.ldRouter.params$.subscribe(params => {
      console.log('参数变化:', params)
    })
  }

  goHome() {
    this.ldRouter.push('/')
  }
}
```

## 📚 API 文档

### LdRouterService

Angular 路由服务，提供与其他框架一致的 API。

#### 方法

##### push(to)

导航到新位置。

```typescript
// 字符串路径
await ldRouter.push('/about')

// 对象形式
await ldRouter.push({
  path: '/user/123',
  query: { page: '2' },
  hash: 'section',
})
```

##### replace(to)

替换当前位置。

```typescript
await ldRouter.replace('/home')
```

##### back()

返回上一页。

```typescript
ldRouter.back()
```

##### forward()

前进到下一页。

```typescript
ldRouter.forward()
```

##### go(delta)

前进或后退指定步数。

```typescript
ldRouter.go(-2)  // 后退 2 页
ldRouter.go(1)   // 前进 1 页
```

#### Observable 属性

##### params$

路由参数的 Observable 流。

```typescript
ldRouter.params$.subscribe(params => {
  console.log('用户 ID:', params.id)
})
```

##### query$

查询参数的 Observable 流。

```typescript
ldRouter.query$.subscribe(query => {
  console.log('页码:', query.page)
})
```

##### meta$

路由元信息的 Observable 流。

```typescript
ldRouter.meta$.subscribe(meta => {
  document.title = meta.title || '默认标题'
})
```

### 守卫

#### authGuard

认证守卫工厂函数。

```typescript
import { authGuard } from '@ldesign/router-angular'

const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard(() => isAuthenticated())],
  },
]
```

#### confirmDeactivateGuard

退出确认守卫。

```typescript
import { confirmDeactivateGuard } from '@ldesign/router-angular'

const routes: Routes = [
  {
    path: 'form',
    component: FormComponent,
    canDeactivate: [confirmDeactivateGuard('确定要离开吗？表单未保存。')],
  },
]
```

### 指令

#### ldRouterLink

路由链接指令（提供与其他框架一致的 API）。

```html
<a ldRouterLink="/">首页</a>
<a [ldRouterLink]="{ path: '/user/123', query: { tab: 'posts' } }">用户</a>
<a ldRouterLink="/about" [replace]="true">关于</a>
```

**Inputs**:
- `ldRouterLink`: 目标路由（字符串或对象）
- `replace`: 是否替换历史记录
- `activeClass`: 活跃链接类名

## 🔄 与其他框架对比

| 功能 | Angular | Vue | React | Svelte | Solid.js |
|------|---------|-----|-------|--------|----------|
| 获取路由器 | `LdRouterService` | `useRouter()` | `useRouter()` | `getRouter()` | `useRouter()` |
| 当前参数 | `params$` Observable | `useParams()` | `useParams()` | `$params` store | `useParams()` |
| 导航链接 | `ldRouterLink` | `<RouterLink>` | `<RouterLink>` | `<RouterLink>` | `<RouterLink>` |
| 视图渲染 | `<router-outlet>` | `<RouterView>` | `<RouterView>` | `<RouterView>` | `<RouterView>` |

## 🌟 特性

### 依赖注入

利用 Angular 的依赖注入系统：

```typescript
constructor(private ldRouter: LdRouterService) {}
```

### RxJS 集成

使用 Observable 流提供响应式路由状态：

```typescript
this.ldRouter.params$.pipe(
  map(params => params.id),
  distinctUntilChanged()
).subscribe(id => {
  console.log('用户 ID 变化:', id)
})
```

### 类型安全

完整的 TypeScript 类型支持：

```typescript
interface UserParams {
  id: string
}

this.route.params.subscribe((params: UserParams) => {
  console.log(params.id)
})
```

### 路由守卫

```typescript
// 函数式守卫
export const authGuardFn: CanActivateFn = () => {
  return inject(AuthService).isAuthenticated()
}

// 使用工厂函数
const routes: Routes = [
  {
    path: 'admin',
    canActivate: [authGuard(() => checkAdmin())],
  },
]
```

## 📝 完整示例

```typescript
// app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterOutlet, RouterLink } from '@angular/router'
import { LdRouterService, LdRouterLinkDirective } from '@ldesign/router-angular'
import { Subject, takeUntil } from 'rxjs'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, LdRouterLinkDirective],
  template: `
    <div class="app">
      <nav>
        <a routerLink="/" routerLinkActive="active">首页</a>
        <a ldRouterLink="/about">关于</a>
        <a ldRouterLink="/user/123">用户</a>
      </nav>
      
      <main>
        <router-outlet />
      </main>
      
      <footer>
        <p>当前路径: {{ currentUrl }}</p>
      </footer>
    </div>
  `,
})
export class AppComponent implements OnInit, OnDestroy {
  currentUrl = ''
  private destroy$ = new Subject<void>()

  constructor(private ldRouter: LdRouterService) {}

  ngOnInit() {
    // 监听路由变化
    this.currentUrl = this.ldRouter.currentUrl

    this.ldRouter.meta$
      .pipe(takeUntil(this.destroy$))
      .subscribe(meta => {
        document.title = meta.title || '默认标题'
      })
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT

## 🔗 相关链接

- [@ldesign/router-core](../core)
- [@ldesign/router-vue](../vue)
- [@ldesign/router-react](../react)
- [@ldesign/router-svelte](../svelte)
- [@ldesign/router-solid](../solid)
- [Angular Router 文档](https://angular.io/guide/router)

