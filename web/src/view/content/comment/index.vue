<template>
  <div class="comment-management-container">
    <el-card class="table-card">
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="内容">
            <el-input v-model="searchForm.content" placeholder="请输入评论内容" clearable />
          </el-form-item>
          <el-form-item label="用户ID">
            <el-input v-model.number="searchForm.userId" placeholder="请输入用户ID" clearable />
          </el-form-item>
          <el-form-item label="文章ID">
            <el-input v-model.number="searchForm.articleId" placeholder="请输入文章ID" clearable />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
              <el-option label="待审核" value="pending" />
              <el-option label="已通过" value="approved" />
              <el-option label="已拒绝" value="rejected" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="action-area">
        <el-button type="success" @click="handleBatchApprove" :disabled="!hasSelection">批量通过</el-button>
        <el-button type="danger" @click="handleBatchReject" :disabled="!hasSelection">批量拒绝</el-button>
      </div>

      <el-table 
        :data="tableData" 
        v-loading="loading" 
        border 
        style="width: 100%"
        :header-cell-style="{ background: '#f8f8f9', color: '#606266' }"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column label="文章信息" min-width="200">
          <template #default="scope">
            <div>
              <div>ID: {{ scope.row.article_id }}</div>
              <div class="text-ellipsis" :title="scope.row.article_title">标题: {{ scope.row.article_title }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="用户信息" min-width="150">
          <template #default="scope">
            <div>
              <div>ID: {{ scope.row.user_id }}</div>
              <div>{{ scope.row.user_name }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="评论内容" min-width="250">
          <template #default="scope">
            <el-tooltip
              class="box-item"
              effect="dark"
              :content="scope.row.content"
              placement="top"
              :hide-after="0"
            >
              <div class="text-ellipsis">{{ scope.row.content }}</div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="likes" label="点赞数" width="80" align="center" />
        <el-table-column prop="replies" label="回复数" width="80" align="center" />
        <el-table-column prop="created_at" label="评论时间" width="180" />
        <el-table-column label="操作" width="240" align="center" fixed="right">
          <template #default="scope">
            <el-button 
              v-if="scope.row.status === 'pending'" 
              size="small" 
              type="success" 
              @click="handleApprove(scope.row)"
            >
              通过
            </el-button>
            <el-button 
              v-if="scope.row.status === 'pending'" 
              size="small" 
              type="danger" 
              @click="handleReject(scope.row)"
            >
              拒绝
            </el-button>
            <el-button 
              size="small" 
              @click="handleView(scope.row)"
            >
              查看
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 评论详情对话框 -->
    <el-dialog 
      v-model="detailDialogVisible" 
      title="评论详情" 
      width="600px"
      destroy-on-close
    >
      <el-descriptions title="基本信息" :column="2" border>
        <el-descriptions-item label="评论ID">{{ currentComment.id }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentComment.status)">
            {{ getStatusText(currentComment.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ currentComment.user_id }}</el-descriptions-item>
        <el-descriptions-item label="用户名称">{{ currentComment.user_name }}</el-descriptions-item>
        <el-descriptions-item label="文章ID">{{ currentComment.article_id }}</el-descriptions-item>
        <el-descriptions-item label="文章标题">{{ currentComment.article_title }}</el-descriptions-item>
        <el-descriptions-item label="点赞数">{{ currentComment.likes }}</el-descriptions-item>
        <el-descriptions-item label="回复数">{{ currentComment.replies }}</el-descriptions-item>
        <el-descriptions-item label="评论时间">{{ currentComment.created_at }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ currentComment.ip_address || '未记录' }}</el-descriptions-item>
        <el-descriptions-item label="评论内容" :span="2">
          <div style="white-space: pre-wrap;">{{ currentComment.content }}</div>
        </el-descriptions-item>
      </el-descriptions>

      <div v-if="currentComment.replies_data && currentComment.replies_data.length > 0" class="replies-section">
        <h3>回复列表</h3>
        <el-table :data="currentComment.replies_data" border style="width: 100%">
          <el-table-column prop="user_name" label="用户" width="120" />
          <el-table-column prop="content" label="回复内容" min-width="200" />
          <el-table-column prop="created_at" label="回复时间" width="180" />
        </el-table>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <template v-if="currentComment.status === 'pending'">
            <el-button type="success" @click="handleApproveInDialog">通过</el-button>
            <el-button type="danger" @click="handleRejectInDialog">拒绝</el-button>
          </template>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  content: '',
  userId: '',
  articleId: '',
  status: ''
})

// 表格数据
const tableData = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const multipleSelection = ref([])

// 评论详情对话框
const detailDialogVisible = ref(false)
const currentComment = reactive({
  id: null,
  user_id: null,
  user_name: '',
  article_id: null,
  article_title: '',
  content: '',
  status: '',
  likes: 0,
  replies: 0,
  created_at: '',
  ip_address: '',
  replies_data: []
})

// 计算属性
const hasSelection = computed(() => multipleSelection.value.length > 0)

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return statusMap[status] || status
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return typeMap[status] || 'info'
}

// 加载评论数据
const loadComments = async () => {
  loading.value = true
  try {
    // 实际项目中应调用API获取评论列表
    // const res = await getCommentList({
    //   page: currentPage.value,
    //   pageSize: pageSize.value,
    //   ...searchForm
    // })
    
    // 模拟数据
    setTimeout(() => {
      // 状态数组
      const statuses = ['pending', 'approved', 'rejected']
      
      const mockData = Array.from({ length: 10 }, (_, index) => ({
        id: 10000 + index,
        user_id: 100 + Math.floor(Math.random() * 100),
        user_name: `用户${100 + Math.floor(Math.random() * 100)}`,
        article_id: 1000 + Math.floor(Math.random() * 50),
        article_title: `这是一篇测试文章，ID为${1000 + Math.floor(Math.random() * 50)}的标题`,
        content: `这是第${index + 1}条评论，内容较长时会被截断并显示为省略号，用户可以通过悬停查看完整内容，或者点击查看按钮在详情对话框中查看。这是随机生成的评论内容，用于测试界面显示效果。`,
        status: statuses[Math.floor(Math.random() * 3)],
        likes: Math.floor(Math.random() * 30),
        replies: Math.floor(Math.random() * 5),
        created_at: '2023-05-18 12:00:00',
        ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`
      }))
      
      tableData.value = mockData
      total.value = 100
      loading.value = false
    }, 500)
  } catch (error) {
    console.error('获取评论列表失败', error)
    ElMessage.error('获取评论列表失败')
    loading.value = false
  }
}

// 表单操作
const handleSearch = () => {
  currentPage.value = 1
  loadComments()
}

const resetForm = () => {
  searchForm.content = ''
  searchForm.userId = ''
  searchForm.articleId = ''
  searchForm.status = ''
  handleSearch()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  loadComments()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  loadComments()
}

const handleSelectionChange = (selection) => {
  multipleSelection.value = selection
}

// 评论操作
const handleView = async (row) => {
  try {
    // 实际项目中应调用API获取评论详情
    // const res = await getCommentDetail(row.id)
    
    // 模拟数据
    Object.assign(currentComment, row, {
      // 模拟回复数据
      replies_data: Array.from({ length: row.replies }, (_, index) => ({
        user_id: 200 + Math.floor(Math.random() * 100),
        user_name: `用户${200 + Math.floor(Math.random() * 100)}`,
        content: `这是对评论${row.id}的第${index + 1}条回复，回复内容示例。`,
        created_at: '2023-05-18 14:00:00'
      }))
    })
    
    detailDialogVisible.value = true
  } catch (error) {
    console.error('获取评论详情失败', error)
    ElMessage.error('获取评论详情失败')
  }
}

const handleApprove = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要通过ID为${row.id}的评论吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })
    
    // 实际项目中应调用API审核评论
    // await approveComment(row.id)
    
    // 模拟更新
    row.status = 'approved'
    ElMessage.success('评论已通过审核')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('审核评论失败', error)
      ElMessage.error('审核评论失败')
    }
  }
}

const handleReject = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要拒绝ID为${row.id}的评论吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 实际项目中应调用API拒绝评论
    // await rejectComment(row.id)
    
    // 模拟更新
    row.status = 'rejected'
    ElMessage.success('评论已拒绝')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('拒绝评论失败', error)
      ElMessage.error('拒绝评论失败')
    }
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除ID为${row.id}的评论吗？此操作不可恢复！`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    })
    
    // 实际项目中应调用API删除评论
    // await deleteComment(row.id)
    
    ElMessage.success('评论已删除')
    loadComments()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评论失败', error)
      ElMessage.error('删除评论失败')
    }
  }
}

const handleBatchApprove = async () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请至少选择一条评论')
    return
  }
  
  const pendingComments = multipleSelection.value.filter(item => item.status === 'pending')
  if (pendingComments.length === 0) {
    ElMessage.warning('已选择的评论中没有待审核的评论')
    return
  }
  
  try {
    await ElMessageBox.confirm(`确定要通过选中的 ${pendingComments.length} 条评论吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })
    
    // 获取选中评论的ID
    const ids = pendingComments.map(item => item.id)
    
    // 实际项目中应调用API批量通过评论
    // await batchApproveComments(ids)
    
    // 模拟更新
    pendingComments.forEach(comment => {
      const index = tableData.value.findIndex(item => item.id === comment.id)
      if (index !== -1) {
        tableData.value[index].status = 'approved'
      }
    })
    
    ElMessage.success('批量通过评论成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量通过评论失败', error)
      ElMessage.error('批量通过评论失败')
    }
  }
}

const handleBatchReject = async () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请至少选择一条评论')
    return
  }
  
  const pendingComments = multipleSelection.value.filter(item => item.status === 'pending')
  if (pendingComments.length === 0) {
    ElMessage.warning('已选择的评论中没有待审核的评论')
    return
  }
  
  try {
    await ElMessageBox.confirm(`确定要拒绝选中的 ${pendingComments.length} 条评论吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 获取选中评论的ID
    const ids = pendingComments.map(item => item.id)
    
    // 实际项目中应调用API批量拒绝评论
    // await batchRejectComments(ids)
    
    // 模拟更新
    pendingComments.forEach(comment => {
      const index = tableData.value.findIndex(item => item.id === comment.id)
      if (index !== -1) {
        tableData.value[index].status = 'rejected'
      }
    })
    
    ElMessage.success('批量拒绝评论成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量拒绝评论失败', error)
      ElMessage.error('批量拒绝评论失败')
    }
  }
}

// 对话框中的操作
const handleApproveInDialog = async () => {
  try {
    // 实际项目中应调用API审核评论
    // await approveComment(currentComment.id)
    
    currentComment.status = 'approved'
    
    // 更新表格中对应的数据
    const index = tableData.value.findIndex(item => item.id === currentComment.id)
    if (index !== -1) {
      tableData.value[index].status = 'approved'
    }
    
    ElMessage.success('评论已通过审核')
  } catch (error) {
    console.error('审核评论失败', error)
    ElMessage.error('审核评论失败')
  }
}

const handleRejectInDialog = async () => {
  try {
    // 实际项目中应调用API拒绝评论
    // await rejectComment(currentComment.id)
    
    currentComment.status = 'rejected'
    
    // 更新表格中对应的数据
    const index = tableData.value.findIndex(item => item.id === currentComment.id)
    if (index !== -1) {
      tableData.value[index].status = 'rejected'
    }
    
    ElMessage.success('评论已拒绝')
  } catch (error) {
    console.error('拒绝评论失败', error)
    ElMessage.error('拒绝评论失败')
  }
}

// 生命周期钩子
onMounted(() => {
  loadComments()
})
</script>

<style scoped>
.comment-management-container {
  padding: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.search-area {
  margin-bottom: 20px;
}

.action-area {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.text-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
}

.replies-section {
  margin-top: 20px;
}
</style>
