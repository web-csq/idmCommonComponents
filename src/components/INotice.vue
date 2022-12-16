<template>
  <div idm-ctrl="idm_module" :id="moduleObject.id" :idm-ctrl-id="moduleObject.id" class="idm-common-notice-container">
    <div class="notice-left">
      <div style="font: inherit">
        {{ propData.leftText }}
      </div>
    </div>
    <div class="notice-right">
      <van-notice-bar scrollable :speed="propData.speed" :delay="propData.delay">
        <span v-for="item, key in componentData" :key="key" class="idm-notice-text" @click="handleItemClick(item)">{{
            moduleObject.env === 'develop'
              ? item['text'] :
              IDM.express.replace(`@[${propData &&
                propData.noticeFieldTitle}]`, item, true)
        }}</span>
      </van-notice-bar>
    </div>
  </div>
</template>
<script>
import "swiper/css/swiper.min.css";
const list = [
  {
    text: '11111111111111111111111'
  },
  {
    text: '222222222222222222222222222'
  },
  {
    text: '3333333333333333333'
  },
  {
    text: '4444444444444444444444444'
  },
  {
    text: '555555555555555555555555'
  },
  {
    text: '6666666666666666666666666666'
  }
]
import NoticeBar from 'vant/lib/notice-bar';
import 'vant/lib/notice-bar/style';
export default {
  name: 'INotice',
  components: {
    [NoticeBar.name]: NoticeBar
  },
  data() {
    return {
      moduleObject: {},
      propData: this.$root.propData.compositeAttr || {},
      componentData: [],
      currentPage: 1
    }
  },
  created() {
    this.moduleObject = this.$root.moduleObject
    this.convertAttrToStyleObject();
    this.convertThemeListAttrToStyleObject()
  },
  methods: {
    handleItemClick(item) {
      if (this.moduleObject.env === 'develop') return
      const funcName = this.propData?.customClickFunction?.[0]?.name
      const result = window?.[funcName]?.call(this, item)
      if (result === false) return
      if (item.jumpUrl) {
        const url = IDM.url.getWebPath(item.jumpUrl)
        window.open(url, this.propData.jumpStyle || '_blank')
      }
    },
    propDataWatchHandle(propData) {
      this.propData = propData.compositeAttr || {};
      this.convertAttrToStyleObject();
      this.convertThemeListAttrToStyleObject()
    },
    convertThemeListAttrToStyleObject() {
      const themeList = this.propData.themeList;
      if ((!themeList) || !themeList.length) {
        return
      }
      const themeNamePrefix = IDM.setting && IDM.setting.applications && IDM.setting.applications.themeNamePrefix ? IDM.setting.applications.themeNamePrefix : "idm-theme-";
      for (var i = 0; i < themeList.length; i++) {
        var item = themeList[i];

        if (item.key != IDM.theme.getCurrentThemeInfo()) {
          //此处比对是不渲染输出不用的样式，如果页面会刷新就可以把此处放开
          continue;
        }
        let mainBgColor = {
          "background-color": item.mainColor ? item.mainColor.hex8 : "",
        }
        IDM.setStyleToPageHead("." + themeNamePrefix + item.key + " #" + (this.moduleObject.packageid || "module_demo") + " .notice-left", mainBgColor);
      }
    },
    convertAttrToStyleObject() {
      var styleObject = {}, leftStyleObj = {}, rightStyleObj = {}, rightTextObj = {}, triangleObj = {}
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if (!element && element !== false && element != 0) {
            continue;
          }
          switch (key) {
            case "width":
              styleObject[key] = element;
              break
            case "height":
              styleObject[key] = element;
              rightStyleObj['height'] = element
              rightStyleObj['line-height'] = element
              break;
            case 'box':
              IDM.style.setBoxStyle(styleObject, element)
              break
            case 'bgColor':
              if (element.hex8) {
                styleObject['background-color'] = element.hex8
              }
              break
            case 'leftBgColor':
              if (element.hex8) {
                leftStyleObj['background-color'] = element.hex8 + ' !important'
              }
              break
            case 'font':
              IDM.style.setFontStyle(leftStyleObj, element)
              break
            case 'leftBox':
              IDM.style.setBoxStyle(leftStyleObj, element)
              break
            case 'leftWidth':
              leftStyleObj['width'] = element
              break
            case 'rightBox':
              IDM.style.setBoxStyle(rightStyleObj, element)
              break
            case 'rightFont':
              IDM.style.setFontStyle(rightTextObj, element)
              break
            case 'triangleWidth':
              triangleObj['width'] = element + 'px'
              triangleObj['right'] = '-' + (element - 0.5) + 'px'
              break
            case 'itemSpan':
              rightTextObj['margin-right'] = element + 'px'
              break


          }
        }
      }
      window.IDM.setStyleToPageHead(this.moduleObject.id, styleObject);
      window.IDM.setStyleToPageHead(this.moduleObject.id + ' .notice-left', leftStyleObj);
      window.IDM.setStyleToPageHead(this.moduleObject.id + ' .van-notice-bar', {
        'padding': 0,
        'background-color': 'transparent',
        ...rightStyleObj
      });
      window.IDM.setStyleToPageHead(this.moduleObject.id + ' .idm-notice-text', rightTextObj);
      window.IDM.setStyleToPageHead(this.moduleObject.id + ' .notice-left::after', triangleObj);
      this.initData();
    },
    reload() {
      //请求数据源
      this.initData();
    },
    initData() {
      //所有地址的url参数转换
      var params = this.commonParam();

      if (this.moduleObject.env === 'develop') {
        this.componentData = list
        return
      }

      switch (this.propData.dataSourceType) {
        case "dataSource":
          IDM.datasource.request(this.propData?.dataSource?.[0]?.id, {
            moduleObject: this.moduleObject,
            param: {
              ...params
            }
          }, (res) => {
            this.componentData = res
            return
          }, (err) => {
            IDM.message.error(err.message)
          })
          break;
        case 'customInterface':
          this.propData.customInterface &&
            window.IDM.http
              .get(this.propData.customInterface, {
                ...params,
                columnId:
                  this.propData.columnId || this.commonParam().columnId,
                start: this.currentPage,
                limit: this.propData.contentNumber
              })
              .then((res) => {
                console.log(res)
                if (res.status == 200 && res.data.code == 200) {
                  this.componentData = IDM.express.replace(
                    `@[${this.propData.dataFiled}]`,
                    res.data.data
                  )
                } else {
                  IDM.message.error(res.data.message)
                }
              })
              .catch(function (error) { })
          break
        case "pageCommonInterface":
          //使用通用接口直接跳过，在setContextValue执行
          break;
      }
    },
    receiveBroadcastMessage(object) {
      console.log("组件收到消息", object)
    },
    getExpressData(dataName, dataFiled, resultData) {
      //给defaultValue设置dataFiled的值
      var _defaultVal = undefined;
      if (dataFiled) {
        var filedExp = dataFiled;
        filedExp =
          dataName +
          (filedExp.startsWiths("[") ? "" : ".") +
          filedExp;
        var dataObject = { IDM: window.IDM };
        dataObject[dataName] = resultData;
        _defaultVal = window.IDM.express.replace.call(
          this,
          "@[" + filedExp + "]",
          dataObject
        );
      }
      return _defaultVal;
    },
    setContextValue(object) {
      console.log("统一接口设置的值", object);
      if (object.type != "pageCommonInterface") {
        return;
      }
      //这里使用的是子表，所以要循环匹配所有子表的属性然后再去设置修改默认值
      if (object.key == this.propData.dataName) {
        // this.propData.fontContent = this.getExpressData(this.propData.dataName,this.propData.dataFiled,object.data);
        this.componentData = this.getExpressData(this.propData.dataName, this.propData.dataFiled, object.data)
      }
    },
    sendBroadcastMessage(object) {
      window.IDM.broadcast && window.IDM.broadcast.send(object);
    },
    /**
   * 通用的url参数对象
   * 所有地址的url参数转换
   */
    commonParam() {
      let urlObject = IDM.url.queryObject();
      var params = {
        pageId:
          window.IDM.broadcast && window.IDM.broadcast.pageModule
            ? window.IDM.broadcast.pageModule.id
            : "",
        ...urlObject,
      };
      return params;
    },
  }
};
</script>

<style lang="scss" scoped>
.idm-common-notice-container {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .notice-left {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;

    &::after {
      display: block;
      content: ' ';
      height: 100%;
      position: absolute;
      clip-path: polyGon(0 0, 50% 50%, 0 100%);
      background-color: inherit;
      top: 0;
    }
  }

  .notice-right {
    flex: 1;
    overflow: hidden;
    height: 100%;
  }

  .idm-notice-text {
    cursor: pointer;

    &:first-child {
      margin-left: 0 !important;
    }

    &:last-child {
      margin-right: 0 !important;
    }
  }

  .idm-notice-box-swiper-item-container {
    display: flex;
    align-items: center;
  }
}
</style>