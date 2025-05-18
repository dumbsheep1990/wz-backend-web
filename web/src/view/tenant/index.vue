<template>
  <div class="tenant-container">
    <!-- 搜索区域 -->
    <div class="search-area">
      <el-card>
        <el-form :inline="true" :model="searchForm" ref="searchFormRef">
          <el-form-item label="租户名称" prop="name">
            <el-input v-model="searchForm.name" placeholder="请输入租户名称" clearable />
          </el-form-item>
          <el-form-item label="租户代码" prop="code">
            <el-input v-model="searchForm.code" placeholder="请输入租户代码" clearable />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
              <el-option label="全部" value="" />
              <el-option label="启用" value="active" />
              <el-option label="禁用" value="disabled" />
              <el-option label="待审核" value="pending" />
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间" prop="date_range">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              @change="handleDateRangeChange"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 数据表格 -->
    <el-card class="mt-4">
      <div class="table-operations mb-4">
        <el-button type="primary" @click="createTenant">
          <el-icon><Plus /></el-icon> 创建租户
        </el-button>
        <el-button @click="refreshData">
          <el-icon><Refresh /></el-icon> 刷新
        </el-button>
      </div>

      <el-table 
        :data="tableData" 
        border 
        stripe
        v-loading="loading"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="租户名称" min-width="150">
          <template #default="scope">
            <el-link type="primary" @click="viewTenantDetail(scope.row.id)">{{ scope.row.name }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="租户代码" min-width="120" />
        <el-table-column prop="domain" label="域名" min-width="180" />
        <el-table-column prop="admin_name" label="管理员" min-width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ formatStatus(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="160" sortable />
        <el-table-column prop="expire_at" label="到期时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="viewTenantDetail(scope.row.id)">详情</el-button>
            <el-button type="warning" size="small" @click="editTenant(scope.row.id)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'

const router = useRouter()

// 数据
const tableData = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dateRange = ref([])

// 搜索表单
const searchForm = reactive({
  name: '',
  code: '',
  status: '',
  start_date: '',
  end_date: ''
})
const searchFormRef = ref(null)

// 日期范围变化处理
const handleDateRangeChange = (val) => {
  if (val) {
    searchForm.start_date = val[0]
    searchForm.end_date = val[1]
  } else {
    searchForm.start_date = ''
    searchForm.end_date = ''
  }
}

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

// 搜索处理
const handleSearch = () => {
  page.value = 1
  fetchData()
}

// 重置搜索
const resetSearch = () => {
  searchFormRef.value.resetFields()
  dateRange.value = []
  searchForm.start_date = ''
  searchForm.end_date = ''
  page.value = 1
  fetchData()
}

// 页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchData()
}

// 页码变化
const handleCurrentChange = (val) => {
  page.value = val
  fetchData()
}

// 刷新数据
const refreshData = () => {
  fetchData()
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    // 构建查询参数
    const params = {
      page: page.value,
      pageSize: pageSize.value,
      ...searchForm
    }

    // 这里将来需要替换为实际的API调用
    // const res = await getTenantList(params)
    
    // 模拟API响应
    await new Promise(resolve => setTimeout(resolve, 500))
    const res = {
      code: 0,
      data: {
        list: Array.from({ length: 10 }, (_, index) => ({
          id: index + 1,
          name: `租户${index + 1}`,
          code: `tenant-${index + 1}`,
          domain: `tenant${index + 1}.example.com`,
          admin_name: `管理员${index + 1}`,
          status: ['active', 'disabled', 'pending'][Math.floor(Math.random() * 3)],
          created_at: new Date(Date.now() - index * 86400000).toISOString().split('T')[0],
          expire_at: new Date(Date.now() + (365 - index * 30) * 86400000).toISOString().split('T')[0]
        })),
        total: 28
      },
      msg: '获取成功'
    }

    if (res.code === 0) {
      tableData.value = res.data.list
      total.value = res.data.total
    } else {
      ElMessage.error(res.msg || '获取租户列表失败')
    }
  } catch (error) {
    console.error('获取租户列表出错:', error)
    ElMessage.error('获取租户列表失败')
  } finally {
    loading.value = false
  }
}

// 创建租户
const createTenant = () => {
  router.push({ name: 'createTenant' })
}

// 查看租户详情
const viewTenantDetail = (id) => {
  router.push({
    name: 'tenantDetail',
    params: { id }
  })
}

// 编辑租户
const editTenant = (id) => {
  router.push({
    name: 'editTenant',
    params: { id }
  })
}

// 删除租户
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除租户"${row.name}"吗？此操作不可恢复，并且会删除该租户下的所有数据。`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 这里将来需要替换为实际的API调用
      // await deleteTenant(row.id)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 300))
      
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      console.error('删除租户失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

// 生命周期钩子
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.tenant-container {
  padding: 20px;
}

.search-area {
  margin-bottom: 20px;
}

.table-operations {
  margin-bottom: 15px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.mb-4 {
  margin-bottom: 16px;
}

.mt-4 {
  margin-top: 16px;
}
</style>
