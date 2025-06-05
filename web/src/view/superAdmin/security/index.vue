<template>
  <div>
    <h2>安全设置</h2>
    <div class="content-box">
      <!-- 安全设置内容将在这里实现 -->
      <el-tabs v-model="activeTab">
        <el-tab-pane label="密码策略" name="password">
          <div class="policy-item">
            <h3>密码策略配置</h3>
            <el-form :model="passwordPolicy" label-width="180px">
              <el-form-item label="最小密码长度">
                <el-input-number v-model="passwordPolicy.minLength" :min="6" :max="20" />
              </el-form-item>
              <el-form-item label="要求包含大写字母">
                <el-switch v-model="passwordPolicy.requireUppercase" />
              </el-form-item>
              <el-form-item label="要求包含数字">
                <el-switch v-model="passwordPolicy.requireNumber" />
              </el-form-item>
              <el-form-item label="要求包含特殊字符">
                <el-switch v-model="passwordPolicy.requireSpecial" />
              </el-form-item>
              <el-form-item label="密码有效期(天)">
                <el-input-number v-model="passwordPolicy.expireDays" :min="0" :max="365" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary">保存设置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
        <el-tab-pane label="登录策略" name="login">
          <div class="policy-item">
            <h3>登录安全配置</h3>
            <el-form :model="loginPolicy" label-width="180px">
              <el-form-item label="登录失败锁定阈值">
                <el-input-number v-model="loginPolicy.failedAttempts" :min="1" :max="10" />
              </el-form-item>
              <el-form-item label="锁定时间(分钟)">
                <el-input-number v-model="loginPolicy.lockDuration" :min="5" :max="1440" />
              </el-form-item>
              <el-form-item label="开启IP限制">
                <el-switch v-model="loginPolicy.ipRestriction" />
              </el-form-item>
              <el-form-item label="开启双因素认证">
                <el-switch v-model="loginPolicy.twoFactor" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary">保存设置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SecurityConfig',
  data() {
    return {
      activeTab: 'password',
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireNumber: true,
        requireSpecial: false,
        expireDays: 90
      },
      loginPolicy: {
        failedAttempts: 5,
        lockDuration: 30,
        ipRestriction: false,
        twoFactor: false
      }
    }
  },
  methods: {
    // 组件方法
  },
  mounted() {
    // 组件加载完成后执行
  }
}
</script>

<style scoped>
.content-box {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.policy-item {
  margin-bottom: 20px;
}
h3 {
  margin-top: 0;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}
</style>
