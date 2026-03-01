package co.backend.ai;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.retry.support.RetryTemplate;

@Configuration
@EnableRetry
public class OpenAiConfig {

    @Bean
    public ChatClient chatClient(ChatClient.Builder builder) {
        return builder.build();
    }

    @Bean
    public RetryTemplate aiRetryTemplate() {
        return RetryTemplate.builder()
                .maxAttempts(3)
                .exponentialBackoff(2000, 2, 10000)
                .build();
    }
}
