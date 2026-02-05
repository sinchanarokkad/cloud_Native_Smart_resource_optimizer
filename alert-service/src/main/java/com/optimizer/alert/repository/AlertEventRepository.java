package com.optimizer.alert.repository;

import com.optimizer.alert.model.AlertEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlertEventRepository extends JpaRepository<AlertEvent, Long> {
}
