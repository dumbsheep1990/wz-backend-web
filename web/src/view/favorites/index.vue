<template>
  <div class="favorites-container">
    <!-- 搜索区域 -->
    <div class="search-area">
      <el-card>
        <el-form :inline="true" :model="searchForm" ref="searchFormRef">
          <el-form-item label="用户ID" prop="user_id">
            <el-input v-model="searchForm.user_id" placeholder="请输入用户ID" clearable />
          </el-form-item>
          <el-form-item label="用户名" prop="username">
            <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
          </el-form-item>
          <el-form-item label="标题" prop="title">
            <el-input v-model="searchForm.title" placeholder="请输入内容标题" clearable />
          </el-form-item>
          <el-form-item label="内容类型" prop="item_type">
            <el-select v-model="searchForm.item_type" placeholder="请选择内容类型" clearable>
              <el-option label="文章" value="article" />
              <el-option label="视频" value="video" />
              <el-option label="商品" value="product" />
              <el-option label="课程" value="course" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
          <el-form-item label="收藏时间" prop="date_range">
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
        <el-button type="primary" @click="exportData"><el-icon><Download /></el-icon> 导出数据</el-button>
        <el-button type="danger" @click="handleBatchDelete" :disabled="selectedRows.length === 0">
          <el-icon><Delete /></el-icon> 批量删除
        </el-button>
        <el-button @click="refreshData"><el-icon><Refresh /></el-icon> 刷新</el-button>
      </div>

      <el-table 
        :data="tableData" 
        border 
        stripe
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="title" label="内容标题" min-width="200" show-overflow-tooltip>
          <template #default="scope">
            <el-link type="primary" @click="goToDetail(scope.row.id)">{{ scope.row.title }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="item_type" label="内容类型" width="100">
          <template #default="scope">
            <el-tag :type="getItemTypeTag(scope.row.item_type)">
              {{ formatItemType(scope.row.item_type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="summary" label="摘要" min-width="180" show-overflow-tooltip />
        <el-table-column prop="created_at" label="收藏时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="goToDetail(scope.row.id)">详情</el-button>
            <el-button type="info" size="small" @click="viewUserFavorites(scope.row.user_id)">
              该用户收藏
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row.id)">删除</el-button>
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
import { Download, Delete, Refresh } from '@element-plus/icons-vue'

const router = useRouter()

// 数据
const tableData = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const selectedRows = ref([])
const dateRange = ref([])

// 搜索表单
const searchForm = reactive({
  user_id: '',
  username: '',
  title: '',
  item_type: '',
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

// 格式化内容类型
const formatItemType = (type) => {
  const types = {
    article: '文章',
    video: '视频',
    product: '商品',
    course: '课程',
    other: '其他'
  }
  return types[type] || type
}

// 获取内容类型标签样式
const getItemTypeTag = (type) => {
  const types = {
    article: '',
    video: 'success',
    product: 'warning',
    course: 'info',
    other: 'danger'
  }
  return types[type] || ''
}

// 选择项变化处理
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
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
    // const res = await getFavoritesList(params)
    
    // 模拟API响应
    await new Promise(resolve => setTimeout(resolve, 500))
    const res = {
      code: 0,
      data: {
        list: Array.from({ length: 10 }, (_, index) => ({
          id: index + 1,
          user_id: 1000 + index,
          username: `用户${1000 + index}`,
          item_id: 2000 + index,
          item_type: ['article', 'video', 'product', 'course', 'other'][Math.floor(Math.random() * 5)],
          title: `收藏内容标题 ${index + 1}`,
          cover: `https://example.com/cover/${index + 1}.jpg`,
          summary: `这是收藏内容的摘要描述，简要介绍了内容的主要信息。这是示例数据 ${index + 1}。`,
          url: `https://example.com/content/${index + 1}`,
          remark: `用户备注信息 ${index + 1}`,
          created_at: new Date(Date.now() - index * 86400000).toISOString().split('T')[0],
          updated_at: new Date(Date.now() - index * 86400000).toISOString().split('T')[0]
        })),
        total: 100
      },
      msg: '获取成功'
    }

    if (res.code === 0) {
      tableData.value = res.data.list
      total.value = res.data.total
    } else {
      ElMessage.error(res.msg || '获取收藏列表失败')
    }
  } catch (error) {
    console.error('获取收藏列表出错:', error)
    ElMessage.error('获取收藏列表失败')
  } finally {
    loading.value = false
  }
}

// 删除收藏
const handleDelete = (id) => {
  ElMessageBox.confirm('确定要删除该收藏记录吗？此操作不可恢复。', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 这里将来需要替换为实际的API调用
      // await deleteFavorite(id)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 300))
      
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      console.error('删除收藏记录失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请至少选择一条记录')
    return
  }

  const ids = selectedRows.value.map(row => row.id)
  
  ElMessageBox.confirm(`确定要删除选中的 ${ids.length} 条收藏记录吗？此操作不可恢复。`, '批量删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 这里将来需要替换为实际的API调用
      // await batchDeleteFavorites(ids)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      ElMessage.success('批量删除成功')
      fetchData()
    } catch (error) {
      console.error('批量删除收藏记录失败:', error)
      ElMessage.error('批量删除失败')
    }
  }).catch(() => {})
}

// 导出数据
const exportData = async () => {
  try {
    // 这里将来需要替换为实际的API调用
    ElMessage.success('数据导出成功')
  } catch (error) {
    console.error('导出数据失败:', error)
    ElMessage.error('导出数据失败')
  }
}

// 查看详情
const goToDetail = (id) => {
  router.push({
    name: 'favoritesDetail',
    params: { id }
  })
}

// 查看用户收藏
const viewUserFavorites = (userId) => {
  router.push({
    name: 'userFavorites',
    params: { userId }
  })
}

// 生命周期钩子
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.favorites-container {
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
