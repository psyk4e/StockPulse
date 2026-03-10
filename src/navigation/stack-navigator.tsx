import CreateAlertScreen from '@/modules/alerts/screens/CreateAlertScreen';
import { createStackNavigator } from '@react-navigation/stack';

export type StackNavigatorParamList = {
  CreateAlert: { alertId?: string; initialSymbol?: string };
};

const Stack = createStackNavigator({
  screenOptions: function ScreenOptions() {
    return {
      headerShown: false,
    };
  },
  screens: {
    CreateAlert: {
      screen: CreateAlertScreen,
    },
  },
});

export default Stack;
