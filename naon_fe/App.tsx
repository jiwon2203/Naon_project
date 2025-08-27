/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { NavigationContainer, RouteProp, NavigatorScreenParams } from '@react-navigation/native';
import { createBottomTabNavigator, BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { createStackNavigator, StackCardStyleInterpolator, StackScreenProps } from '@react-navigation/stack';
import { StatusBar, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';
import SearchScreen from './src/screens/SearchScreen';
import AccommodationScreen from './src/screens/AccommodationScreen';
import NavigationScreen from './src/screens/NavigationScreen';
import ArrivalScreen from './src/screens/ArrivalScreen';

// Recommendation Screens
import WalkingRoutesScreen from './src/screens/recommendation/WalkingRoutesScreen';
import AttractionsScreen from './src/screens/recommendation/AttractionScreen';
import PhotoSpotsScreen from './src/screens/recommendation/PhotoSpotsScreen';

// Auth / Dropdown target screens
import LoginScreen from './src/screens/auth/LoginScreen';
import ProfileEditScreen from './src/screens/auth/ProfileEditScreen';
import PasswordChangeScreen from './src/screens/auth/PwChangeScreen';
import HelpScreen from './src/screens/auth/HelpScreen';
import JoinScreen from './src/screens/auth/JoinScreen';

// Components
import EmergencyButton from './src/components/common/EmergencyButton';

// Styles & Constants
import { colors } from './src/styles/colors';
import { typography } from './src/styles/typography';
import { SCREEN_NAMES, TAB_LABELS } from './src/utils/constants';

// --- 타입 정의 시작 ---

// 각 내비게이터의 화면 리스트와 파라미터 타입을 정의합니다.
// 파라미터가 없는 경우 'undefined'를 사용합니다.
// 예: 특정 장소 ID를 전달해야 한다면 `Attractions: { placeId: string }` 와 같이 정의할 수 있습니다.

type HomeStackParamList = {
  HomeMain: undefined;
  [SCREEN_NAMES.WALKING_ROUTES]: undefined;
  [SCREEN_NAMES.ATTRACTIONS]: undefined;
  [SCREEN_NAMES.PHOTO_SPOTS]: undefined;
};

type MainTabParamList = {
  [SCREEN_NAMES.HOME]: NavigatorScreenParams<HomeStackParamList>; // 중첩된 스택 내비게이터
  [SCREEN_NAMES.MAP]: undefined;
  [SCREEN_NAMES.SEARCH]: undefined;
  [SCREEN_NAMES.ACCOMMODATION]: undefined;
};

type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>; // 중첩된 탭 내비게이터
  [SCREEN_NAMES.NAVIGATION]: undefined;
  Arrival: undefined;

  // Home 드롭다운에서 이동하는 화면들
  [SCREEN_NAMES.LOGIN]: undefined;
  [SCREEN_NAMES.PROFILE_EDIT]: undefined;
  [SCREEN_NAMES.PASSWORD_CHANGE]: undefined;
  [SCREEN_NAMES.HELP]: undefined;
  [SCREEN_NAMES.JOIN]: undefined;
};

// --- 타입 정의 끝 ---

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

// 화면 전환 애니메이션을 위한 함수 타입 명시
const forHorizontalModal: StackCardStyleInterpolator = ({ current, layouts }) => {
  return {
    cardStyle: {
      transform: [
        {
          translateX: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [layouts.screen.width, 0],
          }),
        },
      ],
    },
  };
};

const forVerticalModal: StackCardStyleInterpolator = ({ current, layouts }) => {
  return {
    cardStyle: {
      transform: [
        {
          translateY: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [layouts.screen.height, 0],
          }),
        },
      ],
    },
    overlayStyle: {
      opacity: current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.5],
      }),
    },
  };
};


// Home Stack Navigator
const HomeStack = (): React.JSX.Element => (
  // HomeStack은 RootStack에 속해 있으므로 RootStack의 Stack 네비게이터를 사용합니다.
  <Stack.Navigator 
    screenOptions={{ 
      headerShown: false,
      cardStyleInterpolator: forHorizontalModal,
    }}
  >
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name={SCREEN_NAMES.WALKING_ROUTES} component={WalkingRoutesScreen} />
    <Stack.Screen name={SCREEN_NAMES.ATTRACTIONS} component={AttractionsScreen} />
    <Stack.Screen name={SCREEN_NAMES.PHOTO_SPOTS} component={PhotoSpotsScreen} />
  </Stack.Navigator>
);

// Main Tab Navigator
const MainTabs = (): React.JSX.Element => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: string;
        
        switch (route.name) {
          case SCREEN_NAMES.HOME:
            iconName = 'home';
            break;
          case SCREEN_NAMES.MAP:
            iconName = 'map';
            break;
          case SCREEN_NAMES.SEARCH:
            iconName = 'search';
            break;
          case SCREEN_NAMES.ACCOMMODATION:
            iconName = 'bed';
            break;
          default:
            iconName = 'home';
        }
        
        return (
          <Icon 
            name={iconName} 
            size={size} 
            color={color} 
            solid={focused} 
          />
        );
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.gray,
      tabBarStyle: styles.tabBar,
      tabBarLabelStyle: styles.tabBarLabel,
      headerShown: false,
      tabBarHideOnKeyboard: true,
    })}
  >
    <Tab.Screen 
      name={SCREEN_NAMES.HOME} 
      component={HomeStack}
      options={{ tabBarLabel: TAB_LABELS.HOME }}
    />
    <Tab.Screen 
      name={SCREEN_NAMES.MAP} 
      component={MapScreen}
      options={{ tabBarLabel: TAB_LABELS.MAP }}
    />
    <Tab.Screen 
      name={SCREEN_NAMES.SEARCH} 
      component={SearchScreen}
      options={{ tabBarLabel: TAB_LABELS.SEARCH }}
    />
    <Tab.Screen 
      name={SCREEN_NAMES.ACCOMMODATION} 
      component={AccommodationScreen}
      options={{ tabBarLabel: TAB_LABELS.ACCOMMODATION }}
    />
  </Tab.Navigator>
);

// Root Stack Navigator
const RootStack = (): React.JSX.Element => (
  <Stack.Navigator 
    screenOptions={{ 
      headerShown: false,
      presentation: 'modal',
      cardStyleInterpolator: forVerticalModal,
    }}
  >
    <Stack.Screen 
      name="MainTabs" 
      component={MainTabs}
      options={{ presentation: 'card' }}
    />
    <Stack.Screen 
      name={SCREEN_NAMES.NAVIGATION} 
      component={NavigationScreen}
      options={{ 
        presentation: 'modal',
        gestureEnabled: false,
      }}
    />
    <Stack.Screen 
      name="Arrival" 
      component={ArrivalScreen}
      options={{ 
        presentation: 'modal',
        gestureEnabled: false,
      }}
    />
    {/* 드롭다운 타겟 페이지 */}
    <Stack.Screen name={SCREEN_NAMES.LOGIN} component={LoginScreen} />
    <Stack.Screen name={SCREEN_NAMES.PROFILE_EDIT} component={ProfileEditScreen} />
    <Stack.Screen name={SCREEN_NAMES.PASSWORD_CHANGE} component={PasswordChangeScreen} />
    <Stack.Screen name={SCREEN_NAMES.HELP} component={HelpScreen} />
    <Stack.Screen name={SCREEN_NAMES.JOIN} component={JoinScreen} />
  </Stack.Navigator>
);

export default function App(): React.JSX.Element {
  return (
    <>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={colors.black} 
        translucent={false}
      />
      <NavigationContainer>
        <RootStack />
        <EmergencyButton />
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 83,
    paddingBottom: 20,
    paddingTop: 8,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  tabBarLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: '500', // or 'bold', or a number between '100' and '900'
    marginTop: 4,
  },
});

