package com.appointment.api.exception;

/**
 * Exception thrown when trying to create a duplicate resource
 */
public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException(String message) {
        super(message);
    }
}

