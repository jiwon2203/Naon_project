package com.naon_fe;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

import com.skt.Tmap.TMapCircle;
import com.skt.Tmap.TMapMarkerItem;
import com.skt.Tmap.TMapPoint;
import com.skt.Tmap.TMapView;

import android.graphics.Color;

import org.json.JSONArray;
import org.json.JSONObject;

public class TmapViewManager extends SimpleViewManager<TMapView> {
    public static final String REACT_CLASS = "TmapView";

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected TMapView createViewInstance(ThemedReactContext reactContext) {
        TMapView tMapView = new TMapView(reactContext);
        tMapView.setSKTMapApiKey("h5k25ptrbe2FnBx2jkZ6X3vL2P4awNcOy82REHUa"); // 메타데이터로 빼도 OK

        // ❷ HTTPS 강제 (안드9+ cleartext 이슈 회피) -> 이 코드 추가 후 괜찮아 진 것 같기도..?
        tMapView.setHttpsMode(true);

        tMapView.setZoomLevel(15);
        tMapView.setLanguage(TMapView.LANGUAGE_KOREAN);
        tMapView.setIconVisibility(true);      // 원래 true임

        return tMapView;    
    }

    @ReactProp(name = "config")
    public void setConfig(TMapView view, ReadableMap config) {
        if (config == null) return;

        try {
            // 중심 좌표
            double lat = config.hasKey("lat") ? config.getDouble("lat") : 0d;
            double lng = config.hasKey("lng") ? config.getDouble("lng") : 0d;
            view.setCenterPoint(lng, lat, true);

            // 초기화
            view.removeAllMarkerItem();
            view.removeAllTMapCircle();

            // 현재 위치 마커
            TMapPoint myPoint = new TMapPoint(lat, lng);
            TMapMarkerItem myMarker = new TMapMarkerItem();
            myMarker.setTMapPoint(myPoint);
            myMarker.setName("현재 위치");
            myMarker.setVisible(TMapMarkerItem.VISIBLE);
            view.addMarkerItem("me", myMarker);

            // 반경 원
            double radius = config.hasKey("radius") ? config.getDouble("radius") : 0d;
            if (radius > 0) {
                TMapCircle circle = new TMapCircle();
                circle.setCenterPoint(myPoint);
                circle.setRadius(radius);
                circle.setLineColor(Color.parseColor("#10b981"));
                circle.setAreaColor(Color.parseColor("#10b981"));
                circle.setAreaAlpha(50);
                view.addTMapCircle("range", circle);
            }

            // 마커들: 문자열(JSON) 또는 배열 모두 허용
            if (config.hasKey("markers")) {
                ReadableType type = config.getType("markers");
                if (type == ReadableType.String) {
                    JSONArray markersArr = new JSONArray(config.getString("markers"));
                    addMarkersFromJsonArray(view, markersArr);
                } else if (type == ReadableType.Array) {
                    ReadableArray arr = config.getArray("markers");
                    JSONArray markersArr = new JSONArray();
                    for (int i = 0; i < arr.size(); i++) {
                        ReadableMap m = arr.getMap(i);
                        JSONObject o = new JSONObject();
                        o.put("lat", m.hasKey("lat") ? m.getDouble("lat") : 0);
                        o.put("lng", m.hasKey("lng") ? m.getDouble("lng") : 0);
                        o.put("title", m.hasKey("title") ? m.getString("title") : "");
                        o.put("subtitle", m.hasKey("subtitle") ? m.getString("subtitle") : "");
                        markersArr.put(o);
                    }
                    addMarkersFromJsonArray(view, markersArr);
                }
            }

            // 레이아웃 적용 보장
            view.requestLayout();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // 누락됐던 헬퍼 메서드 (여기가 반드시 클래스 안에 있어야 함)
    private void addMarkersFromJsonArray(TMapView view, JSONArray markersArr) throws Exception {
        for (int i = 0; i < markersArr.length(); i++) {
            JSONObject o = markersArr.getJSONObject(i);
            if (!o.has("lat") || !o.has("lng")) continue;
            double mlat = o.getDouble("lat");
            double mlng = o.getDouble("lng");

            TMapMarkerItem item = new TMapMarkerItem();
            item.setTMapPoint(new TMapPoint(mlat, mlng));
            String title = o.optString("title");
            String subtitle = o.optString("subtitle");
            item.setName(title);
            item.setCalloutTitle(title);
            item.setCalloutSubTitle(subtitle);
            item.setVisible(TMapMarkerItem.VISIBLE);

            view.addMarkerItem("marker" + i, item);
        }
    }
}