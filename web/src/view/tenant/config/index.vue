<template>
  <div>
    <h2>租户配置 - {{ tenantName }}</h2>
    <div class="content-box">
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="基本设置" name="basic">
          <el-form :model="basicSettings" label-width="150px" style="max-width: 600px;">
            <el-form-item label="租户名称">
              <el-input v-model="basicSettings.name" disabled />
            </el-form-item>
            <el-form-item label="租户标识">
              <el-input v-model="basicSettings.code" disabled />
            </el-form-item>
            <el-form-item label="负责人姓名">
              <el-input v-model="basicSettings.adminName" />
            </el-form-item>
            <el-form-item label="联系电话">
              <el-input v-model="basicSettings.phone" />
            </el-form-item>
            <el-form-item label="电子邮箱">
              <el-input v-model="basicSettings.email" />
            </el-form-item>
            <el-form-item label="过期时间">
              <el-date-picker v-model="basicSettings.expireTime" type="datetime" placeholder="选择过期时间" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="租户状态">
              <el-switch v-model="basicSettings.status" active-text="启用" inactive-text="禁用" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveBasicSettings">保存基本设置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="系统配置" name="system">
          <el-form :model="systemConfig" label-width="150px" style="max-width: 600px;">
            <el-form-item label="数据隔离方式">
              <el-radio-group v-model="systemConfig.dataIsolation" disabled>
                <el-radio label="database">独立数据库</el-radio>
                <el-radio label="schema">独立Schema</el-radio>
                <el-radio label="table">共享数据表</el-radio>
              </el-radio-group>
              <div class="form-tip">数据隔离方式在创建租户时已确定，不可修改。</div>
            </el-form-item>
            <el-form-item label="允许自定义主题">
              <el-switch v-model="systemConfig.allowCustomTheme" />
            </el-form-item>
            <el-form-item label="允许自定义域名">
              <el-switch v-model="systemConfig.allowCustomDomain" />
            </el-form-item>
            <el-form-item label="允许API访问">
              <el-switch v-model="systemConfig.allowApiAccess" />
            </el-form-item>
            <el-form-item label="IP白名单">
              <el-input v-model="systemConfig.ipWhitelist" type="textarea" :rows="3" placeholder="输入允许访问的IP，多个IP用逗号分隔" />
            </el-form-item>
            <el-form-item label="密码策略">
              <el-select v-model="systemConfig.passwordPolicy" placeholder="请选择密码策略" style="width: 100%;">
                <el-option label="低（仅长度限制）" value="low" />
                <el-option label="中（要求字母和数字）" value="medium" />
                <el-option label="高（要求大小写字母、数字和特殊字符）" value="high" />
              </el-select>
            </el-form-item>
            <el-form-item label="会话超时时间">
              <el-input-number v-model="systemConfig.sessionTimeout" :min="5" :max="1440" :step="5" />
              <span class="ml-10">分钟</span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveSystemConfig">保存系统配置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="功能模块" name="modules">
          <el-form label-width="150px">
            <el-form-item label="已启用模块">
              <el-checkbox-group v-model="moduleConfig.enabledModules">
                <el-checkbox label="cms">内容管理</el-checkbox>
                <el-checkbox label="ecommerce">电子商务</el-checkbox>
                <el-checkbox label="member">会员系统</el-checkbox>
                <el-checkbox label="analytics">数据分析</el-checkbox>
                <el-checkbox label="marketing">营销工具</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveModuleConfig">保存模块配置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="资源限制" name="resources">
          <el-form :model="resourceConfig" label-width="150px" style="max-width: 600px;">
            <el-form-item label="存储空间上限">
              <el-input-number v-model="resourceConfig.storageLimit" :min="1" :step="1" />
              <span class="ml-10">GB</span>
            </el-form-item>
            <el-form-item label="月流量上限">
              <el-input-number v-model="resourceConfig.trafficLimit" :min="1" :step="10" />
              <span class="ml-10">GB</span>
            </el-form-item>
            <el-form-item label="API请求限制">
              <el-input-number v-model="resourceConfig.apiRequestLimit" :min="1000" :step="1000" />
              <span class="ml-10">次/日</span>
            </el-form-item>
            <el-form-item label="最大管理员数">
              <el-input-number v-model="resourceConfig.adminLimit" :min="1" :max="100" :step="1" />
              <span class="ml-10">人</span>
            </el-form-item>
            <el-form-item label="最大用户数">
              <el-input-number v-model="resourceConfig.userLimit" :min="10" :step="100" />
              <span class="ml-10">人 (0表示不限制)</span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveResourceConfig">保存资源限制</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TenantConfig',
  data() {
    return {
      tenantName: '示例租户',
      activeTab: 'basic',
      basicSettings: {
        name: '示例租户',
        code: 'example_tenant',
        adminName: '张三',
        phone: '13800138000',
        email: 'admin@example.com',
        expireTime: new Date(),
        status: true
      },
      systemConfig: {
        dataIsolation: 'schema',
        allowCustomTheme: true,
        allowCustomDomain: false,
        allowApiAccess: true,
        ipWhitelist: '192.168.1.1,10.0.0.0/8',
        passwordPolicy: 'medium',
        sessionTimeout: 60
      },
      moduleConfig: {
        enabledModules: ['cms', 'member', 'analytics']
      },
      resourceConfig: {
        storageLimit: 50,
        trafficLimit: 200,
        apiRequestLimit: 100000,
        adminLimit: 5,
        userLimit: 1000
      }
    };
  },
  methods: {
    loadTenantConfig() {
      // 模拟从API加载租户配置
      const tenantId = this.$route.params.id; // 假设路由中会传入租户ID
      console.log('Loading config for tenant ID:', tenantId);
      // 实际应用中，这里会根据tenantId获取数据并填充到data中
      // this.tenantName = fetchedData.name;
      // this.basicSettings = fetchedData.basic;
      // ...etc.
      this.$message.info(`正在加载租户 "${this.tenantName}" 的配置信息`);
    },
    saveBasicSettings() {
      console.log('Saving basic settings:', this.basicSettings);
      this.$message.success('基本设置已保存');
    },
    saveSystemConfig() {
      console.log('Saving system config:', this.systemConfig);
      this.$message.success('系统配置已保存');
    },
    saveModuleConfig() {
      console.log('Saving module config:', this.moduleConfig);
      this.$message.success('功能模块配置已保存');
    },
    saveResourceConfig() {
      console.log('Saving resource config:', this.resourceConfig);
      this.$message.success('资源限制配置已保存');
    }
  },
  mounted() {
    this.loadTenantConfig();
  }
};
</script>

<style scoped>
.content-box {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}
.ml-10 {
  margin-left: 10px;
}
</style>
