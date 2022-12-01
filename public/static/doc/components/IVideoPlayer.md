# 视频播放

视频播放组件

## 组件类名（className）

IVideoPlayer

## 组件类 ID（classId）

idm.component.idmCommonComponent.ivideoplayer

## 组件开发语言（comLangue）

vue

## 组件类型（comType）

common

## 所在代码包版本

idmCommonComponent@1.0.0

## 组件属性

### 唯一标识【ctrlId】

### 高级

#### 数据源

数据源返回格式

```js
{
    code: '200',
    message: 'success',
    data: {
        resourceVideo: {                        // 视频源
            src: 'https://vd3.bdstatic.com/mda-kg13n2ya88655a3g/hd/mda-kg13n2ya88655a3g.mp4',
            type: "video/mp4"
        },
        danmuList: [                            // 弹幕列表
            {
                direction: 'top'  | 'default',  // 弹幕方向
                content: ''                     // 弹幕内容
            }
        ]
    }
}

```
