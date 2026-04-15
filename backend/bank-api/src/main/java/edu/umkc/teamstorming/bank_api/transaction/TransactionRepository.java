package edu.umkc.teamstorming.bank_api.transaction;

import edu.umkc.teamstorming.bank_api.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserId(Long userId);
    Optional<Transaction> findByIdAndUserId(Long id, Long userId);
    void deleteByUserId(Long userId);

    @Query("""
            select
                coalesce(t.category, 'Other') as category,
                sum(abs(t.amount)) as totalSpent,
                count(t.id) as transactionCount
            from Transaction t
            where t.user.id = :userId
              and t.date >= :startDate
              and t.amount is not null
              and t.date is not null
            group by coalesce(t.category, 'Other')
            order by sum(abs(t.amount)) desc
            """)
    List<CategorySpendingSummary> findSpendingByCategorySince(Long userId, LocalDate startDate);
}
