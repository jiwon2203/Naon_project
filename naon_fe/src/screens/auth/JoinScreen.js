// src/screens/auth/JoinScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { SCREEN_NAMES } from '../../utils/constants';
import Icon from 'react-native-vector-icons/FontAwesome5';
import api from '../../api/api';

export default function JoinScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [email, setEmail] = useState('');

  const [loading, setLoading] = useState(false);
  
  // 아이디 중복 체크 상태
  const [idChecking, setIdChecking] = useState(false);
  const [idChecked, setIdChecked] = useState(false);
  const [idAvailable, setIdAvailable] = useState(false);
  
  const [errors, setErrors] = useState({
    name: '',
    id: '',
    pw: '',
    pwConfirm: '',
    email: '',
  });
  const [pwMatchMsg, setPwMatchMsg] = useState(''); // 안내문
  const [pwMatched, setPwMatched] = useState(false); // true/false 색상 구분

  // 아이디가 바뀌면 중복체크 초기화
  useEffect(() => {
    setIdChecked(false);
    setIdAvailable(false);
    setErrors(prev => ({ ...prev, id: '' })); // 입력 바뀌면 아이디 에러도 초기화
  }, [id]);

  useEffect(() => {
    if (!pw && !pwConfirm) {
      setPwMatchMsg('');
      setPwMatched(false);
      return;
    }
    if (pw && pwConfirm) {
      if (pw === pwConfirm) {
        setPwMatchMsg('비밀번호가 일치합니다.');
        setPwMatched(true);
      } else {
        setPwMatchMsg('비밀번호가 일치하지 않습니다.');
        setPwMatched(false);
      }
    } else {
      // 하나만 입력된 상태
      setPwMatchMsg('');
      setPwMatched(false);
    }
  }, [pw, pwConfirm]);
  
  const onCheckId = async () => {
    setErrors(prev => ({ ...prev, id: '' }));
    const trimmed = id.trim();
    if (!trimmed) {
      setErrors(prev => ({ ...prev, id: '아이디를 입력하세요.' }));
      return;
    }
    setIdChecking(true);
    try {
      const res = await api.get('/auth/check-id', { params: { id: trimmed } });
      setIdChecked(true);
      setIdAvailable(Boolean(res.data?.available));
      if (!res.data?.available) {
        setErrors(prev => ({ ...prev, id: res.data?.message || '이미 사용 중인 아이디입니다.' }));
      }
    } catch (e) {
      setErrors(prev => ({ ...prev, id: e.response?.data?.message || e.message || '아이디 중복 확인 실패' }));
    } finally {
      setIdChecking(false);
    }
  };

  const onJoin = async () => {
    setErrors({ name: '', id: '', pw: '', pwConfirm: '', email: '' });
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let hasError = false;

    if (!name.trim()) {
      hasError = true;
      setErrors(prev => ({ ...prev, name: '이름을 입력하세요.' }));
    }
    if (!id.trim()) {
      hasError = true;
      setErrors(prev => ({ ...prev, id: '아이디를 입력하세요.' }));
    }
    if (!pw) {
      hasError = true;
      setErrors(prev => ({ ...prev, pw: '비밀번호를 입력하세요.' }));
    }
    if (!pwConfirm) {
      hasError = true;
      setErrors(prev => ({ ...prev, pwConfirm: '비밀번호 확인을 입력하세요.' }));
    }
    if (pw && pwConfirm && pw !== pwConfirm) {
      hasError = true;
      setErrors(prev => ({ ...prev, pwConfirm: '비밀번호가 일치하지 않습니다.' }));
    }
    if (!email.trim()) {
      hasError = true;
      setErrors(prev => ({ ...prev, email: '이메일을 입력하세요.' }));
    } else if (!emailRe.test(email.trim())) {
      hasError = true;
      setErrors(prev => ({ ...prev, email: '이메일 형식이 올바르지 않습니다.' }));
    }
    if (!idChecked || !idAvailable) {
      hasError = true;
      setErrors(prev => ({ ...prev, id: prev.id || '아이디 중복 확인을 완료하세요.' }));
    }

    if (hasError) return;

    setLoading(true);
    try {
      const body = {
        id: id.trim(),
        pw,
        pwConfirm,
        name: name.trim(),
        email: email.trim(),
      };
      const res = await api.post('/auth/join', body);
      console.log('회원가입 성공:', res.data);

      // 완료 후 로그인 화면으로 이동
      navigation.reset({ index: 0, routes: [{ name: SCREEN_NAMES.LOGIN }] });
    } catch (e) {
      const msg = e.response?.data?.error || e.response?.data?.message || e.message || '회원가입에 실패했습니다.';
      if (/아이디/.test(msg)) {
        setErrors(prev => ({ ...prev, id: msg }));
      } else if (/비밀번호/.test(msg)) {
        setErrors(prev => ({ ...prev, pwConfirm: msg }));
      } else if (/이메일/.test(msg)) {
        setErrors(prev => ({ ...prev, email: msg }));
      } else {
        setErrors(prev => ({ ...prev, id: prev.id || msg }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.container}
    >
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={24} color={colors.darkGray} />
      </TouchableOpacity>

      <Text style={styles.title}>회원가입</Text>

      {!!errors.name && <Text style={styles.error}>{errors.name}</Text>}
      <View style={styles.field}>
        <Text style={styles.label}>이름</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="이름 입력" />
      </View>

      {!!errors.id && <Text style={styles.error}>{errors.id}</Text>} 
      <View style={styles.fieldRow}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.label}>아이디</Text>
          <TextInput
            style={styles.input}
            value={id}
            onChangeText={setId}
            placeholder="아이디 입력"
            autoCapitalize="none"
          />
        </View>
        <TouchableOpacity style={styles.checkBtn} onPress={onCheckId} disabled={idChecking}>
          {idChecking ? <ActivityIndicator color="#fff" /> : <Text style={styles.checkBtnText}>중복 확인</Text>}
        </TouchableOpacity>
      </View>
      {idChecked && (
        <Text style={{ color: idAvailable ? colors.success : colors.danger, marginBottom: 6 }}>
          {idAvailable ? '사용 가능한 아이디입니다.' : '이미 사용 중인 아이디입니다.'}
        </Text>
      )}
      {!!errors.pw && <Text style={styles.error}>{errors.pw}</Text>}
      <View style={styles.field}>
        <Text style={styles.label}>비밀번호</Text>
        <TextInput
          style={styles.input}
          value={pw}
          onChangeText={setPw}
          placeholder="비밀번호"
          secureTextEntry
        />
      </View>

      {!!errors.pwConfirm && <Text style={styles.error}>{errors.pwConfirm}</Text>}
      <View style={styles.field}>
        <Text style={styles.label}>비밀번호 확인</Text>
        <TextInput
          style={styles.input}
          value={pwConfirm}
          onChangeText={setPwConfirm}
          placeholder="비밀번호 확인"
          secureTextEntry
        />
      </View>
      {!!pwMatchMsg && (
        <Text style={[styles.helper, pwMatched ? styles.helperOk : styles.helperBad]}>
          {pwMatchMsg}
        </Text>
      )}

      {!!errors.email && <Text style={styles.error}>{errors.email}</Text>}
      <View style={styles.field}>
        <Text style={styles.label}>이메일</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="example@domain.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <TouchableOpacity style={styles.primaryBtn} onPress={onJoin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>회원가입</Text>}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.white, justifyContent: 'center' },
  backButton: { position: 'absolute', top: 20, left: 20, zIndex: 1 },
  title: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, marginBottom: 24, color: colors.darkGray },
  error: { color: colors.danger, marginBottom: 6 },
  helper: { marginTop: -6, marginBottom: 10, fontSize: typography.sizes.sm },
  helperOk: { color: colors.success },
  helperBad: { color: colors.danger },
  field: { marginBottom: 14 },
  fieldRow: { marginBottom: 14, flexDirection: 'row', alignItems: 'flex-end' },
  label: { fontSize: typography.sizes.sm, color: colors.gray, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: colors.lightGray, borderRadius: 8,
    padding: 12, fontSize: typography.sizes.base, backgroundColor: colors.white,
  },
  checkBtn: {
    backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 14,
    borderRadius: 8, alignItems: 'center', justifyContent: 'center',
  },
  checkBtnText: { color: colors.white, fontWeight: '600' },
  primaryBtn: { backgroundColor: colors.primary, padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  primaryBtnText: { color: colors.white, fontSize: typography.sizes.base, fontWeight: '600' },
});
