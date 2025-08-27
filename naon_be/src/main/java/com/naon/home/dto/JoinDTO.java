package com.naon.home.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class JoinDTO {
    @NotBlank(message = "아이디는 필수입니다.")
    private String id;

    @NotBlank(message = "비밀번호는 필수입니다.")
    @Size(min = 8, message = "비밀번호는 8자 이상")
    private String pw;

    @NotBlank(message = "비밀번호 확인은 필수입니다.")
    private String pwConfirm;

    @NotBlank(message = "이메일은 필수입니다.")
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    private String email;

    private String name;
}
