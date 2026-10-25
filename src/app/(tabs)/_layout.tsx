import { Tabs } from 'expo-router';
import { Icon, type IconName } from '../../components/icon';
import { useApp } from '../../state/app-state';

export default function TabsLayout() {
  const { colors } = useApp();
  const tabs: { name: string; title: string; icon: IconName }[] = [
    { name: 'index', title: 'Home', icon: 'home' },
    { name: 'quran', title: 'Quran', icon: 'book' },
    { name: 'surahs', title: 'Surahs', icon: 'list' },
    { name: 'juz', title: 'Juz', icon: 'layers' },
    { name: 'bookmarks', title: 'Bookmarks', icon: 'bookmark' },
  ];
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted,
    sceneStyle: { backgroundColor: colors.background },
    tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, paddingTop: 8 },
    tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 3 },
  }}>{tabs.map(tab => <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.title, tabBarIcon: ({ focused }) => <Icon name={tab.icon} color={focused ? colors.primary : colors.muted} size={22} filled={focused && tab.icon === 'bookmark'} /> }} />)}</Tabs>;
}
