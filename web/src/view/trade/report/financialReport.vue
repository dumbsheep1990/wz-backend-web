<template>
  <div class="financial-report-container">
    <div class="gva-search-box">
      <el-form :inline="true" :model="searchInfo" class="demo-form-inline" @keyup.enter="onSubmit">
        <el-form-item label="日期范围" required>
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
        <el-form-item label="分组方式">
          <el-select v-model="searchInfo.groupBy" placeholder="请选择分组方式">
            <el-option label="按天" value="day" />
            <el-option label="按周" value="week" />
            <el-option label="按月" value="month" />
          </el-select>
        </el-form-item>
        <el-form-item label="租户ID">
          <el-input v-model.number="searchInfo.tenantId" placeholder="请输入租户ID" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="success" @click="exportReport">导出数据</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <el-card class="report-summary-card" v-if="reportData">
      <div class="report-summary">
        <div class="summary-item">
          <span class="label">统计周期:</span>
          <span class="value">{{ reportData.start_time }} 至 {{ reportData.end_time }}</span>
        </div>
        <div class="summary-item">
          <span class="label">总计金额:</span>
          <span class="value"><span class="amount">{{ reportData.total_amount }}</span> {{ reportData.currency_unit }}</span>
        </div>
        <div class="summary-item">
          <span class="label">记录数量:</span>
          <span class="value">{{ reportData.item_count }}</span>
        </div>
      </div>
    </el-card>
    
    <!-- 图表展示 -->
    <el-card class="chart-card" v-if="reportData && reportData.items && reportData.items.length > 0">
      <div ref="chartContainer" class="chart-container"></div>
    </el-card>
    
    <!-- 数据表格 -->
    <el-card class="data-table-card" v-if="reportData && reportData.items">
      <el-table :data="reportData.items" border style="width: 100%">
        <el-table-column prop="date" label="日期" min-width="120" />
        <el-table-column prop="order_count" label="订单数量" min-width="120" />
        <el-table-column prop="order_amount" label="订单金额" min-width="120">
          <template #default="scope">
            {{ scope.row.order_amount }} {{ reportData.currency_unit }}
          </template>
        </el-table-column>
        <el-table-column prop="refund_count" label="退款数量" min-width="120" />
        <el-table-column prop="refund_amount" label="退款金额" min-width="120">
          <template #default="scope">
            {{ scope.row.refund_amount }} {{ reportData.currency_unit }}
          </template>
        </el-table-column>
        <el-table-column prop="net_amount" label="净收入" min-width="120">
          <template #default="scope">
            <span :class="scope.row.net_amount >= 0 ? 'positive-amount' : 'negative-amount'">
              {{ scope.row.net_amount }} {{ reportData.currency_unit }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <el-empty v-if="!reportData || !reportData.items || reportData.items.length === 0" description="暂无数据" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { getFinancialReport } from '@/api/trade'
import * as echarts from 'echarts'

// 报表数据
const reportData = ref(null)
const chartInstance = ref(null)
const chartContainer = ref(null)
const loading = ref(false)

// 搜索相关
const searchInfo = reactive({
  tenantId: null,
  groupBy: 'day'
})

// 默认日期范围为过去30天
const getCurrentDate = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getLastMonthDate = () => {
  const date = new Date()
  date.setDate(date.getDate() - 30)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const dateRange = ref([getLastMonthDate(), getCurrentDate()])

// 获取报表数据
const fetchReportData = async() => {
  if (!dateRange.value || dateRange.value.length !== 2) {
    ElMessage.warning('请选择日期范围')
    return
  }

  try {
    loading.value = true
    const params = {
      startTime: dateRange.value[0],
      endTime: dateRange.value[1],
      ...searchInfo
    }

    // 清除无效参数
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })

    const res = await getFinancialReport(params)
    if (res.code === 0) {
      reportData.value = res.data
      nextTick(() => {
        renderChart()
      })
    } else {
      ElMessage.error('获取财务报表失败')
    }
  } catch (err) {
    console.error(err)
    ElMessage.error('获取财务报表失败')
  } finally {
    loading.value = false
  }
}

// 查询
const onSubmit = () => {
  fetchReportData()
}

// 重置查询
const resetSearch = () => {
  searchInfo.tenantId = null
  searchInfo.groupBy = 'day'
  dateRange.value = [getLastMonthDate(), getCurrentDate()]
  fetchReportData()
}

// 导出报表数据
const exportReport = () => {
  if (!reportData.value) {
    ElMessage.warning('暂无数据可导出')
    return
  }

  // 生成CSV数据
  const headers = ['日期', '订单数量', '订单金额', '退款数量', '退款金额', '净收入']
  const dataRows = reportData.value.items.map(item => [
    item.date,
    item.order_count,
    item.order_amount,
    item.refund_count,
    item.refund_amount,
    item.net_amount
  ])
  
  // 添加表头和汇总行
  dataRows.unshift(headers)
  dataRows.push(['合计', '', reportData.value.total_amount, '', '', reportData.value.total_amount])
  
  // 生成CSV内容
  const csvContent = dataRows.map(row => row.join(',')).join('\n')
  
  // 创建下载链接
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  
  // 设置下载文件名
  link.setAttribute('href', url)
  link.setAttribute('download', `财务报表_${reportData.value.start_time}_${reportData.value.end_time}.csv`)
  link.style.visibility = 'hidden'
  
  // 触发下载
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 渲染图表
const renderChart = () => {
  if (!reportData.value || !reportData.value.items || reportData.value.items.length === 0) return
  
  if (chartInstance.value) {
    chartInstance.value.dispose()
  }
  
  chartInstance.value = echarts.init(chartContainer.value)
  
  // 准备图表数据
  const chartData = reportData.value.items
  const dates = chartData.map(item => item.date)
  const orderAmounts = chartData.map(item => item.order_amount)
  const refundAmounts = chartData.map(item => item.refund_amount)
  const netAmounts = chartData.map(item => item.net_amount)
  
  // 配置图表选项
  const option = {
    title: {
      text: '财务报表',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['订单金额', '退款金额', '净收入'],
      bottom: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '13%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '订单金额',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        data: orderAmounts
      },
      {
        name: '退款金额',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        data: refundAmounts.map(val => -val)
      },
      {
        name: '净收入',
        type: 'line',
        emphasis: {
          focus: 'series'
        },
        data: netAmounts
      }
    ]
  }
  
  // 渲染图表
  chartInstance.value.setOption(option)
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    chartInstance.value && chartInstance.value.resize()
  })
}

// 监听报表数据变化，更新图表
watch(reportData, () => {
  nextTick(() => {
    renderChart()
  })
})

onMounted(() => {
  fetchReportData()
})
</script>

<style lang="scss" scoped>
.financial-report-container {
  padding: 20px;
  
  .report-summary-card {
    margin-bottom: 20px;
    
    .report-summary {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      
      .summary-item {
        flex: 1;
        min-width: 200px;
        
        .label {
          font-weight: bold;
          margin-right: 10px;
        }
        
        .amount {
          font-size: 18px;
          font-weight: bold;
          color: #409EFF;
        }
      }
    }
  }
  
  .chart-card {
    margin-bottom: 20px;
    
    .chart-container {
      width: 100%;
      height: 400px;
    }
  }
  
  .data-table-card {
    margin-bottom: 20px;
  }
  
  .positive-amount {
    color: #67C23A;
  }
  
  .negative-amount {
    color: #F56C6C;
  }
}
</style> 