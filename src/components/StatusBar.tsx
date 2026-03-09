import { usePreferencesStore } from '@/store/preferences.store';
import { StatusBar as StatusBarExpo, StatusBarProps } from 'expo-status-bar';

export function StatusBar(props: StatusBarProps) {
  const colorSchemePreference = usePreferencesStore((s) => s.colorSchemePreference);
  const dinamicStyle = colorSchemePreference === 'light' ? 'dark' : 'light';
  const style = props?.style ?? dinamicStyle;

  return <StatusBarExpo style={style} {...props} />;
}
