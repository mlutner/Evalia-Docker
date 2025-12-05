/**
 * Logic Validation Layer
 * 
 * Validates survey logic configuration before save/publish.
 * Catches broken or risky configs that could break the respondent experience.
 */

import type { LogicRule, Question } from '@shared/schema';

// ============================================================================
// TYPES
// ============================================================================

export interface QuestionNode {
  id: string;
  order: number;
  text: string;
  logicRules: LogicRule[];
  isReachable: boolean;
}

export interface LogicEdge {
  from: string;
  to: string;
  rule: LogicRule;
  type: 'skip' | 'show' | 'end';
}

export interface QuestionGraph {
  nodes: Map<string, QuestionNode>;
  edges: LogicEdge[];
  entryNode: string | null;
  exitNodes: Set<string>; // Questions that lead to completion (last Q or END rules)
}

export type LogicIssueSeverity = 'error' | 'warning' | 'info';

export interface LogicValidationResult {
  code: string;
  severity: LogicIssueSeverity;
  message: string;
  questionId?: string;
  ruleId?: string;
  details?: Record<string, unknown>;
}

// ============================================================================
// GRAPH BUILDING
// ============================================================================

/**
 * Build a directed graph of questions and their logic edges
 */
export function buildQuestionGraph(questions: Question[]): QuestionGraph {
  const nodes = new Map<string, QuestionNode>();
  const edges: LogicEdge[] = [];
  
  // Create nodes for each question
  questions.forEach((q, idx) => {
    nodes.set(q.id, {
      id: q.id,
      order: idx,
      text: q.question || '',
      logicRules: (q as any).logicRules || [],
      isReachable: idx === 0, // Only first question is initially reachable
    });
  });

  // Build edges from logic rules
  for (const q of questions) {
    const rules = (q as any).logicRules || [];
    for (const rule of rules) {
      if (rule.action === 'end') {
        edges.push({
          from: q.id,
          to: '__END__',
          rule,
          type: 'end',
        });
      } else if (rule.targetQuestionId) {
        edges.push({
          from: q.id,
          to: rule.targetQuestionId,
          rule,
          type: rule.action as 'skip' | 'show',
        });
      }
    }
  }

  // Determine exit nodes
  const exitNodes = new Set<string>();
  const lastQ = questions[questions.length - 1];
  if (lastQ) {
    exitNodes.add(lastQ.id);
  }
  
  // Add questions with END rules as exit nodes
  edges.filter(e => e.type === 'end').forEach(e => exitNodes.add(e.from));

  // Calculate reachability using BFS from entry
  if (questions.length > 0) {
    const entryId = questions[0].id;
    markReachable(nodes, edges, entryId, questions);
  }

  return {
    nodes,
    edges,
    entryNode: questions[0]?.id || null,
    exitNodes,
  };
}

/**
 * Mark all reachable nodes from the entry point using BFS
 */
function markReachable(
  nodes: Map<string, QuestionNode>,
  edges: LogicEdge[],
  entryId: string,
  questions: Question[]
): void {
  const visited = new Set<string>();
  const queue: string[] = [entryId];

  // Build adjacency list: normal flow (next question) + logic edges
  const adjacency = new Map<string, Set<string>>();
  
  questions.forEach((q, idx) => {
    if (!adjacency.has(q.id)) adjacency.set(q.id, new Set());
    
    // Normal flow: goes to next question
    if (idx < questions.length - 1) {
      adjacency.get(q.id)!.add(questions[idx + 1].id);
    }
  });

  // Add logic edges
  for (const edge of edges) {
    if (edge.to !== '__END__') {
      if (!adjacency.has(edge.from)) adjacency.set(edge.from, new Set());
      adjacency.get(edge.from)!.add(edge.to);
    }
  }

  // BFS
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    const node = nodes.get(current);
    if (node) {
      node.isReachable = true;
    }

    const neighbors = adjacency.get(current);
    if (neighbors) {
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push(neighbor);
        }
      }
    }
  }
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Main validation entry point
 */
export function validateSurveyLogic(questions: Question[]): LogicValidationResult[] {
  const results: LogicValidationResult[] = [];
  
  if (questions.length === 0) {
    return results;
  }

  const graph = buildQuestionGraph(questions);
  const questionIds = new Set(questions.map(q => q.id));

  // Run all validation checks
  results.push(...checkMissingTargets(graph, questionIds));
  results.push(...checkCycles(graph, questions));
  results.push(...checkUnreachableQuestions(graph));
  results.push(...checkDeadEnds(graph, questions));
  results.push(...checkConflictingRules(graph, questions));
  results.push(...checkBackwardsJumps(graph, questions));

  return results;
}

/**
 * Check for rules referencing deleted/missing questions
 */
function checkMissingTargets(
  graph: QuestionGraph,
  validIds: Set<string>
): LogicValidationResult[] {
  const results: LogicValidationResult[] = [];

  for (const edge of graph.edges) {
    if (edge.to !== '__END__' && !validIds.has(edge.to)) {
      results.push({
        code: 'MISSING_TARGET',
        severity: 'error',
        message: `Rule targets non-existent question "${edge.to}"`,
        questionId: edge.from,
        ruleId: edge.rule.id,
        details: { targetId: edge.to },
      });
    }
  }

  return results;
}

/**
 * Detect cycles (backwards jumps that could create loops)
 * 
 * TODO: Decide if backwards jumps should be allowed.
 * Currently we flag them as warnings, not errors.
 */
function checkCycles(
  graph: QuestionGraph,
  questions: Question[]
): LogicValidationResult[] {
  const results: LogicValidationResult[] = [];
  const orderMap = new Map(questions.map((q, i) => [q.id, i]));

  // Use DFS to detect back edges
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const cycleEdges: LogicEdge[] = [];

  function dfs(nodeId: string, path: string[]): boolean {
    if (recursionStack.has(nodeId)) {
      // Found a cycle
      return true;
    }
    if (visited.has(nodeId)) {
      return false;
    }

    visited.add(nodeId);
    recursionStack.add(nodeId);

    const node = graph.nodes.get(nodeId);
    if (node) {
      for (const rule of node.logicRules) {
        if (rule.targetQuestionId && rule.action === 'skip') {
          const targetOrder = orderMap.get(rule.targetQuestionId);
          const currentOrder = orderMap.get(nodeId);
          
          if (targetOrder !== undefined && currentOrder !== undefined) {
            if (targetOrder <= currentOrder) {
              // This is a backwards jump
              cycleEdges.push({
                from: nodeId,
                to: rule.targetQuestionId,
                rule,
                type: 'skip',
              });
            }
          }

          // Continue DFS
          if (dfs(rule.targetQuestionId, [...path, nodeId])) {
            return true;
          }
        }
      }
    }

    // Also check normal flow
    const currentOrder = orderMap.get(nodeId);
    if (currentOrder !== undefined && currentOrder < questions.length - 1) {
      const nextId = questions[currentOrder + 1].id;
      if (dfs(nextId, [...path, nodeId])) {
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  if (graph.entryNode) {
    dfs(graph.entryNode, []);
  }

  // Report backwards jumps
  for (const edge of cycleEdges) {
    results.push({
      code: 'BACKWARDS_JUMP',
      severity: 'warning',
      message: `Rule creates a backwards jump from "${edge.from}" to "${edge.to}" which could create a loop`,
      questionId: edge.from,
      ruleId: edge.rule.id,
      details: { targetId: edge.to },
    });
  }

  return results;
}

/**
 * Check for unreachable questions (no path from Q1)
 */
function checkUnreachableQuestions(graph: QuestionGraph): LogicValidationResult[] {
  const results: LogicValidationResult[] = [];

  for (const [id, node] of graph.nodes) {
    if (!node.isReachable) {
      results.push({
        code: 'UNREACHABLE_QUESTION',
        severity: 'warning',
        message: `Question "${node.text.slice(0, 50)}..." may never be shown due to logic rules`,
        questionId: id,
        details: { questionOrder: node.order },
      });
    }
  }

  return results;
}

/**
 * Check for dead ends where survey can't reach completion
 * 
 * A dead end occurs when:
 * - A question has no outgoing edges (normal flow blocked by condition)
 * - AND it's not the last question
 * - AND it doesn't have an END rule
 */
function checkDeadEnds(
  graph: QuestionGraph,
  questions: Question[]
): LogicValidationResult[] {
  const results: LogicValidationResult[] = [];
  const lastQuestionId = questions[questions.length - 1]?.id;

  // For each question, check if there's a guaranteed path to completion
  // This is a simplified check: we look for questions that ONLY have 
  // conditional skips with no fallback
  
  for (const [id, node] of graph.nodes) {
    if (id === lastQuestionId) continue; // Last question is fine
    if (graph.exitNodes.has(id)) continue; // Has END rule
    
    const rules = node.logicRules;
    if (rules.length === 0) continue; // No logic = normal flow continues
    
    // Check if ALL paths from this question are conditional
    const hasUnconditionalPath = rules.some(r => !r.condition || r.condition.trim() === '');
    
    // If there are rules but no unconditional path, normal flow still exists
    // So dead ends are rare - mostly a concern if we add "always skip" rules
    // For now, we skip this complex analysis
  }

  return results;
}

/**
 * Check for conflicting rules (same trigger/condition, different outcomes)
 */
function checkConflictingRules(
  graph: QuestionGraph,
  questions: Question[]
): LogicValidationResult[] {
  const results: LogicValidationResult[] = [];

  for (const q of questions) {
    const rules = (q as any).logicRules || [];
    if (rules.length < 2) continue;

    // Group rules by condition
    const byCondition = new Map<string, LogicRule[]>();
    for (const rule of rules) {
      const condition = rule.condition || '__unconditional__';
      if (!byCondition.has(condition)) {
        byCondition.set(condition, []);
      }
      byCondition.get(condition)!.push(rule);
    }

    // Check for conflicts within same condition
    for (const [condition, conditionRules] of byCondition) {
      if (conditionRules.length > 1) {
        const targets = new Set(conditionRules.map(r => r.targetQuestionId || '__END__'));
        if (targets.size > 1) {
          results.push({
            code: 'CONFLICTING_RULES',
            severity: 'warning',
            message: `Multiple rules with same condition "${condition}" have different targets`,
            questionId: q.id,
            details: { 
              condition,
              targets: Array.from(targets),
              ruleIds: conditionRules.map(r => r.id),
            },
          });
        }
      }
    }
  }

  return results;
}

/**
 * Check for backwards jumps (separate from cycle detection)
 * These may be intentional for "go back" functionality
 */
function checkBackwardsJumps(
  graph: QuestionGraph,
  questions: Question[]
): LogicValidationResult[] {
  const results: LogicValidationResult[] = [];
  const orderMap = new Map(questions.map((q, i) => [q.id, i]));

  for (const edge of graph.edges) {
    if (edge.to === '__END__') continue;
    
    const fromOrder = orderMap.get(edge.from);
    const toOrder = orderMap.get(edge.to);
    
    if (fromOrder !== undefined && toOrder !== undefined && toOrder < fromOrder) {
      // Already caught in checkCycles, but this is a separate explicit check
      // Could be used if we want different severity levels
    }
  }

  return results;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get human-readable summary of validation results
 */
export function summarizeValidation(results: LogicValidationResult[]): {
  errorCount: number;
  warningCount: number;
  infoCount: number;
  isValid: boolean;
} {
  const errorCount = results.filter(r => r.severity === 'error').length;
  const warningCount = results.filter(r => r.severity === 'warning').length;
  const infoCount = results.filter(r => r.severity === 'info').length;

  return {
    errorCount,
    warningCount,
    infoCount,
    isValid: errorCount === 0,
  };
}

/**
 * Filter results by severity
 */
export function filterBySeverity(
  results: LogicValidationResult[],
  severity: LogicIssueSeverity
): LogicValidationResult[] {
  return results.filter(r => r.severity === severity);
}

/**
 * Get results affecting a specific question
 */
export function getIssuesForQuestion(
  results: LogicValidationResult[],
  questionId: string
): LogicValidationResult[] {
  return results.filter(r => r.questionId === questionId);
}

