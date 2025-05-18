<template>
  <div class="user-statistics-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>用户增长趋势</span>
              <el-radio-group v-model="timeRange" size="small">
                <el-radio-button label="week">周</el-radio-button>
                <el-radio-button label="month">月</el-radio-button>
                <el-radio-button label="year">年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="userGrowthChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :xs="24" :md="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>用户性别分布</span>
            </div>
          </template>
          <div ref="genderChart" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>用户年龄分布</span>
            </div>
          </template>
          <div ref="ageChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>用户地区分布</span>
              <el-select v-model="regionType" size="small" style="width: 120px">
                <el-option label="省份" value="province" />
                <el-option label="城市" value="city" />
              </el-select>
            </div>
          </template>
          <div ref="regionChart" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>用户活跃度分析</span>
            </div>
          </template>
          <div ref="activityChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>用户价值分析</span>
              <el-button type="primary" size="small" @click="exportUserData">导出报表</el-button>
            </div>
          </template>
          <el-table 
            :data="userValueData" 
            style="width: 100%"
            :default-sort="{ prop: 'total_spent', order: 'descending' }"
          >
            <el-table-column prop="user_id" label="用户ID" width="80" />
            <el-table-column prop="user_name" label="用户名" min-width="120" />
            <el-table-column prop="register_time" label="注册时间" width="180" />
            <el-table-column prop="login_count" label="登录次数" width="100" align="center" sortable />
            <el-table-column prop="total_orders" label="订单数" width="100" align="center" sortable />
            <el-table-column prop="total_spent" label="消费金额" width="120" align="center" sortable>
              <template #default="scope">
                <span>¥{{ scope.row.total_spent.toFixed(2) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="last_order_time" label="最近下单" width="180" />
            <el-table-column label="用户等级" width="120" align="center">
              <template #default="scope">
                <el-tag :type="getUserLevelType(scope.row.user_level)">
                  {{ scope.row.user_level }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center">
              <template #default="scope">
                <el-button link type="primary" @click="viewUserDetail(scope.row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :small="false"
              :disabled="false"
              :background="true"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
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

// 时间范围选择
const timeRange = ref('month')
// 地区类型
const regionType = ref('province')

// 图表引用
const userGrowthChart = ref(null)
const genderChart = ref(null)
const ageChart = ref(null)
const regionChart = ref(null)
const activityChart = ref(null)

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 用户价值数据
const userValueData = ref([
  { 
    user_id: 10001, 
    user_name: '张三', 
    register_time: '2022-01-15 10:23:45', 
    login_count: 156, 
    total_orders: 32, 
    total_spent: 12580.50, 
    last_order_time: '2023-05-12 14:30:22',
    user_level: '钻石会员'
  },
  { 
    user_id: 10002, 
    user_name: '李四', 
    register_time: '2022-02-18 14:35:12', 
    login_count: 142, 
    total_orders: 27, 
    total_spent: 9876.30, 
    last_order_time: '2023-05-10 09:45:18',
    user_level: '金牌会员'
  },
  { 
    user_id: 10003, 
    user_name: '王五', 
    register_time: '2022-03-20 16:42:38', 
    login_count: 128, 
    total_orders: 21, 
    total_spent: 7654.90, 
    last_order_time: '2023-05-15 16:22:05',
    user_level: '金牌会员'
  },
  { 
    user_id: 10004, 
    user_name: '赵六', 
    register_time: '2022-04-05 09:15:27', 
    login_count: 115, 
    total_orders: 18, 
    total_spent: 6543.25, 
    last_order_time: '2023-05-11 11:18:36',
    user_level: '银牌会员'
  },
  { 
    user_id: 10005, 
    user_name: '钱七', 
    register_time: '2022-05-12 13:28:56', 
    login_count: 98, 
    total_orders: 15, 
    total_spent: 5432.80, 
    last_order_time: '2023-05-09 15:42:12',
    user_level: '银牌会员'
  },
  { 
    user_id: 10006, 
    user_name: '孙八', 
    register_time: '2022-06-19 11:36:43', 
    login_count: 87, 
    total_orders: 12, 
    total_spent: 4321.60, 
    last_order_time: '2023-05-08 13:15:47',
    user_level: '铜牌会员'
  },
  { 
    user_id: 10007, 
    user_name: '周九', 
    register_time: '2022-07-25 15:47:21', 
    login_count: 76, 
    total_orders: 9, 
    total_spent: 3210.40, 
    last_order_time: '2023-05-05 10:38:54',
    user_level: '铜牌会员'
  },
  { 
    user_id: 10008, 
    user_name: '吴十', 
    register_time: '2022-08-30 17:52:14', 
    login_count: 65, 
    total_orders: 7, 
    total_spent: 2345.75, 
    last_order_time: '2023-05-03 09:22:31',
    user_level: '普通会员'
  },
  { 
    user_id: 10009, 
    user_name: '郑十一', 
    register_time: '2022-09-16 10:14:33', 
    login_count: 54, 
    total_orders: 5, 
    total_spent: 1789.20, 
    last_order_time: '2023-05-01 14:56:09',
    user_level: '普通会员'
  },
  { 
    user_id: 10010, 
    user_name: '王十二', 
    register_time: '2022-10-22 12:25:48', 
    login_count: 43, 
    total_orders: 3, 
    total_spent: 1234.65, 
    last_order_time: '2023-04-28 16:19:45',
    user_level: '普通会员'
  }
])

// 工具函数
const getUserLevelType = (level) => {
  const typeMap = {
    '钻石会员': 'danger',
    '金牌会员': 'warning',
    '银牌会员': 'success',
    '铜牌会员': 'info',
    '普通会员': ''
  }
  return typeMap[level] || ''
}

// 初始化用户增长趋势图表
const initUserGrowthChart = () => {
  const chartInstance = echarts.init(userGrowthChart.value)
  
  // 模拟数据
  let categories, newUserData, activeUserData
  
  if (timeRange.value === 'week') {
    categories = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    newUserData = [120, 132, 101, 134, 90, 180, 210]
    activeUserData = [220, 282, 191, 234, 290, 330, 310]
  } else if (timeRange.value === 'month') {
    categories = Array.from({ length: 30 }, (_, i) => `${i + 1}日`)
    newUserData = Array.from({ length: 30 }, () => Math.floor(Math.random() * 150) + 50)
    activeUserData = Array.from({ length: 30 }, () => Math.floor(Math.random() * 200) + 150)
  } else {
    categories = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    newUserData = [520, 532, 601, 534, 690, 730, 820, 932, 901, 934, 1290, 1330]
    activeUserData = [1320, 1332, 1301, 1334, 1390, 1430, 1520, 1532, 1601, 1634, 1690, 1730]
  }
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: ['新增用户', '活跃用户'],
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
      boundaryGap: false,
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
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: newUserData,
        itemStyle: {
          color: '#5470c6'
        }
      },
      {
        name: '活跃用户',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: activeUserData,
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

// 初始化性别分布图表
const initGenderChart = () => {
  const chartInstance = echarts.init(genderChart.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: ['男性', '女性', '未知']
    },
    series: [
      {
        name: '用户性别',
        type: 'pie',
        radius: ['50%', '70%'],
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
          { value: 4835, name: '男性', itemStyle: { color: '#5470c6' } },
          { value: 3854, name: '女性', itemStyle: { color: '#ee6666' } },
          { value: 354, name: '未知', itemStyle: { color: '#91cc75' } }
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

// 初始化年龄分布图表
const initAgeChart = () => {
  const chartInstance = echarts.init(ageChart.value)
  
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
      top: '15%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: ['18岁以下', '18-24岁', '25-30岁', '31-40岁', '41-50岁', '51-60岁', '60岁以上'],
        axisTick: {
          alignWithLabel: true
        },
        axisLine: {
          lineStyle: {
            color: '#e0e0e0'
          }
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        axisLine: {
          show: false
        },
        splitLine: {
          lineStyle: {
            color: '#f0f0f0'
          }
        }
      }
    ],
    series: [
      {
        name: '用户数量',
        type: 'bar',
        barWidth: '60%',
        data: [
          { value: 856, itemStyle: { color: '#b4a8f3' } },
          { value: 2345, itemStyle: { color: '#a79af9' } },
          { value: 3456, itemStyle: { color: '#918afa' } },
          { value: 2567, itemStyle: { color: '#7a7bf6' } },
          { value: 1234, itemStyle: { color: '#656bf2' } },
          { value: 765, itemStyle: { color: '#525dee' } },
          { value: 321, itemStyle: { color: '#4351e9' } }
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

// 初始化地区分布图表
const initRegionChart = () => {
  const chartInstance = echarts.init(regionChart.value)
  
  // 模拟数据
  let data
  
  if (regionType.value === 'province') {
    data = [
      { value: 1200, name: '广东省' },
      { value: 980, name: '北京市' },
      { value: 860, name: '上海市' },
      { value: 740, name: '浙江省' },
      { value: 620, name: '江苏省' },
      { value: 580, name: '四川省' },
      { value: 460, name: '湖北省' },
      { value: 420, name: '湖南省' },
      { value: 380, name: '河南省' },
      { value: 320, name: '其他' }
    ]
  } else {
    data = [
      { value: 800, name: '深圳市' },
      { value: 720, name: '北京市' },
      { value: 650, name: '上海市' },
      { value: 580, name: '广州市' },
      { value: 450, name: '杭州市' },
      { value: 420, name: '成都市' },
      { value: 380, name: '南京市' },
      { value: 350, name: '武汉市' },
      { value: 320, name: '长沙市' },
      { value: 280, name: '其他' }
    ]
  }
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: data.map(item => item.name)
    },
    series: [
      {
        name: '用户地区',
        type: 'pie',
        radius: '65%',
        center: ['40%', '50%'],
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
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

// 初始化用户活跃度图表
const initActivityChart = () => {
  const chartInstance = echarts.init(activityChart.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: ['高度活跃', '中度活跃', '低度活跃', '沉睡用户']
    },
    series: [
      {
        name: '活跃度',
        type: 'pie',
        radius: '65%',
        center: ['40%', '50%'],
        data: [
          { value: 1548, name: '高度活跃', itemStyle: { color: '#67C23A' } },
          { value: 3489, name: '中度活跃', itemStyle: { color: '#E6A23C' } },
          { value: 2467, name: '低度活跃', itemStyle: { color: '#909399' } },
          { value: 1259, name: '沉睡用户', itemStyle: { color: '#C0C4CC' } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
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

// 监听时间范围变化
watch(timeRange, () => {
  initUserGrowthChart()
})

// 监听地区类型变化
watch(regionType, () => {
  initRegionChart()
})

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  // 实际应用中应该调用API获取数据
  console.log('每页显示条数改变为:', val)
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  // 实际应用中应该调用API获取数据
  console.log('当前页码改变为:', val)
}

// 导出数据
const exportUserData = () => {
  ElMessage.success('用户价值分析报表导出成功')
}

// 查看用户详情
const viewUserDetail = (row) => {
  ElMessageBox.alert(
    `用户ID: ${row.user_id}<br>用户名: ${row.user_name}<br>注册时间: ${row.register_time}<br>登录次数: ${row.login_count}<br>订单数: ${row.total_orders}<br>消费金额: ¥${row.total_spent.toFixed(2)}<br>最近下单: ${row.last_order_time}<br>用户等级: ${row.user_level}`,
    '用户详情',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确定'
    }
  )
}

// 生命周期钩子
onMounted(() => {
  // 初始化所有图表
  initUserGrowthChart()
  initGenderChart()
  initAgeChart()
  initRegionChart()
  initActivityChart()
})
</script>

<style scoped>
.user-statistics-container {
  padding: 20px;
}

.chart-card {
  margin-bottom: 20px;
  height: 360px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 300px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
