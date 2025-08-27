// src/screens/account/ProfileEditScreen.js
import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import api from '../../api/api';

export default function ProfileEditScreen() {
  const navigation = useNavigation();
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  // 화면이 포커스될 때마다 저장된 유저 정보를 다시 로드
  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        try {
          const raw = await AsyncStorage.getItem('user');
          if (!mounted) return;
          if (raw) {
            const u = JSON.parse(raw);
            setId(u.id || '');
            setName(u.name || '');
            setEmail(u.email || '');
          } else {
            // 로그인 정보가 없으면 이전 화면으로
            Alert.alert('알림', '로그인 정보가 없습니다.');
            navigation.goBack();
          }
        } catch (e) {
          console.warn(e);
        }
      })();
      return () => { mounted = false; };
    }, [navigation])
  );

  const onSave = async () => {
    if (saving) return;

    // 간단 검증
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!id.trim()) return Alert.alert('오류', '로그인 정보가 없습니다.');
    if (!name.trim()) return Alert.alert('알림', '이름을 입력하세요.');
    if (!email.trim()) return Alert.alert('알림', '이메일을 입력하세요.');
    if (!emailRe.test(email.trim())) return Alert.alert('알림', '이메일 형식이 올바르지 않습니다.');

    setSaving(true);
    try {
      const payload = { id: id.trim(), name: name.trim(), email: email.trim() };
      const token = await AsyncStorage.getItem('token');

      // ✅ Axios 인스턴스 기본 사용 (헤더는 옵션)
      const res = await api.patch('/auth/profile', payload, token ? {
        headers: { Authorization: `Bearer ${token}` }
      } : undefined);

      const body = res?.data || {};
      const updatedUser = body.user ?? { id: payload.id, name: payload.name, email: payload.email };

      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      Alert.alert('완료', body.message || '프로필이 저장되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      const data = e.response?.data;
      const msg = data?.error || data?.message || e.message || '프로필 저장에 실패했습니다.';
      Alert.alert('오류', msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>프로필 변경</Text>

      <View style={styles.field}>
        <Text style={styles.label}>아이디</Text>
        <TextInput
          style={[styles.input, { backgroundColor: '#f5f5f5' }]}
          value={id}
          editable={false}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>이름</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="이름"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>이메일</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="이메일"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={onSave} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>저장</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelBtnText}>취소</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, padding:20, backgroundColor: colors.white },
  title:{
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: 16,
    color: colors.darkGray,
  },
  field:{ marginBottom: 14 },
  label:{ fontSize: typography.sizes.sm, color: colors.gray, marginBottom: 6 },
  input:{
    borderWidth:1,
    borderColor: colors.lightGray,
    borderRadius:8,
    padding:12,
    fontSize: typography.sizes.base,
    backgroundColor: colors.white,
  },
  saveBtn:{ backgroundColor: colors.primary, padding:14, borderRadius:10, alignItems:'center', marginTop:8 },
  saveBtnText:{ color: colors.white, fontSize: typography.sizes.base, fontWeight:'600' },
  cancelBtn:{ padding:12, alignItems:'center', marginTop:8 },
  cancelBtnText:{ color: colors.gray },
});
