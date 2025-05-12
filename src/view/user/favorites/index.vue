<template>
  <div class="favorites-container">
    <el-card shadow="hover" class="favorites-list-card">
      <div slot="header" class="favorites-header">
        <span>用户收藏内容管理</span>
        <div class="action-buttons">
          <el-button type="primary" icon="el-icon-s-data" size="small" @click="showStatistics">收藏统计</el-button>
          <el-button type="success" icon="el-icon-download" size="small" @click="handleExport">导出数据</el-button>
        </div>
      </div>
      
      <div class="filter-container">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="用户ID">
            <el-input v-model="searchForm.user_id" placeholder="用户ID" clearable></el-input>
          </el-form-item>
          <el-form-item label="用户名">
            <el-input v-model="searchForm.username" placeholder="用户名" clearable></el-input>
          </el-form-item>
          <el-form-item label="内容标题">
            <el-input v-model="searchForm.title" placeholder="内容标题" clearable></el-input>
          </el-form-item>
          <el-form-item label="收藏类型">
            <el-select v-model="searchForm.item_type" placeholder="收藏类型" clearable>
              <el-option label="全部" value=""></el-option>
              <el-option label="文章" value="article"></el-option>
              <el-option label="商品" value="product"></el-option>
              <el-option label="视频" value="video"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd"
              :picker-options="pickerOptions">
            </el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <div v-if="!tableData.length && !loading" class="empty-favorites">
        <el-empty description="暂无收藏记录" :image-size="120"></el-empty>
      </div>
      
      <el-table
        v-else
        :data="tableData"
        style="width: 100%"
        v-loading="loading"
        border
      >
        <el-table-column prop="id" label="收藏ID" min-width="80" align="center"></el-table-column>
        <el-table-column prop="user_id" label="用户ID" min-width="80" align="center"></el-table-column>
        <el-table-column prop="username" label="用户名" min-width="120"></el-table-column>
        <el-table-column prop="title" label="收藏内容" min-width="200">
          <template slot-scope="scope">
            <div class="favorite-item">
              <div class="item-cover" v-if="scope.row.cover">
                <img :src="scope.row.cover" alt="封面">
              </div>
              <div class="item-info">
                <div class="item-title">{{ scope.row.title }}</div>
                <div class="item-summary" v-if="scope.row.summary">{{ scope.row.summary }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="item_type" label="类型" align="center" width="100">
          <template slot-scope="scope">
            <el-tag :type="getTagType(scope.row.item_type)">
              {{ formatItemType(scope.row.item_type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="收藏时间" align="center" width="160">
          <template slot-scope="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="150">
          <template slot-scope="scope">
            <el-button 
              type="text" 
              icon="el-icon-view" 
              @click="viewDetail(scope.row)">详情</el-button>
            <el-button 
              type="text" 
              icon="el-icon-delete" 
              @click="handleDelete(scope.row)"
              class="delete-btn">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination" v-if="total > 0">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="page"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </el-card>
    
    <!-- 收藏详情弹窗 -->
    <el-dialog title="收藏详情" :visible.sync="detailDialogVisible" width="600px">
      <div class="favorite-detail" v-if="currentDetail">
        <div class="content-preview" v-if="currentDetail.cover">
          <img :src="currentDetail.cover" :alt="currentDetail.title">
        </div>
        <div class="detail-item">
          <span class="label">收藏ID：</span>
          <span class="value">{{ currentDetail.id }}</span>
        </div>
        <div class="detail-item">
          <span class="label">用户ID：</span>
          <span class="value">{{ currentDetail.user_id }}</span>
        </div>
        <div class="detail-item">
          <span class="label">用户名：</span>
          <span class="value">{{ currentDetail.username }}</span>
        </div>
        <div class="detail-item">
          <span class="label">内容标题：</span>
          <span class="value">{{ currentDetail.title }}</span>
        </div>
        <div class="detail-item">
          <span class="label">内容类型：</span>
          <span class="value">{{ formatItemType(currentDetail.item_type) }}</span>
        </div>
        <div class="detail-item">
          <span class="label">内容ID：</span>
          <span class="value">{{ currentDetail.item_id }}</span>
        </div>
        <div class="detail-item" v-if="currentDetail.summary">
          <span class="label">内容简介：</span>
          <span class="value">{{ currentDetail.summary }}</span>
        </div>
        <div class="detail-item" v-if="currentDetail.url">
          <span class="label">内容链接：</span>
          <span class="value link">
            <a :href="currentDetail.url" target="_blank">{{ currentDetail.url }}</a>
          </span>
        </div>
        <div class="detail-item" v-if="currentDetail.remark">
          <span class="label">用户备注：</span>
          <span class="value">{{ currentDetail.remark }}</span>
        </div>
        <div class="detail-item">
          <span class="label">收藏时间：</span>
          <span class="value">{{ formatDate(currentDetail.created_at) }}</span>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="openContent" v-if="currentDetail && currentDetail.url">查看内容</el-button>
      </span>
    </el-dialog>
    
    <!-- 统计信息弹窗 -->
    <el-dialog title="收藏统计信息" :visible.sync="statsDialogVisible" width="800px">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="类型分布" name="typeDistribution">
          <div id="typeChart" class="chart-container"></div>
        </el-tab-pane>
        <el-tab-pane label="热门内容" name="hotContent">
          <el-table 
            :data="hotContentData" 
            style="width: 100%"
            stripe
            border>
            <el-table-column label="排名" width="80" type="index" align="center"></el-table-column>
            <el-table-column label="内容标题" prop="title" min-width="200"></el-table-column>
            <el-table-column label="内容类型" prop="item_type" width="100" align="center">
              <template slot-scope="scope">
                <el-tag :type="getTagType(scope.row.item_type)">
                  {{ formatItemType(scope.row.item_type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="收藏次数" prop="count" width="100" align="center"></el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="趋势分析" name="trend">
          <div class="date-selector">
            <el-radio-group v-model="trendPeriod" @change="loadTrendData">
              <el-radio-button label="week">最近一周</el-radio-button>
              <el-radio-button label="month">最近一个月</el-radio-button>
              <el-radio-button label="year">最近一年</el-radio-button>
            </el-radio-group>
          </div>
          <div id="trendChart" class="chart-container"></div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script>
import { 
  listFavorites, 
  getFavoriteDetail, 
  deleteFavorite, 
  exportFavoritesData,
  getFavoritesStatistics,
  getHotContent,
  getFavoritesTrend
} from '@/api/admin/favorites'
import { formatTimeToStr } from '@/utils/date'
import * as echarts from 'echarts'

export default {
  name: 'FavoritesManagement',
  data() {
    return {
      tableData: [],
      page: 1,
      pageSize: 10,
      total: 0,
      loading: false,
      searchForm: {
        user_id: '',
        username: '',
        title: '',
        item_type: ''
      },
      dateRange: [],
      detailDialogVisible: false,
      statsDialogVisible: false,
      currentDetail: null,
      typeChart: null,
      trendChart: null,
      activeTab: 'typeDistribution',
      hotContentData: [],
      trendPeriod: 'month',
      trendData: [],
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      }
    }
  },
  created() {
    this.getFavoritesList()
  },
  methods: {
    // 获取收藏列表
    getFavoritesList() {
      this.loading = true
      const params = {
        page: this.page,
        pageSize: this.pageSize,
        ...this.searchForm
      }
      
      if (this.dateRange && this.dateRange.length === 2) {
        params.start_date = this.dateRange[0]
        params.end_date = this.dateRange[1]
      }
      
      listFavorites(params)
        .then(res => {
          this.loading = false
          if (res.code === 0) {
            this.tableData = res.data.list
            this.total = res.data.total
          } else {
            this.$message.error(res.message || '获取收藏列表失败')
          }
        })
        .catch(err => {
          this.loading = false
          console.error(err)
          this.$message.error('获取收藏列表失败')
        })
    },
    
    // 处理查询
    handleSearch() {
      this.page = 1
      this.getFavoritesList()
    },
    
    // 重置查询
    resetSearch() {
      this.searchForm = {
        user_id: '',
        username: '',
        title: '',
        item_type: ''
      }
      this.dateRange = []
      this.page = 1
      this.getFavoritesList()
    },
    
    // 处理每页数量变化
    handleSizeChange(val) {
      this.pageSize = val
      this.getFavoritesList()
    },
    
    // 处理页码变化
    handleCurrentChange(val) {
      this.page = val
      this.getFavoritesList()
    },
    
    // 查看收藏详情
    viewDetail(row) {
      getFavoriteDetail(row.id)
        .then(res => {
          if (res.code === 0) {
            this.currentDetail = res.data
            this.detailDialogVisible = true
          } else {
            this.$message.error(res.message || '获取收藏详情失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('获取收藏详情失败')
        })
    },
    
    // 删除收藏记录
    handleDelete(row) {
      this.$confirm('确定要删除该收藏记录吗？此操作将永久删除该记录。', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteFavorite(row.id)
          .then(res => {
            if (res.code === 0) {
              this.$message.success('删除成功')
              this.getFavoritesList() // 刷新列表
            } else {
              this.$message.error(res.message || '删除失败')
            }
          })
          .catch(err => {
            console.error(err)
            this.$message.error('删除失败')
          })
      }).catch(() => {})
    },
    
    // 导出数据
    handleExport() {
      this.$confirm('确定要导出当前查询条件下的收藏记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        const params = { ...this.searchForm }
        
        if (this.dateRange && this.dateRange.length === 2) {
          params.start_date = this.dateRange[0]
          params.end_date = this.dateRange[1]
        }
        
        exportFavoritesData(params)
          .then(res => {
            // 处理文件下载
            const blob = new Blob([res.data], { type: 'application/vnd.ms-excel' })
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = '收藏记录导出_' + new Date().getTime() + '.xlsx'
            link.click()
            URL.revokeObjectURL(link.href)
            this.$message.success('导出成功')
          })
          .catch(err => {
            console.error(err)
            this.$message.error('导出失败')
          })
      }).catch(() => {})
    },
    
    // 打开内容链接
    openContent() {
      if (this.currentDetail && this.currentDetail.url) {
        window.open(this.currentDetail.url, '_blank')
      }
    },
    
    // 显示统计信息
    showStatistics() {
      this.statsDialogVisible = true
      this.activeTab = 'typeDistribution'
      this.$nextTick(() => {
        this.loadTypeDistribution()
        this.loadHotContent()
        this.loadTrendData()
      })
    },
    
    // 加载类型分布数据
    loadTypeDistribution() {
      getFavoritesStatistics()
        .then(res => {
          if (res.code === 0) {
            this.initTypeChart(res.data.type_distribution)
          } else {
            this.$message.error(res.message || '获取统计数据失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('获取统计数据失败')
        })
    },
    
    // 初始化类型分布图表
    initTypeChart(data) {
      if (!data || data.length === 0) return
      
      const chartDom = document.getElementById('typeChart')
      if (!chartDom) return
      
      this.typeChart = echarts.init(chartDom)
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 10,
          data: data.map(item => this.formatItemType(item.type))
        },
        series: [
          {
            name: '收藏类型',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
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
            data: data.map(item => ({
              value: item.count,
              name: this.formatItemType(item.type)
            }))
          }
        ]
      }
      
      this.typeChart.setOption(option)
    },
    
    // 加载热门内容数据
    loadHotContent() {
      getHotContent()
        .then(res => {
          if (res.code === 0) {
            this.hotContentData = res.data
          } else {
            this.$message.error(res.message || '获取热门内容失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('获取热门内容失败')
        })
    },
    
    // 加载趋势数据
    loadTrendData() {
      getFavoritesTrend(this.trendPeriod)
        .then(res => {
          if (res.code === 0) {
            this.trendData = res.data
            this.initTrendChart()
          } else {
            this.$message.error(res.message || '获取趋势数据失败')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('获取趋势数据失败')
        })
    },
    
    // 初始化趋势图表
    initTrendChart() {
      if (!this.trendData || this.trendData.length === 0) return
      
      const chartDom = document.getElementById('trendChart')
      if (!chartDom) return
      
      this.trendChart = echarts.init(chartDom)
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
        xAxis: [
          {
            type: 'category',
            data: this.trendData.map(item => item.date),
            axisTick: {
              alignWithLabel: true
            }
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        series: [
          {
            name: '收藏数量',
            type: 'bar',
            barWidth: '60%',
            data: this.trendData.map(item => item.count)
          }
        ]
      }
      
      this.trendChart.setOption(option)
    },
    
    // 格式化日期
    formatDate(time) {
      if (time) {
        return formatTimeToStr(time, 'yyyy-MM-dd HH:mm')
      }
      return ''
    },
    
    // 格式化收藏类型
    formatItemType(type) {
      const typeMap = {
        'article': '文章',
        'product': '商品',
        'video': '视频'
      }
      return typeMap[type] || type
    },
    
    // 获取标签类型
    getTagType(type) {
      const typeMap = {
        'article': '',
        'product': 'success',
        'video': 'warning'
      }
      return typeMap[type] || 'info'
    }
  },
  beforeDestroy() {
    // 销毁图表实例，避免内存泄漏
    if (this.typeChart) {
      this.typeChart.dispose()
      this.typeChart = null
    }
    if (this.trendChart) {
      this.trendChart.dispose()
      this.trendChart = null
    }
  }
}
</script>

<style lang="scss" scoped>
.favorites-container {
  padding: 20px;
  
  .favorites-list-card {
    .favorites-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 16px;
      font-weight: bold;
    }
    
    .filter-container {
      margin-bottom: 20px;
      
      .el-form-item {
        margin-bottom: 10px;
      }
    }
    
    .empty-favorites {
      padding: 40px 0;
    }
    
    .favorite-item {
      display: flex;
      align-items: center;
      
      .item-cover {
        width: 50px;
        height: 50px;
        margin-right: 10px;
        overflow: hidden;
        border-radius: 4px;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      
      .item-info {
        flex: 1;
        overflow: hidden;
        
        .item-title {
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .item-summary {
          color: #999;
          font-size: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
      }
    }
    
    .delete-btn {
      color: #F56C6C;
    }
    
    .pagination {
      margin-top: 20px;
      text-align: center;
    }
  }
  
  .favorite-detail {
    .content-preview {
      text-align: center;
      margin-bottom: 20px;
      
      img {
        max-width: 100%;
        max-height: 200px;
        border-radius: 4px;
      }
    }
    
    .detail-item {
      margin-bottom: 15px;
      
      .label {
        color: #606266;
        display: inline-block;
        width: 100px;
        text-align: right;
        margin-right: 10px;
        font-weight: bold;
      }
      
      .value {
        color: #303133;
        
        &.link {
          color: #409EFF;
          cursor: pointer;
          
          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }
  
  .chart-container {
    width: 100%;
    height: 350px;
  }
  
  .date-selector {
    margin-bottom: 20px;
    text-align: center;
  }
}
</style> 