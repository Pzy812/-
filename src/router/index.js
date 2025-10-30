import { createRouter, createWebHistory } from 'vue-router'
import OCPhaseDiagram from '../components/Panels/OCPhaseDiagram.vue'
import ThermoCalcAnalysis from '../components/Panels/ThermoCalcAnalysis.vue'
import PandatAnalysis from '../components/Panels/PandatAnalysis.vue'
import PhaseLabAnalysis from '../components/Panels/PhaseLabAnalysis.vue'
import AIChatAssistant from '../components/Panels/AIChatAssistant.vue'
import SimulationCalculation from '../components/Panels/SimulationCalculation.vue'
import UserProfile from '../components/Panels/UserProfile.vue'
import InteractivePhaseDiagram from '../components/Panels/InteractivePhaseDiagram.vue'
import AutoOptimization from '../components/Panels/AutoOptimization.vue'
import DatabaseBuilder from '../components/Panels/DatabaseBuilder.vue'
import ThermoOptimization from '../components/Panels/ThermoOptimization.vue'
import BasicDiffusion from '../components/Panels/BasicDiffusion.vue'
import Case1 from '../components/Panels/Case1.vue'
import Case2 from '../components/Panels/Case2.vue'
// 移除了ViewModeDemo的导入

const routes = [
  { path: '/', redirect: '/oc/phase' },
  // 移除了/demo/view-modes路由
  { path: '/oc/phase', component: OCPhaseDiagram },
  { path: '/tc/analysis', component: ThermoCalcAnalysis },
  { path: '/pandat/analysis', component: PandatAnalysis },
  { path: '/phaselab/modeling', component: PhaseLabAnalysis },
  { path: '/ai/chat', component: AIChatAssistant },
  { path: '/simulation/calculation', component: SimulationCalculation },
  { path: '/simulation/basic-diffusion', component: BasicDiffusion },
  { path: '/optimization/thermo', component: ThermoOptimization },
  { path: '/user/profile', component: UserProfile },
  { path: '/intelligent/interactive-phase', component: InteractivePhaseDiagram },
  { path: '/intelligent/auto-optimization', component: AutoOptimization },
  { path: '/intelligent/database-builder', component: DatabaseBuilder },
  { path: '/case1/calculation', component: Case1 },
  { path: '/case2/calculation', component: Case2 }
]

export default createRouter({
  history: createWebHistory(),
  routes
})