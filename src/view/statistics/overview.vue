<template>
  <div class="overview-container">
    <el-row :gutter="20">
      <!-- 总体数据卡片 -->
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="data-card">
          <div class="data-header">
            <span class="data-title">总用户数</span>
            <i class="el-icon-user data-icon"></i>
          </div>
          <div class="data-content">
            <count-to :start-val="0" :end-val="overview.totalUsers" :duration="2000" />
          </div>
          <div class="data-footer">
            <span>今日新增: {{ overview.todayNewUsers }}</span>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="data-card">
          <div class="data-header">
            <span class="data-title">总内容数</span>
            <i class="el-icon-document data-icon"></i>
          </div>
          <div class="data-content">
            <count-to :start-val="0" :end-val="overview.totalContent" :duration="2000" />
          </div>
          <div class="data-footer">
            <span>今日新增: {{ overview.todayNewContent }}</span>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="data-card">
          <div class="data-header">
            <span class="data-title">总PV</span>
            <i class="el-icon-view data-icon"></i>
          </div>
          <div class="data-content">
            <count-to :start-val="0" :end-val="overview.totalPV" :duration="2000" />
          </div>
          <div class="data-footer">
            <span>今日PV: {{ overview.todayPV }}</span>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="data-card">
          <div class="data-header">
            <span class="data-title">总UV</span>
            <i class="el-icon-s-custom data-icon"></i>
          </div>
          <div class="data-content">
            <count-to :start-val="0" :end-val="overview.totalUV" :duration="2000" />
          </div>
          <div class="data-footer">
            <span>今日UV: {{ overview.todayUV }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 趋势图表 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :md="12">
        <el-card shadow="hover" class="chart-card">
          <div slot="header" class="clearfix">
            <span>访问量趋势 (近30天)</span>
            <el-button style="float: right; padding: 3px 0" type="text" @click="refreshVisitChart">刷新</el-button>
          </div>
          <div class="chart-container">
            <div ref="visitChart" class="chart"></div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :md="12">
        <el-card shadow="hover" class="chart-card">
          <div slot="header" class="clearfix">
            <span>用户增长趋势 (近30天)</span>
            <el-button style="float: right; padding: 3px 0" type="text" @click="refreshUserChart">刷新</el-button>
          </div>
          <div class="chart-container">
            <div ref="userChart" class="chart"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 内容排行榜 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24">
        <el-card shadow="hover" class="rank-card">
          <div slot="header" class="clearfix">
            <span>内容排行榜 (Top 10)</span>
            <el-button style="float: right; padding: 3px 0" type="text" @click="refreshRanking">刷新</el-button>
          </div>
          <el-table v-loading="rankLoading" :data="contentRanking" style="width: 100%">
            <el-table-column type="index" label="排名" width="80"></el-table-column>
            <el-table-column prop="title" label="标题">
              <template slot-scope="scope">
                <a :href="scope.row.url" target="_blank">{{ scope.row.title }}</a>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="类型" width="120">
              <template slot-scope="scope">
                <el-tag size="mini">{{ scope.row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="view_count" label="浏览量" width="120"></el-table-column>
            <el-table-column prop="like_count" label="点赞数" width="120"></el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import CountTo from 'vue-count-to'
import * as echarts from 'echarts'
import { getOverview, getStatisticsByType, getContentRanking } from '@/api/statistics'

export default {
  name: 'StatsOverview',
  components: {
    CountTo
  },
  data() {
    return {
      // 概览数据
      overview: {
        totalUsers: 0,
        totalContent: 0,
        totalPV: 0,
        totalUV: 0,
        todayPV: 0,
        todayUV: 0,
        todayNewUsers: 0,
        todayNewContent: 0
      },
      // 图表实例
      visitChart: null,
      userChart: null,
      // 图表数据
      visitData: [],
      userData: [],
      // 内容排行
      contentRanking: [],
      rankLoading: false
    }
  },
  mounted() {
    this.fetchOverview()
    this.fetchVisitData()
    this.fetchUserData()
    this.fetchContentRanking()
    
    // 窗口大小变化时重绘图表
    window.addEventListener('resize', this.resizeCharts)
  },
  beforeDestroy() {
    // 组件销毁前移除事件监听
    window.removeEventListener('resize', this.resizeCharts)
    // 销毁图表实例
    if (this.visitChart) this.visitChart.dispose()
    if (this.userChart) this.userChart.dispose()
  },
  methods: {
    // 获取概览数据
    fetchOverview() {
      getOverview().then(response => {
        this.overview = response.data
      }).catch(error => {
        console.error('获取概览数据失败', error)
        this.$message.error('获取概览数据失败')
      })
    },
    
    // 获取访问量数据
    fetchVisitData() {
      const now = new Date()
      const endDate = this.formatDate(now)
      const startDate = this.formatDate(new Date(now.setDate(now.getDate() - 30)))
      
      getStatisticsByType({
        type: 'pv',
        start_date: startDate,
        end_date: endDate
      }).then(response => {
        this.visitData = response.data
        this.initVisitChart()
      }).catch(error => {
        console.error('获取访问量数据失败', error)
      })
    },
    
    // 获取用户数据
    fetchUserData() {
      const now = new Date()
      const endDate = this.formatDate(now)
      const startDate = this.formatDate(new Date(now.setDate(now.getDate() - 30)))
      
      getStatisticsByType({
        type: 'user_growth',
        start_date: startDate,
        end_date: endDate
      }).then(response => {
        this.userData = response.data
        this.initUserChart()
      }).catch(error => {
        console.error('获取用户数据失败', error)
      })
    },
    
    // 获取内容排行
    fetchContentRanking() {
      this.rankLoading = true
      getContentRanking({ limit: 10 }).then(response => {
        this.contentRanking = response.data
      }).catch(error => {
        console.error('获取内容排行失败', error)
      }).finally(() => {
        this.rankLoading = false
      })
    },
    
    // 初始化访问量图表
    initVisitChart() {
      const chartDom = this.$refs.visitChart
      this.visitChart = echarts.init(chartDom)
      
      // 处理数据
      const dates = []
      const pvData = []
      const uvData = []
      
      this.visitData.forEach(item => {
        dates.push(item.date)
        pvData.push(item.value)
        // 假设UV数据也有，实际可能需要另外获取
        uvData.push(item.uv || Math.floor(item.value * 0.4))
      })
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        legend: {
          data: ['PV', 'UV']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: dates
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        series: [
          {
            name: 'PV',
            type: 'line',
            smooth: true,
            data: pvData
          },
          {
            name: 'UV',
            type: 'line',
            smooth: true,
            data: uvData
          }
        ]
      }
      
      this.visitChart.setOption(option)
    },
    
    // 初始化用户增长图表
    initUserChart() {
      const chartDom = this.$refs.userChart
      this.userChart = echarts.init(chartDom)
      
      // 处理数据
      const dates = []
      const userData = []
      
      this.userData.forEach(item => {
        dates.push(item.date)
        userData.push(item.value)
      })
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: dates
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        series: [
          {
            name: '新增用户',
            type: 'bar',
            barWidth: '60%',
            data: userData
          }
        ]
      }
      
      this.userChart.setOption(option)
    },
    
    // 窗口大小变化时重绘图表
    resizeCharts() {
      if (this.visitChart) this.visitChart.resize()
      if (this.userChart) this.userChart.resize()
    },
    
    // 刷新访问量图表
    refreshVisitChart() {
      this.fetchVisitData()
    },
    
    // 刷新用户图表
    refreshUserChart() {
      this.fetchUserData()
    },
    
    // 刷新排行榜
    refreshRanking() {
      this.fetchContentRanking()
    },
    
    // 格式化日期
    formatDate(date) {
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  }
}
</script>

<style scoped>
.overview-container {
  padding: 20px;
}
.chart-row {
  margin-top: 20px;
}
.data-card {
  margin-bottom: 20px;
  height: 150px;
}
.data-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.data-title {
  font-size: 16px;
  color: #606266;
}
.data-icon {
  font-size: 24px;
  color: #409EFF;
}
.data-content {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  line-height: 1.2;
  margin-bottom: 20px;
}
.data-footer {
  font-size: 14px;
  color: #909399;
}
.chart-card {
  margin-bottom: 20px;
}
.chart-container {
  position: relative;
  height: 350px;
}
.chart {
  width: 100%;
  height: 100%;
}
.rank-card {
  margin-bottom: 20px;
}
</style> 