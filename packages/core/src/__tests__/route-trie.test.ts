/**
 * Trie 树路由匹配器单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RouteTrie } from '../router/route-trie';

describe('RouteTrie', () => {
  let trie: RouteTrie;

  beforeEach(() => {
    trie = new RouteTrie();
  });

  describe('静态路由', () => {
    it('应该能添加和匹配静态路由', () => {
      const handler = { component: 'Home' };
      trie.addRoute('/home', handler);

      const result = trie.match('/home');

      expect(result).not.toBeNull();
      expect(result?.handler).toBe(handler);
      expect(result?.params).toEqual({});
    });

    it('应该能匹配多层静态路由', () => {
      const handler = { component: 'About' };
      trie.addRoute('/about/team', handler);

      const result = trie.match('/about/team');

      expect(result).not.toBeNull();
      expect(result?.handler).toBe(handler);
    });

    it('不应该匹配不存在的路由', () => {
      trie.addRoute('/home', {});

      const result = trie.match('/about');

      expect(result).toBeNull();
    });
  });

  describe('动态路由', () => {
    it('应该能匹配动态参数（:语法）', () => {
      const handler = { component: 'User' };
      trie.addRoute('/users/:id', handler);

      const result = trie.match('/users/123');

      expect(result).not.toBeNull();
      expect(result?.handler).toBe(handler);
      expect(result?.params).toEqual({ id: '123' });
    });

    it('应该能匹配动态参数（{}语法）', () => {
      const handler = { component: 'Post' };
      trie.addRoute('/posts/{postId}', handler);

      const result = trie.match('/posts/456');

      expect(result).not.toBeNull();
      expect(result?.params).toEqual({ postId: '456' });
    });

    it('应该能匹配多个动态参数', () => {
      const handler = { component: 'Comment' };
      trie.addRoute('/posts/:postId/comments/:commentId', handler);

      const result = trie.match('/posts/123/comments/456');

      expect(result).not.toBeNull();
      expect(result?.params).toEqual({
        postId: '123',
        commentId: '456'
      });
    });
  });

  describe('路由优先级', () => {
    it('静态路由应该优先于动态路由', () => {
      const staticHandler = { type: 'static' };
      const dynamicHandler = { type: 'dynamic' };

      trie.addRoute('/users/:id', dynamicHandler);
      trie.addRoute('/users/me', staticHandler);

      const result = trie.match('/users/me');

      expect(result?.handler).toBe(staticHandler);
    });

    it('应该优先匹配更精确的路由', () => {
      const handler1 = { type: 'specific' };
      const handler2 = { type: 'general' };

      trie.addRoute('/api/users/:id', handler2);
      trie.addRoute('/api/users/admin', handler1);

      const result = trie.match('/api/users/admin');

      expect(result?.handler).toBe(handler1);
    });
  });

  describe('命名路由', () => {
    it('应该能通过名称查找路由', () => {
      const handler = { component: 'Profile' };
      trie.addRoute('/users/:id', handler, {}, 'user.profile');

      const node = trie.findByName('user.profile');

      expect(node).not.toBeNull();
      expect(node?.handler).toBe(handler);
    });

    it('应该能生成路由路径', () => {
      trie.addRoute('/users/:id/posts/:postId', {}, {}, 'user.post');

      const path = trie.generatePath('user.post', {
        id: '123',
        postId: '456'
      });

      expect(path).toBe('/users/123/posts/456');
    });
  });

  describe('路由元数据', () => {
    it('应该能存储和检索路由元数据', () => {
      const meta = { requiresAuth: true, roles: ['admin'] };
      trie.addRoute('/admin', {}, meta);

      const result = trie.match('/admin');

      expect(result?.meta).toEqual(meta);
    });
  });

  describe('路由移除', () => {
    it('应该能移除路由', () => {
      trie.addRoute('/home', {});

      const removed = trie.removeRoute('/home');
      const result = trie.match('/home');

      expect(removed).toBe(true);
      expect(result).toBeNull();
    });

    it('移除不存在的路由应该返回false', () => {
      const removed = trie.removeRoute('/nonexistent');

      expect(removed).toBe(false);
    });
  });

  describe('工具方法', () => {
    it('应该能获取所有路由', () => {
      trie.addRoute('/home', { page: 'home' });
      trie.addRoute('/about', { page: 'about' });
      trie.addRoute('/users/:id', { page: 'user' });

      const routes = trie.getAllRoutes();

      expect(routes).toHaveLength(3);
      expect(routes.map(r => r.path)).toContain('/home');
      expect(routes.map(r => r.path)).toContain('/about');
    });

    it('应该能获取路由数量', () => {
      trie.addRoute('/home', {});
      trie.addRoute('/about', {});

      expect(trie.getRouteCount()).toBe(2);
    });

    it('应该能清空所有路由', () => {
      trie.addRoute('/home', {});
      trie.addRoute('/about', {});

      trie.clear();

      expect(trie.getRouteCount()).toBe(0);
      expect(trie.match('/home')).toBeNull();
    });

    it('应该能获取树的统计信息', () => {
      trie.addRoute('/static', {});
      trie.addRoute('/users/:id', {});
      trie.addRoute('/posts/:postId/comments/:commentId', {});

      const stats = trie.getStats();

      expect(stats.totalNodes).toBeGreaterThan(0);
      expect(stats.staticNodes).toBeGreaterThan(0);
      expect(stats.dynamicNodes).toBeGreaterThan(0);
      expect(stats.maxDepth).toBeGreaterThan(0);
    });
  });

  describe('路径规范化', () => {
    it('应该处理前导斜杠', () => {
      trie.addRoute('/home', {});

      expect(trie.match('home')).not.toBeNull();
      expect(trie.match('/home')).not.toBeNull();
    });

    it('应该处理尾部斜杠', () => {
      trie.addRoute('/home', {});

      expect(trie.match('/home/')).not.toBeNull();
    });

    it('应该处理重复斜杠', () => {
      trie.addRoute('/home', {});

      expect(trie.match('//home//')).not.toBeNull();
    });
  });

  describe('性能测试', () => {
    it('应该能快速匹配大量路由', () => {
      // 添加100个路由
      for (let i = 0; i < 100; i++) {
        trie.addRoute(`/route${i}`, { id: i });
      }

      const start = performance.now();
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        trie.match('/route50');
      }

      const time = performance.now() - start;
      const avgTime = time / iterations;

      console.log(`平均匹配时间: ${avgTime.toFixed(4)}ms`);

      // 平均匹配时间应该小于 0.1ms
      expect(avgTime).toBeLessThan(0.1);
    });

    it('Trie树应该比线性查找更快', () => {
      const routes: Array<{ path: string; handler: any }> = [];

      // 准备100个路由
      for (let i = 0; i < 100; i++) {
        const path = `/route${i}`;
        const handler = { id: i };
        routes.push({ path, handler });
        trie.addRoute(path, handler);
      }

      const iterations = 1000;
      const targetPath = '/route50';

      // 测试 Trie 树
      const start1 = performance.now();
      for (let i = 0; i < iterations; i++) {
        trie.match(targetPath);
      }
      const trieTime = performance.now() - start1;

      // 测试线性查找
      const start2 = performance.now();
      for (let i = 0; i < iterations; i++) {
        routes.find(r => r.path === targetPath);
      }
      const linearTime = performance.now() - start2;

      console.log(`Trie 树: ${trieTime.toFixed(2)}ms`);
      console.log(`线性查找: ${linearTime.toFixed(2)}ms`);
      console.log(`性能提升: ${((linearTime - trieTime) / linearTime * 100).toFixed(2)}%`);

      // Trie 树应该更快
      expect(trieTime).toBeLessThan(linearTime);
    });
  });

  describe('边界情况', () => {
    it('应该处理空路径', () => {
      trie.addRoute('/', { page: 'root' });

      const result = trie.match('/');

      expect(result).not.toBeNull();
    });

    it('应该处理非常深的路由', () => {
      const deepPath = '/a/b/c/d/e/f/g/h/i/j';
      trie.addRoute(deepPath, {});

      const result = trie.match(deepPath);

      expect(result).not.toBeNull();
    });

    it('应该处理特殊字符', () => {
      trie.addRoute('/users/:id', {});

      const result = trie.match('/users/user-123-abc');

      expect(result).not.toBeNull();
      expect(result?.params.id).toBe('user-123-abc');
    });
  });
});