<template>
  <div class="layout-switch-container">
    <el-card class="switch-card">
      <template #header>
        <div class="card-header">
          <span>导航布局切换</span>
        </div>
      </template>
      
      <div class="layout-options">
        <div class="option-item">
          <h3>选择布局模式</h3>
          <div class="options-grid">
            <!-- 传统布局选项 -->
            <div 
              class="layout-option" 
              :class="{ active: !useModernLayout }" 
              @click="selectTraditional"
            >
              <div class="layout-preview traditional">
                <div class="preview-header"></div>
                <div class="preview-body">
                  <div class="preview-sidebar"></div>
                  <div class="preview-content"></div>
                </div>
              </div>
              <div class="option-label">传统布局</div>
              <div class="option-desc">经典的管理界面布局，提供标准的导航和内容区域</div>
            </div>
            
            <!-- 现代化布局选项 -->
            <div 
              class="layout-option" 
              :class="{ active: useModernLayout }" 
              @click="selectModern"
            >
              <div class="layout-preview modern">
                <div class="preview-top-nav"></div>
                <div class="preview-body">
                  <div class="preview-sidebar"></div>
                  <div class="preview-content">
                    <div class="preview-breadcrumb"></div>
                    <div class="preview-main"></div>
                  </div>
                </div>
              </div>
              <div class="option-label">现代化布局</div>
              <div class="option-desc">更加现代的UI设计，提供更好的用户体验和视觉效果</div>
            </div>
          </div>
        </div>
        
        <div class="action-buttons">
          <el-button type="primary" @click="applyChanges">应用更改</el-button>
          <el-button @click="resetChanges">重置</el-button>
        </div>
        
        <el-alert
          v-if="showAlert"
          :title="alertMessage"
          :type="alertType"
          show-icon
          @close="showAlert = false"
        />
      </div>
    </el-card>
    
    <el-card class="features-card mt-4">
      <template #header>
        <div class="card-header">
          <span>布局特性对比</span>
        </div>
      </template>
      
      <el-table :data="featuresData" border stripe>
        <el-table-column prop="feature" label="特性" width="180" />
        <el-table-column prop="traditional" label="传统布局">
          <template #default="scope">
            <el-tag v-if="scope.row.traditional" type="success">支持</el-tag>
            <el-tag v-else type="info">不支持</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="modern" label="现代化布局">
          <template #default="scope">
            <el-tag v-if="scope.row.modern" type="success">支持</el-tag>
            <el-tag v-else type="info">不支持</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 响应式状态
const useModernLayout = ref(false)
const showAlert = ref(false)
const alertMessage = ref('')
const alertType = ref('info')

// 特性对比数据
const featuresData = [
  {
    feature: '多种导航模式',
    traditional: true,
    modern: true,
    description: '支持侧边栏、顶部导航等多种导航模式'
  },
  {
    feature: '折叠侧边栏',
    traditional: true,
    modern: true,
    description: '可以折叠侧边栏以获得更多内容空间'
  },
  {
    feature: '标签页导航',
    traditional: true,
    modern: true,
    description: '支持标签页多页面导航'
  },
  {
    feature: '面包屑导航',
    traditional: true,
    modern: true,
    description: '显示当前页面的层级路径'
  },
  {
    feature: '现代UI设计',
    traditional: false,
    modern: true,
    description: '采用更现代的UI设计和动效'
  },
  {
    feature: '深色模式',
    traditional: true,
    modern: true,
    description: '支持暗黑模式切换'
  },
  {
    feature: '紧凑模式',
    traditional: false,
    modern: true,
    description: '更紧凑的导航布局，提供更多内容空间'
  }
]

// 生命周期钩子
onMounted(() => {
  // 从localStorage中获取当前使用的布局设置
  const storedValue = localStorage.getItem('use-modern-layout')
  useModernLayout.value = storedValue === 'true'
})

// 方法
const selectTraditional = () => {
  useModernLayout.value = false
}

const selectModern = () => {
  useModernLayout.value = true
}

const applyChanges = () => {
  // 保存设置到localStorage
  localStorage.setItem('use-modern-layout', useModernLayout.value)
  
  // 显示提示
  showAlert.value = true
  alertMessage.value = '布局设置已保存，刷新页面后生效'
  alertType.value = 'success'
  
  // 提示用户刷新页面
  ElMessage({
    type: 'success',
    message: '布局设置已更改，请刷新页面以应用新布局',
    duration: 5000,
    showClose: true
  })
}

const resetChanges = () => {
  // 从localStorage中获取当前使用的布局设置
  const storedValue = localStorage.getItem('use-modern-layout')
  useModernLayout.value = storedValue === 'true'
  
  // 显示提示
  showAlert.value = true
  alertMessage.value = '已重置为当前设置'
  alertType.value = 'info'
}
</script>

<style lang="scss" scoped>
.layout-switch-container {
  padding: 20px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 18px;
    font-weight: 500;
  }
  
  .layout-options {
    .option-item {
      margin-bottom: 24px;
      
      h3 {
        margin-bottom: 16px;
        font-size: 16px;
        font-weight: 500;
      }
    }
    
    .options-grid {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      
      .layout-option {
        flex: 1;
        min-width: 280px;
        border: 2px solid #e4e7ed;
        border-radius: 8px;
        padding: 16px;
        cursor: pointer;
        transition: all 0.3s;
        
        &:hover {
          border-color: #c0c4cc;
          box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        }
        
        &.active {
          border-color: var(--el-color-primary);
          
          .option-label {
            color: var(--el-color-primary);
          }
        }
        
        .layout-preview {
          height: 180px;
          margin-bottom: 16px;
          border: 1px solid #ebeef5;
          border-radius: 4px;
          overflow: hidden;
          
          &.traditional {
            display: flex;
            flex-direction: column;
            
            .preview-header {
              height: 40px;
              background-color: #f5f7fa;
              border-bottom: 1px solid #e4e7ed;
            }
            
            .preview-body {
              flex: 1;
              display: flex;
              
              .preview-sidebar {
                width: 60px;
                background-color: #f5f7fa;
                border-right: 1px solid #e4e7ed;
              }
              
              .preview-content {
                flex: 1;
                background-color: #ffffff;
              }
            }
          }
          
          &.modern {
            display: flex;
            flex-direction: column;
            
            .preview-top-nav {
              height: 40px;
              background-color: #409eff;
            }
            
            .preview-body {
              flex: 1;
              display: flex;
              
              .preview-sidebar {
                width: 60px;
                background-color: #001529;
              }
              
              .preview-content {
                flex: 1;
                display: flex;
                flex-direction: column;
                
                .preview-breadcrumb {
                  height: 30px;
                  background-color: #ffffff;
                  border-bottom: 1px solid #ebeef5;
                }
                
                .preview-main {
                  flex: 1;
                  background-color: #f5f7fa;
                }
              }
            }
          }
        }
        
        .option-label {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 8px;
        }
        
        .option-desc {
          color: #606266;
          font-size: 14px;
        }
      }
    }
    
    .action-buttons {
      margin-top: 24px;
      margin-bottom: 16px;
    }
  }
  
  .features-card {
    margin-top: 20px;
  }
  
  .mt-4 {
    margin-top: 20px;
  }
}

:deep(.dark) {
  .layout-option {
    border-color: #303133;
    
    &:hover {
      border-color: #606266;
    }
    
    .layout-preview {
      border-color: #303133;
      
      &.traditional {
        .preview-header, .preview-sidebar {
          background-color: #1f1f1f;
          border-color: #303133;
        }
        
        .preview-content {
          background-color: #141414;
        }
      }
    }
  }
}
</style>
