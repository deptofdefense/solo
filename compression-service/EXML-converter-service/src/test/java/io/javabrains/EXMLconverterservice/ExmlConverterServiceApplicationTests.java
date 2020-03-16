package io.javabrains.EXMLconverterservice;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ExmlConverterServiceApplicationTests {
	@Autowired
	private MockMvc mockMvc;
	private String exml = "gCWQSVPjMBCFO1EcmT3sMwzLlUuw5NgFyc0lQ5UPSSgyJ27GkYnBG5ZcgX9PC3Tpr957arX6Ba5XWtcTx1mv1zetKpKbIssdlaxkESuHO1nqKN3EOlMXapXVhSz1k0xkVmsVlaLKc5norCq71CpQ71Jb1VWVRyGBDtB+9hgEgkAXaG8ZIRAEJWYEegh1hGAZJQqhj7URM6CmmqhtjBATGwbST9gEapWRubOFSjuPCGwDJR9T2EHnQ4iAwO4vPRDYA0obmSzCGQwQlY51q2Afb6ZCwAHm0rZcwiHCu/zCcY/QepvP4NgMgPXETNhkcIqJuqne4I8xwhD+4qNKwJnp2tYBKv+A2sU8XeB+4BxTGv9xgZr+LMNYSwKXuIrkIY9f4Qq7LWUhEAYeGzPfH/njn2NPp0+cMStY8MHUHTPXu+PcZ4y5/UfOuYVuh2wx7vk+d29HvfuAeB37xGX8bsi8oev/52wyYhPv9rmz8Q0=";
	private String xml = "<p0:shipmentReceiptsInCollection xmlns:p0=\"http://www.usmc.mil/schemas/1/if/stratis\"><p0:mRec><p0:spoolID>40905535999999</p0:spoolID><p0:iPAAC>MMR100</p0:iPAAC><p0:dIC>AS1</p0:dIC><p0:sCN>M2902481150002</p0:sCN><p0:pIN>P111</p0:pIN><p0:sID/><p0:rCN/><p0:rIC>MR1</p0:rIC><p0:sDN>M2902481150002</p0:sDN><p0:sfx/><p0:nIIN>014551273</p0:nIIN><p0:uOI>EA</p0:uOI><p0:qM/><p0:qCCA>4</p0:qCCA><p0:qCCF>4</p0:qCCF><p0:recSDN/><p0:status/><p0:fCC/><p0:fund/><p0:keyD>2018-04-25T10:30:47Z</p0:keyD><p0:jON/><p0:rON/><p0:pri/><p0:proj/><p0:rDD/><p0:sC/><p0:supADD/><p0:mOfShip/><p0:tCN/><p0:txnDate>2018-04-25T10:30:47Z</p0:txnDate><p0:cFlag/><p0:demC/></p0:mRec></p0:shipmentReceiptsInCollection>";
	private String invalidInput = "<invalid></xml>";
	@Test
	public void shouldReturnValidXML() throws Exception {
		mockMvc.perform(post("/exml/decompress")
				.content(exml)
				.contentType(MediaType.APPLICATION_XML))
				.andExpect(status().isOk()).andExpect(content().xml(xml));

	}
	@Test
	public void shouldReturnVALIDEXML() throws Exception {
		mockMvc.perform(post("/xml/compress")
				.content(xml)
				.contentType(MediaType.APPLICATION_XML))
				.andExpect(status().isOk()).andExpect(content().string(exml));

	}
	@Test
	public void shouldReturnEXMLErrorInvalidBase64() throws Exception {
		mockMvc.perform(post("/exml/decompress")
				.content("INVALID BASE64 DATA")
				.contentType(MediaType.APPLICATION_XML))
				.andExpect(status().is(400));
	}
	@Test
	public void shouldReturnXMLErrorInvalidBase64() throws Exception {
			mockMvc.perform(post("/xml/compress")
					.content("INVALID BASE64 DATA")
					.contentType(MediaType.APPLICATION_XML))
					.andExpect(status().is(400));
	}
	@Test
	public void shouldReturnErrorInvalidXmlContent() throws Exception {
		mockMvc.perform(post("/xml/compress")
				.content(invalidInput)
				.contentType(MediaType.APPLICATION_XML))
				.andExpect(status().is(400));
	}
	@Test
	public void shouldReturnErrorInvalidEFXContent() throws Exception {
		mockMvc.perform(post("/exml/decompress")
				.content(invalidInput)
				.contentType(MediaType.APPLICATION_XML))
				.andExpect(status().is(400));
	}

}

