import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from '@/components';
import { THEME } from '@/utils/theme.utils';
import i18n from '@/languages/i18n';
import HomeScreen from '@/modules/home/screens/HomeScreen';
import ChartsScreen from '@/modules/charts/screens/ChartsScreen';
import AlertsScreen from '@/modules/alerts/screens/AlertsScreen';
import SettingsScreen from '@/modules/settings/SettingsScreen';

const Tab = createBottomTabNavigator({
  screenOptions: function ScreenOptions() {
    return {
      tabBarActiveTintColor: THEME.colors.primaryBlue,
    };
  },
  screens: {
    Home: {
      screen: HomeScreen,
      options: {
        tabBarIcon: ({ color }) => <Icon name="watchlist" color={color} />,
        title: i18n.t('home.title'),
        headerShown: false,
      },
    },
    Charts: {
      screen: ChartsScreen,
      options: {
        tabBarIcon: ({ color }) => <Icon name="charts" color={color} />,
        title: i18n.t('charts.title'),
        headerShown: false,
      },
    },
    Alerts: {
      screen: AlertsScreen,
      options: {
        tabBarIcon: ({ color }) => <Icon name="alerts" color={color} />,
        title: i18n.t('alerts.title'),
        headerShown: false,
      },
    },
    Settings: {
      screen: SettingsScreen,
      options: {
        tabBarIcon: ({ color }) => <Icon name="settings" color={color} />,
        title: i18n.t('settings.title'),
        headerShown: false,
      },
    },
  },
});

export default Tab;
