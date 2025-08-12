# **RunHub: 终极运动数据聚合平台 - 项目设计与规划文档**

*   **项目名称:** RunHub
*   **文档版本:** 1.0
*   **创建者:** @genffy
*   **创建日期 (UTC):** 2025-08-12 08:58:36

## 1. 项目愿景与核心目标 (Vision & Goals)

**愿景:** 打造一个终极的、以用户为中心的运动数据聚合器。让每一位运动爱好者都能完全拥有、控制和利用自己的运动数据，打破平台壁垒，释放数据潜力。

**核心目标:**

1.  **数据主权:** 将用户在各大运动平台（如咕咚、Keep、Garmin、Coros 等）的运动数据安全、完整地抓取并保存在用户本地设备上。
2.  **跨平台:** 基于一套核心代码，构建支持所有主流操作系统（iOS, Android, Windows, macOS, Linux）的应用程序，提供一致的用户体验。
3.  **数据可移植性:** 用户可以轻松地将所有数据导出为标准通用格式（GPX, FIT, CSV 等），实现无痛的数据迁移、备份和自定义分析。
4.  **可扩展性:** 提供强大的数据可视化、编辑功能，并为未来接入机器学习模型进行高级分析提供干净、标准化的数据基础。

## 2. 系统架构 (System Architecture)

为实现高性能、高可靠性及跨平台的目标，项目采用**前后端分离**的本地化架构，即**Flutter UI + Rust Core**。

### 2.1 架构图 (Mermaid)

````mermaid
graph TD
    subgraph User_Layer [用户]
        User([fa:fa-user User])
    end

    subgraph Presentation_Layer [A. 表示层 (Presentation Layer - Flutter/Dart)]
        direction TB
        subgraph UI_Components [A1. UI 组件]
            Dashboard("fa:fa-tachometer-alt Dashboard")
            ActivityList("fa:fa-list Activity List")
            DetailView("fa:fa-chart-line Detail View")
            Settings("fa:fa-cog Settings")
        end
        subgraph Platform_Targets [A2. 平台目标]
            Platforms("iOS, Android, Windows, macOS, Linux")
        end
    end

    subgraph Bridge_Layer [B. 桥接层 (Bridge)]
        Bridge("flutter_rust_bridge<br/>类型安全、自动生成的 FFI")
    end

    subgraph Core_Logic_Layer [C. 核心逻辑层 (Core Logic Layer - Rust)]
        direction TB
        subgraph Exposed_API [C1. 对外 API]
            ApiFunctions("async fn sync_platform()<br/>async fn get_activities_summary()<br/>async fn get_activity_details(id)<br/>async fn import_file(path)")
        end

        subgraph Sync_Engine [C2. 同步引擎]
            direction LR
            Connectors("Garmin Connector<br/>Coros Connector<br/>Keep Connector<br/>GPX/FIT Importer")
        end

        subgraph Processing_Engine [C3. 数据处理引擎]
            Processing("数据标准化<br/>数据去重<br/>统计分析 (PBs)")
        end

        subgraph DAO_Layer [C4. 数据库访问层 (DAO)]
            DAO("使用 rusqlite / sqlx<br/>封装 SQL 操作")
        end
    end

    subgraph Persistence_Layer [D. 数据持久层 (Local Device)]
        direction TB
        SQLiteDb("fa:fa-database SQLite DB<br/>activities, track_points, laps<br/>(强加密的凭据)")
        FileSystem("fa:fa-folder File System<br/>GPX/FIT/TCX, .zip 备份")
    end

    subgraph External_Services_Layer [E. 外部服务 (External Services)]
        direction TB
        Garmin("fa:fa-server Garmin Connect")
        Coros("fa:fa-server Coros API/Web")
        OtherPlatforms("fa:fa-server Keep / Strava ...")
    end

    %% --- 定义模块间关系 ---
    User --> UI_Components
    UI_Components -- "1. 异步函数调用" --> Bridge
    Bridge -- "2. 安全的 FFI 调用" --> Exposed_API
    Exposed_API -- "7. 结果/数据返回" --> Bridge
    Bridge -- "8. 类型安全的结果" --> UI_Components
    Exposed_API -- "3. 分发任务" --> Sync_Engine
    Exposed_API -- " " --> Processing_Engine
    Exposed_API -- " " --> DAO_Layer
    Sync_Engine -- "4. 抓取原始数据" --> Processing_Engine
    Processing_Engine -- "5. 清洗/处理数据" --> DAO_Layer
    DAO_Layer -- "6. 写入/读取数据库" --> Persistence_Layer
    Sync_Engine <-->|HTTPS / Web Scraping| External_Services_Layer
````

### 2.2 架构解析

*   **职责分离:** Flutter 层专注于 UI 渲染和用户交互，不处理任何复杂的业务逻辑。Rust 核心层作为无 UI 的“大脑”，负责所有数据抓取、处理和存储，可被独立测试和维护。
*   **性能与安全:** 将计算密集型和安全敏感型任务（如数据解析、并发网络请求、凭据加密）交由 Rust 处理，可以获得接近原生的性能和编译时安全保证（内存安全、线程安全）。
*   **无缝集成:** 通过 `flutter_rust_bridge` 实现 Flutter 与 Rust 之间的安全、高效通信，消除了手动编写 FFI 的复杂性和风险。

### 2.3 技术选型 (Technology Stack)

*   **前端框架:** Flutter
*   **前端语言:** Dart
*   **核心逻辑层语言:** Rust
*   **本地数据库:** SQLite (通过 Rust 的 `rusqlite` 或 `sqlx` 库进行操作)
*   **桥接技术:** `flutter_rust_bridge`
*   **标准数据格式:** GPX, FIT, TCX (导入/导出), CSV/JSON (导出)

## 3. 核心功能模块设计

### 3.1 数据库模型 (Database Schema)

*   **`activities` (运动记录主表):** 存储每次活动的摘要信息，如 `id`, `source`, `activity_type`, `start_time_utc`, `distance_meters`, `duration_seconds`, `avg_heart_rate` 等。
*   **`track_points` (轨迹点表):** 存储详细的 GPS 轨迹点数据，与 `activities` 表关联，包含 `latitude`, `longitude`, `altitude_meters`, `timestamp_utc`, `heart_rate` 等瞬时数据。
*   **`laps` (分段/计圈表):** 存储每公里或每英里的分段数据。
*   **`user_credentials` (用户凭据表):** **经过高强度加密后**存储用户在各平台的登录凭据（如 Token）。

### 3.2 核心逻辑层 (Rust Core)

*   **数据源连接器 (Connectors):** 为每个外部平台（Garmin, Coros等）实现一个独立的 `Connector` 模块。所有模块实现统一的接口，负责模拟登录、API 调用、数据下载等任务。此设计便于未来扩展新的平台。
*   **数据处理引擎 (Processing Engine):**
    *   **标准化:** 将不同来源的异构数据清洗并转换为统一的数据库模型。
    *   **去重:** 基于时间、距离等关键指标生成唯一签名，防止重复导入。
*   **数据库访问层 (DAO):** 封装所有 SQL 操作，为上层逻辑提供结构化、安全的数据库访问接口。

### 3.3 表示层 (Flutter UI)

*   **仪表盘 (Dashboard):** 关键数据统计与概览。
*   **活动列表 (Activities List):** 提供强大的筛选、排序功能。
*   **活动详情页 (Activity Details):** 集成地图轨迹、多维度数据图表（海拔、心率、配速等）和分段数据分析。

## 4. 开发路线图 (Development Roadmap)

**第一阶段：核心功能 MVP**
*   **目标:** 验证核心数据通路，实现从 1-2 个主流平台同步数据并展示。
*   **任务:** 搭建框架，实现 Garmin 连接器和 GPX 文件导入，开发基础的列表页和详情页，构建桌面版应用。

**第二阶段：扩展平台与移动端支持**
*   **目标:** 支持更多平台（如 Coros, 咕咚），并完成移动端适配。
*   **任务:** 开发新的连接器，优化 UI/UX 适配移动端，实现数据全量备份功能。

**第三阶段：高级功能与数据分析**
*   **目标:** 提升数据分析和管理能力。
*   **任务:** 开发高级分析图表，实现活动记录编辑功能，建立个人最佳记录 (PB) 统计系统。

**第四阶段：社区与未来**
*   **目标:** 长期维护和生态建设。
*   **任务:** 根据用户反馈持续迭代，优化性能，并考虑开源项目以吸引社区贡献。

## 5. 风险与挑战 (Risks & Challenges)

1.  **数据抓取脆弱性:** 依赖非官方接口和网页抓取，目标平台改版可能导致功能失效，需要持续维护。
2.  **账号安全与隐私:** 必须对用户凭据进行强加密本地存储，并清晰告知用户数据仅存于本地，绝不上传。
3.  **开发复杂性:** 数据格式的清洗和标准化工作量巨大，需要细致处理。
4.  **法律与合规风险:** 需注意各平台的服务条款，以“帮助用户备份和管理自己的数据”为核心定位。
