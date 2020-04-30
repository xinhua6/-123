<template>
<!-- 上传文件 -->
  <div class="c-fd_c c-h100" >
    <div class="c-flex1" v-loading="loading">
      <div class="c-flex c-h100 c-print-warp">
        <div class="c-flex1">
          <wp-form
            ref="form"
            :items="formItems"
            :data="formData"
            :defaultConfig="defaultConfig"
            class="wp-form"
          >
          <!--文件资料-->
            <template v-slot:fileData>
              <div>
                <div>
                  <wp-attach-file
                          :page="page"
                          :recordId="pageKid"
                          :disabled="isView"
                          @getFileName = "getFileName"
                          ref="attachFile"
                          @delAppend = "delAppend"
                  >
                    <div slot="add" class="c-fd_r">
                      <el-button type="primary" size="mini" @click="addlocalFile">本地添加</el-button>
                      <el-button type="primary" size="mini" @click="addonFile">在线选择</el-button>
                    </div>
                  </wp-attach-file>
                </div>
                <div v-show="radio === 2">
                  <wp-window  @on-closed="winClose" v-if="radio === 2 && winClosed === false" :loading="loading" width="660px" height="400px"
                              title="在线上传">
                    <div class="c-flex">
                      <div class="projList">
                        <el-tree :data="treeData" :props="defaultProps" @node-click="projClick" highlight-current></el-tree>
                      </div>
                      <div class="fileList">
                        <div v-for="(item,index) in fileList" :key="index"
                             :style="{color:item.isSel ?  $store.state.theme.color: ''}"
                             @click="fileClick(item)"
                             class="item c-jc_sb">
                          <span>{{item.fileName}}</span>
                          <el-checkbox :key="item.kid" :value="item.isSel" @change="fileClick(item)" ></el-checkbox>
                        </div>
                      </div>
                    </div>
                    <template slot="footer">
                      <el-button size="small" @click="winClose">取消</el-button>
                      <el-button size="small" type="primary" @click="winClose">确定</el-button>
                    </template>
                  </wp-window>
                </div>
              </div>
            </template>
          </wp-form>
        </div>
      </div>
    </div>
    <detail-btn :actions="actions"></detail-btn>
  </div>
</template>

<script>
  import { guid } from 'src/utils/util'
  import DetailBtn from 'src/moudles/data-and-form/common/detail-btn.vue'
  import DetailMixin from '../detail-mixin'
  import formatDate from 'src/utils/date.js'
  import { baseWarn } from 'src/common/fn'

  // 无需新增功能
  export default {
    components: {
      DetailBtn
    },
    mixins: [DetailMixin],
    data () {
      const userData = this.$store.state.user.userData
      const page = this.$route.query.page
      return {
        loading: false,
        page: 'add',
        winClosed: false,
        radio: 1,
        fileList: [],
        selectFiles: [],
        dataFiles: [],
        formData: {
          version: 'version-1'
        },
        defaultConfig: {
          itemWidth: '45%'
        },
        defaultProps: { // 默认设置
          children: 'children',
          label: 'menuName'
        },
        formItems: [
          {
            name: 'projName',
            type: 'el-input',
            width: '100%',
            label: '项目名称',
            props: {
              disabled: true
            }
          },
          {
            name: 'flowName',
            label: '当前程序',
            width: '100%',
            type: 'el-input',
            props: {
              disabled: true
            }
          },
          {
            name: 'fileData',
            type: 'custom',
            width: '100%',
            label: '文件资料',
            required: true
          }
        ],
        actions: [
          {
            name: 'cancel',
            label: '取消',
            click: this.cancel
          },
          {
            name: 'commit',
            label: '确定',
            type: 'primary',
            click: this.commitClick
          }
        ],
        kidList: [],
        fileName: [],
        kidList2: [],
        fileName2: []
      }
    },
    props: {
      defaultData: {
        type: Object
      },
      versionKid: {
        type: String
      }
    },
    watch: {
      radio: {
        handler: function (val) {
          if (val === 2) {
            this.$store.dispatch(`${this.wpstore}/getFileTreeData`, { projId: this.defaultData.projId, isAllMenu: 1 })
            this.winClosed = false
          }
        }
      },

      defaultData: {
        handler: function (val) {

        },
        deep: true
      }
    },
    computed: {
      treeData () {
        return this.$sysStore.fileTreeData
      },
      userName () {
        return this.$store.getters.userData.username
      },
      date () {
            return formatDate()
        },
      kid () {
        return this.versionKid ? this.versionKid : guid()
      }
    },
    created () {
    },
    mounted () {
      this.formData.projName = this.defaultData.projName
      this.formData.flowName = this.defaultData.flowName
    },
    methods: {
      delAppend (val) {
        this.fileName2.splice(this.fileName2.findIndex(item => val.fileName === item), 1)
        this.kidList2.splice(this.kidList2.findIndex(item => val.kid === item), 1)
      },

      commitClick () {
        this.loading = true
        this.fileName2.forEach(item => this.fileName.push(item))
        this.kidList2.forEach(item => this.kidList.push(item))
        if (this.kidList.length === 0 && this.defaultData.typeId === 1) {
          baseWarn('数据填写有误，请修改', null, null, null)
          this.loading = false
        } else if (this.kidList.length === 0 && this.defaultData.typeId === 2) {
          this.$emit('close', false)
        } else {
          this.fileName = this.fileName.join(',')
          this.kidList = this.kidList.join(',')
          // 提交表单
          this.$axios({
            url: '/HMS-DATA/imisProjEarlyFlowFileSetMst_add',
            method: 'post',
            data: {
              kid: this.kid,
              // addDate: this.date,
              addUnitId: this.$store.getters.userData.orgId,
              addUnitName: this.$store.getters.userData.orgName,
              addUserId: this.$store.getters.userData.userId,
              addUserName: this.userName,
              isDel: 0,
              kids: this.kidList,
              fileNames: this.fileName,
              ...this.defaultData,
              ...this.formData
            }
          })
            .then(res => {
              this.loading = false
              this.$message({ type: 'success', message: '上传成功' })
              this.$emit('getVersion')
              this.$emit('close', false)
            })
            .catch(function (error) {
              console.log(error)
            })
        }
      },
      cancel () {
        this.$emit('close', false)
      },

      // 请求在线文件列表
      projClick (node) {
        if (node.children.length === 0) {
          this.$axios.get('/HMS-DATA/imisFileRecord_query', {
            params: {
              joinId: node.kid,
              selectType: this.$store.state.user.isOuterUser ? 5 : 4,
              page: 0,
              limit: 0
            }
          }).then(res => {
            this.fileList = res.data
            for (let i = 0; i < this.fileList.length; i++) {
              for (let j = 0; j < this.$refs.attachFile.append.length; j++) {
                if (this.fileList[i].kid === this.$refs.attachFile.append[j].kid) {
                  this.$set(this.fileList[i], 'isSel', true)
                  break
                } else {
                  this.$set(this.fileList[i], 'isSel', false)
                }
              }
            }
          })
        }
      },

      getFileName (val) {
        // console.log(val)
        this.fileName = [],
        this.kidList = []
        for (let i = 0; i < val.length; i++) {
          this.fileName.push(val[i].title)
          this.kidList.push(val[i].kid)
        }
      },

      fileClick (item) {
        // item.isSel = !item.isSel
        // debugger
        this.$set(item, 'isSel', !item.isSel)
        // item.parent.isSel = !this.fileList.every(item => !item.isSel)
        if (item.isSel) {
          this.fileName2.push(item.fileName)
          this.kidList2.push(item.fileKid)
          // this.selectFiles.push(item)
          this.$refs.attachFile.append.push(item)
        } else {
          this.kidList2.splice(this.kidList2.findIndex(val => val === item.fileKid), 1)
          this.fileName2.splice(this.fileName2.findIndex(val => val === item.fileName), 1)
          this.$refs.attachFile.append.splice(this.$refs.attachFile.append.findIndex(val => val.kid === item.kid), 1)
        }
      },

      winClose () {
        this.winClosed = true
        this.fileList = []
        this.radio = 1
      },

      addlocalFile () {
        this.$refs.attachFile.add()
      },

      addonFile () {
        this.radio = 2
      }
    }
  }
</script>

<style scoped>
  .title {
    font-family: PingFangSC-Medium, serif;
    font-weight: bold;
    font-size: 1.6rem;
    padding: 10px;
  }
  .wp-form >>> .c-form-item {
    margin-bottom: 20px
  }

  .wp-form >>> .c-form-label {
    margin: 0px
  }

  .file-type {
    font-size: 1.4rem
  }

  .file-type span:nth-of-type(n+2){
    margin-left: 2rem
  }

  .projList, .fileList {
    width: 50%;
    height: 296px;
    overflow: auto;
    margin: 0 10px 0 0;
    /* border-bottom: 1px solid #E8E8E8; */
  }

  /* .fileList {
    border-bottom: 0
  } */

  .item {
    cursor: pointer;
    font-size: 1.4rem;
    line-height: 1.5em;
    padding: 3px 5px;
    border: 1px solid #E8E8E8;
    /* border-bottom: 0; */
  }

  .el-tree {
     min-width: 100%;
     display:inline-block !important;
  }

  .dataList {
    padding: 5px 0;
    font-size: 1.4rem;
    color: #606266;
  }
</style>
