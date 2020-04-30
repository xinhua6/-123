<template>
    <div class="c-flex">
        <template v-for="btn in buttonList">
            <slot v-if="btn.slot" :name="btn.slot" v-bind:btn="btn"></slot>
            <el-button v-else size="mini" @click="btn.click" v-bind="btn" :key="btn.label">
                {{btn.label}}
            </el-button>
        </template>
    </div>
</template>
<script>
  import { getMenuTableId } from '../../common/fn'
  import { getMenuButtonPermision } from '../../common/api'

  /**
   *  新增 btnadd
   *  编辑 btnedit
   *  删除 btndelete
   *  审核 btnsign
   *  提交审核 btncommit
   */
  export default {
    name: 'WpBtns',
    props: {
      buttons: {
        type: Array,
        required: true
      }
    },
    data () {
      return {
        list: [],
        showMap: {},
        isLoad: false
      }
    },
    computed: {
      buttonList () {
        return this.list.map(item => {
          return {
            size: 'mini',
            type: 'primary',
            ...item
          }
        })
      }
    },
    watch: {
      buttons: {
        immediate: true,
        handler: 'setPermision'
      }
    },
    methods: {
      async setPermision () {
        try {
          if (!this.isLoad) {
            const needGet = this.buttons.some(btn => btn.name)
            if (needGet) {
              this.list = this.buttons.filter(btn => !btn.name)
              // 获取组件所属菜单的tableId
              const tableId = getMenuTableId.call(this)
              //  获取系统名
              const sysMsg = await this.$store.dispatch('getSysFromTableId', tableId)
              //  请求获取该人员在当前页面中所能执行的操作
              const { data } = await getMenuButtonPermision(tableId, sysMsg.mdSystem)
              data.forEach(btn => {
                if (btn.objectId) {
                  this.showMap[btn.objectId] = true
                }
              })
            }
            this.isLoad = true
          }
        } catch (e) {
          console.error('获取按钮权限有误', e)
        }
        this.filterBtn()
      },
      filterBtn () {
        const showMap = this.showMap
        this.list = this.buttons.filter(btn => !btn.name || showMap[btn.name])
      }
    }
  }
</script>

<style lang="scss" scoped>
</style>
