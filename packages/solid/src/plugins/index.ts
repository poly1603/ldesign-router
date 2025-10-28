/**
 * @ldesign/router-solid 插件系统
 * 
 * @module plugins
 */

// 预留插件系统接口
export interface RouterPlugin {
  name: string
  install?: (router: any) => void
}


