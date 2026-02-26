package co.backend.ai;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
@Slf4j
public class ScriptParser {

    public String parse(byte[] scriptBytes) {
        if (scriptBytes == null || scriptBytes.length == 0) {
            return "";
        }
        if (isPdf(scriptBytes)) {
            try (PDDocument document = PDDocument.load(scriptBytes)) {
                PDFTextStripper stripper = new PDFTextStripper();
                return stripper.getText(document);
            } catch (Exception e) {
                log.error("Error parsing PDF script, falling back to text parsing.", e);
                return new String(scriptBytes, StandardCharsets.UTF_8);
            }
        }
        return new String(scriptBytes, StandardCharsets.UTF_8);
    }

    private boolean isPdf(byte[] bytes) {
        return bytes.length > 4 &&
                bytes[0] == 0x25 && bytes[1] == 0x50 &&
                bytes[2] == 0x44 && bytes[3] == 0x46 &&
                bytes[4] == 0x2D;
    }
}
