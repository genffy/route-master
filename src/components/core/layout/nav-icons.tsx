import { Settings as GearSixIcon, Insights as ChartPieIcon, ElectricalServices as PlugsConnectedIcon, Person as UserIcon, Close as XSquare, type SvgIconComponent } from '@mui/icons-material';

export const navIcons = {
  'chart-pie': ChartPieIcon,
  'gear-six': GearSixIcon,
  'plugs-connected': PlugsConnectedIcon,
  'x-square': XSquare,
  user: UserIcon,
  users: UserIcon,
} as Record<string, SvgIconComponent>;
