<template>
  <div>
    <div class="gva-search-box">
      <el-form :inline="true" :model="searchInfo">
        <el-form-item>
          <el-button type="primary" @click="openDialog">新增主导航</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table :data="tableData" border stripe>
      <el-table-column type="index" label="序号" width="80" />
      <el-table-column prop="title" label="导航标题" min-width="150" />
      <el-table-column prop="url" label="链接地址" min-width="200" />
      <el-table-column prop="icon" label="图标" min-width="100" />
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button size="small" type="primary" @click="editNav(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteNav(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <el-dialog v-model="dialogVisible" :title="formType === 'create' ? '新增主导航' : '编辑主导航'" width="500px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="导航标题">
          <el-input v-model="formData.title" placeholder="请输入导航标题" />
        </el-form-item>
        <el-form-item label="链接地址">
          <el-input v-model="formData.url" placeholder="请输入链接地址" />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="formData.icon" placeholder="请输入图标名称" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="formData.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveNav">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMainNavigation, saveMainNavigation, deleteMainNavigationItem } from '@/api/navigation'

export default {
  name: 'MainNavigation',
  setup() {
    const tableData = ref([])
    const dialogVisible = ref(false)
    const searchInfo = reactive({})
    const formData = reactive({
      id: '',
      title: '',
      url: '',
      icon: '',
      sort: 0,
      status: 1
    })
    const formType = ref('create')

    const getTableData = async() => {
      try {
        const res = await getMainNavigation()
        if (res.code === 0) {
          tableData.value = res.data
        }
      } catch (error) {
        console.error(error)
      }
    }

    const resetForm = () => {
      formData.id = ''
      formData.title = ''
      formData.url = ''
      formData.icon = ''
      formData.sort = 0
      formData.status = 1
    }

    const openDialog = () => {
      formType.value = 'create'
      resetForm()
      dialogVisible.value = true
    }

    const editNav = (row) => {
      formType.value = 'edit'
      Object.keys(formData).forEach(key => {
        formData[key] = row[key]
      })
      dialogVisible.value = true
    }

    const saveNav = async() => {
      try {
        const res = await saveMainNavigation(formData)
        if (res.code === 0) {
          ElMessage({
            type: 'success',
            message: formType.value === 'create' ? '新增成功' : '编辑成功'
          })
          dialogVisible.value = false
          getTableData()
        }
      } catch (error) {
        console.error(error)
      }
    }

    const deleteNav = (row) => {
      ElMessageBox.confirm('确定要删除该导航项吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          const res = await deleteMainNavigationItem(row.id)
          if (res.code === 0) {
            ElMessage({
              type: 'success',
              message: '删除成功'
            })
            getTableData()
          }
        } catch (error) {
          console.error(error)
        }
      }).catch(() => {})
    }

    onMounted(() => {
      getTableData()
    })

    return {
      tableData,
      searchInfo,
      dialogVisible,
      formData,
      formType,
      openDialog,
      editNav,
      deleteNav,
      saveNav
    }
  }
}
</script> 