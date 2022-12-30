<template>
  <div idm-ctrl="idm_module" :id="moduleObject.id" :idm-ctrl-id="moduleObject.id">
    <div class="textarea-wrapper">
      <a-textarea class="m-textarea" :placeholder="propData.textareaPlaceholder" :maxLength="propData.maxLength"
        :auto-size="{ minRows: propData.minRows, maxRows: propData.maxRows }" allowClear v-model="content" />
      <span class="m-count">{{ textLength }}/{{ propData.maxLength }}</span>
    </div>

    <div class="d-flex flex-d-r-r align-c comment-list-button-container">
      <a-button type="primary" @click="handlePublish" style="margin: 0 0 0 20px">发布</a-button>
      <a-select style="width: 140px" v-if="componentSortTypeList.length > 0" :disabled="moduleObject.env === 'develop'"
        v-model="currentSort" @change="handleSelectChange">
        <a-select-option v-for="item in componentSortTypeList" :key="item.value" :value="item.value">{{
    item.label
}}</a-select-option>
      </a-select>
    </div>
    <div class="common-list-container">
      <div v-for="(item, index) in componentData.rows" :key="index" class="comment-list-item">
        <ICommentItem :propData="propData" :itemData="item" :lIndex="index" :authorId="componentData.authorId"
          :moduleObject="moduleObject" @showReply="showReply" @handleDelete="handleDelete" @handleBlur="handleBlur"
          :userInfo="userInfo" @handleSubReply="handleSubReply" @handleLike="handleLike">
        </ICommentItem>
        <div class="comment-list-sub-comment" v-for="(items, indexs) in item.children" :key="indexs">
          <ICommentItem :propData="propData" :lIndex="index" :sIndex="indexs" :itemData="items" :userInfo="userInfo"
            :authorId="componentData.authorId" :moduleObject="moduleObject" @showReply="showReply"
            @handleDelete="handleDelete" @handleBlur="handleBlur" @handleSubReply="handleSubReply"
            @handleLike="handleLike"></ICommentItem>
        </div>
        <div class="d-flex just-c cursor-p" v-if="item.isShowMore" @click="handleSubClickMore(item, index)">查看更多回复
        </div>
      </div>
      <div class="d-flex just-c cursor-p" v-if="hasMore" @click="handleClickMore">加载更多</div>
    </div>
  </div>
</template>
<script>
import ICommentItem from '../innerComponents/ICommentItem'
import { getCommentListData } from '../mock/mockData'
import { Modal } from 'ant-design-vue'
const sortTypeList = [
  {
    label: '按时间排序',
    value: 1
  },
  {
    label: '按点赞排序',
    value: 2
  }
]
export default {
  name: 'ICommentList',
  components: {
    ICommentItem
  },
  data() {
    return {
      moduleObject: {},
      propData: this.$root.propData.compositeAttr || {},
      componentData: {
        rows: [],
        authorId: '123'
      },
      currentSort: 1,
      componentSortTypeList: [],
      content: '',
      hasMore: false,
      currentPage: 1,
      userInfo: IDM.user.getCurrentUserInfo(),
      messageParams: {}
    }
  },
  computed: {
    textLength() {
      return (this.content || "").length;
    },
  },
  created() {
    this.moduleObject = this.$root.moduleObject
    this.convertAttrToStyleObject()
    this.convertThemeListAttrToStyleObject()
  },
  methods: {
    commonParam() {
      let urlObject = IDM.url.queryObject()
      var params = {
        pageId:
          window.IDM.broadcast && window.IDM.broadcast.pageModule ? window.IDM.broadcast.pageModule.id : '',
        ...urlObject
      }
      return params
    },
    handleSelectChange(value) {
      this.currentSort = value
      this.currentPage = 1
      this.getCommentList(true)
    },
    propDataWatchHandle(propData) {
      this.propData = propData.compositeAttr || {}
      this.convertAttrToStyleObject()
      this.convertThemeListAttrToStyleObject()
    },
    handleDataSourceFunction(param) {
      return new Promise((resolve, reject) => {
        IDM.datasource.request(this.propData?.dataSource?.[0]?.id, {
          moduleObject: this.moduleObject,
          param
        }, (res) => {
          if (res.code == 200) {
            resolve(res)
          } else {
            IDM.message.error(res.message)
          }
        }, (err) => {
          reject(err)
        })
      })
    },
    handleBlur() {
      // const arr = _.cloneDeep(this.componentData.rows)
      // this.setIsReplyFalse(arr)
      // this.$set(this.componentData, 'rows', arr)
    },
    handleSubClickMore(item, index) {
      this.handleDataSourceFunction({
        type: 'list',
        params: {
          ...this.commonParam(),
          ...this.getCustomFunctionParams(),
          showLike: this.propData.isFabulousNumber,
          page: this.currentPage,
          commentId: item.id,
          sortDir: this.currentSort,
          showNum: 1000,
          showAvatar: this.propData.isShowAvatar
        }
      }).then(res => {
        item.isShowMore = false
        item.children = res.data.rows

        this.$set(this.componentData['rows'], index, item)
        const arr = _.cloneDeep(this.componentData.rows)
        this.setIsReplyFalse(arr)
        this.$set(this.componentData, 'rows', arr)
      })
    },
    // 显示回复
    showReply({ index, sIndex }) {
      if (this.moduleObject.env == 'develop') {
        return
      }
      const arr = _.cloneDeep(this.componentData.rows)
      this.setIsReplyFalse(arr)
      if (sIndex === -1) {
        arr[index].isReply = true
      } else {
        arr[index].children[sIndex].isReply = true
      }
      this.$set(this.componentData, 'rows', arr)
    },
    // 点赞
    handleLike({ item, sIndex, index }) {
      if (this.moduleObject.env == 'develop') {
        return
      }
      const type = item.isLike ? 'unLike' : 'like'
      this.handleDataSourceFunction({
        type,
        params: {
          ...this.commonParam(),
          ...this.getCustomFunctionParams(),
          commentId: item.id,
        }
      }).then(res => {
        if (item.isLike) {
          item.likeNum--
        } else {
          item.likeNum++
        }
        item.isLike = !item.isLike
        if (sIndex === -1) {
          this.$set(this.componentData['rows'], index, item)
        } else {
          this.$set(this.componentData['rows'][index].children, sIndex, item)
        }
        IDM.message.success(res.message)
      })
    },
    // 删除
    handleDelete({ item, index, sIndex }) {
      if (this.moduleObject.env == 'develop') {
        return
      }
      Modal.confirm({
        title: '提示',
        content: '确认删除此条评论',
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          this.handleDataSourceFunction({
            type: 'delete',
            params: {
              ...this.commonParam(),
              ...this.getCustomFunctionParams(),
              commentId: item.id,
            }
          }).then(res => {
            const arr = _.cloneDeep(this.componentData.rows)
            if (sIndex === -1) {
              arr.splice(index, 1)
            } else {
              arr[index].children.splice(sIndex, 1)
            }
            this.$set(this.componentData, 'rows', arr)
            IDM.message.success(res.message)
          })
        },
        onCancel() {
          console.log('Cancel')
        }
      })
    },
    // 回复
    handleSubReply({ replyContent, itemData, index }) {
      this.addComment(replyContent, itemData.id, () => {
        // fix多级
        itemData = this.componentData.rows[index]
        this.handleSubClickMore(itemData, index)
      })
    },
    addComment(content, commentId, cb) {
      if (!this.userInfo?.userid) {
        return IDM.message.warning('请先登录')
      }
      if (!content) {
        return
      }

      this.handleDataSourceFunction({
        type: 'submit',
        params: {
          ...this.commonParam(),
          ...this.getCustomFunctionParams(),
          content,
          commentId
        }
      }).then(res => {
        IDM.message.success(res.message)
        cb()
      })
    },
    // 发布评论
    handlePublish() {
      this.addComment(this.content, '', () => {
        this.content = ''
        // this.componentData.rows.unshift()
        this.currentPage = 1
        this.getCommentList(true)
      })
    },
    convertAttrToStyleObject() {
      const styleObject = {},
        avatarObj = {},
        itemObj = {},
        userNameFontObj = {},
        selectSpeechObj = {},
        authorObj = {},
        textMarginObj = {},
        subBoxObj = {},
        contentObj = {},
        textareaObj = {}
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key]
          if (!element && element !== false && element != 0) {
            continue
          }
          switch (key) {
            case 'width':
            case 'height':
              styleObject[key] = element
              break
            case 'bgColor':
              if (element && element.hex8) {
                styleObject['background-color'] = element.hex8
              }
              break
            case 'box':
              IDM.style.setBoxStyle(styleObject, element)
              break
            case 'border':
              IDM.style.setBorderStyle(styleObject, element)
              break
            // 头像样式
            case 'avatarHeight':
              avatarObj['height'] = element
              break
            case 'avatarWidth':
              avatarObj['width'] = element
              break
            case 'avatarBorder':
              IDM.style.setBorderStyle(avatarObj, element)
              break
            case 'avatarBox':
              IDM.style.setBoxStyle(avatarObj, element)
              break
            // 单项样式
            case 'itemBorder':
              IDM.style.setBorderStyle(itemObj, element)
              break
            case 'itemBox':
              IDM.style.setBoxStyle(itemObj, element)
              break
            case 'userNameFont':
              IDM.style.setFontStyle(userNameFontObj, element)
              break
            case 'selectSpeechFont':
              IDM.style.setFontStyle(selectSpeechObj, element)
              break
            case 'authorFont':
              IDM.style.setFontStyle(authorObj, element, true)
              break
            case 'textMargin':
              textMarginObj['margin-right'] = element
              break
            case 'subBox':
              IDM.style.setBoxStyle(subBoxObj, element)
              break
            case 'subBoxBg':
              if (element && element.hex8) {
                subBoxObj['background-color'] = element.hex8
              }
              break
            case 'contentHeight':
              contentObj['height'] = element
              break
            case 'isDragger':
                textareaObj['resize'] = element ? 'auto' : 'none'
              break

          }
        }
      }
      window.IDM.setStyleToPageHead(this.moduleObject.id, styleObject)
      window.IDM.setStyleToPageHead(this.moduleObject.id + ' .comment-list-avatar', avatarObj)
      window.IDM.setStyleToPageHead(this.moduleObject.id + ' .comment-list-item', itemObj)
      window.IDM.setStyleToPageHead(this.moduleObject.id + ' .comment-list-name', userNameFontObj)
      window.IDM.setStyleToPageHead(this.moduleObject.id + ' .common-list-selected-speeches', selectSpeechObj)
      window.IDM.setStyleToPageHead(this.moduleObject.id + ' .common-list-author', authorObj)
      window.IDM.setStyleToPageHead(this.moduleObject.id + ' .mr-10', textMarginObj)
      window.IDM.setStyleToPageHead(this.moduleObject.id + ' .comment-list-sub-comment', subBoxObj)
      window.IDM.setStyleToPageHead(this.moduleObject.id + ' .common-list-container', contentObj)
      window.IDM.setStyleToPageHead(this.moduleObject.id + ' textarea', textareaObj)
      this.initData()
    },

    /**
     * 主题颜色
     */
    convertThemeListAttrToStyleObject() {
      var themeList = this.propData.themeList
      if (!themeList) {
        return
      }
      const themeNamePrefix =
        IDM.setting && IDM.setting.applications && IDM.setting.applications.themeNamePrefix
          ? IDM.setting.applications.themeNamePrefix
          : 'idm-theme-'
      for (var i = 0; i < themeList.length; i++) {
        var item = themeList[i]
        let bgColorObj = {
          background: item.mainColor ? IDM.hex8ToRgbaString(item.mainColor.hex8) : ''
        }
        IDM.setStyleToPageHead(
          '.' +
          themeNamePrefix +
          item.key +
          (` #${this.moduleObject.id}` || 'module_demo') +
          ' .common-list-author',
          bgColorObj
        )
      }
    },
    reload() {
      //请求数据源
      this.initData()
    },
    handleClickMore() {
      this.currentPage++
      this.getCommentList()
    },
    getCustomFunctionParams() {
      let obj = []
      const func = this.propData?.customParamFunction?.[0]
      if(func) {
        obj = window?.[func.name]?.call(this, func.param)
      }
      return obj
    },
    setIsReplyFalse(array) {
      return array.map((el) => {
        el.isReply = false
        if (el.children) {
          el.children = this.setIsReplyFalse(el.children)
        }
        return el
      })
    },
    getCommentList(isClear = false) {
      this.handleDataSourceFunction({
        type: 'list',
        params: {
          ...this.commonParam(),
          ...this.getCustomFunctionParams(),
          ...this.messageParams,
          showLike: this.propData.isFabulousNumber,
          page: this.currentPage,
          showNum: this.propData.showNum,
          childShowNum: this.propData.childShowNum,
          sortDir: this.currentSort,
          showAvatar: this.propData.isShowAvatar
        }
      }).then(res => {
        res.data.rows.forEach(el => {
          if (el.total > el.children.length) {
            el.isShowMore = true
          }
        })
        if (isClear) {
          this.componentData.rows = []
        }
        res.data.rows = [...this.componentData.rows, ...res.data.rows]
        if (res.data.total > res.data.rows.length) {
          this.hasMore = true
        } else {
          this.hasMore = false
        }
        this.componentData = res.data
      })
    },
    initData() {
      if (this.propData.sortType && this.propData.sortType.length > 0) {
        this.componentSortTypeList = sortTypeList.filter(el => this.propData.sortType.includes(el.value))
        this.currentSort = this.propData.sortType[0]
      } else {
        this.componentSortTypeList = []
      }
      // if (!this.commonParam().columnId || !this.commonParam().contentId) {
      //   this.componentData.rows = this.setIsReplyFalse(getCommentListData.call(this))
      //   return
      // }
      this.getCommentList(true)
    },
    receiveBroadcastMessage(object) {
      console.log('组件收到消息', object)
      switch(object.type) {
        case 'linkageReload':
          this.messageParams = object.message || {}
          this.initData()
          break

      }
    },
    setContextValue(object) {
      console.log('统一接口设置的值', object)
      if (object.type != 'pageCommonInterface') {
        return
      }
      //这里使用的是子表，所以要循环匹配所有子表的属性然后再去设置修改默认值
      if (object.key == this.propData.dataName) {
        // this.propData.fontContent = this.getExpressData(this.propData.dataName,this.propData.dataFiled,object.data);
        this.$set(
          this.propData,
          'fontContent',
          this.getExpressData(this.propData.dataName, this.propData.dataFiled, object.data)
        )
      }
    },
    sendBroadcastMessage(object) {
      window.IDM.broadcast && window.IDM.broadcast.send(object)
    }
  }
}
</script>

<style lang="scss">
.comment-list-button-container {
  margin: 10px 0;
}

.comment-list-name {
  margin: 0 0 5 0;
}

.mr-10 {
  margin-right: 10px;
}

.comment-list-bottom {
  margin: 5px 0 0 0;
}

.comment-list-del-btn {
  display: none;
}

.comment-list-container:hover {
  .comment-list-del-btn {
    display: inline;
  }
}

.common-list-reply {
  margin: 10px 0 0 0;
  width: 500px;
  padding: 10px;
  background: #eee;
}

.textarea-wrapper {
  position: relative;
  display: block;

  .m-count {
    color: #808080;
    background: #fff;
    position: absolute;
    font-size: 12px;
    bottom: 8px;
    right: 12px;
  }
}
</style>

<style lang="scss" scoped>
.common-list-container {
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 3px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background: #ccc;
  }
}
</style>
