<template>
  <div class="order-container">
    <el-card shadow="hover" class="order-list-card">
      <div slot="header" class="order-header">
        <span>订单管理</span>
        <div class="action-buttons">
          <el-button type="primary" icon="el-icon-s-data" size="small" @click="showStatistics">订单统计</el-button>
          <el-button type="success" icon="el-icon-download" size="small" @click="handleExport">导出数据</el-button>
        </div>
      </div>
      
      <!-- 筛选表单 -->
      <div class="filter-container">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="订单编号">
            <el-input v-model="searchForm.order_no" placeholder="订单编号" clearable></el-input>
          </el-form-item>
          <el-form-item label="用户ID">
            <el-input v-model="searchForm.user_id" placeholder="用户ID" clearable></el-input>
          </el-form-item>
          <el-form-item label="订单状态">
            <el-select v-model="searchForm.status" placeholder="订单状态" clearable>
              <el-option label="全部" value=""></el-option>
              <el-option label="待支付" :value="0"></el-option>
              <el-option label="已支付" :value="1"></el-option>
              <el-option label="已发货" :value="2"></el-option>
              <el-option label="已完成" :value="3"></el-option>
              <el-option label="已取消" :value="4"></el-option>
              <el-option label="已退款" :value="5"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="支付方式">
            <el-select v-model="searchForm.pay_type" placeholder="支付方式" clearable>
              <el-option label="全部" value=""></el-option>
              <el-option label="支付宝" :value="1"></el-option>
              <el-option label="微信" :value="2"></el-option>
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
      
      <!-- 订单列表 -->
      <el-table
        :data="tableData"
        style="width: 100%"
        v-loading="loading"
        border
      >
        <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="order_no" label="订单编号" min-width="180"></el-table-column>
        <el-table-column prop="user_id" label="用户ID" width="100" align="center"></el-table-column>
        <el-table-column prop="total_amount" label="总金额" width="120" align="right">
          <template slot-scope="scope">
            ¥ {{ scope.row.total_amount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="pay_amount" label="实付金额" width="120" align="right">
          <template slot-scope="scope">
            ¥ {{ scope.row.pay_amount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="订单状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getOrderStatusType(scope.row.status)">
              {{ formatOrderStatus(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="pay_type" label="支付方式" width="100" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.pay_type" :type="scope.row.pay_type === 1 ? 'primary' : 'success'">
              {{ formatPayType(scope.row.pay_type) }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="160" align="center">
          <template slot-scope="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" align="center">
          <template slot-scope="scope">
            <el-button type="text" icon="el-icon-view" @click="viewDetail(scope.row)">详情</el-button>
            <el-button type="text" icon="el-icon-truck" v-if="scope.row.status === 1" @click="handleShip(scope.row)">发货</el-button>
            <el-button type="text" icon="el-icon-refresh-left" v-if="scope.row.status === 1" @click="handleRefund(scope.row)">退款</el-button>
            <el-button type="text" icon="el-icon-close" class="cancel-btn" v-if="scope.row.status === 0" @click="handleCancel(scope.row)">取消</el-button>
            <el-button type="text" icon="el-icon-delete" class="delete-btn" v-if="scope.row.status === 3 || scope.row.status === 4 || scope.row.status === 5" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
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
    
    <!-- 详情弹窗、发货弹窗、统计弹窗在这里 -->
    
  </div>
</template>

<script>
import { 
  listOrders, 
  getOrderDetail, 
  cancelOrder, 
  shipOrder,
  refundOrder,
  deleteOrder,
  exportOrdersData,
  getOrdersStatistics,
  getStatusStatistics,
  getPaymentTypeStatistics,
  getOrdersTrend
} from '@/api/admin/trade/orders'
import { formatTimeToStr } from '@/utils/date'
import { mapGetters } from 'vuex'
import { checkPermission } from '@/utils/permission'
import { debounce } from 'lodash'
import { logOperation } from '@/utils/logger'
import * as echarts from 'echarts'

export default {
  name: 'OrderManagement',
  data() {
    return {
      tableData: [],
      page: 1,
      pageSize: 10,
      total: 0,
      loading: false,
      searchForm: {
        order_no: '',
        user_id: '',
        status: '',
        pay_type: ''
      },
      dateRange: [],
      detailDialogVisible: false,
      shipDialogVisible: false,
      statsDialogVisible: false,
      currentDetail: null,
      shipForm: {
        logistics_company: '',
        logistics_no: '',
        remark: ''
      },
      shipRules: {
        logistics_company: [{ required: true, message: '请选择物流公司', trigger: 'change' }],
        logistics_no: [{ required: true, message: '请输入物流单号', trigger: 'blur' }]
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
      activeTab: 'statusAnalysis',
      trendPeriod: 'month',
      permissions: {
        view: 'orders:view',
        create: 'orders:create',
        edit: 'orders:edit',
        delete: 'orders:delete',
        export: 'orders:export',
        stats: 'orders:stats'
      },
      userPreferences: {
        pageSize: 10,
        defaultActiveTab: 'statusAnalysis'
      },
      chartInstance: null
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'roles']),
    hasViewPermission() {
      return checkPermission(this.permissions.view, this.roles)
    },
    hasCreatePermission() {
      return checkPermission(this.permissions.create, this.roles)
    },
    hasEditPermission() {
      return checkPermission(this.permissions.edit, this.roles)
    },
    hasDeletePermission() {
      return checkPermission(this.permissions.delete, this.roles)
    },
    hasExportPermission() {
      return checkPermission(this.permissions.export, this.roles)
    },
    hasStatsPermission() {
      return checkPermission(this.permissions.stats, this.roles)
    }
  },
  created() {
    this.loadUserPreferences()
    this.getOrdersList()
  },
  mounted() {
    window.addEventListener('resize', debounce(this.handleResize, 200))
  },
  beforeDestroy() {
    this.saveUserPreferences()
    window.removeEventListener('resize', this.handleResize)
    this.destroyChart()
  },
  methods: {
    // 获取订单列表
    async getOrdersList() {
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
        
        const res = await listOrders(params)
        if (res.code === 0) {
          this.tableData = res.data.list
          this.total = res.data.total
        } else {
          this.$message.error(res.message || '获取订单列表失败')
        }
      } catch (error) {
        console.error('获取订单列表出错:', error)
        this.$message.error('获取订单列表出错')
      } finally {
        this.loading = false
      }
    },
    
    // 格式化订单状态
    formatOrderStatus(status) {
      const statusMap = {
        0: '待支付',
        1: '已支付',
        2: '已发货',
        3: '已完成',
        4: '已取消',
        5: '已退款'
      }
      return statusMap[status] || status
    },
    
    // 获取订单状态类型
    getOrderStatusType(status) {
      const typeMap = {
        0: 'warning',
        1: 'primary',
        2: 'success',
        3: 'success',
        4: 'info',
        5: 'danger'
      }
      return typeMap[status] || 'info'
    },
    
    // 格式化支付方式
    formatPayType(payType) {
      const payTypeMap = {
        1: '支付宝',
        2: '微信'
      }
      return payTypeMap[payType] || payType
    },
    
    // 格式化日期
    formatDate(timestamp) {
      return formatTimeToStr(timestamp, 'yyyy-MM-dd hh:mm:ss')
    },
    
    // 处理搜索
    handleSearch() {
      this.page = 1
      this.getOrdersList()
    },
    
    // 重置搜索
    resetSearch() {
      this.searchForm = {
        order_no: '',
        user_id: '',
        status: '',
        pay_type: ''
      }
      this.dateRange = []
      this.page = 1
      this.getOrdersList()
    },
    
    // 加载用户偏好设置
    loadUserPreferences() {
      try {
        const savedPrefs = localStorage.getItem('order_preferences')
        if (savedPrefs) {
          this.userPreferences = JSON.parse(savedPrefs)
          this.pageSize = this.userPreferences.pageSize || 10
        }
      } catch (error) {
        console.error('加载用户偏好设置出错:', error)
      }
    },
    
    // 保存用户偏好设置
    saveUserPreferences() {
      try {
        localStorage.setItem('order_preferences', JSON.stringify(this.userPreferences))
      } catch (error) {
        console.error('保存用户偏好设置出错:', error)
      }
    },
    
    // 处理窗口大小调整
    handleResize() {
      if (this.chartInstance && this.statsDialogVisible) {
        this.chartInstance.resize()
      }
    },
    
    // 销毁图表
    destroyChart() {
      if (this.chartInstance) {
        this.chartInstance.dispose()
        this.chartInstance = null
      }
    },
    
    // 处理页码变化
    handleCurrentChange(val) {
      this.page = val
      this.getOrdersList()
    },
    
    // 处理每页数量变化
    handleSizeChange(val) {
      this.pageSize = val
      this.userPreferences.pageSize = val
      this.page = 1
      this.getOrdersList()
    }
  }
}
</script>

<style lang="scss" scoped>
.order-container {
  padding: 20px;
  
  .order-list-card {
    .order-header {
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
    
    .cancel-btn {
      color: #E6A23C;
    }
    
    .delete-btn {
      color: #F56C6C;
    }
    
    .pagination {
      margin-top: 20px;
      text-align: center;
    }
  }
}
</style> 