<template>
  <div class="content-statistics-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>内容发布趋势</span>
              <el-radio-group v-model="timeRange" size="small">
                <el-radio-button label="week">周</el-radio-button>
                <el-radio-button label="month">月</el-radio-button>
                <el-radio-button label="year">年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="publishTrendChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>内容分类统计</span>
            </div>
          </template>
          <div ref="categoryChart" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>阅读量分布</span>
            </div>
          </template>
          <div ref="readDistributionChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>热门内容排行榜</span>
              <el-radio-group v-model="rankType" size="small">
                <el-radio-button label="views">浏览量</el-radio-button>
                <el-radio-button label="likes">点赞数</el-radio-button>
                <el-radio-button label="comments">评论数</el-radio-button>
                <el-radio-button label="shares">分享数</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <el-table :data="contentRankData" style="width: 100%">
            <el-table-column type="index" label="排名" width="80" align="center">
              <template #default="scope">
                <div class="rank-badge" :class="getRankClass(scope.$index)">
                  {{ scope.$index + 1 }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="title" label="标题">
              <template #default="scope">
                <div class="content-title">
                  <span>{{ scope.row.title }}</span>
                  <el-tag v-if="scope.row.is_premium" type="warning" size="small" style="margin-left: 5px;">
                    会员
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="category" label="分类" width="120">
              <template #default="scope">
                <el-tag type="info" size="small">{{ scope.row.category }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="views" label="浏览量" width="100" align="center" sortable />
            <el-table-column prop="likes" label="点赞数" width="100" align="center" sortable />
            <el-table-column prop="comments" label="评论数" width="100" align="center" sortable />
            <el-table-column prop="shares" label="分享数" width="100" align="center" sortable />
            <el-table-column prop="publish_date" label="发布日期" width="180" sortable />
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

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>内容互动数据分析</span>
              <el-button type="primary" size="small" @click="exportData">导出报表</el-button>
            </div>
          </template>
          <el-table 
            :data="interactionData" 
            style="width: 100%"
            :default-sort="{ prop: 'engagement_rate', order: 'descending' }"
          >
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="title" label="标题" min-width="200" />
            <el-table-column prop="author" label="作者" width="120" />
            <el-table-column prop="views" label="浏览量" width="100" align="center" sortable />
            <el-table-column prop="avg_time" label="平均阅读时间" width="140" align="center" sortable />
            <el-table-column prop="engagement_rate" label="互动率" width="120" align="center" sortable>
              <template #default="scope">
                <span>{{ (scope.row.engagement_rate * 100).toFixed(2) }}%</span>
              </template>
            </el-table-column>
            <el-table-column label="趋势" width="120" align="center">
              <template #default="scope">
                <div class="trend-indicator">
                  <el-icon v-if="scope.row.trend > 0" class="trend-up"><caret-top /></el-icon>
                  <el-icon v-else-if="scope.row.trend < 0" class="trend-down"><caret-bottom /></el-icon>
                  <el-icon v-else><connection /></el-icon>
                  <span :class="{ 'trend-up': scope.row.trend > 0, 'trend-down': scope.row.trend < 0 }">
                    {{ Math.abs(scope.row.trend).toFixed(2) }}%
                  </span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center">
              <template #default="scope">
                <el-button link type="primary" @click="viewDetail(scope.row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { CaretTop, CaretBottom, Connection } from '@element-plus/icons-vue'
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
// 排行类型
const rankType = ref('views')

// 图表引用
const publishTrendChart = ref(null)
const categoryChart = ref(null)
const readDistributionChart = ref(null)

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 内容排行数据
const contentRankData = ref([
  { 
    id: 101, 
    title: '人工智能如何改变我们的生活方式', 
    category: '技术', 
    views: 12453, 
    likes: 856, 
    comments: 142, 
    shares: 563, 
    publish_date: '2023-05-10 10:00:00',
    is_premium: true
  },
  { 
    id: 102, 
    title: '2025年度最受欢迎的前端框架分析', 
    category: '前端', 
    views: 10234, 
    likes: 762, 
    comments: 98, 
    shares: 421, 
    publish_date: '2023-05-12 14:30:00',
    is_premium: false
  },
  { 
    id: 103, 
    title: '区块链技术在金融领域的应用与展望', 
    category: '金融', 
    views: 9856, 
    likes: 701, 
    comments: 87, 
    shares: 389, 
    publish_date: '2023-05-11 09:15:00',
    is_premium: true
  },
  { 
    id: 104, 
    title: '从零开始学习Docker容器技术', 
    category: '运维', 
    views: 8743, 
    likes: 612, 
    comments: 76, 
    shares: 345, 
    publish_date: '2023-05-13 16:45:00',
    is_premium: false
  },
  { 
    id: 105, 
    title: '大数据分析：企业决策的新支柱', 
    category: '数据', 
    views: 7659, 
    likes: 543, 
    comments: 68, 
    shares: 298, 
    publish_date: '2023-05-14 11:20:00',
    is_premium: false
  },
  { 
    id: 106, 
    title: '云原生架构的演进与最佳实践', 
    category: '架构', 
    views: 6823, 
    likes: 476, 
    comments: 53, 
    shares: 267, 
    publish_date: '2023-05-15 08:10:00',
    is_premium: true
  },
  { 
    id: 107, 
    title: 'TypeScript高级特性详解', 
    category: '前端', 
    views: 6145, 
    likes: 432, 
    comments: 47, 
    shares: 234, 
    publish_date: '2023-05-16 13:40:00',
    is_premium: false
  },
  { 
    id: 108, 
    title: '微服务架构下的服务治理', 
    category: '架构', 
    views: 5762, 
    likes: 387, 
    comments: 42, 
    shares: 210, 
    publish_date: '2023-05-12 10:30:00',
    is_premium: false
  },
  { 
    id: 109, 
    title: 'Flutter移动开发实战指南', 
    category: '移动', 
    views: 5324, 
    likes: 354, 
    comments: 38, 
    shares: 198, 
    publish_date: '2023-05-11 15:25:00',
    is_premium: false
  },
  { 
    id: 110, 
    title: 'Python数据科学与机器学习入门', 
    category: '数据', 
    views: 4987, 
    likes: 321, 
    comments: 35, 
    shares: 182, 
    publish_date: '2023-05-10 17:50:00',
    is_premium: true
  }
])

// 内容互动数据
const interactionData = ref([
  { 
    id: 101, 
    title: '人工智能如何改变我们的生活方式', 
    author: '张三', 
    views: 12453, 
    avg_time: '4:23', 
    engagement_rate: 0.076, 
    trend: 8.3
  },
  { 
    id: 102, 
    title: '2025年度最受欢迎的前端框架分析', 
    author: '李四', 
    views: 10234, 
    avg_time: '3:47', 
    engagement_rate: 0.065, 
    trend: 5.2
  },
  { 
    id: 103, 
    title: '区块链技术在金融领域的应用与展望', 
    author: '王五', 
    views: 9856, 
    avg_time: '5:12', 
    engagement_rate: 0.082, 
    trend: 12.4
  },
  { 
    id: 104, 
    title: '从零开始学习Docker容器技术', 
    author: '赵六', 
    views: 8743, 
    avg_time: '6:05', 
    engagement_rate: 0.093, 
    trend: 9.7
  },
  { 
    id: 105, 
    title: '大数据分析：企业决策的新支柱', 
    author: '张三', 
    views: 7659, 
    avg_time: '4:35', 
    engagement_rate: 0.071, 
    trend: -3.2
  },
  { 
    id: 106, 
    title: '云原生架构的演进与最佳实践', 
    author: '李四', 
    views: 6823, 
    avg_time: '5:53', 
    engagement_rate: 0.089, 
    trend: 6.5
  },
  { 
    id: 107, 
    title: 'TypeScript高级特性详解', 
    author: '王五', 
    views: 6145, 
    avg_time: '5:17', 
    engagement_rate: 0.078, 
    trend: 4.1
  },
  { 
    id: 108, 
    title: '微服务架构下的服务治理', 
    author: '赵六', 
    views: 5762, 
    avg_time: '6:21', 
    engagement_rate: 0.097, 
    trend: 14.2
  },
  { 
    id: 109, 
    title: 'Flutter移动开发实战指南', 
    author: '张三', 
    views: 5324, 
    avg_time: '4:48', 
    engagement_rate: 0.068, 
    trend: -2.6
  },
  { 
    id: 110, 
    title: 'Python数据科学与机器学习入门', 
    author: '李四', 
    views: 4987, 
    avg_time: '5:34', 
    engagement_rate: 0.084, 
    trend: 7.9
  }
])

// 工具函数
const getRankClass = (index) => {
  const classes = ['rank-1', 'rank-2', 'rank-3']
  return index < 3 ? classes[index] : ''
}

// 初始化内容发布趋势图表
const initPublishTrendChart = () => {
  const chartInstance = echarts.init(publishTrendChart.value)
  
  // 模拟数据
  let categories, articleData, videoData
  
  if (timeRange.value === 'week') {
    categories = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    articleData = [5, 8, 7, 12, 9, 6, 4]
    videoData = [2, 3, 1, 5, 7, 4, 2]
  } else if (timeRange.value === 'month') {
    categories = Array.from({ length: 30 }, (_, i) => `${i + 1}日`)
    articleData = Array.from({ length: 30 }, () => Math.floor(Math.random() * 15) + 3)
    videoData = Array.from({ length: 30 }, () => Math.floor(Math.random() * 8) + 1)
  } else {
    categories = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    articleData = [30, 35, 42, 38, 52, 60, 55, 48, 65, 72, 68, 80]
    videoData = [12, 15, 18, 20, 25, 28, 32, 35, 30, 38, 42, 45]
  }
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['文章', '视频'],
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
        name: '文章',
        type: 'bar',
        stack: 'total',
        barWidth: '50%',
        data: articleData,
        itemStyle: {
          color: '#5470c6'
        }
      },
      {
        name: '视频',
        type: 'bar',
        stack: 'total',
        barWidth: '50%',
        data: videoData,
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

// 初始化内容分类图表
const initCategoryChart = () => {
  const chartInstance = echarts.init(categoryChart.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: ['技术', '前端', '后端', '移动', '数据', '架构', '运维', '安全', '其他']
    },
    series: [
      {
        name: '内容分类',
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
          { value: 320, name: '技术' },
          { value: 240, name: '前端' },
          { value: 180, name: '后端' },
          { value: 120, name: '移动' },
          { value: 150, name: '数据' },
          { value: 100, name: '架构' },
          { value: 80, name: '运维' },
          { value: 60, name: '安全' },
          { value: 40, name: '其他' }
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

// 初始化阅读量分布图表
const initReadDistributionChart = () => {
  const chartInstance = echarts.init(readDistributionChart.value)
  
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
    xAxis: {
      type: 'category',
      data: ['<100', '100-500', '500-1000', '1000-5000', '5000-10000', '>10000'],
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
        name: '内容数量',
        type: 'bar',
        barWidth: '60%',
        data: [12, 28, 45, 68, 32, 15],
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

// 监听排行类型变化
watch(rankType, (newVal) => {
  // 根据选择的排行类型对表格数据进行排序
  contentRankData.value.sort((a, b) => b[newVal] - a[newVal])
})

// 监听时间范围变化
watch(timeRange, () => {
  initPublishTrendChart()
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
const exportData = () => {
  ElMessage.success('数据报表导出成功')
}

// 查看详情
const viewDetail = (row) => {
  ElMessageBox.alert(
    `ID: ${row.id}<br>标题: ${row.title}<br>作者: ${row.author}<br>浏览量: ${row.views}<br>平均阅读时间: ${row.avg_time}<br>互动率: ${(row.engagement_rate * 100).toFixed(2)}%<br>趋势: ${row.trend > 0 ? '+' : ''}${row.trend.toFixed(2)}%`,
    '内容详情',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确定'
    }
  )
}

// 生命周期钩子
onMounted(() => {
  // 初始化所有图表
  initPublishTrendChart()
  initCategoryChart()
  initReadDistributionChart()
  
  // 根据选择的排行类型对表格数据进行排序
  contentRankData.value.sort((a, b) => b[rankType.value] - a[rankType.value])
})
</script>

<style scoped>
.content-statistics-container {
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

.rank-badge {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  color: #606266;
  font-weight: bold;
  margin: 0 auto;
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

.content-title {
  display: flex;
  align-items: center;
}

.trend-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.trend-up {
  color: #67C23A;
}

.trend-down {
  color: #F56C6C;
}
</style>
