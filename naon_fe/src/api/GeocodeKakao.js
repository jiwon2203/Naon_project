import axios from 'axios';

const KAKAO_API_KEY = '14724a08554c6aa06ce61a4382bb100b'
export async function GeocodeKakao(lat, lon) {
  try {
    const res = await axios.get('https://dapi.kakao.com/v2/local/geo/coord2address.json', {
      params: { x: lon, y: lat,},
      headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}`,},
      timeout: 5000,
    });

    const docs = res.data.documents;
    if (!docs || docs.length === 0) {
      return { compact: '주소 미확인', full: '' };
    }

    const addr = docs[0].address || docs[0].road_address;
    if (!addr) {
      return { compact: '주소 없음', full: '' };
    }

    const compact = [addr.region_2depth_name, addr.region_3depth_name]
      .filter(Boolean)
      .join(' ');
    const full = addr.address_name;

    return { compact: compact || '주소 없음', full };
  } catch (err) {
    console.warn('GeocodeKakao error:', err?.response?.status || '', err?.message || err);
    return { compact: '위치 확인 불가', full: '' };
  }
}

