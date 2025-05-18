<template>
  <div class="theme-management-container">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <span>主题管理</span>
          <el-button type="primary" @click="handleCreateTheme">添加主题</el-button>
        </div>
      </template>

      <div class="themes-grid">
        <el-row :gutter="20">
          <el-col v-for="theme in themeList" :key="theme.id" :xs="24" :sm="12" :md="8" :lg="6">
            <el-card
              class="theme-card"
              :body-style="{ padding: '0px' }"
              :class="{ 'active-theme': theme.id === currentThemeId }"
            >
              <div class="theme-preview" :style="{ backgroundColor: theme.primary_color }">
                <div class="theme-preview-header" :style="{ backgroundColor: theme.header_color }">
                  <div class="fake-logo" :style="{ color: theme.logo_color }">Logo</div>
                  <div class="fake-menu">
                    <div class="fake-menu-item" :style="{ color: theme.menu_text_color }">菜单1</div>
                    <div class="fake-menu-item" :style="{ color: theme.menu_text_color }">菜单2</div>
                    <div class="fake-menu-item" :style="{ color: theme.menu_text_color }">菜单3</div>
                  </div>
                </div>
                <div class="theme-preview-content" :style="{ backgroundColor: theme.content_bg_color }">
                  <div class="fake-sidebar" :style="{ backgroundColor: theme.sidebar_color }">
                    <div class="fake-sidebar-item" :style="{ color: theme.sidebar_text_color }">侧边栏1</div>
                    <div class="fake-sidebar-item" :style="{ color: theme.sidebar_text_color }">侧边栏2</div>
                    <div class="fake-sidebar-item" :style="{ color: theme.sidebar_text_color }">侧边栏3</div>
                  </div>
                  <div class="fake-content">
                    <div class="fake-content-block" :style="{ backgroundColor: theme.card_color, color: theme.text_color }">内容区域</div>
                  </div>
                </div>
              </div>
              <div class="theme-info">
                <div class="theme-name">{{ theme.name }}</div>
                <div class="theme-description">{{ theme.description }}</div>
              </div>
              <div class="theme-actions">
                <el-button 
                  v-if="theme.id !== currentThemeId" 
                  type="primary" 
                  size="small" 
                  @click="handleApplyTheme(theme)"
                >
                  应用
                </el-button>
                <el-button 
                  v-else 
                  type="success" 
                  size="small" 
                  disabled
                >
                  当前使用
                </el-button>
                <el-button 
                  type="warning" 
                  size="small" 
                  @click="handleEditTheme(theme)"
                >
                  编辑
                </el-button>
                <el-button 
                  v-if="theme.id !== currentThemeId && !theme.is_default" 
                  type="danger" 
                  size="small" 
                  @click="handleDeleteTheme(theme)"
                >
                  删除
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 主题编辑对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑主题' : '创建主题'" 
      width="650px"
      destroy-on-close
    >
      <el-form 
        ref="themeFormRef" 
        :model="themeForm" 
        :rules="themeRules" 
        label-width="100px"
      >
        <el-form-item label="主题名称" prop="name">
          <el-input v-model="themeForm.name" placeholder="请输入主题名称" />
        </el-form-item>
        <el-form-item label="主题描述" prop="description">
          <el-input 
            v-model="themeForm.description" 
            type="textarea" 
            rows="2"
            placeholder="请输入主题描述" 
          />
        </el-form-item>

        <el-divider content-position="center">颜色配置</el-divider>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="主色调" prop="primary_color">
              <el-color-picker v-model="themeForm.primary_color" show-alpha />
              <span class="color-value">{{ themeForm.primary_color }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="文本颜色" prop="text_color">
              <el-color-picker v-model="themeForm.text_color" show-alpha />
              <span class="color-value">{{ themeForm.text_color }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="头部背景色" prop="header_color">
              <el-color-picker v-model="themeForm.header_color" show-alpha />
              <span class="color-value">{{ themeForm.header_color }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Logo颜色" prop="logo_color">
              <el-color-picker v-model="themeForm.logo_color" show-alpha />
              <span class="color-value">{{ themeForm.logo_color }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="菜单文本色" prop="menu_text_color">
              <el-color-picker v-model="themeForm.menu_text_color" show-alpha />
              <span class="color-value">{{ themeForm.menu_text_color }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="内容背景色" prop="content_bg_color">
              <el-color-picker v-model="themeForm.content_bg_color" show-alpha />
              <span class="color-value">{{ themeForm.content_bg_color }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="侧边栏颜色" prop="sidebar_color">
              <el-color-picker v-model="themeForm.sidebar_color" show-alpha />
              <span class="color-value">{{ themeForm.sidebar_color }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="侧边栏文本" prop="sidebar_text_color">
              <el-color-picker v-model="themeForm.sidebar_text_color" show-alpha />
              <span class="color-value">{{ themeForm.sidebar_text_color }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="卡片背景色" prop="card_color">
              <el-color-picker v-model="themeForm.card_color" show-alpha />
              <span class="color-value">{{ themeForm.card_color }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="链接颜色" prop="link_color">
              <el-color-picker v-model="themeForm.link_color" show-alpha />
              <span class="color-value">{{ themeForm.link_color }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="center">预览</el-divider>
        
        <div class="theme-preview-dialog" :style="{ backgroundColor: themeForm.primary_color }">
          <div class="theme-preview-header" :style="{ backgroundColor: themeForm.header_color }">
            <div class="fake-logo" :style="{ color: themeForm.logo_color }">Logo</div>
            <div class="fake-menu">
              <div class="fake-menu-item" :style="{ color: themeForm.menu_text_color }">菜单1</div>
              <div class="fake-menu-item" :style="{ color: themeForm.menu_text_color }">菜单2</div>
              <div class="fake-menu-item" :style="{ color: themeForm.menu_text_color }">菜单3</div>
            </div>
          </div>
          <div class="theme-preview-content" :style="{ backgroundColor: themeForm.content_bg_color }">
            <div class="fake-sidebar" :style="{ backgroundColor: themeForm.sidebar_color }">
              <div class="fake-sidebar-item" :style="{ color: themeForm.sidebar_text_color }">侧边栏1</div>
              <div class="fake-sidebar-item" :style="{ color: themeForm.sidebar_text_color }">侧边栏2</div>
              <div class="fake-sidebar-item" :style="{ color: themeForm.sidebar_text_color }">侧边栏3</div>
            </div>
            <div class="fake-content">
              <div class="fake-card" :style="{ backgroundColor: themeForm.card_color }">
                <h3 :style="{ color: themeForm.text_color }">内容标题</h3>
                <p :style="{ color: themeForm.text_color }">这是一段内容文本</p>
                <a :style="{ color: themeForm.link_color }">这是一个链接</a>
              </div>
            </div>
          </div>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitThemeForm">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 表单引用
const themeFormRef = ref(null)
// 对话框显示状态
const dialogVisible = ref(false)
// 是否是编辑模式
const isEdit = ref(false)

// 当前使用的主题ID
const currentThemeId = ref(1)

// 主题列表数据
const themeList = ref([
  {
    id: 1,
    name: '默认主题',
    description: '系统默认主题样式',
    is_default: true,
    primary_color: '#409EFF',
    text_color: '#303133',
    header_color: '#242f42',
    logo_color: '#ffffff',
    menu_text_color: '#ffffff',
    content_bg_color: '#f0f2f5',
    sidebar_color: '#304156',
    sidebar_text_color: '#ffffff',
    card_color: '#ffffff',
    link_color: '#409EFF'
  },
  {
    id: 2,
    name: '暗黑模式',
    description: '低亮度护眼主题',
    is_default: false,
    primary_color: '#409EFF',
    text_color: '#E5EAF3',
    header_color: '#18222c',
    logo_color: '#E5EAF3',
    menu_text_color: '#E5EAF3',
    content_bg_color: '#141414',
    sidebar_color: '#1f2d3d',
    sidebar_text_color: '#E5EAF3',
    card_color: '#1d1e1f',
    link_color: '#409EFF'
  },
  {
    id: 3,
    name: '薄荷绿',
    description: '清新淡雅绿色主题',
    is_default: false,
    primary_color: '#00b96b',
    text_color: '#303133',
    header_color: '#00b96b',
    logo_color: '#ffffff',
    menu_text_color: '#ffffff',
    content_bg_color: '#f0f9eb',
    sidebar_color: '#263238',
    sidebar_text_color: '#ffffff',
    card_color: '#ffffff',
    link_color: '#00b96b'
  },
  {
    id: 4,
    name: '海洋蓝',
    description: '深邃大气蓝色主题',
    is_default: false,
    primary_color: '#1890ff',
    text_color: '#303133',
    header_color: '#1e88e5',
    logo_color: '#ffffff',
    menu_text_color: '#ffffff',
    content_bg_color: '#f5f5f5',
    sidebar_color: '#001529',
    sidebar_text_color: '#ffffff',
    card_color: '#ffffff',
    link_color: '#1890ff'
  }
])

// 主题表单
const themeForm = reactive({
  id: null,
  name: '',
  description: '',
  is_default: false,
  primary_color: '#409EFF',
  text_color: '#303133',
  header_color: '#242f42',
  logo_color: '#ffffff',
  menu_text_color: '#ffffff',
  content_bg_color: '#f0f2f5',
  sidebar_color: '#304156',
  sidebar_text_color: '#ffffff',
  card_color: '#ffffff',
  link_color: '#409EFF'
})

// 表单验证规则
const themeRules = {
  name: [
    { required: true, message: '请输入主题名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入主题描述', trigger: 'blur' },
    { max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' }
  ],
  primary_color: [
    { required: true, message: '请选择主色调', trigger: 'change' }
  ],
  text_color: [
    { required: true, message: '请选择文本颜色', trigger: 'change' }
  ],
  header_color: [
    { required: true, message: '请选择头部背景色', trigger: 'change' }
  ],
  logo_color: [
    { required: true, message: '请选择Logo颜色', trigger: 'change' }
  ],
  menu_text_color: [
    { required: true, message: '请选择菜单文本色', trigger: 'change' }
  ],
  content_bg_color: [
    { required: true, message: '请选择内容背景色', trigger: 'change' }
  ],
  sidebar_color: [
    { required: true, message: '请选择侧边栏颜色', trigger: 'change' }
  ],
  sidebar_text_color: [
    { required: true, message: '请选择侧边栏文本颜色', trigger: 'change' }
  ],
  card_color: [
    { required: true, message: '请选择卡片背景色', trigger: 'change' }
  ],
  link_color: [
    { required: true, message: '请选择链接颜色', trigger: 'change' }
  ]
}

// 编辑主题
const handleEditTheme = (theme) => {
  isEdit.value = true
  Object.assign(themeForm, { ...theme })
  dialogVisible.value = true
}

// 创建主题
const handleCreateTheme = () => {
  isEdit.value = false
  Object.assign(themeForm, {
    id: null,
    name: '',
    description: '',
    is_default: false,
    primary_color: '#409EFF',
    text_color: '#303133',
    header_color: '#242f42',
    logo_color: '#ffffff',
    menu_text_color: '#ffffff',
    content_bg_color: '#f0f2f5',
    sidebar_color: '#304156',
    sidebar_text_color: '#ffffff',
    card_color: '#ffffff',
    link_color: '#409EFF'
  })
  dialogVisible.value = true
}

// 删除主题
const handleDeleteTheme = async (theme) => {
  try {
    await ElMessageBox.confirm(`确定要删除主题"${theme.name}"吗？此操作不可恢复！`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 实际项目中应调用API删除主题
    // await deleteTheme(theme.id)
    
    // 模拟删除
    const index = themeList.value.findIndex(item => item.id === theme.id)
    if (index !== -1) {
      themeList.value.splice(index, 1)
    }
    
    ElMessage.success('删除主题成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除主题失败', error)
      ElMessage.error('删除主题失败')
    }
  }
}

// 应用主题
const handleApplyTheme = async (theme) => {
  try {
    await ElMessageBox.confirm(`确定要应用主题"${theme.name}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })
    
    // 实际项目中应调用API应用主题
    // await applyTheme(theme.id)
    
    // 模拟应用
    currentThemeId.value = theme.id
    
    // 应用主题颜色到全局CSS变量
    document.documentElement.style.setProperty('--el-color-primary', theme.primary_color)
    
    ElMessage.success(`主题"${theme.name}"应用成功`)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('应用主题失败', error)
      ElMessage.error('应用主题失败')
    }
  }
}

// 提交主题表单
const submitThemeForm = async () => {
  if (!themeFormRef.value) return
  
  try {
    await themeFormRef.value.validate()
    
    if (isEdit.value) {
      // 实际项目中应调用API更新主题
      // await updateTheme(themeForm)
      
      // 模拟更新
      const index = themeList.value.findIndex(item => item.id === themeForm.id)
      if (index !== -1) {
        themeList.value[index] = { ...themeForm }
      }
      
      ElMessage.success('更新主题成功')
    } else {
      // 实际项目中应调用API创建主题
      // const res = await createTheme(themeForm)
      
      // 模拟创建
      const newTheme = {
        ...themeForm,
        id: themeList.value.length + 1,
        is_default: false
      }
      themeList.value.push(newTheme)
      
      ElMessage.success('创建主题成功')
    }
    
    dialogVisible.value = false
  } catch (error) {
    console.error('表单验证失败', error)
  }
}

// 生命周期钩子
onMounted(() => {
  // 实际项目中应调用API获取主题列表
  // fetchThemes()
  
  // 实际项目中应调用API获取当前主题
  // fetchCurrentTheme()
})
</script>

<style scoped>
.theme-management-container {
  padding: 20px;
}

.main-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.themes-grid {
  margin-top: 20px;
}

.theme-card {
  margin-bottom: 20px;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.theme-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.active-theme {
  border-color: #67C23A;
}

.theme-preview {
  height: 180px;
  overflow: hidden;
  border-radius: 4px 4px 0 0;
}

.theme-preview-header {
  height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
}

.fake-logo {
  font-weight: bold;
  font-size: 18px;
}

.fake-menu {
  display: flex;
  gap: 10px;
}

.fake-menu-item {
  font-size: 12px;
}

.theme-preview-content {
  height: 140px;
  display: flex;
}

.fake-sidebar {
  width: 40px;
  height: 100%;
  padding: 5px;
}

.fake-sidebar-item {
  font-size: 10px;
  margin-bottom: 5px;
  text-align: center;
}

.fake-content {
  flex: 1;
  padding: 10px;
}

.fake-content-block {
  height: 50px;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
}

.theme-info {
  padding: 10px;
}

.theme-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.theme-description {
  font-size: 12px;
  color: #909399;
  height: 36px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.theme-actions {
  padding: 10px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

/* 对话框预览样式 */
.theme-preview-dialog {
  width: 100%;
  height: 300px;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 20px;
}

.color-value {
  margin-left: 10px;
  font-size: 12px;
  color: #909399;
}

.fake-card {
  padding: 10px;
  border-radius: 4px;
  height: 100px;
}

.fake-card h3 {
  margin: 0 0 10px 0;
  font-size: 14px;
}

.fake-card p {
  margin: 0 0 10px 0;
  font-size: 12px;
}

.fake-card a {
  font-size: 12px;
  cursor: pointer;
}
</style>
