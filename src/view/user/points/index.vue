<template>
  <div class="points-container">
    <el-card shadow="hover" class="points-list-card">
      <div slot="header" class="points-header">
        <span>用户积分管理</span>
        <div class="action-buttons">
          <el-button type="primary" icon="el-icon-plus" size="small" @click="handleAddPoints">调整积分</el-button>
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
          <el-form-item label="积分类型">
            <el-select v-model="searchForm.type" placeholder="积分类型" clearable>
              <el-option label="全部" value=""></el-option>
              <el-option label="增加" :value="1"></el-option>
              <el-option label="减少" :value="2"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="积分来源">
            <el-select v-model="searchForm.source" placeholder="积分来源" clearable>
              <el-option label="全部" value=""></el-option>
              <el-option label="签到" value="sign"></el-option>
              <el-option label="购买" value="purchase"></el-option>
              <el-option label="活动" value="activity"></el-option>
              <el-option label="系统" value="system"></el-option>
              <el-option label="管理员调整" value="admin"></el-option>
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
      
      <div v-if="!tableData.length && !loading" class="empty-points">
        <el-empty description="暂无积分记录" :image-size="120"></el-empty>
      </div>
      
      <el-table
        v-else
        :data="tableData"
        style="width: 100%"
        v-loading="loading"
        border
      >
        <el-table-column prop="id" label="记录ID" min-width="80" align="center"></el-table-column>
        <el-table-column prop="user_id" label="用户ID" min-width="80" align="center"></el-table-column>
        <el-table-column prop="username" label="用户名" min-width="120"></el-table-column>
        <el-table-column prop="description" label="积分说明" min-width="180"></el-table-column>
        <el-table-column prop="source" label="积分来源" min-width="100">
          <template slot-scope="scope">
            <el-tag :type="getSourceTagType(scope.row.source)">
              {{ formatSource(scope.row.source) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="points" label="积分变动" align="center" width="100">
          <template slot-scope="scope">
            <span :class="{ 'increase': scope.row.type === 1, 'decrease': scope.row.type === 2 }">
              {{ scope.row.type === 1 ? '+' : '-' }}{{ scope.row.points }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="total_points" label="变动后积分" align="center" width="100"></el-table-column>
        <el-table-column prop="created_at" label="操作时间" align="center" width="160">
          <template slot-scope="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="150">
          <template slot-scope="scope">
            <el-button 
              type="text" 
              icon="el-icon-view" 
              @click="handleViewDetail(scope.row)">详情</el-button>
            <el-button 
              v-if="scope.row.source === 'admin'"
              type="text" 
              icon="el-icon-delete"
              class="delete-btn"
              @click="handleDelete(scope.row)">撤销</el-button>
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
    
    <!-- 积分详情弹窗 -->
    <el-dialog title="积分详情" :visible.sync="detailDialogVisible" width="500px">
      <div class="points-detail" v-if="currentDetail">
        <div class="detail-item">
          <span class="label">用户ID：</span>
          <span class="value">{{ currentDetail.user_id }}</span>
        </div>
        <div class="detail-item">
          <span class="label">用户名：</span>
          <span class="value">{{ currentDetail.username }}</span>
        </div>
        <div class="detail-item">
          <span class="label">积分变动：</span>
          <span class="value" :class="{ 'increase': currentDetail.type === 1, 'decrease': currentDetail.type === 2 }">
            {{ currentDetail.type === 1 ? '+' : '-' }}{{ currentDetail.points }}
          </span>
        </div>
        <div class="detail-item">
          <span class="label">变动后积分：</span>
          <span class="value">{{ currentDetail.total_points }}</span>
        </div>
        <div class="detail-item">
          <span class="label">积分来源：</span>
          <span class="value">{{ formatSource(currentDetail.source) }}</span>
        </div>
        <div class="detail-item">
          <span class="label">详细说明：</span>
          <span class="value">{{ currentDetail.description }}</span>
        </div>
        <div class="detail-item">
          <span class="label">操作时间：</span>
          <span class="value">{{ formatDate(currentDetail.created_at) }}</span>
        </div>
        <div class="detail-item" v-if="currentDetail.related_id">
          <span class="label">关联信息：</span>
          <span class="value">{{ formatRelatedInfo(currentDetail) }}</span>
        </div>
        <div class="detail-item" v-if="currentDetail.operator">
          <span class="label">操作员：</span>
          <span class="value">{{ currentDetail.operator }}</span>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>
    
    <!-- 添加积分弹窗 -->
    <el-dialog title="调整用户积分" :visible.sync="addDialogVisible" width="500px">
      <el-form :model="addForm" :rules="addRules" ref="addForm" label-width="100px">
        <el-form-item label="用户ID" prop="user_id">
          <el-input v-model.number="addForm.user_id" placeholder="请输入用户ID"></el-input>
        </el-form-item>
        <el-form-item label="调整类型" prop="type">
          <el-radio-group v-model="addForm.type">
            <el-radio :label="1">增加</el-radio>
            <el-radio :label="2">减少</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="积分值" prop="points">
          <el-input-number v-model="addForm.points" :min="1" :max="10000" :step="1" step-strictly></el-input-number>
        </el-form-item>
        <el-form-item label="说明" prop="description">
          <el-input
            type="textarea"
            :rows="3"
            placeholder="请输入积分调整说明"
            v-model="addForm.description">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddPoints" :loading="submitLoading">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { listPoints, getUserPoints, addPoints, deletePoints, exportPointsData, getPointsStatistics } from '@/api/admin/points'
import { formatTimeToStr } from '@/utils/date'
import { mapGetters } from 'vuex'
import { checkPermission } from '@/utils/permission'
import { debounce } from 'lodash'
import { logOperation } from '@/utils/logger'

export default {
  name: 'PointsManagement',
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
        type: '',
        source: ''
      },
      dateRange: [],
      detailDialogVisible: false,
      addDialogVisible: false,
      currentDetail: null,
      submitLoading: false,
      addForm: {
        user_id: '',
        type: 1,
        points: 10,
        description: '',
        source: 'admin'
      },
      addRules: {
        user_id: [
          { required: true, message: '请输入用户ID', trigger: 'blur' },
          { type: 'number', message: '用户ID必须为数字', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择调整类型', trigger: 'change' }
        ],
        points: [
          { required: true, message: '请输入积分值', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入积分调整说明', trigger: 'blur' },
          { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
        ]
      },
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
      statistics: null,
      permissions: {
        add: 'points:add',
        delete: 'points:delete',
        export: 'points:export',
        view: 'points:view'
      },
      searchHistory: [],
      userPreferences: {
        pageSize: 10,
        defaultSearch: null
      },
      isMobile: false
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'roles']),
    
    hasAddPermission() {
      return checkPermission(this.permissions.add, this.roles)
    },
    
    hasDeletePermission() {
      return checkPermission(this.permissions.delete, this.roles)
    },
    
    hasExportPermission() {
      return checkPermission(this.permissions.export, this.roles)
    }
  },
  created() {
    this.loadUserPreferences()
    this.checkMobile()
    this.getPointsList()
    this.getStatistics()
    window.addEventListener('resize', debounce(this.checkMobile, 200))
  },
  beforeDestroy() {
    this.saveUserPreferences()
    window.removeEventListener('resize', this.checkMobile)
  },
  methods: {
    async getPointsList() {
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
        
        const res = await listPoints(params)
        if (res.code === 0) {
          this.tableData = res.data.list
          this.total = res.data.total
          
          if (this.tableData.length === 0 && this.total > 0 && this.page > 1) {
            this.page = 1
            this.getPointsList()
          }
        } else {
          this.$message.error(res.message || '获取积分列表失败')
        }
      } catch (error) {
        console.error('获取积分列表出错:', error)
        this.$message.error('获取积分列表出错')
      } finally {
        this.loading = false
      }
    },
    
    async getStatistics() {
      try {
        const res = await getPointsStatistics()
        if (res.code === 0) {
          this.statistics = res.data
        }
      } catch (error) {
        console.error('获取统计数据出错:', error)
      }
    },
    
    handleSearch() {
      this.page = 1
      this.getPointsList()
      
      const searchItem = {
        ...this.searchForm,
        dateRange: [...this.dateRange],
        timestamp: new Date().getTime()
      }
      
      this.searchHistory.unshift(searchItem)
      if (this.searchHistory.length > 10) {
        this.searchHistory.pop()
      }
      
      localStorage.setItem('points_search_history', JSON.stringify(this.searchHistory))
    },
    
    resetSearch() {
      this.searchForm = {
        user_id: '',
        username: '',
        type: '',
        source: ''
      }
      this.dateRange = []
      this.page = 1
      this.getPointsList()
    },
    
    async handleViewDetail(row) {
      if (!checkPermission(this.permissions.view, this.roles)) {
        this.$message.warning('您没有查看详情的权限')
        return
      }
      
      try {
        this.loading = true
        const res = await getPointById(row.id)
        if (res.code === 0) {
          this.currentDetail = res.data
          this.detailDialogVisible = true
          
          logOperation({
            module: '积分管理',
            operationType: '查看详情',
            target: `积分记录ID: ${row.id}`,
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
    
    handleAddPoints() {
      if (!this.hasAddPermission) {
        this.$message.warning('您没有调整积分的权限')
        return
      }
      
      this.addForm = {
        user_id: '',
        type: 1,
        points: 10,
        description: '',
        source: 'admin'
      }
      this.addDialogVisible = true
    },
    
    async submitAddPoints() {
      if (!this.$refs.addForm) return
      
      this.$refs.addForm.validate(async valid => {
        if (!valid) return
        
        this.submitLoading = true
        try {
          const data = {
            user_id: this.addForm.user_id,
            type: this.addForm.type,
            points: this.addForm.points,
            description: this.addForm.description,
            source: 'admin',
            operator_id: this.userInfo.id
          }
          
          const res = await addPoints(data)
          if (res.code === 0) {
            this.$message.success('积分调整成功')
            this.addDialogVisible = false
            this.getPointsList()
            this.getStatistics()
            
            logOperation({
              module: '积分管理',
              operationType: '调整积分',
              target: `用户ID: ${data.user_id}, 积分: ${data.type === 1 ? '+' : '-'}${data.points}`,
              operator: this.userInfo.username,
              result: '成功'
            })
          } else {
            this.$message.error(res.message || '积分调整失败')
            
            logOperation({
              module: '积分管理',
              operationType: '调整积分',
              target: `用户ID: ${data.user_id}, 积分: ${data.type === 1 ? '+' : '-'}${data.points}`,
              operator: this.userInfo.username,
              result: '失败',
              errorMsg: res.message
            })
          }
        } catch (error) {
          console.error('调整积分出错:', error)
          this.$message.error('调整积分出错')
          
          logOperation({
            module: '积分管理',
            operationType: '调整积分',
            target: `用户ID: ${this.addForm.user_id}`,
            operator: this.userInfo.username,
            result: '失败',
            errorMsg: error.message
          })
        } finally {
          this.submitLoading = false
        }
      })
    },
    
    async handleDelete(row) {
      if (!this.hasDeletePermission) {
        this.$message.warning('您没有撤销权限')
        return
      }
      
      if (row.source !== 'admin') {
        this.$message.warning('只能撤销管理员调整的积分')
        return
      }
      
      try {
        await this.$confirm('确定要撤销此积分调整吗？此操作不可逆', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        this.loading = true
        const res = await deletePoints(row.id)
        
        if (res.code === 0) {
          this.$message.success('撤销成功')
          this.getPointsList()
          this.getStatistics()
          
          logOperation({
            module: '积分管理',
            operationType: '撤销积分',
            target: `积分记录ID: ${row.id}, 用户ID: ${row.user_id}`,
            operator: this.userInfo.username,
            result: '成功'
          })
        } else {
          this.$message.error(res.message || '撤销失败')
          
          logOperation({
            module: '积分管理',
            operationType: '撤销积分',
            target: `积分记录ID: ${row.id}, 用户ID: ${row.user_id}`,
            operator: this.userInfo.username,
            result: '失败',
            errorMsg: res.message
          })
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('撤销积分出错:', error)
          this.$message.error('撤销积分出错')
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
        
        const res = await exportPointsData(params)
        
        const blob = new Blob([res], { type: 'application/vnd.ms-excel' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `积分记录_${new Date().getTime()}.xlsx`
        link.click()
        URL.revokeObjectURL(link.href)
        
        this.$message.success('导出成功')
        
        logOperation({
          module: '积分管理',
          operationType: '导出数据',
          target: `积分记录`,
          operator: this.userInfo.username,
          result: '成功'
        })
      } catch (error) {
        console.error('导出数据出错:', error)
        this.$message.error('导出数据出错')
        
        logOperation({
          module: '积分管理',
          operationType: '导出数据',
          target: `积分记录`,
          operator: this.userInfo.username,
          result: '失败',
          errorMsg: error.message
        })
      } finally {
        this.loading = false
      }
    },
    
    handleSizeChange(val) {
      this.pageSize = val
      this.userPreferences.pageSize = val
      this.getPointsList()
    },
    
    handleCurrentChange(val) {
      this.page = val
      this.getPointsList()
    },
    
    formatDate(timestamp) {
      return formatTimeToStr(timestamp, 'yyyy-MM-dd hh:mm:ss')
    },
    
    formatSource(source) {
      const sourceMap = {
        'sign': '签到',
        'purchase': '购买',
        'activity': '活动',
        'system': '系统',
        'admin': '管理员调整',
        'comment': '评论',
        'share': '分享'
      }
      return sourceMap[source] || source
    },
    
    getSourceTagType(source) {
      const typeMap = {
        'sign': 'success',
        'purchase': 'primary',
        'activity': 'warning',
        'system': 'info',
        'admin': 'danger',
        'comment': 'success',
        'share': 'primary'
      }
      return typeMap[source] || 'info'
    },
    
    formatRelatedInfo(record) {
      if (!record.related_id || !record.related_type) return '无'
      
      const typeMap = {
        'order': '订单',
        'activity': '活动',
        'comment': '评论',
        'share': '分享'
      }
      
      return `${typeMap[record.related_type] || record.related_type}ID: ${record.related_id}`
    },
    
    loadUserPreferences() {
      try {
        const savedPrefs = localStorage.getItem('points_preferences')
        if (savedPrefs) {
          const prefs = JSON.parse(savedPrefs)
          this.userPreferences = { ...this.userPreferences, ...prefs }
          this.pageSize = prefs.pageSize || 10
        }
        
        const searchHistory = localStorage.getItem('points_search_history')
        if (searchHistory) {
          this.searchHistory = JSON.parse(searchHistory)
        }
      } catch (error) {
        console.error('加载用户偏好设置出错:', error)
      }
    },
    
    saveUserPreferences() {
      try {
        localStorage.setItem('points_preferences', JSON.stringify(this.userPreferences))
      } catch (error) {
        console.error('保存用户偏好设置出错:', error)
      }
    },
    
    checkMobile() {
      this.isMobile = window.innerWidth < 768
    }
  }
}
</script>

<style lang="scss" scoped>
.points-container {
  padding: 20px;
  
  .points-list-card {
    .points-header {
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
    
    .empty-points {
      padding: 40px 0;
    }
    
    .increase {
      color: #67C23A;
      font-weight: bold;
    }
    
    .decrease {
      color: #F56C6C;
      font-weight: bold;
    }
    
    .delete-btn {
      color: #F56C6C;
    }
    
    .pagination {
      margin-top: 20px;
      text-align: center;
    }
  }
  
  .points-detail {
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
        
        &.increase {
          color: #67C23A;
          font-weight: bold;
        }
        
        &.decrease {
          color: #F56C6C;
          font-weight: bold;
        }
      }
    }
  }
}
</style> 