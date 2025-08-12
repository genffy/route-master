# RunHub - Ultimate Sports Data Aggregation Platform

RunHub是一个全平台运动数据聚合平台，支持从多个运动平台（如Garmin、Coros、Keep等）同步和管理运动数据，提供统一的数据视图和强大的分析功能。

## 🏃‍♂️ 项目特性

- **多平台数据同步**: 支持Garmin、Coros、Keep等主流运动平台
- **统一数据管理**: 将不同平台的数据标准化存储
- **全平台支持**: Android、iOS、Windows、macOS、Linux
- **离线优先**: 本地SQLite数据库，确保数据隐私和离线访问
- **安全加密**: 用户凭据采用AES-256-GCM加密存储
- **丰富的数据分析**: 提供详细的运动数据分析和可视化

## 🏗️ 技术架构

- **前端**: Flutter (跨平台UI框架)
- **后端核心**: Rust (高性能数据处理和同步)
- **数据库**: SQLite (本地数据存储)
- **通信**: Flutter Rust Bridge (FFI通信)
- **安全**: AES-256-GCM加密 + Argon2密码哈希

## 📱 支持的平台

### 运动平台
- [x] Garmin Connect (规划中)
- [x] Coros (规划中) 
- [x] Keep (规划中)
- [ ] Strava (规划中)
- [ ] Nike Run Club (规划中)

### 目标设备
- [x] Android
- [x] iOS  
- [x] Windows
- [x] macOS
- [x] Linux

## 🚀 快速开始

### 前置要求
- Flutter SDK (>=3.10.0)
- Rust toolchain (>=1.70.0)
- Dart SDK (>=3.0.0)

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/genffy/RunHub.git
   cd RunHub
   ```

2. **安装依赖**
   ```bash
   # 安装Flutter依赖
   flutter pub get
   
   # 构建Rust核心库
   cd rust_core
   cargo build --release
   cd ..
   ```

3. **配置Flutter Rust Bridge** (规划中)
   ```bash
   # 生成FFI绑定
   flutter_rust_bridge_codegen generate
   ```

4. **运行应用**
   ```bash
   flutter run
   ```

## 📁 项目结构

```
RunHub/
├── lib/                    # Flutter前端代码
│   ├── models/            # 数据模型
│   ├── services/          # 服务层(FFI调用)
│   ├── ui/               # UI组件
│   │   ├── pages/        # 页面
│   │   ├── widgets/      # 组件
│   │   └── theme/        # 主题
│   └── main.dart         # 应用入口
├── rust_core/             # Rust后端核心
│   ├── src/
│   │   ├── models.rs     # 数据模型
│   │   ├── database.rs   # 数据库操作
│   │   ├── sync.rs       # 同步引擎
│   │   ├── api.rs        # 公共API
│   │   ├── crypto.rs     # 加密模块
│   │   ├── processing.rs # 数据处理
│   │   └── connectors/   # 平台连接器
│   └── Cargo.toml
├── assets/               # 资源文件
├── doc/                  # 文档
└── README.md
```

## 🎯 功能模块

### Dashboard (仪表盘)
- 运动数据总览
- 活动类型分布图表
- 最近活动列表
- 个人最佳记录

### Activities (活动管理)
- 分页显示活动列表
- 按类型和来源筛选
- 活动详情查看
- GPS轨迹可视化

### Settings (设置)
- 平台账号管理
- 数据同步配置
- 导入/导出功能
- 主题和单位设置

## 🔒 数据安全

- **本地存储**: 所有数据存储在本地SQLite数据库
- **加密保护**: 用户凭据使用AES-256-GCM加密
- **密码安全**: 采用Argon2进行密码哈希
- **隐私优先**: 不上传个人运动数据到服务器

## 🛠️ 开发计划

- [x] 基础架构搭建
- [x] 数据模型设计
- [x] UI界面实现
- [ ] Flutter Rust Bridge集成
- [ ] 平台连接器实现
- [ ] GPX/FIT文件导入
- [ ] 数据可视化优化
- [ ] 多语言支持

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- Flutter团队提供的优秀跨平台框架
- Rust社区的高性能生态系统
- 所有运动数据平台的开放API支持

## 🔗 相关链接

- [FIT SDK Documentation](https://github.com/garmin/fit-javascript-sdk)
- [GPX Format Specification](https://www.topografix.com/gpx.asp)
- [Flutter Documentation](https://docs.flutter.dev/)
- [Rust Documentation](https://doc.rust-lang.org/)