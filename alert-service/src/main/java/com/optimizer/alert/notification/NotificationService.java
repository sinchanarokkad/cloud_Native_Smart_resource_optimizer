package com.optimizer.alert.notification;

import com.optimizer.alert.email.EmailService;
import com.optimizer.alert.model.AlertEvent;
import com.optimizer.alert.repository.AlertEventRepository;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    @Autowired
    private EmailService emailService;
    @Autowired
    private AlertEventRepository alertEventRepository;

    @Data
    public static class AlertRequest {
        private String recipient;
        private String message;
        private String severity; // LOW, MEDIUM, CRITICAL
    }

    public void sendAlert(AlertRequest request) {
        String subject = "Cloud Optimizer Alert: " + request.getSeverity();
        emailService.sendEmail(request.getRecipient(), subject, request.getMessage());
        AlertEvent e = new AlertEvent();
        e.setRecipient(request.getRecipient());
        e.setMessage(request.getMessage());
        e.setSeverity(request.getSeverity());
        boolean highlight = "HIGH".equalsIgnoreCase(request.getSeverity()) || "CRITICAL".equalsIgnoreCase(request.getSeverity());
        e.setHighlight(highlight);
        e.setCreatedAt(java.time.LocalDateTime.now());
        alertEventRepository.save(e);
    }
}
