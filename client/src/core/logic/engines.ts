export type LogicEngine = {
  id: string;
  name: string;
  status: "default" | "available";
  notes?: string;
};

export const logicEngines: LogicEngine[] = [
  {
    id: "logicEngineV2",
    name: "Logic Engine V2",
    status: "default",
    notes: "Current skip/branch evaluation path used for runtime flows.",
  },
  {
    id: "LogicV3",
    name: "Logic V3",
    status: "available",
    notes: "Next-gen evaluator available for experimentation but not defaulted yet.",
  },
];

export const defaultLogicEngineId = "logicEngineV2";
