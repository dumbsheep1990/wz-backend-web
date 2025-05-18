<template>
  <div class="navigation-guide">
    <el-card class="guide-card">
      <template #header>
        <div class="card-header">
          <span>导航布局使用指南</span>
        </div>
      </template>
      
      <div class="guide-content">
        <h3>导航布局系统说明</h3>
        <p>本系统提供了多种导航布局模式，可以根据您的使用习惯和需求进行选择。通过"布局切换"页面，您可以随时切换不同的导航布局风格。</p>
        
        <el-divider />
        
        <div class="guide-section">
          <h4>可用的导航模式</h4>
          <el-descriptions border direction="vertical">
            <el-descriptions-item label="传统布局">
              经典的管理后台布局，侧边栏导航，顶部为应用栏，适合常规使用场景
            </el-descriptions-item>
            <el-descriptions-item label="现代化布局">
              采用更现代的设计风格，提供多种导航显示模式，包括：
              <ul class="mt-2">
                <li><strong>侧边栏模式</strong> - 导航菜单在左侧</li>
                <li><strong>顶部模式</strong> - 导航菜单在顶部</li>
                <li><strong>组合模式</strong> - 主导航在顶部，子导航在左侧</li>
                <li><strong>紧凑模式</strong> - 侧边导航收起为图标，更节省空间</li>
              </ul>
            </el-descriptions-item>
          </el-descriptions>
        </div>
        
        <el-divider />
        
        <div class="guide-section">
          <h4>如何切换布局</h4>
          <ol class="steps-list">
            <li>
              <div class="step">
                <span class="step-number">1</span>
                <span class="step-text">进入"导航管理 > 布局切换"页面</span>
              </div>
            </li>
            <li>
              <div class="step">
                <span class="step-number">2</span>
                <span class="step-text">选择您喜欢的布局模式</span>
              </div>
            </li>
            <li>
              <div class="step">
                <span class="step-number">3</span>
                <span class="step-text">点击"应用更改"按钮</span>
              </div>
            </li>
            <li>
              <div class="step">
                <span class="step-number">4</span>
                <span class="step-text">刷新页面以应用新布局</span>
              </div>
            </li>
          </ol>
        </div>
        
        <el-divider />
        
        <div class="guide-section">
          <h4>定制导航菜单</h4>
          <p>通过"现代化导航"页面，您可以进行以下操作：</p>
          <ul class="feature-list">
            <li>调整导航模式（侧边栏、顶部、组合、紧凑）</li>
            <li>调整侧边栏宽度</li>
            <li>更改主题颜色</li>
            <li>启用/禁用标签页</li>
            <li>启用/禁用面包屑导航</li>
          </ul>
        </div>
        
        <el-divider />
        
        <div class="guide-section text-center">
          <el-button type="primary" @click="navigateToLayoutSwitch">前往布局切换</el-button>
          <el-button @click="navigateToModernNav">前往现代化导航设置</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateToLayoutSwitch = () => {
  router.push({ name: 'layoutSwitch' })
}

const navigateToModernNav = () => {
  router.push({ name: 'modernNavigation' })
}
</script>

<style lang="scss" scoped>
.navigation-guide {
  padding: 20px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 18px;
    font-weight: 500;
  }
  
  .guide-content {
    h3 {
      margin-top: 0;
      margin-bottom: 16px;
      font-size: 18px;
      font-weight: 500;
    }
    
    h4 {
      margin-top: 0;
      margin-bottom: 16px;
      font-size: 16px;
      font-weight: 500;
    }
    
    p {
      margin-bottom: 16px;
      line-height: 1.6;
    }
  }
  
  .guide-section {
    margin-bottom: 24px;
  }
  
  .steps-list {
    padding-left: 0;
    list-style: none;
    
    li {
      margin-bottom: 12px;
    }
    
    .step {
      display: flex;
      align-items: center;
      
      .step-number {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: var(--el-color-primary);
        color: white;
        font-weight: bold;
        margin-right: 12px;
      }
      
      .step-text {
        line-height: 1.6;
      }
    }
  }
  
  .feature-list {
    padding-left: 20px;
    
    li {
      margin-bottom: 8px;
      line-height: 1.6;
    }
  }
  
  .text-center {
    text-align: center;
  }
  
  .mt-2 {
    margin-top: 8px;
  }
}

:deep(.dark) {
  .navigation-guide {
    .card-header, .guide-content h3, .guide-content h4 {
      color: #e0e0e0;
    }
  }
}
</style>
