package io.javabrains.EXMLconverterservice.resources;
import java.io.*;
import java.nio.charset.StandardCharsets;
import com.agiledelta.efx.EFXFactory;
import com.agiledelta.efx.text.Transcoder;
import com.agiledelta.efx.EFXException;


public class XMLConverter {
    public static File schemaFile;
    public static EFXFactory factory;
    public static Transcoder transcoder;

    public XMLConverter() throws Exception{
        factory = EFXFactory.newInstance();
        schemaFile = new File("GCSS-XSD/RICE-Master-Schema.xsd");
        factory.setSchema(schemaFile);
        transcoder = factory.newTranscoder();
    }
    
    public byte [] compressXML(String xml) throws EFXException, IOException {
        byte[] exml = null;
        ByteArrayInputStream in = new ByteArrayInputStream(xml.getBytes());
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        transcoder.encode(in, out);
        exml = out.toByteArray();
        out.close();
        in.close();
        return exml;
    }

    public String decompressEXML(byte[] exml) throws IOException, EFXException {
        String xml = null;
        ByteArrayInputStream in = new ByteArrayInputStream(exml);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        transcoder.decode(in, out);
        byte[] xmlBytes = out.toByteArray();
        in.close();
        out.close();
        xml = new String(xmlBytes, 0, xmlBytes.length, StandardCharsets.UTF_8);
        return xml;
    }
}
