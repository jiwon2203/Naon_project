package com.naon.search.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class ApiResponse<T> {
    private int status;
    private String code;
    private String message;
    private T data;
}
