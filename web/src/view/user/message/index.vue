<template>
  <div class="message-management-container">
    <el-card class="table-card">
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="消息类型">
            <el-select v-model="searchForm.messageType" placeholder="选择消息类型" clearable>
              <el-option label="系统通知" value="system"></el-option>
              <el-option label="活动消息" value="activity"></el-option>
              <el-option label="用户消息" value="user"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="阅读状态">
            <el-select v-model="searchForm.readStatus" placeholder="选择阅读状态" clearable>
              <el-option label="全部" value=""></el-option>
              <el-option label="已读" value="read"></el-option>
              <el-option label="未读" value="unread"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
            ></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="operation-area">
        <el-button type="primary" @click="handleCreateMessage">创建消息</el-button>
        <el-button @click="handleMarkAllRead">全部标为已读</el-button>
      </div>

      <el-table
        :data="messageList"
        border
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column type="selection" width="50"></el-table-column>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="title" label="标题" min-width="180"></el-table-column>
        <el-table-column prop="messageType" label="消息类型" width="120">
          <template #default="scope">
            <el-tag 
              :type="scope.row.messageType === 'system' ? 'danger' : scope.row.messageType === 'activity' ? 'warning' : 'info'"
            >
              {{ scope.row.messageType === 'system' ? '系统通知' : scope.row.messageType === 'activity' ? '活动消息' : '用户消息' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="readStatus" label="阅读状态" width="100">
          <template #default="scope">
            <el-tag 
              :type="scope.row.readStatus === 'read' ? 'success' : 'info'"
              effect="plain"
            >
              {{ scope.row.readStatus === 'read' ? '已读' : '未读' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="发送时间" width="160"></el-table-column>
        <el-table-column label="操作" fixed="right" width="220">
          <template #default="scope">
            <el-button
              size="small"
              type="primary"
              link
              @click="handleViewMessage(scope.row)"
            >查看</el-button>
            <el-button
              size="small"
              type="primary"
              link
              v-if="scope.row.readStatus === 'unread'"
              @click="handleMarkRead(scope.row)"
            >标为已读</el-button>
            <el-button
              size="small"
              type="danger"
              link
              @click="handleDeleteMessage(scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-area">
        <el-pagination
          :current-page="page"
          :page-sizes="[10, 20, 30, 50]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </el-card>

    <!-- 查看消息详情对话框 -->
    <el-dialog
      title="消息详情"
      v-model="viewDialogVisible"
      width="600px"
    >
      <div class="message-detail">
        <h2 class="message-title">{{ currentMessage.title }}</h2>
        <div class="message-meta">
          <span class="message-type">
            <el-tag 
              :type="currentMessage.messageType === 'system' ? 'danger' : currentMessage.messageType === 'activity' ? 'warning' : 'info'"
              size="small"
            >
              {{ currentMessage.messageType === 'system' ? '系统通知' : currentMessage.messageType === 'activity' ? '活动消息' : '用户消息' }}
            </el-tag>
          </span>
          <span class="message-time">{{ currentMessage.createTime }}</span>
        </div>
        <div class="message-content" v-html="currentMessage.content"></div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="viewDialogVisible = false">关闭</el-button>
          <el-button 
            type="primary" 
            v-if="currentMessage.readStatus === 'unread'"
            @click="handleMarkReadAndClose"
          >标为已读</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 创建消息对话框 -->
    <el-dialog
      title="创建消息"
      v-model="createDialogVisible"
      width="600px"
    >
      <el-form
        :model="messageForm"
        label-width="100px"
        :rules="rules"
        ref="messageFormRef"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="messageForm.title" placeholder="请输入标题"></el-input>
        </el-form-item>
        <el-form-item label="消息类型" prop="messageType">
          <el-select v-model="messageForm.messageType" placeholder="选择消息类型">
            <el-option label="系统通知" value="system"></el-option>
            <el-option label="活动消息" value="activity"></el-option>
            <el-option label="用户消息" value="user"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="接收用户" prop="targetUsers">
          <el-select 
            v-model="messageForm.targetUsers" 
            multiple 
            placeholder="选择接收用户（可多选）"
            v-if="messageForm.sendToAll === false"
          >
            <el-option
              v-for="user in userOptions"
              :key="user.value"
              :label="user.label"
              :value="user.value"
            ></el-option>
          </el-select>
          <div v-else class="send-to-all-hint">将发送给所有用户</div>
        </el-form-item>
        <el-form-item label="发送给全部">
          <el-switch v-model="messageForm.sendToAll"></el-switch>
        </el-form-item>
        <el-form-item label="消息内容" prop="content">
          <el-input
            v-model="messageForm.content"
            type="textarea"
            rows="5"
            placeholder="请输入消息内容"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitMessageForm">发送</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 初始数据
const loading = ref(false)
const messageList = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const dateRange = ref([])
const searchForm = reactive({
  messageType: '',
  readStatus: '',
  startDate: '',
  endDate: ''
})

// 监听日期范围变化，更新搜索表单
watch(dateRange, (newValue) => {
  if (newValue && newValue.length === 2) {
    searchForm.startDate = newValue[0]
    searchForm.endDate = newValue[1]
  } else {
    searchForm.startDate = ''
    searchForm.endDate = ''
  }
})

// 查看消息对话框
const viewDialogVisible = ref(false)
const currentMessage = reactive({
  id: '',
  title: '',
  content: '',
  messageType: '',
  readStatus: '',
  createTime: ''
})

// 创建消息对话框
const createDialogVisible = ref(false)
const messageFormRef = ref(null)
const messageForm = reactive({
  title: '',
  messageType: 'system',
  content: '',
  targetUsers: [],
  sendToAll: false
})

// 可选用户列表（模拟数据）
const userOptions = [
  { value: '1', label: '用户1' },
  { value: '2', label: '用户2' },
  { value: '3', label: '用户3' },
  { value: '4', label: '用户4' },
  { value: '5', label: '用户5' }
]

// 表单验证规则
const rules = reactive({
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  messageType: [
    { required: true, message: '请选择消息类型', trigger: 'change' }
  ],
  targetUsers: [
    { 
      required: true, 
      message: '请选择接收用户', 
      trigger: 'change',
      validator: (rule, value, callback) => {
        if (messageForm.sendToAll || (value && value.length > 0)) {
          callback()
        } else {
          callback(new Error('请选择接收用户'))
        }
      } 
    }
  ],
  content: [
    { required: true, message: '请输入消息内容', trigger: 'blur' },
    { min: 5, max: 500, message: '长度在 5 到 500 个字符', trigger: 'blur' }
  ]
})

// 方法
const handleSearch = () => {
  page.value = 1
  fetchMessageList()
}

const resetForm = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  dateRange.value = []
  handleSearch()
}

const fetchMessageList = async () => {
  loading.value = true
  try {
    // 这里应该调用实际的 API 获取消息列表
    // const response = await getMessageList({ ...searchForm, page: page.value, pageSize: pageSize.value })
    // 模拟数据
    setTimeout(() => {
      const mockData = Array.from({ length: 10 }, (_, index) => ({
        id: page.value * 10 + index,
        title: `测试消息 ${page.value * 10 + index}`,
        content: `这是一条测试消息内容。这是第 ${page.value} 页的第 ${index + 1} 条消息。包含一些详细信息和<a href="#">链接</a>。`,
        messageType: ['system', 'activity', 'user'][Math.floor(Math.random() * 3)],
        readStatus: Math.random() > 0.5 ? 'read' : 'unread',
        createTime: '2025-05-01 12:00:00'
      }))
      messageList.value = mockData
      total.value = 100 // 模拟总数
      loading.value = false
    }, 500)
  } catch (error) {
    console.error('获取消息列表失败', error)
    ElMessage.error('获取消息列表失败')
    loading.value = false
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchMessageList()
}

const handleCurrentChange = (val) => {
  page.value = val
  fetchMessageList()
}

const handleViewMessage = (row) => {
  Object.keys(currentMessage).forEach(key => {
    if (key in row) {
      currentMessage[key] = row[key]
    }
  })
  viewDialogVisible.value = true
  
  // 如果是未读消息，可以在这里标记为已读
  // 实际应用中应该调用 API
}

const handleMarkRead = async (row) => {
  try {
    // 这里应该调用实际的 API 标记消息为已读
    // await markMessageAsRead(row.id)
    ElMessage.success('已标记为已读')
    row.readStatus = 'read' // 前端先行更新
    // 实际应该重新获取列表
  } catch (error) {
    console.error('标记消息已读失败', error)
    ElMessage.error('标记消息已读失败')
  }
}

const handleMarkReadAndClose = async () => {
  try {
    // 这里应该调用实际的 API 标记消息为已读
    // await markMessageAsRead(currentMessage.id)
    ElMessage.success('已标记为已读')
    currentMessage.readStatus = 'read'
    // 更新列表中对应的消息状态
    const message = messageList.value.find(item => item.id === currentMessage.id)
    if (message) {
      message.readStatus = 'read'
    }
    viewDialogVisible.value = false
  } catch (error) {
    console.error('标记消息已读失败', error)
    ElMessage.error('标记消息已读失败')
  }
}

const handleMarkAllRead = () => {
  ElMessageBox.confirm(
    '确定要将所有未读消息标记为已读吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      // 这里应该调用实际的 API 标记所有消息为已读
      // await markAllMessagesAsRead()
      ElMessage.success('所有消息已标记为已读')
      // 更新列表中所有消息的状态
      messageList.value.forEach(message => {
        message.readStatus = 'read'
      })
    } catch (error) {
      console.error('标记所有消息已读失败', error)
      ElMessage.error('标记所有消息已读失败')
    }
  }).catch(() => {
    // 取消操作
  })
}

const handleDeleteMessage = (row) => {
  ElMessageBox.confirm(
    '确定要删除此条消息吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      // 这里应该调用实际的 API 删除消息
      // await deleteMessage(row.id)
      ElMessage.success('删除成功')
      // 从列表中移除该消息
      const index = messageList.value.findIndex(item => item.id === row.id)
      if (index !== -1) {
        messageList.value.splice(index, 1)
      }
      // 或者重新获取列表
      // fetchMessageList()
    } catch (error) {
      console.error('删除消息失败', error)
      ElMessage.error('删除消息失败')
    }
  }).catch(() => {
    // 取消删除操作
  })
}

const handleCreateMessage = () => {
  resetMessageForm()
  createDialogVisible.value = true
}

const resetMessageForm = () => {
  if (messageFormRef.value) {
    messageFormRef.value.resetFields()
  }
  messageForm.title = ''
  messageForm.messageType = 'system'
  messageForm.content = ''
  messageForm.targetUsers = []
  messageForm.sendToAll = false
}

const submitMessageForm = async () => {
  if (!messageFormRef.value) return
  
  try {
    await messageFormRef.value.validate()
    
    // 这里应该调用实际的 API 创建消息
    // const data = {
    //   title: messageForm.title,
    //   messageType: messageForm.messageType,
    //   content: messageForm.content,
    //   targetUsers: messageForm.sendToAll ? [] : messageForm.targetUsers,
    //   sendToAll: messageForm.sendToAll
    // }
    // await createMessage(data)
    
    ElMessage.success('消息发送成功')
    createDialogVisible.value = false
    fetchMessageList() // 重新获取列表
  } catch (error) {
    console.error('表单验证失败', error)
  }
}

// 生命周期
onMounted(() => {
  fetchMessageList()
})
</script>

<style scoped>
.message-management-container {
  padding: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.search-area {
  margin-bottom: 20px;
}

.operation-area {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.pagination-area {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.message-detail {
  padding: 20px;
}

.message-title {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: bold;
}

.message-meta {
  margin-bottom: 20px;
  color: #666;
  display: flex;
  gap: 20px;
}

.message-content {
  line-height: 1.6;
  white-space: pre-line;
}

.send-to-all-hint {
  color: #909399;
  padding: 8px 0;
}
</style>
