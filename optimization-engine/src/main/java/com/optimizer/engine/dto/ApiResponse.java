package com.optimizer.engine.dto;

import lombok.Data;

@Data
public class ApiResponse {
    private String status;
    private Object data;

    public static ApiResponse success(Object data) {
        ApiResponse r = new ApiResponse();
        r.setStatus("SUCCESS");
        r.setData(data);
        return r;
    }
}
