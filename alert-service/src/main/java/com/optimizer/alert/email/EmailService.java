package com.optimizer.alert.email;

import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class EmailService {

    public void sendEmail(String to, String subject, String body) {
        // In a real app, use JavaMailSender
        log.info("Sending email to: {}", to);
        log.info("Subject: {}", subject);
        log.info("Body: {}", body);
    }
}
