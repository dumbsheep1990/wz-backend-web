<template>
  <div class="edit-tenant-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>编辑租户</span>
          <el-button @click="goBack">返回详情</el-button>
        </div>
      </template>
      
      <el-form 
        v-loading="loading"
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
          <el-input v-model="formData.code" placeholder="请输入租户代码（英文字母、数字和连字符）" disabled>
            <template #append>.{{ baseDomain }}</template>
          </el-input>
          <div class="form-tip">租户代码一旦创建不可修改</div>
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
        
        <el-form-item label="重置管理员密码" prop="reset_password">
          <el-switch v-model="resetPassword" />
        </el-form-item>
        
        <template v-if="resetPassword">
          <el-form-item label="新密码" prop="admin.password">
            <el-input 
              v-model="formData.admin.password" 
              type="password" 
              placeholder="请输入新密码" 
              show-password
            />
          </el-form-item>
          
          <el-form-item label="确认新密码" prop="admin.confirm_password">
            <el-input 
              v-model="formData.admin.confirm_password" 
              type="password" 
              placeholder="请再次输入新密码" 
              show-password
            />
          </el-form-item>
        </template>
        
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
          <div class="form-tip">当前用户数: {{ currentUserCount }} 人</div>
        </el-form-item>
        
        <el-form-item label="存储空间(GB)" prop="storage_limit">
          <el-input-number v-model="formData.storage_limit" :min="1" :max="10000" />
          <div class="form-tip">当前已使用: {{ currentStorageUsed }} GB</div>
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
          <el-button type="primary" @click="submitForm">保存修改</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const formRef = ref(null)
const loading = ref(false)
const resetPassword = ref(false)
const baseDomain = ref('example.com')
const currentUserCount = ref(0)
const currentStorageUsed = ref(0)

// 表单数据
const formData = reactive({
  name: '',
  code: '',
  contact_person: '',
  contact_phone: '',
  contact_email: '',
  admin: {
    password: '',
    confirm_password: ''
  },
  status: 'active',
  expire_at: '',
  remark: '',
  max_users: 100,
  storage_limit: 10,
  modules: []
})

// 计算属性：表单规则
const rules = computed(() => {
  const baseRules = {
    name: [
      { required: true, message: '请输入租户名称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度应为2到50个字符', trigger: 'blur' }
    ],
    code: [
      { required: true, message: '请输入租户代码', trigger: 'blur' }
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
  
  // 仅在重置密码时添加密码相关验证规则
  if (resetPassword.value) {
    baseRules['admin.password'] = [
      { required: true, message: '请输入新密码', trigger: 'blur' },
      { min: 6, max: 20, message: '长度应为6到20个字符', trigger: 'blur' }
    ]
    baseRules['admin.confirm_password'] = [
      { 
        required: true, 
        message: '请再次输入新密码', 
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
    ]
  }
  
  return baseRules
})

// 获取租户详情
const fetchTenantDetail = async (id) => {
  loading.value = true
  try {
    // 这里将来需要替换为实际的API调用
    // const res = await getTenantDetail(id)
    
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟数据
    const res = {
      code: 0,
      data: {
        id: parseInt(id),
        name: '示例租户',
        code: 'example-tenant',
        domain: 'example-tenant.example.com',
        contact_person: '张三',
        contact_phone: '13800138000',
        contact_email: 'zhangsan@example.com',
        admin_name: 'admin',
        status: 'active',
        created_at: '2023-01-01',
        expire_at: '2026-01-01',
        days_remaining: 243,
        user_count: 78,
        max_users: 200,
        storage_used: 5.8,
        storage_limit: 50,
        modules: ['content', 'user', 'statistics', 'trade'],
        remark: '这是一个示例租户'
      },
      msg: '获取成功'
    }
    
    if (res.code === 0) {
      // 更新表单数据
      formData.name = res.data.name
      formData.code = res.data.code
      formData.contact_person = res.data.contact_person
      formData.contact_phone = res.data.contact_phone
      formData.contact_email = res.data.contact_email
      formData.status = res.data.status
      formData.expire_at = res.data.expire_at
      formData.max_users = res.data.max_users
      formData.storage_limit = res.data.storage_limit
      formData.modules = res.data.modules
      formData.remark = res.data.remark
      
      // 更新用户数和存储空间使用情况
      currentUserCount.value = res.data.user_count
      currentStorageUsed.value = res.data.storage_used
    } else {
      ElMessage.error(res.msg || '获取租户详情失败')
    }
  } catch (error) {
    console.error('获取租户详情失败:', error)
    ElMessage.error('获取租户详情失败')
  } finally {
    loading.value = false
  }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid, fields) => {
    if (valid) {
      try {
        loading.value = true
        
        // 构建提交的数据
        const submitData = { ...formData }
        
        // 如果没有重置密码，删除密码相关字段
        if (!resetPassword.value) {
          delete submitData.admin
        }
        
        // 这里将来需要替换为实际的API调用
        // const res = await updateTenant(route.params.id, submitData)
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        ElMessage.success('租户信息更新成功')
        router.push({ 
          name: 'tenantDetail', 
          params: { id: route.params.id } 
        })
      } catch (error) {
        console.error('更新租户信息失败:', error)
        ElMessage.error('更新租户信息失败')
      } finally {
        loading.value = false
      }
    } else {
      console.log('表单验证失败:', fields)
    }
  })
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  resetPassword.value = false
}

// 返回详情
const goBack = () => {
  router.push({ 
    name: 'tenantDetail', 
    params: { id: route.params.id } 
  })
}

// 生命周期钩子
onMounted(() => {
  fetchTenantDetail(route.params.id)
})
</script>

<style scoped>
.edit-tenant-container {
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
