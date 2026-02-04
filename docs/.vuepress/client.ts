import { defineClientConfig } from 'vuepress/client'
import './styles/index.css'

export default defineClientConfig({
  enhance({ app, router, siteData }) {
    // 客户端增强
  },
  setup() {
    // 组件 setup
  },
  rootComponents: [],
})
