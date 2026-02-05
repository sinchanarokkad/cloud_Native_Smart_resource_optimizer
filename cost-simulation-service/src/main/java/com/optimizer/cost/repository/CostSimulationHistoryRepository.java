package com.optimizer.cost.repository;

import com.optimizer.cost.model.CostSimulationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface CostSimulationHistoryRepository extends JpaRepository<CostSimulationHistory, Long> {
    List<CostSimulationHistory> findByCreatedAtAfter(LocalDateTime since);
}
