<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        placeholder="分类名称/描述"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-plus"
        @click="handleCreate"
      >
        添加分类
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      row-key="id"
      border
      default-expand-all
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      style="width: 100%; margin-bottom: 20px;"
    >
      <el-table-column
        align="center"
        label="ID"
        width="80"
      >
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="分类名称"
        min-width="150"
      >
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.name }}</span>
          <el-tag v-if="row.featured" size="mini" type="success" style="margin-left: 5px">精选</el-tag>
        </template>
      </el-table-column>

      <el-table-column
        label="图标"
        width="100"
        align="center"
      >
        <template slot-scope="{row}">
          <i v-if="row.icon" :class="row.icon" style="font-size: 18px;"></i>
          <span v-else>-</span>
        </template>
      </el-table-column>
      
      <el-table-column
        prop="sort"
        label="排序"
        width="80"
        align="center"
      >
        <template slot-scope="{row}">
          <span>{{ row.sort }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="课程数量"
        width="100"
        align="center"
      >
        <template slot-scope="{row}">
          <el-link type="primary" @click="viewCoursesInCategory(row.id)">{{ row.coursesCount || 0 }}</el-link>
        </template>
      </el-table-column>

      <el-table-column
        label="状态"
        width="100"
        align="center"
      >
        <template slot-scope="{row}">
          <el-tag :type="row.status === 'active' ? 'success' : 'info'">
            {{ row.status === 'active' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column
        label="创建时间"
        width="160"
        align="center"
      >
        <template slot-scope="{row}">
          <span>{{ row.createdAt | parseTime }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        align="center"
        width="300"
      >
        <template slot-scope="{row}">
          <el-button size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button size="mini" type="success" @click="handleAddChild(row)">
            添加子分类
          </el-button>
          <el-button
            size="mini"
            :type="row.status === 'active' ? 'warning' : 'success'"
            @click="handleModifyStatus(row)"
          >
            {{ row.status === 'active' ? '禁用' : '启用' }}
          </el-button>
          <el-button
            v-if="!row.children || row.children.length === 0"
            size="mini"
            type="danger"
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="dialogStatus === 'create' ? '创建分类' : dialogStatus === 'createChild' ? '创建子分类' : '编辑分类'" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        label-width="120px"
        style="width: 90%; margin-left:50px;"
      >
        <el-form-item v-if="dialogStatus === 'createChild'" label="父级分类">
          <el-input :value="parentCategoryName" disabled />
        </el-form-item>
        
        <el-form-item v-else-if="dialogStatus === 'create'" label="父级分类">
          <el-cascader
            v-model="temp.parentId"
            :options="categoryTreeOptions"
            :props="{ checkStrictly: true }"
            clearable
            placeholder="不选择则创建为根分类"
          />
        </el-form-item>

        <el-form-item label="分类名称" prop="name">
          <el-input v-model="temp.name" placeholder="请输入分类名称" />
        </el-form-item>

        <el-form-item label="分类描述" prop="description">
          <el-input v-model="temp.description" type="textarea" :rows="2" placeholder="请输入分类描述" />
        </el-form-item>

        <el-form-item label="图标" prop="icon">
          <el-input v-model="temp.icon" placeholder="请输入图标类名，如：el-icon-notebook-2">
            <template slot="append">
              <i :class="temp.icon || 'el-icon-folder'" />
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="分类图片">
          <el-upload
            :show-file-list="false"
            :on-success="handleImageSuccess"
            :before-upload="beforeImageUpload"
            class="category-image-uploader"
            action="/admin/api/v1/upload"
          >
            <img v-if="temp.imageUrl" :src="temp.imageUrl" class="category-image">
            <i v-else class="el-icon-plus category-image-uploader-icon" />
          </el-upload>
        </el-form-item>

        <el-form-item label="排序值" prop="sort">
          <el-input-number v-model="temp.sort" :min="0" :max="9999" />
          <span class="form-tip">数值越小排序越靠前</span>
        </el-form-item>
        
        <el-form-item label="精选分类">
          <el-switch v-model="temp.featured" />
        </el-form-item>
      
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="temp.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus === 'update' ? updateData() : createData()">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves'
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'
import categoriesApi from '@/api/admin/learning/categories'

export default {
  name: 'CategoriesList',
  components: { Pagination },
  directives: { waves },
  filters: {
    parseTime
  },
  data() {
    return {
      list: null,
      categoryTreeOptions: [],
      listLoading: true,
      listQuery: {
        keyword: undefined
      },
      parentCategoryName: '',
      parentCategoryId: '',
      temp: {
        id: undefined,
        parentId: null,
        name: '',
        description: '',
        icon: 'el-icon-folder',
        imageUrl: '',
        sort: 0,
        featured: false,
        status: 'active',
        coursesCount: 0
      },
      dialogFormVisible: false,
      dialogStatus: '',
      rules: {
        name: [{ required: true, message: '分类名称不能为空', trigger: 'blur' }],
        sort: [{ required: true, message: '排序值不能为空', trigger: 'blur', type: 'number' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      categoriesApi.getCategoryTree(this.listQuery).then(response => {
        this.list = response.data
        this.categoryTreeOptions = this.formatCategoryTreeOptions(JSON.parse(JSON.stringify(response.data)))
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
        this.$message.error('获取分类列表失败')
      })
    },
    formatCategoryTreeOptions(categories) {
      return categories.map(item => {
        const option = {
          value: item.id,
          label: item.name
        }
        if (item.children && item.children.length > 0) {
          option.children = this.formatCategoryTreeOptions(item.children)
        }
        return option
      })
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        parentId: null,
        name: '',
        description: '',
        icon: 'el-icon-folder',
        imageUrl: '',
        sort: 0,
        featured: false,
        status: 'active',
        coursesCount: 0
      }
    },
    handleFilter() {
      this.getList()
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleAddChild(row) {
      this.resetTemp()
      this.parentCategoryId = row.id
      this.parentCategoryName = row.name
      this.temp.parentId = row.id
      this.dialogStatus = 'createChild'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          categoriesApi.createCategory(tempData).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建分类成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          }).catch(() => {
            this.$message.error('创建分类失败')
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          categoriesApi.updateCategory(tempData.id, tempData).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新分类成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          }).catch(() => {
            this.$message.error('更新分类失败')
          })
        }
      })
    },
    handleDelete(row) {
      this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        categoriesApi.deleteCategory(row.id).then(() => {
          this.$notify({
            title: '成功',
            message: '删除分类成功',
            type: 'success',
            duration: 2000
          })
          this.getList()
        }).catch(() => {
          this.$message.error('删除分类失败，可能该分类下有课程')
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    handleModifyStatus(row) {
      const newStatus = row.status === 'active' ? 'inactive' : 'active'
      const tempData = Object.assign({}, row, { status: newStatus })
      
      categoriesApi.updateCategory(tempData.id, tempData).then(() => {
        this.$message({
          message: '状态更新成功',
          type: 'success'
        })
        row.status = newStatus
      }).catch(() => {
        this.$message.error('状态更新失败')
      })
    },
    viewCoursesInCategory(categoryId) {
      this.$router.push({ path: '/learning/courses', query: { categoryId } })
    },
    handleImageSuccess(res, file) {
      if (res.code === 200) {
        this.temp.imageUrl = res.data.url
      } else {
        this.$message.error('上传图片失败')
      }
    },
    beforeImageUpload(file) {
      const isImage = file.type.indexOf('image/') === 0
      const isLessThan2M = file.size / 1024 / 1024 < 2

      if (!isImage) {
        this.$message.error('上传图片只能是图片格式!')
      }
      if (!isLessThan2M) {
        this.$message.error('上传图片大小不能超过 2MB!')
      }
      return isImage && isLessThan2M
    }
  }
}
</script>

<style>
.category-image-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.category-image-uploader .el-upload:hover {
  border-color: #409EFF;
}
.category-image-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}
.category-image {
  width: 120px;
  height: 120px;
  display: block;
  object-fit: cover;
}
.form-tip {
  color: #909399;
  font-size: 12px;
  margin-left: 10px;
}
</style>
