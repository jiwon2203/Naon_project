import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

export default function HelpScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>도움말</Text>

      <Text style={styles.sectionTitle}>자주 묻는 질문</Text>
      <View style={styles.card}>
        <Text style={styles.q}>Q. 위치 권한이 필요한가요?</Text>
        <Text style={styles.a}>
          A. 지도 및 길찾기 추천을 위해 필요합니다. 설정 &gt; 앱 &gt; 권한에서 변경할 수 있습니다.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.q}>Q. 로그인이 필요한가요?</Text>
        <Text style={styles.a}>
          A. 비회원도 이용 가능하지만, 찜/히스토리는 로그인 시 저장됩니다.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>고객센터</Text>
      <View style={styles.card}>
        <Text style={styles.a}>이메일: support@example.com</Text>
        <Text style={styles.a}>운영시간: 09:00 ~ 18:00 (평일)</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor: colors.white, padding:20 },
  title:{
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: 16,
    color: colors.darkGray,
  },
  sectionTitle:{
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 8,
    color: colors.darkGray,
  },
  card:{
    borderWidth:1,
    borderColor: colors.lightGray,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    backgroundColor: colors.white,
  },
  q:{ fontWeight: '700', marginBottom: 6, color: colors.darkGray },
  a:{ color: colors.gray, lineHeight: 20 },
});
