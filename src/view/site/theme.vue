<template>
  <div class="theme-container">
    <div class="search-box">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="主题名称">
          <el-input v-model="searchForm.name" placeholder="请输入主题名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="主题代码">
          <el-input v-model="searchForm.code" placeholder="请输入主题代码" clearable></el-input>
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
        <el-button type="primary" @click="handleAdd">新增主题</el-button>
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
          label="主题名称"
          width="150">
        </el-table-column>
        <el-table-column
          prop="code"
          label="主题代码"
          width="120">
        </el-table-column>
        <el-table-column
          prop="preview"
          label="预览图"
          width="120">
          <template slot-scope="scope">
            <el-image 
              v-if="scope.row.preview"
              style="width: 80px; height: 50px"
              :src="scope.row.preview" 
              :preview-src-list="[scope.row.preview]">
            </el-image>
            <span v-else>无</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          label="状态"
          width="80">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="is_default"
          label="是否默认"
          width="100">
          <template slot-scope="scope">
            <el-tag type="warning" v-if="scope.row.is_default === 1">默认主题</el-tag>
            <span v-else>否</span>
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
          width="280">
          <template slot-scope="scope">
            <el-button
              size="mini"
              @click="handleEdit(scope.row)">编辑</el-button>
            <el-button
              size="mini"
              type="success"
              v-if="scope.row.is_default !== 1 && scope.row.status === 1"
              @click="handleSetDefault(scope.row)">设为默认</el-button>
            <el-button
              size="mini"
              type="danger"
              v-if="scope.row.is_default !== 1"
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
    <el-dialog :title="dialogType === 'add' ? '新增主题' : '编辑主题'" :visible.sync="dialogVisible" width="600px">
      <el-form :model="formData" :rules="formRules" ref="themeForm" label-width="100px">
        <el-form-item label="主题名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入主题名称"></el-input>
        </el-form-item>
        <el-form-item label="主题代码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入主题代码"></el-input>
        </el-form-item>
        <el-form-item label="预览图地址" prop="preview">
          <el-input v-model="formData.preview" placeholder="请输入预览图地址">
            <template slot="append">
              <el-button @click="handleUploadPreview">上传</el-button>
            </template>
          </el-input>
          <div class="preview-img" v-if="formData.preview">
            <img :src="formData.preview" alt="预览图" style="max-width: 100%; max-height: 150px; margin-top: 10px;">
          </div>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否默认" prop="is_default">
          <el-radio-group v-model="formData.is_default">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input type="textarea" v-model="formData.description" rows="3" placeholder="请输入描述"></el-input>
        </el-form-item>
        <el-form-item label="配置信息" prop="config">
          <el-input type="textarea" v-model="formData.config" rows="5" placeholder="请输入JSON格式的配置信息"></el-input>
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
import { listThemes, createTheme, updateTheme, deleteTheme, setDefaultTheme } from '@/api/theme'

export default {
  name: 'ThemeManage',
  data() {
    return {
      // 搜索表单
      searchForm: {
        name: '',
        code: '',
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
        code: '',
        preview: '',
        description: '',
        status: 1,
        is_default: 0,
        config: '',
      },
      // 表单验证规则
      formRules: {
        name: [
          { required: true, message: '请输入主题名称', trigger: 'blur' },
          { max: 50, message: '长度不能超过50个字符', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入主题代码', trigger: 'blur' },
          { max: 30, message: '长度不能超过30个字符', trigger: 'blur' }
        ],
        config: [
          { validator: this.validateJSON, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    // 验证JSON格式
    validateJSON(rule, value, callback) {
      if (value && value.trim() !== '') {
        try {
          JSON.parse(value)
          callback()
        } catch (e) {
          callback(new Error('请输入有效的JSON格式'))
        }
      } else {
        callback()
      }
    },
    
    // 获取列表数据
    fetchData() {
      this.loading = true
      const params = {
        page: this.page,
        page_size: this.pageSize,
        ...this.searchForm
      }
      
      listThemes(params).then(response => {
        this.tableData = response.data.items
        this.total = response.data.total
      }).catch(error => {
        console.error('获取主题列表失败', error)
        this.$message.error('获取主题列表失败')
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
        code: '',
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
        code: '',
        preview: '',
        description: '',
        status: 1,
        is_default: 0,
        config: '',
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.themeForm && this.$refs.themeForm.clearValidate()
      })
    },
    
    // 编辑
    handleEdit(row) {
      this.dialogType = 'edit'
      this.formData = JSON.parse(JSON.stringify(row))
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.themeForm && this.$refs.themeForm.clearValidate()
      })
    },
    
    // 删除
    handleDelete(row) {
      this.$confirm('确认删除该主题?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteTheme(row.id).then(() => {
          this.$message.success('删除成功')
          this.fetchData()
        }).catch(error => {
          console.error('删除主题失败', error)
          this.$message.error(error.message || '删除失败')
        })
      }).catch(() => {
        // 取消删除
      })
    },
    
    // 设为默认主题
    handleSetDefault(row) {
      this.$confirm('确认将该主题设为默认主题?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        setDefaultTheme(row.id).then(() => {
          this.$message.success('设置默认主题成功')
          this.fetchData()
        }).catch(error => {
          console.error('设置默认主题失败', error)
          this.$message.error('设置默认主题失败')
        })
      }).catch(() => {
        // 取消操作
      })
    },
    
    // 提交表单
    submitForm() {
      this.$refs.themeForm.validate(valid => {
        if (valid) {
          if (this.dialogType === 'add') {
            // 新增
            createTheme(this.formData).then(() => {
              this.$message.success('添加成功')
              this.dialogVisible = false
              this.fetchData()
            }).catch(error => {
              console.error('添加主题失败', error)
              this.$message.error(error.message || '添加失败')
            })
          } else {
            // 编辑
            updateTheme(this.formData.id, this.formData).then(() => {
              this.$message.success('更新成功')
              this.dialogVisible = false
              this.fetchData()
            }).catch(error => {
              console.error('更新主题失败', error)
              this.$message.error(error.message || '更新失败')
            })
          }
        } else {
          return false
        }
      })
    },
    
    // 上传预览图
    handleUploadPreview() {
      // 实际情况需要调用文件上传API
      this.$message.info('请集成文件上传功能')
    }
  }
}
</script>

<style scoped>
.theme-container {
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