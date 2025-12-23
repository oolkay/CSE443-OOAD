package com.appointment.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Repository for calendar-related queries
 * Uses a dummy entity (User) since Spring Data JPA requires an entity type
 * But we're only using native queries here
 */
@Repository
public interface CalendarRepository extends JpaRepository<com.appointment.api.entity.User, Long> {
    
    /**
     * Gets calendar data with appointments for a time range
     * Returns time slots with appointment information
     * 
     * @param startTime Start of the time range
     * @param endTime End of the time range
     * @param interval Interval in minutes (15, 30, or 60)
     * @param companyId Company ID to filter
     * @param employeeId Optional employee ID to filter (can be null)
     * @return List of maps containing timestamp, day_of_week, and appointments JSON
     */
    @Query(value = """
        with intervals as (
           SELECT
            generate_series(
                date_trunc('minute', CAST(:startTime AS timestamp)),
                date_trunc('minute', CAST(:endTime AS timestamp)),
                CAST((:interval || ' min') AS interval)
            ) AS ts,
            CAST((:interval || ' min') AS interval) as interval_duration
        )
        select
            iv.ts as ts,
            COALESCE(
                json_agg(jsonb_build_object(
                    'appointment_id', appo.appointment_id,
                    'status', appo.status,
                    'duration', serv.time_duration,
                    'start_time', appo.start_time,
                    'end_time', appo.end_time,
                    'employee', usr.name,
                    'employee_id', usr.user_id,
                    'service', serv.name,
                    'service_id', serv.service_id,
                    'customer', cust.name
                ) ORDER BY appo.start_time ASC) FILTER (
                    WHERE appo.appointment_id IS NOT null
                        and serv.company_id = CAST(:companyId AS bigint)
                        and (:employeeId IS NULL OR ws.employee_id = CAST(:employeeId AS bigint))
                ),
                '[]'
            ) as appointments
        from intervals iv
        left join working_shifts ws on
            TRIM(UPPER(TO_CHAR(iv.ts, 'Day'))) = ws.day_of_week
            and CASE 
                WHEN iv.interval_duration < interval '1 day' 
                    THEN ws.start_time <= CAST(iv.ts AS time) AND ws.end_time >= CAST(iv.ts AS time)
                    ELSE true
            END
        left join appointments appo on 
            appo.employee_id = ws.employee_id
            and CASE 
                WHEN iv.interval_duration >= interval '1 day'
                    THEN DATE(appo.start_time) = DATE(iv.ts)
                    ELSE appo.start_time < (iv.ts + iv.interval_duration)
                        and appo.end_time > iv.ts
            END
            and (appo.status = 'APPROVED' or appo.status = 'COMPLETED')
        left join services serv on serv.service_id = appo.service_id
        left join users usr on usr.user_id = appo.employee_id
        left join users cust on cust.user_id = appo.customer_id
        group by iv.ts
        order by iv.ts asc
        """, nativeQuery = true)
    List<Map<String, Object>> getCalendarData(
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime,
        @Param("interval") Integer interval,
        @Param("companyId") String companyId,
        @Param("employeeId") String employeeId
    );
}

