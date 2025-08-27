import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { useNavigation,CommonActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { SCREEN_NAMES } from '../../utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../api/api';

const ProfileDropdown = ({ visible, onClose, user, setUser }) => {
  const navigation = useNavigation();
  const isLoggedIn = !!user?.id;
  const authedMenuItems = [
    {
      id: 'profile_edit',
      title: '프로필 변경',
      icon: 'user-edit',
      onPress: () => {
        onClose();
        navigation.navigate(SCREEN_NAMES.PROFILE_EDIT);
      },
    },
    {
      id: 'password_change',
      title: '비밀번호 변경',
      icon: 'key',
      onPress: () => {
        onClose();
        navigation.navigate(SCREEN_NAMES.PASSWORD_CHANGE);
      },
    },
    {
      id: 'help',
      title: '도움말',
      icon: 'question-circle',
      onPress: () => {
        onClose();
        navigation.navigate(SCREEN_NAMES.HELP);
      },
    },
    {
      id: 'logout',
      title: '로그아웃',
      icon: 'sign-out-alt',
      color: colors.danger,
      onPress: () => {
        Alert.alert('로그아웃', '로그아웃 하시겠습니까?', [
          { text: '취소', style: 'cancel' },
          {
            text: '로그아웃',
            style: 'destructive',
            onPress: async () => {
              onClose();
              try {
                const token = await AsyncStorage.getItem('token');
                if (token) {
                  await api.post('/auth/logout', {}, { headers: { Authorization: `Bearer ${token}` } });
                  }
              } catch (e) {
                // 네트워크 문제여도 클라이언트 토큰만 지우면 사실상 로그아웃됨
              } finally {
                await AsyncStorage.multiRemove(['user', 'token']);
                setUser?.(null);
                delete api.defaults.headers.common.Authorization;
                navigation.getParent()?.dispatch(
                  CommonActions.reset({ index: 0, routes: [{ name: SCREEN_NAMES.LOGIN }] })
                );
              }
              
              
            },
          },
        ]);
      },
    },
  ];

  const guestMenuItems = [
    {
      id: 'login',
      title: '로그인',
      icon: 'sign-in-alt',
      onPress: () => {
        onClose();
        navigation.getParent()?.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: SCREEN_NAMES.LOGIN }],
          })
        );
      },
    },
    {
      id: 'join',
      title: '회원가입',
      icon: 'user-plus',
      onPress: () => {
        onClose();
        navigation.navigate(SCREEN_NAMES.JOIN);
      },
    },
    {
      id: 'help',
      title: '도움말',
      icon: 'question-circle',
      onPress: () => {
        onClose();
        navigation.navigate(SCREEN_NAMES.HELP);
      },
    },
  ];
  const menuItems = isLoggedIn ? authedMenuItems : guestMenuItems;

  return (
    <Modal
      visible={visible}
      transparent animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} onPress={onClose}  activeOpacity={1}>
        <View style={styles.dropdown}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.profileInfo}>
              <View style={styles.avatar}>
                {isLoggedIn ? (
                  <Text style={styles.avatarText}>
                    {(user?.name?.charAt(0) || user?.id?.charAt(0) || '?').toUpperCase()}
                  </Text>
                ) : (
                  <Icon name="user" size={18} color={colors.white} />
                )}
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {isLoggedIn ? (user?.name || '사용자') : '로그인이 필요합니다'}
                </Text>
                {isLoggedIn ? (
                  <Text style={styles.userEmail}>{user?.email || ''}</Text>
                ) : (
                  <Text style={styles.userEmail}>계정이 없으시다면 회원가입을 진행하세요</Text>
                )}
              </View>
            </View>
            {!!user?.id && <Text style={styles.userId}>ID: {user.id}</Text>}
          </View>

          {/* Menu Items */}
          <View style={styles.menu}>
            {menuItems.map((item) => (
              <TouchableOpacity key={item.id}
                style={styles.menuItem}
                onPress={item.onPress}
                activeOpacity={0.8}
              >
                <Icon name={item.icon} size={16} color={item.color || colors.gray} />
                <Text style={[styles.menuText, item.color && { color: item.color }]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 16,
  },
  dropdown: {
    width: 280,
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 10,
  },
  profileHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: colors.white,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.darkGray,
  },
  userEmail: {
    fontSize: typography.sizes.sm,
    color: colors.gray,
    marginTop: 2,
  },
  userId: {
    fontSize: typography.sizes.xs,
    color: colors.gray,
  },
  menu: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  menuText: {
    fontSize: typography.sizes.base,
    color: colors.darkGray,
    marginLeft: 12,
  },
});

export default ProfileDropdown;