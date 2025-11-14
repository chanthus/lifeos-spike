'use client';

import { useServerInsertedHTML } from 'next/navigation';
import { StyleSheet } from 'react-native';

// Create a StyleRegistry component that handles SSR for React Native Web
export default function StyleRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  useServerInsertedHTML(() => {
    // @ts-expect-error - React Native Web specific API
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const sheet = StyleSheet.getSheet();

    if (!sheet) return null;

    return (
      <style
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        dangerouslySetInnerHTML={{ __html: sheet.textContent }}
        id="react-native-stylesheet-ssr"
      />
    );
  });

  return <>{children}</>;
}
