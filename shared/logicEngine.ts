import * as LogicV2 from '@core/logic/logicEngineV2';
import * as LogicV3 from '@core/logic/logicEngineV3';

export type { LogicEvaluationContext, LogicResult } from '@core/logic/logicEngineV2';
export const evaluateLogicRules = LogicV2.evaluateLogicRules;
export { LogicV3 };
