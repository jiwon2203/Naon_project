package com.naon.domitory.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // /api/로 시작하는 모든 경로에 대해
                .allowedOrigins("*")   // 모든 오리진(출처)에서의 요청을 허용 (개발용)
                //.allowedOrigins("http://localhost:19006", "exp://...") // 실제 서비스에서는 특정 출처만 허용
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false);
    }
}