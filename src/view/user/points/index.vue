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
import { listPoints, getUserPoints, addPoints, deletePoints, exportPointsData } from '@/api/admin/points'
import { formatTimeToStr } from '@/utils/date'

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
      }
    }
  },
  created() {
    this.getPointsList()
  },
  methods: {
    // 获取积分列表
    getPointsList() {
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
      
      listPoints(params)
        .then(res => {
          this.loading = false
          if (res.code === 0) {
            this.tableData = res.data.list
            this.total = res.data.total
          } else {
            this.$message.error(res.message || '获取积分列表失败')
          }
        })
        .catch(err => {
          this.loading = false
          console.error(err)
          this.$message.error('获取积分列表失败')
        })
    },
    
    // 处理查询
    handleSearch() {
      this.page = 1
      this.getPointsList()
    },
    
    // 重置查询
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
    
    // 处理每页数量变化
    handleSizeChange(val) {
      this.pageSize = val
      this.getPointsList()
    },
    
    // 处理页码变化
    handleCurrentChange(val) {
      this.page = val
      this.getPointsList()
    },
    
    // 查看积分详情
    handleViewDetail(row) {
      this.currentDetail = row
      this.detailDialogVisible = true
    },
    
    // 打开添加积分弹窗
    handleAddPoints() {
      this.addForm = {
        user_id: '',
        type: 1,
        points: 10,
        description: '',
        source: 'admin'
      }
      this.addDialogVisible = true
      this.$nextTick(() => {
        this.$refs.addForm && this.$refs.addForm.clearValidate()
      })
    },
    
    // 提交添加积分
    submitAddPoints() {
      this.$refs.addForm.validate(valid => {
        if (valid) {
          this.submitLoading = true
          
          addPoints(this.addForm)
            .then(res => {
              this.submitLoading = false
              if (res.code === 0) {
                this.$message.success('积分调整成功')
                this.addDialogVisible = false
                this.getPointsList() // 刷新列表
              } else {
                this.$message.error(res.message || '积分调整失败')
              }
            })
            .catch(err => {
              this.submitLoading = false
              console.error(err)
              this.$message.error('积分调整失败')
            })
        } else {
          return false
        }
      })
    },
    
    // 删除(撤销)积分记录
    handleDelete(row) {
      this.$confirm('确定要撤销该积分调整吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deletePoints(row.id)
          .then(res => {
            if (res.code === 0) {
              this.$message.success('撤销成功')
              this.getPointsList() // 刷新列表
            } else {
              this.$message.error(res.message || '撤销失败')
            }
          })
          .catch(err => {
            console.error(err)
            this.$message.error('撤销失败')
          })
      }).catch(() => {})
    },
    
    // 导出数据
    handleExport() {
      this.$confirm('确定要导出当前查询条件下的积分记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        const params = { ...this.searchForm }
        
        if (this.dateRange && this.dateRange.length === 2) {
          params.start_date = this.dateRange[0]
          params.end_date = this.dateRange[1]
        }
        
        exportPointsData(params)
          .then(res => {
            // 处理文件下载
            const blob = new Blob([res.data], { type: 'application/vnd.ms-excel' })
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = '积分记录导出_' + new Date().getTime() + '.xlsx'
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
    
    // 格式化日期
    formatDate(time) {
      if (time) {
        return formatTimeToStr(time, 'yyyy-MM-dd HH:mm')
      }
      return ''
    },
    
    // 格式化来源
    formatSource(source) {
      const sourceMap = {
        'sign': '签到',
        'purchase': '购买',
        'activity': '活动',
        'system': '系统',
        'admin': '管理员调整'
      }
      return sourceMap[source] || source
    },
    
    // 获取来源标签类型
    getSourceTagType(source) {
      const typeMap = {
        'sign': 'success',
        'purchase': 'primary',
        'activity': 'warning',
        'system': 'info',
        'admin': 'danger'
      }
      return typeMap[source] || ''
    },
    
    // 格式化关联信息
    formatRelatedInfo(detail) {
      if (!detail.related_id || !detail.related_type) {
        return '无关联信息'
      }
      
      const typeMap = {
        'article': '文章',
        'product': '商品',
        'comment': '评论',
        'sign': '签到',
        'order': '订单'
      }
      
      const relatedType = typeMap[detail.related_type] || detail.related_type
      return `${relatedType} ID: ${detail.related_id}`
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