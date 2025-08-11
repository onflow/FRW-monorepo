# Flow Wallet UI Components

这是 Flow Wallet 的纯 Tamagui UI 组件库，没有 React Native 依赖。

## 运行 Storybook

要运行 Storybook 进行组件预览和调试，请按以下步骤操作：

### 1. 进入 UI 包目录

```bash
cd packages/ui
```

### 2. 安装依赖（如果还没有安装）

```bash
pnpm install
```

### 3. 启动 Storybook

```bash
pnpm run storybook
```

Storybook 将在 `http://localhost:6006/` 启动，您可以在浏览器中查看所有组件。

### 4. 构建 Storybook（可选）

```bash
pnpm run build-storybook
```

这会生成静态文件到 `storybook-static/` 目录。

## 可用组件

- **Avatar** - 头像组件，支持在线状态指示器
- **Button** - 按钮组件，支持多种变体（primary, secondary, ghost, outline）
- **Card** - 卡片组件，支持多种变体（default, elevated, outlined）
- **Input** - 输入框组件，支持标签和错误提示
- **SegmentedControl** - 分段控制器
- **TokenCard** - 代币卡片组件，显示代币信息、余额和价格变化
- **Skeleton** - 骨架屏组件，用于加载状态
- **Text** - 文本组件，支持不同变体和字重
- **Separator** - 分割线组件
- **BackgroundWrapper** - 背景包装组件

## 使用方式

```typescript
import { Button, TokenCard, SegmentedControl } from '@onflow/frw-ui'

// 使用按钮
<Button variant="primary" onPress={() => console.log('点击')}>
  点击我
</Button>

// 使用代币卡片
<TokenCard
  symbol="FLOW"
  name="Flow Token"
  balance="1,234.56"
  price="0.95"
  change24h={5.2}
  onPress={() => {}}
/>

// 使用分段控制器
<SegmentedControl
  options={['选项1', '选项2']}
  selectedIndex={0}
  onChange={(index) => console.log(index)}
/>
```

## 主题支持

所有组件都支持 Tamagui 的主题系统，包括：

- 明暗主题切换
- 自定义颜色
- 响应式设计
- 动画和手势

## 开发

- 组件源代码在 `src/components/` 目录
- Stories 文件在 `stories/` 目录
- 类型定义在 `src/types/` 目录

修改组件后，Storybook 会自动热重载显示更改。
