<template>
  <div class="link-container">
    <div class="search-box">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="链接名称">
          <el-input v-model="searchForm.name" placeholder="请输入链接名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="启用" :value="1"></el-option>
            <el-option label="禁用" :value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-box">
      <div class="table-header">
        <el-button type="primary" @click="handleAdd">新增链接</el-button>
      </div>
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%">
        <el-table-column
          prop="id"
          label="ID"
          width="80">
        </el-table-column>
        <el-table-column
          prop="name"
          label="链接名称"
          width="150">
        </el-table-column>
        <el-table-column
          prop="url"
          label="链接地址">
          <template slot-scope="scope">
            <a :href="scope.row.url" target="_blank">{{ scope.row.url }}</a>
          </template>
        </el-table-column>
        <el-table-column
          prop="logo"
          label="Logo"
          width="100">
          <template slot-scope="scope">
            <el-image 
              v-if="scope.row.logo"
              style="width: 40px; height: 40px"
              :src="scope.row.logo" 
              :preview-src-list="[scope.row.logo]">
            </el-image>
            <span v-else>无</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="sort"
          label="排序"
          width="80">
        </el-table-column>
        <el-table-column
          prop="status"
          label="状态"
          width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="description"
          label="描述"
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column
          prop="created_at"
          label="创建时间"
          width="180">
        </el-table-column>
        <el-table-column
          label="操作"
          width="180">
          <template slot-scope="scope">
            <el-button
              size="mini"
              @click="handleEdit(scope.row)">编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
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
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogType === 'add' ? '新增友情链接' : '编辑友情链接'" :visible.sync="dialogVisible" width="600px">
      <el-form :model="formData" :rules="formRules" ref="linkForm" label-width="100px">
        <el-form-item label="链接名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入链接名称"></el-input>
        </el-form-item>
        <el-form-item label="链接地址" prop="url">
          <el-input v-model="formData.url" placeholder="请输入链接地址"></el-input>
        </el-form-item>
        <el-form-item label="Logo地址" prop="logo">
          <el-input v-model="formData.logo" placeholder="请输入Logo地址"></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="9999"></el-input-number>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input type="textarea" v-model="formData.description" rows="3" placeholder="请输入描述"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listLinks, createLink, updateLink, deleteLink } from '@/api/links'

export default {
  name: 'LinksList',
  data() {
    return {
      // 搜索表单
      searchForm: {
        name: '',
        status: ''
      },
      // 表格数据
      tableData: [],
      loading: false,
      // 分页
      page: 1,
      pageSize: 10,
      total: 0,
      // 弹窗
      dialogVisible: false,
      dialogType: 'add', // add 或 edit
      formData: {
        id: null,
        name: '',
        url: '',
        logo: '',
        sort: 0,
        status: 1,
        description: ''
      },
      // 表单验证规则
      formRules: {
        name: [
          { required: true, message: '请输入链接名称', trigger: 'blur' },
          { max: 50, message: '长度不能超过50个字符', trigger: 'blur' }
        ],
        url: [
          { required: true, message: '请输入链接地址', trigger: 'blur' },
          { max: 255, message: '长度不能超过255个字符', trigger: 'blur' }
        ],
        logo: [
          { max: 255, message: '长度不能超过255个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    // 获取列表数据
    fetchData() {
      this.loading = true
      const params = {
        page: this.page,
        page_size: this.pageSize,
        ...this.searchForm
      }
      
      listLinks(params).then(response => {
        this.tableData = response.data.items
        this.total = response.data.total
      }).catch(error => {
        console.error('获取友情链接列表失败', error)
        this.$message.error('获取友情链接列表失败')
      }).finally(() => {
        this.loading = false
      })
    },
    
    // 搜索
    handleSearch() {
      this.page = 1
      this.fetchData()
    },
    
    // 重置搜索
    resetSearch() {
      this.searchForm = {
        name: '',
        status: ''
      }
      this.page = 1
      this.fetchData()
    },
    
    // 分页大小变化
    handleSizeChange(val) {
      this.pageSize = val
      this.fetchData()
    },
    
    // 页码变化
    handleCurrentChange(val) {
      this.page = val
      this.fetchData()
    },
    
    // 新增
    handleAdd() {
      this.dialogType = 'add'
      this.formData = {
        id: null,
        name: '',
        url: '',
        logo: '',
        sort: 0,
        status: 1,
        description: ''
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.linkForm && this.$refs.linkForm.clearValidate()
      })
    },
    
    // 编辑
    handleEdit(row) {
      this.dialogType = 'edit'
      this.formData = JSON.parse(JSON.stringify(row))
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.linkForm && this.$refs.linkForm.clearValidate()
      })
    },
    
    // 删除
    handleDelete(row) {
      this.$confirm('确认删除该友情链接?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteLink(row.id).then(() => {
          this.$message.success('删除成功')
          this.fetchData()
        }).catch(error => {
          console.error('删除友情链接失败', error)
          this.$message.error('删除失败')
        })
      }).catch(() => {
        // 取消删除
      })
    },
    
    // 提交表单
    submitForm() {
      this.$refs.linkForm.validate(valid => {
        if (valid) {
          if (this.dialogType === 'add') {
            // 新增
            createLink(this.formData).then(() => {
              this.$message.success('添加成功')
              this.dialogVisible = false
              this.fetchData()
            }).catch(error => {
              console.error('添加友情链接失败', error)
              this.$message.error('添加失败')
            })
          } else {
            // 编辑
            updateLink(this.formData.id, this.formData).then(() => {
              this.$message.success('更新成功')
              this.dialogVisible = false
              this.fetchData()
            }).catch(error => {
              console.error('更新友情链接失败', error)
              this.$message.error('更新失败')
            })
          }
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style scoped>
.link-container {
  padding: 20px;
}
.search-box {
  margin-bottom: 20px;
}
.table-box {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.table-header {
  margin-bottom: 20px;
}
.pagination-container {
  margin-top: 20px;
  text-align: right;
}
</style> 