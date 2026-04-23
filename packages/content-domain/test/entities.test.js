import test from "node:test";
import assert from "node:assert/strict";

import {
  createReceiptEntity,
  createReviewEntity,
  createTaskEntity,
  createTopicEntity,
} from "../src/entities.js";

test("createTopicEntity normalizes mixed input fields", () => {
  const entity = createTopicEntity({
    编号: "T01",
    标题: "AI 五层结构",
    账号: "主号",
    内容线: "主号-AI",
    状态: "进行中",
    目标用户: "老板",
    转化动作: "私信领取框架图",
    核心观点: "AI 是系统",
  });

  assert.equal(entity.id, "T01");
  assert.equal(entity.title, "AI 五层结构");
  assert.equal(entity.account, "主号");
  assert.equal(entity.goal, "私信领取框架图");
});

test("createTaskEntity normalizes task fields", () => {
  const entity = createTaskEntity({
    所属选题: "T03",
    内容标题: "内容自动化案例",
    负责人: "王辉",
    当前状态: "待审核",
    目标平台: "视频号",
    计划发布时间: "2026-04-25",
  });

  assert.equal(entity.topicId, "T03");
  assert.equal(entity.status, "待审核");
  assert.equal(entity.platform, "视频号");
});

test("createReceiptEntity and createReviewEntity normalize report fields", () => {
  const receipt = createReceiptEntity({
    内容标题: "案例视频",
    平台: "视频号",
    结论: "待观察",
    "24h数据": "1000",
  });
  const review = createReviewEntity({
    周次: "2026-W17",
    复盘结论: "选题有效",
    下周动作: "继续扩写",
  });

  assert.equal(receipt.title, "案例视频");
  assert.equal(receipt.data24h, "1000");
  assert.equal(review.week, "2026-W17");
  assert.equal(review.nextAction, "继续扩写");
});
