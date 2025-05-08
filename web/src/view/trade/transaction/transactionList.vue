<template>
  <div>
    <div class="gva-search-box">
      <el-form :inline="true" :model="searchInfo" class="demo-form-inline" @keyup.enter="onSubmit">
        <el-form-item label="用户ID">
          <el-input v-model.number="searchInfo.userId" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="交易类型">
          <el-select v-model="searchInfo.type" placeholder="请选择交易类型" clearable>
            <el-option label="支付" value="payment" />
            <el-option label="退款" value="refund" />
            <el-option label="提现" value="withdraw" />
            <el-option label="调整" value="adjustment" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchInfo.status" placeholder="请选择状态" clearable>
            <el-option label="待处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已完成" value="completed" />
            <el-option label="失败" value="failed" />
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
        row-key="transactionId"
        border
        style="width: 100%"
        @sort-change="sortChange"
      >
        <el-table-column align="left" label="交易ID" min-width="180" prop="transaction_id" />
        <el-table-column align="left" label="用户ID" min-width="100" prop="user_id" />
        <el-table-column align="left" label="租户ID" min-width="100" prop="tenant_id" />
        <el-table-column align="left" label="关联ID" min-width="180" prop="related_id" />
        <el-table-column align="left" label="交易类型" min-width="100">
          <template #default="scope">
            <el-tag :type="getTypeTag(scope.row.type)">{{ getTypeText(scope.row.type) }}</el-tag>
          </template>
        </el-table-column>
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
        <el-table-column align="left" label="交易描述" min-width="180" prop="description" />
        <el-table-column align="left" label="交易时间" min-width="180" prop="created_at" />
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getTransactionList } from '@/api/trade'

// 数据列表
const tableData = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 搜索相关
const searchInfo = reactive({
  userId: null,
  type: '',
  status: '',
})

const dateRange = ref([])

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

    const res = await getTransactionList(params)
    if (res.code === 0) {
      tableData.value = res.data.list
      total.value = res.data.total
    }
  } catch (err) {
    ElMessage({
      type: 'error',
      message: '获取交易记录失败'
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

// 类型展示
const getTypeText = (type) => {
  const typeMap = {
    'payment': '支付',
    'refund': '退款',
    'withdraw': '提现',
    'adjustment': '调整'
  }
  return typeMap[type] || type
}

const getTypeTag = (type) => {
  const tagMap = {
    'payment': 'success',
    'refund': 'warning',
    'withdraw': 'info',
    'adjustment': 'primary'
  }
  return tagMap[type] || ''
}

// 状态展示
const getStatusText = (status) => {
  const statusMap = {
    'pending': '待处理',
    'processing': '处理中',
    'completed': '已完成',
    'failed': '失败'
  }
  return statusMap[status] || status
}

const getStatusType = (status) => {
  const typeMap = {
    'pending': 'warning',
    'processing': 'primary',
    'completed': 'success',
    'failed': 'danger'
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