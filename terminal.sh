cao session send cao-feature \
"现在开始执行刚才收到的 task.md 任务，不要等待额外确认。

执行顺序：
1. Supervisor 先分析需求并明确 API Contract。
2. Contract 确定后，使用 assign 并行派发：
   - frontend_agy：实现前端
   - backend_codex：实现后端
3. Supervisor 不写业务代码，只负责协调和检查进度。
4. 前后端完成后，使用 assign 派发 reviewer_codex 做最终 Review。
5. 如果存在 Blocking 问题，派回对应 Agent 修复，然后再次 Review。
6. Non-blocking 问题记录即可，不要无限返工。
7. 所有任务完成后，按 task.md 要求汇总修改文件、前后端结果、测试结果、Review、Blocking 问题和已知风险。

立即开始执行。"