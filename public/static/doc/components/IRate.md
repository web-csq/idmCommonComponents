# 评分组件

评分组件

## 组件类名（className）

IRate

## 组件类 ID（classId）

idm.component.idmCommonComponent.irate

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

数据源参数格式

```ts

{
    ...this.commonParam()
}
```

数据源返回格式

```ts



declare class {
    code: string
    data: {
        value: 0,  // 默认值
        disabled: false  // 是否禁用，如果组件配置中配置了禁用为true,则此处false值失效
    }
    message: string
}
```
