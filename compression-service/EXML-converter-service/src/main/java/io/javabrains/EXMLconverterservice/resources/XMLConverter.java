package io.javabrains.EXMLconverterservice.resources;
import java.io.*;
import java.nio.charset.StandardCharsets;
import com.agiledelta.efx.EFXFactory;
import com.agiledelta.efx.text.Transcoder;
import com.agiledelta.efx.EFXException;


public class XMLConverter {

    public byte [] compressXML(String xml) throws EFXException, IOException {

            byte[] exmlByteResult = null;
            try{
            EFXFactory factory = EFXFactory.newInstance();
            File schemaFile = new File("GCSS-XSD/RICE-Master-Schema.xsd");
            factory.setSchema(schemaFile);
            ByteArrayOutputStream exmlStream = new ByteArrayOutputStream();
            InputStream xmlStream = new ByteArrayInputStream(xml.getBytes());
            Transcoder transcoder = factory.newTranscoder();
            transcoder.encode(xmlStream, exmlStream);
            exmlByteResult = exmlStream.toByteArray();

            exmlStream.close();
            exmlStream = null;
            xmlStream.close();
            xmlStream = null;
            xml = null;

        } catch(Exception e){
            System.out.println(e.getMessage());
            System.out.println(e.getStackTrace());
        }

        return exmlByteResult;
    }

    public String decompressEXML(byte[] exml) throws IOException, EFXException {

            String decompressedXML = null;
            try {
                File schemaFile = new File("GCSS-XSD/RICE-Master-Schema.xsd");
                EFXFactory factory = EFXFactory.newInstance();
                factory.setSchema(schemaFile);
                ByteArrayInputStream exmlStream = new ByteArrayInputStream(exml);
                ByteArrayOutputStream xmlStream = new ByteArrayOutputStream();
                Transcoder transcoder = factory.newTranscoder();
                transcoder.decode(exmlStream,xmlStream);
                byte[] xmlByteResult = xmlStream.toByteArray();

                exmlStream.close();
                exmlStream = null;
                xmlStream.close();
                xmlStream = null;
                exml = null;
                decompressedXML = new String(xmlByteResult, 0, xmlByteResult.length, StandardCharsets.UTF_8);

            }catch(Exception e){
                System.out.println("Exception thrown: " + e.getMessage());
                e.printStackTrace();
            }

        return decompressedXML;
    }

}
