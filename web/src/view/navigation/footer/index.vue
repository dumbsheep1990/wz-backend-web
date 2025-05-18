<template>
  <div class="footer-navigation-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>底部导航管理</span>
          <el-button type="primary" @click="handleAddFooterItem">添加导航项</el-button>
        </div>
      </template>
      
      <el-alert
        title="底部导航配置说明"
        type="info"
        description="底部导航通常显示在网站的底部区域，包含网站地图、联系方式、版权信息等内容，适用于帮助用户了解网站结构和提供快速访问链接。"
        show-icon
        :closable="false"
        style="margin-bottom: 20px"
      />
      
      <div class="footer-preview">
        <h3>底部导航预览</h3>
        <div class="preview-container">
          <div class="footer-section" v-for="(section, sectionIndex) in footerConfig" :key="'section-' + sectionIndex">
            <div class="section-title">{{ section.title }}</div>
            <ul class="section-links">
              <li v-for="(item, itemIndex) in section.items" :key="'item-' + itemIndex">
                {{ item.title }}
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="config-section">
        <el-table
          :data="footerConfig"
          style="width: 100%"
          row-key="id"
        >
          <el-table-column label="排序" width="80">
            <template #default="scope">
              <el-input-number
                v-model="scope.row.order"
                :min="1"
                :max="99"
                size="small"
                @change="handleOrderChange"
              />
            </template>
          </el-table-column>
          <el-table-column prop="title" label="分区标题" width="180">
            <template #default="scope">
              <el-input v-model="scope.row.title" placeholder="请输入分区标题" />
            </template>
          </el-table-column>
          <el-table-column label="导航项">
            <template #default="scope">
              <div class="nested-items">
                <div v-for="(item, index) in scope.row.items" :key="index" class="nested-item">
                  <el-input
                    v-model="item.title"
                    placeholder="导航名称"
                    class="item-title-input"
                  />
                  <el-input
                    v-model="item.link"
                    placeholder="链接地址"
                    class="item-link-input"
                  />
                  <el-tooltip content="删除导航项" placement="top">
                    <el-button
                      type="danger"
                      circle
                      icon="delete"
                      size="small"
                      @click="removeFooterItem(scope.row, index)"
                    />
                  </el-tooltip>
                </div>
                <el-button
                  type="primary"
                  plain
                  icon="plus"
                  size="small"
                  @click="addFooterItem(scope.row)"
                  style="margin-top: 10px"
                >
                  添加导航项
                </el-button>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button
                type="danger"
                size="small"
                @click="removeFooterSection(scope.$index)"
              >
                删除分区
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <div class="global-settings">
        <h3>全局设置</h3>
        <el-form :model="globalSettings" label-width="120px">
          <el-form-item label="背景颜色">
            <el-color-picker v-model="globalSettings.backgroundColor" show-alpha />
          </el-form-item>
          <el-form-item label="文字颜色">
            <el-color-picker v-model="globalSettings.textColor" show-alpha />
          </el-form-item>
          <el-form-item label="标题文字颜色">
            <el-color-picker v-model="globalSettings.titleColor" show-alpha />
          </el-form-item>
          <el-form-item label="分割线颜色">
            <el-color-picker v-model="globalSettings.dividerColor" show-alpha />
          </el-form-item>
          <el-form-item label="链接悬停颜色">
            <el-color-picker v-model="globalSettings.hoverColor" show-alpha />
          </el-form-item>
          <el-form-item label="版权信息">
            <el-input v-model="globalSettings.copyright" placeholder="如：© 2023 公司名称，保留所有权利。" />
          </el-form-item>
          <el-form-item label="备案信息">
            <el-input v-model="globalSettings.icp" placeholder="如：京ICP备XXXXXXXX号" />
          </el-form-item>
        </el-form>
      </div>
      
      <div class="control-buttons">
        <el-button type="primary" @click="saveFooterConfig">保存配置</el-button>
        <el-button @click="resetFooterConfig">重置配置</el-button>
      </div>
    </el-card>
    
    <el-dialog
      v-model="sectionDialogVisible"
      title="添加底部导航分区"
      width="500px"
      destroy-on-close
    >
      <el-form :model="newSection" label-width="100px">
        <el-form-item label="分区标题" prop="title">
          <el-input v-model="newSection.title" placeholder="请输入分区标题" />
        </el-form-item>
        <el-form-item label="排序" prop="order">
          <el-input-number v-model="newSection.order" :min="1" :max="99" />
        </el-form-item>
        <div class="nested-items-form">
          <div class="section-title">导航项</div>
          <div v-for="(item, index) in newSection.items" :key="index" class="nested-item">
            <el-input
              v-model="item.title"
              placeholder="导航名称"
              class="item-title-input"
            />
            <el-input
              v-model="item.link"
              placeholder="链接地址"
              class="item-link-input"
            />
            <el-tooltip content="删除导航项" placement="top">
              <el-button
                type="danger"
                circle
                icon="delete"
                size="small"
                @click="newSection.items.splice(index, 1)"
              />
            </el-tooltip>
          </div>
          <el-button
            type="primary"
            plain
            icon="plus"
            size="small"
            @click="newSection.items.push({ title: '', link: '' })"
            style="margin-top: 10px"
          >
            添加导航项
          </el-button>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="sectionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addFooterSection">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Plus } from '@element-plus/icons-vue'

// 底部导航配置数据
const footerConfig = ref([
  {
    id: 1,
    title: '关于我们',
    order: 1,
    items: [
      { title: '公司介绍', link: '/about/company' },
      { title: '团队介绍', link: '/about/team' },
      { title: '发展历程', link: '/about/history' },
      { title: '联系我们', link: '/about/contact' }
    ]
  },
  {
    id: 2,
    title: '帮助中心',
    order: 2,
    items: [
      { title: '常见问题', link: '/help/faq' },
      { title: '使用指南', link: '/help/guide' },
      { title: '账户管理', link: '/help/account' },
      { title: '售后服务', link: '/help/service' }
    ]
  },
  {
    id: 3,
    title: '商务合作',
    order: 3,
    items: [
      { title: '招商加盟', link: '/cooperation/join' },
      { title: '广告投放', link: '/cooperation/advertise' },
      { title: '战略合作', link: '/cooperation/strategic' }
    ]
  },
  {
    id: 4,
    title: '法律法规',
    order: 4,
    items: [
      { title: '服务条款', link: '/legal/terms' },
      { title: '隐私政策', link: '/legal/privacy' },
      { title: '版权声明', link: '/legal/copyright' }
    ]
  }
])

// 全局设置
const globalSettings = reactive({
  backgroundColor: '#242f42',
  textColor: '#ffffff',
  titleColor: '#409EFF',
  dividerColor: '#304156',
  hoverColor: '#67C23A',
  copyright: '© 2023 某某科技有限公司，保留所有权利。',
  icp: '京ICP备12345678号'
})

// 原始配置，用于重置
let originalFooterConfig = []
let originalGlobalSettings = {}

// 添加分区对话框相关
const sectionDialogVisible = ref(false)
const newSection = reactive({
  title: '',
  order: 1,
  items: [
    { title: '', link: '' }
  ]
})

// 初始化
onMounted(() => {
  // 实际项目中应调用API获取底部导航配置
  // fetchFooterConfig()
  
  // 保存原始配置用于重置
  originalFooterConfig = JSON.parse(JSON.stringify(footerConfig.value))
  originalGlobalSettings = JSON.parse(JSON.stringify(globalSettings))
})

// 排序变更处理
const handleOrderChange = () => {
  footerConfig.value.sort((a, b) => a.order - b.order)
}

// 添加导航分区
const handleAddFooterItem = () => {
  // 设置默认排序
  newSection.order = footerConfig.value.length + 1
  sectionDialogVisible.value = true
}

const addFooterSection = () => {
  if (!newSection.title) {
    ElMessage.warning('请输入分区标题')
    return
  }
  
  if (newSection.items.length === 0 || newSection.items.some(item => !item.title)) {
    ElMessage.warning('请至少添加一个有效的导航项')
    return
  }
  
  // 添加新分区
  footerConfig.value.push({
    id: Date.now(),
    title: newSection.title,
    order: newSection.order,
    items: [...newSection.items]
  })
  
  // 重新排序
  footerConfig.value.sort((a, b) => a.order - b.order)
  
  // 重置表单并关闭对话框
  newSection.title = ''
  newSection.order = footerConfig.value.length + 1
  newSection.items = [{ title: '', link: '' }]
  sectionDialogVisible.value = false
  
  ElMessage.success('添加底部导航分区成功')
}

// 移除导航分区
const removeFooterSection = async (index) => {
  try {
    await ElMessageBox.confirm('确定要删除该导航分区吗？此操作将删除该分区下的所有导航项。', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    footerConfig.value.splice(index, 1)
    ElMessage.success('删除导航分区成功')
  } catch (error) {
    // 用户取消删除
  }
}

// 添加导航项
const addFooterItem = (section) => {
  section.items.push({ title: '', link: '' })
}

// 移除导航项
const removeFooterItem = (section, index) => {
  section.items.splice(index, 1)
}

// 保存配置
const saveFooterConfig = async () => {
  try {
    // 验证配置
    if (footerConfig.value.length === 0) {
      ElMessage.warning('至少需要添加一个导航分区')
      return
    }
    
    // 验证所有分区标题和导航项
    for (const section of footerConfig.value) {
      if (!section.title) {
        ElMessage.warning('所有分区必须有标题')
        return
      }
      
      if (section.items.length === 0) {
        ElMessage.warning(`"${section.title}"分区下至少需要添加一个导航项`)
        return
      }
      
      for (const item of section.items) {
        if (!item.title) {
          ElMessage.warning(`"${section.title}"分区下存在未命名的导航项`)
          return
        }
      }
    }
    
    // 实际项目中应调用API保存配置
    // await saveFooterConfiguration({
    //   sections: footerConfig.value,
    //   settings: globalSettings
    // })
    
    // 更新原始配置
    originalFooterConfig = JSON.parse(JSON.stringify(footerConfig.value))
    originalGlobalSettings = JSON.parse(JSON.stringify(globalSettings))
    
    ElMessage.success('保存底部导航配置成功')
  } catch (error) {
    console.error('保存底部导航配置失败', error)
    ElMessage.error('保存底部导航配置失败')
  }
}

// 重置配置
const resetFooterConfig = async () => {
  try {
    await ElMessageBox.confirm('确定要重置底部导航配置吗？所有未保存的更改将会丢失。', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 重置为原始配置
    footerConfig.value = JSON.parse(JSON.stringify(originalFooterConfig))
    Object.assign(globalSettings, originalGlobalSettings)
    
    ElMessage.success('重置底部导航配置成功')
  } catch (error) {
    // 用户取消重置
  }
}
</script>

<style scoped>
.footer-navigation-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-preview {
  margin: 20px 0;
}

.preview-container {
  background-color: v-bind('globalSettings.backgroundColor');
  color: v-bind('globalSettings.textColor');
  padding: 30px 20px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  border-radius: 4px;
  min-height: 200px;
}

.footer-section {
  margin: 0 20px 20px 0;
  min-width: 140px;
}

.section-title {
  font-weight: bold;
  margin-bottom: 10px;
  font-size: 16px;
  color: v-bind('globalSettings.titleColor');
  border-bottom: 1px solid v-bind('globalSettings.dividerColor');
  padding-bottom: 5px;
}

.section-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.section-links li {
  margin-bottom: 8px;
  cursor: pointer;
  font-size: 14px;
}

.section-links li:hover {
  color: v-bind('globalSettings.hoverColor');
}

.nested-items {
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #f8f8f9;
}

.nested-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.item-title-input {
  width: 150px;
  margin-right: 10px;
}

.item-link-input {
  flex: 1;
  margin-right: 10px;
}

.config-section {
  margin-bottom: 30px;
}

.global-settings {
  margin-bottom: 30px;
}

.control-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.nested-items-form {
  margin-top: 20px;
  padding: 15px;
  border: 1px dashed #ccc;
  border-radius: 4px;
}
</style>
