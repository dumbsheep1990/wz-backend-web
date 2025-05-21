<template>
  <div>
    <div class="gva-search-box">
      <el-form :inline="true" :model="searchInfo" class="demo-form-inline">
        <el-form-item label="帖子标题">
          <el-input v-model="searchInfo.title" placeholder="请输入帖子标题" />
        </el-form-item>
        <el-form-item label="社区ID">
          <el-input v-model="searchInfo.communityId" placeholder="请输入社区ID" />
        </el-form-item>
        <el-form-item label="群组ID">
          <el-input v-model="searchInfo.groupId" placeholder="请输入群组ID" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchInfo.status" placeholder="请选择" clearable>
            <el-option key="1" label="正常" :value="1" />
            <el-option key="2" label="隐藏" :value="2" />
            <el-option key="3" label="禁止" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="作者ID">
          <el-input v-model="searchInfo.authorId" placeholder="请输入作者ID" />
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="searchInfo.tags" placeholder="请输入帖子标签" />
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
          <p>确定要删除所选帖子吗？</p>
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
        <el-table-column label="帖子标题" min-width="150" prop="title" />
        <el-table-column label="社区ID" min-width="80" prop="communityId" />
        <el-table-column label="群组ID" min-width="80" prop="groupId" />
        <el-table-column label="作者ID" min-width="80" prop="authorId" />
        <el-table-column label="状态" min-width="80">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 1" type="success">正常</el-tag>
            <el-tag v-else-if="scope.row.status === 2" type="warning">隐藏</el-tag>
            <el-tag v-else-if="scope.row.status === 3" type="danger">禁止</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="浏览次数" min-width="80" prop="viewCount" />
        <el-table-column label="点赞数" min-width="80" prop="likeCount" />
        <el-table-column label="评论数" min-width="80" prop="commentCount" />
        <el-table-column label="标签" min-width="120" prop="tags" />
        <el-table-column label="创建时间" min-width="160">
          <template #default="scope">{{ formatDate(scope.row.CreatedAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" min-width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link icon="edit" @click="editPost(scope.row)">编辑</el-button>
            <el-button type="primary" link icon="view" @click="viewComments(scope.row)">查看评论</el-button>
            <el-popover v-model:visible="scope.row.visible" placement="top" width="160">
              <p>确定要删除此帖子吗？</p>
              <div style="text-align: right; margin-top: 8px;">
                <el-button type="primary" @click="deletePostFunc(scope.row)">确认</el-button>
                <el-button @click="scope.row.visible = false">取消</el-button>
              </div>
              <template #reference>
                <el-button type="primary" link icon="delete" @click="scope.row.visible = true">删除</el-button>
              </template>
            </el-popover>
            <el-dropdown>
              <el-button type="primary" link icon="more">更多</el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="changeStatus(scope.row.ID, 1)" v-if="scope.row.status !== 1">设为正常</el-dropdown-item>
                  <el-dropdown-item @click="changeStatus(scope.row.ID, 2)" v-if="scope.row.status !== 2">设为隐藏</el-dropdown-item>
                  <el-dropdown-item @click="changeStatus(scope.row.ID, 3)" v-if="scope.row.status !== 3">设为禁止</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
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
    <el-dialog v-model="dialogFormVisible" :title="type === 'create' ? '新增帖子' : '编辑帖子'" destroy-on-close>
      <el-form :model="formData" label-position="right" label-width="80px">
        <el-form-item label="帖子标题">
          <el-input v-model="formData.title" placeholder="请输入帖子标题" />
        </el-form-item>
        <el-form-item label="所属社区">
          <el-input v-model="formData.communityId" placeholder="请输入所属社区ID" />
        </el-form-item>
        <el-form-item label="所属群组">
          <el-input v-model="formData.groupId" placeholder="请输入所属群组ID" />
        </el-form-item>
        <el-form-item label="帖子内容">
          <el-input v-model="formData.content" type="textarea" :rows="8" placeholder="请输入帖子内容" />
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="formData.tags" placeholder="请输入帖子标签，多个用逗号分隔" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="formData.status" placeholder="请选择">
            <el-option key="1" label="正常" :value="1" />
            <el-option key="2" label="隐藏" :value="2" />
            <el-option key="3" label="禁止" :value="3" />
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
  name: 'Post',
}
</script>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDate } from '@/utils/format'
import { useRouter, useRoute } from 'vue-router'
import { global } from '@/utils/common'
import {
  createPost,
  deletePost,
  deletePostByIds,
  updatePost,
  findPost,
  getPostList,
  changePostStatus
} from '@/api/community/post'

// 获取路由参数
const router = useRouter()
const route = useRoute()

// 全局变量
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tableData = ref([])
const searchInfo = reactive({
  title: '',
  communityId: route.query.community_id || '',
  groupId: route.query.group_id || '',
  status: '',
  authorId: '',
  tags: ''
})

// 多选相关操作
const multipleSelection = ref([])
const deleteVisible = ref(false)
const handleSelectionChange = (val) => {
  multipleSelection.value = val
}

// 查询帖子列表
const getTableData = async() => {
  const data = await getPostList({
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
  // 如果是从群组详情进入的，保留社区ID和群组ID
  const communityId = route.query.community_id || ''
  const groupId = route.query.group_id || ''
  Object.keys(searchInfo).forEach(key => {
    if (key === 'communityId') {
      searchInfo[key] = communityId
    } else if (key === 'groupId') {
      searchInfo[key] = groupId
    } else {
      searchInfo[key] = ''
    }
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

// 单个删除帖子
const deletePostFunc = async(row) => {
  row.visible = false
  const res = await deletePost({ ID: row.ID })
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

// 批量删除帖子
const onMultipleDelete = async() => {
  const ids = multipleSelection.value.map(item => item.ID)
  const res = await deletePostByIds({ ids })
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

// 查看帖子评论
const viewComments = (row) => {
  router.push({
    name: 'communityComment',
    query: {
      post_id: row.ID,
      post_title: row.title
    }
  })
}

// 编辑和创建相关操作
const dialogFormVisible = ref(false)
const type = ref('')
const formData = ref({
  title: '',
  communityId: '',
  groupId: '',
  content: '',
  tags: '',
  status: 1
})

// 修改状态
const changeStatus = async(id, status) => {
  const res = await changePostStatus({ id, status })
  if (res.code === 0) {
    let statusText = '未知'
    switch (status) {
      case 1:
        statusText = '正常'
        break
      case 2:
        statusText = '隐藏'
        break
      case 3:
        statusText = '禁止'
        break
    }
    ElMessage({
      type: 'success',
      message: `设置为${statusText}成功`
    })
    getTableData()
  }
}

// 打开对话框
const openDialog = () => {
  type.value = 'create'
  dialogFormVisible.value = true
  formData.value = {
    title: '',
    communityId: route.query.community_id || '',
    groupId: route.query.group_id || '',
    content: '',
    tags: '',
    status: 1
  }
}

// 编辑帖子
const editPost = async(row) => {
  type.value = 'update'
  const res = await findPost({ ID: row.ID })
  if (res.code === 0) {
    formData.value = res.data
    dialogFormVisible.value = true
  }
}

// 确认编辑或创建
const enterDialog = async() => {
  let res
  switch (type.value) {
    case 'create':
      res = await createPost(formData.value)
      break
    case 'update':
      res = await updatePost(formData.value)
      break
    default:
      res = null
  }

  if (res && res.code === 0) {
    ElMessage({
      type: 'success',
      message: type.value === 'create' ? '创建成功' : '编辑成功'
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
