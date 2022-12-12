<template>
  <div idm-ctrl="idm_module" :id="moduleObject.id" :idm-ctrl-id="moduleObject.id" class="idm-common-notice-container">
    <div class="notice-left">
      <div style="font: inherit">
        {{ propData.leftText }}
      </div>
    </div>
    <div class="notice-right">
      <swiper ref="swiper" class="swiper" :options="swiperOption" :style="`height: ${propData && propData.height}`">
        <swiper-slide class="swiper-slide idm-notice-box-swiper-item-container " v-for="(item, index) in componentData"
          :key="index">
          <div class="idm-notice-text" @click="handleItemClick">{{ IDM.express.replace(`@[${propData &&
              propData.noticeFieldTitle}]`, item, true)
          }}</div>
        </swiper-slide>
        <div slot="pagination"></div>
      </swiper>
    </div>
  </div>
</template>
<script>
import { Swiper, SwiperSlide } from 'vue-awesome-swiper'
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
export default {
  name: 'INotice',
  components: {
    Swiper,
    SwiperSlide
  },
  data() {
    return {
      moduleObject: {},
      propData: this.$root.propData.compositeAttr || {},
      componentData: []
    }
  },
  computed: {
    swiperOption() {
      return {
        // autoplay: false,
        autoplay: {                      //自动播放
          delay: this.propData.delay || 3000,
          disableOnInteraction: false
        },
        speed: 500,                                               //播放速度
        loop: true,                                               //循环播放
        pagination: false,
      }
    },
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
      var styleObject = {}, leftStyleObj = {}, rightStyleObj = {}, rightTextObj = {}, triangleObj = {}, bannerItemObj = {}
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if (!element && element !== false && element != 0) {
            continue;
          }
          switch (key) {
            case "width":
            case "height":
              styleObject[key] = element;
              bannerItemObj['height'] = element + ' !important'
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
              triangleObj['width'] = element
              triangleObj['right'] = '-' + element
              break

          }
        }
      }
      window.IDM.setStyleToPageHead(this.moduleObject.id, styleObject);
      window.IDM.setStyleToPageHead(this.moduleObject.id + ' .notice-left', leftStyleObj);
      window.IDM.setStyleToPageHead(this.moduleObject.id + ' .notice-right', rightStyleObj);
      window.IDM.setStyleToPageHead(this.moduleObject.id + ' .idm-notice-text', rightTextObj);
      window.IDM.setStyleToPageHead(this.moduleObject.id + ' .notice-left::after', triangleObj);
      window.IDM.setStyleToPageHead(this.moduleObject.id + ' .idm-notice-box-swiper-item-container', bannerItemObj);
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
        this.init()
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
            if (res.code == 200) {
              this.componentData = res.data
              this.init()
              return
            }
            IDM.message.error(res.message)
          }, (err) => {
          })
          break;
        case "pageCommonInterface":
          //使用通用接口直接跳过，在setContextValue执行
          break;
      }
    },
    init() {
      this.$nextTick(() => {
        this.$refs.swiper.$swiper.changeDirection(this.propData.direction)
        this.$refs.swiper.$swiper.slideToLoop(0, 0, false)
      })
    },
    receiveBroadcastMessage(object) {
      console.log("组件收到消息", object)
      if (object.type && object.type == "linkageShowModule") {
        this.showThisModuleHandle();
      } else if (object.type && object.type == "linkageHideModule") {
        this.hideThisModuleHandle();
      }
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

        this.init()
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
        urlData: JSON.stringify(urlObject),
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
  .idm-notice-box-swiper-item-container{
    display: flex;
    align-items: center;
  }
}
</style>