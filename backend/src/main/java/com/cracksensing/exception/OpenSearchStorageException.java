package com.cracksensing.exception;

public class OpenSearchStorageException extends RuntimeException {

    public OpenSearchStorageException(String message, Throwable cause) {
        super(message, cause);
    }

    public OpenSearchStorageException(String message) {
        super(message);
    }
}
