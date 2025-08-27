package com.naon.home.util;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class HttpUtils {
    public static String simpleGet(String urlStr) throws Exception {
        HttpURLConnection conn = null;
        BufferedReader rd = null;
        try {
            URL url = new URL(urlStr);
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Content-type", "application/json");

            int code = conn.getResponseCode();
            rd = new BufferedReader(new InputStreamReader(
                    (code >= 200 && code < 300) ? conn.getInputStream() : conn.getErrorStream(),
                    "UTF-8"
            ));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = rd.readLine()) != null) sb.append(line);
            return sb.toString();
        } finally {
            if (rd != null) try { rd.close(); } catch (Exception ignored) {}
            if (conn != null) conn.disconnect();
        }
    }
}
