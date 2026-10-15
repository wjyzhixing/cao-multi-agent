# 任务

实现：自行车查询CURD

## 项目目录

- 前端：`frontend`（html+fetch）
- 后端：`backend`（nodejs+express）

## 要求

- Antigravity / AGY 负责前端。
- Codex 负责后端业务代码。
- Supervisor 不实现业务代码，只负责拆解、协调和汇总。
- 开始编码前先明确 API Contract。
- Contract 明确后，前后端使用 assign 并行开发。
- frontend_agy 必须优先使用前端项目自带的 AGENTS.md、skills、MCP 和组件体系。
- backend_codex 必须遵守后端项目已有规范并执行相关测试。
- 两边完成后使用 reviewer_codex 做最终 Review。
- Blocking 问题返回对应 Agent 修复，再 Review。
- Non-blocking 问题不要无限返工。

## 最终输出

- 修改文件
- 前端结果
- 后端结果
- 测试结果
- Review 结果
- Blocking 问题
- 已知风险

## 执行指令

收到本任务后立即开始执行，不要等待用户再次确认，也不要进入 idle 等待。

执行流程：

1. Supervisor 阅读任务并明确 API Contract。
2. API Contract 确认后，使用 assign 并行派发 frontend_agy 和 backend_codex。
3. Supervisor 只协调，不实现业务代码。
4. 前后端完成后 assign reviewer_codex 进行 Review。
5. Blocking 问题退回对应 Agent 修复。
6. 修复完成后再次 Review。
7. 全部完成后输出最终汇总。