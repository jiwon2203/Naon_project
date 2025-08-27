package com.naon.home.controller;

import com.naon.home.dto.JoinDTO;
import com.naon.home.dto.LoginDTO;
import com.naon.home.dto.ProfileDTO;
import com.naon.home.dto.PwUpdateDTO;
import com.naon.home.service.LoginService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class LoginController {

    private final LoginService loginService;

    /** 로그인 */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody @Valid LoginDTO req) {
        Map<String, Object> user = loginService.login(req);
        String accessToken = UUID.randomUUID().toString();

        return ResponseEntity.ok(Map.of(
                "success", true,
                "user", user,
                "accessToken", accessToken
        ));
    }
    /** 로그아웃 */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        // JWT를 도입하면 여기서 블랙리스트에 추가하거나 서버 세션 무효화 처리
        return ResponseEntity.ok(Map.of("message", "로그아웃되었습니다."));
    }

    /*아이디 중복 체크*/
    @GetMapping("/check-id")
    public ResponseEntity<Map<String, Object>> checkId(@RequestParam("id") String id) {
        boolean available = loginService.isIdAvailable(id);
        return ResponseEntity.ok(Map.of(
                "available", available,
                "message", available ? "사용 가능한 아이디입니다." : "이미 사용 중인 아이디입니다."
        ));
    }
    /** 회원가입 */
    @PostMapping("/join")
    public ResponseEntity<Map<String, Object>> join(@RequestBody @Valid JoinDTO req) {
        int mno = loginService.join(req);
        return ResponseEntity.ok(Map.of("mno", mno, "message", "회원가입 완료"));
    }

    /** 비밀번호 변경 */
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(@RequestBody @Valid PwUpdateDTO req) {
        loginService.changePassword(req);
        return ResponseEntity.ok(Map.of("message", "비밀번호가 변경되었습니다."));
    }

    /** 프로필 변경 (닉네임/아이디/이메일) */
    @PatchMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(@RequestBody @Valid ProfileDTO req) {
        Map<String, Object> result = loginService.updateProfile(req);
        return ResponseEntity.ok(Map.of(
                        "user", result,
                        "message", "프로필이 변경되었습니다."
        ));
    }
}

