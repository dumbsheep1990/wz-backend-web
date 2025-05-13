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
      
      <!-- 批量操作工具栏 -->
      <div class="batch-actions" v-if="hasMultipleSelection">
        <el-button type="danger" size="small" @click="handleBatchDelete">批量删除</el-button>
        <span class="selected-count">已选择 {{ selectedRows.length }} 条记录</span>
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
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center"></el-table-column>
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
  getFavoritesTrend,
  batchDeleteFavorites
} from '@/api/admin/favorites'
import { formatTimeToStr } from '@/utils/date'
import { mapGetters } from 'vuex'
import { checkPermission } from '@/utils/permission'
import { debounce } from 'lodash'
import { logOperation } from '@/utils/logger'
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
      },
      permissions: {
        view: 'favorites:view',
        delete: 'favorites:delete',
        export: 'favorites:export',
        stats: 'favorites:stats'
      },
      userPreferences: {
        pageSize: 10,
        defaultActiveTab: 'typeDistribution'
      },
      searchHistory: [],
      selectedRows: [],
      isMobile: false,
      chartInstance: null
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'roles']),
    hasDeletePermission() {
      return checkPermission(this.permissions.delete, this.roles)
    },
    hasExportPermission() {
      return checkPermission(this.permissions.export, this.roles)
    },
    hasStatPermission() {
      return checkPermission(this.permissions.stats, this.roles)
    },
    hasMultipleSelection() {
      return this.selectedRows.length > 0
    }
  },
  created() {
    this.loadUserPreferences()
    this.checkMobile()
    this.getFavoritesList()
    window.addEventListener('resize', debounce(this.handleResize, 200))
  },
  beforeDestroy() {
    this.saveUserPreferences()
    window.removeEventListener('resize', this.handleResize)
    this.destroyChart()
  },
  methods: {
    async getFavoritesList() {
      this.loading = true
      try {
        const params = {
          page: this.page,
          pageSize: this.pageSize,
          ...this.searchForm
        }
        
        if (this.dateRange && this.dateRange.length === 2) {
          params.start_date = this.dateRange[0]
          params.end_date = this.dateRange[1]
        }
        
        const res = await listFavorites(params)
        if (res.code === 0) {
          this.tableData = res.data.list
          this.total = res.data.total
          
          if (this.tableData.length === 0 && this.total > 0 && this.page > 1) {
            this.page = 1
            this.getFavoritesList()
          }
        } else {
          this.$message.error(res.message || '获取收藏列表失败')
        }
      } catch (error) {
        console.error('获取收藏列表出错:', error)
        this.$message.error('获取收藏列表出错')
      } finally {
        this.loading = false
      }
    },
    handleSearch() {
      this.page = 1
      this.getFavoritesList()
      
      const searchItem = {
        ...this.searchForm,
        dateRange: [...this.dateRange],
        timestamp: new Date().getTime()
      }
      
      this.searchHistory.unshift(searchItem)
      if (this.searchHistory.length > 10) {
        this.searchHistory.pop()
      }
      
      localStorage.setItem('favorites_search_history', JSON.stringify(this.searchHistory))
    },
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
    async viewDetail(row) {
      if (!checkPermission(this.permissions.view, this.roles)) {
        this.$message.warning('您没有查看详情的权限')
        return
      }
      
      try {
        this.loading = true
        const res = await getFavoriteDetail(row.id)
        if (res.code === 0) {
          this.currentDetail = res.data
          this.detailDialogVisible = true
          
          logOperation({
            module: '收藏管理',
            operationType: '查看详情',
            target: `收藏ID: ${row.id}, 用户ID: ${row.user_id}`,
            operator: this.userInfo.username,
            result: '成功'
          })
        } else {
          this.$message.error(res.message || '获取详情失败')
        }
      } catch (error) {
        console.error('获取详情出错:', error)
        this.$message.error('获取详情出错')
      } finally {
        this.loading = false
      }
    },
    openContent() {
      if (!this.currentDetail || !this.currentDetail.url) return
      
      window.open(this.currentDetail.url, '_blank')
    },
    async handleDelete(row) {
      if (!this.hasDeletePermission) {
        this.$message.warning('您没有删除权限')
        return
      }
      
      try {
        await this.$confirm('确定要删除这条收藏记录吗？此操作不可恢复', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        this.loading = true
        const res = await deleteFavorite(row.id)
        
        if (res.code === 0) {
          this.$message.success('删除成功')
          this.getFavoritesList()
          
          logOperation({
            module: '收藏管理',
            operationType: '删除收藏',
            target: `收藏ID: ${row.id}, 用户ID: ${row.user_id}`,
            operator: this.userInfo.username,
            result: '成功'
          })
        } else {
          this.$message.error(res.message || '删除失败')
          
          logOperation({
            module: '收藏管理',
            operationType: '删除收藏',
            target: `收藏ID: ${row.id}, 用户ID: ${row.user_id}`,
            operator: this.userInfo.username,
            result: '失败',
            errorMsg: res.message
          })
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除收藏出错:', error)
          this.$message.error('删除收藏出错')
        }
      } finally {
        this.loading = false
      }
    },
    async handleExport() {
      if (!this.hasExportPermission) {
        this.$message.warning('您没有导出权限')
        return
      }
      
      try {
        this.loading = true
        this.$message.info('正在导出数据，请稍候...')
        
        const params = { ...this.searchForm }
        
        if (this.dateRange && this.dateRange.length === 2) {
          params.start_date = this.dateRange[0]
          params.end_date = this.dateRange[1]
        }
        
        const res = await exportFavoritesData(params)
        
        const blob = new Blob([res], { type: 'application/vnd.ms-excel' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `收藏记录_${new Date().getTime()}.xlsx`
        link.click()
        URL.revokeObjectURL(link.href)
        
        this.$message.success('导出成功')
        
        logOperation({
          module: '收藏管理',
          operationType: '导出数据',
          target: `收藏记录`,
          operator: this.userInfo.username,
          result: '成功'
        })
      } catch (error) {
        console.error('导出数据出错:', error)
        this.$message.error('导出数据出错')
        
        logOperation({
          module: '收藏管理',
          operationType: '导出数据',
          target: `收藏记录`,
          operator: this.userInfo.username,
          result: '失败',
          errorMsg: error.message
        })
      } finally {
        this.loading = false
      }
    },
    async showStatistics() {
      if (!this.hasStatPermission) {
        this.$message.warning('您没有查看统计数据的权限')
        return
      }
      
      this.statsDialogVisible = true
      this.activeTab = this.userPreferences.defaultActiveTab || 'typeDistribution'
      
      await this.loadStatisticsData()
      
      this.$nextTick(() => {
        this.renderChart()
      })
      
      logOperation({
        module: '收藏管理',
        operationType: '查看统计数据',
        target: '收藏统计分析',
        operator: this.userInfo.username,
        result: '成功'
      })
    },
    async loadStatisticsData() {
      try {
        this.loading = true
        
        if (this.activeTab === 'typeDistribution') {
          const res = await getFavoritesStatistics()
          if (res.code === 0) {
            this.typeDistributionData = res.data.typeDistribution || []
          }
        }
        
        if (this.activeTab === 'hotContent') {
          const res = await getHotContent()
          if (res.code === 0) {
            this.hotContentData = res.data || []
          }
        }
        
        if (this.activeTab === 'trend') {
          await this.loadTrendData()
        }
      } catch (error) {
        console.error('加载统计数据出错:', error)
        this.$message.error('加载统计数据出错')
      } finally {
        this.loading = false
      }
    },
    async loadTrendData() {
      try {
        const res = await getFavoritesTrend(this.trendPeriod)
        if (res.code === 0) {
          this.trendData = res.data || []
          
          if (this.activeTab === 'trend') {
            this.$nextTick(() => {
              this.renderTrendChart()
            })
          }
        }
      } catch (error) {
        console.error('加载趋势数据出错:', error)
        this.$message.error('加载趋势数据出错')
      }
    },
    async handleTabChange(tab) {
      this.activeTab = tab
      
      this.userPreferences.defaultActiveTab = tab
      
      await this.loadStatisticsData()
      
      this.$nextTick(() => {
        this.renderChart()
      })
    },
    renderChart() {
      if (this.activeTab === 'typeDistribution') {
        this.renderTypeChart()
      } else if (this.activeTab === 'trend') {
        this.renderTrendChart()
      }
    },
    renderTypeChart() {
      this.destroyChart()
      
      if (!this.typeDistributionData.length) return
      
      const chartDom = document.getElementById('typeChart')
      if (!chartDom) return
      
      this.chartInstance = echarts.init(chartDom)
      
      const option = {
        title: {
          text: '收藏类型分布',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: this.typeDistributionData.map(item => this.formatItemType(item.type))
        },
        series: [
          {
            name: '收藏类型',
            type: 'pie',
            radius: ['40%', '70%'],
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
            data: this.typeDistributionData.map(item => ({
              value: item.count,
              name: this.formatItemType(item.type)
            }))
          }
        ]
      }
      
      this.chartInstance.setOption(option)
    },
    renderTrendChart() {
      this.destroyChart()
      
      if (!this.trendData.length) return
      
      const chartDom = document.getElementById('trendChart')
      if (!chartDom) return
      
      this.chartInstance = echarts.init(chartDom)
      
      const dates = this.trendData.map(item => item.time_unit)
      const counts = this.trendData.map(item => item.count)
      
      const option = {
        title: {
          text: '收藏趋势分析',
          left: 'center'
        },
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
          data: dates,
          axisTick: {
            alignWithLabel: true
          }
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '收藏数量',
            type: 'bar',
            barWidth: '60%',
            data: counts
          }
        ]
      }
      
      this.chartInstance.setOption(option)
    },
    destroyChart() {
      if (this.chartInstance) {
        this.chartInstance.dispose()
        this.chartInstance = null
      }
    },
    handleResize() {
      this.checkMobile()
      
      if (this.chartInstance && this.statsDialogVisible) {
        this.chartInstance.resize()
      }
    },
    handleSelectionChange(rows) {
      this.selectedRows = rows
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.userPreferences.pageSize = val
      this.getFavoritesList()
    },
    handleCurrentChange(val) {
      this.page = val
      this.getFavoritesList()
    },
    formatDate(timestamp) {
      return formatTimeToStr(timestamp, 'yyyy-MM-dd hh:mm:ss')
    },
    formatItemType(type) {
      const typeMap = {
        'article': '文章',
        'product': '商品',
        'video': '视频',
        'course': '课程',
        'audio': '音频'
      }
      return typeMap[type] || type
    },
    getTagType(type) {
      const typeMap = {
        'article': 'success',
        'product': 'primary',
        'video': 'warning',
        'course': 'info',
        'audio': 'danger'
      }
      return typeMap[type] || 'info'
    },
    loadUserPreferences() {
      try {
        const savedPrefs = localStorage.getItem('favorites_preferences')
        if (savedPrefs) {
          const prefs = JSON.parse(savedPrefs)
          this.userPreferences = { ...this.userPreferences, ...prefs }
          this.pageSize = prefs.pageSize || 10
        }
        
        const searchHistory = localStorage.getItem('favorites_search_history')
        if (searchHistory) {
          this.searchHistory = JSON.parse(searchHistory)
        }
      } catch (error) {
        console.error('加载用户偏好设置出错:', error)
      }
    },
    saveUserPreferences() {
      try {
        localStorage.setItem('favorites_preferences', JSON.stringify(this.userPreferences))
      } catch (error) {
        console.error('保存用户偏好设置出错:', error)
      }
    },
    checkMobile() {
      this.isMobile = window.innerWidth < 768
    },
    async handleBatchDelete() {
      if (!this.hasDeletePermission) {
        this.$message.warning('您没有批量删除权限')
        return
      }
      
      try {
        await this.$confirm('确定要批量删除这些收藏记录吗？此操作不可恢复', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        this.loading = true
        const res = await batchDeleteFavorites(this.selectedRows.map(row => row.id))
        
        if (res.code === 0) {
          this.$message.success('批量删除成功')
          this.getFavoritesList()
          
          logOperation({
            module: '收藏管理',
            operationType: '批量删除收藏',
            target: `收藏ID: ${this.selectedRows.map(row => row.id).join(', ')}, 用户ID: ${this.selectedRows.map(row => row.user_id).join(', ')}`,
            operator: this.userInfo.username,
            result: '成功'
          })
        } else {
          this.$message.error(res.message || '批量删除失败')
          
          logOperation({
            module: '收藏管理',
            operationType: '批量删除收藏',
            target: `收藏ID: ${this.selectedRows.map(row => row.id).join(', ')}, 用户ID: ${this.selectedRows.map(row => row.user_id).join(', ')}`,
            operator: this.userInfo.username,
            result: '失败',
            errorMsg: res.message
          })
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('批量删除收藏出错:', error)
          this.$message.error('批量删除收藏出错')
        }
      } finally {
        this.loading = false
      }
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
        width: 60px;
        height: 60px;
        margin-right: 10px;
        overflow: hidden;
        border-radius: 3px;
        
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
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .item-summary {
          color: #606266;
          font-size: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
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
      width: 100%;
      margin-bottom: 15px;
      text-align: center;
      
      img {
        max-width: 100%;
        max-height: 200px;
        object-fit: contain;
        border-radius: 5px;
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
        
        &.link a {
          color: #409EFF;
        }
      }
    }
  }
  
  .chart-container {
    height: 400px;
    margin: 20px 0;
  }
  
  .date-selector {
    margin-bottom: 20px;
    text-align: center;
  }
  
  .batch-actions {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    
    .selected-count {
      margin-left: 10px;
      color: #606266;
      font-size: 13px;
    }
  }
  
  @media screen and (max-width: 768px) {
    .favorites-header {
      flex-direction: column;
      align-items: flex-start;
      
      .action-buttons {
        margin-top: 10px;
        align-self: flex-end;
      }
    }
    
    .filter-container {
      .el-form-item {
        width: 100%;
      }
    }
    
    .favorite-item {
      .item-cover {
        width: 40px;
        height: 40px;
      }
    }
    
    .chart-container {
      height: 300px;
    }
  }
}
</style> 