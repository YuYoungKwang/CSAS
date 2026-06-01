package com.cracksensing.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.cracksensing.dto.ClassifierRequest;
import com.cracksensing.dto.ClassifierResponse;
import com.cracksensing.exception.ClassifierDispatchException;

@Service
public class ClassifierClient {

    private final RestTemplate restTemplate;
    private final String classifierBaseUrl;

    public ClassifierClient(@Value("${classifier.base-url}") String classifierBaseUrl) {
        this.restTemplate = new RestTemplate();
        this.classifierBaseUrl = classifierBaseUrl;
    }

    public ClassifierResponse sendToClassifier(String imageId, String objectUrl) {
        ClassifierRequest request = new ClassifierRequest(imageId, objectUrl);
        String url = classifierBaseUrl + "/api/classify";

        try {
            return restTemplate.postForObject(url, request, ClassifierResponse.class);
        } catch (RestClientException exception) {
            throw new ClassifierDispatchException("Failed to send image to classifier server.", exception);
        }
    }
}
