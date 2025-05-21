<template>
  <div>
    <div class="gva-search-box">
      <el-form :inline="true" :model="searchInfo" class="demo-form-inline">
        <el-form-item label="群组名称">
          <el-input v-model="searchInfo.name" placeholder="请输入群组名称" />
        </el-form-item>
        <el-form-item label="社区ID">
          <el-input v-model="searchInfo.communityId" placeholder="请输入社区ID" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchInfo.status" placeholder="请选择" clearable>
            <el-option key="1" label="正常" :value="1" />
            <el-option key="2" label="禁用" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="searchInfo.tags" placeholder="请输入群组标签" />
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
          <p>确定要删除所选群组吗？</p>
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
        <el-table-column label="群组名称" min-width="120" prop="name" />
        <el-table-column label="社区ID" min-width="80" prop="communityId" />
        <el-table-column label="创建者ID" min-width="80" prop="ownerId" />
        <el-table-column label="群组描述" min-width="180" prop="description" show-overflow-tooltip />
        <el-table-column label="群组头像" min-width="100">
          <template #default="scope">
            <el-image
              v-if="scope.row.avatar"
              style="width: 50px; height: 50px"
              :src="scope.row.avatar"
              fit="cover"
              :preview-src-list="[scope.row.avatar]"
            />
            <div v-else>暂无头像</div>
          </template>
        </el-table-column>
        <el-table-column label="标签" min-width="120" prop="tags" />
        <el-table-column label="成员数量" min-width="80" prop="memberCount" />
        <el-table-column label="帖子数量" min-width="80" prop="postCount" />
        <el-table-column label="状态" min-width="80">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 1" type="success">正常</el-tag>
            <el-tag v-else-if="scope.row.status === 2" type="danger">禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="160">
          <template #default="scope">{{ formatDate(scope.row.CreatedAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" min-width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link icon="edit" @click="editGroup(scope.row)">编辑</el-button>
            <el-button type="primary" link icon="view" @click="viewPosts(scope.row)">查看帖子</el-button>
            <el-popover v-model:visible="scope.row.visible" placement="top" width="160">
              <p>确定要删除此群组吗？</p>
              <div style="text-align: right; margin-top: 8px;">
                <el-button type="primary" @click="deleteGroupFunc(scope.row)">确认</el-button>
                <el-button @click="scope.row.visible = false">取消</el-button>
              </div>
              <template #reference>
                <el-button type="primary" link icon="delete" @click="scope.row.visible = true">删除</el-button>
              </template>
            </el-popover>
            <el-button v-if="scope.row.status === 1" type="primary" link @click="changeStatus(scope.row.ID, 2)">禁用</el-button>
            <el-button v-else-if="scope.row.status === 2" type="primary" link @click="changeStatus(scope.row.ID, 1)">启用</el-button>
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
    <el-dialog v-model="dialogFormVisible" :title="type === 'create' ? '新增群组' : '编辑群组'" destroy-on-close>
      <el-form :model="formData" label-position="right" label-width="80px">
        <el-form-item label="群组名称">
          <el-input v-model="formData.name" placeholder="请输入群组名称" />
        </el-form-item>
        <el-form-item label="所属社区">
          <el-input v-model="formData.communityId" placeholder="请输入所属社区ID" />
        </el-form-item>
        <el-form-item label="群组描述">
          <el-input v-model="formData.description" type="textarea" placeholder="请输入群组描述" />
        </el-form-item>
        <el-form-item label="群组头像">
          <el-upload
            :show-file-list="false"
            :before-upload="beforeAvatarUpload"
            :on-success="handleAvatarSuccess"
            :action="`${global.apiUrl}/fileUploadAndDownload/upload`"
          >
            <el-avatar v-if="formData.avatar" :size="100" :src="formData.avatar" fit="cover" />
            <el-avatar v-else :size="100" icon="plus" />
          </el-upload>
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="formData.tags" placeholder="请输入群组标签，多个用逗号分隔" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="formData.status" placeholder="请选择">
            <el-option key="1" label="正常" :value="1" />
            <el-option key="2" label="禁用" :value="2" />
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
  name: 'Group',
}
</script>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDate } from '@/utils/format'
import { useRouter, useRoute } from 'vue-router'
import { global } from '@/utils/common'
import {
  createGroup,
  deleteGroup,
  deleteGroupByIds,
  updateGroup,
  findGroup,
  getGroupList,
  changeGroupStatus
} from '@/api/community/group'

// 获取路由参数
const router = useRouter()
const route = useRoute()

// 全局变量
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tableData = ref([])
const searchInfo = reactive({
  name: '',
  communityId: route.query.community_id || '',
  status: '',
  tags: ''
})

// 多选相关操作
const multipleSelection = ref([])
const deleteVisible = ref(false)
const handleSelectionChange = (val) => {
  multipleSelection.value = val
}

// 查询群组列表
const getTableData = async() => {
  const data = await getGroupList({
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
  // 如果是从社区详情进入的，保留社区ID
  const communityId = route.query.community_id || ''
  Object.keys(searchInfo).forEach(key => {
    searchInfo[key] = key === 'communityId' ? communityId : ''
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

// 单个删除群组
const deleteGroupFunc = async(row) => {
  row.visible = false
  const res = await deleteGroup({ ID: row.ID })
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

// 批量删除群组
const onMultipleDelete = async() => {
  const ids = multipleSelection.value.map(item => item.ID)
  const res = await deleteGroupByIds({ ids })
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

// 查看群组帖子
const viewPosts = (row) => {
  router.push({
    name: 'communityPost',
    query: {
      group_id: row.ID,
      group_name: row.name,
      community_id: row.communityId
    }
  })
}

// 编辑和创建相关操作
const dialogFormVisible = ref(false)
const type = ref('')
const formData = ref({
  name: '',
  communityId: '',
  description: '',
  avatar: '',
  tags: '',
  status: 1
})

// 修改状态
const changeStatus = async(id, status) => {
  const res = await changeGroupStatus({ id, status })
  if (res.code === 0) {
    ElMessage({
      type: 'success',
      message: status === 1 ? '启用成功' : '禁用成功'
    })
    getTableData()
  }
}

// 打开对话框
const openDialog = () => {
  type.value = 'create'
  dialogFormVisible.value = true
  formData.value = {
    name: '',
    communityId: route.query.community_id || '',
    description: '',
    avatar: '',
    tags: '',
    status: 1
  }
}

// 编辑群组
const editGroup = async(row) => {
  type.value = 'update'
  const res = await findGroup({ ID: row.ID })
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
      res = await createGroup(formData.value)
      break
    case 'update':
      res = await updateGroup(formData.value)
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

// 文件上传相关
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isImage) {
    ElMessage.error('头像必须是图片格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!')
    return false
  }
  return true
}

const handleAvatarSuccess = (res) => {
  if (res.code === 0) {
    formData.value.avatar = res.data.url
  }
}

// 初始化操作
onMounted(() => {
  getTableData()
})
</script>

<style scoped>
</style>
