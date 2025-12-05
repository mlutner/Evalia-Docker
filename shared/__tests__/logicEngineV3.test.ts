import { LogicV3 } from "../logicEngine";

describe("logicEngineV3 evaluateLogicRules", () => {
  const context = {
    questions: [],
    answers: {
      q1: "Yes",
      q2: ["Option A", "Option B"],
      q3: 3,
      q4: "Option B,Option C",
    },
  };

  it("supports AND with contains()", () => {
    const rules = [
      {
        id: "r1",
        condition: 'answer("q1") == "Yes" && contains("q2","Option A")',
        action: "show",
        targetQuestionId: "next",
      },
    ];

    const result = LogicV3.evaluateLogicRules(rules as any, context as any);
    expect(result.matchedRule?.id).toBe("r1");
    expect(result.nextQuestionId).toBe("next");
  });

  it("supports OR conditions", () => {
    const rules = [
      {
        id: "r1",
        condition: 'answer("q1") == "No" || answer("q3") > 2',
        action: "show",
        targetQuestionId: "next",
      },
    ];

    const result = LogicV3.evaluateLogicRules(rules as any, context as any);
    expect(result.matchedRule?.id).toBe("r1");
  });

  it("handles contains on comma-separated string answers", () => {
    const rules = [
      {
        id: "r1",
        condition: 'contains("q4","Option C")',
        action: "show",
        targetQuestionId: "next",
      },
    ];

    const result = LogicV3.evaluateLogicRules(rules as any, context as any);
    expect(result.matchedRule?.id).toBe("r1");
  });

  it("returns empty result when no rule matches", () => {
    const rules = [
      {
        id: "r1",
        condition: 'answer("q1") == "No" && contains("q2","Missing")',
        action: "show",
        targetQuestionId: "next",
      },
    ];

    const result = LogicV3.evaluateLogicRules(rules as any, context as any);
    expect(result.matchedRule).toBeUndefined();
  });
});
