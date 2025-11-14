import { Platform, View, type ViewProps } from 'react-native';

type NativeOnlyAnimatedViewProps = ViewProps & {
  entering?: unknown;
  exiting?: unknown;
};

/**
 * This component is used to wrap views that should only be animated on native.
 * On web, it renders a plain View and ignores animation props.
 * @param props - The props for the view.
 * @returns A plain View component (animations handled by CSS on web)
 * @example
 * <NativeOnlyAnimatedView entering={FadeIn} exiting={FadeOut}>
 *   <Text>I am only animated on native</Text>
 * </NativeOnlyAnimatedView>
 */
function NativeOnlyAnimatedView({
  entering: _entering,
  exiting: _exiting,
  ...props
}: NativeOnlyAnimatedViewProps) {
  if (Platform.OS === 'web') {
    // On web, just render children directly without wrapper
    return <>{props.children}</>;
  }
  // On native, use a View (animations would be handled by reanimated on native if needed)
  return <View {...props} />;
}

export { NativeOnlyAnimatedView };
