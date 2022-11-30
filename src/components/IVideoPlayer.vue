<template>
  <!--
    根目录规范(必须不能为空)：
    idm-ctrl：控件类型 drag_container：容器，drag_container_inlieblock：行内容器，idm_module：非容器的组件
    id：使用moduleObject.id，如果id不使用这个将会被idm-ctrl-id属性替换
    idm-ctrl-id：组件的id，这个必须不能为空
  -->
  <div idm-ctrl="idm_module" :id="moduleObject.id" :idm-ctrl-id="moduleObject.id">
    <div id="idm-video-wrap">
      <video id="idm-video-player" class="video-js vjs-big-play-centered vjs-default-skin">
      </video>
      <IBarrage ref="iBarrage" :percent="barragePercent" :isPause="isBarragePause" :arr="barrageArr"></IBarrage>
    </div>
  </div>
</template>

<script type="text/jsx">
import 'video.js/dist/video-js.css';
import VideoJs from "video.js";
import IBarrage from '../innerComponents/IBarrage'
const arrExample = [
  '这是一条有弹幕',
  '今天去打LOL',
  '可以吗？',
  '一起嗨！！！'
]
export default {
  name: 'IVideoPlayer',
  data() {
    return {
      player: null,
      moduleObject: {},
      resourceVideo: null,
      propData: this.$root.propData.compositeAttr || {},
      isFirstPlay: true,
      isInited: false,
      barragePercent: 80,
      isBarragePause: true,
      barrageArr: []
    }
  },
  components: {
    IBarrage
  },
  mounted() {
    this.moduleObject = this.$root.moduleObject;
    this.init();
  },
  methods: {
    propDataWatchHandle(propData) {
      this.propData = propData.compositeAttr || {};
      this.init()
    },
    // 获取router的数据
    getRouterParams() {
      return this.moduleObject.routerId ? IDM.router.getParam(this.moduleObject.routerId) : {};
    },
    // 调用接口参数 自定义 routerParam：从上个页面带过来的参数 path: 数据源地址  that: this
    handleParamter() {
      let obj = {};
      if (this.propData.parameterFun && this.propData.parameterFun.length > 0) {
        const funcName = this.propData.parameterFun[0].name
        obj = window[funcName] && window[funcName].call(this, {
          routerParam: this.getRouterParams(),
          that: this
        })
      }
      return obj
    },
    handleStyle() {
      let styleObj = {}, danmuStyleObj = {};
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if (!element && element !== false && element != 0) {
            continue;
          }
          switch (key) {
            case 'width':
            case 'height':
              styleObj[key] = element
              break;
            case 'box':
              IDM.style.setBoxStyle(styleObj, element);
              break;
            case 'danmuFont':
              IDM.style.setFontStyle(danmuStyleObj, element);

          }
        }
      }
      window.IDM.setStyleToPageHead(this.moduleObject.id + " #idm-video-wrap", styleObj);
      window.IDM.setStyleToPageHead(this.moduleObject.id + " .barrage-wrapper .barrage-item", danmuStyleObj);
    },
    initBarrageList() {
      this.barrageArr = []
      // if (this.moduleObject.env == 'develop') {
      for (let i = 0; i <= 1000; i++) {
        this.barrageArr.push({
          direction: 1000 % i === 0 ? 'top' : 'default',
          content: arrExample[parseInt(Math.random() * arrExample.length)]
        })
      }
      return
      // }
    },
    // 弹幕开关
    addDanmaBtn(danmakuShow) {
      const _this = this
      var Dan = VideoJs.getComponent('Button');
      var DanButton = VideoJs.extend(Dan, {
        constructor: function () {
          Dan.apply(this, arguments);
          this.controlText("弹幕");
        },
        buildCSSClass: function () {
          return "vjs-control vjs-button";
        },
        handleClick: function () {
          if (danmakuShow) {
            _this.isBarragePause = true
            this.el_.className = this.el_.className.replace(/danmu-open/, '');
          } else {
            _this.isBarragePause = false
            this.el_.className += ' danmu-open';
          }
          danmakuShow = !danmakuShow;
        }
      });
      VideoJs.registerComponent('DanButton', DanButton);
      this.player.getChild('controlBar').addChild('DanButton', {}, 3);
    },
    // 创建全屏按钮
    createFullScreenBtn(isFullScreen) {
      const _this = this
      const playerElement = document.querySelector('#' + this.moduleObject.id + " #idm-video-wrap");
      const btn = this.player.controlBar.addChild('button', {
        clickHandler
      });
      btn.addClass('vjs-fullscreen-control');
      btn.addClass('vjs-control');
      btn.addClass('vjs-button');

      [
        'fullscreenchange',
        'webkitfullscreenchange',
        'mozfullscreenchange'
      ].forEach((fullScreenCHange) => {
        playerElement.addEventListener(fullScreenCHange, (e) => {
          isFullScreen = !isFullScreen;
          _this.$refs['iBarrage'].handleSizeChange()
        });
      });
      function clickHandler() {
        const fullElement = document.querySelector('#' + _this.moduleObject.id + " #idm-video-wrap");
        if (isFullScreen) {
          // 使用video.js提供的exitFullscreen api，避免原生exitFullscreen的兼容问题
          _this.player.exitFullscreen();
        } else {
          try {
            if (fullElement.requestFullscreen) {
              return fullElement.requestFullscreen();
            } else if (fullElement.webkitRequestFullScreen) {
              return fullElement.webkitRequestFullScreen();
            } else if (fullElement.mozRequestFullScreen) {
              return fullElement.mozRequestFullScreen();
            } else if (fullElement.msRequestFullscreen) {
              fullElement.msRequestFullscreen();
            } else {
              this.creator.player.requestFullscreen();
            }
          } catch (err) {
            // 如果原生全屏api出错，则使用video.js自带的全屏api
            _this.player.requestFullscreen();
          }
        }
      }
    },

    renderVideo() {
      if (this.player && !this.isInited) {
        if (this.propData.isShowDanmu) {
          this.addDanmaBtn(false)
        }
        this.createFullScreenBtn(false)
        this.isInited = true
        return
      }
      const _this = this;
      this.player = VideoJs('idm-video-player', {
        language: 'zh-CN',
        loop: this.propData.loop,
        poster: this.propData.poster,
        autoplay: this.propData.autoplay,
        controls: true,
        sources: this.resourceVideo,
        controlBar: {
          fullscreenToggle: !!VideoJs.browser.IE_VERSION,
          pictureInPictureToggle: this.propData.pictureInPictureToggle  // 画中画按钮
        }
      }, function onPlayerReady() {
        this.on('play', () => {
          if (_this.isFirstPlay) {
            _this.isFirstPlay = false
          }
          _this.isBarragePause = false
          console.log('开始播放')
        })

        this.on('pause', () => {
          _this.isBarragePause = true
          console.log('视频已经暂停');
        })
      })

    },
    init() {
      this.handleStyle();
      this.initBarrageList()
      let funcName = null, resourceVideo = null
      // if (this.moduleObject.env === 'develop') {
      this.resourceVideo = {
        src: 'https://vd3.bdstatic.com/mda-kg13n2ya88655a3g/hd/mda-kg13n2ya88655a3g.mp4',
        type: "video/mp4"
      }
      this.$nextTick(() => {
        this.renderVideo()
      })
      return
      // }
      // switch (this.propData.dataSourceType) {
      //   case 'dataSource':
      //     IDM.datasource.request(this.propData?.dataSource?.[0]?.id, {
      //       moduleObject: this.moduleObject,
      //       param: this.handleParamter()
      //     }, (res) => {
      //       if (res.code == 200) {
      //         this.resourceVideo = res.data
      //         this.renderVideo()
      //         return
      //       }
      //       IDM.message.error(res.message)
      //     }, (err) => {

      //     })
      //     break
      //   case 'customFunc':
      //     funcName = this.propData?.resourceFun?.[0].name
      //     resourceVideo = window?.[funcName].call(this, this.handleParamter())
      //     if (resourceVideo) {
      //       this.renderVideo()
      //     }
      //     break
      //   case 'pageCommonInterface':
      //     break
      // }
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
      if (object.key == this.propData.dataName) {
        this.resourceVideo = this.getExpressData(this.propData.dataName, this.propData.dataFiled, object.data);
        if (this.resourceVideo) {
          this.renderVideo()
        }
        // this.$set(this.propData, "fontContent", this.getExpressData(this.propData.dataName, this.propData.dataFiled, object.data));
      }
    },
  },
  beforeDestroy() {
    if (this.player) {
      this.player.dispose();
    }
  }
}
</script>

<style lang="scss">
.video-js .vjs-time-control {
  display: block !important;
}

.video-js {
  width: 100% !important;
  height: 100% !important;
}

.video-js .vjs-big-play-button {
  font-size: 2.5em !important;
  line-height: 2.3em !important;
  height: 2.5em !important;
  width: 2.5em !important;
  -webkit-border-radius: 2.5em !important;
  -moz-border-radius: 2.5em !important;
  border-radius: 2.5em !important;
  background-color: #73859f;
  background-color: rgba(115, 133, 159, 0.5) !important;
  border-width: 0.15em !important;
  margin-top: -1.25em !important;
  margin-left: -1.25em !important;
}

.vjs-big-play-button .vjs-icon-placeholder {
  font-size: 1.63em !important;
}

.vjs-paused .vjs-big-play-button,
.vjs-paused.vjs-has-started .vjs-big-play-button {
  display: none !important;
}

.vjs-user-active .vjs-control-bar {
  display: flex !important;
  visibility: visible !important;
  opacity: 1 !important;
  transition: visibility .1s, opacity .1s !important;
}

.video-js .danmu-open {
  background: #ccc;
}
</style>