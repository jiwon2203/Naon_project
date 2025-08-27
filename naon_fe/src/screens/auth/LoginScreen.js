import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView,
   Platform, ActivityIndicator, Alert } from 'react-native';
import { useNavigation,CommonActions } from '@react-navigation/native';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { SCREEN_NAMES } from '../../utils/constants';
import Icon from 'react-native-vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../api/api';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  
  const goToHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      })
    );
  };

  const onLogin = async () => {
    setErr('');
    if (!id.trim() || !pw.trim()) {
      setErr('아이디와 비밀번호를 입력하세요.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { id: id.trim(), pw: pw.trim() });
      const { user, accessToken } = res.data || {};
      // 토큰 저장
      if (accessToken){
        await AsyncStorage.setItem('token', accessToken);
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      }
      // 사용자 정보 저장
      if (user) {
        await AsyncStorage.setItem('user', JSON.stringify(user));
      }
      goToHome();
    } catch (e) {
      const status = e.response?.status;
      const data = e.response?.data;
      const msg = data?.error || data?.message || e.message || '아이디 또는 비밀번호를 확인하세요.'; 
    // 인증 실패 추정(400/401 등) → 경고창
    if (status === 400 || status === 401) {
      Alert.alert('로그인 실패', msg, [{ text: '확인' }]);
    } else {
      Alert.alert('오류', msg, [{ text: '확인' }]);
    }
    setPw('');     // 보안상 비밀번호는 비워주는 걸 권장
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.container}
    >
      <TouchableOpacity style={styles.backButton}
        onPress={() =>
          navigation.reset({
            index:0,
            routes: [
              {
                name: 'MainTabs',
                params: {
                  screens: SCREEN_NAMES.HOME,
                  params: {screens: 'HomeMain'},
                },
              },
            ],
          })
        }
      >
        <Icon name="arrow-left" size={24} color={colors.darkGray} />
      </TouchableOpacity>
      <View>
        <Text style={styles.title}>로그인</Text>
        {!!err && <Text style={styles.error}>{err}</Text>}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>아이디</Text>
        <TextInput
          style={styles.input}
          value={id}
          onChangeText={setId}
          placeholder="아이디 입력"
          autoCapitalize="none"
          returnKeyType="next"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>비밀번호</Text>
        <TextInput
          style={styles.input}
          value={pw}
          onChangeText={setPw}
          placeholder="비밀번호"
          secureTextEntry
          returnKeyType="done"
          onSubmitEditing={onLogin}
        />
      </View>

      <TouchableOpacity style={styles.primaryBtn} onPress={onLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.primaryBtnText}>로그인</Text>
        )}
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => navigation.navigate(SCREEN_NAMES.HELP)}>
          <Text style={styles.link}>도움말</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity onPress={() => navigation.navigate(SCREEN_NAMES.JOIN)}>
          <Text style={styles.link}>회원가입</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.white, justifyContent: 'center' },
  backButton: {
    position: 'absolute', top: 20, left: 20, zIndex: 1,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: 24,
    color: colors.darkGray,
  },
  error: { color: colors.danger, marginBottom: 8 },
  field: { marginBottom: 14 },
  label: { fontSize: typography.sizes.sm, color: colors.gray, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: typography.sizes.base,
    backgroundColor: colors.white,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnText: { color: colors.white, fontSize: typography.sizes.base, fontWeight: '600' },
  actions: { marginTop: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row',},
  separator: {
    width: 1, height: 12, backgroundColor: '#D9D9D9', marginHorizontal: 15,
  },
  link: { color: colors.primary, fontSize: typography.sizes.sm },
});
