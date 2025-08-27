package com.naon_fe;

import android.app.Activity;
import android.content.Intent;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import org.json.JSONArray;
import org.json.JSONObject;

public class TmapModule extends ReactContextBaseJavaModule {
    public TmapModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "TmapModule";
    }

    // 좌표 없는 기본 열기
    @ReactMethod
    public void openTmap() {
        Activity activity = getCurrentActivity();

        if (activity == null) {
            return;
        }

        Intent intent = new Intent(activity, TmapActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        activity.startActivity(intent);
    }

    // 좌표를 넘겨서 열기
    @ReactMethod
    public void openTmapWithLocation(double latitude, double longitude) {
        Activity activity = getCurrentActivity();

        if (activity == null) {
            return;
        }

        Intent intent = new Intent(activity, TmapActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        intent.putExtra("lat", latitude);
        intent.putExtra("lng", longitude);
        activity.startActivity(intent);
    }

    // 좌표 + 반경 + 마커 배열(JSON string) 넘기기
    @ReactMethod
    public void openTmapWithLocationAndMarkers(String payloadJson) {
        Activity activity = getCurrentActivity();

        if (activity == null) {
            return;
        }

        try {
            JSONObject obj = new JSONObject(payloadJson);
            JSONObject center = obj.getJSONObject("center");
            double lat = center.getDouble("lat");
            double lng = center.getDouble("lng");
            int radius = obj.optInt("radius", 300);
            JSONArray markers = obj.optJSONArray("markers");
            String markersJson = (markers != null) ? markers.toString() : "[]";

            Intent intent = new Intent(activity, TmapActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            intent.putExtra("lat", lat);
            intent.putExtra("lng", lng);
            intent.putExtra("radius", radius);
            intent.putExtra("markers", markersJson);
            activity.startActivity(intent);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}