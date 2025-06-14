<template>
  <div class="app-container">
    <!-- Filters -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        placeholder="学员姓名/证书编号"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select v-model="listQuery.status" placeholder="状态" clearable style="width: 120px" class="filter-item">
        <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-select v-model="listQuery.courseId" placeholder="课程" clearable filterable style="width: 200px" class="filter-item">
        <el-option v-for="item in courseOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        style="width: 290px"
        class="filter-item"
        value-format="yyyy-MM-dd"
        @change="handleDateRange"
      />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-plus"
        @click="handleBatchGenerate"
      >
        批量生成
      </el-button>
    </div>

    <!-- Certificate table -->
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="证书ID" align="center" width="120">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column label="证书编号" width="180">
        <template slot-scope="{row}">
          <el-link type="primary" @click="viewCertificate(row)">{{ row.certificateNumber }}</el-link>
        </template>
      </el-table-column>

      <el-table-column label="学员" width="150">
        <template slot-scope="{row}">
          <el-link type="primary" @click="viewUserInfo(row.userId)">{{ row.userName }}</el-link>
        </template>
      </el-table-column>

      <el-table-column label="课程" min-width="180">
        <template slot-scope="{row}">
          <el-link type="primary" @click="viewCourse(row.courseId)">{{ row.courseName }}</el-link>
        </template>
      </el-table-column>

      <el-table-column label="颁发日期" width="160" align="center">
        <template slot-scope="{row}">
          <span>{{ row.issuedAt | parseTime }}</span>
        </template>
      </el-table-column>

      <el-table-column label="有效期至" width="160" align="center">
        <template slot-scope="{row}">
          <span v-if="row.expiresAt">{{ row.expiresAt | parseTime }}</span>
          <span v-else>永久有效</span>
        </template>
      </el-table-column>

      <el-table-column label="状态" width="100" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ statusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="验证次数" width="100" align="center">
        <template slot-scope="{row}">
          <span>{{ row.verificationCount || 0 }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="280">
        <template slot-scope="{row}">
          <el-button size="mini" type="primary" @click="viewCertificate(row)">
            查看
          </el-button>
          <el-button size="mini" type="success" @click="downloadCertificate(row)">
            下载
          </el-button>
          <el-button size="mini" type="info" @click="verifyCertificate(row)">
            验证
          </el-button>
          <el-button
            v-if="row.status === 'active'"
            size="mini"
            type="warning"
            @click="handleRevoke(row)"
          >
            撤销
          </el-button>
          <el-button
            v-if="row.status === 'revoked'"
            size="mini"
            type="success"
            @click="handleReactivate(row)"
          >
            恢复
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <!-- Certificate Preview Dialog -->
    <el-dialog title="证书预览" :visible.sync="dialogPreviewVisible" width="80%">
      <div v-if="currentCertificate" class="certificate-preview">
        <div class="certificate-info">
          <h3>{{ currentCertificate.courseName }} 完成证书</h3>
          <p><strong>证书编号：</strong>{{ currentCertificate.certificateNumber }}</p>
          <p><strong>学员姓名：</strong>{{ currentCertificate.userName }}</p>
          <p><strong>颁发日期：</strong>{{ currentCertificate.issuedAt | parseTime }}</p>
          <p><strong>有效期：</strong>{{ currentCertificate.expiresAt ? (currentCertificate.expiresAt | parseTime) : '永久有效' }}</p>
        </div>
        <div class="certificate-image" v-if="currentCertificate.imageUrl">
          <el-image
            :src="currentCertificate.imageUrl"
            fit="contain"
            style="width: 100%; max-height: 500px;"
            :preview-src-list="[currentCertificate.imageUrl]"
          />
        </div>
        <div v-else class="certificate-placeholder">
          <i class="el-icon-document" style="font-size: 64px; color: #ddd;"></i>
          <p>证书图片生成中...</p>
        </div>
      </div>
    </el-dialog>

    <!-- Batch Generate Dialog -->
    <el-dialog title="批量生成证书" :visible.sync="dialogBatchVisible">
      <el-form
        ref="batchForm"
        :model="batchForm"
        label-position="left"
        label-width="120px"
      >
        <el-form-item label="选择课程" prop="courseId">
          <el-select v-model="batchForm.courseId" filterable placeholder="请选择课程" style="width: 100%">
            <el-option
              v-for="item in courseOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="生成条件">
          <el-checkbox v-model="batchForm.onlyCompleted">仅为已完成课程的学员生成</el-checkbox>
          <el-checkbox v-model="batchForm.skipExisting">跳过已有证书的学员</el-checkbox>
        </el-form-item>
        <el-form-item label="自动发送">
          <el-checkbox v-model="batchForm.autoSend">生成后自动发送给学员</el-checkbox>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogBatchVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="confirmBatchGenerate">
          开始生成
        </el-button>
      </div>
    </el-dialog>

    <!-- Verification Result Dialog -->
    <el-dialog title="证书验证结果" :visible.sync="dialogVerifyVisible">
      <div v-if="verificationResult">
        <el-result
          :icon="verificationResult.valid ? 'success' : 'error'"
          :title="verificationResult.valid ? '证书有效' : '证书无效'"
          :subTitle="verificationResult.message"
        >
          <template slot="extra" v-if="verificationResult.valid">
            <div class="verify-details">
              <p><strong>证书编号：</strong>{{ verificationResult.certificateNumber }}</p>
              <p><strong>学员姓名：</strong>{{ verificationResult.userName }}</p>
              <p><strong>课程名称：</strong>{{ verificationResult.courseName }}</p>
              <p><strong>颁发日期：</strong>{{ verificationResult.issuedAt | parseTime }}</p>
              <p><strong>验证时间：</strong>{{ verificationResult.verifiedAt | parseTime }}</p>
            </div>
          </template>
        </el-result>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import {
  listCertificates,
  getCertificate,
  generateCertificate,
  batchGenerateCertificates,
  verifyCertificate,
  revokeCertificate,
  reactivateCertificate,
  downloadCertificate
} from '@/api/admin/learning/certificates'
import { listCourses } from '@/api/admin/learning/courses'

export default {
  name: 'CertificatesList',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        active: 'success',
        revoked: 'danger',
        expired: 'warning'
      }
      return statusMap[status] || 'info'
    }
  },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        keyword: '',
        status: '',
        courseId: null,
        startDate: undefined,
        endDate: undefined,
        sort: '-issuedAt'
      },
      dateRange: [],
      statusOptions: [
        { label: '有效', value: 'active' },
        { label: '已撤销', value: 'revoked' },
        { label: '已过期', value: 'expired' }
      ],
      courseOptions: [],
      dialogPreviewVisible: false,
      dialogBatchVisible: false,
      dialogVerifyVisible: false,
      currentCertificate: null,
      verificationResult: null,
      batchForm: {
        courseId: null,
        onlyCompleted: true,
        skipExisting: true,
        autoSend: false
      }
    }
  },
  created() {
    this.getList()
    this.getCourseOptions()
    
    // Handle direct navigation with query params
    if (this.$route.query.id) {
      this.viewCertificateById(this.$route.query.id)
    }
  },
  methods: {
    statusText(status) {
      const statusTexts = {
        active: '有效',
        revoked: '已撤销',
        expired: '已过期'
      }
      return statusTexts[status] || status
    },
    getList() {
      this.listLoading = true
      listCertificates(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleDateRange() {
      if (this.dateRange && this.dateRange.length === 2) {
        this.listQuery.startDate = this.dateRange[0]
        this.listQuery.endDate = this.dateRange[1]
      } else {
        this.listQuery.startDate = undefined
        this.listQuery.endDate = undefined
      }
    },
    getCourseOptions() {
      listCourses({ limit: 100 }).then(response => {
        this.courseOptions = response.data.items.map(item => ({
          label: item.title,
          value: item.id
        }))
      })
    },
    viewCertificate(row) {
      getCertificate(row.id).then(response => {
        this.currentCertificate = response.data
        this.dialogPreviewVisible = true
      })
    },
    viewCertificateById(id) {
      getCertificate(id).then(response => {
        this.currentCertificate = response.data
        this.dialogPreviewVisible = true
      })
    },
    downloadCertificate(row) {
      downloadCertificate(row.id).then(response => {
        const url = window.URL.createObjectURL(new Blob([response], { type: 'application/pdf' }))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `${row.certificateNumber}.pdf`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        this.$notify({
          title: '成功',
          message: '证书下载成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    verifyCertificate(row) {
      verifyCertificate(row.certificateNumber).then(response => {
        this.verificationResult = response.data
        this.dialogVerifyVisible = true
      })
    },
    handleRevoke(row) {
      this.$confirm('确认撤销该证书？撤销后证书将失效。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        revokeCertificate(row.id).then(() => {
          this.$notify({
            title: '成功',
            message: '证书已撤销',
            type: 'success',
            duration: 2000
          })
          this.getList()
        })
      })
    },
    handleReactivate(row) {
      this.$confirm('确认恢复该证书？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        reactivateCertificate(row.id).then(() => {
          this.$notify({
            title: '成功',
            message: '证书已恢复',
            type: 'success',
            duration: 2000
          })
          this.getList()
        })
      })
    },
    handleBatchGenerate() {
      this.batchForm = {
        courseId: null,
        onlyCompleted: true,
        skipExisting: true,
        autoSend: false
      }
      this.dialogBatchVisible = true
    },
    confirmBatchGenerate() {
      if (!this.batchForm.courseId) {
        this.$message.error('请选择课程')
        return
      }
      
      batchGenerateCertificates(this.batchForm).then(response => {
        this.dialogBatchVisible = false
        this.$notify({
          title: '成功',
          message: `批量生成完成，共生成 ${response.data.count} 张证书`,
          type: 'success',
          duration: 3000
        })
        this.getList()
      })
    },
    viewUserInfo(userId) {
      this.$router.push({ path: '/user/profile', query: { id: userId }})
    },
    viewCourse(courseId) {
      this.$router.push({ path: '/learning/courses/detail', query: { id: courseId }})
    }
  }
}
</script>

<style scoped>
.certificate-preview {
  text-align: center;
}

.certificate-info {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.certificate-info h3 {
  margin-bottom: 15px;
  color: #303133;
}

.certificate-info p {
  margin: 8px 0;
  color: #606266;
}

.certificate-placeholder {
  padding: 50px;
  color: #909399;
}

.verify-details {
  text-align: left;
  max-width: 400px;
  margin: 0 auto;
}

.verify-details p {
  margin: 8px 0;
  color: #606266;
}
</style>
