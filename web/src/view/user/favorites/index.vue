<template>
  <div class="favorites-management-container">
    <el-card class="table-card">
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="用户ID">
            <el-input v-model="searchForm.userId" placeholder="请输入用户ID" clearable></el-input>
          </el-form-item>
          <el-form-item label="用户名">
            <el-input v-model="searchForm.userName" placeholder="请输入用户名" clearable></el-input>
          </el-form-item>
          <el-form-item label="内容标题">
            <el-input v-model="searchForm.contentTitle" placeholder="请输入内容标题" clearable></el-input>
          </el-form-item>
          <el-form-item label="收藏类型">
            <el-select v-model="searchForm.favoriteType" placeholder="选择收藏类型" clearable>
              <el-option label="全部" value=""></el-option>
              <el-option label="文章" value="article"></el-option>
              <el-option label="商品" value="product"></el-option>
              <el-option label="视频" value="video"></el-option>
              <el-option label="课程" value="course"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
            ></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="operation-area">
        <el-button type="success" @click="handleExportData">导出数据</el-button>
        <el-button type="primary" @click="handleStatistics">收藏统计</el-button>
      </div>

      <el-table
        :data="favoritesList"
        border
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column type="selection" width="50"></el-table-column>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="userId" label="用户ID" width="100"></el-table-column>
        <el-table-column prop="userName" label="用户名" min-width="120"></el-table-column>
        <el-table-column label="内容缩略图" width="100">
          <template #default="scope">
            <el-image 
              style="width: 60px; height: 40px" 
              :src="scope.row.thumbnailUrl" 
              fit="cover"
              :preview-src-list="[scope.row.thumbnailUrl]"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column prop="contentTitle" label="内容标题" min-width="200"></el-table-column>
        <el-table-column prop="favoriteType" label="收藏类型" width="100">
          <template #default="scope">
            <el-tag :type="getFavoriteTypeTagType(scope.row.favoriteType)">
              {{ getFavoriteTypeName(scope.row.favoriteType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="收藏时间" min-width="160"></el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="scope">
            <el-button
              size="small"
              type="primary"
              link
              @click="handleViewDetails(scope.row)"
            >详情</el-button>
            <el-button
              size="small"
              type="success"
              link
              @click="handleViewOriginal(scope.row)"
            >查看原内容</el-button>
            <el-button
              size="small"
              type="danger"
              link
              @click="handleDelete(scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-area">
        <el-pagination
          :current-page="page"
          :page-sizes="[10, 20, 30, 50]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </el-card>

    <!-- 统计分析对话框 -->
    <el-dialog
      title="收藏统计分析"
      v-model="statisticsDialogVisible"
      width="800px"
    >
      <el-tabs v-model="activeStatTab">
        <el-tab-pane label="类型分布" name="typeDistribution">
          <div class="chart-container" ref="pieChartRef"></div>
        </el-tab-pane>
        <el-tab-pane label="热门内容" name="hotContent">
          <el-table :data="hotContentList" border>
            <el-table-column type="index" width="50" label="排名"></el-table-column>
            <el-table-column prop="contentTitle" label="内容标题" min-width="200"></el-table-column>
            <el-table-column prop="favoriteType" label="类型" width="100">
              <template #default="scope">
                <el-tag :type="getFavoriteTypeTagType(scope.row.favoriteType)">
                  {{ getFavoriteTypeName(scope.row.favoriteType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="count" label="收藏次数" width="120"></el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="趋势分析" name="trend">
          <div class="chart-time-selector">
            <el-radio-group v-model="trendPeriod" @change="loadTrendData">
              <el-radio-button label="week">周趋势</el-radio-button>
              <el-radio-button label="month">月趋势</el-radio-button>
              <el-radio-button label="year">年趋势</el-radio-button>
            </el-radio-group>
          </div>
          <div class="chart-container" ref="lineChartRef"></div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

    <!-- 收藏详情对话框 -->
    <el-dialog
      title="收藏详情"
      v-model="detailsDialogVisible"
      width="600px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID">{{ currentDetails.id }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ currentDetails.userId }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ currentDetails.userName }}</el-descriptions-item>
        <el-descriptions-item label="内容ID">{{ currentDetails.contentId }}</el-descriptions-item>
        <el-descriptions-item label="内容标题" :span="2">{{ currentDetails.contentTitle }}</el-descriptions-item>
        <el-descriptions-item label="收藏类型">
          <el-tag :type="getFavoriteTypeTagType(currentDetails.favoriteType)">
            {{ getFavoriteTypeName(currentDetails.favoriteType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="收藏时间">{{ currentDetails.createTime }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentDetails.note || '无' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailsDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleViewOriginalFromDetails">查看原内容</el-button>
          <el-button type="danger" @click="handleDeleteFromDetails">删除</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import * as echarts from 'echarts/core'
import { PieChart, LineChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 注册 ECharts 组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  PieChart,
  LineChart,
  BarChart,
  CanvasRenderer
])

// 初始数据
const loading = ref(false)
const favoritesList = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const dateRange = ref([])
const searchForm = reactive({
  userId: '',
  userName: '',
  contentTitle: '',
  favoriteType: '',
  startDate: '',
  endDate: ''
})

// 监听日期范围变化，更新搜索表单
watch(dateRange, (newValue) => {
  if (newValue && newValue.length === 2) {
    searchForm.startDate = newValue[0]
    searchForm.endDate = newValue[1]
  } else {
    searchForm.startDate = ''
    searchForm.endDate = ''
  }
})

// 详情查看对话框
const detailsDialogVisible = ref(false)
const currentDetails = reactive({
  id: '',
  userId: '',
  userName: '',
  contentId: '',
  contentTitle: '',
  favoriteType: '',
  createTime: '',
  note: '',
  thumbnailUrl: '',
  originalUrl: ''
})

// 统计分析对话框
const statisticsDialogVisible = ref(false)
const activeStatTab = ref('typeDistribution')
const pieChartRef = ref(null)
const lineChartRef = ref(null)
const pieChart = ref(null)
const lineChart = ref(null)
const hotContentList = ref([])
const trendPeriod = ref('month')

// 工具方法 - 收藏类型的显示处理
const getFavoriteTypeName = (type) => {
  const typeMap = {
    article: '文章',
    product: '商品',
    video: '视频',
    course: '课程'
  }
  return typeMap[type] || type
}

const getFavoriteTypeTagType = (type) => {
  const tagTypeMap = {
    article: 'primary',
    product: 'success',
    video: 'danger',
    course: 'warning'
  }
  return tagTypeMap[type] || ''
}

// 方法
const handleSearch = () => {
  page.value = 1
  fetchFavoritesList()
}

const resetForm = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  dateRange.value = []
  handleSearch()
}

const fetchFavoritesList = async () => {
  loading.value = true
  try {
    // 这里应该调用实际的 API 获取收藏记录列表
    // const response = await listFavorites({ ...searchForm, page: page.value, pageSize: pageSize.value })
    // 模拟数据
    setTimeout(() => {
      const mockData = Array.from({ length: 10 }, (_, index) => {
        const favoriteType = ['article', 'product', 'video', 'course'][Math.floor(Math.random() * 4)]
        const thumbnailUrl = `https://picsum.photos/id/${Math.floor(Math.random() * 100) + 1}/200/100`
        
        return {
          id: page.value * 10 + index,
          userId: Math.floor(Math.random() * 1000) + 1,
          userName: `user${Math.floor(Math.random() * 100) + 1}`,
          contentId: Math.floor(Math.random() * 10000) + 1,
          contentTitle: `测试${getFavoriteTypeName(favoriteType)}标题 ${Math.floor(Math.random() * 100) + 1}`,
          favoriteType,
          createTime: '2025-05-01 12:00:00',
          note: Math.random() > 0.7 ? `这是用户的收藏备注信息` : '',
          thumbnailUrl,
          originalUrl: `https://example.com/${favoriteType}/${Math.floor(Math.random() * 1000) + 1}`
        }
      })
      favoritesList.value = mockData
      total.value = 100 // 模拟总数
      loading.value = false
    }, 500)
  } catch (error) {
    console.error('获取收藏记录列表失败', error)
    ElMessage.error('获取收藏记录列表失败')
    loading.value = false
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchFavoritesList()
}

const handleCurrentChange = (val) => {
  page.value = val
  fetchFavoritesList()
}

const handleViewDetails = (row) => {
  Object.keys(currentDetails).forEach(key => {
    if (key in row) {
      currentDetails[key] = row[key]
    }
  })
  detailsDialogVisible.value = true
}

const handleViewOriginal = (row) => {
  // 在实际应用中，应该打开原内容页面
  window.open(row.originalUrl, '_blank')
}

const handleViewOriginalFromDetails = () => {
  window.open(currentDetails.originalUrl, '_blank')
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除此收藏记录吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      // 这里应该调用实际的 API 删除收藏记录
      // await deleteFavorite(row.id)
      ElMessage.success('删除成功')
      fetchFavoritesList() // 重新获取列表
    } catch (error) {
      console.error('删除收藏记录失败', error)
      ElMessage.error('删除收藏记录失败')
    }
  }).catch(() => {
    // 取消操作
  })
}

const handleDeleteFromDetails = () => {
  ElMessageBox.confirm(
    `确定要删除此收藏记录吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      // 这里应该调用实际的 API 删除收藏记录
      // await deleteFavorite(currentDetails.id)
      ElMessage.success('删除成功')
      detailsDialogVisible.value = false
      fetchFavoritesList() // 重新获取列表
    } catch (error) {
      console.error('删除收藏记录失败', error)
      ElMessage.error('删除收藏记录失败')
    }
  }).catch(() => {
    // 取消操作
  })
}

const handleExportData = async () => {
  try {
    loading.value = true
    // 这里应该调用实际的 API 导出收藏数据
    // const response = await exportFavoritesData(searchForm)
    // 处理导出的文件...
    
    setTimeout(() => {
      ElMessage.success('数据导出成功，请在下载中心查看')
      loading.value = false
    }, 1000)
  } catch (error) {
    console.error('导出数据失败', error)
    ElMessage.error('导出数据失败')
    loading.value = false
  }
}

const handleStatistics = () => {
  statisticsDialogVisible.value = true
  activeStatTab.value = 'typeDistribution'
  
  // 在下一个DOM更新周期初始化图表
  nextTick(() => {
    initPieChart()
    loadHotContentData()
    loadTrendData()
  })
}

// 初始化饼图
const initPieChart = async () => {
  try {
    // 模拟获取数据
    // const data = await getFavoritesStatistics()
    // 模拟统计数据
    const mockData = [
      { value: 120, name: '文章' },
      { value: 80, name: '商品' },
      { value: 60, name: '视频' },
      { value: 40, name: '课程' }
    ]
    
    // 初始化图表
    if (!pieChart.value) {
      pieChart.value = echarts.init(pieChartRef.value)
    }
    
    // 设置图表配置
    pieChart.value.setOption({
      title: {
        text: '收藏类型分布',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: 10,
        data: mockData.map(item => item.name)
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
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: mockData,
          animationType: 'scale',
          animationEasing: 'elasticOut'
        }
      ]
    })
  } catch (error) {
    console.error('初始化饼图失败', error)
  }
}

// 加载热门内容数据
const loadHotContentData = async () => {
  try {
    // 模拟获取数据
    // const data = await getHotContent()
    // 模拟热门内容数据
    const mockData = Array.from({ length: 10 }, (_, index) => {
      const favoriteType = ['article', 'product', 'video', 'course'][Math.floor(Math.random() * 4)]
      
      return {
        contentId: Math.floor(Math.random() * 10000) + 1,
        contentTitle: `热门${getFavoriteTypeName(favoriteType)}标题 ${index + 1}`,
        favoriteType,
        count: Math.floor(Math.random() * 200) + 50
      }
    }).sort((a, b) => b.count - a.count)
    
    hotContentList.value = mockData
  } catch (error) {
    console.error('获取热门内容数据失败', error)
  }
}

// 加载趋势数据并初始化线图
const loadTrendData = async () => {
  try {
    // 模拟获取数据
    // const data = await getFavoritesTrend(trendPeriod.value)
    // 模拟趋势数据
    let labels = []
    let seriesData = []
    
    if (trendPeriod.value === 'week') {
      labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      seriesData = [30, 40, 35, 50, 49, 70, 80]
    } else if (trendPeriod.value === 'month') {
      labels = Array.from({ length: 30 }, (_, i) => `${i + 1}日`)
      seriesData = Array.from({ length: 30 }, () => Math.floor(Math.random() * 50) + 20)
    } else if (trendPeriod.value === 'year') {
      labels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      seriesData = Array.from({ length: 12 }, () => Math.floor(Math.random() * 500) + 200)
    }
    
    // 初始化图表
    nextTick(() => {
      if (!lineChart.value) {
        lineChart.value = echarts.init(lineChartRef.value)
      }
      
      // 设置图表配置
      lineChart.value.setOption({
        title: {
          text: '收藏趋势分析',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: labels
        },
        yAxis: {
          type: 'value',
          name: '收藏数量'
        },
        series: [
          {
            name: '收藏数',
            type: 'line',
            data: seriesData,
            smooth: true,
            symbolSize: 8,
            lineStyle: {
              width: 3
            },
            areaStyle: {
              opacity: 0.3
            }
          }
        ],
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        }
      })
      
      // 窗口大小变化时自动调整图表大小
      window.addEventListener('resize', () => {
        lineChart.value && lineChart.value.resize()
      })
    })
  } catch (error) {
    console.error('获取趋势数据失败', error)
  }
}

// 监听标签页切换，动态渲染图表
watch(activeStatTab, (newVal) => {
  if (newVal === 'typeDistribution') {
    nextTick(() => {
      pieChart.value && pieChart.value.resize()
    })
  } else if (newVal === 'trend') {
    nextTick(() => {
      lineChart.value && lineChart.value.resize()
    })
  }
})

// 生命周期
onMounted(() => {
  fetchFavoritesList()
})
</script>

<style scoped>
.favorites-management-container {
  padding: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.search-area {
  margin-bottom: 20px;
}

.operation-area {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.pagination-area {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.chart-container {
  height: 400px;
  width: 100%;
  margin-top: 20px;
}

.chart-time-selector {
  margin-top: 20px;
  text-align: center;
}

.image-error {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  color: #909399;
}
</style>
