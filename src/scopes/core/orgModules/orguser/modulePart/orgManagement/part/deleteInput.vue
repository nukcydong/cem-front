<template>
  <!--删除组织信息弹出框-->
  <ta-modal title="组织机构删除" :visible="visible" @cancel="closeModal">
    <p>此操作将删除该组织机构及其所有下级组织，请输入"delete/删除"</p>
    <ta-form :autoFormCreate="(form)=>{this.deleteForm = form}">
      <ta-form-item fieldDecoratorId="deleteInput" :fieldDecoratorOptions="{rules: [{ required: true, message: '请输入 \'delete\' / \'删除\'' },{type: 'enum', enum: ['delete', '删除'], message: '只能输入 \'delete\' 或 \'删除\' ' }]}">
        <ta-input placeholder="请输入'delete'或者'删除'"></ta-input>
      </ta-form-item>
    </ta-form>
    <template slot="footer">
      <ta-button type="primary" @click="deleteOrgBatch">确定</ta-button>
      <ta-button @click="closeModal">取消</ta-button>
    </template>
  </ta-modal>
</template>
<script>
  import $api from '../api/index'
  export default {
    name: 'deleteInput',
    props:['visible','deleteOrgIds'],
    data() {
      return {
        deleteForm: null
      }
    },
    methods: {
      deleteOrgBatch: function () {
        this.deleteForm.validateFields((err, values) => {
          if (!err) {
            $api.deleteBatchOrgs(this, {"orgIds": this.deleteOrgIds}, (data) => {
              this.$message.success('删除成功');
              this.$emit('setDataList')
              this.closeModal();
            });
          }
        })
      },
      closeModal(){
        this.deleteForm.resetFields()
        this.$emit('close')
      }
    }
  }
</script>
