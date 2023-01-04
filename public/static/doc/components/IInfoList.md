# 通用信息列表

## 组件类名（className）

IInfoList

## 组件类 ID（classId）

idm.component.idmCommonComponent.infoList

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

数据源入参

```js
{
    pageIndex: 1, // 从1开始，逐页递增
}
```

数据源返回格式

```js
{
  data: [
    {
      "text": "如何高效的提升自己的阅读能力1",
      "time": "2022-12-07",
      "show": true,
      "tag": "topic" // 标记（标签或图标）的比较字段，可控制此字段指定的标记的显隐，可为字符串或布尔类型
      // ...字段键名请依照实际返回的数据
    }
    // ...每个对象代表一行
  ],
  total: 50 // 只在滑动加载时必须，全部加载时可以没有此字段
}
```
