import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
  useFonts,
} from '@expo-google-fonts/dm-sans';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { snaglyDark } from '@/constants/theme';
import { SnaglyProvider } from '@/lib/store';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="light" />
      <SnaglyProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: snaglyDark.colors.background },
            headerTintColor: snaglyDark.colors.text,
            headerTitleStyle: { fontFamily: 'DMSans_600SemiBold' },
            contentStyle: { backgroundColor: snaglyDark.colors.background },
            headerShadowVisible: false,
          }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="deal/[id]"
            options={{ title: 'Deal', presentation: 'card' }}
          />
          <Stack.Screen
            name="watch/new"
            options={{ title: 'New watch', presentation: 'modal' }}
          />
          <Stack.Screen
            name="watch/[id]"
            options={{ title: 'Edit watch', presentation: 'modal' }}
          />
        </Stack>
      </SnaglyProvider>
    </>
  );
}
