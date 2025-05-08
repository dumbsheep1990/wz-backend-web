<template>
  <div class="refund-detail-container">
    <div class="back-btn">
      <el-button icon="arrow-left" @click="goBack">返回</el-button>
    </div>
    
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>退款详情</span>
          <div>
            <el-button 
              v-if="refundDetail.status === 'pending'"
              type="success" 
              @click="handleProcess('approve')"
            >
              批准退款
            </el-button>
            <el-button 
              v-if="refundDetail.status === 'pending'"
              type="danger" 
              @click="handleProcess('reject')"
            >
              拒绝退款
            </el-button>
          </div>
        </div>
      </template>
      
      <el-descriptions title="基本信息" :column="2" border>
        <el-descriptions-item label="退款ID">{{ refundDetail.refund_id }}</el-descriptions-item>
        <el-descriptions-item label="订单ID">{{ refundDetail.order_id }}</el-descriptions-item>
        <el-descriptions-item label="退款状态">
          <el-tag :type="getStatusType(refundDetail.status)">{{ getStatusText(refundDetail.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ refundDetail.user_id }}</el-descriptions-item>
        <el-descriptions-item label="租户ID">{{ refundDetail.tenant_id }}</el-descriptions-item>
        <el-descriptions-item label="退款金额">{{ refundDetail.amount }} {{ refundDetail.currency }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ refundDetail.created_at }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ refundDetail.updated_at }}</el-descriptions-item>
      </el-descriptions>
      
      <el-divider />
      
      <el-descriptions title="退款原因及说明" :column="1" border>
        <el-descriptions-item label="退款原因">{{ refundDetail.reason }}</el-descriptions-item>
        <el-descriptions-item label="补充说明">{{ refundDetail.description || '无' }}</el-descriptions-item>
      </el-descriptions>
      
      <el-divider />
      
      <el-descriptions title="处理信息" :column="2" border v-if="refundDetail.status !== 'pending'">
        <el-descriptions-item label="处理人">{{ refundDetail.processed_by || '系统自动处理' }}</el-descriptions-item>
        <el-descriptions-item label="处理时间">{{ refundDetail.process_time || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
    
    <!-- 退款处理弹窗 -->
    <el-dialog v-model="processDialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="processForm" label-width="80px">
        <el-form-item label="退款ID">
          <span>{{ processForm.refundId }}</span>
        </el-form-item>
        <el-form-item label="退款金额">
          <span>{{ processForm.amount }} {{ processForm.currency }}</span>
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
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRefundDetail, processRefund } from '@/api/trade'

const route = useRoute()
const router = useRouter()
const refundId = route.params.id

const refundDetail = ref({})
const loading = ref(true)

// 退款处理相关
const processDialogVisible = ref(false)
const processForm = reactive({
  refundId: '',
  action: '',
  amount: 0,
  currency: '',
  comment: ''
})

const dialogTitle = computed(() => {
  return processForm.action === 'approve' ? '批准退款申请' : '拒绝退款申请'
})

// 获取退款详情
const fetchRefundDetail = async () => {
  try {
    loading.value = true
    const res = await getRefundDetail(refundId)
    if (res.code === 0) {
      refundDetail.value = res.data
    } else {
      ElMessage.error('获取退款详情失败')
    }
  } catch (err) {
    console.error(err)
    ElMessage.error('获取退款详情失败')
  } finally {
    loading.value = false
  }
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 处理退款
const handleProcess = (action) => {
  processForm.refundId = refundDetail.value.refund_id
  processForm.action = action
  processForm.amount = refundDetail.value.amount
  processForm.currency = refundDetail.value.currency
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
      fetchRefundDetail()
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
  fetchRefundDetail()
})
</script>

<style lang="scss" scoped>
.refund-detail-container {
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