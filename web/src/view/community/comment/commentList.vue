<template>
  <div>
    <div class="gva-search-box">
      <el-form :inline="true" :model="searchInfo" class="demo-form-inline">
        <el-form-item label="帖子ID">
          <el-input v-model="searchInfo.postId" placeholder="请输入帖子ID" />
        </el-form-item>
        <el-form-item label="作者ID">
          <el-input v-model="searchInfo.authorId" placeholder="请输入作者ID" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchInfo.status" placeholder="请选择" clearable>
            <el-option key="1" label="正常" :value="1" />
            <el-option key="2" label="隐藏" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="评论内容">
          <el-input v-model="searchInfo.content" placeholder="请输入评论内容关键词" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">查询</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="gva-table-box">
      <div class="gva-btn-list">
        <el-button type="primary" icon="plus" @click="openDialog">新增</el-button>
        <el-popover v-model:visible="deleteVisible" placement="top" width="160">
          <p>确定要删除所选评论吗？</p>
          <div style="text-align: right; margin-top: 8px;">
            <el-button type="primary" @click="onMultipleDelete">确认</el-button>
            <el-button @click="deleteVisible = false">取消</el-button>
          </div>
          <template #reference>
            <el-button icon="delete" style="margin-left: 10px;" :disabled="!multipleSelection.length" @click="deleteVisible = true">删除</el-button>
          </template>
        </el-popover>
      </div>
      <el-table
        ref="multipleTable"
        style="width: 100%"
        tooltip-effect="dark"
        :data="tableData"
        row-key="ID"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="ID" min-width="60" prop="ID" />
        <el-table-column label="帖子ID" min-width="80" prop="postId" />
        <el-table-column label="作者ID" min-width="80" prop="authorId" />
        <el-table-column label="父评论ID" min-width="80" prop="parentId" />
        <el-table-column label="评论内容" min-width="240" prop="content" show-overflow-tooltip />
        <el-table-column label="点赞数" min-width="80" prop="likeCount" />
        <el-table-column label="状态" min-width="80">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 1" type="success">正常</el-tag>
            <el-tag v-else-if="scope.row.status === 2" type="warning">隐藏</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="160">
          <template #default="scope">{{ formatDate(scope.row.CreatedAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" min-width="160" fixed="right">
          <template #default="scope">
            <el-popover v-model:visible="scope.row.visible" placement="top" width="160">
              <p>确定要删除此评论吗？</p>
              <div style="text-align: right; margin-top: 8px;">
                <el-button type="primary" @click="deleteCommentFunc(scope.row)">确认</el-button>
                <el-button @click="scope.row.visible = false">取消</el-button>
              </div>
              <template #reference>
                <el-button type="primary" link icon="delete" @click="scope.row.visible = true">删除</el-button>
              </template>
            </el-popover>
            <el-button v-if="scope.row.status === 1" type="primary" link @click="changeStatus(scope.row.ID, 2)">隐藏</el-button>
            <el-button v-else-if="scope.row.status === 2" type="primary" link @click="changeStatus(scope.row.ID, 1)">显示</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="gva-pagination">
        <el-pagination
          layout="total, sizes, prev, pager, next, jumper"
          :current-page="page"
          :page-size="pageSize"
          :page-sizes="[10, 30, 50, 100]"
          :total="total"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>
    <el-dialog v-model="dialogFormVisible" title="新增评论" destroy-on-close>
      <el-form :model="formData" label-position="right" label-width="80px">
        <el-form-item label="帖子ID">
          <el-input v-model="formData.postId" placeholder="请输入帖子ID" />
        </el-form-item>
        <el-form-item label="父评论ID">
          <el-input v-model="formData.parentId" placeholder="请输入父评论ID，0表示顶级评论" />
        </el-form-item>
        <el-form-item label="评论内容">
          <el-input v-model="formData.content" type="textarea" :rows="4" placeholder="请输入评论内容" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="formData.status" placeholder="请选择">
            <el-option key="1" label="正常" :value="1" />
            <el-option key="2" label="隐藏" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="enterDialog">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Comment',
}
</script>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDate } from '@/utils/format'
import { useRouter, useRoute } from 'vue-router'
import { global } from '@/utils/common'
import {
  createComment,
  deleteComment,
  deleteCommentByIds,
  findComment,
  getCommentList,
  changeCommentStatus
} from '@/api/community/comment'

// 获取路由参数
const router = useRouter()
const route = useRoute()

// 全局变量
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tableData = ref([])
const searchInfo = reactive({
  postId: route.query.post_id || '',
  authorId: '',
  status: '',
  content: ''
})

// 多选相关操作
const multipleSelection = ref([])
const deleteVisible = ref(false)
const handleSelectionChange = (val) => {
  multipleSelection.value = val
}

// 查询评论列表
const getTableData = async() => {
  const data = await getCommentList({
    page: page.value,
    pageSize: pageSize.value,
    ...searchInfo
  })
  if (data) {
    tableData.value = data.list
    total.value = data.total
    page.value = data.page
    pageSize.value = data.pageSize
  }
}

// 查询操作
const onSubmit = () => {
  page.value = 1
  getTableData()
}

// 重置操作
const onReset = () => {
  // 如果是从帖子详情进入的，保留帖子ID
  const postId = route.query.post_id || ''
  Object.keys(searchInfo).forEach(key => {
    searchInfo[key] = key === 'postId' ? postId : ''
  })
  page.value = 1
  getTableData()
}

// 分页操作
const handleSizeChange = (val) => {
  pageSize.value = val
  getTableData()
}

const handleCurrentChange = (val) => {
  page.value = val
  getTableData()
}

// 单个删除评论
const deleteCommentFunc = async(row) => {
  row.visible = false
  const res = await deleteComment({ ID: row.ID })
  if (res.code === 0) {
    ElMessage({
      type: 'success',
      message: '删除成功'
    })
    if (tableData.value.length === 1 && page.value > 1) {
      page.value--
    }
    getTableData()
  }
}

// 批量删除评论
const onMultipleDelete = async() => {
  const ids = multipleSelection.value.map(item => item.ID)
  const res = await deleteCommentByIds({ ids })
  if (res.code === 0) {
    ElMessage({
      type: 'success',
      message: '删除成功'
    })
    if (tableData.value.length === ids.length && page.value > 1) {
      page.value--
    }
    deleteVisible.value = false
    getTableData()
  }
}

// 修改状态
const changeStatus = async(id, status) => {
  const res = await changeCommentStatus({ id, status })
  if (res.code === 0) {
    ElMessage({
      type: 'success',
      message: status === 1 ? '评论已显示' : '评论已隐藏'
    })
    getTableData()
  }
}

// 创建相关操作
const dialogFormVisible = ref(false)
const formData = ref({
  postId: '',
  parentId: 0,
  content: '',
  status: 1
})

// 打开对话框
const openDialog = () => {
  dialogFormVisible.value = true
  formData.value = {
    postId: route.query.post_id || '',
    parentId: 0,
    content: '',
    status: 1
  }
}

// 确认创建
const enterDialog = async() => {
  const res = await createComment(formData.value)

  if (res && res.code === 0) {
    ElMessage({
      type: 'success',
      message: '创建成功'
    })
    dialogFormVisible.value = false
    getTableData()
  }
}

// 初始化操作
onMounted(() => {
  getTableData()
})
</script>

<style scoped>
</style>
