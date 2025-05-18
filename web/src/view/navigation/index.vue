<template>
  <div class="navigation-page">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="title">导航布局配置</span>
          <el-button type="primary" @click="applyChanges">应用配置</el-button>
        </div>
      </template>
      
      <el-form :model="navConfig" label-width="120px">
        <el-form-item label="导航模式">
          <el-radio-group v-model="navConfig.mode">
            <el-radio-button label="vertical">侧边栏模式</el-radio-button>
            <el-radio-button label="horizontal">顶部模式</el-radio-button>
            <el-radio-button label="combined">组合模式</el-radio-button>
            <el-radio-button label="compact">紧凑模式</el-radio-button>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="主题模式">
          <el-switch
            v-model="navConfig.darkMode"
            active-text="暗黑模式"
            inactive-text="明亮模式"
          />
        </el-form-item>
        
        <el-form-item label="显示标签页">
          <el-switch v-model="navConfig.showTabs" />
        </el-form-item>
        
        <el-form-item label="固定顶栏">
          <el-switch v-model="navConfig.fixedHeader" />
        </el-form-item>
        
        <el-form-item label="显示面包屑">
          <el-switch v-model="navConfig.showBreadcrumb" />
        </el-form-item>
        
        <el-form-item label="侧边栏宽度">
          <el-slider
            v-model="navConfig.sidebarWidth"
            :min="180"
            :max="300"
            :step="10"
            show-input
          />
        </el-form-item>
        
        <el-form-item label="主题色">
          <el-color-picker v-model="navConfig.primaryColor" />
        </el-form-item>
      </el-form>
      
      <div class="preview-section">
        <h3>预览效果</h3>
        <div class="preview-container" :class="{ 'dark-preview': navConfig.darkMode }">
          <div class="preview-frame">
            <!-- 顶部模式预览 -->
            <div v-if="navConfig.mode === 'horizontal'" class="horizontal-preview preview-box">
              <div class="preview-header"></div>
              <div class="preview-content">
                <div class="preview-main"></div>
              </div>
            </div>
            
            <!-- 侧边栏模式预览 -->
            <div v-else-if="navConfig.mode === 'vertical'" class="vertical-preview preview-box">
              <div class="preview-sidebar"></div>
              <div class="preview-content">
                <div class="preview-main"></div>
              </div>
            </div>
            
            <!-- 组合模式预览 -->
            <div v-else-if="navConfig.mode === 'combined'" class="combined-preview preview-box">
              <div class="preview-header"></div>
              <div class="preview-body">
                <div class="preview-sidebar"></div>
                <div class="preview-content">
                  <div class="preview-main"></div>
                </div>
              </div>
            </div>
            
            <!-- 紧凑模式预览 -->
            <div v-else-if="navConfig.mode === 'compact'" class="compact-preview preview-box">
              <div class="preview-mini-sidebar"></div>
              <div class="preview-sidebar"></div>
              <div class="preview-content">
                <div class="preview-header"></div>
                <div class="preview-main"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
    
    <el-card class="box-card mt-4">
      <template #header>
        <div class="card-header">
          <span class="title">导航菜单编辑</span>
          <el-button type="primary" @click="saveMenuChanges">保存菜单</el-button>
        </div>
      </template>
      
      <div class="menu-editor">
        <div class="menu-tree">
          <el-tree
            :data="menuTree"
            node-key="id"
            default-expand-all
            draggable
            :allow-drop="allowDrop"
            :allow-drag="allowDrag"
            @node-drag-end="handleDragEnd"
          >
            <template #default="{ node, data }">
              <div class="custom-tree-node">
                <span>
                  <el-icon v-if="data.meta && data.meta.icon" class="menu-icon">
                    <component :is="data.meta.icon" />
                  </el-icon>
                  <span>{{ data.meta?.title || data.name }}</span>
                </span>
                <span>
                  <el-button
                    type="primary"
                    size="small"
                    text
                    @click="() => editMenu(data)"
                  >
                    编辑
                  </el-button>
                  <el-button
                    type="primary"
                    size="small"
                    text
                    @click="() => addChild(data)"
                  >
                    添加子项
                  </el-button>
                  <el-button
                    v-if="!isRootNode(node)"
                    type="danger"
                    size="small"
                    text
                    @click="() => removeNode(node, data)"
                  >
                    删除
                  </el-button>
                </span>
              </div>
            </template>
          </el-tree>
        </div>
      </div>
    </el-card>
    
    <!-- 菜单编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'edit' ? '编辑菜单' : '添加菜单'"
      width="500px"
    >
      <el-form :model="currentMenu" label-width="100px">
        <el-form-item label="菜单名称">
          <el-input v-model="currentMenu.meta.title" />
        </el-form-item>
        
        <el-form-item label="菜单图标">
          <el-input v-model="currentMenu.meta.icon" placeholder="Element Plus 图标名称" />
        </el-form-item>
        
        <el-form-item label="路由名称">
          <el-input v-model="currentMenu.name" />
        </el-form-item>
        
        <el-form-item label="路由路径">
          <el-input v-model="currentMenu.path" />
        </el-form-item>
        
        <el-form-item label="是否隐藏">
          <el-switch v-model="currentMenu.hidden" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveMenu">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/pinia'
import { useRouterStore } from '@/pinia/modules/router'
import { storeToRefs } from 'pinia'
import { menuApi } from '@/api/menu'

const appStore = useAppStore()
const routerStore = useRouterStore()
const { config, isDark } = storeToRefs(appStore)

// 导航配置
const navConfig = reactive({
  mode: 'vertical',
  darkMode: isDark.value,
  showTabs: config.value.showTabs,
  fixedHeader: true,
  showBreadcrumb: true,
  sidebarWidth: config.value.layout_side_width,
  primaryColor: config.value.color_primary
})

// 菜单相关
const menuTree = ref([])
const dialogVisible = ref(false)
const dialogType = ref('edit') // 'edit' 或 'add'
const currentMenu = ref({})
const parentNode = ref(null)

// 初始化数据
onMounted(async () => {
  // 根据当前配置设置导航模式
  switch(config.value.side_mode) {
    case 'head':
      navConfig.mode = 'horizontal'
      break
    case 'normal':
      navConfig.mode = 'vertical'
      break
    case 'combination':
      navConfig.mode = 'combined'
      break
    case 'sidebar':
      navConfig.mode = 'compact'
      break
  }
  
  // 获取菜单数据
  await loadMenuData()
})

// 加载菜单数据
const loadMenuData = async () => {
  try {
    if (routerStore.asyncRouters && routerStore.asyncRouters.length > 0) {
      // 深拷贝路由数据，避免直接修改原始数据
      menuTree.value = JSON.parse(JSON.stringify(routerStore.asyncRouters[0].children || []))
    } else {
      // 加载路由
      await routerStore.SetAsyncRouter()
      menuTree.value = JSON.parse(JSON.stringify(routerStore.asyncRouters[0].children || []))
    }
  } catch (error) {
    console.error('加载菜单数据失败:', error)
    ElMessage.error('加载菜单数据失败')
  }
}

// 应用配置更改
const applyChanges = () => {
  // 根据配置修改状态
  isDark.value = navConfig.darkMode
  config.value.showTabs = navConfig.showTabs
  config.value.layout_side_width = navConfig.sidebarWidth
  config.value.color_primary = navConfig.primaryColor
  
  // 设置导航模式
  switch(navConfig.mode) {
    case 'horizontal':
      config.value.side_mode = 'head'
      break
    case 'vertical':
      config.value.side_mode = 'normal'
      break
    case 'combined':
      config.value.side_mode = 'combination'
      break
    case 'compact':
      config.value.side_mode = 'sidebar'
      break
  }
  
  // 保存到本地存储
  localStorage.setItem('system-config', JSON.stringify(config.value))
  
  ElMessage.success('配置已应用，部分设置可能需要刷新页面才能生效')
}

// 编辑菜单
const editMenu = (data) => {
  currentMenu.value = JSON.parse(JSON.stringify(data))
  
  // 确保meta对象存在
  if (!currentMenu.value.meta) {
    currentMenu.value.meta = {}
  }
  
  dialogType.value = 'edit'
  dialogVisible.value = true
}

// 添加子菜单
const addChild = (data) => {
  parentNode.value = data
  
  // 创建新菜单项
  currentMenu.value = {
    name: '',
    path: '',
    hidden: false,
    meta: {
      title: '',
      icon: ''
    }
  }
  
  dialogType.value = 'add'
  dialogVisible.value = true
}

// 移除菜单节点
const removeNode = (node, data) => {
  const parent = node.parent
  const children = parent.data.children || parent.data
  const index = children.findIndex(d => d.id === data.id)
  
  if (index !== -1) {
    children.splice(index, 1)
  }
}

// 保存菜单编辑
const saveMenu = () => {
  if (dialogType.value === 'add') {
    // 生成唯一ID
    currentMenu.value.id = generateId()
    
    // 添加到父节点
    if (!parentNode.value.children) {
      parentNode.value.children = []
    }
    
    parentNode.value.children.push(currentMenu.value)
  }
  
  dialogVisible.value = false
}

// 保存菜单更改
const saveMenuChanges = async () => {
  try {
    // 这里应该调用API将菜单保存到后端
    // 在实际项目中，需要根据后端接口进行实现
    
    ElMessage.success('菜单保存成功')
  } catch (error) {
    console.error('保存菜单失败:', error)
    ElMessage.error('保存菜单失败')
  }
}

// 工具函数
const generateId = () => {
  return 'menu_' + Date.now() + '_' + Math.floor(Math.random() * 1000)
}

const isRootNode = (node) => {
  return node.level === 1
}

const allowDrop = (draggingNode, dropNode, type) => {
  // 防止将节点拖动到非文件夹节点
  return true
}

const allowDrag = (draggingNode) => {
  // 允许所有节点拖动
  return true
}

const handleDragEnd = (draggingNode, dropNode, dropType, ev) => {
  // 拖拽结束后的处理
  console.log('drag end', draggingNode, dropNode, dropType)
}
</script>

<style lang="scss" scoped>
.navigation-page {
  padding: 20px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .title {
      font-size: 18px;
      font-weight: 500;
    }
  }
  
  .preview-section {
    margin-top: 24px;
    
    h3 {
      font-size: 16px;
      margin-bottom: 16px;
    }
    
    .preview-container {
      border: 1px solid #ebeef5;
      border-radius: 4px;
      padding: 20px;
      
      &.dark-preview {
        background-color: #1f1f1f;
        border-color: #303030;
        
        .preview-box {
          .preview-header,
          .preview-sidebar,
          .preview-mini-sidebar {
            background-color: #262626;
          }
          
          .preview-content {
            background-color: #141414;
          }
        }
      }
      
      .preview-frame {
        height: 300px;
        
        .preview-box {
          width: 100%;
          height: 100%;
          display: flex;
          
          // 通用样式
          .preview-header {
            height: 40px;
            background-color: #f5f7fa;
            border-bottom: 1px solid #e4e7ed;
          }
          
          .preview-sidebar {
            width: 200px;
            background-color: #f5f7fa;
            border-right: 1px solid #e4e7ed;
          }
          
          .preview-mini-sidebar {
            width: 64px;
            background-color: #001529;
            border-right: 1px solid #1f1f1f;
          }
          
          .preview-content {
            flex: 1;
            background-color: #fff;
            padding: 10px;
            
            .preview-main {
              height: 100%;
              background-color: #f5f7fa;
              border-radius: 4px;
            }
          }
        }
        
        .horizontal-preview {
          flex-direction: column;
          
          .preview-content {
            flex: 1;
          }
        }
        
        .vertical-preview {
          flex-direction: row;
        }
        
        .combined-preview {
          flex-direction: column;
          
          .preview-body {
            display: flex;
            flex: 1;
          }
        }
        
        .compact-preview {
          .preview-content {
            flex-direction: column;
            display: flex;
            
            .preview-main {
              flex: 1;
            }
          }
        }
      }
    }
  }
  
  .menu-editor {
    .menu-tree {
      .custom-tree-node {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-right: 8px;
        
        .menu-icon {
          margin-right: 6px;
        }
      }
    }
  }
}
</style>
