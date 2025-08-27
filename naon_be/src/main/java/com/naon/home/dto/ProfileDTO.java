package com.naon.home.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProfileDTO {
    @NotBlank
    private String id;

    private String name;
    private String email;

    @NotBlank
    private String newId;

    private String newName;

    @Email(message = "올바른 이메일 형식이 아닙니다.")
    private String newEmail;
}
