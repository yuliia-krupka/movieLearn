package co.backend.ai.dto;

public record AiContext(
        String movieTitle,
        String movieDescription,
        String scriptContent,
        String englishLevel,
        String interests) {
}
