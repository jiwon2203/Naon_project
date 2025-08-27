// 좌표 받아서 지도에 마커 표시하는것과 관련된 코드
package com.naon_fe;

import android.graphics.Color;
import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;

import com.skt.Tmap.TMapView;
import com.skt.Tmap.TMapPoint;
import com.skt.Tmap.TMapMarkerItem;
import com.skt.Tmap.TMapCircle;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

// 마커 이미지
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.TypedValue;

public class TmapActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 기본 경로 셋팅?인것 같음
        double lat = getIntent().getDoubleExtra("lat", 37.570028);
        double lng = getIntent().getDoubleExtra("lng", 126.986072);
        int radius = getIntent().getIntExtra("radius", 300);
        String markersJson = getIntent().getStringExtra("markers");

        TMapView tMapView = new TMapView(this);
        // 앱용 AppKey는 Manifest meta-data에 넣었어도 set 해주는 편이 확실
        //tMapView.setSKTMapApiKey(getString(R.string.tmap_app_key)); // strings.xml로 분리 권장
        // 또는 하드코딩:
        tMapView.setSKTMapApiKey("h5k25ptrbe2FnBx2jkZ6X3vL2P4awNcOy82REHUa");

        tMapView.setZoomLevel(15);
        tMapView.setIconVisibility(true);            // 현재위치 아이콘 표시
        tMapView.setLanguage(TMapView.LANGUAGE_KOREAN);
        // 중심/마커 좌표 (주의: setCenterPoint는 (lon, lat) 순서)
        tMapView.setCenterPoint(lng, lat, true);

        // 마커 추가
        TMapPoint myPoint = new TMapPoint(lat, lng);
        TMapMarkerItem myMarker = new TMapMarkerItem();
        myMarker.setTMapPoint(myPoint);
        myMarker.setName("현재 위치");
        myMarker.setVisible(TMapMarkerItem.VISIBLE);
        tMapView.addMarkerItem("me", myMarker);

        // 반경 원 추가
        TMapCircle circle = new TMapCircle();
        circle.setCenterPoint(myPoint);
        circle.setRadius(radius);
        circle.setLineColor(Color.parseColor("#10b981"));
        //circle.setLineWidth(3.0f);
        circle.setAreaColor(Color.parseColor("#10b981"));
        circle.setAreaAlpha(50);
        tMapView.addTMapCircle("range", circle);

        // 전달받은 마커들 추가
        if (markersJson != null) {
            try {
                JSONArray arr = new JSONArray(markersJson);
                for (int i = 0; i < arr.length(); i++) {
                    JSONObject o = arr.getJSONObject(i);
                    double mlat = o.getDouble("lat");
                    double mlng = o.getDouble("lng");
                    String title = o.optString("title", "지점");
                    String subtitle = o.optString("subtitle", "");
                    String kind = o.optString("kind", "");

                    TMapMarkerItem item = new TMapMarkerItem();
                    item.setTMapPoint(new TMapPoint(mlat, mlng));
                    item.setName(title);
                    item.setVisible(TMapMarkerItem.VISIBLE);
                    item.setCalloutTitle(title);
                    item.setCalloutSubTitle(subtitle);

                    // TODO: kind 값에 따라 아이콘 바꾸고 싶으면 여기서 setIcon() 하면 됨
                    // 원하는 크기: 48dp → 현재 화면 밀도 기준 px
//                    int sizePx = (int) TypedValue.applyDimension(
//                            TypedValue.COMPLEX_UNIT_DIP, 32, getResources().getDisplayMetrics());
//
//                    Bitmap icon = BitmapFactory.decodeResource(getResources(), R.drawable.green_pin);
//                    Bitmap resizedIcon = Bitmap.createScaledBitmap(icon, sizePx, sizePx, true);
//                    item.setIcon(resizedIcon);

                    tMapView.addMarkerItem("m" + i, item);
                }
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

        setContentView(tMapView);
    }
}