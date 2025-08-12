# RunHub 多平台配置说明

## 概述

已成功为 RunHub 项目添加了 iOS 和 macOS 平台支持。项目现在支持以下平台：
- Web (原有)
- iOS (新增)
- macOS (新增)

## 新增的文件结构

### iOS 平台 (`ios/` 目录)

```
ios/
├── Flutter/
│   ├── AppFrameworkInfo.plist          # Flutter 框架信息
│   ├── Debug.xcconfig                  # Debug 配置
│   └── Release.xcconfig                # Release 配置
├── Podfile                             # CocoaPods 依赖管理
├── Runner/
│   ├── AppDelegate.swift               # iOS 应用入口
│   ├── Assets.xcassets/                # iOS 应用图标资源
│   │   ├── AppIcon.appiconset/
│   │   └── LaunchImage.imageset/
│   ├── Base.lproj/                     # 界面文件
│   │   ├── LaunchScreen.storyboard
│   │   └── Main.storyboard
│   ├── Info.plist                      # iOS 应用信息配置
│   └── Runner-Bridging-Header.h        # Swift/Objective-C 桥接头文件
├── Runner.xcodeproj/                   # Xcode 项目文件
│   └── project.pbxproj
└── Runner.xcworkspace/                 # Xcode 工作空间
    ├── contents.xcworkspacedata
    └── xcshareddata/
```

### macOS 平台 (`macos/` 目录)

```
macos/
├── Flutter/
│   ├── Flutter-Debug.xcconfig          # Flutter Debug 配置
│   └── Flutter-Release.xcconfig        # Flutter Release 配置
├── Podfile                             # CocoaPods 依赖管理
├── Runner/
│   ├── AppDelegate.swift               # macOS 应用入口
│   ├── Assets.xcassets/                # macOS 应用图标资源
│   ├── Base.lproj/
│   │   └── MainMenu.xib                # macOS 主菜单界面
│   ├── Configs/                        # 配置文件目录
│   │   ├── AppInfo.xcconfig            # 应用信息配置
│   │   ├── Debug.xcconfig              # Debug 配置
│   │   ├── Release.xcconfig            # Release 配置
│   │   └── Warnings.xcconfig           # 编译警告配置
│   ├── DebugProfile.entitlements       # Debug/Profile 权限配置
│   ├── Info.plist                      # macOS 应用信息配置
│   ├── MainFlutterWindow.swift         # 主窗口控制器
│   └── Release.entitlements            # Release 权限配置
├── Runner.xcodeproj/                   # Xcode 项目文件
├── Runner.xcworkspace/                 # Xcode 工作空间
└── RunnerTests/                        # 测试文件
    └── RunnerTests.swift
```

## 配置特点

### iOS 配置
- **Bundle ID**: `com.runhub.app`
- **最低支持版本**: iOS 11.0
- **权限**: 位置访问、运动数据访问
- **支持设备**: iPhone 和 iPad
- **方向支持**: 竖屏和横屏

### macOS 配置
- **Bundle ID**: `com.runhub.app`
- **最低支持版本**: macOS 10.14
- **权限**: 网络访问、文件访问、位置访问
- **沙盒**: 启用 App Sandbox
- **窗口**: 标准窗口控件 (关闭、最小化、缩放)

## 开发环境要求

### iOS 开发
- macOS 系统
- Xcode 12.0 或更高版本
- iOS Simulator 或真机设备
- 有效的 Apple Developer 账号 (用于真机调试和发布)

### macOS 开发
- macOS 系统
- Xcode 12.0 或更高版本
- macOS 10.14 或更高版本

## 构建命令

### 检查可用设备
```bash
flutter devices
```

### iOS 构建
```bash
# Debug 版本
flutter build ios --debug

# Release 版本
flutter build ios --release

# 运行到 iOS 设备/模拟器
flutter run -d ios
```

### macOS 构建
```bash
# Debug 版本
flutter build macos --debug

# Release 版本
flutter build macos --release

# 运行到 macOS
flutter run -d macos
```

## 依赖管理

项目使用 CocoaPods 管理原生依赖：

### iOS
```bash
cd ios
pod install
```

### macOS
```bash
cd macos
pod install
```

## 注意事项

1. **首次运行**: 需要运行 `flutter pub get` 获取 Flutter 依赖
2. **原生依赖**: 如果添加了新的插件，需要重新运行 `pod install`
3. **权限配置**: 根据应用需求，可能需要在 Info.plist 中添加更多权限描述
4. **签名配置**: iOS 真机调试和发布需要配置代码签名
5. **App Store**: 发布到 App Store 需要遵循相应的审核指南

## 项目配置文件

- **pubspec.yaml**: 已更新支持多平台
- **.gitignore**: 已添加平台特定的忽略规则
- **分析配置**: 保持现有的 `analysis_options.yaml`

## 下一步

1. 根据需要添加平台特定的插件
2. 配置应用图标和启动画面
3. 设置代码签名 (用于 iOS 真机调试)
4. 测试应用在不同平台上的功能
5. 根据平台特性优化用户界面

## 支持状态

✅ **iOS 平台**: 完全配置，支持 iPhone 和 iPad
✅ **macOS 平台**: 完全配置，支持桌面应用
✅ **Web 平台**: 原有支持保持
⚠️ **Android 平台**: 需要额外配置 (可选)

项目现在已经完全支持 iOS 和 macOS 平台开发！
