import { MetaGuard } from '@ngx-meta/core';
import {
  FlowStatisticsDetailPageComponent,
  FlowStatisticsOverviewPageComponent,
  FlowStatisticsPageComponent,
} from '../pages/flow-statistics';
import { DashboardPageComponent } from '../pages/monitoring';

export const FLOW_STATISTICS_ROUTES = [
  {
    path: 'flow-statistics',
    canActivate: [ MetaGuard ],
    data: {
      icon: 'timeline',
      id: 'tff_flow_statistics',
      meta: {
        title: 'tff.flow_statistics',
      },
    },
    component: FlowStatisticsOverviewPageComponent,
  },
  {
    path: 'flow-statistics/:flowName',
    canActivate: [ MetaGuard ],
    data: { meta: { title: 'tff.flow_statistics' } },
    component: FlowStatisticsPageComponent,
  },
  {
    path: 'flow-statistics/:flowName/:flowId',
    canActivate: [ MetaGuard ],
    data: { meta: { title: 'tff.flow_statistics' } },
    component: FlowStatisticsDetailPageComponent,
  },
  {
    path: 'dashboard',
    canActivate: [ MetaGuard ],
    data: {
      meta: { title: 'tff.dashboard' },
      id: 'tff_dashboard',
      icon: 'dashboard',
    },
    component: DashboardPageComponent,
  },
];
