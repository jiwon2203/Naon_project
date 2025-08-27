// src/screens/auth/PwChangeScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import api from '../../api/api';

export default function PwChangeScreen() {
  const navigation = useNavigation();

  const [id, setId] = useState('');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [newPwConfirm, setNewPwConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    currentPw: '',
    newPw: '',
    newPwConfirm: '',
  });

  // ✅ 실시간 일치 안내 상태
  const [pwMatchMsg, setPwMatchMsg] = useState('');
  const [pwMatched, setPwMatched] = useState(false);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        setId(u.id || '');
      }
    })();
  }, []);

  // ✅ 입력 즉시: newPwConfirm에 글자가 들어오는 순간부터 일치/불일치 표시
  useEffect(() => {
    if (newPwConfirm.length === 0) {
      setPwMatchMsg('');
      setPwMatched(false);
      return;
    }
    if (newPw === newPwConfirm) {
      setPwMatchMsg('비밀번호가 일치합니다.');
      setPwMatched(true);
    } else {
      setPwMatchMsg('비밀번호가 일치하지 않습니다.');
      setPwMatched(false);
    }
  }, [newPw, newPwConfirm]);

  const onChangePw = async () => {
    setErrors({ currentPw: '', newPw: '', newPwConfirm: '' });

    let hasError = false;
    if (!currentPw) {
      hasError = true;
      setErrors(prev => ({ ...prev, currentPw: '현재 비밀번호를 입력하세요.' }));
    }
    if (!newPw) {
      hasError = true;
      setErrors(prev => ({ ...prev, newPw: '새 비밀번호를 입력하세요.' }));
    } else if (newPw.length < 8) {
      hasError = true;
      setErrors(prev => ({ ...prev, newPw: '새 비밀번호는 8자 이상이어야 합니다.' }));
    }
    if (!newPwConfirm) {
      hasError = true;
      setErrors(prev => ({ ...prev, newPwConfirm: '새 비밀번호 확인을 입력하세요.' }));
    } else if (newPw !== newPwConfirm) {
      hasError = true;
      setErrors(prev => ({ ...prev, newPwConfirm: '새 비밀번호 확인이 일치하지 않습니다.' }));
    }

    if (!id) {
      hasError = true;
      Alert.alert('오류', '로그인 정보가 없습니다.');
    }
    if (hasError) return;

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const body = { id: id.trim(), currentPw, newPw, newPwConfirm };
      await api.post('/auth/change-password', body, token ? {
        headers: { Authorization: `Bearer ${token}` },
      } : undefined);

      Alert.alert('완료', '비밀번호가 변경되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      const msg = e.response?.data?.message || e.response?.data?.error || e.message || '비밀번호 변경에 실패했습니다.';
      if (/현재 비밀번호/.test(msg)) {
        setErrors(prev => ({ ...prev, currentPw: msg }));
      } else if (/새 비밀번호 확인/.test(msg)) {
        setErrors(prev => ({ ...prev, newPwConfirm: msg }));
      } else if (/새 비밀번호/.test(msg)) {
        setErrors(prev => ({ ...prev, newPw: msg }));
      } else {
        Alert.alert('오류', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>비밀번호 변경</Text>

      {/* 현재 비밀번호 */}
      {!!errors.currentPw && <Text style={styles.error}>{errors.currentPw}</Text>}
      <View style={styles.field}>
        <Text style={styles.label}>현재 비밀번호</Text>
        <TextInput
          style={styles.input}
          value={currentPw}
          onChangeText={setCurrentPw}
          secureTextEntry
          placeholder="현재 비밀번호"
        />
      </View>

      {/* 새 비밀번호 */}
      {!!errors.newPw && <Text style={styles.error}>{errors.newPw}</Text>}
      <View style={styles.field}>
        <Text style={styles.label}>새 비밀번호</Text>
        <TextInput
          style={styles.input}
          value={newPw}
          onChangeText={setNewPw}
          secureTextEntry
          placeholder="새 비밀번호(8자 이상)"
        />
      </View>

      {/* 새 비밀번호 확인 */}
      {!!errors.newPwConfirm && <Text style={styles.error}>{errors.newPwConfirm}</Text>}
      <View style={styles.field}>
        <Text style={styles.label}>새 비밀번호 확인</Text>
        <TextInput
          style={styles.input}
          value={newPwConfirm}
          onChangeText={setNewPwConfirm}
          secureTextEntry
          placeholder="새 비밀번호 확인"
        />
      </View>

      {/* ✅ 즉시 일치 여부 안내 (newPwConfirm에 입력이 시작되면 바로 표기) */}
      {!!pwMatchMsg && (
        <Text style={[styles.helper, pwMatched ? styles.helperOk : styles.helperBad]}>
          {pwMatchMsg}
        </Text>
      )}

      <TouchableOpacity style={styles.saveBtn} onPress={onChangePw} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>변경</Text>}
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
  error:{ color: colors.danger, marginBottom: 8 },          // 에러는 항상 빨간색
  helper:{ marginTop: -6, marginBottom: 10, fontSize: typography.sizes.sm },
  helperOk:{ color: colors.success },                        // 일치 시 초록색
  helperBad:{ color: colors.danger },                        // 불일치 시 빨간색
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
