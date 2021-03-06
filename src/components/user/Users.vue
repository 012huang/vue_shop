<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-input
            placeholder="请输入内容"
            class="input-with-select"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addUserDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户表格区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <!-- 通过作用于插槽, 可以通过scope.row获取当前行的数据 -->
            <!-- debug {{scope.row}} -->
            <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 编辑按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditUserDialog(scope.row.id)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top-end" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="addUserDialogVisible" width="50%" @close="addUserDialogClosed">
      <el-form
        :model="addUserForm"
        :rules="addUserFormRules"
        ref="addUserFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addUserDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑用户的对话框 -->
    <el-dialog title="编辑用户" :visible.sync="editUserDialogVisible" width="50%" @close="editUserDialogClose">
      <el-form
        :model="editUserDialogForm"
        :rules="editUserDialogFormRules"
        ref="editUserDialogFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editUserDialogForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editUserDialogForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editUserDialogForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editUserDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    // 邮箱自定义效验规则
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/

      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb()
      }

      return cb(new Error('请输入合法的邮箱'))
    }

    // 邮箱自定义效验规则
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

      if (regMobile.test(value)) {
        // 合法的邮箱
        return cb()
      }

      return cb(new Error('请输入合法的手机号'))
    }

    return {
      // 获取用户列表的查询参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      userList: [],
      total: 0,
      addUserDialogVisible: false,
      addUserForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addUserFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在3~10个字符之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在6~15个字符之间', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      editUserDialogVisible: false,
      editUserDialogForm: {},
      editUserDialogFormRules: {
        email: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败!')
      }
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 改变当前每页显示多少条数据触发函数
    handleSizeChange(newPageSize) {
      console.log(newPageSize)
      this.queryInfo.pagesize = newPageSize
      this.getUserList()
    },
    // 当前页码发生改变触发函数
    handleCurrentChange(newPageNum) {
      console.log(newPageNum)
      this.queryInfo.pagenum = newPageNum
      this.getUserList()
    },
    // 监听switch开关状态的变化
    async userStateChange(userInfo) {
      console.log(userInfo)
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新用户状态信息失败!')
      }
      this.$message.success('更新用户状态信息成功!')
    },
    // addUserDialog对话框关闭时, 对表字段进行重置
    addUserDialogClosed() {
      console.log('dialog closed')
      this.$refs.addUserFormRef.resetFields()
    },
    // 表单提交时进行预校验, 并提交
    addUser() {
      console.log('debug: --------------')
      this.$refs.addUserFormRef.validate(async valid => {
        console.log(valid)
        if (!valid) return
        
        // 效验通过, 则提交数据到后台
        const { data: res } = await this.$http.post('users', this.addUserForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败')
        }

        this.$message.success('添加用户成功')
        // 添加成功之后, 隐藏对话框
        this.addUserDialogVisible = false

        // 并且从后台重新加载数据
        this.getUserList()
      })
    },
    async showEditUserDialog(id) {
      console.log(id)
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      }
      console.log(res.data)
      this.editUserDialogForm = res.data
      this.editUserDialogVisible = true
    },
    editUserDialogClose() {
      this.$refs.editUserDialogFormRef.resetFields()
    },
    editUserInfo() {
      this.$refs.editUserDialogFormRef.validate(async valid => {
        console.log(valid)
        if (!valid) return
        // 校验通过, 则发起http请求提交修改后的数据到后台
        const { data: res } = await this.$http.put('users/' + this.editUserDialogForm.id, {
          email: this.editUserDialogForm.email,
          mobile: this.editUserDialogForm.mobile
        })
        if (res.meta.status !== 200) {
          return this.$message.error('更新用户信息失败')
        }
        // 提交修改信息成功, 则
        // 关闭对话框
        this.editUserDialogVisible = false
        // 刷新数据
        this.getUserList()
        // 显示修改成功信息
        this.$message.success('更新用户信息成功')
      })
    },
    async removeUserById(id) {
      console.log(id)
      // 弹框提示
      const confirmResult = await this.$confirm('此操作将永久删除该该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(message => message)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        this.$message.error('删除用户失败')
      }
      this.$message.success('删除用户成功')
      this.getUserList()
    }
  }
}
</script>
<style lang="less" scoped>
.el-table {
  margin-top: 20px;
  font-size: 12px;
}
</style>
