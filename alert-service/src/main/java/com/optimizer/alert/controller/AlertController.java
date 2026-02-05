package com.optimizer.alert.controller;

import com.optimizer.alert.notification.NotificationService;
import com.optimizer.alert.dto.ApiResponse;
import com.optimizer.alert.model.AlertEvent;
import com.optimizer.alert.repository.AlertEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/alerts")
public class AlertController {

    @Autowired
    private NotificationService notificationService;
    @Autowired
    private AlertEventRepository alertEventRepository;

    @PostMapping("/send")
    public ResponseEntity<ApiResponse> sendAlert(@RequestBody NotificationService.AlertRequest request) {
        notificationService.sendAlert(request);
        return ResponseEntity.ok(ApiResponse.success("Alert sent successfully"));
    }

    @GetMapping("/recent")
    public ResponseEntity<ApiResponse> recent() {
        return ResponseEntity.ok(ApiResponse.success(alertEventRepository.findAll()));
    }
}
