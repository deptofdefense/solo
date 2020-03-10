package io.javabrains.EXMLconverterservice.resources;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import java.util.Base64;


@RestController
public class ExmlConversionService {
    @PostMapping(value = "/xml/compress", consumes = {"application/xml"})
    public String compressFile(@RequestBody String xmlRequestString) {
        XMLConverter xmlConverter = new XMLConverter();
        try{

            byte[] compressedXml  = xmlConverter.compressXML(xmlRequestString);
            return new String(Base64.getEncoder().encode(compressedXml));
        }
        catch(Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.resolve(400), "Bad Request", e);
        }

    }

    @PostMapping(value = "/exml/decompress", consumes = {"application/xml"})
    public String decompressFile(@RequestBody String base64ExmlRequestString) {
        XMLConverter xmlConverter = new XMLConverter();

        try {
            byte[] compressed  = Base64.getDecoder().decode(base64ExmlRequestString.getBytes());
            return xmlConverter.decompressEXML(compressed);
        }
        catch (Exception e) {
            System.out.println(e.toString());
            throw new ResponseStatusException(
                    HttpStatus.resolve(400), "bad Request", e);
        }
    }

}
