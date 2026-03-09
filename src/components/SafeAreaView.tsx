import {
  SafeAreaViewProps,
  SafeAreaView as SafeAreaViewExpo,
} from 'react-native-safe-area-context';

export function SafeAreaView(props: SafeAreaViewProps) {
  return <SafeAreaViewExpo {...props}>{props.children}</SafeAreaViewExpo>;
}
