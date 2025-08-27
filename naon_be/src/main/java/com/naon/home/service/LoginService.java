package com.naon.home.service;

import com.naon.home.dto.JoinDTO;
import com.naon.home.dto.LoginDTO;
import com.naon.home.dto.ProfileDTO;
import com.naon.home.dto.PwUpdateDTO;
import com.naon.home.entity.Member;
import com.naon.home.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LoginService {

    private final MemberRepository memberRepository;
    private final BCryptPasswordEncoder encoder;

    /** 로그인: id(mid)로 회원 조회 후 패스워드 검증 */
    public Map<String, Object> login(LoginDTO req) {
        Member member = memberRepository.findByMid(req.getId())
                .orElseThrow(() -> new IllegalArgumentException("아이디가 존재하지 않습니다."));
        if (!encoder.matches(req.getPw(), member.getMpw())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }
        return Map.of(
                "uno", member.getMno(),
                "id", member.getMid(),
                "name", member.getMname()
        );
    }

    @Transactional(readOnly = true)
    public boolean isIdAvailable(String id) {
        if (id == null || id.isBlank()) return false;
        return !memberRepository.existsByMid(id.trim());
    }

    /** 회원가입 (아이디 비밀번호 중복 체크 포함) */
    @Transactional
    public int join(JoinDTO dto) {
        final String id = dto.getId().trim();

        if (!isIdAvailable(id)) {
            throw new IllegalStateException("이미 존재하는 아이디입니다.");
        }
        if (!dto.getPw().equals(dto.getPwConfirm())) {
            throw new IllegalArgumentException("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
        }
        Member member = Member.builder()
                .mid(id)
                .mpw(encoder.encode(dto.getPw()))
                .mname(dto.getName())
                .memail(dto.getEmail())
                .build();

        memberRepository.save(member);
        return member.getMno();
    }

    /** 비밀번호 변경 */
    @Transactional
    public void changePassword(PwUpdateDTO dto) {
        final String id = dto.getId().trim();
        final String currentPw = dto.getCurrentPw();
        final String newPw = dto.getNewPw();
        Member member = memberRepository.findByMid(dto.getId())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (!encoder.matches(dto.getCurrentPw(), member.getMpw())) {
            throw new IllegalArgumentException("현재 비밀번호가 올바르지 않습니다.");
        }
        if (currentPw.equals(newPw) || encoder.matches(newPw, member.getMpw())) {
            throw new IllegalArgumentException("새 비밀번호는 현재 비밀번호와 달라야 합니다.");
        }

        if (!newPw.equals(dto.getNewPwConfirm())) {
            throw new IllegalArgumentException("새 비밀번호 확인이 일치하지 않습니다.");
        }

        member.setMpw(encoder.encode(newPw));
    }

    /** 프로필 변경 (닉네임/이메일) */
    @Transactional
    public Map<String, Object> updateProfile(ProfileDTO dto) {
        Member member = memberRepository.findByMid(dto.getId())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (dto.getNewId() != null && !dto.getNewId().isBlank()
                && !dto.getNewId().equals(member.getMid())) {
            if (memberRepository.existsByMid(dto.getNewId().trim())) {
                throw new IllegalStateException("이미 존재하는 아이디입니다.");
            }
            member.setMid(dto.getNewId().trim());
        }

        if (dto.getName() != null && !dto.getName().isBlank()) {
            member.setMname(dto.getName());
        }

        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            member.setMemail((dto.getEmail()));
        }

        return Map.of(
                "uno", member.getMno(),
                "id", member.getMid(),
                "name", member.getMname(),
                "email", member.getMemail()
        );
    }
}
