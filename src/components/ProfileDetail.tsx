import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { Profile, ProfileProps } from './Profile';
import { Button } from './buttons/Button';

export interface ProfileDetailProps extends ProfileProps {
  onEditPress?: () => void;
  buttonContainerStyle?: ViewProps['style'];
}

export function ProfileDetail({
  onEditPress,
  buttonContainerStyle,
  ...profileProps
}: ProfileDetailProps) {
  return (
    <View style={styles.container}>
      <Profile {...profileProps} />
      {onEditPress != null && (
        <View style={[styles.buttonWrap, buttonContainerStyle]}>
          <Button title="Edit Profile" variant="outline" onPress={onEditPress} />
        </View>
      )}
    </View>
  );
}

ProfileDetail.displayName = 'ProfileDetail';

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  buttonWrap: {
    paddingTop: 8,
  },
});
