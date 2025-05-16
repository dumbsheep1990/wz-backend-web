<template>
  <div>
    <div class="gva-form-box">
      <el-form
        ref="formRef"
        :model="form"
        label-width="150px"
        :rules="rules"
        label-position="right"
      >
        <el-divider content-position="left">基础设置</el-divider>
        <el-form-item label="系统名称:" prop="systemName">
          <el-input v-model="form.systemName" placeholder="请输入系统名称" />
        </el-form-item>
        <el-form-item label="系统Logo:" prop="systemLogo">
          <upload-image v-model="form.systemLogo" :file-size="512" />
        </el-form-item>
        <el-form-item label="系统配色:" prop="systemColor">
          <el-color-picker v-model="form.systemColor" show-alpha />
        </el-form-item>
        <el-form-item label="系统模式:" prop="systemMode">
          <el-select v-model="form.systemMode" placeholder="请选择系统模式">
            <el-option label="正常模式" value="normal" />
            <el-option label="维护模式" value="maintenance" />
            <el-option label="只读模式" value="readonly" />
          </el-select>
        </el-form-item>

        <el-divider content-position="left">域名配置</el-divider>
        <el-form-item label="接口域名:" prop="systemApi">
          <el-input v-model="form.systemApi" placeholder="请输入接口域名" />
        </el-form-item>
        <el-form-item label="前台域名:" prop="systemDomain">
          <el-input v-model="form.systemDomain" placeholder="请输入前台域名" />
        </el-form-item>
        <el-form-item label="管理域名:" prop="adminDomain">
          <el-input v-model="form.adminDomain" placeholder="请输入管理域名" />
        </el-form-item>

        <el-divider content-position="left">文件存储</el-divider>
        <el-form-item label="存储类型:" prop="fileStoreType">
          <el-select v-model="form.fileStoreType" placeholder="请选择存储类型">
            <el-option label="本地存储" value="local" />
            <el-option label="OSS存储" value="oss" />
            <el-option label="COS存储" value="cos" />
            <el-option label="七牛云存储" value="qiniu" />
          </el-select>
        </el-form-item>

        <el-divider content-position="left">日志配置</el-divider>
        <el-form-item label="日志保存类型:" prop="logSaveType">
          <el-select v-model="form.logSaveType" placeholder="请选择日志保存类型">
            <el-option label="文件" value="file" />
            <el-option label="数据库" value="database" />
          </el-select>
        </el-form-item>
        <el-form-item label="日志保存路径:" prop="logSavePath" v-if="form.logSaveType === 'file'">
          <el-input v-model="form.logSavePath" placeholder="请输入日志保存路径" />
        </el-form-item>
        <el-form-item label="日志级别:" prop="logLevel">
          <el-select v-model="form.logLevel" placeholder="请选择日志级别">
            <el-option label="DEBUG" value="debug" />
            <el-option label="INFO" value="info" />
            <el-option label="WARN" value="warn" />
            <el-option label="ERROR" value="error" />
          </el-select>
        </el-form-item>
        <el-form-item label="单文件最大大小(MB):" prop="logMaxSize">
          <el-input-number v-model="form.logMaxSize" :min="1" :max="1000" />
        </el-form-item>
        <el-form-item label="最大保存文件数:" prop="logMaxBackups">
          <el-input-number v-model="form.logMaxBackups" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="文件保存天数:" prop="logMaxAge">
          <el-input-number v-model="form.logMaxAge" :min="1" :max="365" />
        </el-form-item>
        <el-form-item label="是否压缩:" prop="logCompress">
          <el-switch v-model="form.logCompress" />
        </el-form-item>

        <el-divider content-position="left">邮件配置</el-divider>
        <el-form-item label="SMTP服务器:" prop="emailHost">
          <el-input v-model="form.emailHost" placeholder="请输入SMTP服务器地址" />
        </el-form-item>
        <el-form-item label="端口:" prop="emailPort">
          <el-input-number v-model="form.emailPort" :min="1" :max="65535" />
        </el-form-item>
        <el-form-item label="发件人:" prop="emailFrom">
          <el-input v-model="form.emailFrom" placeholder="请输入发件人邮箱" />
        </el-form-item>
        <el-form-item label="授权密码:" prop="emailSecret">
          <el-input v-model="form.emailSecret" placeholder="请输入授权密码" show-password />
        </el-form-item>
        <el-form-item label="使用SSL:" prop="emailIsSSL">
          <el-switch v-model="form.emailIsSSL" />
        </el-form-item>
        <el-form-item label="发件人昵称:" prop="emailNickname">
          <el-input v-model="form.emailNickname" placeholder="请输入发件人昵称" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm">保存配置</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import UploadImage from '@/components/upload/image.vue'
import { getSystemConfig, updateSystemConfig } from '@/api/systemConfig'

const formRef = ref(null)
const form = ref({
  systemName: '',
  systemLogo: '',
  systemApi: '',
  systemDomain: '',
  systemColor: '#1890ff',
  systemMode: 'normal',
  adminDomain: '',
  fileStoreType: 'local',
  logSaveType: 'file',
  logSavePath: './logs',
  logLevel: 'info',
  logMaxSize: 10,
  logMaxBackups: 5,
  logMaxAge: 30,
  logCompress: true,
  emailHost: '',
  emailPort: 465,
  emailFrom: '',
  emailSecret: '',
  emailIsSSL: true,
  emailNickname: '',
})

const rules = ref({
  systemName: [{ required: true, message: '请输入系统名称', trigger: 'blur' }],
  systemApi: [{ required: true, message: '请输入接口域名', trigger: 'blur' }],
  systemDomain: [{ required: true, message: '请输入前台域名', trigger: 'blur' }],
  adminDomain: [{ required: true, message: '请输入管理域名', trigger: 'blur' }],
})

// 获取系统配置
const getConfig = async () => {
  try {
    const res = await getSystemConfig()
    if (res.code === 0) {
      form.value = res.data
    }
  } catch (error) {
    console.error('获取系统配置失败:', error)
    ElMessage.error('获取系统配置失败')
  }
}

// 提交表单
const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const res = await updateSystemConfig(form.value)
        if (res.code === 0) {
          ElMessage.success('保存成功')
        } else {
          ElMessage.error(res.message || '保存失败')
        }
      } catch (error) {
        console.error('保存系统配置失败:', error)
        ElMessage.error('保存系统配置失败')
      }
    } else {
      ElMessage.error('请填写完整表单')
      return false
    }
  })
}

// 重置表单
const resetForm = () => {
  getConfig()
}

onMounted(() => {
  getConfig()
})
</script>

<style scoped>
.gva-form-box {
  padding: 24px;
  background-color: #fff;
  border-radius: 2px;
}
</style> 