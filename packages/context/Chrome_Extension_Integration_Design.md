# Chrome Extension Package 集成方案 - 详细设计文档

## 项目概览

我们正在开发 Flow Reference Wallet，包含 React Native 应用和 Chrome
Extension，希望共享 UI 层代码和业务逻辑。

**目标**：Extension 能够使用 packages 中的代码，实现跨平台代码复用。

## 当前架构分析

### React Native 架构

```
UI Components → Context/Stores → Services → Native Bridge
     ↓              ↓              ↓            ↓
  React 组件    状态管理     业务逻辑     原生接口
```

### Chrome Extension 架构

```
Background Script ← Message Channel → UI Layer
      ↓                                  ↓
  Services/Context                   React 组件
  私钥/签名/存储                      用户界面
```

**核心问题**：Extension 的 ServiceContext 在 background，UI 层无法直接访问。

## 基于反馈的架构确认

根据 Extension 团队提供的信息，我们可以明确划分职责边界：

### 确定的职责分工

| 操作类型         | 执行位置      | 原因         |
| ---------------- | ------------- | ------------ |
| **交易签名**     | ✅ Background | 私钥安全     |
| **交易提交**     | ✅ Background | 团队确认需要 |
| **交易监听**     | ✅ Background | 团队确认需要 |
| **JWT 获取**     | ✅ UI Layer   | 团队确认可以 |
| **NFT 查询**     | ✅ UI Layer   | 团队确认可以 |
| **FT Balance**   | ✅ UI Layer   | 团队确认可以 |
| **Address Book** | ✅ UI Layer   | 团队确认可以 |

### 存储策略分析

- **敏感数据**：存储在 Extension storage，通过 AES 加密，Background 管理
- **非敏感数据**：用户数据和 balance 缓存，UI 层可访问
- **chrome.storage**：Background 和 UI 都可访问，用于数据同步

## 详细技术方案

### 1. 数据存储策略

基于 "敏感数据 AES 加密存储" 的反馈，设计分层存储：

```typescript
// Extension Storage 分层
interface ExtensionStorage {
  // 敏感数据（Background 管理，AES 加密）
  sensitive: {
    privateKeys: EncryptedData;
    mnemonics: EncryptedData;
    userCredentials: EncryptedData;
  };

  // 非敏感缓存（UI 层可直接访问）
  cache: {
    balances: Record<string, TokenBalance>;
    nfts: NFTCollection[];
    addressBook: Contact[];
    userPreferences: UserSettings;
  };
}
```

### 2. 服务分层设计

```typescript
// 共享接口定义 (packages/services)
interface FlowService {
  // UI 层直接调用（网络请求）
  getBalance(address: string): Promise<Balance>;
  getNFTs(address: string): Promise<NFT[]>;
  getAddressBook(): Promise<Contact[]>;

  // Background 调用（消息传递）
  signTransaction(tx: Transaction): Promise<SignedTransaction>;
  submitTransaction(signedTx: SignedTransaction): Promise<string>;
  monitorTransaction(txId: string): Promise<TransactionResult>;
}

// React Native 实现
class ReactNativeFlowService implements FlowService {
  async getBalance(address: string) {
    return NativeBridge.getBalance(address);
  }

  async signTransaction(tx: Transaction) {
    return NativeBridge.signTransaction(tx);
  }
}

// Extension 实现
class ExtensionFlowService implements FlowService {
  // UI 层直接网络调用
  async getBalance(address: string) {
    const jwt = await this.getJWT(); // UI 层可获取
    return fetch(`/api/balance/${address}`, {
      headers: { Authorization: `Bearer ${jwt}` },
    }).then((r) => r.json());
  }

  // Background 消息调用
  async signTransaction(tx: Transaction) {
    return chrome.runtime.sendMessage({
      type: 'SIGN_TRANSACTION',
      transaction: tx,
    });
  }

  async submitTransaction(signedTx: SignedTransaction) {
    return chrome.runtime.sendMessage({
      type: 'SUBMIT_TRANSACTION',
      signedTransaction: signedTx,
    });
  }
}
```

### 3. 状态管理策略

基于存储分层，设计状态管理：

```typescript
// UI 层状态管理
class ExtensionUserStore {
  // UI 瞬态状态（内存）
  @observable isLoading = false;
  @observable currentStep = 'idle';

  // 缓存数据（chrome.storage，实时读取）
  @computed get balances() {
    return this.getCacheData('balances');
  }

  @computed get nfts() {
    return this.getCacheData('nfts');
  }

  // 敏感数据（消息获取）
  async getCurrentAddress(): Promise<string> {
    return chrome.runtime.sendMessage({ type: 'GET_CURRENT_ADDRESS' });
  }

  private getCacheData(key: string) {
    // 从 chrome.storage 同步读取缓存
    // Extension 团队需要实现缓存同步机制
  }
}
```

### 4. 消息协议设计

```typescript
// Background 消息处理
interface BackgroundMessage {
  type:
    | 'SIGN_TRANSACTION'
    | 'SUBMIT_TRANSACTION'
    | 'MONITOR_TRANSACTION'
    | 'GET_CURRENT_ADDRESS';
  data: any;
  id: string; // 用于响应匹配
}

// Background Script 处理器
class BackgroundMessageHandler {
  async handleMessage(message: BackgroundMessage, sender, sendResponse) {
    try {
      let result;
      switch (message.type) {
        case 'SIGN_TRANSACTION':
          result = await this.signTransaction(message.data);
          break;
        case 'SUBMIT_TRANSACTION':
          result = await this.submitTransaction(message.data);
          break;
        case 'MONITOR_TRANSACTION':
          result = await this.monitorTransaction(message.data);
          break;
        case 'GET_CURRENT_ADDRESS':
          result = await this.getCurrentAddress();
          break;
      }
      sendResponse({ success: true, data: result });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }
}
```

### 5. 完整的发送交易流程

```typescript
// UI 组件（React Native 和 Extension 完全一致）
const SendPage = () => {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(false);

  const { userStore, flowService } = useContext();

  const handleSend = async () => {
    setLoading(true);

    try {
      // 1. UI 层构建交易（两平台一致）
      const transaction = {
        recipient,
        amount: parseFloat(amount),
        gasLimit: 1000
      };

      // 2. 获取当前地址（Extension 通过消息，RN 直接调用）
      const fromAddress = await flowService.getCurrentAddress();

      // 3. 签名交易（Extension 通过消息，RN 直接调用）
      const signedTx = await flowService.signTransaction({
        ...transaction,
        from: fromAddress
      });

      // 4. 提交交易（Extension 通过消息，RN 直接调用）
      const txId = await flowService.submitTransaction(signedTx);

      // 5. 监听结果（Extension 通过消息，RN 直接调用）
      const result = await flowService.monitorTransaction(txId);

      // 6. 更新 UI（两平台一致）
      showSuccess(`Transaction ${result.status}`);

    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <TextInput value={recipient} onChangeText={setRecipient} placeholder="Recipient" />
      <TextInput value={amount} onChangeText={setAmount} placeholder="Amount" />
      <Button onPress={handleSend} disabled={loading}>
        {loading ? 'Sending...' : 'Send'}
      </Button>
    </View>
  );
};
```

## 缓存同步机制设计

基于 "balance 缓存" 的需求，设计缓存策略：

```typescript
// Extension Background 缓存管理
class ExtensionCacheManager {
  async updateCache(key: string, data: any) {
    await chrome.storage.local.set({
      [`cache_${key}`]: {
        data,
        timestamp: Date.now(),
        ttl: 5 * 60 * 1000, // 5分钟缓存
      },
    });

    // 通知 UI 层更新
    this.notifyUIUpdate(key, data);
  }

  async getCache(key: string) {
    const result = await chrome.storage.local.get(`cache_${key}`);
    const cached = result[`cache_${key}`];

    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    return null;
  }

  private notifyUIUpdate(key: string, data: any) {
    // 通过 chrome.tabs.sendMessage 通知所有 UI 实例
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'CACHE_UPDATE',
            key,
            data,
          });
        }
      });
    });
  }
}
```

## Package 结构调整

```typescript
// packages/context/src/index.ts
export { PlatformFactory } from './PlatformFactory';
export { ExtensionServiceAdapter } from './ExtensionServiceAdapter';
export { ReactNativeServiceAdapter } from './ReactNativeServiceAdapter';

// packages/context/src/PlatformFactory.ts
class PlatformFactory {
  static create() {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      return new ExtensionServiceAdapter();
    } else {
      return new ReactNativeServiceAdapter();
    }
  }
}

// Extension 使用
// apps/extension/src/ui/context.ts
import { PlatformFactory } from '@onflow/frw-context';

const platform = PlatformFactory.create();
const context = platform.createContext();

export default context;
```

## 架构流程图

### 数据流图

```
┌─────────────────────────────────────────────┐
│                UI Layer                     │
│ ┌─────────────┬─────────────────────────────┐ │
│ │ UI 状态     │  缓存数据                   │ │
│ │ (内存管理)  │  (chrome.storage)           │ │
│ │             │                             │ │
│ │ • loading   │ • balances                  │ │
│ │ • forms     │ • nfts                      │ │
│ │ • navigation│ • addressBook               │ │
│ └─────────────┴─────────────────────────────┘ │
├─────────────────────────────────────────────┤
│              Message Bridge                  │
│     chrome.runtime.sendMessage()            │
├─────────────────────────────────────────────┤
│               Background                     │
│ ┌─────────────┬─────────────────────────────┐ │
│ │ 私钥管理     │  安全操作                   │ │
│ │ (AES 加密)  │                             │ │
│ │             │                             │ │
│ │ • privateKey│ • signTransaction           │ │
│ │ • mnemonic  │ • submitTransaction         │ │
│ │ • credentials│ • monitorTransaction       │ │
│ └─────────────┴─────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Transaction 流程图

```
UI Layer                    Background
    │                          │
    ├─1. Build Transaction─────┤
    │   (本地处理)              │
    │                          │
    ├─2. Sign Transaction──────▶
    │                          ├─ Access Private Key
    │                          ├─ Generate Signature
    ◀─3. Return Signed TX──────┤
    │                          │
    ├─4. Submit Transaction────▶
    │                          ├─ Send to Network
    │                          ├─ Get TX ID
    ◀─5. Return TX ID──────────┤
    │                          │
    ├─6. Monitor Transaction───▶
    │                          ├─ Listen for Updates
    │                          ├─ Check Status
    ◀─7. Return Result─────────┤
    │                          │
    ├─8. Update UI─────────────┤
    │   (显示结果)              │
```

## 实施计划

### Phase 1: 基础架构 (1-2 周)

- [ ] **消息协议**：定义 Background ↔ UI 消息格式
- [ ] **服务适配器**：实现 ExtensionFlowService
- [ ] **缓存机制**：实现 chrome.storage 缓存同步
- [ ] **平台检测**：实现自动平台选择

### Phase 2: 核心功能 (2-3 周)

- [ ] **交易流程**：签名 → 提交 → 监听完整流程
- [ ] **数据查询**：Balance、NFT、AddressBook 查询
- [ ] **状态管理**：UI 状态 + 缓存数据管理
- [ ] **错误处理**：消息传递异常处理

### Phase 3: UI 集成 (1-2 周)

- [ ] **组件测试**：验证 UI 组件无需修改
- [ ] **性能优化**：缓存策略和消息传递优化
- [ ] **调试工具**：开发跨平台调试辅助

### Phase 4: 测试验证 (1 周)

- [ ] **功能测试**：完整交易流程测试
- [ ] **性能测试**：消息传递性能测试
- [ ] **兼容性测试**：Chrome 版本兼容性

## 风险评估与控制

### 高风险项及解决方案

| 风险              | 影响度 | 概率 | 解决方案                       |
| ----------------- | ------ | ---- | ------------------------------ |
| 消息传递性能瓶颈  | 高     | 中   | 通过缓存减少 Background 调用   |
| 状态同步复杂度    | 中     | 高   | 使用 chrome.storage 作为共享层 |
| Chrome API 兼容性 | 中     | 低   | 测试多版本 Chrome 兼容性       |
| 错误处理机制      | 高     | 中   | 实现完整的异常传递机制         |

### 关键测试验证点

1. **Background 调用频率限制测试**
   - 测试高频调用是否有性能影响
   - 验证消息队列处理能力

2. **chrome.storage 读写性能测试**
   - 测试大数据量的存储性能
   - 验证多 Tab 并发访问

3. **多 Tab 状态同步测试**
   - 验证状态在多个 Extension Tab 间同步
   - 测试缓存更新通知机制

## 技术优势总结

基于 Extension 团队的反馈，这个方案的关键优势：

### ✅ 技术优势

1. **明确职责边界**：签名/提交在 Background，查询在 UI
2. **最大化代码复用**：UI 组件 100% 复用
3. **性能优化**：减少不必要的消息传递
4. **渐进实施**：可以逐步迁移现有功能
5. **安全性保证**：敏感操作始终在 Background

### 📊 预期效果

- **代码复用率**：UI 层 95%+ 复用
- **性能影响**：Background 调用减少 70%+
- **开发效率**：减少 60% 的重复开发工作
- **维护成本**：统一业务逻辑，降低 50% 维护成本

## 下一步行动

### 立即行动项

1. **Extension 团队确认**：技术方案和实施细节
2. **原型开发**：实现核心消息传递机制
3. **性能测试**：验证消息传递和缓存性能

### 待确认技术细节

1. Extension 现有的消息传递机制是否需要调整？
2. chrome.storage 当前的数据结构是什么样的？
3. Background 脚本是否有性能或频率限制？
4. UI 层的网络请求权限配置是否完整？

---

**文档版本**：v1.0  
**创建日期**：2024-12-XX  
**最后更新**：2024-12-XX  
**负责人**：Technical Architecture Team
