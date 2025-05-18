<template>
  <div class="statistics-overview-container">
    <div class="dashboard-header">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="summary-card">
            <div class="summary-item">
              <div class="icon-container bg-blue">
                <el-icon><user /></el-icon>
              </div>
              <div class="summary-details">
                <div class="summary-title">用户总数</div>
                <div class="summary-value">{{ summaryData.userCount }}</div>
                <div class="summary-trend" :class="{ 'up': summaryData.userTrend > 0, 'down': summaryData.userTrend < 0 }">
                  <el-icon v-if="summaryData.userTrend > 0"><caret-top /></el-icon>
                  <el-icon v-else-if="summaryData.userTrend < 0"><caret-bottom /></el-icon>
                  {{ Math.abs(summaryData.userTrend) }}% 较上月
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="summary-card">
            <div class="summary-item">
              <div class="icon-container bg-green">
                <el-icon><shopping-cart /></el-icon>
              </div>
              <div class="summary-details">
                <div class="summary-title">订单总数</div>
                <div class="summary-value">{{ summaryData.orderCount }}</div>
                <div class="summary-trend" :class="{ 'up': summaryData.orderTrend > 0, 'down': summaryData.orderTrend < 0 }">
                  <el-icon v-if="summaryData.orderTrend > 0"><caret-top /></el-icon>
                  <el-icon v-else-if="summaryData.orderTrend < 0"><caret-bottom /></el-icon>
                  {{ Math.abs(summaryData.orderTrend) }}% 较上月
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="summary-card">
            <div class="summary-item">
              <div class="icon-container bg-orange">
                <el-icon><reading /></el-icon>
              </div>
              <div class="summary-details">
                <div class="summary-title">文章总数</div>
                <div class="summary-value">{{ summaryData.articleCount }}</div>
                <div class="summary-trend" :class="{ 'up': summaryData.articleTrend > 0, 'down': summaryData.articleTrend < 0 }">
                  <el-icon v-if="summaryData.articleTrend > 0"><caret-top /></el-icon>
                  <el-icon v-else-if="summaryData.articleTrend < 0"><caret-bottom /></el-icon>
                  {{ Math.abs(summaryData.articleTrend) }}% 较上月
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="summary-card">
            <div class="summary-item">
              <div class="icon-container bg-red">
                <el-icon><money /></el-icon>
              </div>
              <div class="summary-details">
                <div class="summary-title">销售总额</div>
                <div class="summary-value">¥{{ summaryData.totalSales }}</div>
                <div class="summary-trend" :class="{ 'up': summaryData.salesTrend > 0, 'down': summaryData.salesTrend < 0 }">
                  <el-icon v-if="summaryData.salesTrend > 0"><caret-top /></el-icon>
                  <el-icon v-else-if="summaryData.salesTrend < 0"><caret-bottom /></el-icon>
                  {{ Math.abs(summaryData.salesTrend) }}% 较上月
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="chart-section">
      <el-row :gutter="20">
        <el-col :xs="24" :lg="16">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="card-header">
                <span>销售趋势</span>
                <el-radio-group v-model="salesTimeRange" size="small">
                  <el-radio-button label="week">周</el-radio-button>
                  <el-radio-button label="month">月</el-radio-button>
                  <el-radio-button label="year">年</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div ref="salesTrendChart" class="chart-container"></div>
          </el-card>
        </el-col>
        <el-col :xs="24" :lg="8">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="card-header">
                <span>订单类型分布</span>
              </div>
            </template>
            <div ref="orderTypeChart" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :xs="24" :md="12">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="card-header">
                <span>用户增长趋势</span>
                <el-radio-group v-model="userGrowthTimeRange" size="small">
                  <el-radio-button label="month">月</el-radio-button>
                  <el-radio-button label="year">年</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div ref="userGrowthChart" class="chart-container"></div>
          </el-card>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="card-header">
                <span>热门内容排行</span>
              </div>
            </template>
            <el-table :data="topContentData" style="width: 100%" :show-header="false">
              <el-table-column width="50">
                <template #default="scope">
                  <div class="rank-badge" :class="getRankClass(scope.$index)">
                    {{ scope.$index + 1 }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="title">
                <template #default="scope">
                  <div class="ellipsis-text">{{ scope.row.title }}</div>
                </template>
              </el-table-column>
              <el-table-column prop="views" width="90" align="right">
                <template #default="scope">
                  <span>{{ scope.row.views }} 浏览</span>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="recent-section">
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :xs="24" :lg="12">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>最近订单</span>
                <el-button text>查看全部</el-button>
              </div>
            </template>
            <el-table :data="recentOrders" style="width: 100%">
              <el-table-column prop="order_id" label="订单ID" width="100" />
              <el-table-column prop="user_name" label="用户" />
              <el-table-column prop="amount" label="金额" width="100">
                <template #default="scope">
                  <span>¥{{ scope.row.amount }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="getOrderStatusType(scope.row.status)">
                    {{ getOrderStatusText(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="created_at" label="时间" width="180" />
            </el-table>
          </el-card>
        </el-col>
        <el-col :xs="24" :lg="12">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>最近活跃用户</span>
                <el-button text>查看全部</el-button>
              </div>
            </template>
            <el-table :data="activeUsers" style="width: 100%">
              <el-table-column width="60">
                <template #default="scope">
                  <el-avatar :size="40" :src="scope.row.avatar">
                    {{ scope.row.name.substring(0, 1) }}
                  </el-avatar>
                </template>
              </el-table-column>
              <el-table-column prop="name" label="用户" />
              <el-table-column prop="actions" label="操作数" width="80" align="center" />
              <el-table-column prop="last_active" label="最近活跃" width="180" />
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { User, ShoppingCart, Reading, Money, CaretTop, CaretBottom } from '@element-plus/icons-vue'
import * as echarts from 'echarts/core'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 注册ECharts组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  LineChart,
  BarChart,
  PieChart,
  CanvasRenderer
])

// 数据模型
const summaryData = reactive({
  userCount: '12,846',
  userTrend: 5.2,
  orderCount: '3,721',
  orderTrend: 8.7,
  articleCount: '1,589',
  articleTrend: -2.3,
  totalSales: '256,891.45',
  salesTrend: 12.6
})

// 图表引用
const salesTrendChart = ref(null)
const orderTypeChart = ref(null)
const userGrowthChart = ref(null)

// 时间范围选择
const salesTimeRange = ref('month')
const userGrowthTimeRange = ref('month')

// 热门内容数据
const topContentData = ref([
  { title: '2025年最值得学习的编程语言排行榜', views: 12453 },
  { title: '如何利用人工智能优化企业运营效率', views: 9872 },
  { title: '云原生架构设计实战案例分析', views: 8764 },
  { title: '大前端技术发展趋势及未来展望', views: 7652 },
  { title: '高并发系统设计原则与最佳实践', views: 6543 },
  { title: '区块链技术在供应链管理中的应用', views: 5432 }
])

// 近期订单数据
const recentOrders = ref([
  { order_id: 'ORD-10254', user_name: '张三', amount: 1299.00, status: 'completed', created_at: '2023-05-17 14:23:45' },
  { order_id: 'ORD-10253', user_name: '李四', amount: 599.50, status: 'paid', created_at: '2023-05-17 13:48:12' },
  { order_id: 'ORD-10252', user_name: '王五', amount: 4999.00, status: 'pending', created_at: '2023-05-17 11:35:27' },
  { order_id: 'ORD-10251', user_name: '赵六', amount: 849.90, status: 'shipped', created_at: '2023-05-17 10:12:33' },
  { order_id: 'ORD-10250', user_name: '钱七', amount: 2199.00, status: 'refunded', created_at: '2023-05-17 09:24:56' }
])

// 活跃用户数据
const activeUsers = ref([
  { name: '张三', avatar: '', actions: 58, last_active: '2023-05-17 16:23:45' },
  { name: '李四', avatar: '', actions: 42, last_active: '2023-05-17 15:48:12' },
  { name: '王五', avatar: '', actions: 39, last_active: '2023-05-17 14:35:27' },
  { name: '赵六', avatar: '', actions: 27, last_active: '2023-05-17 13:12:33' },
  { name: '钱七', avatar: '', actions: 21, last_active: '2023-05-17 12:24:56' }
])

// 工具函数
const getRankClass = (index) => {
  const classes = ['rank-1', 'rank-2', 'rank-3']
  return index < 3 ? classes[index] : ''
}

const getOrderStatusText = (status) => {
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

const getOrderStatusType = (status) => {
  const typeMap = {
    'pending': 'warning',
    'paid': 'info',
    'shipped': 'primary',
    'completed': 'success',
    'cancelled': 'danger',
    'refunded': 'info'
  }
  return typeMap[status] || 'info'
}

// 初始化销售趋势图表
const initSalesTrendChart = () => {
  const chartInstance = echarts.init(salesTrendChart.value)
  
  // 模拟数据
  let categories, seriesData
  
  if (salesTimeRange.value === 'week') {
    categories = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    seriesData = [
      [12000, 15000, 18000, 16000, 19000, 22000, 25000],
      [10000, 12500, 15000, 13000, 16000, 19000, 21000]
    ]
  } else if (salesTimeRange.value === 'month') {
    categories = Array.from({ length: 30 }, (_, i) => `${i + 1}日`)
    seriesData = [
      Array.from({ length: 30 }, () => Math.floor(Math.random() * 15000) + 10000),
      Array.from({ length: 30 }, () => Math.floor(Math.random() * 12000) + 8000)
    ]
  } else {
    categories = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    seriesData = [
      [120000, 132000, 101000, 134000, 150000, 160000, 170000, 165000, 182000, 190000, 210000, 235000],
      [110000, 122000, 91000, 114000, 130000, 140000, 150000, 145000, 162000, 170000, 185000, 195000]
    ]
  }
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['今年', '去年'],
      right: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLine: {
        lineStyle: {
          color: '#e0e0e0'
        }
      },
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0'
        }
      }
    },
    series: [
      {
        name: '今年',
        type: 'line',
        smooth: true,
        data: seriesData[0],
        itemStyle: {
          color: '#5470c6'
        }
      },
      {
        name: '去年',
        type: 'line',
        smooth: true,
        data: seriesData[1],
        itemStyle: {
          color: '#91cc75'
        }
      }
    ]
  }
  
  chartInstance.setOption(option)
  
  // 响应容器大小变化
  window.addEventListener('resize', () => {
    chartInstance.resize()
  })
  
  return chartInstance
}

// 初始化订单类型图表
const initOrderTypeChart = () => {
  const chartInstance = echarts.init(orderTypeChart.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 10,
      data: ['实体商品', '虚拟商品', '服务类', '课程类', '其他']
    },
    series: [
      {
        name: '订单类型',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 1048, name: '实体商品' },
          { value: 735, name: '虚拟商品' },
          { value: 580, name: '服务类' },
          { value: 484, name: '课程类' },
          { value: 300, name: '其他' }
        ]
      }
    ]
  }
  
  chartInstance.setOption(option)
  
  // 响应容器大小变化
  window.addEventListener('resize', () => {
    chartInstance.resize()
  })
  
  return chartInstance
}

// 初始化用户增长图表
const initUserGrowthChart = () => {
  const chartInstance = echarts.init(userGrowthChart.value)
  
  // 模拟数据
  let categories, seriesData
  
  if (userGrowthTimeRange.value === 'month') {
    categories = Array.from({ length: 30 }, (_, i) => `${i + 1}日`)
    seriesData = Array.from({ length: 30 }, () => Math.floor(Math.random() * 100) + 20)
  } else {
    categories = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    seriesData = [320, 380, 420, 580, 690, 820, 950, 1100, 1200, 1380, 1500, 1700]
  }
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLine: {
        lineStyle: {
          color: '#e0e0e0'
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0'
        }
      }
    },
    series: [
      {
        name: '新增用户',
        type: 'bar',
        barWidth: userGrowthTimeRange.value === 'year' ? '60%' : '40%',
        data: seriesData,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        }
      }
    ]
  }
  
  chartInstance.setOption(option)
  
  // 响应容器大小变化
  window.addEventListener('resize', () => {
    chartInstance.resize()
  })
  
  return chartInstance
}

// 监听图表范围变化
watch(salesTimeRange, () => {
  initSalesTrendChart()
})

watch(userGrowthTimeRange, () => {
  initUserGrowthChart()
})

// 生命周期钩子
onMounted(() => {
  // 初始化所有图表
  initSalesTrendChart()
  initOrderTypeChart()
  initUserGrowthChart()
})
</script>

<style scoped>
.statistics-overview-container {
  padding: 20px;
}

.dashboard-header {
  margin-bottom: 20px;
}

.summary-card {
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  align-items: center;
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 8px;
  margin-right: 16px;
  color: white;
  font-size: 24px;
}

.bg-blue {
  background-color: #409EFF;
}

.bg-green {
  background-color: #67C23A;
}

.bg-orange {
  background-color: #E6A23C;
}

.bg-red {
  background-color: #F56C6C;
}

.summary-details {
  flex: 1;
}

.summary-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
}

.summary-trend {
  font-size: 12px;
  display: flex;
  align-items: center;
}

.summary-trend.up {
  color: #67C23A;
}

.summary-trend.down {
  color: #F56C6C;
}

.chart-card {
  height: 360px;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 300px;
}

.rank-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  color: #606266;
  font-weight: bold;
  font-size: 12px;
}

.rank-1 {
  background-color: #f56c6c;
  color: white;
}

.rank-2 {
  background-color: #e6a23c;
  color: white;
}

.rank-3 {
  background-color: #409eff;
  color: white;
}

.ellipsis-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 240px;
}
</style>
