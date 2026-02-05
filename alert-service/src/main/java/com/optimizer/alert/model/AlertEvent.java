package com.optimizer.alert.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "alert_events")
public class AlertEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String recipient;
    private String message;
    private String severity;
    private Boolean highlight;
    private LocalDateTime createdAt;
}
