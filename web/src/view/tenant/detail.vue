<template>
  <div class="tenant-detail-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>租户详情</span>
          <div class="header-actions">
            <el-button type="primary" @click="editTenant">编辑</el-button>
            <el-button @click="goBack">返回列表</el-button>
          </div>
        </div>
      </template>
      
      <el-descriptions 
        :column="2" 
        border
        v-loading="loading"
      >
        <el-descriptions-item label="租户ID">{{ tenantInfo.id }}</el-descriptions-item>
        <el-descriptions-item label="租户名称">{{ tenantInfo.name }}</el-descriptions-item>
        <el-descriptions-item label="租户代码">{{ tenantInfo.code }}</el-descriptions-item>
        <el-descriptions-item label="域名">{{ tenantInfo.domain }}</el-descriptions-item>
        <el-descriptions-item label="联系人">{{ tenantInfo.contact_person }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ tenantInfo.contact_phone }}</el-descriptions-item>
        <el-descriptions-item label="联系邮箱">{{ tenantInfo.contact_email }}</el-descriptions-item>
        <el-descriptions-item label="管理员">{{ tenantInfo.admin_name }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(tenantInfo.status)">
            {{ formatStatus(tenantInfo.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ tenantInfo.created_at }}</el-descriptions-item>
        <el-descriptions-item label="到期时间">{{ tenantInfo.expire_at }}</el-descriptions-item>
        <el-descriptions-item label="剩余天数">
          <el-tag :type="getExpiryStatusType(tenantInfo.days_remaining)">
            {{ tenantInfo.days_remaining }} 天
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="用户数量">{{ tenantInfo.user_count }} / {{ tenantInfo.max_users }}</el-descriptions-item>
        <el-descriptions-item label="存储空间">{{ tenantInfo.storage_used }} GB / {{ tenantInfo.storage_limit }} GB</el-descriptions-item>
        <el-descriptions-item label="功能模块" :span="2">
          <el-space wrap>
            <el-tag v-for="module in tenantInfo.modules" :key="module">{{ formatModule(module) }}</el-tag>
          </el-space>
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ tenantInfo.remark || '无' }}</el-descriptions-item>
      </el-descriptions>
      
      <div class="stat-cards">
        <el-row :gutter="20" class="mt-4">
          <el-col :span="8">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>用户统计</span>
                </div>
              </template>
              <div class="stat-value">{{ tenantInfo.user_count }}</div>
              <div class="stat-label">总用户数</div>
              <el-progress 
                :percentage="(tenantInfo.user_count / tenantInfo.max_users) * 100" 
                :format="() => `${Math.round((tenantInfo.user_count / tenantInfo.max_users) * 100)}%`" 
                :stroke-width="10"
              />
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>存储统计</span>
                </div>
              </template>
              <div class="stat-value">{{ tenantInfo.storage_used }} GB</div>
              <div class="stat-label">已用存储空间</div>
              <el-progress 
                :percentage="(tenantInfo.storage_used / tenantInfo.storage_limit) * 100" 
                :format="() => `${Math.round((tenantInfo.storage_used / tenantInfo.storage_limit) * 100)}%`" 
                :stroke-width="10"
              />
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>访问统计</span>
                </div>
              </template>
              <div class="stat-value">{{ tenantInfo.visit_count }}</div>
              <div class="stat-label">总访问次数</div>
              <div class="stat-trend">
                较上月 
                <span :class="tenantInfo.visit_trend > 0 ? 'trend-up' : 'trend-down'">
                  {{ tenantInfo.visit_trend > 0 ? '+' : '' }}{{ tenantInfo.visit_trend }}%
                </span>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      
      <el-divider content-position="left">最近活动</el-divider>
      
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in tenantInfo.activities"
          :key="index"
          :timestamp="activity.time"
          :type="activity.type"
        >
          {{ activity.content }}
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const loading = ref(false)

// 假数据，后续需替换为实际API调用
const tenantInfo = reactive({
  id: 0,
  name: '',
  code: '',
  domain: '',
  contact_person: '',
  contact_phone: '',
  contact_email: '',
  admin_name: '',
  status: '',
  created_at: '',
  expire_at: '',
  days_remaining: 0,
  user_count: 0,
  max_users: 0,
  storage_used: 0,
  storage_limit: 0,
  modules: [],
  remark: '',
  visit_count: 0,
  visit_trend: 0,
  activities: []
})

// 格式化状态
const formatStatus = (status) => {
  const statusMap = {
    active: '启用',
    disabled: '禁用',
    pending: '待审核'
  }
  return statusMap[status] || status
}

// 获取状态标签类型
const getStatusType = (status) => {
  const typeMap = {
    active: 'success',
    disabled: 'danger',
    pending: 'warning'
  }
  return typeMap[status] || 'info'
}

// 获取到期状态标签类型
const getExpiryStatusType = (days) => {
  if (days <= 0) return 'danger'
  if (days <= 30) return 'warning'
  return 'success'
}

// 格式化模块名称
const formatModule = (module) => {
  const moduleMap = {
    content: '内容管理',
    user: '用户管理',
    statistics: '统计分析',
    trade: '交易管理',
    system: '系统设置'
  }
  return moduleMap[module] || module
}

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
        remark: '这是一个示例租户',
        visit_count: 3562,
        visit_trend: 15.8,
        activities: [
          { time: '2023-05-01 10:30:00', type: 'success', content: '租户创建成功' },
          { time: '2023-05-15 14:22:00', type: 'warning', content: '管理员密码修改' },
          { time: '2023-06-10 09:15:00', type: 'primary', content: '存储空间扩容到50GB' },
          { time: '2023-07-08 16:40:00', type: 'info', content: '新增用户20个' }
        ]
      },
      msg: '获取成功'
    }
    
    if (res.code === 0) {
      Object.assign(tenantInfo, res.data)
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

// 编辑租户
const editTenant = () => {
  router.push({
    name: 'editTenant',
    params: { id: route.params.id }
  })
}

// 返回列表
const goBack = () => {
  router.push({ name: 'tenantList' })
}

// 生命周期钩子
onMounted(() => {
  fetchTenantDetail(route.params.id)
})
</script>

<style scoped>
.tenant-detail-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.stat-cards {
  margin-top: 20px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  color: #909399;
  margin-bottom: 10px;
}

.stat-trend {
  margin-top: 10px;
  font-size: 12px;
}

.trend-up {
  color: #67c23a;
}

.trend-down {
  color: #f56c6c;
}

.mt-4 {
  margin-top: 16px;
}
</style>
