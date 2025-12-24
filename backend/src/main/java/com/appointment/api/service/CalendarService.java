package com.appointment.api.service;

import com.appointment.api.dto.CalendarAppointmentDTO;
import com.appointment.api.dto.CalendarSlotDTO;
import com.appointment.api.repository.CalendarRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CalendarService {
    
    private final CalendarRepository calendarRepository;
    private final ObjectMapper objectMapper;
    
    /**
     * Get calendar data with appointments
     * 
     * @param startTime Start of the time range
     * @param endTime End of the time range
     * @param interval Interval in minutes (15, 30, or 60)
     * @param companyId Company ID to filter
     * @param employeeId Optional employee ID to filter
     * @return List of calendar slots with appointment information
     */
    public List<CalendarSlotDTO> getCalendarData(
            LocalDateTime startTime,
            LocalDateTime endTime,
            Integer interval,
            String companyId,
            String employeeId) {
        
        // Validate interval
        if (interval % 15 != 0) {
            throw new RuntimeException("Interval must be a multiple of 15 minutes");
        }
        
        // Validate date range
        if (startTime.isAfter(endTime)) {
            throw new RuntimeException("Start time must be before end time");
        }
        
        // Call repository
        List<Map<String, Object>> rawData = calendarRepository.getCalendarData(
            startTime, endTime, interval, companyId, employeeId
        );
        
        // Transform raw data to DTOs
        List<CalendarSlotDTO> result = new ArrayList<>();
        
        for (Map<String, Object> row : rawData) {
            CalendarSlotDTO slot = new CalendarSlotDTO();
            
            // Convert timestamp
            Object tsObj = row.get("ts");
            if (tsObj instanceof Timestamp) {
                slot.setTimestamp(((Timestamp) tsObj).toLocalDateTime());
            } else if (tsObj instanceof LocalDateTime) {
                slot.setTimestamp((LocalDateTime) tsObj);
            } else if (tsObj instanceof OffsetDateTime) {
                slot.setTimestamp(((OffsetDateTime) tsObj).toLocalDateTime());
            } else if (tsObj instanceof ZonedDateTime) {
                slot.setTimestamp(((ZonedDateTime) tsObj).toLocalDateTime());
            } else if (tsObj != null) {
                // Try to parse as string if it's another type
                try {
                    String tsString = tsObj.toString();
                    // If string contains timezone info (Z or offset), parse as OffsetDateTime first
                    if (tsString.contains("Z") || tsString.matches(".*[+-]\\d{2}:\\d{2}$")) {
                        slot.setTimestamp(OffsetDateTime.parse(tsString).toLocalDateTime());
                    } else {
                        slot.setTimestamp(LocalDateTime.parse(tsString));
                    }
                } catch (Exception e) {
                    log.warn("Could not convert timestamp: {}", tsObj, e);
                }
            }
            
            // Parse appointments JSON
            try {
                String appointmentsJson = (String) row.get("appointments");
                List<Map<String, Object>> appointmentsList = objectMapper.readValue(
                    appointmentsJson,
                    new TypeReference<List<Map<String, Object>>>() {}
                );
                
                List<CalendarAppointmentDTO> appointments = new ArrayList<>();
                for (Map<String, Object> appt : appointmentsList) {
                    CalendarAppointmentDTO appointmentDTO = CalendarAppointmentDTO.builder()
                        .appointmentId(appt.get("appointment_id") != null ? 
                            ((Number) appt.get("appointment_id")).longValue() : null)
                        .employee((String) appt.get("employee"))
                        .employeeId(appt.get("employee_id") != null ? 
                            ((Number) appt.get("employee_id")).longValue() : null)
                        .service((String) appt.get("service"))
                        .serviceId(appt.get("service_id") != null ? 
                            ((Number) appt.get("service_id")).longValue() : null)
                        .customer((String) appt.get("customer"))
                        .status((String) appt.get("status"))
                        .duration((Number) appt.get("duration"))
                        .build();
                    Object startTimeObj = appt.get("start_time");
                    Object endTimeObj = appt.get("end_time");
                    if (startTimeObj instanceof Timestamp) {
                        appointmentDTO.setStartTime(((Timestamp) startTimeObj).toLocalDateTime());
                        appointmentDTO.setEndTime(((Timestamp) endTimeObj).toLocalDateTime());
                    } else if (startTimeObj instanceof LocalDateTime) {
                        appointmentDTO.setStartTime((LocalDateTime) startTimeObj);
                        appointmentDTO.setEndTime((LocalDateTime) endTimeObj);
                    } else if (startTimeObj instanceof OffsetDateTime) {
                        appointmentDTO.setStartTime(((OffsetDateTime) startTimeObj).toLocalDateTime());
                        appointmentDTO.setEndTime(((OffsetDateTime) endTimeObj).toLocalDateTime());
                    } else if (startTimeObj instanceof ZonedDateTime) {
                        appointmentDTO.setStartTime(((ZonedDateTime) startTimeObj).toLocalDateTime());
                        appointmentDTO.setEndTime(((ZonedDateTime) endTimeObj).toLocalDateTime());
                    } else if (startTimeObj != null) {
                        // Try to parse as string if it's another type
                        try {
                            String startTimeString = startTimeObj.toString();
                            String endTimeString = endTimeObj.toString();
                            // If string contains timezone info (Z or offset), parse as OffsetDateTime first
                            if (startTimeString.contains("Z") || startTimeString.matches(".*[+-]\\d{2}:\\d{2}$")) {
                                appointmentDTO.setStartTime(OffsetDateTime.parse(startTimeString).toLocalDateTime());
                                appointmentDTO.setEndTime(OffsetDateTime.parse(endTimeString).toLocalDateTime());
                            } else {
                                appointmentDTO.setStartTime(LocalDateTime.parse(startTimeString));
                                appointmentDTO.setEndTime(LocalDateTime.parse(endTimeString));
                            }
                        } catch (Exception e) {
                            log.warn("Could not convert start time and end time",  e);
                        }
                    }
                    appointments.add(appointmentDTO);
                }
                slot.setAppointments(appointments);
            } catch (Exception e) {
                // If JSON parsing fails, set empty list
                slot.setAppointments(new ArrayList<>());
            }
            
            result.add(slot);
        }
        
        return result;
    }
}

