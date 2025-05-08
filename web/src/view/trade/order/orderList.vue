<template>
  <div>
    <div class="gva-search-box">
      <el-form :inline="true" :model="searchInfo" class="demo-form-inline" @keyup.enter="onSubmit">
        <el-form-item label="订单ID">
          <el-input v-model="searchInfo.orderId" placeholder="请输入订单ID" />
        </el-form-item>
        <el-form-item label="用户ID">
          <el-input v-model.number="searchInfo.userId" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchInfo.status" placeholder="请选择状态" clearable>
            <el-option label="待支付" value="pending" />
            <el-option label="已支付" value="paid" />
            <el-option label="已发货" value="shipped" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
            <el-option label="已退款" value="refunded" />
          </el-select>
        </el-form-item>
        <el-form-item label="产品类型">
          <el-input v-model="searchInfo.productType" placeholder="请输入产品类型" />
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
        row-key="orderId"
        border
        style="width: 100%"
        @sort-change="sortChange"
      >
        <el-table-column align="left" label="订单ID" min-width="180" prop="order_id" />
        <el-table-column align="left" label="用户ID" min-width="120" prop="user_id" />
        <el-table-column align="left" label="租户ID" min-width="120" prop="tenant_id" />
        <el-table-column align="left" label="产品名称" min-width="180" prop="product_name" />
        <el-table-column align="left" label="产品类型" min-width="120" prop="product_type" />
        <el-table-column align="right" label="数量" min-width="80" prop="quantity" />
        <el-table-column align="right" label="金额" min-width="120">
          <template #default="scope">
            {{ scope.row.amount }} {{ scope.row.currency }}
          </template>
        </el-table-column>
        <el-table-column align="left" label="状态" min-width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="left" label="创建时间" min-width="180" prop="created_at" />
        <el-table-column align="left" fixed="right" label="操作" width="200">
          <template #default="scope">
            <el-button link type="primary" icon="view" @click="handleView(scope.row)">查看</el-button>
            <el-button link type="primary" icon="edit" @click="handleEdit(scope.row)">修改状态</el-button>
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

    <!-- 订单状态修改弹窗 -->
    <el-dialog v-model="statusDialogVisible" title="修改订单状态" width="500px">
      <el-form :model="statusForm" label-width="80px">
        <el-form-item label="订单ID">
          <span>{{ statusForm.orderId }}</span>
        </el-form-item>
        <el-form-item label="当前状态">
          <el-tag :type="getStatusType(statusForm.currentStatus)">{{ getStatusText(statusForm.currentStatus) }}</el-tag>
        </el-form-item>
        <el-form-item label="新状态">
          <el-select v-model="statusForm.status" placeholder="请选择状态">
            <el-option label="待支付" value="pending" />
            <el-option label="已支付" value="paid" />
            <el-option label="已发货" value="shipped" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
            <el-option label="已退款" value="refunded" />
          </el-select>
        </el-form-item>
        <el-form-item label="原因">
          <el-input v-model="statusForm.reason" type="textarea" placeholder="请输入状态变更原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="statusDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="updateStatus">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrderList, updateOrderStatus } from '@/api/trade'
import { useRouter } from 'vue-router'

const router = useRouter()

// 数据列表
const tableData = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 搜索相关
const searchInfo = reactive({
  orderId: '',
  userId: null,
  status: '',
  productType: '',
})

const dateRange = ref([])

// 状态修改相关
const statusDialogVisible = ref(false)
const statusForm = reactive({
  orderId: '',
  currentStatus: '',
  status: '',
  reason: ''
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

    const res = await getOrderList(params)
    if (res.code === 0) {
      tableData.value = res.data.list
      total.value = res.data.total
    }
  } catch (err) {
    ElMessage({
      type: 'error',
      message: '获取订单列表失败'
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

// 查看订单详情
const handleView = (row) => {
  router.push({
    name: 'orderDetail',
    params: { id: row.order_id }
  })
}

// 修改状态
const handleEdit = (row) => {
  statusForm.orderId = row.order_id
  statusForm.currentStatus = row.status
  statusForm.status = row.status
  statusForm.reason = ''
  statusDialogVisible.value = true
}

// 提交状态更新
const updateStatus = async() => {
  if (!statusForm.status) {
    ElMessage({
      type: 'warning',
      message: '请选择订单状态'
    })
    return
  }

  try {
    const res = await updateOrderStatus(statusForm.orderId, {
      status: statusForm.status,
      reason: statusForm.reason
    })

    if (res.code === 0) {
      ElMessage({
        type: 'success',
        message: '订单状态更新成功'
      })
      statusDialogVisible.value = false
      getTableData()
    }
  } catch (err) {
    ElMessage({
      type: 'error',
      message: '更新订单状态失败'
    })
    console.error(err)
  }
}

// 状态展示
const getStatusText = (status) => {
  const statusMap = {
    'pending': '待支付',
    'paid': '已支付',
    'shipped': '已发货',
    'completed': '已完成',
    'cancelled': '已取消',
    'refunded': '已退款'
  }
  return statusMap[status] || status
}

const getStatusType = (status) => {
  const typeMap = {
    'pending': 'warning',
    'paid': 'success',
    'shipped': 'primary',
    'completed': 'success',
    'cancelled': 'danger',
    'refunded': 'info'
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