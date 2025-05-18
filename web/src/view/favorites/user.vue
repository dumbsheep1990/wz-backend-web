<template>
  <div class="user-favorites-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <span class="user-title">用户收藏列表 - {{ userInfo.username || `用户ID: ${userId}` }}</span>
            <el-tag v-if="userInfo.username" class="user-tag">
              {{ userInfo.role || '普通用户' }}
            </el-tag>
          </div>
          <div class="header-actions">
            <el-button @click="refreshData"><el-icon><Refresh /></el-icon> 刷新</el-button>
            <el-button @click="exportUserData"><el-icon><Download /></el-icon> 导出数据</el-button>
            <el-button type="primary" @click="goBack">返回列表</el-button>
          </div>
        </div>
      </template>
      
      <!-- 用户基本信息 -->
      <div class="user-info-section" v-loading="userLoading">
        <el-row :gutter="20">
          <el-col :span="6" :xs="24" :sm="8" :md="6">
            <div class="user-avatar-container">
              <el-avatar :size="100" :src="userInfo.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
              <div class="user-status">
                <el-tag :type="userInfo.status === 'active' ? 'success' : 'danger'">
                  {{ userInfo.status === 'active' ? '正常' : '禁用' }}
                </el-tag>
              </div>
            </div>
          </el-col>
          <el-col :span="18" :xs="24" :sm="16" :md="18">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="用户ID">{{ userInfo.id || userId }}</el-descriptions-item>
              <el-descriptions-item label="用户名">{{ userInfo.username || '未知用户' }}</el-descriptions-item>
              <el-descriptions-item label="邮箱">{{ userInfo.email || '未设置' }}</el-descriptions-item>
              <el-descriptions-item label="注册时间">{{ userInfo.created_at || '未知' }}</el-descriptions-item>
              <el-descriptions-item label="最近登录">{{ userInfo.last_login || '未知' }}</el-descriptions-item>
              <el-descriptions-item label="收藏总数">
                <span class="favorite-count">{{ total }}</span>
              </el-descriptions-item>
            </el-descriptions>
          </el-col>
        </el-row>
      </div>
      
      <!-- 统计概览 -->
      <div class="statistics-overview" v-if="!userLoading">
        <el-divider content-position="left">收藏统计</el-divider>
        <el-row :gutter="20">
          <el-col :span="6" :xs="12" :sm="12" :md="6" v-for="(item, index) in statisticsData" :key="index">
            <div class="stat-item">
              <div class="stat-value">{{ item.value }}</div>
              <div class="stat-title">{{ item.title }}</div>
            </div>
          </el-col>
        </el-row>
      </div>
      
      <!-- 筛选器 -->
      <div class="filter-section" v-if="!userLoading">
        <el-divider content-position="left">筛选条件</el-divider>
        <el-form :inline="true" :model="searchForm" ref="searchFormRef">
          <el-form-item label="内容标题" prop="title">
            <el-input v-model="searchForm.title" placeholder="请输入内容标题" clearable />
          </el-form-item>
          <el-form-item label="内容类型" prop="item_type">
            <el-select v-model="searchForm.item_type" placeholder="请选择内容类型" clearable>
              <el-option label="全部" value="" />
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
      </div>
      
      <!-- 数据表格 -->
      <div class="table-section" v-loading="tableLoading">
        <el-table :data="tableData" border stripe>
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="title" label="内容标题" min-width="240" show-overflow-tooltip>
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
          <el-table-column prop="summary" label="摘要" min-width="200" show-overflow-tooltip />
          <el-table-column prop="created_at" label="收藏时间" width="160" sortable />
          <el-table-column label="操作" width="160" fixed="right">
            <template #default="scope">
              <el-button type="primary" size="small" @click="goToDetail(scope.row.id)">详情</el-button>
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
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Download } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userId = computed(() => route.params.userId)

// 用户信息相关
const userInfo = ref({})
const userLoading = ref(true)

// 统计数据
const statisticsData = ref([
  { title: '文章收藏', value: 0 },
  { title: '视频收藏', value: 0 },
  { title: '商品收藏', value: 0 },
  { title: '课程收藏', value: 0 }
])

// 表格数据相关
const tableData = ref([])
const tableLoading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dateRange = ref([])

// 搜索表单
const searchForm = reactive({
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

// 获取用户信息
const fetchUserInfo = async () => {
  userLoading.value = true
  try {
    // 这里将来需要替换为实际的API调用
    // const res = await getUserInfo(userId.value)
    
    // 模拟API响应
    await new Promise(resolve => setTimeout(resolve, 600))
    const res = {
      code: 0,
      data: {
        id: userId.value,
        username: `用户${userId.value}`,
        email: `user${userId.value}@example.com`,
        avatar: `https://picsum.photos/200?random=${userId.value}`,
        status: 'active',
        role: '普通用户',
        created_at: '2023-05-15',
        last_login: '2025-05-17 10:23:45'
      },
      msg: '获取成功'
    }
    
    if (res.code === 0) {
      userInfo.value = res.data
    }
  } catch (error) {
    console.error('获取用户信息出错:', error)
  } finally {
    userLoading.value = false
  }
}

// 获取用户收藏统计
const fetchUserStatistics = async () => {
  try {
    // 这里将来需要替换为实际的API调用
    // const res = await getUserFavoriteStatistics(userId.value)
    
    // 模拟API响应
    await new Promise(resolve => setTimeout(resolve, 400))
    const res = {
      code: 0,
      data: {
        article: 24,
        video: 18,
        product: 7,
        course: 5,
        other: 3
      },
      msg: '获取成功'
    }
    
    if (res.code === 0) {
      statisticsData.value[0].value = res.data.article
      statisticsData.value[1].value = res.data.video
      statisticsData.value[2].value = res.data.product
      statisticsData.value[3].value = res.data.course
    }
  } catch (error) {
    console.error('获取用户收藏统计出错:', error)
  }
}

// 获取表格数据
const fetchTableData = async () => {
  tableLoading.value = true
  try {
    // 构建查询参数
    const params = {
      page: page.value,
      pageSize: pageSize.value,
      ...searchForm,
      user_id: userId.value
    }

    // 这里将来需要替换为实际的API调用
    // const res = await getUserFavorites(params)
    
    // 模拟API响应
    await new Promise(resolve => setTimeout(resolve, 500))
    const res = {
      code: 0,
      data: {
        list: Array.from({ length: 10 }, (_, index) => ({
          id: 3000 + index,
          user_id: userId.value,
          item_id: 2000 + index,
          item_type: ['article', 'video', 'product', 'course', 'other'][Math.floor(Math.random() * 5)],
          title: `用户${userId.value}的收藏内容 ${index + 1}`,
          cover: `https://example.com/cover/${index + 1}.jpg`,
          summary: `这是用户收藏的内容摘要，提供了内容的简要描述。示例数据 ${index + 1}。`,
          url: `https://example.com/content/${index + 1}`,
          remark: `用户备注 ${index + 1}`,
          created_at: new Date(Date.now() - index * 86400000).toISOString().split('T')[0],
          updated_at: new Date(Date.now() - index * 86400000).toISOString().split('T')[0]
        })),
        total: 57
      },
      msg: '获取成功'
    }

    if (res.code === 0) {
      tableData.value = res.data.list
      total.value = res.data.total
    } else {
      ElMessage.error(res.msg || '获取用户收藏列表失败')
    }
  } catch (error) {
    console.error('获取用户收藏列表出错:', error)
    ElMessage.error('获取用户收藏列表失败')
  } finally {
    tableLoading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  page.value = 1
  fetchTableData()
}

// 重置搜索
const resetSearch = () => {
  searchFormRef.value.resetFields()
  dateRange.value = []
  searchForm.start_date = ''
  searchForm.end_date = ''
  page.value = 1
  fetchTableData()
}

// 页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchTableData()
}

// 页码变化
const handleCurrentChange = (val) => {
  page.value = val
  fetchTableData()
}

// 刷新数据
const refreshData = () => {
  fetchUserInfo()
  fetchUserStatistics()
  fetchTableData()
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
      fetchTableData()
      fetchUserStatistics() // 更新统计数据
    } catch (error) {
      console.error('删除收藏记录失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

// 导出用户数据
const exportUserData = async () => {
  try {
    // 这里将来需要替换为实际的API调用
    ElMessage.success(`已导出用户 ${userInfo.value.username || userId.value} 的收藏数据`)
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

// 返回列表页
const goBack = () => {
  router.push({ name: 'favoritesList' })
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

// 生命周期钩子
onMounted(() => {
  fetchUserInfo()
  fetchUserStatistics()
  fetchTableData()
})
</script>

<style scoped>
.user-favorites-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
}

.user-title {
  font-size: 16px;
  font-weight: bold;
  margin-right: 10px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.user-info-section {
  margin-bottom: 20px;
}

.user-avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.user-status {
  margin-top: 10px;
}

.favorite-count {
  font-weight: bold;
  color: #409EFF;
  font-size: 18px;
}

.statistics-overview {
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  border-radius: 4px;
  background-color: #f8f9fa;
  margin-bottom: 15px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 5px;
}

.stat-title {
  font-size: 14px;
  color: #606266;
}

.filter-section {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    margin-top: 10px;
  }
  
  .user-avatar-container {
    margin-bottom: 20px;
  }
}
</style>
