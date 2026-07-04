export interface Screen {
  id: number
  name: string
  url: string
  editing: boolean
}

export interface AnalysisEvent {
  name: string
  screen: string
  description: string
  priority: 'high' | 'medium' | 'low'
  properties: string[]
}

export interface AnalysisResult {
  events: AnalysisEvent[]
  gaps: string[]
  insights: string[]
}

export interface PastAnalysis {
  analysis_id: string
  created_at: string | { value: string }
  screen_names: string[]
  events: AnalysisEvent[]
  gaps: string[]
  insights: string[]
  screenshot_uris: string[]
}

export interface MatchResult {
  recommended: string
  ga4_event: string | null
  confidence: 'high' | 'medium' | 'none'
  reason: string
}

export interface GpuStats {
  engine: string
  gpu: boolean
  row_count: number
  gpu_ms: number
  cpu_ms_estimate: number | null
  frequency: Record<string, number>
}

export interface BehaviorPattern {
  title: string
  description: string
}

export interface RecommendationsResult {
  behavior_patterns: BehaviorPattern[]
  working_well: { title: string; description: string }[]
  friction_points: { title: string; description: string; screen: string | null }[]
  recommendations: { title: string; description: string; impact: 'high' | 'medium' | 'low' }[]
}
