package com.appointment.api.exception;

/**
 * Exception thrown when appointment cannot be cancelled due to time constraints
 */
public class AppointmentCancellationException extends RuntimeException {
    public AppointmentCancellationException(String message) {
        super(message);
    }
}
