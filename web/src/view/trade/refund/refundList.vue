<template>
  <div>
    <div class="gva-search-box">
      <el-form :inline="true" :model="searchInfo" class="demo-form-inline" @keyup.enter="onSubmit">
        <el-form-item label="退款ID">
          <el-input v-model="searchInfo.refundId" placeholder="请输入退款ID" />
        </el-form-item>
        <el-form-item label="订单ID">
          <el-input v-model="searchInfo.orderId" placeholder="请输入订单ID" />
        </el-form-item>
        <el-form-item label="用户ID">
          <el-input v-model.number="searchInfo.userId" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchInfo.status" placeholder="请选择状态" clearable>
            <el-option label="待处理" value="pending" />
            <el-option label="已批准" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="gva-table-box">
      <div class="gva-btn-list">
        <el-button type="primary" icon="refresh" @click="getTableData">刷新</el-button>
      </div>
      <el-table
        :data="tableData"
        row-key="refundId"
        border
        style="width: 100%"
        @sort-change="sortChange"
      >
        <el-table-column align="left" label="退款ID" min-width="180" prop="refund_id" />
        <el-table-column align="left" label="订单ID" min-width="180" prop="order_id" />
        <el-table-column align="left" label="用户ID" min-width="100" prop="user_id" />
        <el-table-column align="left" label="租户ID" min-width="100" prop="tenant_id" />
        <el-table-column align="right" label="退款金额" min-width="120">
          <template #default="scope">
            {{ scope.row.amount }} {{ scope.row.currency }}
          </template>
        </el-table-column>
        <el-table-column align="left" label="状态" min-width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="left" label="退款原因" min-width="180" prop="reason" />
        <el-table-column align="left" label="创建时间" min-width="180" prop="created_at" />
        <el-table-column align="left" fixed="right" label="操作" width="200">
          <template #default="scope">
            <el-button link type="primary" icon="view" @click="handleView(scope.row)">查看</el-button>
            <el-button 
              v-if="scope.row.status === 'pending'"
              link 
              type="primary" 
              icon="check" 
              @click="handleProcess(scope.row, 'approve')"
            >
              批准
            </el-button>
            <el-button 
              v-if="scope.row.status === 'pending'"
              link 
              type="danger" 
              icon="close" 
              @click="handleProcess(scope.row, 'reject')"
            >
              拒绝
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="gva-pagination">
        <el-pagination
          layout="total, sizes, prev, pager, next, jumper"
          :current-page="page"
          :page-size="pageSize"
          :page-sizes="[10, 30, 50, 100]"
          :total="total"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <!-- 退款处理弹窗 -->
    <el-dialog v-model="processDialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="processForm" label-width="80px">
        <el-form-item label="退款ID">
          <span>{{ processForm.refundId }}</span>
        </el-form-item>
        <el-form-item label="退款金额">
          <span>{{ processForm.amount }} {{ processForm.currency }}</span>
        </el-form-item>
        <el-form-item label="退款原因">
          <span>{{ processForm.reason }}</span>
        </el-form-item>
        <el-form-item label="处理意见">
          <el-input v-model="processForm.comment" type="textarea" placeholder="请输入处理意见" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="processDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmProcess">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRefundList, processRefund } from '@/api/trade'
import { useRouter } from 'vue-router'

const router = useRouter()

// 数据列表
const tableData = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 搜索相关
const searchInfo = reactive({
  refundId: '',
  orderId: '',
  userId: null,
  status: '',
})

const dateRange = ref([])

// 退款处理相关
const processDialogVisible = ref(false)
const processForm = reactive({
  refundId: '',
  action: '',
  amount: 0,
  currency: '',
  reason: '',
  comment: ''
})

const dialogTitle = computed(() => {
  return processForm.action === 'approve' ? '批准退款申请' : '拒绝退款申请'
})

// 获取表格数据
const getTableData = async() => {
  try {
    const params = {
      page: page.value,
      pageSize: pageSize.value,
      ...searchInfo
    }

    if (dateRange.value && dateRange.value.length === 2) {
      params.startTime = dateRange.value[0]
      params.endTime = dateRange.value[1]
    }

    // 清除无效参数
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })

    const res = await getRefundList(params)
    if (res.code === 0) {
      tableData.value = res.data.list
      total.value = res.data.total
    }
  } catch (err) {
    ElMessage({
      type: 'error',
      message: '获取退款列表失败'
    })
    console.error(err)
  }
}

// 查询
const onSubmit = () => {
  page.value = 1
  getTableData()
}

// 重置查询
const resetSearch = () => {
  Object.keys(searchInfo).forEach(key => {
    searchInfo[key] = ''
  })
  dateRange.value = []
  getTableData()
}

// 分页
const handleSizeChange = (val) => {
  pageSize.value = val
  getTableData()
}

const handleCurrentChange = (val) => {
  page.value = val
  getTableData()
}

// 排序
const sortChange = ({ prop, order }) => {
  // 暂不实现
}

// 查看退款详情
const handleView = (row) => {
  router.push({
    name: 'refundDetail',
    params: { id: row.refund_id }
  })
}

// 处理退款
const handleProcess = (row, action) => {
  processForm.refundId = row.refund_id
  processForm.action = action
  processForm.amount = row.amount
  processForm.currency = row.currency
  processForm.reason = row.reason
  processForm.comment = ''
  processDialogVisible.value = true
}

// 确认处理退款
const confirmProcess = async() => {
  if (!processForm.comment) {
    ElMessage({
      type: 'warning',
      message: '请填写处理意见'
    })
    return
  }

  try {
    const res = await processRefund(processForm.refundId, {
      action: processForm.action,
      comment: processForm.comment
    })

    if (res.code === 0) {
      ElMessage({
        type: 'success',
        message: processForm.action === 'approve' ? '退款已批准' : '退款已拒绝'
      })
      processDialogVisible.value = false
      getTableData()
    }
  } catch (err) {
    ElMessage({
      type: 'error',
      message: '处理退款失败'
    })
    console.error(err)
  }
}

// 状态展示
const getStatusText = (status) => {
  const statusMap = {
    'pending': '待处理',
    'approved': '已批准',
    'rejected': '已拒绝'
  }
  return statusMap[status] || status
}

const getStatusType = (status) => {
  const typeMap = {
    'pending': 'warning',
    'approved': 'success',
    'rejected': 'danger'
  }
  return typeMap[status] || ''
}

onMounted(() => {
  getTableData()
})
</script>

<style lang="scss" scoped>
.el-button {
  margin: 5px;
}
</style> 