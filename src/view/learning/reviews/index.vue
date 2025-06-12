<template>
  <div class="app-container">
    <!-- Filters -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        placeholder="用户名/课程名称"
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
      <el-select v-model="listQuery.rating" placeholder="评分" clearable style="width: 100px" class="filter-item">
        <el-option v-for="i in 5" :key="i" :label="`${i}星`" :value="i" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
    </div>

    <!-- Review table -->
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="ID" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column label="用户" width="150">
        <template slot-scope="{row}">
          <el-link type="primary" @click="viewUserInfo(row.userId)">{{ row.userName }}</el-link>
        </template>
      </el-table-column>

      <el-table-column label="课程" width="180">
        <template slot-scope="{row}">
          <el-link type="primary" @click="viewCourse(row.courseId)">{{ row.courseName }}</el-link>
        </template>
      </el-table-column>

      <el-table-column label="评分" width="120" align="center">
        <template slot-scope="{row}">
          <el-rate
            v-model="row.rating"
            disabled
            show-score
            text-color="#ff9900"
          />
        </template>
      </el-table-column>

      <el-table-column label="评论内容" min-width="200">
        <template slot-scope="{row}">
          <span>{{ row.content }}</span>
          <el-popover v-if="row.images && row.images.length > 0" placement="right" trigger="hover">
            <div class="review-images">
              <el-image
                v-for="(url, index) in row.images"
                :key="index"
                :src="url"
                fit="cover"
                style="width: 100px; height: 100px; margin: 5px"
                :preview-src-list="row.images"
              />
            </div>
            <el-button slot="reference" type="text" size="mini">查看图片({{ row.images.length }})</el-button>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column label="提交时间" width="160" align="center">
        <template slot-scope="{row}">
          <span>{{ row.createdAt | parseTime }}</span>
        </template>
      </el-table-column>

      <el-table-column label="状态" width="100" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ statusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="200">
        <template slot-scope="{row}">
          <el-button v-if="row.status === 'pending'" size="mini" type="success" @click="handleApprove(row)">
            批准
          </el-button>
          <el-button v-if="row.status === 'pending'" size="mini" type="danger" @click="handleReject(row)">
            拒绝
          </el-button>
          <el-button v-if="row.status === 'rejected'" size="mini" type="primary" @click="handleApprove(row)">
            改为批准
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row)">
            删除
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

    <!-- Reply Dialog -->
    <el-dialog title="回复评论" :visible.sync="dialogReplyVisible">
      <el-form
        ref="replyForm"
        :model="replyForm"
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="回复内容" prop="content">
          <el-input v-model="replyForm.content" type="textarea" :rows="4" placeholder="请输入回复内容" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogReplyVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="submitReply">
          提交
        </el-button>
      </div>
    </el-dialog>

    <!-- Reject Dialog -->
    <el-dialog title="拒绝评论" :visible.sync="dialogRejectVisible">
      <el-form
        ref="rejectForm"
        :model="rejectForm"
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="拒绝原因" prop="reason">
          <el-select v-model="rejectForm.reason" style="width: 100%">
            <el-option label="内容违规" value="inappropriate" />
            <el-option label="包含广告" value="spam" />
            <el-option label="内容不相关" value="irrelevant" />
            <el-option label="其他原因" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="rejectForm.reason === 'other'" label="详细说明" prop="comment">
          <el-input v-model="rejectForm.comment" type="textarea" :rows="3" placeholder="请输入详细说明" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogRejectVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="confirmReject">
          确认
        </el-button>
      </div>
    </el-dialog>

    <!-- Delete confirmation dialog -->
    <el-dialog
      :visible.sync="dialogDeleteVisible"
      title="确认删除"
      width="30%"
    >
      <span>确定要删除此评论吗？此操作不可逆。</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogDeleteVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmDelete">确认</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import { 
  listReviews, 
  getReview,
  approveReview,
  rejectReview,
  deleteReview,
  replyReview
} from '@/api/admin/learning/reviews'
import { listCourses } from '@/api/admin/learning/courses'

export default {
  name: 'ReviewsList',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        pending: 'warning',
        approved: 'success',
        rejected: 'danger'
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
        rating: null,
        sort: '-createdAt'
      },
      statusOptions: [
        { label: '待审核', value: 'pending' },
        { label: '已批准', value: 'approved' },
        { label: '已拒绝', value: 'rejected' }
      ],
      courseOptions: [],
      dialogReplyVisible: false,
      dialogRejectVisible: false,
      dialogDeleteVisible: false,
      replyForm: {
        reviewId: null,
        content: ''
      },
      rejectForm: {
        reviewId: null,
        reason: 'inappropriate',
        comment: ''
      },
      currentDeleteId: null
    }
  },
  created() {
    this.getList()
    this.getCourseOptions()
  },
  methods: {
    statusText(status) {
      const statusTexts = {
        pending: '待审核',
        approved: '已批准',
        rejected: '已拒绝'
      }
      return statusTexts[status] || status
    },
    getList() {
      this.listLoading = true
      listReviews(this.listQuery).then(response => {
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
    getCourseOptions() {
      listCourses({ limit: 100 }).then(response => {
        this.courseOptions = response.data.items.map(item => ({
          label: item.title,
          value: item.id
        }))
      })
    },
    handleApprove(row) {
      this.$confirm('确认批准该评论?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success'
      }).then(() => {
        approveReview(row.id).then(() => {
          this.$notify({
            title: '成功',
            message: '评论已批准',
            type: 'success',
            duration: 2000
          })
          this.getList()
        })
      })
    },
    handleReject(row) {
      this.rejectForm.reviewId = row.id
      this.rejectForm.reason = 'inappropriate'
      this.rejectForm.comment = ''
      this.dialogRejectVisible = true
    },
    confirmReject() {
      const data = {
        reason: this.rejectForm.reason,
        comment: this.rejectForm.reason === 'other' ? this.rejectForm.comment : ''
      }
      
      rejectReview(this.rejectForm.reviewId, data).then(() => {
        this.dialogRejectVisible = false
        this.$notify({
          title: '成功',
          message: '评论已拒绝',
          type: 'success',
          duration: 2000
        })
        this.getList()
      })
    },
    handleReply(row) {
      this.replyForm.reviewId = row.id
      this.replyForm.content = ''
      this.dialogReplyVisible = true
    },
    submitReply() {
      replyReview(this.replyForm.reviewId, { content: this.replyForm.content }).then(() => {
        this.dialogReplyVisible = false
        this.$notify({
          title: '成功',
          message: '回复已提交',
          type: 'success',
          duration: 2000
        })
        this.getList()
      })
    },
    handleDelete(row) {
      this.currentDeleteId = row.id
      this.dialogDeleteVisible = true
    },
    confirmDelete() {
      deleteReview(this.currentDeleteId).then(() => {
        this.dialogDeleteVisible = false
        this.$notify({
          title: '成功',
          message: '评论已删除',
          type: 'success',
          duration: 2000
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
.review-images {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  max-width: 500px;
}
</style>
