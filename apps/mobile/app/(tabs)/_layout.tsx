/* eslint-disable react-native/split-platform-components, react-native/no-raw-text */
import { DynamicColorIOS } from 'react-native';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function TabsLayout() {
  return (
    <NativeTabs
      labelStyle={{
        color: DynamicColorIOS({
          dark: 'white',
          light: 'black',
        }),
      }}
      tintColor={DynamicColorIOS({
        dark: 'white',
        light: 'black',
      })}
    >
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: 'house', selected: 'house.fill' }} />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="posts">
        <Icon sf={{ default: 'doc.text', selected: 'doc.text.fill' }} />
        <Label>Posts</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
