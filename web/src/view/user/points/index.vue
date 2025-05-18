<template>
  <div class="points-management-container">
    <el-card class="table-card">
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="用户ID">
            <el-input v-model="searchForm.userId" placeholder="请输入用户ID" clearable></el-input>
          </el-form-item>
          <el-form-item label="用户名">
            <el-input v-model="searchForm.userName" placeholder="请输入用户名" clearable></el-input>
          </el-form-item>
          <el-form-item label="积分类型">
            <el-select v-model="searchForm.pointType" placeholder="选择积分类型" clearable>
              <el-option label="全部" value=""></el-option>
              <el-option label="签到" value="sign"></el-option>
              <el-option label="购买" value="purchase"></el-option>
              <el-option label="评论" value="comment"></el-option>
              <el-option label="发帖" value="post"></el-option>
              <el-option label="管理员调整" value="admin"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="积分来源">
            <el-select v-model="searchForm.source" placeholder="选择积分来源" clearable>
              <el-option label="全部" value=""></el-option>
              <el-option label="系统" value="system"></el-option>
              <el-option label="管理员" value="admin"></el-option>
              <el-option label="用户活动" value="activity"></el-option>
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
        <el-button type="primary" @click="handleAdjustPoints">积分调整</el-button>
        <el-button type="success" @click="handleExportData">导出数据</el-button>
      </div>

      <el-table
        :data="pointsList"
        border
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="userId" label="用户ID" width="100"></el-table-column>
        <el-table-column prop="userName" label="用户名" min-width="120"></el-table-column>
        <el-table-column prop="change" label="积分变动" width="120">
          <template #default="scope">
            <span :class="scope.row.change > 0 ? 'point-increase' : 'point-decrease'">
              {{ scope.row.change > 0 ? '+' : '' }}{{ scope.row.change }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="pointType" label="积分类型" width="120">
          <template #default="scope">
            <el-tag :type="getPointTypeTagType(scope.row.pointType)">
              {{ getPointTypeName(scope.row.pointType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="source" label="积分来源" min-width="120">
          <template #default="scope">
            <el-tag type="info" effect="plain">
              {{ getSourceName(scope.row.source) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="balance" label="剩余积分" width="120"></el-table-column>
        <el-table-column prop="description" label="描述" min-width="180"></el-table-column>
        <el-table-column prop="createTime" label="时间" min-width="160"></el-table-column>
        <el-table-column label="操作" fixed="right" width="150" v-if="hasPermission">
          <template #default="scope">
            <el-button
              size="small"
              type="primary"
              link
              @click="handleViewDetails(scope.row)"
            >详情</el-button>
            <el-button
              size="small"
              type="danger"
              link
              v-if="scope.row.source === 'admin' && scope.row.isReversible"
              @click="handleReverseAdjustment(scope.row)"
            >撤销</el-button>
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

    <!-- 积分调整对话框 -->
    <el-dialog
      title="积分调整"
      v-model="adjustDialogVisible"
      width="500px"
    >
      <el-form
        :model="adjustForm"
        label-width="100px"
        :rules="adjustRules"
        ref="adjustFormRef"
      >
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model="adjustForm.userId" placeholder="请输入用户ID"></el-input>
        </el-form-item>
        <el-form-item label="积分变动" prop="change">
          <el-input-number 
            v-model="adjustForm.change" 
            :precision="0" 
            :step="10" 
            :max="10000" 
            :min="-10000"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="积分类型" prop="pointType">
          <el-select v-model="adjustForm.pointType" placeholder="选择积分类型">
            <el-option label="管理员调整" value="admin"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="adjustForm.description"
            type="textarea"
            rows="3"
            placeholder="请输入调整原因"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="adjustDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAdjustForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 详情查看对话框 -->
    <el-dialog
      title="积分详情"
      v-model="detailsDialogVisible"
      width="600px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID">{{ currentDetails.id }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ currentDetails.userId }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ currentDetails.userName }}</el-descriptions-item>
        <el-descriptions-item label="积分变动">
          <span :class="currentDetails.change > 0 ? 'point-increase' : 'point-decrease'">
            {{ currentDetails.change > 0 ? '+' : '' }}{{ currentDetails.change }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="积分类型">
          <el-tag :type="getPointTypeTagType(currentDetails.pointType)">
            {{ getPointTypeName(currentDetails.pointType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="积分来源">
          <el-tag type="info" effect="plain">
            {{ getSourceName(currentDetails.source) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="调整后积分">{{ currentDetails.balance }}</el-descriptions-item>
        <el-descriptions-item label="时间">{{ currentDetails.createTime }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ currentDetails.description }}</el-descriptions-item>
        <el-descriptions-item label="操作人" v-if="currentDetails.source === 'admin'">{{ currentDetails.operator }}</el-descriptions-item>
        <el-descriptions-item label="是否可撤销" v-if="currentDetails.source === 'admin'">
          {{ currentDetails.isReversible ? '是' : '否' }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailsDialogVisible = false">关闭</el-button>
          <el-button 
            type="danger" 
            v-if="currentDetails.source === 'admin' && currentDetails.isReversible"
            @click="handleReverseFromDetails"
          >撤销调整</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 权限判断（实际项目中应该从权限系统获取）
const hasPermission = ref(true)

// 初始数据
const loading = ref(false)
const pointsList = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const dateRange = ref([])
const searchForm = reactive({
  userId: '',
  userName: '',
  pointType: '',
  source: '',
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

// 积分调整对话框
const adjustDialogVisible = ref(false)
const adjustFormRef = ref(null)
const adjustForm = reactive({
  userId: '',
  change: 0,
  pointType: 'admin',
  description: ''
})

// 详情查看对话框
const detailsDialogVisible = ref(false)
const currentDetails = reactive({
  id: '',
  userId: '',
  userName: '',
  change: 0,
  pointType: '',
  source: '',
  balance: 0,
  description: '',
  createTime: '',
  operator: '',
  isReversible: false
})

// 表单验证规则
const adjustRules = reactive({
  userId: [
    { required: true, message: '请输入用户ID', trigger: 'blur' },
    { pattern: /^\d+$/, message: '用户ID必须为数字', trigger: 'blur' }
  ],
  change: [
    { required: true, message: '请输入积分变动值', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value === 0) {
          callback(new Error('积分变动不能为0'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  pointType: [
    { required: true, message: '请选择积分类型', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入调整原因', trigger: 'blur' },
    { min: 5, max: 200, message: '描述长度应在5到200个字符之间', trigger: 'blur' }
  ]
})

// 工具方法 - 积分类型和来源的显示处理
const getPointTypeName = (type) => {
  const typeMap = {
    sign: '签到',
    purchase: '购买',
    comment: '评论',
    post: '发帖',
    admin: '管理员调整'
  }
  return typeMap[type] || type
}

const getPointTypeTagType = (type) => {
  const tagTypeMap = {
    sign: 'success',
    purchase: 'primary',
    comment: 'warning',
    post: 'info',
    admin: 'danger'
  }
  return tagTypeMap[type] || ''
}

const getSourceName = (source) => {
  const sourceMap = {
    system: '系统',
    admin: '管理员',
    activity: '用户活动'
  }
  return sourceMap[source] || source
}

// 方法
const handleSearch = () => {
  page.value = 1
  fetchPointsList()
}

const resetForm = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  dateRange.value = []
  handleSearch()
}

const fetchPointsList = async () => {
  loading.value = true
  try {
    // 这里应该调用实际的 API 获取积分记录列表
    // const response = await listPoints({ ...searchForm, page: page.value, pageSize: pageSize.value })
    // 模拟数据
    setTimeout(() => {
      const mockData = Array.from({ length: 10 }, (_, index) => {
        const isIncreasing = Math.random() > 0.3
        const changeAmount = isIncreasing 
          ? Math.floor(Math.random() * 100) + 10 
          : -Math.floor(Math.random() * 50) - 5
        const pointType = ['sign', 'purchase', 'comment', 'post', 'admin'][Math.floor(Math.random() * 5)]
        const source = pointType === 'admin' ? 'admin' : ['system', 'activity'][Math.floor(Math.random() * 2)]
        const isReversible = source === 'admin' && Math.random() > 0.3

        return {
          id: page.value * 10 + index,
          userId: Math.floor(Math.random() * 1000) + 1,
          userName: `user${Math.floor(Math.random() * 100) + 1}`,
          change: changeAmount,
          pointType,
          source,
          balance: 1000 + changeAmount,
          description: `这是一条${getPointTypeName(pointType)}积分记录，来源于${getSourceName(source)}`,
          createTime: '2025-05-01 12:00:00',
          operator: source === 'admin' ? '管理员A' : '',
          isReversible
        }
      })
      pointsList.value = mockData
      total.value = 100 // 模拟总数
      loading.value = false
    }, 500)
  } catch (error) {
    console.error('获取积分记录列表失败', error)
    ElMessage.error('获取积分记录列表失败')
    loading.value = false
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchPointsList()
}

const handleCurrentChange = (val) => {
  page.value = val
  fetchPointsList()
}

const handleAdjustPoints = () => {
  resetAdjustForm()
  adjustDialogVisible.value = true
}

const resetAdjustForm = () => {
  if (adjustFormRef.value) {
    adjustFormRef.value.resetFields()
  }
  adjustForm.userId = ''
  adjustForm.change = 0
  adjustForm.pointType = 'admin'
  adjustForm.description = ''
}

const submitAdjustForm = async () => {
  if (!adjustFormRef.value) return
  
  try {
    await adjustFormRef.value.validate()
    
    // 这里应该调用实际的 API 进行积分调整
    // await addPoints({
    //   userId: adjustForm.userId,
    //   change: adjustForm.change,
    //   pointType: adjustForm.pointType,
    //   description: adjustForm.description
    // })
    
    ElMessage.success('积分调整成功')
    adjustDialogVisible.value = false
    fetchPointsList() // 重新获取列表
  } catch (error) {
    console.error('表单验证失败', error)
  }
}

const handleViewDetails = (row) => {
  Object.keys(currentDetails).forEach(key => {
    if (key in row) {
      currentDetails[key] = row[key]
    }
  })
  detailsDialogVisible.value = true
}

const handleReverseAdjustment = (row) => {
  if (!row.isReversible) {
    ElMessage.warning('此积分调整不可撤销')
    return
  }
  
  ElMessageBox.confirm(
    `确定要撤销此次积分调整吗？将反向调整 ${Math.abs(row.change)} 积分`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      // 这里应该调用实际的 API 撤销积分调整
      // await deletePoints(row.id)
      ElMessage.success('撤销成功')
      fetchPointsList() // 重新获取列表
    } catch (error) {
      console.error('撤销积分调整失败', error)
      ElMessage.error('撤销积分调整失败')
    }
  }).catch(() => {
    // 取消操作
  })
}

const handleReverseFromDetails = () => {
  if (!currentDetails.isReversible) {
    ElMessage.warning('此积分调整不可撤销')
    return
  }
  
  ElMessageBox.confirm(
    `确定要撤销此次积分调整吗？将反向调整 ${Math.abs(currentDetails.change)} 积分`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      // 这里应该调用实际的 API 撤销积分调整
      // await deletePoints(currentDetails.id)
      ElMessage.success('撤销成功')
      detailsDialogVisible.value = false
      fetchPointsList() // 重新获取列表
    } catch (error) {
      console.error('撤销积分调整失败', error)
      ElMessage.error('撤销积分调整失败')
    }
  }).catch(() => {
    // 取消操作
  })
}

const handleExportData = async () => {
  try {
    loading.value = true
    // 这里应该调用实际的 API 导出积分数据
    // const response = await exportPointsData(searchForm)
    // 处理导出的文件...
    
    setTimeout(() => {
      ElMessage.success('数据导出成功，请在下载中心查看')
      loading.value = false
    }, 1000)
  } catch (error) {
    console.error('导出数据失败', error)
    ElMessage.error('导出数据失败')
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  fetchPointsList()
})
</script>

<style scoped>
.points-management-container {
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

.point-increase {
  color: #67C23A;
  font-weight: bold;
}

.point-decrease {
  color: #F56C6C;
  font-weight: bold;
}
</style>
