<template>
  <div class="create-tenant-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>创建租户</span>
          <el-button @click="goBack">返回列表</el-button>
        </div>
      </template>
      
      <el-form 
        :model="formData" 
        :rules="rules" 
        ref="formRef" 
        label-width="120px"
        status-icon
      >
        <el-form-item label="租户名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入租户名称" />
        </el-form-item>
        
        <el-form-item label="租户代码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入租户代码（英文字母、数字和连字符）">
            <template #append>.{{ baseDomain }}</template>
          </el-input>
          <div class="form-tip">租户代码将用于生成租户的子域名</div>
        </el-form-item>
        
        <el-form-item label="联系人" prop="contact_person">
          <el-input v-model="formData.contact_person" placeholder="请输入联系人姓名" />
        </el-form-item>
        
        <el-form-item label="联系电话" prop="contact_phone">
          <el-input v-model="formData.contact_phone" placeholder="请输入联系电话" />
        </el-form-item>
        
        <el-form-item label="联系邮箱" prop="contact_email">
          <el-input v-model="formData.contact_email" placeholder="请输入联系邮箱" />
        </el-form-item>
        
        <el-form-item label="租户管理员" prop="admin">
          <el-input v-model="formData.admin.username" placeholder="请输入管理员用户名" />
        </el-form-item>
        
        <el-form-item label="管理员密码" prop="admin.password">
          <el-input 
            v-model="formData.admin.password" 
            type="password" 
            placeholder="请输入管理员密码" 
            show-password
          />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="admin.confirm_password">
          <el-input 
            v-model="formData.admin.confirm_password" 
            type="password" 
            placeholder="请再次输入管理员密码" 
            show-password
          />
        </el-form-item>
        
        <el-form-item label="租户状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="disabled">禁用</el-radio>
            <el-radio label="pending">待审核</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="到期时间" prop="expire_at">
          <el-date-picker
            v-model="formData.expire_at"
            type="date"
            placeholder="选择到期时间"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <el-form-item label="租户备注" prop="remark">
          <el-input 
            v-model="formData.remark" 
            type="textarea" 
            rows="4" 
            placeholder="请输入租户备注信息（选填）" 
          />
        </el-form-item>
        
        <el-divider content-position="left">资源配置</el-divider>
        
        <el-form-item label="用户数上限" prop="max_users">
          <el-input-number v-model="formData.max_users" :min="1" :max="99999" />
        </el-form-item>
        
        <el-form-item label="存储空间(GB)" prop="storage_limit">
          <el-input-number v-model="formData.storage_limit" :min="1" :max="10000" />
        </el-form-item>
        
        <el-divider content-position="left">功能模块</el-divider>
        
        <el-form-item label="可用模块" prop="modules">
          <el-checkbox-group v-model="formData.modules">
            <el-checkbox label="content">内容管理</el-checkbox>
            <el-checkbox label="user">用户管理</el-checkbox>
            <el-checkbox label="statistics">统计分析</el-checkbox>
            <el-checkbox label="trade">交易管理</el-checkbox>
            <el-checkbox label="system">系统设置</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitForm">创建租户</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const formRef = ref(null)
const baseDomain = ref('example.com')

// 表单数据
const formData = reactive({
  name: '',
  code: '',
  contact_person: '',
  contact_phone: '',
  contact_email: '',
  admin: {
    username: '',
    password: '',
    confirm_password: ''
  },
  status: 'active',
  expire_at: '',
  remark: '',
  max_users: 100,
  storage_limit: 10,
  modules: ['content', 'user', 'statistics']
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入租户名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度应为2到50个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入租户代码', trigger: 'blur' },
    { pattern: /^[a-z0-9-]+$/, message: '仅允许小写字母、数字和连字符', trigger: 'blur' }
  ],
  contact_person: [
    { required: true, message: '请输入联系人姓名', trigger: 'blur' }
  ],
  contact_phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  contact_email: [
    { required: true, message: '请输入联系邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  'admin.username': [
    { required: true, message: '请输入管理员用户名', trigger: 'blur' },
    { min: 4, max: 20, message: '长度应为4到20个字符', trigger: 'blur' }
  ],
  'admin.password': [
    { required: true, message: '请输入管理员密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度应为6到20个字符', trigger: 'blur' }
  ],
  'admin.confirm_password': [
    { 
      required: true, 
      message: '请再次输入管理员密码', 
      trigger: 'blur' 
    },
    { 
      validator: (rule, value, callback) => {
        if (value !== formData.admin.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  status: [
    { required: true, message: '请选择租户状态', trigger: 'change' }
  ],
  expire_at: [
    { required: true, message: '请选择到期时间', trigger: 'change' }
  ],
  max_users: [
    { required: true, message: '请输入用户数上限', trigger: 'blur' }
  ],
  storage_limit: [
    { required: true, message: '请输入存储空间上限', trigger: 'blur' }
  ],
  modules: [
    { type: 'array', required: true, message: '请至少选择一个功能模块', trigger: 'change' }
  ]
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid, fields) => {
    if (valid) {
      try {
        // 这里将来需要替换为实际的API调用
        // const res = await createTenant(formData)
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        ElMessage.success('租户创建成功')
        router.push({ name: 'tenantList' })
      } catch (error) {
        console.error('创建租户失败:', error)
        ElMessage.error('创建租户失败')
      }
    } else {
      console.log('表单验证失败:', fields)
    }
  })
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
}

// 返回列表
const goBack = () => {
  router.push({ name: 'tenantList' })
}
</script>

<style scoped>
.create-tenant-container {
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
  margin-top: 4px;
}
</style>
