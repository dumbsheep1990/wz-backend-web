<template>
  <div class="payment-config-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>支付配置管理</span>
        </div>
      </template>

      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="支付宝配置" name="alipay">
          <el-form
            ref="alipayFormRef"
            :model="alipayConfig"
            :rules="alipayRules"
            label-width="120px"
            class="payment-form"
          >
            <el-form-item label="状态">
              <el-switch
                v-model="alipayConfig.enabled"
                active-text="启用"
                inactive-text="禁用"
              />
            </el-form-item>
            <el-form-item label="环境">
              <el-radio-group v-model="alipayConfig.environment">
                <el-radio label="sandbox">沙箱环境</el-radio>
                <el-radio label="production">生产环境</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="APPID" prop="appId">
              <el-input v-model="alipayConfig.appId" placeholder="请输入支付宝APPID" />
            </el-form-item>
            <el-form-item label="应用私钥" prop="privateKey">
              <el-input
                v-model="alipayConfig.privateKey"
                type="textarea"
                rows="3"
                placeholder="请输入应用私钥"
              />
            </el-form-item>
            <el-form-item label="支付宝公钥" prop="alipayPublicKey">
              <el-input
                v-model="alipayConfig.alipayPublicKey"
                type="textarea"
                rows="3"
                placeholder="请输入支付宝公钥"
              />
            </el-form-item>
            <el-form-item label="回调地址" prop="notifyUrl">
              <el-input 
                v-model="alipayConfig.notifyUrl" 
                placeholder="请输入回调地址" 
              />
            </el-form-item>
            <el-form-item label="返回地址" prop="returnUrl">
              <el-input 
                v-model="alipayConfig.returnUrl" 
                placeholder="请输入返回地址" 
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveAlipayConfig">保存配置</el-button>
              <el-button @click="testAlipayConnection">测试连接</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="微信支付配置" name="wechat">
          <el-form
            ref="wechatFormRef"
            :model="wechatConfig"
            :rules="wechatRules"
            label-width="120px"
            class="payment-form"
          >
            <el-form-item label="状态">
              <el-switch
                v-model="wechatConfig.enabled"
                active-text="启用"
                inactive-text="禁用"
              />
            </el-form-item>
            <el-form-item label="环境">
              <el-radio-group v-model="wechatConfig.environment">
                <el-radio label="sandbox">沙箱环境</el-radio>
                <el-radio label="production">生产环境</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="商户ID" prop="mchId">
              <el-input v-model="wechatConfig.mchId" placeholder="请输入微信支付商户ID" />
            </el-form-item>
            <el-form-item label="AppID" prop="appId">
              <el-input v-model="wechatConfig.appId" placeholder="请输入微信AppID" />
            </el-form-item>
            <el-form-item label="API密钥" prop="apiKey">
              <el-input 
                v-model="wechatConfig.apiKey" 
                placeholder="请输入API密钥" 
                show-password
              />
            </el-form-item>
            <el-form-item label="证书序列号" prop="serialNo">
              <el-input v-model="wechatConfig.serialNo" placeholder="请输入证书序列号" />
            </el-form-item>
            <el-form-item label="API V3密钥" prop="apiV3Key">
              <el-input 
                v-model="wechatConfig.apiV3Key" 
                placeholder="请输入API V3密钥" 
                show-password
              />
            </el-form-item>
            <el-form-item label="回调地址" prop="notifyUrl">
              <el-input v-model="wechatConfig.notifyUrl" placeholder="请输入回调地址" />
            </el-form-item>
            <el-form-item label="微信支付证书">
              <el-upload
                class="upload-demo"
                action="#"
                :auto-upload="false"
                :on-change="handleCertificateChange"
                :limit="1"
              >
                <template #trigger>
                  <el-button type="primary">选择证书文件</el-button>
                </template>
                <template #tip>
                  <div class="el-upload__tip">
                    请上传有效的微信支付证书（.pem格式）
                  </div>
                </template>
              </el-upload>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveWechatConfig">保存配置</el-button>
              <el-button @click="testWechatConnection">测试连接</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="全局设置" name="global">
          <el-form
            ref="globalFormRef"
            :model="globalConfig"
            label-width="160px"
            class="payment-form"
          >
            <el-form-item label="默认支付方式">
              <el-select v-model="globalConfig.defaultPayment" placeholder="请选择默认支付方式">
                <el-option label="支付宝" value="alipay" />
                <el-option label="微信支付" value="wechat" />
              </el-select>
            </el-form-item>
            <el-form-item label="支付超时时间（分钟）">
              <el-input-number
                v-model="globalConfig.timeoutMinutes"
                :min="1"
                :max="1440"
                :step="5"
              />
            </el-form-item>
            <el-form-item label="启用日志记录">
              <el-switch
                v-model="globalConfig.enableLog"
                active-text="开启"
                inactive-text="关闭"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveGlobalConfig">保存配置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 当前激活的标签页
const activeTab = ref('alipay')

// 支付宝配置
const alipayFormRef = ref(null)
const alipayConfig = reactive({
  enabled: false,
  environment: 'sandbox',
  appId: '',
  privateKey: '',
  alipayPublicKey: '',
  notifyUrl: '',
  returnUrl: ''
})

// 微信支付配置
const wechatFormRef = ref(null)
const wechatConfig = reactive({
  enabled: false,
  environment: 'sandbox',
  mchId: '',
  appId: '',
  apiKey: '',
  serialNo: '',
  apiV3Key: '',
  notifyUrl: '',
  certificate: null
})

// 全局配置
const globalFormRef = ref(null)
const globalConfig = reactive({
  defaultPayment: 'alipay',
  timeoutMinutes: 30,
  enableLog: true
})

// 表单验证规则
const alipayRules = {
  appId: [
    { required: true, message: '请输入支付宝APPID', trigger: 'blur' }
  ],
  privateKey: [
    { required: true, message: '请输入应用私钥', trigger: 'blur' }
  ],
  alipayPublicKey: [
    { required: true, message: '请输入支付宝公钥', trigger: 'blur' }
  ],
  notifyUrl: [
    { required: true, message: '请输入回调地址', trigger: 'blur' },
    { pattern: /^https?:\/\//, message: '回调地址必须以http://或https://开头', trigger: 'blur' }
  ],
  returnUrl: [
    { required: true, message: '请输入返回地址', trigger: 'blur' },
    { pattern: /^https?:\/\//, message: '返回地址必须以http://或https://开头', trigger: 'blur' }
  ]
}

const wechatRules = {
  mchId: [
    { required: true, message: '请输入微信支付商户ID', trigger: 'blur' }
  ],
  appId: [
    { required: true, message: '请输入微信AppID', trigger: 'blur' }
  ],
  apiKey: [
    { required: true, message: '请输入API密钥', trigger: 'blur' }
  ],
  apiV3Key: [
    { required: true, message: '请输入API V3密钥', trigger: 'blur' }
  ],
  notifyUrl: [
    { required: true, message: '请输入回调地址', trigger: 'blur' },
    { pattern: /^https?:\/\//, message: '回调地址必须以http://或https://开头', trigger: 'blur' }
  ]
}

// 方法
const fetchAlipayConfig = async () => {
  try {
    // 实际项目中应调用API获取配置
    // const res = await getPaymentConfigs('alipay')
    // 模拟数据
    const mockData = {
      enabled: true,
      environment: 'sandbox',
      appId: '2021000000000000',
      privateKey: '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAA...(省略)\n-----END RSA PRIVATE KEY-----',
      alipayPublicKey: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBg...(省略)\n-----END PUBLIC KEY-----',
      notifyUrl: 'https://api.example.com/payment/alipay/notify',
      returnUrl: 'https://www.example.com/payment/return'
    }
    
    // 更新表单数据
    Object.assign(alipayConfig, mockData)
  } catch (error) {
    console.error('获取支付宝配置失败', error)
    ElMessage.error('获取支付宝配置失败')
  }
}

const fetchWechatConfig = async () => {
  try {
    // 实际项目中应调用API获取配置
    // const res = await getPaymentConfigs('wechat')
    // 模拟数据
    const mockData = {
      enabled: true,
      environment: 'sandbox',
      mchId: '1900000000',
      appId: 'wx0000000000000000',
      apiKey: '32charactersapikey123456789abcdef',
      serialNo: 'ABCDEF1234567890',
      apiV3Key: '32characterswechatv3key123456789ab',
      notifyUrl: 'https://api.example.com/payment/wechat/notify'
    }
    
    // 更新表单数据
    Object.assign(wechatConfig, mockData)
  } catch (error) {
    console.error('获取微信支付配置失败', error)
    ElMessage.error('获取微信支付配置失败')
  }
}

const fetchGlobalConfig = async () => {
  try {
    // 实际项目中应调用API获取配置
    // const res = await getPaymentGlobalConfig()
    // 模拟数据
    const mockData = {
      defaultPayment: 'alipay',
      timeoutMinutes: 30,
      enableLog: true
    }
    
    // 更新表单数据
    Object.assign(globalConfig, mockData)
  } catch (error) {
    console.error('获取全局配置失败', error)
    ElMessage.error('获取全局配置失败')
  }
}

const saveAlipayConfig = async () => {
  if (!alipayFormRef.value) return
  
  try {
    await alipayFormRef.value.validate()
    
    // 实际项目中应调用API保存配置
    // await savePaymentConfig('alipay', alipayConfig)
    ElMessage.success('支付宝配置保存成功')
  } catch (error) {
    console.error('支付宝配置保存失败', error)
    ElMessage.error('支付宝配置保存失败，请检查表单')
  }
}

const saveWechatConfig = async () => {
  if (!wechatFormRef.value) return
  
  try {
    await wechatFormRef.value.validate()
    
    // 实际项目中应调用API保存配置
    // await savePaymentConfig('wechat', wechatConfig)
    ElMessage.success('微信支付配置保存成功')
  } catch (error) {
    console.error('微信支付配置保存失败', error)
    ElMessage.error('微信支付配置保存失败，请检查表单')
  }
}

const saveGlobalConfig = async () => {
  try {
    // 实际项目中应调用API保存配置
    // await savePaymentGlobalConfig(globalConfig)
    ElMessage.success('全局配置保存成功')
  } catch (error) {
    console.error('全局配置保存失败', error)
    ElMessage.error('全局配置保存失败')
  }
}

const testAlipayConnection = async () => {
  if (!alipayConfig.enabled) {
    ElMessage.warning('支付宝支付未启用，请先启用后再测试')
    return
  }
  
  try {
    ElMessage.info('正在测试支付宝连接...')
    // 实际项目中应调用API测试连接
    // await testPaymentConnection('alipay')
    
    // 模拟网络延迟
    setTimeout(() => {
      ElMessage.success('支付宝连接测试成功')
    }, 1500)
  } catch (error) {
    console.error('支付宝连接测试失败', error)
    ElMessage.error('支付宝连接测试失败，请检查配置')
  }
}

const testWechatConnection = async () => {
  if (!wechatConfig.enabled) {
    ElMessage.warning('微信支付未启用，请先启用后再测试')
    return
  }
  
  try {
    ElMessage.info('正在测试微信支付连接...')
    // 实际项目中应调用API测试连接
    // await testPaymentConnection('wechat')
    
    // 模拟网络延迟
    setTimeout(() => {
      ElMessage.success('微信支付连接测试成功')
    }, 1500)
  } catch (error) {
    console.error('微信支付连接测试失败', error)
    ElMessage.error('微信支付连接测试失败，请检查配置')
  }
}

const handleCertificateChange = (file) => {
  // 实际项目中应处理证书文件
  wechatConfig.certificate = file.raw
  ElMessage.success('证书文件已选择')
}

// 生命周期
onMounted(() => {
  fetchAlipayConfig()
  fetchWechatConfig()
  fetchGlobalConfig()
})
</script>

<style scoped>
.payment-config-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.payment-form {
  max-width: 800px;
  margin: 20px auto;
}

.el-upload {
  width: 100%;
}

.el-upload__tip {
  margin-top: 10px;
  line-height: 1.4;
}
</style>
