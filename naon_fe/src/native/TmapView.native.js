import {requireNativeComponent} from 'react-native';

// 전역 가드: Fast Refresh/중복 import에도 한 번만 등록
const TmapView =
  global.__TmapView__ || (global.__TmapView__ = requireNativeComponent('TmapView'));

export default TmapView;