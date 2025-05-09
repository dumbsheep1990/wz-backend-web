<template>
  <div>
    <div class="gva-search-box">
      <el-form :inline="true" :model="searchInfo">
        <el-form-item>
          <el-input v-model="searchInfo.title" placeholder="文章标题" />
        </el-form-item>
        <el-form-item>
          <el-select v-model="searchInfo.status" placeholder="状态" clearable>
            <el-option label="已发布" :value="1" />
            <el-option label="草稿" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getTableData">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="openAddDialog">新增文章</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table :data="tableData" border stripe>
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="title" label="文章标题" min-width="200" />
      <el-table-column prop="categoryName" label="分类" width="120" />
      <el-table-column prop="tags" label="标签" width="180">
        <template #default="scope">
          <el-tag v-for="tag in scope.row.tags" :key="tag.id" style="margin-right: 5px">
            {{ tag.name }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="author" label="作者" width="100" />
      <el-table-column prop="views" label="阅读量" width="80" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
            {{ scope.row.status === 1 ? '已发布' : '草稿' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column label="操作" fixed="right" width="200">
        <template #default="scope">
          <el-button size="small" type="primary" @click="editArticle(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteArticle(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="gva-pagination">
      <el-pagination
        layout="total, sizes, prev, pager, next, jumper"
        :current-page="page"
        :page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]"
        :total="total"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getArticles, deleteArticle } from '@/api/content'
import { useRouter } from 'vue-router'

export default {
  name: 'ArticleList',
  setup() {
    const router = useRouter()
    const tableData = ref([])
    const page = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const searchInfo = reactive({
      title: '',
      status: ''
    })

    const getTableData = async() => {
      try {
        const params = {
          page: page.value,
          pageSize: pageSize.value,
          ...searchInfo
        }
        const res = await getArticles(params)
        if (res.code === 0) {
          tableData.value = res.data.list
          total.value = res.data.total
        }
      } catch (error) {
        console.error(error)
      }
    }

    const resetSearch = () => {
      searchInfo.title = ''
      searchInfo.status = ''
      getTableData()
    }

    const handleSizeChange = (val) => {
      pageSize.value = val
      getTableData()
    }

    const handleCurrentChange = (val) => {
      page.value = val
      getTableData()
    }

    const openAddDialog = () => {
      router.push('/content/article/edit')
    }

    const editArticle = (row) => {
      router.push(`/content/article/edit/${row.id}`)
    }

    const handleDelete = async(id) => {
      try {
        const res = await deleteArticle(id)
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
      } catch (error) {
        console.error(error)
      }
    }

    const deleteArticle = (row) => {
      ElMessageBox.confirm(
        '确定要删除该文章吗？删除后无法恢复！',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        handleDelete(row.id)
      }).catch(() => {})
    }

    onMounted(() => {
      getTableData()
    })

    return {
      tableData,
      page,
      pageSize,
      total,
      searchInfo,
      getTableData,
      resetSearch,
      handleSizeChange,
      handleCurrentChange,
      openAddDialog,
      editArticle,
      deleteArticle
    }
  }
}
</script> 