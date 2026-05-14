package com.polylang.repository;

import com.polylang.model.ExecutionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistoryRepository extends JpaRepository<ExecutionHistory, Long> {
    List<ExecutionHistory> findTop20ByUserIdOrderByCreatedAtDesc(String userId);
    void deleteByUserId(String userId);
}
