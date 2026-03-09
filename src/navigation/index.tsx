import { createStaticNavigation, StaticParamList } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '@modules/login/screens/LoginScreen';
import { useIsSignedIn, useIsSignedOut } from '@/store/auth.context';
import TabNavigator from './tab-navigator';
import StackNavigator from './stack-navigator';

const RootStack = createNativeStackNavigator({
  screenOptions: { headerShown: false },
  screens: {
    TabNavigator: {
      if: useIsSignedIn,
      screen: TabNavigator,
      options: { headerShown: false },
    },
    Stacknavigator: {
      if: useIsSignedIn,
      screen: StackNavigator,
      options: { headerShown: false },
    },
    Login: {
      if: useIsSignedOut,
      screen: LoginScreen,
      options: { headerShown: false },
    },
  },
});

type RootNavigatorParamList = StaticParamList<typeof RootStack>;

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootNavigatorParamList {}
  }
}

const Navigation = createStaticNavigation(RootStack);
export default Navigation;
