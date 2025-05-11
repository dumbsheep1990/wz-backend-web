<template>
  <div class="site-config-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>站点配置</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="handleRefresh">刷新</el-button>
      </div>
      
      <el-form :model="configForm" :rules="rules" ref="configForm" label-width="120px" v-loading="loading">
        <el-tabs v-model="activeTab">
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="basic">
            <el-form-item label="站点名称" prop="site_name">
              <el-input v-model="configForm.site_name" placeholder="请输入站点名称"></el-input>
            </el-form-item>
            
            <el-form-item label="站点LOGO" prop="site_logo">
              <el-input v-model="configForm.site_logo" placeholder="请输入站点LOGO地址">
                <template slot="append">
                  <el-button @click="handleUploadLogo">上传</el-button>
                </template>
              </el-input>
              <div class="logo-preview" v-if="configForm.site_logo">
                <img :src="configForm.site_logo" alt="站点LOGO" style="max-height: 50px; max-width: 200px;">
              </div>
            </el-form-item>
            
            <el-form-item label="版权信息" prop="copyright">
              <el-input v-model="configForm.copyright" placeholder="请输入版权信息"></el-input>
            </el-form-item>
            
            <el-form-item label="ICP备案号" prop="icp_number">
              <el-input v-model="configForm.icp_number" placeholder="请输入ICP备案号"></el-input>
            </el-form-item>
            
            <el-form-item label="主题设置" prop="theme_id">
              <el-select v-model="configForm.theme_id" placeholder="请选择主题" style="width: 100%">
                <el-option
                  v-for="item in themeOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
          </el-tab-pane>
          
          <!-- SEO配置 -->
          <el-tab-pane label="SEO配置" name="seo">
            <el-form-item label="SEO标题" prop="seo_title">
              <el-input v-model="configForm.seo_title" placeholder="请输入SEO标题"></el-input>
            </el-form-item>
            
            <el-form-item label="SEO关键词" prop="seo_keywords">
              <el-input v-model="configForm.seo_keywords" placeholder="请输入SEO关键词，多个关键词用英文逗号分隔"></el-input>
            </el-form-item>
            
            <el-form-item label="SEO描述" prop="seo_description">
              <el-input type="textarea" v-model="configForm.seo_description" rows="4" placeholder="请输入SEO描述"></el-input>
            </el-form-item>
          </el-tab-pane>
          
          <!-- 联系信息 -->
          <el-tab-pane label="联系信息" name="contact">
            <el-form-item label="联系邮箱" prop="contact_email">
              <el-input v-model="configForm.contact_email" placeholder="请输入联系邮箱"></el-input>
            </el-form-item>
            
            <el-form-item label="联系电话" prop="contact_phone">
              <el-input v-model="configForm.contact_phone" placeholder="请输入联系电话"></el-input>
            </el-form-item>
            
            <el-form-item label="联系地址" prop="address">
              <el-input type="textarea" v-model="configForm.address" rows="3" placeholder="请输入联系地址"></el-input>
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
        
        <el-form-item>
          <el-button type="primary" @click="submitForm">保存配置</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { getSiteConfig, updateSiteConfig } from '@/api/site'
import { listThemes, getDefaultTheme } from '@/api/theme'

export default {
  name: 'SiteConfig',
  data() {
    return {
      loading: false,
      activeTab: 'basic',
      configForm: {
        id: null,
        site_name: '',
        site_logo: '',
        seo_title: '',
        seo_keywords: '',
        seo_description: '',
        icp_number: '',
        copyright: '',
        theme_id: null,
        contact_email: '',
        contact_phone: '',
        address: '',
        tenant_id: null
      },
      themeOptions: [],
      rules: {
        site_name: [
          { required: true, message: '请输入站点名称', trigger: 'blur' },
          { max: 50, message: '长度不能超过50个字符', trigger: 'blur' }
        ],
        seo_title: [
          { required: true, message: '请输入SEO标题', trigger: 'blur' },
          { max: 100, message: '长度不能超过100个字符', trigger: 'blur' }
        ],
        contact_email: [
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.fetchConfig()
    this.fetchThemes()
  },
  methods: {
    // 获取站点配置
    fetchConfig() {
      this.loading = true
      getSiteConfig().then(response => {
        this.configForm = response.data
        // 如果没有主题ID，获取默认主题
        if (!this.configForm.theme_id) {
          this.fetchDefaultTheme()
        }
      }).catch(error => {
        console.error('获取站点配置失败', error)
        this.$message.error('获取站点配置失败')
      }).finally(() => {
        this.loading = false
      })
    },
    
    // 获取主题列表
    fetchThemes() {
      listThemes({ status: 1 }).then(response => {
        this.themeOptions = response.data.items || []
      }).catch(error => {
        console.error('获取主题列表失败', error)
        this.$message.error('获取主题列表失败')
      })
    },
    
    // 获取默认主题
    fetchDefaultTheme() {
      getDefaultTheme().then(response => {
        if (response.data) {
          this.configForm.theme_id = response.data.id
        }
      }).catch(error => {
        console.error('获取默认主题失败', error)
      })
    },
    
    // 提交表单
    submitForm() {
      this.$refs.configForm.validate(valid => {
        if (valid) {
          this.loading = true
          updateSiteConfig(this.configForm).then(() => {
            this.$message.success('保存配置成功')
            this.fetchConfig() // 重新获取配置
          }).catch(error => {
            console.error('保存配置失败', error)
            this.$message.error('保存配置失败')
          }).finally(() => {
            this.loading = false
          })
        } else {
          return false
        }
      })
    },
    
    // 重置表单
    resetForm() {
      this.$confirm('确定要重置表单吗？重置后将恢复到上次保存的状态', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.fetchConfig()
      }).catch(() => {
        // 用户取消重置
      })
    },
    
    // 刷新配置
    handleRefresh() {
      this.fetchConfig()
    },
    
    // 上传LOGO
    handleUploadLogo() {
      // 实际情况需要调用文件上传API
      this.$message.info('请集成文件上传功能')
    }
  }
}
</script>

<style scoped>
.site-config-container {
  padding: 20px;
}
.box-card {
  margin-bottom: 20px;
}
.logo-preview {
  margin-top: 10px;
}
</style> 