<template>
  <div class="order-detail-container">
    <div class="back-btn">
      <el-button icon="arrow-left" @click="goBack">返回</el-button>
    </div>
    
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>订单详情</span>
          <el-button type="primary" @click="handleEdit">更新状态</el-button>
        </div>
      </template>
      
      <el-descriptions title="基本信息" :column="2" border>
        <el-descriptions-item label="订单编号">{{ orderDetail.order_id }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag :type="getStatusType(orderDetail.status)">{{ getStatusText(orderDetail.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ orderDetail.user_id }}</el-descriptions-item>
        <el-descriptions-item label="租户ID">{{ orderDetail.tenant_id }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ orderDetail.created_at }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ orderDetail.updated_at }}</el-descriptions-item>
        <el-descriptions-item label="过期时间">{{ orderDetail.expire_time }}</el-descriptions-item>
      </el-descriptions>
      
      <el-divider />
      
      <el-descriptions title="产品信息" :column="2" border>
        <el-descriptions-item label="产品ID">{{ orderDetail.product_id }}</el-descriptions-item>
        <el-descriptions-item label="产品类型">{{ orderDetail.product_type }}</el-descriptions-item>
        <el-descriptions-item label="产品名称">{{ orderDetail.product_name }}</el-descriptions-item>
        <el-descriptions-item label="数量">{{ orderDetail.quantity }}</el-descriptions-item>
        <el-descriptions-item label="单价">{{ orderDetail.amount }} {{ orderDetail.currency }}</el-descriptions-item>
      </el-descriptions>
      
      <el-divider />
      
      <el-descriptions title="支付信息" :column="2" border>
        <el-descriptions-item label="支付ID">{{ orderDetail.payment_id || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="支付方式">{{ orderDetail.payment_type || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="支付时间">{{ orderDetail.payment_time || '暂无' }}</el-descriptions-item>
      </el-descriptions>
      
      <el-divider />
      
      <el-descriptions title="其他信息" :column="1" border>
        <el-descriptions-item label="订单描述">{{ orderDetail.description || '暂无描述' }}</el-descriptions-item>
        <el-descriptions-item label="元数据">{{ orderDetail.metadata || '暂无元数据' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
    
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
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getOrderDetail, updateOrderStatus } from '@/api/trade'

const route = useRoute()
const router = useRouter()
const orderId = route.params.id

const orderDetail = ref({})
const loading = ref(true)

// 状态修改相关
const statusDialogVisible = ref(false)
const statusForm = reactive({
  orderId: '',
  currentStatus: '',
  status: '',
  reason: ''
})

// 获取订单详情
const fetchOrderDetail = async () => {
  try {
    loading.value = true
    const res = await getOrderDetail(orderId)
    if (res.code === 0) {
      orderDetail.value = res.data
    } else {
      ElMessage.error('获取订单详情失败')
    }
  } catch (err) {
    console.error(err)
    ElMessage.error('获取订单详情失败')
  } finally {
    loading.value = false
  }
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 修改状态
const handleEdit = () => {
  statusForm.orderId = orderDetail.value.order_id
  statusForm.currentStatus = orderDetail.value.status
  statusForm.status = orderDetail.value.status
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
      fetchOrderDetail()
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
  fetchOrderDetail()
})
</script>

<style lang="scss" scoped>
.order-detail-container {
  padding: 20px;
  
  .back-btn {
    margin-bottom: 20px;
  }
  
  .box-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
  
  .el-divider {
    margin: 24px 0;
  }
}
</style> 