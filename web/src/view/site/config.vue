<template>
  <div class="site-config-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>站点基本配置</span>
          <el-button type="primary" @click="submitForm">保存配置</el-button>
        </div>
      </template>
      
      <el-form :model="formData" ref="ruleForm" label-width="120px" :rules="rules">
        <el-tabs v-model="activeTab" type="border-card">
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="basic">
            <el-form-item label="站点名称" prop="siteName">
              <el-input v-model="formData.siteName" placeholder="请输入站点名称" />
            </el-form-item>
            <el-form-item label="站点LOGO">
              <upload-image v-model:imageUrl="formData.siteLogo" :fileSize="512" />
              <div class="form-tip">建议尺寸：200x60px，透明背景</div>
            </el-form-item>
            <el-form-item label="备案号">
              <el-input v-model="formData.icpNumber" placeholder="请输入ICP备案号" />
            </el-form-item>
            <el-form-item label="版权信息">
              <el-input v-model="formData.copyright" placeholder="例如：© 2024 XXX 版权所有" />
            </el-form-item>
          </el-tab-pane>
          
          <!-- SEO设置 -->
          <el-tab-pane label="SEO设置" name="seo">
            <el-form-item label="SEO标题" prop="seoTitle">
              <el-input v-model="formData.seoTitle" placeholder="请输入SEO标题" />
            </el-form-item>
            <el-form-item label="SEO关键词">
              <el-input v-model="formData.seoKeywords" placeholder="请输入SEO关键词，多个关键词用英文逗号分隔" />
            </el-form-item>
            <el-form-item label="SEO描述">
              <el-input v-model="formData.seoDescription" type="textarea" :rows="4" placeholder="请输入SEO描述" />
            </el-form-item>
          </el-tab-pane>
          
          <!-- 联系信息 -->
          <el-tab-pane label="联系信息" name="contact">
            <el-form-item label="联系邮箱">
              <el-input v-model="formData.contactEmail" placeholder="请输入联系邮箱" />
            </el-form-item>
            <el-form-item label="联系电话">
              <el-input v-model="formData.contactPhone" placeholder="请输入联系电话" />
            </el-form-item>
            <el-form-item label="联系地址">
              <el-input v-model="formData.address" placeholder="请输入联系地址" />
            </el-form-item>
          </el-tab-pane>
          
          <!-- 主题设置 -->
          <el-tab-pane label="主题设置" name="theme">
            <el-form-item label="主题">
              <el-select v-model="formData.themeId" placeholder="请选择主题">
                <el-option
                  v-for="item in themeOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                >
                  <div class="theme-option">
                    <div class="theme-preview" v-if="item.preview">
                      <el-image :src="item.preview" fit="cover" style="width:60px;height:40px" />
                    </div>
                    <span>{{ item.name }}</span>
                  </div>
                </el-option>
              </el-select>
              <div class="form-tip">
                <el-link type="primary" @click="$router.push('/site/theme')">主题管理</el-link>
              </div>
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import UploadImage from '@/components/upload/image.vue'
import { getSiteConfig, updateSiteConfig } from '@/api/site' // 需要创建这些API函数
import { getThemes } from '@/api/theme' // 需要创建这些API函数

const activeTab = ref('basic')
const themeOptions = ref([])
const formData = reactive({
  siteName: '',
  siteLogo: '',
  seoTitle: '',
  seoKeywords: '',
  seoDescription: '',
  icpNumber: '',
  copyright: '',
  themeId: 0,
  contactEmail: '',
  contactPhone: '',
  address: ''
})

const rules = {
  siteName: [{ required: true, message: '请输入站点名称', trigger: 'blur' }],
  seoTitle: [{ required: true, message: '请输入SEO标题', trigger: 'blur' }]
}

const ruleForm = ref(null)

// 获取站点配置
const getConfig = async () => {
  try {
    const res = await getSiteConfig()
    if (res.code === 200) {
      Object.assign(formData, res.data)
    }
  } catch (err) {
    console.error(err)
  }
}

// 获取主题列表
const getThemeList = async () => {
  try {
    const res = await getThemes({
      page: 1,
      pageSize: 100,
      status: 1 // 只获取启用的主题
    })
    if (res.code === 200) {
      themeOptions.value = res.data.list || []
    }
  } catch (err) {
    console.error(err)
  }
}

// 提交表单
const submitForm = () => {
  ruleForm.value.validate(async (valid) => {
    if (valid) {
      try {
        const res = await updateSiteConfig(formData)
        if (res.code === 200) {
          ElMessage.success('更新成功')
        }
      } catch (err) {
        console.error(err)
      }
    }
  })
}

onMounted(() => {
  getConfig()
  getThemeList()
})
</script>

<style scoped>
.site-config-container {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 6px;
}
.theme-option {
  display: flex;
  align-items: center;
}
.theme-preview {
  margin-right: 10px;
}
</style> 