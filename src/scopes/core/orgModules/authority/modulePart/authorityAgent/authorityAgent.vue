<template>
  <div id="authorityAgent" style="height: 100%">
    <ta-border-layout :layout="{header:'70px'}" :centerCfg="{showBar: true}">
      <ta-row slot="header" type="flex" justify="center" align="middle">
        <ta-input-search placeholder="请输入角色名称" class="search-box" @search="handleSearch" v-model="searchInfo"  enterButton="搜索"></ta-input-search>
      </ta-row>
      <div slot="centerExtraContent">
        <ta-cascader
          url="org/authority/authorityAgentRestService/getOrgByAsync"
          treeId="orgTree"
          :options.sync="options"
          expandTrigger="hover"
          changeOnSelect
          :fieldNames="{ label: 'orgName', value: 'orgId', children: 'children' }"
          @change="handleChangeOrg"
          style="width:250px; margin-right: 10px;"
          placeholder="请选择人员的所属组织"/>
        <ta-checkbox @change="handleChangeChildOrg" :checked="searchCheckedOrgChild">包含子组织</ta-checkbox>
        <div style="float: right">
          <ta-button type="primary" @click="handleToNewAuthorityAgent">
            新增代理角色
          </ta-button>
          <ta-button @click="handleBatchDelete">
            批量删除
          </ta-button>
        </div>
      </div>
      <div>
        <ta-table :rowSelection="{onChange: handleAgentRoleSelected, selectedRowKeys: selectedRowKeys,}" :columns="agentRoleColumns" :dataSource="agentRoleData" :pagination="false" >
          <ta-icon type="search" slot="action" slot-scope="text,record" @click="handleOperation(record)" class="action"/>
        </ta-table>
        <ta-pagination
          style="float: right;margin-top: 10px"
          showSizeChanger
          showQuickJumper
          :dataSource.sync="agentRoleData"
          :defaultPageSize="100"
          :params="fnAgentRolePageParams"
          url="org/authority/authorityAgentRestService/queryAllAgentRole"
          ref="agentRolePager"
        />
      </div>

    </ta-border-layout>

    <ta-modal :centered="true"
              v-model="addAgentModelVisible"
              width="1000px"
              :destroyOnClose="true"
              :maskClosable="false">
      <span slot="title">新增代理角色</span>
      <new-authority-agent ref="newAgent" @refreshAgentRole="fnGetAllAgentRole"/>
      <template slot="footer">
          <ta-button key="back" @click="handleHideModel">取消</ta-button>
          <ta-button key="submit" type="primary" @click="handleAddAgentRole">保存</ta-button>
      </template>
    </ta-modal>

    <ta-modal :centered="true"
              v-model="modifyAgentModelVisible"
              width="1000px"
              :destroyOnClose="true"
              :maskClosable="false">
      <span slot="title">查看/修改权限</span>
      <modify-authority-agent :agentRole="modifyAgentRole" ref="modifyAgent" @refreshAgentRole="fnGetAllAgentRole"/>
      <template slot="footer">
          <ta-button key="back" @click="handleHideModel">取消</ta-button>
          <ta-button key="submit" type="primary" @click="handleSaveModifyAgent">保存</ta-button>
      </template>
    </ta-modal>
  </div>
</template>
<script>

  import api from './api'
  import newAuthorityAgent from "./part/newAuthorityAgent";
  import modifyAuthorityAgent from "./part/modifyAuthorityAgent"

  const agentRoleColumns = [{
    title: '角色名称',
    dataIndex: 'roleName',
    width: '10%',
    overflowTooltip:true,
  },{
    title:'组织路径',
    dataIndex:'namePath',
    width: '30%',
    overflowTooltip:true,
  },{
    title: '委派截止日期',
    dataIndex: 'effectiveTime',
    width: '10%',
    customRender:function (text) {
      return text && text.split(" ")[0];
    }
  },{
    title:'创建人',
    dataIndex:'createUserName',
    width: '10%',
    overflowTooltip:true,
  },{
    title:'查看/修改权限',
    key:'action',
    align:'center',
    width: 160,
    scopedSlots: { customRender: 'action' }
  }];

  export default {
    name:"authorityAgent",
    components: { newAuthorityAgent, modifyAuthorityAgent},
    data(){
      return {
        //搜索條件
        searchInfo:'',
        options:[],
        searchOrgIds:[],
        searchCheckedOrgChild:true,
        //代理角色列表
        agentRoleColumns,
        agentRoleData:[],
        selectedRowKeys: [],
        selectedAgentRoles:[],
        //新增/修改窗口控制
        addAgentModelVisible:false,
        modifyAgentModelVisible:false,
        //当前操作角色
        modifyAgentRole:{},
      }
    },
    methods:{
      handleSearch(){
        this.$refs.agentRolePager.loadData();
      },
      handleChangeOrg(data){
        this.searchOrgIds = data
        this.handleSearch()
      },
      handleChangeChildOrg(e){
        this.searchCheckedOrgChild = e.target.checked
        this.handleSearch()
      },
      handleAddAgentRole(){
        this.$refs.newAgent.fnNewAgentRole();
      },
      handleSaveModifyAgent(){
        this.$refs.modifyAgent.fnSaveModifyAgentRole();
      },
      handleHideModel(){
        this.addAgentModelVisible = false;
        this.modifyAgentModelVisible = false;
      },
      handleAgentRoleSelected: function (selectedRowKeys, selectedRows) {
        this.selectedRowKeys = selectedRowKeys;
        this.selectedAgentRoles = selectedRows;
      },
      handleToNewAuthorityAgent(){
        this.addAgentModelVisible = true;
      },
      handleOperation(record){
        this.modifyAgentRole = record;
        this.modifyAgentModelVisible = true;
      },
      fnGetAllAgentRole(){
        this.addAgentModelVisible = false;
        this.modifyAgentModelVisible = false;
        this.$refs.agentRolePager.loadData();
        // api.queryAllAgentRole(this,(data)=>{
        //   this.agentRoleData = data.agentVos.list;
        // });
      },
      fnAgentRolePageParams(){
        let param = {};
        //所属组织框
        let orgIds = this.searchOrgIds;
        if (orgIds != undefined && orgIds != "") {
          let orgId = orgIds[orgIds.length - 1];
          param.orgId = orgId;
        }
        //子组织按钮
        let includeChild = this.searchCheckedOrgChild ? "1" : "0";
        param.includeChild = includeChild;
        //录入搜索内容
        if ("" != this.searchInfo) {
          param.roleName = this.searchInfo;
        }

        return param
      },
      handleBatchDelete(){
        let roleIdArray = this.selectedAgentRoles.map(value => {
          return value.roleId;
        });
        if(roleIdArray.length < 1){
          this.$message.warn("请先勾选要删除的代理角色");
          return;
        }

        this.$confirm({
          title: '是否删除已选中的代理角色?',
          okText: '删除',
          okType: 'danger',
          onOk:() => {
            api.batchDeleteAgentRole(this,roleIdArray,(data) => {
              this.fnGetAllAgentRole();
            })
          }
        });
      }
    },
    mounted(){
      this.fnGetAllAgentRole();
    }
  }
</script>

<style lang="scss" type="text/scss" scoped>
  .action{
    cursor: pointer;
  }
  .search-box{ width: 340px; line-height: 46px}
</style>
