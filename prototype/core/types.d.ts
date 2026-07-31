export type StageId = `U${number}` | 'M0' | `D${number}`

export interface CompanyAssociation {
  companyId: string
  role: string
  level: string
  score: number | null
  reason: string
}

export interface IndustryNode {
  id: string
  name: string
  region: string
  lane: string
  depth: number
  parentId: string | null
  important: boolean
  importanceLevel: string
  importanceReason: string
  description: string
  companyRefs: CompanyAssociation[]
  indicatorRefs: string[]
}

export interface NodePlacement {
  nodeId: string
  stageId: StageId
  lane: string
}

export interface PathEdge {
  id: string
  source: string
  target: string
  pathIds: string[]
  order: number
  type: 'path' | 'direct' | 'derived'
  relation: string
  importance: 'main' | 'normal'
}

export interface ParentRelation {
  parentId: string
  childId: string
  pathIds: string[]
}

export interface CompanyNodeReference {
  nodeId: string
  role: string
  level: string
  score: number | null
  reason: string
}

export interface Company {
  id: string
  name: string
  code: string
  market: string
  role: string
  level: string
  score: number | null
  reason: string
  nodeRefs: CompanyNodeReference[]
}

export interface IndicatorPoint {
  period: string
  value: number
}

export interface Indicator {
  id: string
  name: string
  latest: string | number | null
  period: string
  unit: string
  frequency: string
  trend: string
  source: string
  seriesPreview: IndicatorPoint[]
  seriesCount: number
  seriesPath: string
  nodeIds: string[]
}

