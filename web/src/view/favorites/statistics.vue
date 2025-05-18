<template>
  <div class="statistics-container">
    <!-- 数据概览卡片组 -->
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="6" v-for="(item, index) in overviewData" :key="index">
        <el-card class="overview-card" shadow="hover">
          <div class="overview-content">
            <div class="overview-icon" :class="item.color">
              <el-icon>
                <component :is="item.icon"></component>
              </el-icon>
            </div>
            <div class="overview-info">
              <div class="overview-title">{{ item.title }}</div>
              <div class="overview-value">{{ item.value }}</div>
              <div class="overview-trend">
                <span :class="item.trend > 0 ? 'up' : (item.trend < 0 ? 'down' : '')">
                  {{ item.trend > 0 ? '+' : ''}}{{ item.trend }}%
                </span>
                <span class="trend-text">较上月</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <!-- 收藏趋势图 -->
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>收藏趋势</span>
              <el-radio-group v-model="trendTimeRange" size="small" @change="fetchTrendData">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
                <el-radio-button label="quarter">本季度</el-radio-button>
                <el-radio-button label="year">本年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container">
            <div id="trendChart" class="chart" v-loading="trendLoading"></div>
          </div>
        </el-card>
      </el-col>

      <!-- 内容类型分布图 -->
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>内容类型分布</span>
            </div>
          </template>
          <div class="chart-container">
            <div id="typeChart" class="chart" v-loading="typeLoading"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 热门收藏内容 -->
    <el-card class="hot-content-card">
      <template #header>
        <div class="hot-content-header">
          <span>热门收藏内容 TOP 10</span>
          <div class="header-filters">
            <el-select v-model="contentType" placeholder="内容类型" style="width: 120px" @change="fetchHotContent">
              <el-option label="全部" value="" />
              <el-option label="文章" value="article" />
              <el-option label="视频" value="video" />
              <el-option label="商品" value="product" />
              <el-option label="课程" value="course" />
              <el-option label="其他" value="other" />
            </el-select>
            <el-select v-model="timePeriod" placeholder="时间周期" style="width: 120px" @change="fetchHotContent">
              <el-option label="本周" value="week" />
              <el-option label="本月" value="month" />
              <el-option label="本季度" value="quarter" />
              <el-option label="本年" value="year" />
              <el-option label="全部" value="all" />
            </el-select>
          </div>
        </div>
      </template>
      <el-table :data="hotContent" stripe style="width: 100%" v-loading="hotContentLoading">
        <el-table-column type="index" label="排名" width="80" />
        <el-table-column prop="title" label="内容标题" min-width="280" show-overflow-tooltip>
          <template #default="scope">
            <el-link type="primary" :href="scope.row.url" target="_blank">{{ scope.row.title }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="item_type" label="内容类型" width="100">
          <template #default="scope">
            <el-tag :type="getItemTypeTag(scope.row.item_type)">
              {{ formatItemType(scope.row.item_type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="count" label="收藏次数" width="100" sortable />
        <el-table-column prop="source" label="内容来源" width="150" />
        <el-table-column prop="created_at" label="首次收藏" width="150" />
        <el-table-column prop="last_collected_at" label="最近收藏" width="150" />
      </el-table>
    </el-card>

    <!-- 活跃用户 -->
    <el-card class="active-users-card">
      <template #header>
        <div class="active-users-header">
          <span>活跃收藏用户 TOP 5</span>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :lg="8" :xl="4" v-for="(user, index) in activeUsers" :key="index">
          <div class="user-card">
            <div class="user-rank">{{ index + 1 }}</div>
            <el-avatar :size="64" :src="user.avatar"></el-avatar>
            <div class="user-name">{{ user.username }}</div>
            <div class="user-count">
              <el-tag effect="dark">{{ user.count }} 收藏</el-tag>
            </div>
            <el-button type="primary" link @click="viewUserFavorites(user.id)">查看详情</el-button>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { 
  Star, 
  Collection, 
  View, 
  User
} from '@element-plus/icons-vue'

const router = useRouter()

// 顶部卡片数据概览
const overviewData = ref([
  { 
    title: '总收藏数', 
    value: 0, 
    icon: Star, 
    color: 'primary-color', 
    trend: 0 
  },
  { 
    title: '收藏内容数', 
    value: 0, 
    icon: Collection, 
    color: 'success-color', 
    trend: 0 
  },
  { 
    title: '本月新增', 
    value: 0, 
    icon: View, 
    color: 'warning-color', 
    trend: 0 
  },
  { 
    title: '收藏用户数', 
    value: 0, 
    icon: User, 
    color: 'danger-color', 
    trend: 0 
  }
])

// 统计图表相关
const trendTimeRange = ref('month')
const trendLoading = ref(false)
const typeLoading = ref(false)
let trendChart = null
let typeChart = null

// 热门内容相关
const contentType = ref('')
const timePeriod = ref('month')
const hotContentLoading = ref(false)
const hotContent = ref([])

// 活跃用户
const activeUsers = ref([])

// 获取收藏概览数据
const fetchOverviewData = async () => {
  try {
    // 这里将来需要替换为实际的API调用
    // const res = await getFavoritesStatistics()
    
    // 模拟API响应
    await new Promise(resolve => setTimeout(resolve, 500))
    const res = {
      code: 0,
      data: {
        total_favorites: 12876,
        total_content: 8435,
        monthly_new: 1245,
        user_count: 3560,
        total_trend: 15.3,
        content_trend: 8.7,
        monthly_trend: 23.5,
        user_trend: -3.2
      },
      msg: '获取成功'
    }
    
    if (res.code === 0) {
      overviewData.value[0].value = res.data.total_favorites
      overviewData.value[0].trend = res.data.total_trend
      
      overviewData.value[1].value = res.data.total_content
      overviewData.value[1].trend = res.data.content_trend
      
      overviewData.value[2].value = res.data.monthly_new
      overviewData.value[2].trend = res.data.monthly_trend
      
      overviewData.value[3].value = res.data.user_count
      overviewData.value[3].trend = res.data.user_trend
    }
  } catch (error) {
    console.error('获取收藏概览数据出错:', error)
  }
}

// 获取趋势数据
const fetchTrendData = async () => {
  trendLoading.value = true
  try {
    // 这里将来需要替换为实际的API调用
    // const res = await getFavoritesTrend(trendTimeRange.value)
    
    // 模拟API响应
    await new Promise(resolve => setTimeout(resolve, 600))
    
    let labels = []
    let data = []
    
    if (trendTimeRange.value === 'week') {
      labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      data = [125, 132, 101, 134, 90, 230, 210]
    } else if (trendTimeRange.value === 'month') {
      // 生成本月的天数
      labels = Array.from({length: 30}, (_, i) => `${i+1}日`)
      data = Array.from({length: 30}, () => Math.floor(Math.random() * 200 + 50))
    } else if (trendTimeRange.value === 'quarter') {
      labels = ['1月', '2月', '3月']
      data = [1200, 1400, 1350]
    } else {
      labels = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
      data = [820, 932, 901, 934, 1290, 1330, 1320, 1250, 1100, 980, 840, 1000]
    }
    
    const res = {
      code: 0,
      data: {
        labels,
        data
      },
      msg: '获取成功'
    }
    
    if (res.code === 0) {
      nextTick(() => {
        initTrendChart(res.data.labels, res.data.data)
      })
    }
  } catch (error) {
    console.error('获取收藏趋势数据出错:', error)
  } finally {
    trendLoading.value = false
  }
}

// 获取内容类型分布数据
const fetchTypeDistribution = async () => {
  typeLoading.value = true
  try {
    // 这里将来需要替换为实际的API调用
    // const res = await getFavoritesTypeDistribution()
    
    // 模拟API响应
    await new Promise(resolve => setTimeout(resolve, 700))
    const res = {
      code: 0,
      data: [
        { name: '文章', value: 5624 },
        { name: '视频', value: 3721 },
        { name: '商品', value: 1925 },
        { name: '课程', value: 842 },
        { name: '其他', value: 764 }
      ],
      msg: '获取成功'
    }
    
    if (res.code === 0) {
      nextTick(() => {
        initTypeChart(res.data)
      })
    }
  } catch (error) {
    console.error('获取内容类型分布数据出错:', error)
  } finally {
    typeLoading.value = false
  }
}

// 获取热门收藏内容
const fetchHotContent = async () => {
  hotContentLoading.value = true
  try {
    // 这里将来需要替换为实际的API调用
    // const res = await getHotContent({ type: contentType.value, period: timePeriod.value })
    
    // 模拟API响应
    await new Promise(resolve => setTimeout(resolve, 500))
    const res = {
      code: 0,
      data: Array.from({ length: 10 }, (_, index) => ({
        id: 10000 + index,
        title: `热门收藏内容标题 ${index + 1}`,
        item_type: ['article', 'video', 'product', 'course', 'other'][Math.floor(Math.random() * 5)],
        count: Math.floor(Math.random() * 500 + 100),
        source: ['站内', '站外', '用户创建'][Math.floor(Math.random() * 3)],
        url: `https://example.com/content/${10000 + index}`,
        created_at: new Date(Date.now() - (30 + index) * 86400000).toISOString().split('T')[0],
        last_collected_at: new Date(Date.now() - index * 86400000).toISOString().split('T')[0]
      })),
      msg: '获取成功'
    }
    
    if (res.code === 0) {
      hotContent.value = res.data
    }
  } catch (error) {
    console.error('获取热门收藏内容出错:', error)
  } finally {
    hotContentLoading.value = false
  }
}

// 获取活跃用户
const fetchActiveUsers = async () => {
  try {
    // 这里将来需要替换为实际的API调用
    // const res = await getActiveUsers()
    
    // 模拟API响应
    await new Promise(resolve => setTimeout(resolve, 400))
    const res = {
      code: 0,
      data: Array.from({ length: 5 }, (_, index) => ({
        id: 1000 + index,
        username: `用户${1000 + index}`,
        avatar: `https://picsum.photos/200?random=${index}`,
        count: Math.floor(Math.random() * 200 + 100)
      })),
      msg: '获取成功'
    }
    
    if (res.code === 0) {
      activeUsers.value = res.data
    }
  } catch (error) {
    console.error('获取活跃用户出错:', error)
  }
}

// 初始化趋势图表
const initTrendChart = (labels, data) => {
  if (!trendChart) {
    trendChart = echarts.init(document.getElementById('trendChart'))
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
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: labels,
      axisLabel: {
        interval: trendTimeRange.value === 'month' ? 'auto' : 0,
        rotate: trendTimeRange.value === 'month' ? 45 : 0
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '收藏数量',
        type: 'line',
        data: data,
        smooth: true,
        showSymbol: trendTimeRange.value !== 'month',
        lineStyle: {
          width: 3,
          color: '#409EFF'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(64, 158, 255, 0.7)'
            },
            {
              offset: 1,
              color: 'rgba(64, 158, 255, 0.1)'
            }
          ])
        }
      }
    ]
  }
  
  trendChart.setOption(option)
}

// 初始化类型分布图表
const initTypeChart = (data) => {
  if (!typeChart) {
    typeChart = echarts.init(document.getElementById('typeChart'))
  }
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 10,
      data: data.map(item => item.name)
    },
    series: [
      {
        name: '收藏类型',
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
        data: data.map(item => ({
          name: item.name,
          value: item.value
        }))
      }
    ]
  }
  
  typeChart.setOption(option)
}

// 查看用户收藏
const viewUserFavorites = (userId) => {
  router.push({
    name: 'userFavorites',
    params: { userId }
  })
}

// 格式化内容类型
const formatItemType = (type) => {
  const types = {
    article: '文章',
    video: '视频',
    product: '商品',
    course: '课程',
    other: '其他'
  }
  return types[type] || type
}

// 获取内容类型标签样式
const getItemTypeTag = (type) => {
  const types = {
    article: '',
    video: 'success',
    product: 'warning',
    course: 'info',
    other: 'danger'
  }
  return types[type] || ''
}

// 窗口大小改变时重绘图表
window.addEventListener('resize', () => {
  trendChart?.resize()
  typeChart?.resize()
})

// 生命周期钩子
onMounted(() => {
  fetchOverviewData()
  fetchTrendData()
  fetchTypeDistribution()
  fetchHotContent()
  fetchActiveUsers()
})
</script>

<style scoped>
.statistics-container {
  padding: 20px;
}

.overview-card {
  margin-bottom: 20px;
  height: 120px;
}

.overview-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.overview-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-right: 15px;
  font-size: 24px;
}

.overview-icon.primary-color {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409EFF;
}

.overview-icon.success-color {
  background-color: rgba(103, 194, 58, 0.1);
  color: #67C23A;
}

.overview-icon.warning-color {
  background-color: rgba(230, 162, 60, 0.1);
  color: #E6A23C;
}

.overview-icon.danger-color {
  background-color: rgba(245, 108, 108, 0.1);
  color: #F56C6C;
}

.overview-info {
  flex: 1;
}

.overview-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.overview-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 6px;
}

.overview-trend {
  font-size: 12px;
}

.overview-trend .up {
  color: #67C23A;
}

.overview-trend .down {
  color: #F56C6C;
}

.trend-text {
  color: #909399;
  margin-left: 4px;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-header, .hot-content-header, .active-users-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-filters {
  display: flex;
  gap: 10px;
}

.chart-container {
  height: 350px;
}

.chart {
  width: 100%;
  height: 100%;
}

.hot-content-card {
  margin-bottom: 20px;
}

.user-card {
  position: relative;
  text-align: center;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  background-color: #f8f8f8;
  transition: all 0.3s;
}

.user-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.user-rank {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  border-radius: 50%;
  background-color: #409EFF;
  color: white;
  font-weight: bold;
  font-size: 12px;
}

.user-name {
  margin-top: 10px;
  margin-bottom: 5px;
  font-size: 16px;
  font-weight: bold;
}

.user-count {
  margin-bottom: 10px;
}
</style>
