<template>
  <div class="payment-config-container">
    <el-card shadow="hover" class="config-card">
      <div slot="header" class="config-header">
        <span>支付方式配置</span>
      </div>
      
      <el-tabs v-model="activeTab">
        <el-tab-pane label="支付宝配置" name="alipay">
          <el-form :model="alipayConfig" :rules="alipayRules" ref="alipayForm" label-width="120px">
            <el-form-item label="App ID" prop="app_id">
              <el-input v-model="alipayConfig.app_id" placeholder="请输入支付宝应用ID"></el-input>
            </el-form-item>
            <el-form-item label="商户ID" prop="merchant_id">
              <el-input v-model="alipayConfig.merchant_id" placeholder="请输入支付宝商户ID"></el-input>
            </el-form-item>
            <el-form-item label="私钥" prop="private_key">
              <el-input type="textarea" v-model="alipayConfig.private_key" placeholder="请输入支付宝应用私钥" rows="5"></el-input>
            </el-form-item>
            <el-form-item label="公钥" prop="public_key">
              <el-input type="textarea" v-model="alipayConfig.public_key" placeholder="请输入支付宝应用公钥" rows="5"></el-input>
            </el-form-item>
            <el-form-item label="支付回调地址" prop="notify_url">
              <el-input v-model="alipayConfig.notify_url" placeholder="请输入支付宝异步通知回调地址"></el-input>
            </el-form-item>
            <el-form-item label="跳转地址" prop="return_url">
              <el-input v-model="alipayConfig.return_url" placeholder="请输入支付成功后跳转地址"></el-input>
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-switch
                v-model="alipayConfig.status"
                :active-value="true"
                :inactive-value="false"
                active-text="启用"
                inactive-text="禁用">
              </el-switch>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveAlipayConfig">保存配置</el-button>
              <el-button type="success" @click="testAlipayConfig">测试连接</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="微信支付配置" name="wechat">
          <el-form :model="wechatConfig" :rules="wechatRules" ref="wechatForm" label-width="120px">
            <el-form-item label="App ID" prop="app_id">
              <el-input v-model="wechatConfig.app_id" placeholder="请输入微信应用ID"></el-input>
            </el-form-item>
            <el-form-item label="商户ID" prop="merchant_id">
              <el-input v-model="wechatConfig.merchant_id" placeholder="请输入微信商户ID"></el-input>
            </el-form-item>
            <el-form-item label="API密钥" prop="private_key">
              <el-input v-model="wechatConfig.private_key" placeholder="请输入微信API密钥" show-password></el-input>
            </el-form-item>
            <el-form-item label="支付回调地址" prop="notify_url">
              <el-input v-model="wechatConfig.notify_url" placeholder="请输入微信异步通知回调地址"></el-input>
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-switch
                v-model="wechatConfig.status"
                :active-value="true"
                :inactive-value="false"
                active-text="启用"
                inactive-text="禁用">
              </el-switch>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveWechatConfig">保存配置</el-button>
              <el-button type="success" @click="testWechatConfig">测试连接</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import { 
  getPaymentConfigs, 
  getPaymentConfigByType, 
  savePaymentConfig, 
  updatePaymentConfigStatus 
} from '@/api/admin/trade/payment'
import { mapGetters } from 'vuex'
import { checkPermission } from '@/utils/permission'
import { logOperation } from '@/utils/logger'

export default {
  name: 'PaymentConfig',
  data() {
    return {
      activeTab: 'alipay',
      alipayConfig: {
        id: null,
        pay_type: 1,
        pay_name: '支付宝',
        app_id: '',
        merchant_id: '',
        private_key: '',
        public_key: '',
        notify_url: '',
        return_url: '',
        status: true
      },
      wechatConfig: {
        id: null,
        pay_type: 2,
        pay_name: '微信支付',
        app_id: '',
        merchant_id: '',
        private_key: '',
        notify_url: '',
        status: true
      },
      alipayRules: {
        app_id: [
          { required: true, message: '请输入App ID', trigger: 'blur' }
        ],
        merchant_id: [
          { required: true, message: '请输入商户ID', trigger: 'blur' }
        ],
        private_key: [
          { required: true, message: '请输入私钥', trigger: 'blur' }
        ],
        public_key: [
          { required: true, message: '请输入公钥', trigger: 'blur' }
        ],
        notify_url: [
          { required: true, message: '请输入回调地址', trigger: 'blur' }
        ]
      },
      wechatRules: {
        app_id: [
          { required: true, message: '请输入App ID', trigger: 'blur' }
        ],
        merchant_id: [
          { required: true, message: '请输入商户ID', trigger: 'blur' }
        ],
        private_key: [
          { required: true, message: '请输入API密钥', trigger: 'blur' }
        ],
        notify_url: [
          { required: true, message: '请输入回调地址', trigger: 'blur' }
        ]
      },
      loading: false
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'roles']),
    hasConfigPermission() {
      return checkPermission('payment:config', this.roles)
    }
  },
  created() {
    this.getConfigs()
  },
  methods: {
    // 获取支付配置
    async getConfigs() {
      if (!this.hasConfigPermission) {
        this.$message.warning('您没有配置支付方式的权限')
        return
      }

      this.loading = true
      try {
        const res = await getPaymentConfigs()
        if (res.code === 0) {
          const configs = res.data || []
          configs.forEach(config => {
            if (config.pay_type === 1) {
              // 支付宝配置
              this.alipayConfig = { ...config }
            } else if (config.pay_type === 2) {
              // 微信支付配置
              this.wechatConfig = { ...config }
            }
          })
        } else {
          this.$message.error(res.message || '获取支付配置失败')
        }
      } catch (error) {
        console.error('获取支付配置出错:', error)
        this.$message.error('获取支付配置出错')
      } finally {
        this.loading = false
      }
    },

    // 保存支付宝配置
    saveAlipayConfig() {
      if (!this.hasConfigPermission) {
        this.$message.warning('您没有配置支付方式的权限')
        return
      }

      this.$refs.alipayForm.validate(async valid => {
        if (valid) {
          this.loading = true
          try {
            const res = await savePaymentConfig(this.alipayConfig)
            if (res.code === 0) {
              this.$message.success('支付宝配置保存成功')
              this.getConfigs()
              
              logOperation({
                module: '支付管理',
                operationType: '保存支付宝配置',
                operator: this.userInfo.username,
                result: '成功'
              })
            } else {
              this.$message.error(res.message || '保存失败')
              
              logOperation({
                module: '支付管理',
                operationType: '保存支付宝配置',
                operator: this.userInfo.username,
                result: '失败',
                errorMsg: res.message
              })
            }
          } catch (error) {
            console.error('保存支付宝配置出错:', error)
            this.$message.error('保存支付宝配置出错')
          } finally {
            this.loading = false
          }
        } else {
          return false
        }
      })
    },

    // 保存微信支付配置
    saveWechatConfig() {
      if (!this.hasConfigPermission) {
        this.$message.warning('您没有配置支付方式的权限')
        return
      }

      this.$refs.wechatForm.validate(async valid => {
        if (valid) {
          this.loading = true
          try {
            const res = await savePaymentConfig(this.wechatConfig)
            if (res.code === 0) {
              this.$message.success('微信支付配置保存成功')
              this.getConfigs()
              
              logOperation({
                module: '支付管理',
                operationType: '保存微信支付配置',
                operator: this.userInfo.username,
                result: '成功'
              })
            } else {
              this.$message.error(res.message || '保存失败')
              
              logOperation({
                module: '支付管理',
                operationType: '保存微信支付配置',
                operator: this.userInfo.username,
                result: '失败',
                errorMsg: res.message
              })
            }
          } catch (error) {
            console.error('保存微信支付配置出错:', error)
            this.$message.error('保存微信支付配置出错')
          } finally {
            this.loading = false
          }
        } else {
          return false
        }
      })
    },

    // 测试支付宝配置
    testAlipayConfig() {
      this.$message.info('支付宝配置测试功能暂未实现')
    },

    // 测试微信支付配置
    testWechatConfig() {
      this.$message.info('微信支付配置测试功能暂未实现')
    }
  }
}
</script>

<style lang="scss" scoped>
.payment-config-container {
  padding: 20px;
  
  .config-card {
    .config-header {
      font-size: 16px;
      font-weight: bold;
    }
  }
}
</style> 