import CreateAlertScreen from '@/modules/alerts/screens/CreateAlertScreen';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator({
  screenOptions: function ScreenOptions() {
    return {
      headerShown: false,
    };
  },
  screens: {
    CreateAlert: {
      screen: CreateAlertScreen,
      options: ({ navigation }) => ({
        title: 'Create Alert Screen',
      }),
    },
  },
});

export default Stack;
